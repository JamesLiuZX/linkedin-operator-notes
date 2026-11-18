---
title: Write a skill that checks itself
summary: The order these skills were built in, so you can do the same for a workflow of your own. Output first, checks second, instructions last.
minutes: 5
order: 3
verified: 2026-11-18
---

A skill is a folder of plain text that tells an agent how to do one job. Most are a long prompt in a file. The ones in this handbook are built the other way round, starting from the finished output. This is the order.

## 1. Decide what the output is

Before any instructions, write the output format: a data file with named fields, and the page that draws it. If you cannot say what a good one looks like, the agent cannot either.

Keep the data and the page apart. The agent writes JSON. A template turns it into a page. The agent never touches layout, so every output looks the same and a script can read it.

## 2. Write the checks

List what must be true of a good output, and split the list in two.

- **What a script can check.** Every quote appears in a source. Every score has a reason. The numbers match a recomputation. Counts are people, not mentions.
- **What only a person can check.** Leave exactly one of these, name it, and tell the reader it is theirs.

Then write the script. It reads the output, prints one line per check, and exits with an error when any fails:

```python
CHECKS = [("reasons", "Every score has a reason")]

def check(data):
    errors = {key: [] for key, _ in CHECKS}
    for lane in data["lanes"]:
        for name, score in lane["scores"].items():
            if not score.get("why", "").strip():
                errors["reasons"].append(f"{lane['app']}: {name} has no reason")
    return errors
```

Make the failure message say what to fix. The agent reads it and acts on it.

## 3. Write when to stop

The most useful part of a skill is the list of cases where it refuses. Fewer than three competitors. A plan that is one sentence long. Percentages with no counts behind them. An agent that always produces something will produce something wrong.

## 4. Write the procedure last

Now the steps, in order, ending with "run the checker and fix every failure". Keep the main file short and put the format and the reasons in reference files the agent opens when it needs them.

Say what to do when the input is thin, when two instructions pull apart, and when nobody is there to answer a question. Those are the places a real run goes wrong.

## 5. Hand it to a stranger

Give the folder to a fresh agent session that can read nothing else. Give it a real input. Ask for two things: the work, and a list of every place the instructions were unclear, missing or wrong.

The list is the point. Expect ten to twenty items the first time. Fix the ones that matter and run it again with a new session. If the first run passes every check and still has a long list of complaints, the checks are too easy.

## 6. Publish the run

Put the input, the output and a record of the run beside the skill: what it produced, what the checker said, what it found wrong, what you changed, and what the run does not show. A reader can then judge the skill by its output before installing it.

## The folder you end up with

```
my-skill/
├── SKILL.md              what to produce, when to stop, the procedure
├── references/
│   ├── format.md         the output format, field by field
│   └── quality-bar.md    each check, and why it exists
├── scripts/check.py      the checks, as code
├── assets/template.html  the page that draws the output
└── examples/first-case/  input, output, and the record of the run
```

Every skill in [the pack](/skills/) follows this shape. Read one end to end before writing your own. The [pre-mortem](/workflows/premortem/) is the shortest.
