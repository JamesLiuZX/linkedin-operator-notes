---
name: decision-prd
description: Writes a decision-ready PRD as a single HTML page in which every proposed change is a numbered point with its problem, the change, the evidence beside it and how the team would know it worked, followed by a priority table and a rollout plan. Use when someone asks for a PRD, product spec, proposal or requirements document for changes to an existing product, has research or notes to base it on, or wants a document a reviewer can approve point by point. Not for engineering design documents, single bug tickets, or when there is no evidence yet (run journey-teardown or interview-synthesis first).
license: MIT
compatibility: Runs scripts/check.py with Python 3 when code execution is available. Without it, apply the checks in references/quality-bar.md by reading.
metadata:
  author: James Liu
  version: "1.0.0"
  homepage: https://jamesliuzx.github.io/linkedin-operator-notes/workflows/decision-prd/
---

# Decision-ready PRD

Produce two files:

- `prd.json`: the content, in the format described in [references/format.md](references/format.md).
- `prd.html`: a copy of [assets/template.html](assets/template.html) with that JSON placed inside it.

The reader is a reviewer with ten minutes. Reading only the headings should tell them every problem being raised. They should be able to approve or reject each point on its own, and trace any point to its evidence without asking you.

## What you need before writing

1. **Evidence.** Something each point can cite: a teardown, an interview synthesis, a pre-mortem, analytics, support tickets, or the user's own observations.
2. **The product today.** Screens, or a description of current behaviour, for each area the document touches.
3. **Constraints.** Rules, dependencies and dates that are already known.

If the user gives a topic and nothing else, ask for these three in one message, then work with what comes back. Do not ask twice. Mark anything still missing inside the document.

## Stop instead of writing when

- **There is no evidence.** Say so. Offer to run `journey-teardown` or `interview-synthesis`, or ask what the user has observed first hand. Never build a PRD from general knowledge of the product category.
- **A problem cannot be tied to a source.** Cut the point and tell the user which one you cut.
- **The user wants an impact number and there is no baseline.** Write the direction of the change and what to measure. Never invent a figure.
- **There are more than twelve points.** Propose splitting it into two documents by area.

## Procedure

1. **List problems before solutions.** From the evidence, write each problem as a user meets it: an observable situation and what it costs them. No fixes yet.
2. **Group into two to five sections** by where the problem lives, usually a screen or a step of the journey. Number sections 1 to N and points N.n. Once the user has seen an ID, it never changes.
3. **Write each point.** Field by field:
   - `title`: the problem as a statement, under 12 words. It never opens with a building verb (Add, Build, Create, Implement, Introduce, Enable, Improve, Support, Allow, Redesign). The checker knows more, such as Launch, Make, Develop and Ship, so open with the problem.
   - `problem`: one or two sentences. What happens today and its cost. Use counts from research as counts ("5 of 8 customers"). Never turn fewer than 30 people into a percentage.
   - `change`: one or two sentences. The concrete move on a screen. When the wording is the change, quote the exact words the user would read, in quote marks. The checker counts a quoted passage as one phrase.
   - `why`: optional, one sentence, only for a choice a reviewer would otherwise question.
   - `constraint`: when one applies. Label it by kind ("Risk from the pre-mortem", "Dependency", "Needs legal review", "Rule") and say what the design does about it or who has to sign off. A constraint is never a footnote.
   - `evidence`: one to four items in the order today, reference, proposed. Each has a tag, a label, a one-line caption and a screen. A screen is an image the user supplied, or a schematic built from blocks (see the format reference). The checker fails a block the page would leave out because it does not fit. Captions state what the screen shows, not that it is good.
   - `sources`: which inputs the point rests on, with a pointer into each ("S:theme 3, 5 of 8"). Write the pointer in words, never as a bare code such as T3, which clashes with a source coded T. The checker cannot test a pointer, so check each against the input by hand.
   - `know`: the baseline to measure, what should move, and the signal that means stop. If the baseline has not been measured, say that. `expect` is a direction, or a figure marked as an estimate. A decision threshold, such as "stop if it falls 2 points", belongs in `stop`.
4. **Fill the priority table.** One row per point: what it moves, effort as S, M or L, what it depends on with a level (`ok`, `amb` or `no`), and the smallest first step. The first step can be a measurement, not a build. Effort is your estimate, not engineering's, so say that in the caveats. Leave out `screen` on a point when there is no prototype.
5. **Write the rollout.** Rows of when, which points, and why then. Every point appears exactly once. If the brief plans an experiment, put its design in the next steps and any flaw in its guardrails in the caveats. The first row should be small enough to ship on its own, and its reason should say why these points belong together.
6. **Add next steps and caveats.** Who has to do what before work starts, by point ID. State plainly what is estimated, unmeasured or fictional.
7. **Check.** Run `python3 <this skill>/scripts/check.py prd.json`. Fix every error. Keep the warnings to report.
8. **Build the page.** Run `python3 <this skill>/scripts/build.py prd.json prd.html`. Without Python, copy `assets/template.html`, replace the JSON inside the element with id `prd-data` by hand, and write any `</` in the text as `<\/`.

## Writing rules

- Problem and Change are two sentences each at most. Median sentence length near 18 words.
- State a problem as a situation and its cost. Never blame a team, never write "we should".
- State a change as the move itself: "Put a card at the top of Home", not "Improve discoverability".
- Name competitors and sources plainly: "as Pippin does", "5 of 8 interviews".
- Stack caveats where they apply: "not measured yet", "needs confirming with operations", "an estimate".
- Sentence-case headings. Numerals for numbers. No exclamation marks.

## Handing over

Tell the user, briefly:

- the two files and how many sections and points they hold;
- the result of each check, and any warnings;
- which points rest on a single source;
- what only they can fill in, usually the baselines;
- that `flagged-prototype` can turn `prd.json` into a clickable prototype with one switch per point.

A worked example is in [examples/tangelo/](examples/tangelo/): the brief it started from, the `prd.json` and the finished page.
