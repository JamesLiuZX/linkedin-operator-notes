# Browser-driven posting

A second way to ship the queue, alongside [PUBLISHING.md](./PUBLISHING.md)'s
API-based one. That pipeline auto-posts to X directly and leaves LinkedIn,
Medium, and Substack as manual steps, on purpose: LinkedIn needs an approved
app for personal-profile posting, Medium's API is closed to new accounts, and
Substack has no publish API at all. A browser-automation agent (Claude in
Chrome, or anything equivalent) sidesteps all three, because it acts as you,
already logged in, rather than as an API client asking for a scope nobody will
grant.

This file is the prompt for that agent. Everything it needs to read comes from
`/dashboard`, not from re-parsing markdown, so the agent's job is paste and
click, not interpret.

---

## What this is and is not

**Fully autonomous, once you start it.** The agent picks the next due item,
posts it to every platform it targets, and marks it done, without stopping to
ask "does this look right?" on each one. The tradeoff that buys: a bad post
goes out exactly as fast as a good one.

Two things keep that from being reckless instead of just fast:

1. **The mechanical gate is a hard stop, not a request for permission.** If
   `/dashboard` shows a row with a gate failure, the agent skips it. That is
   not the agent asking you anything, it is the same gate `npm run
   content:check` runs, refusing on its own terms. You already decided what
   counts as postable when you wrote WRITING.md's rules; the agent is holding
   you to it, not asking you to re-decide per post.
