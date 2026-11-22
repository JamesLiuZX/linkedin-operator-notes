#!/usr/bin/env python3
"""Check a teardown.json against the journey-teardown quality bar.

    python3 check.py teardown.json            human-readable report
    python3 check.py teardown.json --json     the same as JSON

Exit code 0 when every check passes (warnings allowed), 1 when any fails,
2 when the file cannot be read. Standard library only. Reads one file, writes
nothing, makes no network calls.
"""

import json
import re
import sys

LABELS = ("good", "friction", "note", "idea")
PRIORITIES = ("P0", "P1", "P2")
DIMENSIONS = ("clarity", "speed", "transparency", "trust", "engagement")

# Block heights and widths mirror the page template, so a block the page would drop is found here.
BLOCK_H = {
    "bar": 30, "title": 26, "search": 24, "chips": 20, "banner": 40, "card": 46, "row": 24, "grid": 62,
    "slots": 26, "text": 16, "gap": 8, "cta": 28, "field": 36, "toggle": 26, "people": 26, "kpi": 40,
    "check": 22, "media": 64, "progress": 26,
}
OVERLAYS = ("tabs", "sheet", "modal", "toast")


def _block(b):
    if isinstance(b, (list, tuple)):
        out = {"t": b[0] if b else None, "l": b[1] if len(b) > 1 else None}
        if len(b) > 2 and isinstance(b[2], dict):
            out.update(b[2])
        return out
    return b if isinstance(b, dict) else {}


def _per_line(width, size):
    return max(3, int(width / (size * 0.54)))


def _wrapped(text, width, limit):
    lines, cur = 0, ""
    for word in str(text or "").split():
        if cur and len(cur) + 1 + len(word) <= width:
            cur += " " + word
        else:
            lines += 1 if cur else 0
            cur = word
    lines += 1 if cur else 0
    return min(lines, limit)


def _height(b, width):
    if b.get("h"):
        return b["h"]
    t = b.get("t")
    if t == "para":
        return _wrapped(b.get("l"), _per_line(width, b.get("size") or 7.6), b.get("lines") or 4) * 10.5 + 6
    if t == "chat":
        return _wrapped(b.get("l"), _per_line(width * 0.78 - 14, 7.4), b.get("lines") or 4) * 10 + 16
    if t == "table":
        return 16 + len(b.get("rows") or []) * 15 + 6
    if t == "cols":
        split = b.get("split") or 0.5
        left = sum(_height(_block(x), width * split - 5) for x in b.get("left") or [])
        right = sum(_height(_block(x), width * (1 - split) - 5) for x in b.get("right") or [])
        return max(left, right) + 2
    if t == "card" and b.get("sub2"):
        return 58
    return BLOCK_H.get(t, 20)


def _drops(blocks, width, y, limit, out):
    for raw in blocks:
        b = _block(raw)
        if b.get("t") in OVERLAYS:
            continue
        h = _height(b, width)
        if y + h > limit:
            out.append(b)
            break
        if b.get("t") == "cols":
            split = b.get("split") or 0.5
            _drops([x for x in b.get("left") or []], width * split - 5, y, limit, out)
            _drops([x for x in b.get("right") or []], width * (1 - split) - 5, y, limit, out)
        y += h


def dropped_blocks(screen):
    """Blocks the page leaves out because they do not fit the frame. Empty when everything fits."""
    blocks = screen.get("blocks") or []
    if not blocks:
        return []
    desktop = screen.get("frame") == "desktop"
    tabs = any(_block(b).get("t") == "tabs" for b in blocks)
    if desktop:
        width = 372 - 76 - 24 if screen.get("nav") else 372 - 24
        limit = 248 - (34 if tabs else 6)
    else:
        width, limit = 160, 368 - (34 if tabs else 6)
    out = []
    _drops(blocks, width, 26, limit, out)
    return out


def count_highlights(blocks):
    """How many blocks on a screen carry hi, counting inside columns."""
    n = 0
    for raw in blocks or []:
        b = _block(raw)
        if b.get("hi"):
            n += 1
        if b.get("t") == "cols":
            n += count_highlights(b.get("left")) + count_highlights(b.get("right"))
    return n


