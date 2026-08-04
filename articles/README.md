# Articles

Canonical essays. Everything else in the repo is derived from these. The site
registry is frontmatter-driven (`site/src/content.js`), so adding a file is the
whole step.

All 9 score 100/100 on `npm run content:check`.

## The set

| # | Essay | Section | Demo | Scheduled |
|---|---|---|---|---|
| 01 | [People don't quit because they lost](./01-three-trust-surfaces.md) | markets | | week 2 |
| 02 | [After the final](./02-after-the-final.md) | shipping | | week 4 |
| 03 | [Prototype aggressively, productionize suspiciously](./03-prototype-aggressively-productionize-suspiciously.md) | agents | | week 4 |
| 04 | [Your rewards bought a crowd](./04-rewards-vs-farming.md) | markets | farm-lab | week 3 |
| 05 | [Compliance is a product input](./05-compliance-as-product.md) | shipping | | week 8 |
| 06 | [Dead markets poison the whole venue](./06-dead-markets-poison.md) | markets | liquidity-lab | week 7 |
| 07 | [The sentence is the product](./07-the-sentence-is-the-product.md) | markets | resolution-linter | **week 1** |
| 08 | [The harness is the edge](./08-the-harness-is-the-edge.md) | agents | calibration-lab | week 5 |
| 09 | [Jurisdiction is a field, not a flag](./09-jurisdiction-is-a-product-field.md) | shipping | | week 9 |

Essay 07 is the opener. It is the most non-obvious claim, only someone who has
operated a market could write it, it generalises to anyone shipping something with
an ambiguous success condition, and it ships alongside a linter that demonstrates
it on three real markets.

Canonical path: `/{section}/{slug}`, e.g. `/markets/07-the-sentence-is-the-product`.

## Nothing here is live yet

Every file is `status: draft`, so the production site renders none of them. That is
the editorial gate, not a bug. To publish one, change its status to
`compliance-checked`. See [../DEPLOY.md](../DEPLOY.md).

To read them all on a preview deploy without publishing, set `VITE_SHOW_DRAFTS=1`.

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
