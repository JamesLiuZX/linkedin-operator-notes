# Test run: the reorder card test, 18 November 2026

A check on whether the skill works when it is all an agent has. It was run twice, and the readout in this folder is from the second run, unedited.

## Setup

A fresh agent session was given this skill folder and the request in `input/request.md`: the counts for a two-week test, written the way a product manager would paste them from a dashboard. It could read nothing else, and nobody was available to answer questions. The test and its numbers are fictional.

The agent wrote `input/results.json` from the request, ran the script, wrote the headline, summary and next steps, and ran the checker.

## Result

Both runs passed on the first run of the checker.

```
Decision: extend (Rule 6: positive but a guardrail is unclear, so extend)
Ordered within 7 days: 1.7 points, interval 0.8 to 2.6
Guardrail, Orders with 15 or more items: unclear
Guardrail, Orders with a substitution complaint: held
Guardrail, Orders cancelled before delivery: held
  PASS  The numbers were computed, not written
  PASS  The split was checked before the result
  PASS  The verdict follows the fixed rule
  PASS  Every figure in the prose is in the numbers
  PASS  Guardrails that did not hold are named
  PASS  Early stopping is called out
  ----  The counts are the right counts (yours to judge)
6 of 6 scripted checks passed
```

The arithmetic is not the agent's. `scripts/ab_stats.py` computes every figure, `scripts/test_ab_stats.py` holds 42 tests on it, and the checker reruns it on the counts stored inside `readout.json` and compares.

## What the first run found wrong with the skill

Thirteen points. The one that mattered most: the team had said the smallest lift worth shipping is 1 point, the interval ran from 0.8 to 2.6, and nothing in the skill reacted. With every guardrail held, rule 5 would have said ship without a word about it.

| Found | Fixed by |
|---|---|
| A clear win whose interval reaches below the effect worth shipping raised nothing | The script now raises it as a flag, with three tests. It does not change the decision, and the skill says why |
| The power check came back inadequate and no instruction said what to do | Say so in the summary, whatever the result |
| The handover list of things that weaken a result left out low power and a low interval | Both are listed |
| Nothing said to write `title` and `date` | The procedure says so |
| How far a figure may be rounded was not stated | A figure matches when it equals a computed number rounded to the decimals you wrote |
| The script's own sentences write a fall as a negative number | Write "a fall of 2.6 points" in the prose |
| A metric with a 7-day window needs every user to have had the 7 days | It is now a question to ask before starting |
| A guardrail counted per order compares groups the test itself changed | Named in the quality bar and in the rules |

## What the second run found

Twelve smaller points. The ones that changed the skill:

| Found | Fixed by |
|---|---|
| Putting the JSON into the page by hand is error-prone | `scripts/build.py` does it |
| "Extend" came with no way to say for how long | The script does not size an extension. Use the user's length or propose the planned one, and say it is a proposal |
| The day the counts were taken had nowhere to go | An optional `test.counted_on` in the input |
| Tolerances given in points are easy to enter 100 times too large | The procedure says 1 point is `0.01` |
| A product manager will ask whether they can ship anyway | Say the worst the interval allows. Accepting it is their call, and the readout still says what the rule says |

Left as they are, and worth knowing:

- **Nothing checks the page against the file.** The checker reads `readout.json`. If you edit `readout.html` by hand afterwards, nothing notices.
- **The extension is not sized.** "Run 14 more days" in this example is the agent's proposal: the planned length again. Nothing computes how long the guardrail needs.
- **Power does not gate the decision.** This test could detect 1.3 points and the team wanted 1.0. That is reported and flagged, and the rule still fires on the interval.

## What this does not show

Two runs, one test, one model. The checker proves the numbers were computed and the sentences match them. It cannot see where the counts came from, whether bots were filtered, or whether the metric is the right one. The statistics are for a two-arm test on a rate, read once at a planned end. More arms, revenue per user, or a test that was watched daily and stopped on a good day need a different method, and the skill says so and stops.