def undrawn_highlights(blocks):
    """Overlay blocks marked hi. The page never draws a highlight on them."""
    return [_block(b).get("t") for b in blocks or [] if _block(b).get("hi") and _block(b).get("t") in OVERLAYS]


CHECKS = [
    ("scores", "Every score has a reason"),
    ("patterns", "Every pattern lists where it was seen"),
    ("gaps", "Every gap names a benchmark"),
    ("notes", "No screen has more than three notes"),
    ("order", "Your product is the last lane in every stage"),
    ("coverage", "Coverage is stated"),
]


def words(text):
    return len(str(text or "").split())


def sentence_count(text):
    """Sentences in a note. Quoted words count as one phrase, and decimals and abbreviations are not ends."""
    text = re.sub(r'"[^"]*"|\u201c[^\u201d]*\u201d', "QUOTE", str(text or ""))
    text = re.sub(r"(\d)\.(\d)", r"\1<dot>\2", text)
    text = re.sub(r"\b(e\.g|i\.e|vs|etc|approx)\.", lambda m: m.group(0).replace(".", "<dot>"), text, flags=re.I)
    return len([p for p in re.split(r"(?<=[.!?])\s+(?=[A-Z0-9])", text.strip()) if p.strip()])


def check(data):
    errors = {key: [] for key, _ in CHECKS}
    warnings = []

    apps = [str(a.get("id")) for a in data.get("apps") or []]
    us = str(data.get("us", ""))
    if us not in apps:
        errors["order"].append(f"us = {us!r} is not one of the apps")
    if len(apps) < 3:
        warnings.append(f"{len(apps)} apps. A teardown needs at least three to show a pattern.")

    dims = [str(d.get("id")) for d in data.get("dimensions") or []] or list(DIMENSIONS)
    stages = data.get("stages") or []
    if not 2 <= len(stages) <= 6:
        warnings.append(f"{len(stages)} stages. Three to six reads best.")

    lane_apps = {str(l.get("app")) for st in stages for l in st.get("lanes") or []}
    long_notes = []
    counts = {"lanes": 0, "screens": 0, "notes": 0}
    overall = {}  # app -> list of lane means

    for st in stages:
        sid = str(st.get("id", "?"))
        lanes = st.get("lanes") or []
        order = [str(l.get("app")) for l in lanes]
        missing = st.get("missing") or {}

        if order and order[-1] != us:
            errors["order"].append(f"{sid}: the last lane is {order[-1]!r}, expected {us!r}")
        expected = [a for a in apps if a in order]
        if order != expected:
            errors["order"].append(f"{sid}: lanes are {order}, expected the app order {expected}")
        if len(set(order)) != len(order):
            errors["order"].append(f"{sid}: an app has two lanes")
        for a in order:
            if a not in apps:
                errors["order"].append(f"{sid}: lane app {a!r} is not in apps")
        for a in apps:
            if a not in order and not str(missing.get(a, "")).strip():
                errors["coverage"].append(f"{sid}: {a} has no lane and is not listed under missing")
        if not str(st.get("finding", "")).strip():
            errors["patterns"].append(f"{sid}: the stage has no finding")

        for lane in lanes:
            app = str(lane.get("app"))
            where = f"{sid} {app}"
            counts["lanes"] += 1
            screens = lane.get("screens") or []
            counts["screens"] += len(screens)
            if not screens:
                errors["coverage"].append(f"{where}: no screens. Remove the lane and list it under missing.")
            elif len(screens) < 2 and not str(lane.get("coverage", "")).strip():
                errors["coverage"].append(f"{where}: fewer than two screens and no coverage line")
            if not str(lane.get("source", "")).strip():
                errors["coverage"].append(f"{where}: no source saying where the screens came from")

            for i, sc in enumerate(screens, start=1):
                notes = sc.get("notes") or []
                counts["notes"] += len(notes)
                if len(notes) > 3:
                    errors["notes"].append(f"{where} screen {i}: {len(notes)} notes, the limit is 3")
                for n in notes:
                    if n.get("k") not in LABELS:
                        errors["notes"].append(f"{where} screen {i}: note label {n.get('k')!r} is not one of {', '.join(LABELS)}")
                    if not str(n.get("t", "")).strip():
                        errors["notes"].append(f"{where} screen {i}: an empty note")
                    elif sentence_count(n.get("t")) > 1:
                        long_notes.append(f"{where} screen {i}")
                    if words(n.get("t")) > 30:
                        errors["notes"].append(f"{where} screen {i}: a note of {words(n.get('t'))} words, the limit is 30")
                if not sc.get("img") and not sc.get("blocks"):
                    errors["coverage"].append(f"{where} screen {i}: no image and no blocks")
                if count_highlights(sc.get("blocks")) > 1:
                    errors["notes"].append(f"{where} screen {i}: {count_highlights(sc.get('blocks'))} highlighted blocks, the limit is 1")
                if undrawn_highlights(sc.get("blocks")):
                    warnings.append(f"{where} screen {i}: hi on a {undrawn_highlights(sc.get('blocks'))[0]} block is never drawn. Highlight another block.")
                for b in dropped_blocks(sc):
                    warnings.append(f"{where} screen {i}: the {b.get('t')} block \"{str(b.get('l') or '')[:30]}\" does not fit the frame and the board would leave it out.")
                if not str(sc.get("step", "")).strip():
                    warnings.append(f"{where} screen {i}: no step caption")

            scores = lane.get("scores") or {}
            values = []
            for d in dims:
                s = scores.get(d)
                if s is None:
                    errors["scores"].append(f"{where}: no score for {d}")
                    continue
                n = s.get("n")
                if not isinstance(n, int) or isinstance(n, bool) or not 1 <= n <= 5:
                    errors["scores"].append(f"{where}: {d} is {n!r}, expected a whole number from 1 to 5")
                else:
                    values.append(n)
                if words(s.get("why")) < 4:
                    errors["scores"].append(f"{where}: {d} has no reason (four words at least)")
            if values:
                overall.setdefault(app, []).append(sum(values) / len(values))
            if len(set(values)) == 1 and len(values) == len(dims):
                warnings.append(f"{where}: all five scores are {values[0]}. Check they were scored one by one.")

            if not str(lane.get("verdict", "")).strip():
                errors["scores"].append(f"{where}: no verdict")
            if not lane.get("well") or not lane.get("wrong"):
                warnings.append(f"{where}: needs both does well and does wrong")
            if app != us and not lane.get("steal"):
                warnings.append(f"{where}: nothing listed to steal")
            if app == us and lane.get("steal"):
                errors["order"].append(f"{where}: your own lane has a steal list. Steal is for competitors.")

        syn = st.get("synthesis") or {}
        for p in syn.get("patterns") or []:
            seen = [str(x) for x in p.get("seen") or []]
            if len(set(seen)) < 2:
                errors["patterns"].append(f"{sid}: pattern {p.get('name')!r} names {len(set(seen))} app(s), needs 2")
            if seen and all(a == us for a in seen):
                errors["patterns"].append(f"{sid}: pattern {p.get('name')!r} was seen only in your own product")
            elif seen and not any(a != us for a in seen):
                errors["patterns"].append(f"{sid}: pattern {p.get('name')!r} needs at least one competitor")
            for a in seen:
                if a not in apps:
                    errors["patterns"].append(f"{sid}: pattern {p.get('name')!r} names {a!r}, which is not an app")
                elif a not in order:
                    errors["patterns"].append(f"{sid}: pattern {p.get('name')!r} names {a}, which has no lane in this stage")
        for p in syn.get("anti") or []:
            seen = [str(x) for x in p.get("seen") or []]
            if not seen:
                errors["patterns"].append(f"{sid}: anti-pattern {p.get('name')!r} names no app")
            for a in seen:
                if a not in apps:
                    errors["patterns"].append(f"{sid}: anti-pattern {p.get('name')!r} names {a!r}, which is not an app")
        if not syn.get("patterns"):
            errors["patterns"].append(f"{sid}: the synthesis has no patterns")
        if not 2 <= len(syn.get("ideal") or []) <= 5:
            errors["patterns"].append(f"{sid}: the ideal flow has {len(syn.get('ideal') or [])} steps, expected 2 to 5")
        if not 1 <= len(syn.get("best") or []) <= 2:
            warnings.append(f"{sid}: best in class has {len(syn.get('best') or [])} entries, expected 1 or 2")
        for b in syn.get("best") or []:
            if str(b.get("app")) not in apps:
                errors["patterns"].append(f"{sid}: best in class names {b.get('app')!r}, which is not an app")
            elif str(b.get("app")) == us:
                warnings.append(f"{sid}: best in class names your own product. Best in class is the example to learn from, so it is normally a competitor.")

        gaps = syn.get("gaps") or []
        if us in order and not gaps:
            warnings.append(f"{sid}: no gaps for your own product. Is it really the best here?")
        for g in gaps:
            title = g.get("title") or "?"
            if g.get("p") not in PRIORITIES:
                errors["gaps"].append(f"{sid}: gap {title!r} has priority {g.get('p')!r}, expected P0, P1 or P2")
            for field in ("title", "today", "fix"):
                if not str(g.get(field, "")).strip():
                    errors["gaps"].append(f"{sid}: gap {title!r} has no {field}")
            bench = g.get("benchmark")
            if bench is None:
                # No app shows the fix working. That is allowed, but it has to be said.
                if not str(g.get("benchmarkNote", "")).strip():
                    errors["gaps"].append(f"{sid}: gap {title!r} has no benchmark and no benchmarkNote saying why")
            elif str(bench) not in apps:
                errors["gaps"].append(f"{sid}: gap {title!r} names benchmark {bench!r}, which is not an app")
            elif str(bench) == us:
                errors["gaps"].append(f"{sid}: gap {title!r} uses your own product as its benchmark")
            elif str(bench) not in lane_apps:
                errors["gaps"].append(f"{sid}: gap {title!r} names benchmark {bench!r}, who has no lane on the board to show the fix working")

    if long_notes:
        warnings.append(f"{len(long_notes)} notes run to more than one sentence, the first on {long_notes[0]}. A note is one sentence.")

    means = {a: sum(v) / len(v) for a, v in overall.items() if v}
    if us in means and len(means) > 1 and means[us] >= max(v for a, v in means.items() if a != us):
        warnings.append("Your own product scores at least as well as every competitor overall. Read its lanes again with the rubric.")

    principles = data.get("principles") or []
    if not 3 <= len(principles) <= 6:
        warnings.append(f"{len(principles)} principles. Three to six is the range.")
    stage_ids = {str(s.get("id")) for s in stages}
    for p in principles:
        for ev in p.get("evidence") or []:
            if str(ev) not in stage_ids:
                errors["patterns"].append(f"principle {p.get('name')!r} cites {ev!r}, which is not a stage")
        if not p.get("evidence"):
            errors["patterns"].append(f"principle {p.get('name')!r} cites no stage")

    return {
        "counts": {"apps": len(apps), "stages": len(stages), **counts},
        "means": {a: round(v, 2) for a, v in means.items()},
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
        c = report["counts"]
        print(f"{c['apps']} apps, {c['stages']} stages, {c['lanes']} lanes, {c['screens']} screens, {c['notes']} notes")
        if report["means"]:
            print("Mean score by app: " + ", ".join(f"{a} {v}" for a, v in report["means"].items()))
        for chk in report["checks"]:
            print(f"  {'PASS' if chk['pass'] else 'FAIL'}  {chk['name']}")
            for e in chk["errors"]:
                print(f"        {e}")
        print("  ----  Your product was scored by the same rubric (yours to judge)")
        if report["warnings"]:
            print("Warnings:")
            for w in report["warnings"]:
                print(f"  - {w}")
        print(f"{len(report['checks']) - len(failed)} of {len(report['checks'])} scripted checks passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
