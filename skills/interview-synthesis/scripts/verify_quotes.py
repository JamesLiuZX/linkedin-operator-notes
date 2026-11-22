#!/usr/bin/env python3
"""Verify every quote in a synthesis.json against the transcripts it cites.

    python3 verify_quotes.py synthesis.json transcripts/            report only
    python3 verify_quotes.py synthesis.json transcripts/ --fix      also repair the file
    python3 verify_quotes.py synthesis.json transcripts/ --json     report as JSON

Without --fix nothing is written. With --fix the script:
  - adds the line number and a few lines of context to every quote it finds,
  - removes every quote it cannot find and records it under "rejected",
  - writes verification.txt beside synthesis.json.

Exit code 0 when every check passes, 1 when any fails, 2 when a file cannot
be read. Standard library only. No network calls.
"""

import json
import os
import re
import sys

CONTEXT = 2  # lines of transcript kept either side of a quote
MIN_WORDS = 6  # shorter than this and a "quote" is a fragment that could match anywhere
MAX_WORDS = 40
SMALL_SAMPLE = 30
PERCENT_RE = re.compile(r"\d\s?%|\bper ?cent\b|\bpercent(age)?\b", re.I)
LABEL_RE = re.compile(r"^\s*(?:\[[^\]]*\]\s*)?([A-Za-z][\w .'-]{0,30}?)\s*:\s*(.*)$")

CHECKS = [
    ("quotes", "Every quote exists in a transcript"),
    ("counts", "Counts are people"),
    ("percent", "No percentages from small samples"),
    ("counter", "Every theme has a counter-voice, or says none was found"),
    ("everyone", "Every participant is accounted for"),
]


def norm(text):
    """Fold spacing and quote-mark style. Words are never changed."""
    text = str(text or "")
    for a, b in (("‘", "'"), ("’", "'"), ("“", '"'), ("”", '"'), (" ", " ")):
        text = text.replace(a, b)
    return re.sub(r"\s+", " ", text).strip().lower()


def load_transcript(path, participant):
    """Return the transcript as numbered lines, each tagged with whether this participant spoke it."""
    with open(path, encoding="utf-8") as fh:
        raw = fh.read().splitlines()
    names = {norm(participant.get("id")), norm(participant.get("name"))} - {""}
    lines = []
    labelled = False
    for number, text in enumerate(raw, start=1):
        m = LABEL_RE.match(text)
        speaker, said = (m.group(1).strip(), m.group(2)) if m else (None, text)
        if speaker and norm(speaker) in names:
            labelled = True
        lines.append({"n": number, "who": speaker, "text": said if m else text, "mine": bool(speaker and norm(speaker) in names)})
    return lines, labelled


def find(quote, lines, only_mine):
    q = norm(quote)
    if not q:
        return None
    for line in lines:
        if only_mine and not line["mine"]:
            continue
        if q in norm(line["text"]):
            return line
    return None


def all_quotes(data):
    """Yield (owner description, container list or None, quote dict) for every quote in the file."""
    for kind in ("themes", "unprompted"):
        for item in data.get(kind) or []:
            for q in item.get("quotes") or []:
                yield item, "quotes", q
            if item.get("counter"):
                yield item, "counter", item["counter"]


