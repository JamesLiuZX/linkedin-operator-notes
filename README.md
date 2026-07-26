# LinkedIn Operator Notes — James Liu

A content system, four working demos, and a posting dashboard, in one repo.

Positioning: *operator who ships prediction markets and AI products at scale, not
an AI influencer.* Full argument in [00-positioning.md](./00-positioning.md).

Three pillars:

1. **Prediction markets as products** (primary)
2. **AI that ships** (secondary)
3. **Gen media with taste** (tertiary)

---

## What is in here

| Path | What it is |
|---|---|
| [articles/](./articles/) | 9 canonical essays. Source of truth for everything else. |
| [posts/](./posts/) | 12 LinkedIn atoms, each derived from an essay. Never composed independently. |
| [site/src/demos/](./site/src/demos/) | 4 interactive demos. Zero-key, client-side, deterministic. |
| [site/src/dashboard/](./site/src/dashboard/) | The posting dashboard at `/dashboard`. |
| [content/schedule.json](./content/schedule.json) | 12-week posting plan. The only place it lives. |
| [research/SOURCES.md](./research/SOURCES.md) | Receipt bank. Every number in the content traces to a row here. |
| [WRITING.md](./WRITING.md) | Voice contract. `npm run content:check` enforces the mechanical half. |
| [scripts/lib/analyze.mjs](./scripts/lib/analyze.mjs) | The one analyzer. CI, the site, and the desk all import it. |
| [DEPLOY.md](./DEPLOY.md) | Vercel and Pages setup, and how to publish a draft. |
| [PUBLISHING.md](./PUBLISHING.md) | Cross-posting to X, Medium, Substack. |

---

## The demos

Each one exists to make an argument checkable, and each is attached to an essay.
They run entirely in the browser: no backend, no keys, no model calls, and the
same inputs always give the same numbers.

| Demo | Question it answers | Essay |
|---|---|---|
| [Resolution linter](./site/src/demos/resolution-linter.js) | Where is the dispute surface in this market's rules? 16 rules, 3 real markets that blew up. | 07 |
| [Farm lab](./site/src/demos/farm-lab.js) | What does a liquidity rewards program actually buy per filled unit? | 04 |
| [Liquidity lab](./site/src/demos/liquidity-lab.js) | What does "this market feels dead" cost to fix, in dollars? | 06 |
| [Calibration lab](./site/src/demos/calibration-lab.js) | Is the agent better than the price it is trading against? | 08 |

The linter is the flagship. It scores the real Polymarket Ukraine-minerals market
at 3/100 and its rewrite at 95/100, which is the whole argument in one screen.

---

## Daily commands

```bash
npm run check           # content gate + schedule integrity. Run before pushing.
npm run site            # dev server, drafts visible
npm run site:build      # production build + sitemap
npm run desk            # local evidence desk
npm run publish:dry     # see what cross-posting would do
npm run unsplash        # resolve figures from article frontmatter
```

---

## Adding an essay

1. Create `articles/your-slug.md` with frontmatter (`title`, `slug`, `section`,
   `status`, `summary`, `publishAt`).
2. Fill the `<!-- EVIDENCE -->` block **before drafting**. If the `Cost:` field is
   empty, the piece is not ready. That field is the difference between a post and
   a press release.
3. `npm run content:check articles/your-slug.md` until it passes.
4. Add a row to `content/schedule.json`, then `npm run schedule:check`.
5. Preview with `npm run site`.

No edits to `site/src/main.js` required. The registry is frontmatter-driven.

## Adding a demo

1. Write `site/src/demos/your-demo.js` exporting `meta` and `mount(root)`.
2. Add one line to `site/src/demos/index.js`.

The route, the card, the sitemap entry, and the dashboard link all follow from
that. If a chart is involved, read the palette note at the top of
`site/src/viz/palette.css` first: the categorical order is a colorblind-safety
mechanism, not decoration, and changing a hex means re-running the validator.

---

## Nothing is published yet, on purpose

All 9 essays pass the gate and all of them are `status: draft`, so the live site
renders none of them. Publishing is a decision you make per piece, by editing
frontmatter. See [DEPLOY.md](./DEPLOY.md).

The demos and the dashboard are live regardless.

---

## Success metrics

Profile views from PMs, founders, recruiters and trading firms. Inbound DMs that
are not spam. Real opportunities: intros, talks, advisory, roles.

Ignore likes and group-chat reactions. DMs matter more than reach, and a demo
someone reopens matters more than either.

---

## Compliance

Never post non-public metrics, unreleased roadmaps, customer data, or confidential
Crypto.com / ByteDance details. Prefer principles, anonymized patterns, and
publicly shareable outcomes. Every number in the published content comes from
[research/SOURCES.md](./research/SOURCES.md), which is entirely public sources.
