# Articles

Canonical essays. Everything else in the repo is derived from these. The site
registry is frontmatter-driven (`site/src/content.js`), so adding a file is the
whole step.

All 21 pass `npm run content:check`. Most non-draft pieces score 96/100;
the gate got stricter after the early ones were first written, so 100/100 is no
longer the bar, 0 blocking failures is.

## The set

Six categories, one problem each. `section` in frontmatter decides which one a
piece lands in; the site derives its nav, its `/{section}` page, and its
homepage grouping from the same field, so a new section is one array entry in
`site/src/content.js`, not a template change.

| # | Essay | Section | Demo | Status | Scheduled |
|---|---|---|---|---|---|
| 01 | [People don't quit because they lost](./01-three-trust-surfaces.md) | markets | | draft | week 2 |
| 02 | [After the final](./02-after-the-final.md) | shipping | | draft | week 4 |
| 03 | [Prototype aggressively, productionize suspiciously](./03-prototype-aggressively-productionize-suspiciously.md) | agents | | live | week 4 |
| 04 | [Your rewards bought a crowd](./04-rewards-vs-farming.md) | markets | farm-lab | draft | week 3 |
| 05 | [Compliance is a product input](./05-compliance-as-product.md) | shipping | | draft | week 8 |
| 06 | [Dead markets poison the whole venue](./06-dead-markets-poison.md) | markets | liquidity-lab | live | week 7 |
| 07 | [The sentence is the product](./07-the-sentence-is-the-product.md) | markets | resolution-linter | live | **week 1** |
| 08 | [The harness is the edge](./08-the-harness-is-the-edge.md) | agents | calibration-lab | live | week 5 |
| 09 | [Jurisdiction is a field, not a flag](./09-jurisdiction-is-a-product-field.md) | shipping | | live | week 9 |
| 10 | [The metric is the alibi](./10-the-metric-is-the-alibi.md) | markets | farm-lab | live | week 10 |
| 11 | [The scene is not the prompt](./11-the-scene-is-not-the-prompt.md) | media | restyle-lab | live | — |
| 12 | [The hook rate is not one number](./12-the-hook-rate-is-not-one-number.md) | media | retention-lab | live | — |
| 13 | [The stopwatch, not the forecast](./13-the-stopwatch-not-the-forecast.md) | growth | workflow-roi-lab | live | — |
| 14 | [Reach has an exit tax](./14-reach-has-an-exit-tax.md) | growth | | live | — |
| 15 | [A checklist, not a model](./15-a-checklist-not-a-model.md) | agents | slop-gate | live | — |
| 16 | [The benchmark is the short task](./16-the-benchmark-is-the-short-task.md) | agents | | backlog | — |
| 17 | [The middle of the window is where facts go to die](./17-the-middle-of-the-window.md) | agents | | backlog | — |
| 18 | [Five agents at 95% each is one system at 77%](./18-five-agents-at-95-percent.md) | agents | | backlog | — |
| 19 | [88% use it. 25% finished integrating it.](./19-88-percent-use-it-25-percent-finished.md) | growth | | backlog | — |
| 20 | [The tell isn't the face, it's the polish](./20-the-tell-isnt-the-face.md) | media | | backlog | — |
| 21 | [AI creative wins the click and loses the sale](./21-the-click-and-the-sale.md) | growth | | backlog | — |

Essay 07 is the opener. It is the most non-obvious claim, only someone who has
operated a market could write it, it generalises to anyone shipping something with
an ambiguous success condition, and it ships alongside a linter that demonstrates
it on three real markets.

Essays 11 to 15 are the diversification pass: two on gen media (video-gen prompt
compiling, short-form hook-rate mechanics), two on growth (AI-workflow ROI,
LinkedIn distribution mechanics), one on AI tooling generally (a teardown of this
repo's own content gate). Each is grounded either in a companion demo's own
deterministic output or in a named, dated public source in
[`../research/SOURCES.md`](../research/SOURCES.md), the same evidentiary bar as
01 through 10. `status: published` on all five means they render on the live site
but are not queued for auto-cross-posting; they have no row in
`content/schedule.json` on purpose, since that file is a LinkedIn posting plan,
not a publish gate.

Essays 16 to 21 are a backlog batch: three on AI agents (computer-use benchmark
horizons, long-context retrieval, multi-agent reliability math), two on growth
(voice-AI adoption versus integration, AI ad-creative CTR-versus-conversion),
one on media (AI avatar tools for UGC ads). Same evidentiary bar, sourced in
[`../research/SOURCES.md`](../research/SOURCES.md). `status: ready` on all six
means the mechanical gate passed but nobody has read them again with an
employer's risk tolerance in mind; that is the `compliance-checked` step, and
it has not happened yet, so they do not render on the live site. Promote a
piece to `compliance-checked` (and give it a `publishAt`) when it is actually
ready to ship.

Canonical path: `/{section}/{slug}`, e.g. `/markets/07-the-sentence-is-the-product`
or `/media/11-the-scene-is-not-the-prompt`.

## Most of this is live, some of it is a backlog

11 of 21 files carry a status that renders publicly (`published` or
`compliance-checked`); 4 (01, 02, 04, 05) are still `status: draft`; 6 (16-21)
are `status: ready`, gate-passing but not yet reviewed or scheduled. Neither
`draft` nor `ready` renders on production. That is the editorial gate working,
not a bug. To publish one, change its status to `compliance-checked`. See
[../DEPLOY.md](../DEPLOY.md).

To read the drafts too, on a preview deploy without publishing them, set
`VITE_SHOW_DRAFTS=1`.

## Writing standard

Follow [`../WRITING.md`](../WRITING.md). The evidence block comes first, and if the
`Cost:` field is empty the piece is not ready.

Mechanically enforced: no em dashes, a hook that lands, a `Takeaway:`, no banned
LLM tells, at least one receipt, and specificity density at or above 6.0 per 100
words for essays.

The density gate is the one that bites. It is not satisfied by adding numbers to
vague prose; the usual fix is cutting the paragraph that was restating the
previous paragraph. Four of these essays got shorter and better on that basis.

Every figure traces to [`../research/SOURCES.md`](../research/SOURCES.md).

## Adding one

1. Create `articles/your-slug.md` with frontmatter: `title`, `slug`, `section`,
   `status`, `summary`, `publishAt`, `twitterExcerpt`, and optionally `figures`.
2. Fill the `<!-- EVIDENCE -->` block.
3. `npm run content:check articles/your-slug.md`
4. Add a row to `../content/schedule.json`, then `npm run schedule:check`.
5. `npm run unsplash` if you added `figures:`.
6. `npm run site` to preview.

No edits to `main.js` or `fetch-unsplash.mjs` required.

`npm run unsplash` only updates the image manifest. It never touches prose.
