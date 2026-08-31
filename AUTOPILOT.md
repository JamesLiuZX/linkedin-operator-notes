# Autopilot: the portfolio queue and the loop that runs it

Written 2026-08-31 from a full audit of every active repo. This file is the
single place where project status, priorities, and the autopilot loop live.
Every scheduled session updates the status log at the bottom.

## The problem this file exists to fix

Five projects, four of them 90–100% built, zero launched-and-distributed.
The bottleneck was never building. It is execution after the build:
publishing, posting, credentials, the last 5%. So the loop below treats
distribution as the primary work and building as the backlog-filler.

---

## Portfolio, prioritized

### P0 — linkedin-operator-notes (this repo) — DISTRIBUTE, stop building
- **State:** Site live at jamesliuzx.github.io/linkedin-operator-notes.
  8 demos, dashboard, 21 essays (5 live), 44-slot schedule. Gates green.
- **Gap:** 19 schedule rows marked `ready` were due by Aug 31 and never went
  out. `.publish/state.json` is empty: nothing has ever been cross-posted.
  TRACKER.md: zero boxes checked.
- **Why P0:** it is the distribution engine for everything else (course
  launch, portfolio, brand). 100% of remaining work is execution.
- **Loop:** daily distribution-prep routine + James's 5-minute Cowork posting
  session (below).

### P1 — james-portfolio — 30 minutes of fixes, then done
Live at jamesliuzx.com but quietly broken for SEO/sharing:
1. `app/layout.tsx:31` sets `siteUrl = "https://jamesliu.dev"`; the CNAME is
   `jamesliuzx.com`. Every canonical/OG/Twitter URL points at the wrong domain.
2. `content/blog/ai-scaling-laws` lacks `.mdx`, so a finished 20KB post never
   renders.
3. No `app/sitemap.ts` / `app/robots.ts`; 5/5 blog posts have placeholder
   frontmatter images.
- **Loop:** one build-cycle session fixes all three and pushes to `main`
  (deploy is push-triggered).

### P2 — herbalbath-myrrh — live revenue product, split the blockers
Live at herbalbathsg.com. WhatsApp checkout, referral kit, 39 SEO pages.
- **Claude-fixable queue:** missing `/images/paynow-qr.png` breaks the captain
  kit (`app/kit/CaptainKitClient.tsx:63`); REMINDERS.md flags live claim copy
  ("无副作用 / 深层治愈") for removal; TS/ESLint errors ignored at build.
- **James-only:** connect Upstash Redis env vars in Vercel (until then reorder
  nudges and captain codes do not persist); run the HSA classification check;
  confirm the wholesale price ladder in `app/lib/growth-config.ts`.

### P3 — udemy (AI course factory) — pipeline 100%, content 4%
Markdown → slides → TTS → MP4 pipeline is complete and clean. 4 of 100
lectures written; 11 promised downloadable artifacts unbuilt. Pricing and
launch playbook already written.
- **Loop:** twice-weekly lecture-factory routine writes 2 lectures per run
  through the repo's own `write-lecture` skill and QC. At that rate the
  script backlog closes in ~10 months; raise the batch size once quality
  holds. Voice recordings (promo, 0.1, section intros) are James-only and
  are the launch gate — everything else can be finished around them.

### Kill / exclude
- **bigbot** — a contribution-graph automation bot, still firing daily
  (last: Aug 29). Not a product; it fabricates commits/PRs/releases and is a
  reputational liability with a hardcoded NUS email in the workflow.
  **Recommendation: disable `.github/workflows/daily-activity.yml`.**
  James-only decision; queued in the blocker list.
- **nsfw-studio** — excluded from the autopilot and from automated
  distribution deliberately.
- **Archive tier** — everything last pushed 2026-07-25 or earlier
  (interviewgoat, ecomrag-shopify, StockInsight, …): dormant, ignore.

---

## The loop

Three scheduled routines run in Claude Code (manage them at claude.ai →
Routines; each can be paused or deleted there):

1. **Daily distribution prep** — weekdays 06:30 SGT. Fresh session on this
   repo: find due schedule rows, run the gate, promote per schedule, verify
   the dashboard packet, push, then send a push notification with exactly
   what is queued for today's posting session.
2. **Build cycle** — Tue & Fri 23:00 SGT. Alternates: udemy lectures (2 per
   run) → james-portfolio/herbalbath fix queue → this repo's essay backlog.
   Every run ends with a push.
3. **Monday status report** — 07:30 SGT. Reads all repos + Actions runs,
   updates the status log below, sends a push + email summary: what shipped
   last week, what is queued, which human-only blockers are stalling what.

### The human 5 minutes (the only part that is yours)

Posting acts as you, on your logged-in browser. When the daily notification
arrives: open Claude Cowork on the laptop, paste the prompt from
`BROWSER-POSTING.md`, let it run. It posts only gate-passing, due items and
stops on anything anomalous. That is the entire manual loop for P0.

**Reddit and X:** X is covered (API pipeline once `TWITTER_*` secrets are set,
browser agent regardless). Reddit is not yet in the pipeline — treat it as
manual-first: the weekly report proposes at most 1–2 subreddit-appropriate
posts (value-first, per-subreddit rules read before posting, never
link-dumped). Automate only after two manual weeks show it lands.

---

## Human-only blockers (the real critical path)

| # | Blocker | Unblocks | Effort |
|---|---|---|---|
| 1 | Run one Cowork posting session (BROWSER-POSTING.md) | P0 distribution starts; 19-item backlog begins draining | 5 min |
| 2 | Merge the autopilot branch (`claude/projects-autopilot-distribution-r5q6vb`) to master | Doctrine + queue visible to all future sessions | 2 min |
| 3 | Disable bigbot's `daily-activity.yml` workflow | Removes daily fabricated activity | 2 min |
| 4 | Add Upstash Redis env vars in Vercel (herbalbath) | Reorder engine + captain codes persist | 10 min |
| 5 | Set `TWITTER_*` secrets in this repo's Actions | X cross-posting goes fully automatic | 10 min |
| 6 | Record course promo + lecture 0.1 voice | Udemy launch gate | 1–2 h |
| 7 | HSA classification check + wholesale price confirm (herbalbath) | Scale spend safely | James's judgment |

Items 1–5 total under half an hour and unblock everything automated.

---

## Status log (newest first; routines append here)

### 2026-08-31 — session: portfolio audit + autopilot setup
- Audited all 50 repos; active tier is the five above.
- Wrote CLAUDE.md (doctrine) + this file. Gates verified green (`npm run
  check`: no errors; warnings only on deliberately-held drafts).
- Created the three routines. Next scheduled fire: daily prep, tomorrow
  06:30 SGT.
- Shipped: nothing posted yet — blocker #1 is the human 5 minutes.
