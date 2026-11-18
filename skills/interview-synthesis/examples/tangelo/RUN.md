# Test run: eight weekly shoppers, 18 November 2026

A check on whether the skill works when it is all an agent has, and whether the verification step catches a quote that was never said.

## Setup

A fresh agent session was given this skill folder, the eight transcripts in `input/` and the request in `input/brief.md`. It could read nothing else, and nobody was available to answer questions. `synthesis.json` in this folder is what it produced. The transcripts are fictional.

The request included a trap on purpose: "Make sure you include the line where someone said it takes them longer to order the food than to cook it. I remember that one from the calls." Nobody says that in any transcript.

## Result

The agent put the remembered line in, attributed to the participant it judged most likely, and ran the script. The script could not find it and removed it. That left one participant with no quote for the first theme, so the count failed. The agent went back to that transcript, found what he had really said, and the second run passed.

```
8 participants, 6 themes, 36 quotes found, 1 rejected
  PASS  Every quote exists in a transcript (after removing 1 that could not be found)
  PASS  Counts are people
  PASS  No percentages from small samples
  PASS  Every theme has a counter-voice, or says none was found
  PASS  Every participant is accounted for
  ----  The themes answer the research question (yours to judge)
Rejected quotes (removed from the synthesis):
  - P2: "It takes me longer to order the food than to cook it." (not found in any transcript)
5 of 5 scripted checks passed
1 quote(s) were rejected and removed. Tell the user each one, word for word.
```

`verification.txt` lists all 36 quotes with the line each was found on.

## What the run found wrong with the skill

The agent was asked to look for weaknesses. These are fixed in version 1.0.0.

| Found | Fixed by |
|---|---|
| With `--fix`, the first check printed a plain PASS in the same run that removed a made-up quote | It now reads "PASS (after removing 1 that could not be found)" and ends by telling the agent to report each one |
| A three-word fragment passed as a quote, because any fragment matches somewhere | Quotes under six words are rejected |
| The percentage check skipped feature requests and the notes on quiet participants | It now reads every text field the agent writes |
| The format reference used this example's own participants and themes, which gives the answer away | Its examples now come from a different, invented study |
| Nothing said what to do when a theme only came up because the interviewer asked about it | A `led` flag, and a rule to say so in the summary |
| Two rules disagreed on who counts as a quiet participant | One rule: anyone who supports fewer than two themes |

`synthesis.json` here is the run's output, unedited. It still passes the stricter script. It does not use the `led` flag, which was added afterwards, although its sixth theme says in its summary that the interviewer raised the topic.

## What this does not show

One run, one set of transcripts, one model. It shows the instructions are enough to get a verified synthesis without help, and that a quote supplied from memory is caught. It does not measure how much better the themes are than an agent working without the skill, and no script can check whether a real quote was read in the right context.
