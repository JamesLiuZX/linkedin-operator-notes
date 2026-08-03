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
| [REVIEW.md](./REVIEW.md) | Critique of this pipeline across 12 dimensions, and what changed because of it |
| [00-positioning.md](./00-positioning.md) | Positioning, pillars, library shape |
| [PLAN-30-DAYS.md](./PLAN-30-DAYS.md) | First 14-day shipping milestone |
| [PUBLISHING.md](./PUBLISHING.md) | Cross-post to X / Medium / Substack |
| [PATCHES.md](./PATCHES.md) | Architecture notes from the optimization pass |
| [01-profile.md](./01-profile.md) | LinkedIn headline, about, featured |
| [posts/](./posts/) | Short LinkedIn atoms (derived from essays) |
| [articles/](./articles/) | Canonical essays (source of truth) |
| [ideas/idea-bank.md](./ideas/idea-bank.md) | Idea backlog + spec'd build projects |
| [ideas/demo-bank.md](./ideas/demo-bank.md) | Buildable demo backlog, ranked by ROI |
| [tools/content-desk/](./tools/content-desk/) | Local evidence + gate UI |
| [tools/resolution-risk/](./tools/resolution-risk/) | Scores market criteria by dispute risk (evidence for Essay 1) |
| [scripts/ledger/](./scripts/ledger/) | Calibration Ledger: the Pillar 1 demo, scored in public |
| [apps/](./apps/) | Shipped browser demos (`npm run apps` builds them for Pages) |
| [site/src/demos/](./site/src/demos/) | Interactive demos (`/demos`) — start with `npm run restyle -- --list` |

## Daily commands

```bash
npm run content:check          # quality gate (CI enforces on non-drafts)
npm run content:strict         # enforce on drafts too
npm run linkedin:list          # the atom queue, with each post's visible fold
npm run linkedin -- posts/01-resolution-risk-scanner.md   # exact paste + fold + char budget
npm run site:install && npm run site
npm run unsplash               # resolve figures: from article frontmatter
npm run publish:list
npm run publish:dry
npm run desk:install && npm run desk   # content desk UI
npm run apps                   # build apps/ into site/public/apps/
npm run ledger -- --help       # calibration ledger CLI
npm run risk                   # score market criteria by dispute risk
npm run risk:test              # pin the rule table
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

1. Read `PLAN-30-DAYS.md`, ship the library URL first
2. Update LinkedIn profile using `01-profile.md`
3. Post `posts/01-resolution-risk-scanner.md`. It is gate-clean and it points at
   a tool anyone can run, which is the only kind of first post worth making
4. Fill the `{{ }}` slots in posts 8 to 10. They are the pieces only you can finish

## The one rule that makes the rest work

Nothing in this repo invents a number about your work. Where a draft needs a
figure only you have, it carries a `{{ }}` slot and the gate refuses to publish
it. A held draft is the correct state. A fabricated number is not, and on a
public profile it is unrecoverable.

## Success metrics

- Profile views from PMs / founders / recruiters / trading firms
- Inbound DMs that aren't spam
- Real opportunities: intros, talks, advisory, roles

Ignore: friend group-chat reactions, vanity like counts.

## Compliance

Never post non-public metrics, unreleased roadmaps, customer data, or confidential Crypto.com / ByteDance details.
