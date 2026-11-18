#!/usr/bin/env python3
"""Check a prd.json against the decision-prd quality bar.

    python3 check.py prd.json            human-readable report
    python3 check.py prd.json --json     the same as JSON

Exit code 0 when every check passes (warnings allowed), 1 when any fails,
2 when the file cannot be read. Standard library only. Reads one file, writes
nothing, makes no network calls.
"""

import json
import re
import sys

BUILDING_VERBS = {
    "add", "build", "create", "implement", "introduce", "enable", "improve",
    "support", "allow", "redesign", "launch", "make", "develop", "ship",
}
TAGS = ("today", "reference", "proposed")
LEVELS = ("ok", "amb", "no")
EFFORTS = ("S", "M", "L")
ID_RE = re.compile(r"^(\d+)\.(\d+)$")
# A stated size of change: "12%", "3 points", "2x", "by 40", "+5". A duration such as "within 7 days" is not one.
SIZE_RE = re.compile(r"\d+(?:\.\d+)?\s?(?:%|per ?cent|points?\b|pp\b|x\b)|\bby\s+\d|[+\u2212-]\s?\d", re.I)
PERCENT_RE = re.compile(r"\d\s?%|\bper ?cent\b", re.I)

CHECKS = [
    ("parts", "Every point has a problem, a change and evidence"),
    ("ids", "IDs are unique and used consistently"),
    ("titles", "Titles state problems"),
    ("know", "Every point says how you would know"),
    ("figures", "Every figure has a source or is marked as an estimate"),
    ("short", "Problem and Change stay short"),
]


def sentences(text):
    """Count sentences. A sentence ends at . ! or ? followed by a space and a capital or a quote."""
    text = (text or "").strip()
    if not text:
        return 0
    # Protect decimals and common abbreviations so they are not read as sentence ends.
    guarded = re.sub(r"(\d)\.(\d)", r"\1<dot>\2", text)
    guarded = re.sub(r"\b(e\.g|i\.e|vs|etc|approx)\.", lambda m: m.group(0).replace(".", "<dot>"), guarded, flags=re.I)
    parts = re.split(r"(?<=[.!?])[\"')\]]*\s+(?=[\"'(\[]?[A-Z0-9])", guarded)
    return len([p for p in parts if p.strip()])


