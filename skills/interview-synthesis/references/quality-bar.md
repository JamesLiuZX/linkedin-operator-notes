# The quality bar

A synthesis from this skill is not handed over until these hold. Five are checked by `scripts/verify_quotes.py`. One is yours.

| # | Check | Who checks | What fails it |
|---|---|---|---|
| 1 | Every quote exists in a transcript | Script | A quote not found, word for word, in the lines of the participant it is attributed to, or one shorter than six words. With `--fix` such quotes are removed and listed, and the check then reads "PASS (after removing N)" |
| 2 | Counts are people | Script | A participant in `support` with no verified quote in that theme, a quoted participant missing from `support`, or a participant with more than two quotes in one theme |
| 3 | No percentages from small samples | Script | A percentage in any text you wrote (themes, unprompted topics, requests, quiet notes, unknowns) when there are fewer than 30 participants |
| 4 | Every theme has a counter-voice, or says none was found | Script | A theme with neither a counter quote nor a counter note |
| 5 | Every participant is accounted for | Script | A participant who supports fewer than two themes and is not listed under `quiet`. The note should say why the person is quiet |
| 6 | The themes answer the research question | You | Read the top three themes against the decision you have to make |

## Why these six

1. **Quotes exist.** A model summarising eight transcripts will sometimes produce a sentence that sounds exactly like a participant and was never said. It is the failure researchers fear most, and the one a script can rule out completely.
2. **Counts are people.** "Most users" is how one loud participant becomes a finding. A count that has to be backed by one quote per person cannot drift.
3. **No percentages.** "63% of customers" from eight interviews will be quoted as a statistic by the third meeting.
4. **A counter-voice.** Agreement is easy to produce and usually false. Forcing the question "who said the opposite?" is what keeps a real disagreement in.
5. **Everyone accounted for.** Talkative participants dominate. Listing the quiet ones shows whether a view is missing because nobody held it or because nobody quoted it.
6. **Answers the question.** This is the judgment the script cannot make.

## What the script does not see

- **Context.** It proves the words were said. It cannot prove they meant what the theme claims. Every quote on the page opens the lines around it, for that reason.
- **Whether the themes are the right ones.** Two readers can cut the same interviews differently.
- **Leading questions.** If the interviewer asked "isn't reordering annoying?", agreement is weak evidence. Read the context.
