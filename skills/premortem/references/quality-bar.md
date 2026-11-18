# The quality bar

A pre-mortem from this skill is not handed over until these hold. Five are checked by `scripts/check.py`. One is yours.

| # | Check | Who checks | What fails it |
|---|---|---|---|
| 1 | Every top risk has a complete tripwire | Script | A top risk missing its metric, owner or date, a threshold with no number in it, a date that is not after the plan's date, or a top risk with no mitigation or test |
| 2 | Evidence is labelled | Script | A risk whose evidence is not marked supported, contradicted or unknown, one that cites an input that does not exist, or one that does not say what you would expect to see |
| 3 | All six areas were considered | Script | An area with no risk and no line under `skipped` saying why |
| 4 | The list is short enough to act on | Script | More than twelve risks, fewer than three or more than five in `top`, or more than five risks rated high on both likelihood and impact |
| 5 | Every risk is a story | Script | A story under 25 words or over 90, or a likelihood or impact with no reason |
| 6 | Tripwires use metrics you have | You | Check each metric exists in your dashboards today |

## Why these six

1. **Complete tripwires.** A risk without a number, a date and an owner is a worry. The tripwire is the part of a pre-mortem that survives the meeting.
2. **Labelled evidence.** It separates what your own research already warns about from what the model imagined. Both are worth having. They are not worth the same.
3. **Six areas.** Left alone, a pre-mortem lists the risks the team already talks about. The areas force a look at operations, money and build, where plans more often fail.
4. **A short list.** Twenty risks is the same as none. The cap forces the ranking, and the ranking is the work.
5. **Stories.** "Adoption may be low" cannot be argued with or acted on. Who, doing what, and what follows can.
6. **Metrics you have.** A tripwire on a number nobody collects will never fire. Only you know which numbers exist.

## What the checker does not see

- Whether the likelihoods are right. They are judgments.
- The risks inside your own organisation. Add them.
- Whether anyone will act when a tripwire fires. Put the dates in a calendar.
