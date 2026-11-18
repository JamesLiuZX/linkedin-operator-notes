# The premortem.json format

One JSON object. The examples come from an invented plan for a library app. They are there for shape, not content.

## Contents

- [Top level](#top-level)
- [A risk](#a-risk)
- [A tripwire](#a-tripwire)
- [Skipped areas](#skipped-areas)

## Top level

```json
{
  "title": "Automatic renewals, six months on",
  "plan": {
    "name": "Automatic renewals",
    "summary": "Renew every loan automatically unless someone else has reserved the book.",
    "ships": "February 2027, to all members",
    "goal": "Fewer overdue loans and fewer fines."
  },
  "asOf": "2026-11-18",
  "failedOn": "2027-08-01",
  "inputs": [
    { "id": "S", "label": "Interview synthesis", "detail": "9 borrowers" },
    { "id": "D", "label": "Loan records", "detail": "last 12 months" }
  ],
  "risks": [],
  "top": ["R2", "R5", "R1"],
  "skipped": {},
  "cut": ["Two smaller risks about email volume were left out to keep the list short."]
}
```

- `failedOn` is the imagined date of the post-mortem, about six months after launch.
- `inputs` lists the evidence you were given. Risks cite it by `id`.
- `top` lists the IDs of the three to five risks that carry tripwires, worst first.
- `cut` is needed only when you left risks out to stay within twelve. Say which.

## A risk

```json
{
  "id": "R2",
  "area": "behaviour",
  "title": "Members stop returning books at all",
  "story": "With nothing ever falling due, members keep books for months. Popular titles sit on shelves at home, the reservation queue grows, and the members who reserve give up.",
  "likelihood": "high",
  "likelihoodWhy": "Six of nine borrowers said the due date is the only reason they bring a book back.",
  "impact": "high",
  "impactWhy": "Availability of popular titles is the main reason people keep their membership.",
  "evidence": {
    "status": "supported",
    "from": "S",
    "detail": "Theme 2, 6 of 9.",
    "expect": "Average loan length rises and the reservation queue for the top 100 titles grows."
  },
  "tripwire": {
    "metric": "Median days on loan, top 100 titles",
    "threshold": "Rises above 35 days",
    "check": "2027-03-15",
    "owner": "Collections lead"
  },
  "mitigation": "Cap automatic renewals at two per loan.",
  "test": "Turn it on for one branch for six weeks and compare loan length."
}
```

- `id` is `R1`, `R2` and so on.
- `area` is one of `users`, `behaviour`, `operations`, `money`, `rules`, `build`.
- `title` names the failure in under ten words.
- `story` is 25 to 90 words: who, doing what, and what follows.
- `likelihood` and `impact` are `low`, `medium` or `high`. Each has a reason of at least four words.
- `evidence.status` is `supported`, `contradicted` or `unknown`. `from` is the `id` of an input, required unless the status is `unknown`. `expect` says what you would see if the risk were real, and is always required.
- `mitigation` and `test` are required for risks in `top`, optional for the rest.

## A tripwire

Required for every risk in `top`. Leave it out, or set it to `null`, for the others.

| Field | Rule |
|---|---|
| `metric` | Something the team measures today |
| `threshold` | Contains a number |
| `check` | A date, `YYYY-MM-DD`, later than `asOf` (the day the pre-mortem was written) |
| `owner` | A role or a name |

## Skipped areas

```json
"skipped": { "rules": "The change touches no personal data, pricing or published terms." }
```

Every one of the six areas has at least one risk, or a line here saying why it has none.
