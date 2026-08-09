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
| [articles/](./articles/) | Canonical essays. Source of truth for everything else. |
| [posts/](./posts/) | Short LinkedIn atoms, each derived from an essay or a tool. Never composed independently. |
| [site/src/demos/](./site/src/demos/) | Interactive demos. Zero-key, client-side, deterministic. |
| [site/src/dashboard/](./site/src/dashboard/) | The posting dashboard at `/dashboard`. |
| [content/schedule.json](./content/schedule.json) | 13-week posting plan. The only place it lives. |
| [research/SOURCES.md](./research/SOURCES.md) | Receipt bank. Every number in the content traces to a row here. |
| [WRITING.md](./WRITING.md) | Voice contract. `npm run content:check` enforces the mechanical half. |
| [REVIEW.md](./REVIEW.md) | Critique of this pipeline across 12 dimensions, and what changed because of it. |
| [scripts/lib/analyze.mjs](./scripts/lib/analyze.mjs) | The one analyzer. CI, the site, and the desk all import it. |
| [00-positioning.md](./00-positioning.md) | Positioning, pillars, library shape |
| [PLAN-30-DAYS.md](./PLAN-30-DAYS.md) | First 14-day shipping milestone |
| [PUBLISHING.md](./PUBLISHING.md) | Cross-posting to X, Medium, Substack |
| [BROWSER-POSTING.md](./BROWSER-POSTING.md) | The browser-agent posting prompt: LinkedIn, X, Medium, Substack from the dashboard |
| [PATCHES.md](./PATCHES.md) | Architecture notes from the optimization pass |
| [DEPLOY.md](./DEPLOY.md) | Vercel and Pages setup, and how to publish a draft |
| [01-profile.md](./01-profile.md) | LinkedIn headline, about, featured |
| [ideas/idea-bank.md](./ideas/idea-bank.md) | Idea backlog + spec'd build projects |
| [ideas/demo-bank.md](./ideas/demo-bank.md) | Buildable demo backlog, ranked by ROI |
| [tools/content-desk/](./tools/content-desk/) | Local evidence + gate UI |
| [tools/resolution-risk/](./tools/resolution-risk/) | Scores market criteria by dispute risk (evidence for Essay 1) |
| [scripts/ledger/](./scripts/ledger/) | Calibration Ledger: the Pillar 1 demo, scored in public |
| [apps/](./apps/) | Shipped browser demos (`npm run apps` builds them for Pages) |

---

## The demos

Each one exists to make an argument checkable, and all but one are attached to
an essay. They run entirely in the browser: no backend, no keys, no model
calls, and the same inputs always give the same numbers.

| Category | Demo | Question it answers | Essay |
|---|---|---|---|
| Market design | [Resolution linter](./site/src/demos/resolution-linter.js) | Where is the dispute surface in this market's rules? 16 rules, 3 real markets that blew up. | 07 |
| Market design | [Farm lab](./site/src/demos/farm-lab.js) | What does a liquidity rewards program actually buy per filled unit? | 10 |
| Market design | [Liquidity lab](./site/src/demos/liquidity-lab.js) | What does "this market feels dead" cost to fix, in dollars? | 06 |
| AI & agents | [Calibration lab](./site/src/demos/calibration-lab.js) | Is the agent better than the price it is trading against? | 08 |
| AI & agents | [Slop Gate](./site/src/demos/slop-gate.js) | Paste any text: does it pass the same checks this site runs on its own drafts? | 15 |
| Gen media & UGC | [Restyle Lab](./site/src/demos/restyle-lab.js) | Compile one scene into a prompt for 4 current video-gen models at once. | 11 |
| Gen media & UGC | [Retention Curve Lab](./site/src/demos/retention-lab.js) | What does a hook style actually do to a short-form video's retention curve? | 12 |
| Growth & AI workflows | [Workflow ROI Lab](./site/src/demos/workflow-roi-lab.js) | Where does an AI-assisted workflow stop paying for itself? | 13 |

The linter is the flagship. It scores the real Polymarket Ukraine-minerals market
at 3/100 and its rewrite at 95/100, which is the whole argument in one screen.

Six categories total light up on the site once "Field notes" gets its first
entry: Market design, AI & agents, Gen media & UGC, Growth & AI workflows,
Shipping, and Field notes. `site/src/content.js`'s `SECTIONS` array is the one
place that list lives; the homepage groups essays by it, `/demos` groups demos
by it, and `/{section}` renders the filtered page.

---

## Daily commands

```bash
npm run check                  # content gate + schedule integrity. Run before pushing.
npm run content:check          # quality gate (CI enforces on non-drafts)
npm run content:strict         # enforce on drafts too
npm run linkedin:list          # the atom queue, with each post's visible fold
npm run linkedin -- posts/01-resolution-risk-scanner.md   # exact paste + fold + char budget
npm run site:install && npm run site   # dev server, drafts visible
npm run site:build             # production build + sitemap
npm run unsplash               # resolve figures from article frontmatter
npm run publish:list
npm run publish:dry            # see what cross-posting would do
npm run desk:install && npm run desk   # local evidence desk
npm run apps                   # build apps/ into site/public/apps/
npm run ledger -- --help       # calibration ledger CLI
npm run risk                   # score market criteria by dispute risk
npm run risk:test              # pin the rule table
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

## The one rule that makes the rest work

Nothing in this repo invents a number about your work. Where a draft needs a
figure only you have, it carries a `{{ }}` slot and the gate refuses to publish
it. A held draft is the correct state. A fabricated number is not, and on a
public profile it is unrecoverable.

## Nothing is published yet, on purpose

All essays pass the gate and are `status: draft`, so the live site renders none
of them. Publishing is a decision you make per piece, by editing frontmatter.
See [DEPLOY.md](./DEPLOY.md).

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
