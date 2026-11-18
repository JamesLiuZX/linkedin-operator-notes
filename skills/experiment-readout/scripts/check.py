#!/usr/bin/env python3
"""Check a readout.json against the experiment-readout quality bar.

    python3 check.py readout.json            human-readable report
    python3 check.py readout.json --json     the same as JSON

It reruns ab_stats.py on the input stored inside the file and compares every
figure, then checks the sentences you wrote against those figures.

Exit code 0 when every check passes, 1 when any fails, 2 when the file cannot
be read. Standard library only. Reads one file, writes nothing, makes no
network calls.
"""

import json
import math
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ab_stats  # noqa: E402  (the script beside this one)

CHECKS = [
    ("computed", "The numbers were computed, not written"),
    ("split", "The split was checked before the result"),
    ("verdict", "The verdict follows the fixed rule"),
    ("figures", "Every figure in the prose is in the numbers"),
    ("guardrails", "Guardrails that did not hold are named"),
    ("early", "Early stopping is called out"),
]

WORDS = {"ship": "ship", "extend": "extend", "stop": "stop", "do-not-trust": "do not trust"}
EARLY_RE = re.compile(r"early|stopped|cut short|part(ial)? week|whole weeks?|full weeks?|of \d+ (planned )?days", re.I)
NUMBER_RE = re.compile(r"(?<![\w.])-?\d[\d,]*(?:\.\d+)?")
ISO_DATE_RE = re.compile(r"\b\d{4}-\d{2}-\d{2}\b")
SMALL_WORDS = {"with", "that", "this", "from", "more", "than", "less", "have", "were", "been", "before", "after"}


def close(a, b):
    return math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-12)


def differences(have, want, path, out):
    """Every place where `have` (the file) differs from `want` (a fresh run)."""
    if len(out) >= 8:
        return
    if isinstance(want, dict):
        if not isinstance(have, dict):
            out.append(f"{path or 'numbers'} should be an object")
            return
        for key in want:
            if key not in have:
                out.append(f"{path + '.' if path else ''}{key} is missing")
            else:
                differences(have[key], want[key], f"{path + '.' if path else ''}{key}", out)
        for key in have:
            if key not in want:
                out.append(f"{path + '.' if path else ''}{key} is not something the script writes")
    elif isinstance(want, list):
        if not isinstance(have, list) or len(have) != len(want):
            out.append(f"{path} should have {len(want)} entries")
            return
        for i, item in enumerate(want):
            differences(have[i], item, f"{path}[{i}]", out)
    elif isinstance(want, bool) or want is None or isinstance(want, str):
        if have != want:
            out.append(f"{path} is {json.dumps(have)}, and a fresh run gives {json.dumps(want)}")
    else:
        if isinstance(have, bool) or not isinstance(have, (int, float)) or not close(float(have), float(want)):
            out.append(f"{path} is {json.dumps(have)}, and a fresh run gives {json.dumps(want)}")


def leaves(value, out):
    """Every number anywhere under `value`."""
    if isinstance(value, bool) or value is None:
        return
    if isinstance(value, (int, float)):
        out.append(float(value))
    elif isinstance(value, dict):
        for v in value.values():
            leaves(v, out)
    elif isinstance(value, list):
        for v in value:
            leaves(v, out)
    elif isinstance(value, str):
        for m in NUMBER_RE.finditer(ISO_DATE_RE.sub(" ", value)):
            out.append(float(m.group(0).replace(",", "")))
        for m in ISO_DATE_RE.finditer(value):
            out.extend(float(part) for part in m.group(0).split("-"))


def allowed_values(numbers):
    """The figures a sentence may quote: every computed number, as it stands and as a percentage."""
    raw = []
    leaves(numbers, raw)
    inp = numbers.get("input") or {}
    test = inp.get("test") or {}
    users = [a.get("users") for a in inp.get("arms") or [] if isinstance(a.get("users"), int)]
    if len(users) == 2:
        raw.append(float(sum(users)))
    counts = (inp.get("primary") or {}).get("counts") or []
    if len(counts) == 2 and all(isinstance(c, int) for c in counts):
        raw.append(float(sum(counts)))
        raw.append(float(abs(counts[1] - counts[0])))
    alpha = test.get("alpha")
    if isinstance(alpha, (int, float)):
        raw.append(1.0 - alpha)
    raw.append(ab_stats.POWER)
    for days in (test.get("planned_days"), test.get("ran_days")):
        if isinstance(days, int):
            raw.append(float(days))
            if days % 7 == 0:
                raw.append(days / 7.0)
    if isinstance(test.get("planned_days"), int) and isinstance(test.get("ran_days"), int):
        raw.append(float(abs(test["planned_days"] - test["ran_days"])))
    out = []
    for v in raw:
        out.extend([abs(v), abs(v) * 100.0])
    return out


def strip_names(text, numbers):
    """Remove metric, arm and test names, so a digit inside a name is not read as a figure."""
    inp = numbers.get("input") or {}
    names = [(inp.get("test") or {}).get("name"), (inp.get("primary") or {}).get("name")]
    names += [g.get("name") for g in inp.get("guardrails") or []]
    names += [a.get("name") for a in inp.get("arms") or []]
    for name in sorted([n for n in names if n], key=len, reverse=True):
        text = re.sub(re.escape(name), " ", text, flags=re.I)
    return text


def unknown_figures(text, numbers):
    allowed = allowed_values(numbers)
    text = ISO_DATE_RE.sub(" ", strip_names(text, numbers))
    bad = []
    for m in NUMBER_RE.finditer(text):
        token = m.group(0)
        clean = token.replace(",", "").lstrip("-")
        places = len(clean.split(".")[1]) if "." in clean else 0
        value = float(clean)
        scale = 10 ** places
        if not any(math.floor(a * scale + 0.5) / scale == value for a in allowed):
            bad.append(token)
    return bad


