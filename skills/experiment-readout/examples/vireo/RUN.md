# Test run: the draft-first recap test, 19 November 2026

## Setup

A fresh agent session was given this skill folder and the request. It could read nothing else in the repository. Nobody answered questions, so every unclear point was settled from the skill's text. The test and its numbers are fictional.

## Result

The check script was run twice. Both runs passed. The first run passed on a summary that was six sentences long, which is more than the "two to four" the skill asks for. I shortened it to four sentences and ran the check again.

```
Decision: do-not-trust (Rule 1: sample ratio mismatch, so do not trust the result)
Shared a recap within 24 hours: 8.0 points, interval 7.3 to 8.7
Guardrail, Turned Recap off: held
Guardrail, Recap reported as wrong: held
  PASS  The numbers were computed, not written
  PASS  The split was checked before the result
  PASS  The verdict follows the fixed rule
  PASS  Every figure in the prose is in the numbers
  PASS  Guardrails that did not hold are named
  PASS  Early stopping is called out
  ----  The counts are the right counts (yours to judge)
6 of 6 scripted checks passed
```

The readout said do not trust. The groups were 31,204 and 28,975 hosts when an even split was planned, and the script says chance does not explain that. The data team's remark that the two groups were logged at different moments is a likely cause, so the 8.0 point gain and the fall in both guardrails cannot be believed yet.

## What the run noticed about the skill

- `check.py` does not enforce the "two to four sentences" limit on the summary. A six sentence summary passed. Either enforce it or say it is advice.
- Nothing in SKILL.md says what to do with a remark like the data team's logging note. The agent had to connect it to the failed split on its own. A line telling the agent to name the likely cause in the summary, and what to ask for, would help.
- In this case the guardrails fell, which is good, but the skill says to write a fall as "a fall of 2.6 points". It does not say how to word a good move on a guardrail. The agent left the sizes out to stay safe.
- `counted_on` is optional, and the request gave no date for the counts. The skill says to ask about the 24 hour window, but nobody could be asked. It does not say what to write in the file when the answer is unknown.
- The skill says to use `null` for missing items "if the format allows it", but format.md does not list which fields allow it.
- The prose check is strict about digits. "50/50" and "14 days" are risky to quote. The skill does not say which input figures are safe to repeat.
- The reasons from the script for a failed split include "Fix how users are assigned", while this case pointed at logging. The skill should say reasons are a base, not a diagnosis.
- Handing over says to give "each line of check.py". The final reply format is not tied to RUN.md, so it is unclear whether the line with dashes should be shown as is.

## What this does not show

This was one run by one agent on one invented case, so it says little about how the skill behaves on other cases. The agent knew the answer would probably be a failed split, because the request hinted at it. A real user may bury such a remark deeper. The run did not test the page in a browser, only that it built. It also did not test the cases that stop before a readout, such as three arms.
