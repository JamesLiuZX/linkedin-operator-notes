# The quality bar

A readout from this skill is not handed over until these hold. Six are checked by `scripts/check.py`. One is yours.

| # | Check | Who checks | What fails it |
|---|---|---|---|
| 1 | The numbers were computed, not written | Script | Any figure under `numbers` that differs from a fresh run of the script on the input stored in the same file |
| 2 | The split was checked before the result | Script | A missing sample ratio check, or a failed one with any decision other than do not trust |
| 3 | The verdict follows the fixed rule | Script | A decision that differs from the script's, or a headline that does not open with that decision |
| 4 | Every figure in the prose is in the numbers | Script | A number in the headline, summary or next steps that matches nothing the script computed and nothing in the input |
| 5 | Guardrails that did not hold are named | Script | A guardrail whose verdict is worse or unclear and whose name does not appear in the summary |
| 6 | Early stopping is called out | Script | A test that stopped early or ran a part week, with no mention of it in the summary or next steps |
| 7 | The counts are the right counts | You | Know where the numbers came from before you paste them in |

## Why these seven

1. **Computed, not written.** A language model asked for a p-value will produce one. It will look right. This check makes the arithmetic reproducible: anyone can rerun the script on the input in the file and get the same numbers.
2. **The split first.** A sample ratio mismatch means the two groups were not comparable. Every number after it is suspect. Most dashboards do not show it.
3. **A fixed rule.** If the decision could be argued case by case, a test that looks good would always ship. Writing the rule down before reading the result is the whole discipline.
4. **Figures match.** The commonest way a correct analysis becomes a wrong summary is a number retyped from memory.
5. **Guardrails named.** A summary that reports the win and leaves out the guardrail that did not hold is how regressions ship.
6. **Early stops flagged.** A test stopped on a good day overstates its result. The p-value does not know it was stopped.
7. **The right counts.** The script cannot see bots, double-counted users or a tracking change. Precise arithmetic on wrong counts is still wrong.

## What the checker does not see

- Where the counts came from.
- Whether the metric measures what the team cares about.
- Novelty: an effect in the first two weeks that would fade by the eighth.
- Segments. A flat average can hide one group that gained and one that lost.
