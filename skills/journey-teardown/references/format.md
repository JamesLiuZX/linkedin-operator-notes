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

- A screen has either `img` (a path, a link or a data URI) or `blocks` (a schematic, described below).
- At most three notes. Each is one sentence, under 30 words, and names something on the screen.
- When a screen arrives as `blocks`, keep the blocks as given. You may highlight at most one block per screen, the one its most important note is about, by adding `"hi": true` to that block's options. If the block has no options object, add one as its third element, with an empty label second: `["gap", "", {"hi": true}]`. `hi` on a `cols` block outlines the whole row. It is never drawn on `tabs`, `sheet`, `modal` or `toast`, so pick another block. `check.py` fails a screen with more than one. Highlighting is optional.

### Schematic blocks

A schematic screen is a list of blocks drawn top to bottom. Each block is `[type, label, options]`. The labels are what is written on the screen.

A screen is a phone, 180 by 368, unless it says otherwise. For a desktop product, give the screen `"frame": "desktop"`. It is then a browser window, 372 by 248, and takes two more optional fields: `"url"` (shown in the window bar) and `"nav"`, a sidebar: `{ "title": "Larkspur", "items": ["Home", "Projects", "People"], "on": 1 }`.

| Type | Height | Label | Options |
|---|---|---|---|
| `bar` | 30 | Greeting or page name | `sub` (a second line), `action` (text of a button on the right) |
| `title` | 26 | Large heading | |
| `search` | 24 | Placeholder text | |
| `chips` | 20 | `"One|Two|Three"` | `on` (index of the selected chip) |
| `banner` | 40 | Headline | `sub`, `accent` (filled with the app colour), `warn` |
| `card` | 46 | Headline | `sub`, `sub2` (a third line, height 58), `action` (text of a small button), `badge`, `accent`, `warn` |
| `row` | 24 | A line of a list | `right` (right-aligned text), `sub`, `avatar` (a name, drawn as initials), `badge`, `warn` |
| `grid` | 62 | (none) | `n` (2 or 3 tiles) |
| `slots` | 26 | `"A|B|C"` | `on` (index of the selected choice, or -1 for none) |
| `text` | 16 | One line of small text | `bold`, `ink` (dark, for a subheading), `warn` |
| `para` | by length | A paragraph, wrapped | `lines` (most lines to show, default 4), `cite` (a small source chip after it, such as `"12:04"`), `warn` |
| `gap` | 8 | (none) | |
| `cta` | 28 | Button text | `ghost` (outlined), `wide` (full width on desktop), `align: "right"` |
| `field` | 36 | Label above an input | `value` (what is typed), `hint` (placeholder), `warn` |
| `toggle` | 26 | A setting with a switch | `on`, `sub` |
| `people` | 26 | Text beside a row of avatars | `items` (names, or `"+3"`) |
| `table` | by rows | (none) | `cols` (headings), `rows` (lists of cells), `on` (index of the selected row) |
| `kpi` | 40 | (none) | `items`: `[["22%", "second seat in week one"], ...]` |
| `chat` | by length | What was said | `from` (`"me"` on the right, anything else on the left), `cite`, `lines` |
| `check` | 22 | A task or checklist item | `done`, `sub`, `badge`, `warn` |
| `media` | 64 | Caption on a video or image | `h` (height) |
| `progress` | 26 | Label | `value`, `total` |
| `cols` | tallest side | (none) | `left` and `right` (each a list of blocks), `split` (share of the width for the left, default 0.5), `rule` (a line between) |
| `tabs` | 34 | (none, a phone tab bar at the bottom) | `items`, `on` |
| `sheet` | over the screen | Title of a bottom sheet | `items` (up to 3 choices), `on` |
| `modal` | over the screen | Title of a dialog | `sub`, `field` (placeholder of an input), `items`, `on`, `cta` |
| `toast` | over the screen | A short message at the bottom | |

Any block may also carry `hi: true` (a highlight around it), `pin: "1.1"` (a numbered marker) or `dim: true` (faded).

Blocks that do not fit are left out, so keep the heights within 300 on a phone with tabs, 330 without, and 215 on a desktop. A label that is too long for its width is cut with an ellipsis.

When a screen arrives as `blocks`, you may highlight at most one block on it.

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

- `best` has one or two entries.
- `patterns[].seen` names at least two apps, at least one of them a competitor. `anti[].seen` names at least one. Use app IDs.
- `ideal` has two to five steps.
- `gaps[].p` is `P0` (fix first), `P1` or `P2`. `benchmark` is a competitor's ID, never the user's product. When no app on the board shows the fix working, use `"benchmark": null` and add `"benchmarkNote": "No app on the board does this."`

## Principles

```json
"principles": [
  { "name": "Start from last time", "text": "A returning customer's first screen should be their own history, not the catalogue.", "evidence": ["S1", "S2"] }
]
```

Three to six. `evidence` lists the stages each one draws on.
