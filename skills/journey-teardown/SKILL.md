---
name: journey-teardown
description: Tears down how several products handle the same user journey and lays the result out as a board, stage by stage, with one lane per app, up to three notes on every screen, a score with a reason on five dimensions, and a synthesis per stage that ends in patterns, an ideal flow and prioritised gaps for the user's own product. Builds the board on Miro when a Miro connector is available and always writes a single-file HTML board. Use when someone asks for a competitor teardown, UX benchmark, competitive analysis of screens or flows, or wants to know what good looks like for a journey before proposing changes. Not for market sizing, pricing or company strategy comparisons, and not when there are no screens to look at.
license: MIT
compatibility: Runs scripts/check.py with Python 3 when code execution is available. The Miro board needs a connected Miro connector. Without either, the HTML board and the checks by reading still work.
metadata:
  author: James Liu
  version: "1.0.0"
  homepage: https://jamesliuzx.github.io/linkedin-operator-notes/workflows/journey-teardown/
---

# Journey teardown on a canvas

Produce:

- `teardown.json`: every lane, note, score and synthesis as data, in the format in [references/format.md](references/format.md).
- `board.html`: a copy of [assets/template.html](assets/template.html) with that JSON inside it. A board the reader can pan, zoom and filter.
- A Miro board with the same layout, when a Miro connector is connected. See [references/miro.md](references/miro.md).

The board is organised **by journey stage, not by competitor**. Inside a stage, each row (a lane) is one app's flow, read left to right. The user's own product is always the last lane in a stage, directly under the best examples, so the contrast is in the same place every time.

## What you need before starting

1. **The journey and its stages.** Three to six stages, in the order a user meets them.
2. **Screens.** For each app at each stage: image files, links, or schematic descriptions, each with a capture date. The user's own product included.
3. **One question.** What the user wants to learn. It decides what the notes pay attention to.

If screens are missing, ask for them once. Then work with what you have and record the gaps as coverage. Never describe a screen you have not been given. A lane built from a help page or a store listing says so in its `source`.

## Stop instead of writing when

- **There are fewer than three apps, or no screens.** A teardown of one competitor is an opinion.
- **You are asked to score something you cannot see.** Leave the lane out and list it under coverage.
- **The user wants market share, pricing or strategy.** That is a different piece of work. Say so.

## Procedure

1. **Fix the vocabulary first.** Before reading any screen, write down the four note labels and the five scoring dimensions with their one-line meanings (they are in the format reference). Every later note and score uses only these.
2. **Lay out the lanes.** One per app per stage. Competitors first, the user's product last. Give each lane a `flow` (what it shows), a `source` (where the screens came from and when) and its screens in order, each with a `step` saying what the user is doing.
3. **Annotate each screen, three notes at most.** A note is one sentence that names what is on the screen and says why it matters.
   - **Good:** something others should copy.
   - **Friction:** confusion, a missing disclosure, an extra step, or a dark pattern.
   - **Note:** a neutral observation worth recording.
   - **Idea:** a concrete improvement.
   Quote the on-screen words when they are the point. If you have nothing specific to say about a screen, give it no notes.
4. **Score each lane on the five dimensions,** 1 to 5, whole numbers, relative to the best example seen for that stage. Every score carries a reason of one line. No reason, no score. Score the user's product last and by the same rubric.
5. **Write the lane's verdict.** One sentence in the shape "strength, but weakness". Then two or three things it does well, one to three it does wrong, and for competitors one or two things worth stealing.
6. **Synthesise each stage,** after all its lanes are done:
   - `finding`: one sentence, the thing to remember.
   - `best`: the best one or two apps for this stage and why.
   - `patterns`: what to adopt. Each names the apps it was seen in, at least two.
   - `anti`: what to avoid, with the apps it was seen in.
   - `ideal`: the ideal flow for this stage as two to five numbered steps.
   - `gaps`: where the user's product falls short. Each has a priority (P0, P1 or P2), what it does today, the fix, and the app that shows the fix working.
7. **Write the principles.** Three to six, across all stages, each with the stages it draws on.
8. **State the coverage.** Any lane with fewer than two screens gets a `coverage` line saying why. Any app missing from a stage is listed in that stage's `missing`.
9. **Check.** Run `python3 scripts/check.py teardown.json`. Fix every failure.
10. **Build the board.** Copy `assets/template.html` to `board.html` and replace the JSON in the element with id `teardown-data`. If a Miro connector is available, build the Miro board as described in the Miro reference and give the user its link.

## Rules that keep it honest

- **Notes point at the screen.** "Clean design" is not a note. "The total is the only number on the page" is.
- **Scores rank, they do not measure.** One reader, one sitting. Say so when you hand over.
- **Be as hard on competitors as on the user's product, and no kinder to it.** If the user's product scores best everywhere, look again.
- **A pattern needs two sightings.** One app doing something is a note on its lane.
- **Dates on everything.** A teardown is a photograph. Every lane says when it was taken.

## Handing over

Tell the user:

- the files, and the Miro link if there is one;
- the count of stages, lanes, screens and notes;
- the result of each check;
- the two or three gaps you would look at first, by priority;
- what was not covered and why;
- that `decision-prd` can turn the gaps into numbered points, using `teardown.json` as evidence.

A worked example is in [examples/tangelo/](examples/tangelo/): the input screens, the finished `teardown.json` and the board.
