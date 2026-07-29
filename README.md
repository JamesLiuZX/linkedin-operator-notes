# LinkedIn Operator Notes — James Liu

Personal content system to build credibility, following, and opportunities around:

1. **Prediction markets as products** (primary)
2. **AI that ships** (secondary)
3. **Gen media with taste** (tertiary)

Positioning: *Operator who ships prediction markets and AI products at scale — not an AI influencer.*

## How to use this repo

| File | Purpose |
|------|---------|
| [WRITING.md](./WRITING.md) | Voice contract + quality gate (`npm run content:check`) |
| [00-positioning.md](./00-positioning.md) | Positioning, pillars, library shape |
| [PLAN-30-DAYS.md](./PLAN-30-DAYS.md) | First 14-day shipping milestone |
| [PUBLISHING.md](./PUBLISHING.md) | Cross-post to X / Medium / Substack |
| [PATCHES.md](./PATCHES.md) | Architecture notes from the optimization pass |
| [01-profile.md](./01-profile.md) | LinkedIn headline, about, featured |
| [posts/](./posts/) | Short LinkedIn atoms (derived from essays) |
| [articles/](./articles/) | Canonical essays (source of truth) |
| [ideas/idea-bank.md](./ideas/idea-bank.md) | Idea backlog |
| [tools/content-desk/](./tools/content-desk/) | Local evidence + gate UI |
| [site/src/demos/](./site/src/demos/) | Interactive demos (`/demos`) — start with `npm run restyle -- --list` |

## Daily commands

```bash
npm run content:check          # quality gate (CI enforces on non-drafts)
npm run site:install && npm run site
npm run unsplash               # resolve figures: from article frontmatter
npm run publish:list
npm run publish:dry
npm run desk:install && npm run desk   # content desk UI
```

Canonical site URLs are path-based: `/{section}/{slug}` (not hash routes).

## Adding an essay

1. Create `articles/your-slug.md` with YAML frontmatter (`title`, `slug`, `section`, `status`, `figures`, …)
2. Fill the evidence block (see WRITING.md)
3. Run `npm run content:check articles/your-slug.md`
4. Run `npm run unsplash` if you added `figures:`
5. Preview with `npm run site` (drafts show in dev; only `published` on the live site)

No edits to `site/src/main.js` required.

## Start today

1. Read `PLAN-30-DAYS.md` — ship the library URL first
2. Update LinkedIn profile using `01-profile.md`
3. Draft essay 1 through the evidence gate
4. Derive one LinkedIn atom and one X excerpt from it

## Success metrics

- Profile views from PMs / founders / recruiters / trading firms
- Inbound DMs that aren't spam
- Real opportunities: intros, talks, advisory, roles

Ignore: friend group-chat reactions, vanity like counts.

## Compliance

Never post non-public metrics, unreleased roadmaps, customer data, or confidential Crypto.com / ByteDance details.
