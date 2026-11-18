# The teardown.json format

The board template draws everything from one JSON object.

## Contents

- [Top level](#top-level)
- [The fixed vocabulary](#the-fixed-vocabulary)
- [A stage](#a-stage)
- [A lane](#a-lane)
- [A screen and its notes](#a-screen-and-its-notes)
- [A synthesis](#a-synthesis)
- [Principles](#principles)

## Top level

```json
{
  "title": "The weekly shop: a journey teardown",
  "question": "How do grocery apps get a returning customer to a paid repeat order?",
  "us": "tangelo",
  "captured": "2026-11-18",
  "note": "Where the screens came from, and anything a reader must know before trusting them.",
  "apps": [
    { "id": "pippin", "name": "Pippin", "accent": "#5b3df5", "role": "Competitor" },
    { "id": "tangelo", "name": "Tangelo", "accent": "#14532d", "role": "Our product" }
  ],
  "dimensions": [],
  "stages": [],
  "principles": []
}
```

`us` is the `id` of the user's own product. `accent` is one colour per app, used to tell lanes apart.

## The fixed vocabulary

Use exactly these. Copy the `dimensions` array into the file as it is.

```json
"dimensions": [
  { "id": "clarity", "name": "Clarity", "means": "You can tell what to do next without reading twice." },
  { "id": "speed", "name": "Speed", "means": "Few steps and little typing to finish the stage." },
  { "id": "transparency", "name": "Transparency", "means": "Costs, limits and consequences are shown before they bite." },
  { "id": "trust", "name": "Trust", "means": "Nothing surprises the user later." },
  { "id": "engagement", "name": "Engagement", "means": "It gives a reason to come back or go further." }
]
```

Note labels: `good`, `friction`, `note`, `idea`.

## A stage

```json
{
  "id": "S1",
  "name": "Open the app",
  "finding": "One sentence: the thing to remember about this stage.",
  "lanes": [],
  "missing": { "sorrel": "No screens could be captured for this stage." },
  "synthesis": {}
}
```

Stage IDs are `S1`, `S2` and so on. `missing` is optional and lists apps that have no lane here, with the reason.

## A lane

```json
{
  "app": "pippin",
  "flow": "Home for a returning customer",
  "source": "Screen library capture, 12 Nov 2026",
  "screens": [],
  "scores": {
    "clarity": { "n": 5, "why": "The reorder card is the first thing on the screen." },
    "speed": { "n": 5, "why": "One tap from Home to a filled basket." },
    "transparency": { "n": 4, "why": "Shows the item count and total before the tap." },
    "trust": { "n": 4, "why": "The basket opens for editing, it does not go to payment." },
    "engagement": { "n": 3, "why": "Nothing on Home beyond the repeat order." }
  },
  "verdict": "The fastest route to a repeat order, but it offers nothing else to do.",
  "well": ["Puts the repeat order first.", "Shows the total before the tap."],
  "wrong": ["No sign of what is out of stock until the basket opens."],
  "steal": ["A reorder card with the item count and the total."],
  "coverage": "Only one screen was available for this lane."
}
```

- Lanes appear in the order of `apps`, with the user's product last.
- `scores` has all five dimensions. `n` is a whole number from 1 to 5. `why` is one line.
- `steal` is for competitors. Leave it out of the user's own lane.
- `coverage` is required when the lane has fewer than two screens.

## A screen and its notes

```json
{
  "step": "Opens the app on Home",
  "img": "shots/pippin-home.png",
  "notes": [
    { "k": "good", "t": "\"Reorder last shop\" is the first card, with the item count and total on it." },
    { "k": "friction", "t": "Nothing says two of those items are out of stock today." }
  ]
}
```

- A screen has either `img` (a path, a link or a data URI) or `blocks` (a schematic, described in the PRD skill's format reference and drawn the same way).
- At most three notes. Each is one sentence, under 30 words, and names something on the screen.
- When a screen arrives as `blocks`, keep the blocks as given. You may add `"hi": true` to the options of the one block a note is about.

## A synthesis

```json
"synthesis": {
  "best": [{ "app": "pippin", "why": "One tap from Home to an editable basket." }],
  "patterns": [{ "name": "Reorder on the first screen", "text": "Last week's shop is offered before anything else, with its total.", "seen": ["pippin", "marrow"] }],
  "anti": [{ "name": "Repeat order buried in history", "text": "The customer has to know it exists to find it.", "seen": ["tangelo"] }],
  "ideal": [
    { "name": "Offer the repeat", "text": "Show last week's shop first, with the count and the total." },
    { "name": "Open it for editing", "text": "One tap opens the basket. Never the checkout." }
  ],
  "gaps": [{ "p": "P0", "title": "Reorder is three taps from Home", "today": "It sits under Orders, inside a past order.", "fix": "A reorder card at the top of Home.", "benchmark": "pippin" }]
}
```

- `patterns[].seen` names at least two apps. `anti[].seen` names at least one. Use app IDs.
- `ideal` has two to five steps.
- `gaps[].p` is `P0` (fix first), `P1` or `P2`. `benchmark` is a competitor's ID, never the user's product.

## Principles

```json
"principles": [
  { "name": "Start from last time", "text": "A returning customer's first screen should be their own history, not the catalogue.", "evidence": ["S1", "S2"] }
]
```

Three to six. `evidence` lists the stages each one draws on.
