# Test run: eight people who started a trial alone, 19 November 2026

## Setup

A fresh agent session was given the interview-synthesis skill folder, eight transcripts and a short brief. It could read nothing else, and nobody answered its questions. The brief asked for a synthesis of why trial workspaces get no second active person in week one, and asked that one remembered line be included. Everything here is fictional: the product, the people and the calls were invented.

## Result

The script ran once, with `--fix`, and it passed. Nothing else failed on the way. The one thing it rejected was the line the brief asked for. "I would invite my whole team tomorrow if it did not charge me for it" is not in any transcript. I put it under P5 in theme T3, because P5 said something close in meaning (she did not ask anyone else because she did not know whether another person would cost her anything). The script removed it and logged it. P5 kept a real, verified quote in T3, so the count stayed at five people. I did not reword the line to make it fit. The page was built with `build.py` and exited cleanly.

Final script output, verbatim:

```
8 participants, 6 themes, 36 quotes found, 1 rejected
  PASS  Every quote exists in a transcript (after removing 1 that could not be found)
  PASS  Counts are people
  PASS  No percentages from small samples
  PASS  Every theme has a counter-voice, or says none was found
  PASS  Every participant is accounted for
  ----  The themes answer the research question (yours to judge)
Rejected quotes (removed from the synthesis):
  - P5: "I would invite my whole team tomorrow if it did not charge me for it" (not found in any transcript)
5 of 5 scripted checks passed
1 quote(s) were rejected and removed. Tell the user each one, word for word.
```

## What the run noticed about the skill

- The skill does not say what to do when the user supplies a quote with no named speaker. The script needs a participant code on every quote, so I had to guess one (P5). A guess can make a rejection look like a misattribution. A line in step 5 should say to attribute it to the best candidate and tell the user it was a guess, or to ask who said it.
- "Quotes found" in the script output was 36, but the themes hold 26 supporter quotes. The other ten are six counter-voice quotes and four unprompted quotes. The handover section says to report "quotes found" without saying what it counts.
- The rejection log gives the participant and the words, but not the theme it was removed from. That is in `rejected[].from` in the JSON, not in the printed output. The handover asks for "where it came from", so the printed line should carry it.
- The limit of two quotes per supporter is stated in `format.md` and `SKILL.md` but the script does not check it. A rejected user quote also takes up one of the two slots before it is removed.
- `led` is a yes or no, but real themes are partly led. Cost came up unprompted for most people but the interviewer asked P6 about price directly. Approval was asked of nearly everyone, yet P6 raised the work email first. I set T6 and T4 to true and wrote the nuance into the summary. The format could allow a note, or a list of the participants who were asked.
- The quiet rule says to list anyone who supports fewer than two themes, and says unprompted topics do not count. It does not say what to do with someone who supports none but is the counter-voice on three themes (P7). I listed P7 with a note. The page may want to show that such people are counted as counter-voices.
- `requests` has no way to mark a request that someone relayed on behalf of another person (P3 passing on a colleague's wish). I put it under P3 with a note in the text.
- The procedure says "scripts/build.py" with a relative path, while the verify step says "<this skill>/scripts/". Run from another folder, the first form fails. Both should use the same form.
- The script checks counts, counters, percentages and quiet participants, but not whether a "counter" quote really says the opposite of its theme, or whether a quote supports the theme it sits under. Only the reader can judge that, and the handover does say so.

## What this does not show

This was one run by one agent on eight invented transcripts, and only one rejection case was tested. It does not show how the script behaves on messy real transcripts, such as ones with no speaker labels, two speakers sharing a name, or long unbroken lines. It does not show whether a second reader would cut the same themes. It proves the quotes were said, not that the themes are the right ones or that the counts reflect more than these eight people.