2. **Cadence stays yours.** Nothing on my side fires this automatically. You
   open Claude in Chrome and paste the prompt below when you want a posting
   session to happen, daily or 3x a week or whenever. See
   [Cadence](#cadence-youre-driving-this-part) below for why it stayed this
   shape.

**What it does not do:** write anything, fix a failing gate score, decide
what's worth posting beyond what's already marked `ready`/`scheduled` in
`content/schedule.json`, or touch a platform you haven't listed as logged in.

---

## One-time setup

1. In the Chrome profile the agent controls, log into: LinkedIn, X, Medium,
   Substack, and GitHub (github.com, signed in as the account with push access
   to this repo). The agent reuses whatever session is already open; it does
   not handle 2FA or password prompts.
2. Confirm the site is live: `https://jamesliuzx.github.io/linkedin-operator-notes/dashboard`
   should load. If you've since moved to a custom domain or Vercel, swap the
   base URL in the prompt below.
3. Know your repo path: `JamesLiuZX/linkedin-operator-notes`, branch `master`.

---

## The prompt

Copy everything in the block below into Claude in Chrome to run a posting
session.

```
You are running a posting session for jamesliuzx.github.io/linkedin-operator-notes,
a personal content site. Work through this procedure exactly. Do not skip the
safety checks to save time, and do not improvise wording anywhere: every word
you post must come from the source page, copied, never typed from your own
paraphrase.

SITE = https://jamesliuzx.github.io/linkedin-operator-notes
REPO = https://github.com/JamesLiuZX/linkedin-operator-notes (branch: master)

## Step 1: Build the queue

Open SITE/dashboard. It lists every scheduled post, each scored by the same
quality gate the site's CI runs. For every row, in the order they appear,
check:

  - Does the row's date look due (today or earlier)? Rows dated in the future
    are not due yet, skip them.
  - Does the row show a red score, a "would fail the gate" badge, or a bulleted
    list of failures under the title? If yes, this row is INELIGIBLE. Skip it,
    do not post it, do not try to fix the text yourself.
  - Is the row's status chip "ready" or "scheduled"? If it says "idea",
    "drafted", or "published", skip it. "published" means this exact row was
    already handled in an earlier session.

Build an ordered list of eligible rows, oldest date first. If nothing is
eligible, stop here and report "nothing due" — do not invent something to post.

## Step 2: Post each eligible row, oldest first

For each row, look at its channel pill (LinkedIn / X / Site) and follow the
matching procedure. Do not mix procedures.

### Channel: LinkedIn

1. Click "Copy post" on the row. This copies the exact plain-text body,
   already stripped of markdown and notes. Do not add anything to it, do not
   fix typos, do not add hashtags or emoji that are not already there.
2. Go to linkedin.com, start a new post, paste. Confirm before posting that
   nothing pasted as a literal asterisk, pound sign, or markdown artifact — if
   it did, stop and report it rather than editing the paste by hand.
3. Publish the post.
4. Immediately click "Copy first comment" on the same row (skip this if the
   row has no such button). Open the post you just published, add the first
   comment, paste, submit. This is where the link lives — never in the post
   body itself.
5. On github.com, open REPO, navigate to content/schedule.json on the master
   branch, click the pencil (edit) icon. Find the object whose "id" field
   exactly matches this row's id (visible if you inspect the row, or match by
   the row's exact title text to the "title" field in the file). Change only
   that object's "status" value from "ready" (or "scheduled") to "published".
   Change nothing else on the page — not indentation, not any other field, not
   any other entry. Commit directly to master with a message like
   "posted: <row title>".

### Channel: X (Twitter)

1. The row shows one button per tweet: "Copy tweet 1/N", "Copy tweet 2/N", etc.
   If any button's label says "(over 280)", stop and report it instead of
   posting a thread you know is broken.
2. Go to x.com, start a new post, click "Copy tweet 1/N", paste, post it.
3. Reply to the tweet you just posted with tweet 2 (copy, paste, post as a
   reply). Continue in order until all N tweets are posted as a single reply
   chain.
4. Mark the row published in content/schedule.json on GitHub, same as the
   LinkedIn procedure above (step 5).

### Channel: Site (an essay, with cross-post actions)

This row represents an essay already live on the canonical site. Its actions
are for Medium and/or Substack, shown only when the essay's own frontmatter
lists that platform:

  - **If a "Medium" hint is shown:** click "Copy link" to copy the essay's
    canonical URL. Go to medium.com/p/import, paste the URL, let Medium fetch
    it, review the imported draft for formatting glitches, publish.
  - **If a "Substack" hint is shown:** open the canonical URL (from "Copy
    link") in a new tab — that is the live, rendered essay. Select all the
    article body (skip the site's own nav/header chrome), copy. Go to your
    Substack dashboard, start a new post, paste. Check that headings and links
    survived the paste. Set a title matching the essay's title, publish (or
    save as draft and publish yourself if you'd rather review Substack posts
    by hand — this platform has no import-by-URL option, so the paste is the
    whole mechanism).

Site rows do not get marked "published" in schedule.json — they already are,
that status describes the essay, not this cross-post action. If you want a
record that you've done the Medium/Substack pass for a given essay, say so in
your end-of-session report instead.

## Step 3: Hard rules, no exceptions

- Never write or rephrase post text yourself. Every character posted comes
  from a "Copy ___" button on the dashboard. If the dashboard has nothing to
  copy for a row, skip the row.
- Never post a row the dashboard shows with a gate failure, regardless of how
  minor it looks.
- Before posting anything, scan the copied text for: any mention of specific
  unreleased Crypto.com or ByteDance internal details, non-public metrics, or
  anything that reads like it should not be public. If you see anything like
  that, stop, do not post it, and report exactly what gave you pause.
- If a platform's login looks expired, or a page looks different from what
  this prompt describes, stop and report it rather than guessing your way
  through a changed UI.
- One row's full cycle (post, comment if applicable, mark done) before moving
  to the next. Never post to a second platform for a row you have not finished
  marking done, so a crash mid-session leaves a clean state to resume from.

## Step 4: Report back

End with a short list: what you posted where, with links, what you skipped
and why, and what you could not finish. Do not editorialize about whether the
posts are good, that decision already happened when the piece was scored and
scheduled.
```

---

## Cadence: you're driving this part

I don't have a way to drive your local Chrome from this repo's session, so
"3x a week" is a target for you to hit by opening Claude in Chrome and running
the prompt, not a job running unattended. Two ways to make that easier without
giving up the manual trigger:

- **A phone reminder**, 3x a week, that just says "run the posting session."
  The lowest-tech option and the one least likely to silently stop working.
- **Batch it.** The queue naturally holds multiple due rows if you skip a few
  days, since Step 1 builds the whole eligible list, oldest first, in one
  pass. Missing Monday does not mean losing Monday's post, it means Thursday's
  session posts both.

If you later want a truly unattended version, the missing piece is a scheduler
that can open Chrome, not the content pipeline; that pipeline (this dashboard,
the schedule, the gate) is already the part that doesn't need to change.

---

## Extending the queue

New posting sessions read `content/schedule.json` and `posts/*.md` /
`articles/*.md` exactly the way `/dashboard` always has. Add a new essay or
atom the normal way (see the root `README.md`'s "Adding an essay" / "Adding an
atom" sections), give it a `content/schedule.json` row with `status: ready`, a
`date`, and a `channel`, and it shows up in the next posting session's queue
with no other wiring. The gate is what decides whether it's postable, same as
every other piece in this repo.
