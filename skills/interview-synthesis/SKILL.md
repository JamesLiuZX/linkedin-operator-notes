---
name: interview-synthesis
description: Synthesises a set of user interview transcripts into themes in which every claim states how many participants said it and every quote is checked, word for word, against the transcript it came from by a bundled script. Produces a synthesis page with counts, verified quotes that link to their transcript line, the disagreements, a coverage grid and what is still unknown. Use when someone has interview, user research or customer call transcripts and wants a synthesis, themes, insights, findings, a research readout or quotes they can trust. Not for a single interview, for surveys or numbers, or for summarising a meeting.
license: MIT
compatibility: Runs scripts/verify_quotes.py with Python 3 when code execution is available. Without it, every quote has to be checked by reading the transcript, and the output must say the quotes were not machine-checked.
metadata:
  author: James Liu
  version: "1.0.0"
  homepage: https://jamesliuzx.github.io/linkedin-operator-notes/workflows/interview-synthesis/
---

# Interview synthesis with receipts

Produce:

- `synthesis.json`: themes, counts, quotes and unknowns, in the format in [references/format.md](references/format.md).
- `verification.txt`: the script's log of every quote: where it was found, or that it was rejected.
- `synthesis.html`: a copy of [assets/template.html](assets/template.html) with the JSON inside it.

The reader will be asked "how many people actually said that?" and "is that really what they said?". This output answers both without anyone going back to the recordings.

## What you need before starting

1. **Transcripts,** one text file per interview. Speaker labels help. One utterance per line is best.
2. **The research question.** What decision is this for?
3. **Who each participant is,** if known: segment, tenure, plan.

## Stop instead of writing when

- **There are fewer than four interviews.** Say that themes need more than three people, and offer a per-interview summary.
- **The transcripts contain personal data the user may not be allowed to process,** such as full names, addresses, account numbers or health details. Ask before reading further.
- **Someone asks for percentages from fewer than 30 people.** Give counts. "5 of 8", never "63%".

## Procedure

1. **Read every transcript in full,** one at a time, before naming any theme. Note for each line what the person is doing, wanting or struggling with. No sampling and no skimming to the "good bits".
2. **Name themes from what you noted.** A theme is a behaviour or a need, written as what people do: "Rebuilding the basket feels like admin". A feature request is not a theme. Record requests separately.
3. **Keep unprompted topics apart.** If participants raised something the interviewer's question did not name, list it under `unprompted`. An answer to "anything else?" counts as unprompted. It is often the most useful finding and the first to be lost. The reverse matters too: when a theme only came up because the interviewer asked about it directly, set `"led": true` on it and say so in its summary. `led` is one flag for the whole theme. When it is split, with some participants asked and others raising it themselves, leave it false and name who was asked in the summary. Something a person said only when asked about it is not unprompted.
4. **Count people, not mentions.** `support` lists the participants who expressed the theme. One person saying it five times counts once.
5. **Pull a quote for every supporting participant,** one or two each. Copy it from the transcript exactly: 6 to 40 words from a single line. Do not tidy it, join two utterances, or fix the grammar. A quote the user gives you from memory goes in like any other and gets checked like any other. If they name nobody, search the transcripts for it first and use the speaker you find. If you find nothing, attribute it to the most likely participant, say that this was a guess, and expect it to be rejected.
6. **Find the counter-voice.** For every theme ask who said the opposite, or for whom it was not a problem. Put the clearest such quote in `counter`. If more than one person disagreed, name the others in `counterNote`. If nobody did, say so there.
7. **Write the so-what.** One sentence per theme on what it means for the decision.
8. **List what is still unknown:** questions the interviews raise and cannot answer, each with who or what to ask next.
9. **Verify.** Run `python3 <this skill>/scripts/verify_quotes.py <path to synthesis.json> <transcripts folder> --fix`. It finds each quote in its participant's transcript, records the line number and a few lines of context, removes any quote it cannot find, logs the removal under `rejected`, and writes `verification.txt` beside `synthesis.json`. Then it re-checks the counts.
10. **Repair what the verification broke.** If a theme lost a supporter's only quote, go back to that transcript. Either find the real words and add them, or remove the participant from `support`. Run the script again until it passes. Never restore a rejected quote by rewording it.
11. **Build the page.** Run `python3 <this skill>/scripts/build.py synthesis.json synthesis.html`. Without Python, copy `assets/template.html`, replace the JSON inside the element with id `synthesis-data` by hand, and write any `</` in the text as `<\/`.

## Rules that keep it honest

- **Inside quote marks, only their words.** Paraphrase belongs in the summary.
- **A count is a list of names.** If you cannot list the participants, you do not have the count.
- **Keep the disagreement.** A synthesis in which everyone agrees was not read closely.
- **Quiet participants are data.** Anyone who supports fewer than two themes is listed under `quiet` with a note on why, never dropped. That includes someone who supports none but is the counter-voice on several.
- **Honour the user's house style** in everything you write. Quotes are the exception: they stay exactly as said.
- **Eight people are not the market.** Say what was heard. Do not say what customers in general think.

## Handing over

Tell the user:

- the three files, and the counts: participants, themes, quotes found, quotes rejected. Quotes found counts every verified quote, so it is higher than the supporters in the themes;
- the result of each check;
- every rejected quote, word for word, and the theme it came from. The script prints both. If the user supplied a quote and it was rejected, say that first and plainly: it is not in the transcripts;
- the two or three themes that bear most on their question, each with its count;
- that the script proves the words were said, not that they mean what the theme says. Suggest they open the context of the quotes their decision rests on;
- that `decision-prd` can cite `synthesis.json` in its Problem lines.

A worked example is in [examples/tangelo/](examples/tangelo/): eight transcripts, the brief, the finished `synthesis.json` and the verification log.
