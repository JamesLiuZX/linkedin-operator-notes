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
- **Decision (James, 2026-08-31): narration is API TTS** (ElevenLabs/OpenAI,
  already in `pipeline/tts.py`), not recorded voice. First build-cycle run
  flips `human_voice_required` in course.yaml/qc.py accordingly. James
  should still sanity-check Udemy's marketplace policy on AI narration
  before upload — it was the reason the old gate existed.
- **Loop:** twice-weekly lecture-factory routine writes 2 lectures per run
  through the repo's own `write-lecture` skill and QC. At that rate the
  script backlog closes in ~10 months; raise the batch size once quality
  holds. With API narration, the only James-side launch steps left are TTS
  API keys and the Udemy upload itself.

### P4 — nsfw-studio — interactive sessions only, never unattended
Audited 2026-08-31. Adult AI image studio (Telegram bot + web SPA + FastAPI,
credits/payments). Engineering posture is genuinely careful: fully synthetic
characters only, zero face-swap/undress code (verified by search), age gate,
minors hard-block, per-job consent attestations, NCII takedown policy, real
CI with 32 tests. Fly deploy config ready; never deployed; last work Aug 11
(web-native accounts + NOWPayments crypto scaffold).
- **Blockers:** every provider/model ID marked `verify=True` is unverified
  and hidden from the picker (`scripts/smoke_provider.py` exists to fix
  this, needs keys); no accounts/secrets exist anywhere (BotFather, Runware/
  Novita, Neon, R2) — mock mode only; payments = Telegram Stars only,
  NOWPayments scaffold unexercised.
- **MiniMax H3 note:** it is a *video* model (released 2026-07-31; hosted
  API ~$0.13/s). The hosted API's content rules will almost certainly refuse
  this studio's output, so the realistic integration is the open-weights
  route — licensed for Singapore self-hosting — through the repo's existing
  Comfy escape hatch, as a new video provider alongside Runware/Novita.
  Scope it in an interactive session.
- **Distribution:** the repo already has an X + Reddit poster with an
  approval queue, dry-run by default. Keep it that way: James approves every
  outbound post; nothing here runs unattended. Work on this project happens
  in sessions James starts, not in the scheduled routines.

### Kept / archive
- **bigbot** — kept as-is by James's explicit choice (2026-08-31). Needs no
  attention from the loop.
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

### Central management: this repo is HQ

Claude chats are scoped to one repo, so the portfolio needs one front door,
and it is this repo. The pattern:

- **Every cross-project session starts here.** On claude.ai/code (or the
  app), start the session on `JamesLiuZX/linkedin-operator-notes` and open
  with "read AUTOPILOT.md, then …". CLAUDE.md loads automatically; the
  session attaches any other repo it needs via add_repo mid-session.
- **The routines already fire into this repo's environment** and reach the
  other repos the same way. Their status all flows back into this file's
  log, so reading AUTOPILOT.md top to bottom is always the current picture.
- **One exception:** nsfw-studio work starts as its own session on that
  repo (it stays out of unattended automation), but its status line still
  gets copied into the log here.

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
| 2 | Merge the autopilot branch (`claude/projects-autopilot-distribution-r5q6vb`) to master | Doctrine + queue visible to all future sessions and routines | 2 min |
| 3 | Add Upstash Redis env vars in Vercel (herbalbath) | Reorder engine + captain codes persist | 10 min |
| 4 | Set `TWITTER_*` secrets in this repo's Actions | X cross-posting goes fully automatic | 10 min |
| 5 | Add ElevenLabs or OpenAI TTS key when rendering udemy audio | Lecture MP4s render with API narration | 5 min |
| 6 | nsfw-studio accounts/keys (Runware or Novita, BotFather, Neon, R2) | Moves it from mock mode to testable; provider smoke-test can run | ~30 min |
| 7 | HSA classification check + wholesale price confirm (herbalbath) | Scale spend safely | James's judgment |

Items 1–4 total under half an hour and unblock everything automated.

---

## Status log (newest first; routines append here)

### 2026-08-31 (later) — session: James's course corrections folded in
- Decisions from James: udemy narration is API TTS (voice gate to be flipped
  on first build-cycle run); bigbot stays as-is; nsfw-studio joins the
  queue as P4, interactive-only.
- Audited nsfw-studio: careful safety posture, deploy-ready, blocked on
  accounts/keys + provider verification; its own approval-queue X/Reddit
  poster is the distribution path, dry-run until James approves.
- Verified schedule vs site: essays 07 and 08 already render (partial /
  compliance-checked), 04 correctly gate-held on 3 personal `{{ }}` slots.
  **The whole due backlog is LinkedIn/X posting — blocker #1.**
- Inaugural daily-prep run completed with nothing to push (site current,
  posting not its job) and ended review-ready; watch tomorrow's run for
  whether the status-log append lands.
- Routines updated (udemy TTS decision, bigbot dropped from checks).

### 2026-08-31 — session: portfolio audit + autopilot setup
- Audited all 50 repos; active tier is the five above.
- Wrote CLAUDE.md (doctrine) + this file. Gates verified green (`npm run
  check`: no errors; warnings only on deliberately-held drafts).
- Created the three routines. Next scheduled fire: daily prep, tomorrow
  06:30 SGT.
- Shipped: nothing posted yet — blocker #1 is the human 5 minutes.
