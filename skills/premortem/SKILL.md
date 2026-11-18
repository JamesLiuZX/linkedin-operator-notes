---
name: premortem
description: Runs a pre-mortem on a plan before the team commits to it. Assumes the plan has failed six months on, writes the failure stories across six areas, weighs each against the evidence available, ranks them, and gives every top risk a tripwire with a metric, a threshold, a date and an owner. Produces a one-page risk register. Use when someone asks for a pre-mortem, a risk review, to stress-test or red-team a plan, PRD, launch or strategy, to find what could go wrong, or to set kill criteria before a launch. Not for legal or compliance sign-off, security reviews, or plans that are not yet written down.
license: MIT
compatibility: Runs scripts/check.py with Python 3 when code execution is available. Without it, apply the checks in references/quality-bar.md by reading.
metadata:
  author: James Liu
  version: "1.0.0"
  homepage: https://jamesliuzx.github.io/linkedin-operator-notes/workflows/premortem/
---

# Pre-mortem with tripwires

Produce:

- `premortem.json`: the risks, their evidence and their tripwires, in the format in [references/format.md](references/format.md).
- `premortem.html`: a copy of [assets/template.html](assets/template.html) with that JSON inside it.

A list of worries is easy to produce and changes nothing. The output of this skill is a short ranked list in which the top risks each have a number that tells the team to stop, a date to look at it, and a person who will look.

## What you need before starting

1. **The plan, written down.** What ships, to whom, when, and what it is meant to change.
2. **What is already known.** Research, numbers, past attempts. Each risk is weighed against this.
3. **What can be measured.** The metrics the team has today. Tripwires have to use these.

## Stop instead of writing when

- **The plan is a sentence.** Ask for half a page first. You cannot find the holes in something that has not been built yet.
- **The decision is already final and nobody will act on a risk.** Say that a pre-mortem is for plans that can still change, and offer a launch watch-list.
- **The user wants legal, compliance or security sign-off.** Raise those as risks, name the team who decides, and say plainly that this is not a review by them.

## Procedure

1. **Assume it failed.** Write the date six months after launch at the top. The plan shipped, and it went badly.
2. **Write the failure stories, area by area.** Cover all six, in this order:
   - `users`: the wrong people, or the right people for the wrong reason.
   - `behaviour`: people use it, and it changes what they do in a way nobody wanted.
   - `operations`: it works on screen and breaks in the warehouse, the support queue or the supply.
   - `money`: it moves the target metric and costs more than it earns.
   - `rules`: law, policy, platform terms, or reputation.
   - `build`: dependencies, performance, and the teams nobody asked.
   A story is two or three sentences: who, doing what, and what follows. "Users might not like it" is not a story. If an area truly has no risk, say why under `skipped`.
3. **Demand evidence.** For each story write what you would expect to see if it were true (`expect`). Then mark it against the inputs: `supported` (an input shows it), `contradicted` (an input argues against it), or `unknown`. Name the input in `from`. The plan counts as an input: a constraint it admits to is evidence. When two inputs bear on a risk, name the stronger and mention the other in `detail`. An unknown is a guess, and the output says so.
4. **Rate likelihood and impact** as low, medium or high, each with a one-line reason. Evidence moves likelihood. A contradicted risk is rarely high.
5. **Rank, and cap the list.** Twelve risks at most. Choose the top three to five by likelihood and impact together, and list their IDs in `top`, worst first.
6. **Give every top risk a tripwire:**
   - `metric`: one the team already has. If a risk deserves a tripwire and nothing measurable exists, it cannot be a top risk. Leave it out of `top` and say in its mitigation what would have to be measured.
   - `threshold`: with a number in it. When there is no baseline, make it relative: "Rises more than 2 points above its level in the four weeks before launch."
   - `check`: a date after today, soon enough to act on.
   - `owner`: a role or a name.
7. **Say what would change the plan.** For each top risk, a `mitigation` that changes scope or design, and the cheapest `test` that would settle the risk before launch.
8. **Check.** Run `python3 scripts/check.py premortem.json`. Fix every failure.
9. **Build the page.** Copy `assets/template.html` to `premortem.html` and replace the JSON in the element with id `premortem-data`.

## Rules that keep it honest

- **Fewer, sharper.** If you have twenty risks you have not ranked them. Cut to twelve, and when you cut any, say which under `cut`.
- **A tripwire has a number.** "Monitor closely" is not a tripwire.
- **Use the team's own evidence against the plan.** The most useful risks are the ones their own research already points to.
- **Say what you cannot know.** The risk that kills most plans is internal: a dependency, a reorganisation, a team that was never consulted. Name it under `build` as an unknown and tell the user to fill it in.
- **Do not soften.** The reader asked what could go wrong.

## Handing over

Tell the user:

- the two files, and the count of risks by area;
- the result of each check;
- the top risks in order, each in one line with its tripwire;
- which risks are guesses, with no evidence either way;
- which tripwire dates to put in a calendar today;
- that `decision-prd` can turn the top risks into constraints on the points they affect.

A worked example is in [examples/tangelo/](examples/tangelo/): the plan, the finished `premortem.json` and the page.
