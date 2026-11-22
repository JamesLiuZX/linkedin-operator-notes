# The synthesis.json format

One JSON object. You write everything except the fields marked "added by the script". The examples below come from an invented study of a library app. They are there for shape, not content.

## Contents

- [Top level](#top-level)
- [A theme](#a-theme)
- [A quote](#a-quote)
- [The other lists](#the-other-lists)
- [How transcripts are read](#how-transcripts-are-read)

## Top level

```json
{
  "title": "Borrowers: why renewals get missed",
  "question": "Why do regular borrowers miss renewal dates, and what would stop it?",
  "date": "2026-03-02",
  "participants": [
    { "id": "P1", "name": "Ines", "profile": "Borrows weekly, member for three years", "file": "P1.txt" }
  ],
  "themes": [],
  "unprompted": [],
  "requests": [],
  "quiet": [],
  "unknowns": [],
  "rejected": [],
  "checked": {}
}
```

- `title` is yours to write. `date` is the day of the synthesis.
- `participants[].id` is the code used everywhere else. `file` is the transcript's file name inside the transcripts folder.
- `rejected` and `checked` are added by the script. Leave them empty. If you could not run the script, set `"checked": { "byHand": true }` so the page says the quotes were not machine-checked.

## A theme

```json
{
  "id": "T1",
  "name": "Due dates are read once and forgotten",
  "summary": "Most participants see the due date when they borrow and do not look at it again until a reminder or a fine.",
  "support": ["P1", "P2", "P4", "P6"],
  "quotes": [],
  "counter": { "p": "P3", "text": "I put every due date in my phone the minute I get home, so it never catches me out." },
  "counterNote": "P5 also said it was not a problem for her.",
  "led": false,
  "so": "A reminder has to arrive when the date matters, because the date itself is not being reread."
}
```

- `name` is a behaviour or a need, under ten words. Not a feature.
- `summary` is one or two sentences in your words. No percentages.
- `support` lists the participants who expressed the theme. Each needs at least one quote in `quotes`, and at most two.
- `counter` is the clearest quote from someone who said the opposite, or for whom it was not a problem. A counter-voice is never also in `support` of the same theme. The same person can be the counter-voice on one theme and a supporter of another. The script checks the two-quote limit. Name any others in `counterNote`. If there was nobody, set `counter` to `null` and say so in `counterNote`, for example "Nobody described the opposite."
- `led` is `true` when the theme only came up because the interviewer asked about it directly. Leave it out or `false` otherwise.
- `so` is one sentence on what the theme means for the decision.

Order themes by how many participants support them.

## A quote

```json
{ "p": "P1", "text": "I only find out it was due when the email about the fine turns up." }
```

- `p` is the participant's code.
- `text` is copied from the transcript exactly: 6 to 40 words from a single line. Do not join two lines. A quote under 6 words is rejected as a fragment.
- The script adds `line` (the line number in the transcript file) and `ctx` (a few lines either side, for the page's context view).

## The other lists

```json
"unprompted": [
  { "id": "U1", "name": "Holds expire while people are away", "summary": "...", "support": ["P2", "P6"], "quotes": [{ "p": "P2", "text": "..." }] }
],
"requests": [{ "text": "Renew everything with one button", "p": ["P1", "P4"] }],
"quiet": [{ "p": "P5", "note": "Supports one theme. Borrows twice a year, so most questions did not apply." }],
"unknowns": [{ "q": "How many loans are renewed after the due date?", "ask": "Loan records for the last quarter." }]
```

- `unprompted` has the same shape as a theme, with IDs `U1`, `U2` and so on, and without `counter`, `led` or `so`. Its supporters need quotes in the same way.
- `requests` are things participants asked for. Record them. Do not turn them into themes.
- `quiet` lists every participant who supports fewer than two themes, with a note on why. Support for an unprompted topic does not count towards the two.
- `unknowns` are questions the interviews raised and cannot answer, each with where the answer could come from.

## How transcripts are read

The script looks for each quote in the lines spoken by that participant. It recognises a speaker label at the start of a line, with or without a timestamp:

```
[04:12] P1: I only find out when the email turns up.
P1: I only find out when the email turns up.
Ines: I only find out when the email turns up.
```

A label matches a participant by code or by name. If a transcript has no labels at all, the whole file is searched and the log says so. Matching ignores differences in spacing, in capitals and in straight or curly quote marks. It does not ignore words: one changed word and the quote is rejected.
