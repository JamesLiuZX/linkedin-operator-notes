# AI Workflow Handbook: the skills

Six workflows for product people, written as agent skills. Each one produces a finished document, checks it with a script before handing it over, and ships with a worked example you can open.

The handbook, with a live demo of every workflow: https://jamesliuzx.github.io/linkedin-operator-notes/

| Skill | What you get | Checked by |
|---|---|---|
| [journey-teardown](journey-teardown/) | A board comparing how several products handle one journey, stage by stage, ending in prioritised gaps | `check.py`, 6 checks |
| [interview-synthesis](interview-synthesis/) | Themes counted by person, with every quote matched to its line in the transcript | `verify_quotes.py`, 5 checks |
| [premortem](premortem/) | A ranked risk list where the top risks each carry a tripwire: a metric, a line, a date and an owner | `check.py`, 5 checks |
| [decision-prd](decision-prd/) | A PRD of numbered points, each with its problem, change, evidence and how you would know | `check.py`, 6 checks |
| [flagged-prototype](flagged-prototype/) | A clickable prototype with one switch per PRD point. Everything off is the product today | `check.mjs`, 6 checks |
| [experiment-readout](experiment-readout/) | One decision on an A/B test: ship, extend, stop or do not trust. A script does the arithmetic | `check.py`, 6 checks, and 42 tests on the statistics |

They chain. The teardown, the synthesis and the pre-mortem are evidence for the PRD. The PRD's point numbers become the prototype's switches. The readout closes the loop.

## Install

**Claude Code**

```
/plugin install handbook --marketplace JamesLiuZX/linkedin-operator-notes
```

That needs Claude Code 2.1.275 or later. On older versions:

```
/plugin marketplace add JamesLiuZX/linkedin-operator-notes
/plugin install handbook@ai-workflow-handbook
```

**Claude on the web, the desktop app, or Cowork**

Open Customize, then Plugins, then Add, then Add marketplace, and paste `JamesLiuZX/linkedin-operator-notes`. For one skill only, download its zip from the workflow's page on the handbook and upload it under Customize, Skills.

**Cursor, Codex, Gemini CLI and other agents**

```
npx skills add JamesLiuZX/linkedin-operator-notes
```

Add `--skill decision-prd` for one skill, and `-a cursor`, `-a codex` or `-a gemini-cli` to pick the agent without the prompt.

**By hand**

A skill is a folder of plain text. Copy the folder you want into your agent's skills directory.

## What is in a skill folder

```
decision-prd/
├── SKILL.md              what to produce, when to stop, the procedure
├── references/
│   ├── format.md         the exact output format
│   └── quality-bar.md    the checks, and why each one exists
├── scripts/check.py      the checks, as code. Standard library only
├── assets/template.html  one self-contained page that draws the output
└── examples/tangelo/     the input, the output, and the record of the run
```

Nothing in a skill calls the network. The scripts read the file you give them and print a report. Read them before you run them: they are short.

## How these were tested

Each skill was handed to a fresh agent session that could read only the skill folder and the example's input. Nobody answered its questions. The session was asked to do the work and to list everything wrong with the instructions.

The record of each run is the `RUN.md` beside the example: what the agent produced, what the checker said, what the run found wrong with the skill, and what was changed. The interview synthesis run includes a quote the requester remembered and nobody said. The script removed it.

Two things these runs do not show. They do not compare the result with what an agent produces without the skill. And one run on one example is not proof that a skill works on yours. The checks are there so that you find out.

## The checks

Every skill ends by running its own checker and telling you the result of each line. A check that fails is fixed before the output is handed over. One check in each skill is left to you, and the skill says which.

## Licence

MIT. See [LICENSE](LICENSE). The worked examples are fictional. Tangelo, Pippin, Marrow, Sorrel and Kerb are invented, and so is everyone quoted.
