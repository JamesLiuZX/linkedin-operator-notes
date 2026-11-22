---
name: experiment-readout
description: Reads out a finished two-arm A/B test as one decision (ship, extend, stop or do not trust) using a bundled, tested script that checks the sample ratio before anything else, then computes the effect with its confidence interval, the power the test actually had, and a verdict on each guardrail. The model explains the result and never does the arithmetic. Use when someone shares experiment results, conversion counts per variant, a dashboard export or a screenshot of a test, or asks whether a test won, is significant, can be trusted or should ship. Not for designing or sizing a test in advance, for tests with more than two arms, or for metrics that are not rates, such as revenue per user.
license: MIT
compatibility: Needs Python 3 with code execution to run scripts/ab_stats.py and scripts/check.py. Without it, do not compute anything by hand. Say that the numbers could not be checked and stop.
metadata:
  author: James Liu
  version: "1.0.0"
  homepage: https://jamesliuzx.github.io/linkedin-operator-notes/workflows/experiment-readout/
---

# Honest experiment readout

Produce:

- `results.json`: the test as the user described it, in the input format in [references/format.md](references/format.md).
- `readout.json`: the script's numbers, plus a headline, a summary and next steps written by you.
- `readout.html`: a copy of [assets/template.html](assets/template.html) with `readout.json` inside it.

The order matters. The test is checked before the result is looked at, because a broken test produces a convincing wrong answer.

## What you need before starting

1. **Counts, not percentages.** Users in each arm, and how many of them converted. If the metric has a window, such as ordered within 7 days, the counts have to be taken after the last user's window has closed. Ask, and record the day the counts were pulled in `test.counted_on`. If there are two windows, use the longer. If nobody can be asked, leave `counted_on` out and write in the summary or next steps that the window was not confirmed.
2. **The plan.** The intended split (for example 50/50) and how many days the test was meant to run. And how long it did run.
3. **Guardrails.** The metrics that must not get worse, with their counts, which direction is harmful, and the largest harmful change the team would accept.
4. **The smallest effect worth shipping,** set before the test. If nobody set one, record that as missing. Do not invent one afterwards.

If only percentages are given, ask for the counts. If the counts cannot be had, stop: an interval cannot be computed from a percentage.

## Stop instead of reading out when

- **There are more than two arms,** or the metric is not a rate. Say what kind of analysis it needs and who usually does it.
- **The test is still running and the user wants to know whether to stop.** Explain that looking early and stopping on a good day inflates false wins. Offer to read it out at the planned end.
- **You cannot run the script.** Never estimate a p-value or an interval yourself.

## Procedure

1. **Write `results.json`** from what the user gave you. Copy the numbers exactly. Tolerances and the smallest effect worth shipping are proportions, so 1 point is `0.01`. Only `mde_set` may be `null`, and `denominators` may be left out. If anything else is missing, ask, or stop. Save the files beside the user's input unless they name a path.
2. **Run the script:** `python3 <this skill>/scripts/ab_stats.py results.json --out readout.numbers.json`. It prints the numbers and writes the same JSON to the file. It refuses impossible inputs, such as more conversions than users. Fix the input, never the output.
3. **Read the checks before the result.** In this order:
   - `checks.srm`: was the split what was planned? If it fails, the decision is "do not trust", whatever the result looks like. The cause is usually in assignment or logging, so say that. The script's reasons are a starting point, not a diagnosis. If the user gave a remark that points at a cause, such as a logging note, name it in the summary and say what you would ask for to confirm it.
   - `checks.duration`: did it stop early, and did it cover whole weeks?
   - `checks.power`: the smallest effect the test could reliably detect, beside the smallest effect the team cares about. If `adequate` is false, the test was too small for the effect the team set. Say so in the summary, whatever the result.
