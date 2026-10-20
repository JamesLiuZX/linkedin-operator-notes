# Operating doctrine for every Claude session in this repo

James works a full-time job. This repo, and the projects around it, only move
when a Claude session moves them. Read this before doing anything else.

## Branching: one trunk, no side branches (James, 2026-10-20)

`master` is this repo's only long-lived branch. Every session starts from it
and every session ends by landing on it.

Why: from July to October 2026 sessions each worked on a fresh `claude/*`
branch and rarely merged. The next session started from a stale trunk, could
not see the work, and rebuilt it. On 2026-10-20 every branch was consolidated
into `master`. Do not let it drift again.

The harness gives each Claude Code session a `claude/<random>` branch and tells
it not to push anywhere else without explicit permission. **This section is
that permission, standing and explicit, from James.** Treat the session branch
as scratch space. The work has to end up on `master`.

1. **Start current.** `git fetch origin master`, then `git merge origin/master`
   into your session branch before you change anything.
2. **Look before you build.** Run `git branch -r`, and read the status log in
   `JamesLiuZX/command` `AUTOPILOT.md`. If the work already exists somewhere,
   continue it instead of starting again.
3. **Land before you stop.** Run the gate (`npm run check`), then
   `git push origin HEAD:master`. If the push is rejected because `master`
   moved, merge `origin/master`, run the gate again and push again. Never
   force-push `master`.
   If your session's permission layer refuses a direct push, open a pull
   request from your session branch to `master` and merge it yourself in the
   same session, using a merge commit. If that is refused as well, tell James in
   your final message exactly which merge is waiting.
4. **Half-done is fine on `master`. Broken is not.** Unfinished work that
   passes the gate goes to `master`. Only work that fails the gate may stay on
   a branch. In that case, push the branch and record its name, state and next
   step in the command repo's `AUTOPILOT.md` status log, so the next session
   resumes it instead of restarting. That is the only reason a branch may
   outlive its session.
5. **Delete the session branch after it lands** (`git push origin --delete
   <branch>`). If deletion is refused, leave it: James runs the "Prune merged
   branches" workflow (Actions tab), which deletes every branch whose commits
   are all on the trunk. A SessionStart hook (`.claude/hooks/branch-check.sh`)
   lists the other branches on origin at the start of each session.

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
   blocked, log exactly what is blocked and on whom in the status log of
   `AUTOPILOT.md` in `JamesLiuZX/command`.
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
5. **Small pushes, every session, to `master`.** Land working state as the
   Branching section above says, before the session ends. Containers are
   ephemeral, and a commit that never reaches `master` is invisible to the next
   session.

## Where things live

- `AUTOPILOT.md` — **moved to the private HQ repo `JamesLiuZX/command`**:
  cross-project queue, priorities, autopilot loop, human-only blockers,
  weekly status log. Read and log there; the local file is a pointer stub.
  This CLAUDE.md stays for repo-specific doctrine.
- `content/schedule.json` — the posting queue (single source of truth).
- `BROWSER-POSTING.md` — the Cowork/browser-agent posting prompt. Posting to
  LinkedIn/X/Medium/Substack happens through it, on James's logged-in browser.
- `PUBLISHING.md` / `DEPLOY.md` — API cross-post pipeline and site deploys.
- `WRITING.md` — voice contract, enforced by `npm run content:check`.

## Daily commands

```bash
npm run check          # content gate + schedule integrity. Must pass before landing on master.
npm run publish:dry    # what cross-posting would do today
npm run linkedin:list  # the atom queue with visible folds
```

## Compliance (unchanged, absolute)

Never post non-public metrics, unreleased roadmaps, customer data, or
confidential Crypto.com / ByteDance details. Every published number traces to
`research/SOURCES.md`.