def verify(data, folder, fix):
    participants = {str(p.get("id")): p for p in data.get("participants") or []}
    errors = {key: [] for key, _ in CHECKS}
    warnings = []
    log = []

    transcripts = {}
    for pid, p in participants.items():
        path = os.path.join(folder, str(p.get("file") or f"{pid}.txt"))
        try:
            transcripts[pid] = load_transcript(path, p)
            if not transcripts[pid][1]:
                warnings.append(f"{pid}: no speaker labels found in {os.path.basename(path)}, so the whole file was searched")
        except OSError as exc:
            errors["quotes"].append(f"{pid}: cannot read {path}: {exc}")

    found = 0
    # Quotes removed by an earlier --fix run stay on the record and are always reported.
    rejected = list(data.get("rejected") or [])
    earlier = len(rejected)
    for item, slot, q in list(all_quotes(data)):
        pid = str(q.get("p"))
        text = str(q.get("text", ""))
        where = f"{item.get('id') or item.get('name')}"
        if pid not in transcripts:
            errors["quotes"].append(f"{where}: quote attributed to {pid}, who has no transcript")
            continue
        lines, labelled = transcripts[pid]
        count = len(text.split())
        hit = None if count < MIN_WORDS else find(text, lines, only_mine=labelled)
        reason = None
        if count < MIN_WORDS:
            reason = f"only {count} words, too short to stand as evidence (the minimum is {MIN_WORDS})"
        elif count > MAX_WORDS:
            warnings.append(f"{where}: a quote from {pid} runs to {count} words. Under {MAX_WORDS} reads better.")
        if hit is None and reason is None:
            elsewhere = None
            for other, (olines, olabelled) in transcripts.items():
                if other != pid and find(text, olines, only_mine=olabelled):
                    elsewhere = other
                    break
            if elsewhere:
                reason = f"said by {elsewhere}, not {pid}"
            elif find(text, lines, only_mine=False):
                reason = f"said in {pid}'s interview, but not by {pid}"
            else:
                reason = "not found in any transcript"
        if hit is not None:
            found += 1
            log.append(f"FOUND     {pid} line {hit['n']:>3}  {where}  \"{text}\"")
            if fix:
                q["line"] = hit["n"]
                at = lines.index(hit)
                q["ctx"] = [{"n": l["n"], "who": l["who"], "text": l["text"]} for l in lines[max(0, at - CONTEXT): at + CONTEXT + 1]]
        else:
            log.append(f"REJECTED  {pid}           {where}  \"{text}\"  ({reason})")
            if fix:
                rejected.append({"p": pid, "text": text, "from": where, "reason": reason})
                if slot == "quotes":
                    item["quotes"] = [x for x in item["quotes"] if x is not q]
                else:
                    item["counter"] = None
                    if not str(item.get("counterNote", "")).strip():
                        item["counterNote"] = ""
            else:
                errors["quotes"].append(f"{where}: {pid} \"{text[:60]}...\" {reason}")

    # Counts are people: one verified quote per supporter, and no quoted outsider.
    for kind in ("themes", "unprompted"):
        for item in data.get(kind) or []:
            where = f"{item.get('id') or item.get('name')}"
            support = [str(x) for x in item.get("support") or []]
            quoted = {str(q.get("p")) for q in item.get("quotes") or []}
            if len(set(support)) != len(support):
                errors["counts"].append(f"{where}: a participant is listed twice in support")
            for pid in support:
                if pid not in participants:
                    errors["counts"].append(f"{where}: support names {pid}, who is not a participant")
                elif pid not in quoted:
                    errors["counts"].append(f"{where}: {pid} is counted but has no verified quote here")
            for pid in quoted:
                if pid not in support:
                    errors["counts"].append(f"{where}: {pid} is quoted but not counted in support")
            per_person = {}
            for q in item.get("quotes") or []:
                per_person[str(q.get("p"))] = per_person.get(str(q.get("p")), 0) + 1
            for pid, n in per_person.items():
                if n > 2:
                    errors["counts"].append(f"{where}: {pid} has {n} quotes here, the limit is 2 per participant")
            if not support:
                errors["counts"].append(f"{where}: no supporting participants")
            if kind == "themes":
                has_counter = bool(item.get("counter"))
                if not has_counter and not str(item.get("counterNote", "")).strip():
                    errors["counter"].append(f"{where}: no counter-voice and no note saying none was found")
                if has_counter and str(item["counter"].get("p")) in support:
                    errors["counter"].append(f"{where}: the counter-voice {item['counter'].get('p')} is also counted as support")

    if len(participants) < SMALL_SAMPLE:
        def texts():
            yield "title", data.get("title")
            for kind in ("themes", "unprompted"):
                for item in data.get(kind) or []:
                    for field in ("name", "summary", "so", "counterNote"):
                        yield f"{item.get('id') or item.get('name')}.{field}", item.get(field)
            for u in data.get("unknowns") or []:
                yield "unknowns", f"{u.get('q', '')} {u.get('ask', '')}"
            for r in data.get("requests") or []:
                yield "requests", r.get("text")
            for q in data.get("quiet") or []:
                yield f"quiet.{q.get('p')}", q.get("note")
        for where, text in texts():
            if text and PERCENT_RE.search(str(text)):
                errors["percent"].append(f"{where}: a percentage with only {len(participants)} participants. Give the count.")

    theme_count = {pid: 0 for pid in participants}
    for item in data.get("themes") or []:
        for pid in item.get("support") or []:
            if str(pid) in theme_count:
                theme_count[str(pid)] += 1
    quiet = {str(q.get("p")) for q in data.get("quiet") or []}
    for pid, n in theme_count.items():
        if n < 2 and pid not in quiet:
            errors["everyone"].append(f"{pid} supports {n} theme(s) and is not listed under quiet")

    if fix:
        data["rejected"] = rejected
        data["checked"] = {"found": found, "rejected": len(rejected), "participants": len(participants)}

    return {
        "participants": len(participants),
        "themes": len(data.get("themes") or []),
        "found": found,
        "rejected": rejected,
        "earlier": earlier,
        "checks": [{"id": key, "name": name, "pass": not errors[key], "errors": errors[key]} for key, name in CHECKS],
        "warnings": warnings,
        "log": log,
    }