def check(data):
    errors = {key: [] for key, _ in CHECKS}
    warnings = []

    doc = data.get("doc") or {}
    if not str(doc.get("title", "")).strip():
        errors["parts"].append("doc.title is empty")

    source_ids = {str(s.get("id")) for s in data.get("sources") or []}
    sections = data.get("sections") or []
    if not 2 <= len(sections) <= 5:
        warnings.append(f"{len(sections)} sections. Two to five reads best.")

    points = []
    seen = set()
    for si, sec in enumerate(sections, start=1):
        if sec.get("n") != si:
            errors["ids"].append(f"section {si} has n = {sec.get('n')!r}, expected {si}")
        if not (sec.get("points") or []):
            warnings.append(f"section {sec.get('n')} has no points")
        for p in sec.get("points") or []:
            pid = str(p.get("id", ""))
            points.append(p)
            m = ID_RE.match(pid)
            if not m:
                errors["ids"].append(f"point id {pid!r} is not in the form N.n")
            elif int(m.group(1)) != sec.get("n"):
                errors["ids"].append(f"point {pid} sits in section {sec.get('n')}")
            if pid in seen:
                errors["ids"].append(f"point id {pid} is used twice")
            seen.add(pid)

            for field in ("problem", "change"):
                if not str(p.get(field, "")).strip():
                    errors["parts"].append(f"{pid}: {field} is empty")
                elif sentences(p[field]) > 2:
                    errors["short"].append(f"{pid}: {field} has {sentences(p[field])} sentences, the limit is 2")

            evidence = p.get("evidence") or []
            if not evidence:
                errors["parts"].append(f"{pid}: no evidence")
            for e in evidence:
                if e.get("tag") not in TAGS:
                    errors["parts"].append(f"{pid}: evidence tag {e.get('tag')!r} is not one of {', '.join(TAGS)}")
                screen = e.get("screen") or {}
                if not screen.get("img") and not screen.get("blocks"):
                    errors["parts"].append(f"{pid}: an evidence item has no screen (give img or blocks)")
                if not str(e.get("caption", "")).strip():
                    warnings.append(f"{pid}: an evidence item has no caption")
            order = [TAGS.index(e["tag"]) for e in evidence if e.get("tag") in TAGS]
            if order != sorted(order):
                warnings.append(f"{pid}: evidence is not in the order today, reference, proposed")
            if evidence and all(e.get("tag") == "proposed" for e in evidence):
                warnings.append(f"{pid}: only proposed screens. Show today or a reference as well.")

            refs = p.get("sources") or []
            if not refs:
                errors["parts"].append(f"{pid}: cites no source")
            for ref in refs:
                code = str(ref).split(":", 1)[0]
                if code not in source_ids:
                    errors["ids"].append(f"{pid}: cites source {code!r}, which is not in sources")
            if len({str(r).split(':', 1)[0] for r in refs}) == 1:
                warnings.append(f"{pid}: rests on a single source")

            title = str(p.get("title", "")).strip()
            first = re.sub(r"[^a-z]", "", title.split(" ")[0].lower()) if title else ""
            if not title:
                errors["titles"].append(f"{pid}: title is empty")
            elif first in BUILDING_VERBS:
                errors["titles"].append(f"{pid}: title opens with \"{title.split(' ')[0]}\". State the problem the user has today.")
            if len(title.split()) > 12:
                warnings.append(f"{pid}: title is {len(title.split())} words. Under 12 reads better.")

            know = p.get("know") or {}
            for field in ("baseline", "expect", "stop"):
                if not str(know.get(field, "")).strip():
                    errors["know"].append(f"{pid}: know.{field} is empty")
            expect = str(know.get("expect", ""))
            if SIZE_RE.search(expect) and "estimate" not in expect.lower():
                errors["figures"].append(f"{pid}: the expected movement states a size and is not marked as an estimate")
            if PERCENT_RE.search(str(p.get("problem", ""))):
                warnings.append(f"{pid}: a percentage in the problem. Check it has a source and a denominator of 30 or more.")

            c = p.get("constraint")
            if c is not None and (not str(c.get("label", "")).strip() or not str(c.get("text", "")).strip()):
                errors["parts"].append(f"{pid}: constraint needs a label and a text")

    ids = [str(p.get("id")) for p in points]
    if len(points) > 12:
        warnings.append(f"{len(points)} points. Over 12, split the document by area.")

    in_priority = [str(r.get("id")) for r in data.get("priority") or []]
    for rid in in_priority:
        if rid not in ids:
            errors["ids"].append(f"priority row {rid} is not a point")
    for pid in ids:
        if in_priority.count(pid) != 1:
            errors["ids"].append(f"point {pid} has {in_priority.count(pid)} priority rows, expected 1")
    for r in data.get("priority") or []:
        if r.get("effort") not in EFFORTS:
            errors["ids"].append(f"priority row {r.get('id')}: effort {r.get('effort')!r} is not S, M or L")
        if (r.get("status") or {}).get("level") not in LEVELS:
            errors["ids"].append(f"priority row {r.get('id')}: status.level must be ok, amb or no")

    in_rollout = [str(x) for r in data.get("rollout") or [] for x in (r.get("points") or [])]
    for rid in in_rollout:
        if rid not in ids:
            errors["ids"].append(f"rollout names {rid}, which is not a point")
    for pid in ids:
        if in_rollout.count(pid) != 1:
            errors["ids"].append(f"point {pid} appears in {in_rollout.count(pid)} rollout rows, expected 1")
    for r in data.get("rollout") or []:
        if not str(r.get("why", "")).strip():
            errors["ids"].append(f"rollout row {r.get('when')!r} has no reason")

    return {
        "points": len(points),
        "sections": len(sections),
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
        print(f"{report['points']} points in {report['sections']} sections")
        for c in report["checks"]:
            print(f"  {'PASS' if c['pass'] else 'FAIL'}  {c['name']}")
            for e in c["errors"]:
                print(f"        {e}")
        print("  ----  The first release is small enough to ship (yours to judge)")
        if report["warnings"]:
            print("Warnings:")
            for w in report["warnings"]:
                print(f"  - {w}")
        passed = len(report["checks"]) - len(failed)
        print(f"{passed} of {len(report['checks'])} scripted checks passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
