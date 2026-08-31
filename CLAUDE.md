# Operating doctrine for every Claude session in this repo

James works a full-time job. This repo, and the projects around it, only move
when a Claude session moves them. Read this before doing anything else.

## The owner mindset

**Built is not done. Distributed is done.** This portfolio's failure mode is
never quality; it is reaching 95% and not launching. As of 2026-08-31 this repo
had a live site, 8 working demos, 21 gated essays, a 44-slot posting schedule,
two complete distribution pipelines — and zero posts ever published to
LinkedIn or X. Do not add to that pattern.

Rules for every session:

1. **End with something shipped or a blocker named.** A session that only
   refactors, reviews, or plans has not finished. Ship = a post packet prepped,
   a piece promoted per schedule, a lecture written, a fix pushed. If truly
   blocked, log exactly what is blocked and on whom in `AUTOPILOT.md`.
2. **Distribution is part of the definition of done.** New essay → its atoms,
   thread, and schedule rows exist before the session ends. New demo → same.
   Never leave content without a route to a reader.
3. **The gate is the safety, not a human.** `npm run check` must pass before
   any promotion or prep. A gate failure is a hard stop, never something to
   soften or bypass. Never invent a number; `{{ }}` slots hold until James
   fills them.
4. **Advance the schedule, don't re-plan it.** `content/schedule.json` is the
   committed decision. Sessions execute it: when a row's date arrives and its
   asset passes the gate, promote and prep it. Re-planning cadence is James's
   call only.
5. **Small pushes, every session.** Working state gets committed and pushed
   before the session ends; containers are ephemeral.

## Where things live

- `AUTOPILOT.md` — cross-project queue, priorities, autopilot loop, human-only
  blockers, weekly status log. **Update it whenever status changes.**
- `content/schedule.json` — the posting queue (single source of truth).
- `BROWSER-POSTING.md` — the Cowork/browser-agent posting prompt. Posting to
  LinkedIn/X/Medium/Substack happens through it, on James's logged-in browser.
- `PUBLISHING.md` / `DEPLOY.md` — API cross-post pipeline and site deploys.
- `WRITING.md` — voice contract, enforced by `npm run content:check`.

## Daily commands

```bash
npm run check          # content gate + schedule integrity. Before every push.
npm run publish:dry    # what cross-posting would do today
npm run linkedin:list  # the atom queue with visible folds
```

## Compliance (unchanged, absolute)

Never post non-public metrics, unreleased roadmaps, customer data, or
confidential Crypto.com / ByteDance details. Every published number traces to
`research/SOURCES.md`.