def main(argv):
    args = [a for a in argv[1:] if not a.startswith("--")]
    fix = "--fix" in argv
    if len(args) != 2:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    path, folder = args
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError) as exc:
        print(f"verify_quotes.py: cannot read {path}: {exc}", file=sys.stderr)
        return 2
    if not os.path.isdir(folder):
        print(f"verify_quotes.py: {folder} is not a folder", file=sys.stderr)
        return 2

    report = verify(data, folder, fix)
    failed = [c for c in report["checks"] if not c["pass"]]

    lines = [f"{report['participants']} participants, {report['themes']} themes, {report['found']} quotes found, {len(report['rejected'])} rejected"]
    lines.append("  (quotes found counts every verified quote: theme supporters, counter-voices and unprompted topics)")
    for c in report["checks"]:
        note = ""
        if c["id"] == "quotes" and c["pass"] and report["rejected"]:
            # The file is clean only because quotes were taken out. Never let that read as a plain pass.
            new = len(report["rejected"]) - report["earlier"]
            if new > 0:
                note = f" (after removing {new} that could not be found)"
            else:
                note = f" ({len(report['rejected'])} removed in an earlier run, none this time)"
        lines.append(f"  {'PASS' if c['pass'] else 'FAIL'}  {c['name']}{note}")
        lines.extend(f"        {e}" for e in c["errors"])
    lines.append("  ----  The themes answer the research question (yours to judge)")
    if report["rejected"]:
        lines.append("Rejected quotes (removed from the synthesis):")
        lines.extend(f"  - {r['p']}: \"{r['text']}\" ({r['reason']}; was under {r.get('from') or 'an unknown theme'})" for r in report["rejected"])
    if report["warnings"]:
        lines.append("Warnings:")
        lines.extend(f"  - {w}" for w in report["warnings"])
    lines.append(f"{len(report['checks']) - len(failed)} of {len(report['checks'])} scripted checks passed")
    if report["rejected"]:
        lines.append(f"{len(report['rejected'])} quote(s) were rejected and removed. Tell the user each one, word for word.")

    if fix:
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=1, ensure_ascii=False)
            fh.write("\n")
        with open(os.path.join(os.path.dirname(os.path.abspath(path)), "verification.txt"), "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + "\n\nEvery quote, in order:\n" + "\n".join(report["log"]) + "\n")

    if "--json" in argv:
        print(json.dumps({k: v for k, v in report.items() if k != "log"}, indent=1))
    else:
        print("\n".join(lines))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
