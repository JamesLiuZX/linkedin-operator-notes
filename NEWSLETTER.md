# NEWSLETTER.md: The Weekly Run, every Tuesday

The scheduled task "Weekly Run (Tuesdays, 09:41 SGT)" runs this file in a cloud
session. It needs no laptop. If `hub/content/issues/` already has an issue
dated today, stop: another run made it. One run produces one issue:

1. **The issue**, `hub/content/issues/<date>-<slug>.json`. The site page, the
   feed, the email and the text version are all built from this one file.
2. **A LinkedIn post** for the workflow of the week, `posts/wk-<date>-<slug>.md`,
   unless that workflow already has a post on the schedule for this date. It
   is queued for James's supervised posting session and never posted by the run.
3. **Receipts** in `research/SOURCES.md` for every number in the issue.
4. **The email**, sent later the same day by GitHub Actions
   (`.github/workflows/weekly-send.yml`, 12:00 UTC, which is 20:00 in
   Singapore). The run itself sends nothing.

Issue 1, `2026-11-18-a-prototype-you-can-switch-on-and-off`, is the reference.
Match its shape and its voice.

## The reader

Product managers first, then the researchers, analysts and strategy people who
work beside them. They use AI every day and distrust most of what it writes.
They want one thing they can run this week, and to know what changed that
affects them. Four minutes. No hype.

## The six parts, in this order, every week

| # | Part | Field | Rule |
|---|---|---|---|
| 01 | The workflow | `workflow` | One workflow from the handbook. Why it exists, four steps, one line to paste |
| 02 | Try it | `demo` | One sentence. The email adds the still and the button |
| 03 | Three things | `things` | Exactly three. Each has what happened, why it matters, the catch and a source |
| 04 | One tip | `tip` | A habit that makes agent output easier to trust. Under 60 words |
| 05 | One number | `number` | One sourced figure, with what it is a share of |
| 06 | Changelog | `changelog` | What changed in the skills since the last issue. Omit when nothing did |

## 1. Choose the workflow

1. If a workflow's LinkedIn post is on `content/schedule.json` for today, use
   that workflow.
2. Otherwise, if a skill changed since the last issue (see step 5), use it.
3. Otherwise use the workflow that has gone longest without an issue. Read the
   earlier issues to find out.

Write `workflow.why`, `steps`, `prompt` and `matters` from the workflow's own
page (`hub/content/workflows/<slug>/meta.json`) and its skill. Do not claim
anything the page does not. `steps` are four, each under 25 words. `prompt` is
one line a reader can paste. `matters` is one sentence and has no number in it.

## 2. Choose the three things

Take them from the AI digest editions published since the last issue
(`digests/*.json`). Those are already researched, sourced and gated.

- Pick the three with the most effect on someone who ships a product: a new
  capability they can use, a price or a default that changes, a rule or an
  incident that changes what they should do.
- Rewrite each one for this reader. `what` is what happened, with the date.
  `why` is what it changes for a product team. `catch` is the limit: vendor
  reported, not out yet, costs more than it looks, tested by its maker.
- Keep the digest's source link. Every number has to be in the digest's
  receipts already, word for word.
- If the digests hold fewer than three good items, research the gap the way
  `DIGEST.md` section 1 says, and add receipts.

## 3. Write the tip and the number

- **Tip.** One habit, stated as an instruction, with the reason. It must not
  repeat an earlier issue's tip. Search `hub/content/issues/` first.
- **Number.** One figure from a named source, with a link, that bears on the
  workflow of the week. Add a row to "AI Workflow Handbook receipts" in
  `research/SOURCES.md`. If you cannot find one you can source, leave
  `number` out. Never estimate.

## 4. Title, preheader, hook

- `title`: what the reader gets, under 55 characters. No question, no issue
  number, no colon. It is also the email's subject line.
- `preheader`: 60 to 110 characters. It names the three things. It does not
  repeat the title.
- `hook`: two or three sentences that say why this workflow, this week.
- `n` is the last issue's number plus one. `date` is today. The file name
  starts with the date.

## 5. Skills: fix one thing if something is broken

Check the repository's open issues for a report of a bad result. If there is
one you can reproduce, fix the skill. A fix is not finished until:

- the skill's own checker passes on every example it ships;
- `metadata.version` in `SKILL.md`, `version` and `changelog` in the workflow's
  `meta.json`, `version` in `skills/.claude-plugin/plugin.json` and a new entry
  in `hub/content/changelog.json` all move together;
- `npm run hub:templates` has been run if a page renderer changed.

List the change under `changelog` in the issue. If nothing changed, leave
`changelog` out. Do not invent activity.

## 6. The LinkedIn post

Skip this step when the workflow already has a post scheduled for today.

Otherwise write `posts/wk-<date>-<slug>.md` as a LinkedIn atom
(`WRITING.md` section 3). Copy the shape of `posts/hb-flagged-prototype.md`:

- the hook states a position or a number, in under 12 words;
- the body says what the workflow produces and what its check caught, in the
  first person and in plain text;
- `derivedFrom:` is the skill's `SKILL.md`;
- `media:` is the workflow's carousel and clip under `/hub/launch/<slug>/`;
- `## First comment` holds the link to the workflow page;
- the evidence block is filled in, and its Cost field says what the test run
  did not show.

Append one row to `content/schedule.json` for today at 09:00, `status: ready`,
copying a `hb-` row. Never re-plan an existing row.

## 7. Gate, land, log

1. `npm run check`. It must pass. It is never weakened or bypassed.
2. `npm run site:build` once, to see that the issue page builds.
3. Land on `master` as `CLAUDE.md` says. The push deploys the site.
4. Log one line in the status log of `AUTOPILOT.md` in `JamesLiuZX/command`.
5. Notify: "Weekly Run ready: <title>. It sends at 20:00 SGT. Reply to stop it."

## How the schedule is wired

The scheduled task does not start a new session each week. It wakes one
standing session, "Weekly Run: standing session for the handbook's weekly
newsletter", which has this repository as its source and can push to `master`.

That is deliberate. On 2026-11-18 a task that starts a fresh session on each
run was tested and its sessions had no tool for attaching a repository, so
they could not have read this file or landed anything. If the standing session
is ever archived or deleted, create a new session with this repository as its
source and `master` as its branch, check that it can push, and point a new
Tuesday task at it. Do not replace it with a task that starts fresh sessions
unless you have tested that such a session can reach the repository.

## Sending

`.github/workflows/weekly-send.yml` runs `node scripts/weekly-send.mjs` every
Tuesday at 12:00 UTC.

- With no `KIT_API_KEY` secret it prints what it would send and stops. The
  issue is still on the site and in the feed.
- With the secret and nothing else it creates a **draft** in Kit, so the first
  issues can be looked at before anything goes out.
- With the repository variable `KIT_SEND` set to `live` it schedules the send
  ten minutes ahead.

The script will not send the same subject twice, and it will not send an issue
dated more than six days ago.

To stop one send: delete the scheduled broadcast in Kit, or set `KIT_SEND` to
anything other than `live`.

## One-time setup, about ten minutes (James)

1. Create a free account at kit.com (the Newsletter plan) and verify the
   sender address.
2. Create a form. Keep the confirmation email on: that is the double opt-in.
3. In the form's Embed tab choose HTML and copy the address inside
   `<form action="...">`. Put it in a new file, `hub/subscribe.json`:

   ```json
   { "formAction": "PASTE THE FORM ADDRESS HERE", "emailField": "email_address" }
   ```

   The site's subscribe blocks turn into a real email field on the next deploy.
4. In Kit, Settings, Developer: create a v4 API key. Add it to this repository
   as the secret `KIT_API_KEY` (Settings, Secrets and variables, Actions).
5. Run the "Weekly send" workflow by hand once (Actions tab, Run workflow).
   Open the draft in Kit and check the footer, the sender and the audience.
6. When it looks right, add the repository variable `KIT_SEND` with the value
   `live`.

Until step 3 is done the subscribe blocks offer the feed and a LinkedIn
follow, and say that email delivery opens soon.

## Hard rules

- Never post to LinkedIn or anywhere else.
- Never invent a number, a quote or a source. Every number has a receipt.
- Label a vendor's claim as the vendor's claim.
- No em dashes or en dashes.
- Nothing internal or confidential from any employer, current or past. Every
  example stays generic and fictional.
- Never create an account, enter a key or change the sending settings.
- Append schedule rows. Never re-plan existing ones.
- Never force-push. Leave `git status` clean.