def names_guardrail(name, summary):
    low = summary.lower()
    if name.lower() in low:
        return True
    words = [w for w in re.findall(r"[a-z]{4,}", name.lower()) if w not in SMALL_WORDS]
    return bool(words) and all(w in low for w in words)


def check(data):
    errors = {key: [] for key, _ in CHECKS}
    numbers = data.get("numbers")
    headline = str(data.get("headline") or "")
    summary = str(data.get("summary") or "")
    next_steps = [str(x) for x in data.get("next") or []]

    if not isinstance(numbers, dict) or not isinstance(numbers.get("input"), dict):
        for key, _ in CHECKS:
            errors[key].append("numbers is missing, or has no input to recompute from")
        return report(errors, None)

    # 1. Recompute and compare.
    fresh = None
    try:
        fresh = ab_stats.readout(numbers["input"])
    except ab_stats.InputError as exc:
        errors["computed"].append(f"the script rejects the stored input: {exc}")
    if fresh is not None:
        diffs = []
        differences(numbers, fresh, "", diffs)
        errors["computed"].extend(diffs)
    truth = fresh or numbers

    # 2. The sample ratio check exists and is obeyed.
    srm = (numbers.get("checks") or {}).get("srm")
    decision = (numbers.get("verdict") or {}).get("decision")
    if not isinstance(srm, dict) or "pass" not in srm:
        errors["split"].append("checks.srm is missing")
    elif srm.get("pass") is False and decision != "do-not-trust":
        errors["split"].append(f"the sample ratio check failed, and the decision is {decision!r}, not 'do-not-trust'")

    # 3. The decision is the script's, and the headline opens with it.
    want = (truth.get("verdict") or {}).get("decision")
    if decision != want:
        errors["verdict"].append(f"the decision is {decision!r}, and the script decides {want!r}")
    word = WORDS.get(want, "")
    if not headline.strip():
        errors["verdict"].append("there is no headline")
    elif word and not headline.strip().lower().startswith(word):
        errors["verdict"].append(f"the headline has to open with \"{word.capitalize()}\"")
    else:
        for other in WORDS.values():
            if other != word and headline.strip().lower().startswith(other):
                errors["verdict"].append(f"the headline opens with \"{other}\", and the decision is \"{word}\"")

    # 4. Figures in the prose.
    if not summary.strip():
        errors["figures"].append("there is no summary")
    for label, text in [("headline", headline), ("summary", summary)] + [(f"next[{i}]", t) for i, t in enumerate(next_steps)]:
        bad = unknown_figures(text, truth)
        if bad:
            errors["figures"].append(f"{label}: {', '.join(bad)} matches nothing in the numbers")

    # 5. Guardrails that did not hold.
    for g in truth.get("guardrails") or []:
        if g.get("verdict") in ("worse", "unclear") and not names_guardrail(str(g.get("name") or ""), summary):
            errors["guardrails"].append(f"\"{g.get('name')}\" is {g.get('verdict')}, and the summary does not name it")

    # 6. Early stops and part weeks.
    duration = (truth.get("checks") or {}).get("duration") or {}
    if duration.get("stopped_early") or duration.get("full_weeks") is False:
        if not EARLY_RE.search(summary + " " + " ".join(next_steps)):
            what = "stopped early" if duration.get("stopped_early") else "did not run whole weeks"
            errors["early"].append(f"the test {what}, and neither the summary nor the next steps say so")

    return report(errors, truth)


def report(errors, truth):
    out = {"checks": [{"id": key, "name": name, "pass": not errors[key], "errors": errors[key]} for key, name in CHECKS]}
    if truth:
        primary = truth.get("primary") or {}
        out["decision"] = (truth.get("verdict") or {}).get("decision")
        out["rule"] = (truth.get("verdict") or {}).get("rule")
        out["primary"] = {"name": primary.get("name"), "diff": primary.get("diff"), "ci": primary.get("ci")}
        out["guardrails"] = [{"name": g.get("name"), "verdict": g.get("verdict")} for g in truth.get("guardrails") or []]
    return out


def main(argv):
    args = [a for a in argv[1:] if not a.startswith("--")]
    if len(args) != 1:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    try:
        with open(args[0], encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError) as exc:
        print(f"check.py: cannot read {args[0]}: {exc}", file=sys.stderr)
        return 2
    if not isinstance(data, dict):
        print("check.py: the file has to hold one JSON object", file=sys.stderr)
        return 2

    result = check(data)
    failed = [c for c in result["checks"] if not c["pass"]]

    if "--json" in argv:
        print(json.dumps(result, indent=1))
    else:
        if result.get("decision"):
            p = result["primary"]
            print(f"Decision: {result['decision']} ({result['rule']})")
            if p.get("diff") is not None:
                print(f"{p['name']}: {ab_stats.pts(p['diff'])} points, interval {ab_stats.pts(p['ci'][0])} to {ab_stats.pts(p['ci'][1])}")
            for g in result["guardrails"]:
                print(f"Guardrail, {g['name']}: {g['verdict']}")
        for c in result["checks"]:
            print(f"  {'PASS' if c['pass'] else 'FAIL'}  {c['name']}")
            for e in c["errors"]:
                print(f"        {e}")
        print("  ----  The counts are the right counts (yours to judge)")
        print(f"{len(result['checks']) - len(failed)} of {len(result['checks'])} scripted checks passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
