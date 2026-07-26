# Articles

Canonical essays. The site registry is frontmatter-driven (`site/src/content.js`).
Unsplash slots live in each file's `figures:` frontmatter.

## Preview site

```bash
npm run site:install
npm run unsplash    # refresh Unsplash URLs → unsplash-manifest.json
npm run site        # http://localhost:5173  (drafts visible in dev)
npm run content:check
```

Canonical path: `/{section}/{slug}` e.g. `/markets/01-three-trust-surfaces`.

## Writing standard

Follow [`../WRITING.md`](../WRITING.md). Evidence block first. Then:

- No em dashes; hook; natural voice; Takeaway; shareable
- Specificity density gate via `npm run content:check`
- One transformation (start belief → end belief)

`npm run unsplash` updates the image manifest only. It does **not** overwrite article prose.

## Status

Drafts below show in local `npm run site`. Live site only renders `status: published`.

- [01: People don’t quit because they lost…](./01-three-trust-surfaces.md) — markets
- [02: After the final…](./02-after-the-final.md) — shipping
- [03: Prototype aggressively…](./03-prototype-aggressively-productionize-suspiciously.md) — agents
- [04: Your rewards bought a crowd…](./04-rewards-vs-farming.md) — markets
- [05: Compliance is a product input…](./05-compliance-as-product.md) — shipping
- [06: Dead markets poison the whole venue](./06-dead-markets-poison.md) — markets

## Adding an essay

1. Create `articles/your-slug.md` with frontmatter (`title`, `slug`, `section`, `status`, `figures`, `twitterExcerpt`, …)
2. Fill the `<!-- EVIDENCE ... -->` block
3. `npm run content:check articles/your-slug.md`
4. `npm run unsplash` if you added figures
5. No edits to `main.js` or `fetch-unsplash.mjs` required
