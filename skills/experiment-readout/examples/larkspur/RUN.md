# Test run: the share-by-link test, 19 November 2026

## Setup

A fresh agent session was given this skill folder and the request. It could read nothing else in the repository. Nobody answered questions, so every choice came from the skill's text. The test, the company and all the numbers are fictional.

## Result

The check passed on the first run, so it took 1 check run.

```
Decision: ship (Rule 5: positive and every guardrail held, so ship)
Second active person within 7 days: 4.0 points, interval 2.8 to 5.2
Guardrail, Converted to paid within 30 days: held
Guardrail, Reported an unwanted invite: held
Guardrail, Turned sharing off: held
  PASS  The numbers were computed, not written
  PASS  The split was checked before the result
  PASS  The verdict follows the fixed rule
  PASS  Every figure in the prose is in the numbers
  PASS  Guardrails that did not hold are named
  PASS  Early stopping is called out
  ----  The counts are the right counts (yours to judge)
6 of 6 scripted checks passed
```

The readout said ship. A second active person within 7 days rose 4.0 points, and even the low end of the interval, 2.8 points, is above the 2 points the team set. The split was fine, the test ran its full 21 days and had the power to see the effect, and all three guardrails held.

## What the run noticed about the skill

- The skill says "Ask" about the outcome window, but the agent cannot ask. The request gave the pull date, so `test.counted_on` was filled in. The skill does not say what to do when no date is given.
- `counted_on` appears only in format.md as optional. SKILL.md step 1 should point to it, since the window rule is stated there.
- The request had two windows: 7 days for the main metric and 30 days for conversion. The format has one `counted_on` field. Nothing says whether the longer window is the one to check.
- The skill does not say where to save `results.json`. The task named a path, but a user with no path would have to guess. The same is true of `readout.numbers.json`.
- The per-order caveat is in the rules, but the skill does not say it can be skipped when every guardrail is per workspace. The run left it out for that reason, and had no way to confirm that was right.
- This case had a guardrail whose interval came within 0.1 points of its tolerance. The script raises no flag for that, so the agent put it in the next steps by its own judgment. A "close to tolerance" flag could help.
- The skill does not say how to quote a guardrail interval that crosses zero in plain words, so the agent avoided quoting them.

## What this does not show

One run on one fictional case with a clean result shows that the steps can be followed. It does not show how the skill behaves with a failed split, an early stop or a missing target effect. The agent was one model, not several. No real person read the page or the summary to see if it was clear. The checker passed first time, so this run says little about how well it helps an agent fix mistakes.