4. **Read the result and the guardrails.** The script has already decided. `verdict.decision` is one of `ship`, `extend`, `stop`, `do-not-trust`, and `verdict.rule` names the rule that fired. You do not overrule it. Read `flags` as well. Each one is a reason to read the result with care, and each goes into the summary or the next steps in your own words.
5. **Write `readout.json`:** put the script's whole output under `numbers`, unchanged. Add `title` (the test's name, then the word readout) and `date` (the day you write it). Then add:
   - `headline`: one sentence that starts with the decision in words (Ship, Extend, Stop, or Do not trust) and gives the main reason.
   - `summary`: two to four sentences for someone who does not read statistics. What happened to the main metric, what the guardrails did, and why that leads to the decision.
   - `next`: two to four concrete steps. When the decision is to extend, say for how long, set the new end date now, and say the test is read once, on that date. The script does not size an extension. Use the length the user gives, or propose repeating the planned length and say it is a proposal. If the metric has a window, the counts are taken after the last user's window closes.
   Use only figures that appear in `numbers`, rounded the way a person would say them. Percentage points for differences, one decimal. A figure matches when it equals a computed number rounded to the decimals you wrote. Write a fall as "a fall of 2.6 points", not as a negative number. Write a good move the same way, such as a fall where harm is a rise. Safe figures to repeat are any number in `numbers`, including the planned split as percentages (50/50), the planned and actual days, and the arm total. Anything else will fail the check. If a guardrail interval crosses zero, say "the interval runs from a fall of 0.3 points to a rise of 0.9 points". When a rounded change equals the tolerance, quote the interval, because the interval is what decides.
6. **Check:** `python3 <this skill>/scripts/check.py readout.json`. It recomputes everything from the input inside the file and compares, and it checks your sentences against the numbers. Fix every failure.
7. **Build the page:** `python3 <this skill>/scripts/build.py readout.json readout.html`. It copies `assets/template.html` and puts `readout.json` inside it.

## Rules that keep it honest

- **The script decides, you explain.** If you think the rule is wrong for this case, say so in the summary. Do not change the decision.
- **A failed sample ratio ends the readout.** Do not report the lift as if it might be real.
- **"Not significant" is not "no effect".** When the test lacked power, say it could not have seen the effect, and by how much.
- **An unclear guardrail is not a held guardrail.** If the interval reaches past the tolerance, the harm has not been ruled out.
- **Never call a result "almost significant".**
- **Say what a per-order guardrail cannot tell you.** Skip this when every guardrail is counted per user or workspace. When a guardrail is counted per order, the test has changed who orders. Its share can move because new orders were added, with no existing order changing. Tell the user.
- **Shipping against the rule is the user's call.** If they ask whether they can ship anyway, say the worst the interval allows and that accepting it is theirs to decide. The readout still says what the rule says.
- **Plain words.** "The order rate rose 1.7 points" before any p-value. Keep the statistics in the page for those who want them.

## The decision rules

Fixed in the script, first match wins.

| # | When | Decision |
|---|---|---|
| 1 | The sample ratio check fails | Do not trust |
| 2 | Any guardrail is clearly worse | Stop |
| 3 | The main metric is clearly worse | Stop |
| 4 | The main metric is better, but the test stopped early | Extend |
| 5 | The main metric is better and every guardrail held | Ship |
| 6 | The main metric is better and a guardrail is unclear | Extend |
| 7 | No clear effect, and the test had the power to see the one that matters | Stop |
| 8 | No clear effect, and the test lacked that power | Extend |

The smallest effect worth shipping does not gate rule 5. A result can be clearly better and still have an interval that reaches below that effect. The script raises it as a flag, and you say it in the summary.

## Handing over

Tell the user:

- the decision and the rule behind it, in one sentence;
- the main result in points, with its interval;
- each guardrail and whether it held;
- anything that weakens the result: an early stop, a part week, a missing target effect, a test too small for the effect the team set, an interval that reaches below that effect;
- the three checks on the test (split, duration, power), and each line of `check.py`, as printed, including its warnings;
- that the page shows every number and how it was reached.

A worked example is in [examples/tangelo/](examples/tangelo/): the input counts, the script's numbers, and the finished readout.
