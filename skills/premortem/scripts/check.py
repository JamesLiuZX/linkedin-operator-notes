#!/usr/bin/env python3
"""Check a premortem.json against the premortem quality bar.

    python3 check.py premortem.json            human-readable report
    python3 check.py premortem.json --json     the same as JSON

Exit code 0 when every check passes (warnings allowed), 1 when any fails,
2 when the file cannot be read. Standard library only. Reads one file, writes
nothing, makes no network calls.
"""

import datetime
import json
import re
import sys

AREAS = ("users", "behaviour", "operations", "money", "rules", "build")
LEVELS = ("low", "medium", "high")
STATUSES = ("supported", "contradicted", "unknown")
MAX_RISKS = 12
MIN_STORY, MAX_STORY = 25, 90

CHECKS = [
    ("tripwires", "Every top risk has a complete tripwire"),
    ("evidence", "Evidence is labelled"),
    ("areas", "All six areas were considered"),
    ("short", "The list is short enough to act on"),
    ("stories", "Every risk is a story"),
]


def words(text):
    return len(str(text or "").split())


def parse_date(text):
    try:
        return datetime.date.fromisoformat(str(text))
    except ValueError:
        return None


def check(data):
    errors = {key: [] for key, _ in CHECKS}
    warnings = []

    risks = data.get("risks") or []
    ids = [str(r.get("id")) for r in risks]
    by_id = {str(r.get("id")): r for r in risks}
    inputs = {str(i.get("id")) for i in data.get("inputs") or []}
    top = [str(x) for x in data.get("top") or []]
    as_of = parse_date(data.get("asOf"))
    if as_of is None:
        warnings.append("asOf is missing or not a date, so tripwire dates could not be compared with it")
    if len(set(ids)) != len(ids):
        errors["short"].append("two risks share an ID")

    # 1. Tripwires on the top risks.
    for rid in top:
        r = by_id.get(rid)
        if r is None:
            errors["tripwires"].append(f"top names {rid}, which is not a risk")
            continue
        t = r.get("tripwire") or {}
        for field in ("metric", "threshold", "check", "owner"):
            if not str(t.get(field, "")).strip():
                errors["tripwires"].append(f"{rid}: the tripwire has no {field}")
        if str(t.get("threshold", "")).strip() and not re.search(r"\d", str(t.get("threshold"))):
            errors["tripwires"].append(f"{rid}: the threshold has no number in it")
        when = parse_date(t.get("check"))
        if str(t.get("check", "")).strip() and when is None:
            errors["tripwires"].append(f"{rid}: the check date {t.get('check')!r} is not YYYY-MM-DD")
        elif when and as_of and when <= as_of:
            errors["tripwires"].append(f"{rid}: the check date {when} is not after the plan's date {as_of}")
        for field in ("mitigation", "test"):
            if not str(r.get(field, "")).strip():
                errors["tripwires"].append(f"{rid}: a top risk needs a {field}")
    for r in risks:
        rid = str(r.get("id"))
        if r.get("likelihood") == "high" and r.get("impact") == "high" and rid not in top:
            warnings.append(f"{rid} is rated high on both and is not in top, so it has no tripwire")

    # 2. Evidence labels.
    for r in risks:
        rid = str(r.get("id"))
        ev = r.get("evidence") or {}
        status = ev.get("status")
        if status not in STATUSES:
            errors["evidence"].append(f"{rid}: evidence status {status!r} is not one of {', '.join(STATUSES)}")
        if not str(ev.get("expect", "")).strip():
            errors["evidence"].append(f"{rid}: does not say what you would expect to see if it were true")
        src = str(ev.get("from") or "").strip()
        if status in ("supported", "contradicted"):
            if not src:
                errors["evidence"].append(f"{rid}: marked {status} but names no input")
            elif inputs and src not in inputs:
                errors["evidence"].append(f"{rid}: cites input {src!r}, which is not in inputs")
        if status == "contradicted" and r.get("likelihood") == "high":
            warnings.append(f"{rid}: the evidence argues against it, yet likelihood is high")

    # 3. Areas.
    skipped = data.get("skipped") or {}
    used = {r.get("area") for r in risks}
    for r in risks:
        if r.get("area") not in AREAS:
            errors["areas"].append(f"{r.get('id')}: area {r.get('area')!r} is not one of {', '.join(AREAS)}")
    for a in AREAS:
        if a not in used and not str(skipped.get(a, "")).strip():
            errors["areas"].append(f"no risk under {a}, and no line under skipped saying why")

    # 4. Short enough.
    if len(risks) > MAX_RISKS:
        errors["short"].append(f"{len(risks)} risks, the limit is {MAX_RISKS}")
    if len(risks) < 4:
        warnings.append(f"only {len(risks)} risks. Did every area get a real look?")
    if not 3 <= len(top) <= 5:
        errors["short"].append(f"top has {len(top)} risks, expected 3 to 5")
    if len(set(top)) != len(top):
        errors["short"].append("a risk is listed twice in top")
    both_high = [str(r.get("id")) for r in risks if r.get("likelihood") == "high" and r.get("impact") == "high"]
    if len(both_high) > 5:
        errors["short"].append(f"{len(both_high)} risks are rated high on both likelihood and impact. Rank them: five at most.")

    # 5. Stories.
    for r in risks:
        rid = str(r.get("id"))
        n = words(r.get("story"))
        if n < MIN_STORY:
            errors["stories"].append(f"{rid}: the story is {n} words. Say who, doing what, and what follows ({MIN_STORY} at least).")
        elif n > MAX_STORY:
            errors["stories"].append(f"{rid}: the story is {n} words, the limit is {MAX_STORY}")
        if not str(r.get("title", "")).strip():
            errors["stories"].append(f"{rid}: no title")
        for field in ("likelihood", "impact"):
            if r.get(field) not in LEVELS:
                errors["stories"].append(f"{rid}: {field} is {r.get(field)!r}, expected low, medium or high")
            if words(r.get(f"{field}Why")) < 4:
                errors["stories"].append(f"{rid}: {field} has no reason")

    by_area = {a: sum(1 for r in risks if r.get("area") == a) for a in AREAS}
    guesses = [str(r.get("id")) for r in risks if (r.get("evidence") or {}).get("status") == "unknown"]
    return {
        "risks": len(risks),
        "top": top,
        "byArea": by_area,
        "guesses": guesses,
        "checks": [{"id": key, "name": name, "pass": not errors[key], "errors": errors[key]} for key, name in CHECKS],
        "warnings": warnings,
    }


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

    report = check(data)
    failed = [c for c in report["checks"] if not c["pass"]]

    if "--json" in argv:
        print(json.dumps(report, indent=1))
    else:
        areas = ", ".join(f"{a} {n}" for a, n in report["byArea"].items())
        print(f"{report['risks']} risks ({areas}), {len(report['top'])} with tripwires")
        if report["guesses"]:
            print(f"Guesses, with no evidence either way: {', '.join(report['guesses'])}")
        for c in report["checks"]:
            print(f"  {'PASS' if c['pass'] else 'FAIL'}  {c['name']}")
            for e in c["errors"]:
                print(f"        {e}")
        print("  ----  Tripwires use metrics you have (yours to judge)")
        if report["warnings"]:
            print("Warnings:")
            for w in report["warnings"]:
                print(f"  - {w}")
        print(f"{len(report['checks']) - len(failed)} of {len(report['checks'])} scripted checks passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
