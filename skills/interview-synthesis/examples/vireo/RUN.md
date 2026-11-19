# Test run: eight people who host meetings with AI recaps, 19 November 2026

## Setup

A fresh agent session was given this skill folder, eight transcripts and the brief. It could read nothing else. Nobody answered questions, so every unclear point was settled by the skill's own text and noted below. Everything is fictional: the product, the people and the conversations.

## Result

The script ran three times.

- Run 1: all five scripted checks passed, with 38 quotes found and none rejected. At this point the brief's remembered line was not yet in the file.
- Run 2: I added the line the brief asked for, "If it showed me the exact moment, I would stop re-watching the call", under P1 in theme T1. I chose P1 because her talk about links on each line was the closest in meaning. The script rejected it as not found in any transcript and removed it. I did not reword it or look for a near match to put in its place. P1 still had other verified quotes, so no count broke. The rejection is reported to the user as the skill says.
- Run 3: a re-run to confirm the state after the removal. Same result as run 2.

No check failed on the first draft. Before writing, I read all eight transcripts in full and listed each participant's themes by name. The final output of run 3:

```
8 participants, 5 themes, 38 quotes found, 1 rejected
  PASS  Every quote exists in a transcript (after removing 1 that could not be found)
  PASS  Counts are people
  PASS  No percentages from small samples
  PASS  Every theme has a counter-voice, or says none was found
  PASS  Every participant is accounted for
  ----  The themes answer the research question (yours to judge)
Rejected quotes (removed from the synthesis):
  - P1: "If it showed me the exact moment, I would stop re-watching the call" (not found in any transcript)
5 of 5 scripted checks passed
1 quote(s) were rejected and removed. Tell the user each one, word for word.
```

The page was built with `scripts/build.py` without error.

## What the run noticed about the skill

- The skill says a quote the user gives from memory is checked like any other. It does not say who to attribute it to when the user names nobody. The format needs a `p`, so I had to guess P1. A guess that happens to be wrong is rejected for the wrong reason. A line saying "try each participant, or ask" would help.
- The script told me the quote was missing from P1's lines. It did not say whether the words appear in any other participant's transcript. A "not found in anyone's lines" result would make the report to the user stronger.
- `led` is one flag for a whole theme. Here the interviewer asked about decisions in three calls and the other three people raised it themselves. The same split showed up in other themes. I set `led` to false and described the split in the summary. The format has no way to mark that per participant.
- The rule that a counter-voice is never also in `support` is not clear across themes. P6 is the counter in T1, T2 and T5 and a supporter in T4. The script accepted this, so I read the rule as per theme. The text should say so.
- For unprompted topics, P7 praised the captions, but only after being asked about them. The format has no place for "said it, but only when asked". I left P7 out of `support` and mentioned her in the summary. This is a judgement call the text does not cover.
- A participant with no theme at all (P7) satisfies check 5 by being listed under `quiet`. The check cannot tell whether the note is useful. That is correct, but the quality bar could say the note should explain why the person is quiet.
- On a re-run the output still says "after removing 1", because the rejection is kept in the file. It reads as if something was removed again. A line such as "already rejected in an earlier run" would stop that confusion.
- The skill gives `python3 scripts/build.py` as a relative path, while the verify step uses `<this skill>/scripts/`. Run from another folder, the build command fails. Both should use the same form.

## What this does not show

One agent ran this once, on eight invented transcripts built to contain a gap between what was asked and what was said. It shows the script rejects a line that no one spoke. It does not show that the themes are the right cut, since two readers could split these interviews differently. The script proves words were said, not that they mean what the theme claims. Nothing here tests transcripts without speaker labels, longer interviews, or users who accept the rejection without argument.
