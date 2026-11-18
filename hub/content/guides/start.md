---
title: Set up in ten minutes
summary: Install the skills, run your first workflow on your own material, and learn to read the check lines it prints.
minutes: 4
order: 1
verified: 2026-11-18
---

## What you need

One AI agent that can read files and run code. Any of these will do: Claude Code, the Claude app, Cursor, Codex or Gemini CLI. You do not need an account here, and nothing on this site asks for one.

## 1. Install the pack

In Claude Code, one line:

```
/plugin install {{plugin}} --marketplace {{repo}}
```

In the Claude app, open Customize, then Plugins, then Add, then Add marketplace, and paste `{{repo}}`.

In Cursor, Codex or Gemini CLI:

```
npx skills add {{repo}}
```

You can also install one skill at a time. Every [workflow page](/workflows/) has its own commands and a zip.

## 2. Pick a first workflow

Start with the one whose input you already have.

| You have | Run | You get |
|---|---|---|
| A plan or a PRD, written down | [Pre-mortem](/workflows/premortem/) | A ranked risk list with tripwires |
| Interview transcripts or call notes | [Interview synthesis](/workflows/interview-synthesis/) | Themes with every quote checked |
| Screenshots of competitors | [Journey teardown](/workflows/journey-teardown/) | A board with scores and gaps |
| The counts from an A/B test | [Experiment readout](/workflows/experiment-readout/) | One decision, with the arithmetic shown |
| Research and a decision to make | [Decision-ready PRD](/workflows/decision-prd/) | Numbered points with evidence |
| A PRD | [Flagged prototype](/workflows/flagged-prototype/) | A prototype with a switch per point |

The pre-mortem is the quickest to try. It needs half a page of plan and nothing else.

## 3. Ask in plain words

Put your file where the agent can read it and say what you want:

```
Run a pre-mortem on plan.md. We ship in March.
```

The skill loads by itself when the request matches. If it does not, name it: `/{{plugin}}:premortem` in Claude Code, or "use the premortem skill" anywhere else.

A skill may stop instead of writing. The pre-mortem will not run on a plan that is one sentence long, and the readout will not run without counts. That is on purpose. Each workflow page lists when it stops.

## 4. Read the check lines

Every skill ends by running its own checker and printing the result:

```
  PASS  Every top risk has a complete tripwire
  PASS  Evidence is labelled
  PASS  All six areas were considered
  PASS  The list is short enough to act on
  PASS  Every risk is a story
  ----  Tripwires use metrics you have (yours to judge)
5 of 5 scripted checks passed
```

A `FAIL` is fixed before the output reaches you. The line marked `----` is the one a script cannot do. It is yours, and it usually takes a minute.

## 5. Open the page

Each skill writes a data file and one HTML page. The page is a single file with nothing to install. Open it in a browser, send it in a message, or attach it to a ticket.

## If something goes wrong

- **The skill did not load.** Name it, as in step 3.
- **Your agent cannot run code.** The skills still work. The agent applies the checks by reading and says that it did. The experiment readout is the exception: it will not estimate a statistic by hand, and it stops.
- **The output is wrong.** That is the most useful thing you can report. [Open an issue](https://github.com/{{repo}}/issues) with what you gave it and what came back.

Next: [how to check AI output](/guides/checking-ai-output/), which is the idea behind every skill here.
