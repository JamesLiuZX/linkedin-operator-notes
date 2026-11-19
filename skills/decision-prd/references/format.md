# The prd.json format

The template draws the whole page from one JSON object. Every field is plain text. Two inline marks are understood: backticks for `code` and asterisks for a *highlight*.

## Contents

- [Top level](#top-level)
- [A section](#a-section)
- [A point](#a-point)
- [Evidence and screens](#evidence-and-screens)
- [The tables](#the-tables)
- [A minimal valid file](#a-minimal-valid-file)

## Top level

```json
{
  "doc": {
    "title": "Tangelo: make the weekly shop a two-minute job",
    "short": "Weekly shop PRD",
    "eyebrow": "Draft for review",
    "author": "Noor Haddad, Product",
    "date": "2026-11-18",
    "summary": "One or two sentences on what the document covers and how it is organised.",
    "prototype": { "href": "prototype.html", "label": "Open the clickable prototype" },
    "fictional": false
  },
  "sources": [{ "id": "S", "label": "Interview synthesis", "detail": "8 weekly shoppers", "href": "synthesis.html" }],
  "sourceNote": "Where the screens come from and how old they are.",
  "sections": [],
  "priority": [],
  "rollout": [],
  "next": ["Who has to do what before work starts, by point ID."],
  "caveats": "What is estimated, unmeasured or fictional."
}
```

- `doc.short` is the label in the sticky bar. Keep it under 24 characters.
- `doc.prototype` is optional. When it is set, each point links to `href#<screen>?on=<id>`.
- `sources[].id` is a short code, one or two capitals. Points cite sources by this code. `href` is optional.

## A section

```json
{
  "n": 1,
  "id": "home",
  "title": "Home",
  "summary": "One line for the summary card at the top of the page.",
  "lead": "One or two sentences that frame the points in this section.",
  "points": []
}
```

Use two to five sections. `n` starts at 1 and has no gaps.

## A point

```json
{
  "id": "1.1",
  "screen": "home",
  "title": "Last week's basket is three taps away",
  "problem": "What happens today and what it costs. Two sentences at most.",
  "change": "The concrete move on the screen. Two sentences at most.",
  "why": "Optional. One sentence for a choice a reviewer would question.",
  "constraint": { "label": "Dependency", "text": "What it is, and what the design does about it or who signs off." },
  "evidence": [],
  "sources": ["T:stage 1", "S:theme 1, 7 of 8"],
  "know": {
    "baseline": "What to measure before the change. Say if it has not been measured.",
    "expect": "What should move, as a direction. A figure only if it is marked as an estimate.",
    "stop": "The signal that means stop."
  }
}
```

- `id` is the section number, a dot, and a counter: `2.3`. It must be unique.
- `screen` is optional: the name of the prototype screen that shows this point.
- `sources` entries are `CODE` or `CODE:pointer`. The code must match a source.
- If `know.expect` states a size (a percentage, points or a multiple), it must also contain the word "estimate", or the checker rejects it. A direction with no size is always fine.

## Evidence and screens

```json
{ "tag": "today", "label": "Tangelo today", "caption": "Home. Reorder is under Orders.", "screen": { "img": "shots/home-today.png" } }
```

- `tag` is `today`, `reference` or `proposed`. Order them that way.
- `label` is the product's name with "today" for the current state, the competitor's name for a reference, and "Proposed" for the proposal.
- `screen` is one of:
  - `{ "img": "path-or-data-uri" }` for a real screenshot. Use a data URI when the page has to be one self-contained file.
  - `{ "accent": "#14532d", "blocks": [...] }` for a schematic. Use it when there is no screenshot, or when the structure matters more than the pixels. Add `"frame": "desktop"` for a desktop product.

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

On a proposed screen in a PRD, highlight and pin the one block the point changes.

## The tables

```json
"priority": [
  { "id": "1.1", "change": "Reorder card on Home", "moves": "Time to order", "effort": "S",
    "status": { "level": "ok", "text": "Nothing" }, "first": "The smallest next step" }
],
"rollout": [
  { "when": "First release", "points": ["1.1", "2.1"], "why": "Why these go together, and why first." }
]
```

- `effort` is `S`, `M` or `L`.
- `status.level` is `ok` (nothing in the way), `amb` (another team or a question first) or `no` (blocked until something happens). `status.text` says what, in two or three words.
- Every point has exactly one priority row and appears in exactly one rollout row.

## A minimal valid file

`assets/template.html` ships with the smallest file that passes the checker. Start from it when in doubt.
