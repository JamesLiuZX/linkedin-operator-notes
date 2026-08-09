# Cross-posting automation

Post on your site first, then sync to **LinkedIn**, **Twitter/X**, **Medium**, and
**Substack** on a schedule.

This is the API-based pipeline: it auto-posts to X and leaves LinkedIn, Medium,
and Substack as manual steps, for the reasons below. [BROWSER-POSTING.md](./BROWSER-POSTING.md)
covers the other mechanism, a browser-automation agent that closes those three
gaps by acting as you, already logged in.

## How it works

```
articles/*.md  ──►  site /{section}/{slug}  ──►  cron picks due posts
posts/*.md                                    ├── LinkedIn (prepares the paste, never posts)
                                              ├── Twitter (excerpt + link)
                                              ├── Medium (API or manual import queue)
                                              └── Substack (email-to-post)
```

**LinkedIn stays human.** Personal-profile posting needs an approved app with
`w_member_social`, which is not worth blocking a content system on. So the
publisher prepares the exact paste at `.publish/linkedin/<slug>.txt`, validates
it against the composer's real constraints, and reports `queued-import` rather
than pretending to publish. It hard-fails on:

- over 3,000 characters
- markdown left in the body, which LinkedIn renders as literal characters
- unfilled `{{ }}` slots

Preview any atom before scheduling with `npm run linkedin -- posts/<file>.md`,
which prints the visible fold, the paste, and the character budget.

1. Write content in `articles/` (long-form) or `posts/` (short atoms)
2. Add scheduling frontmatter (see below). Run `npm run content:check`
3. Deploy the site so you have a canonical path URL (`/{section}/{slug}`)
4. Cron (GitHub Actions or local) runs `npm run publish -- --scheduled`

Medium without an API token queues an import URL and does **not** mark the piece published.

## Frontmatter fields

Add these to any markdown file in `articles/` or `posts/`:

```yaml
---
title: "Your headline"
slug: my-post-slug
section: markets           # markets | agents | shipping | notes
status: scheduled          # draft | ready | compliance-checked | scheduled | published | queued-import | partial
publishAt: 2026-08-05T01:00:00Z   # UTC — 01:00 UTC = 09:00 HKT
platforms: twitter, medium, substack     # posts/ use: linkedin
derivedFrom: articles/01-three-trust-surfaces.md   # posts/ only, required by the gate
tags: markets, trust, product
twitterExcerpt: "Optional custom hook for the first tweet"
summary: "One-line blurb for the site card and OG tags"
figures:
  - slot: hero
    prefer: photoId1, photoId2
    queries: empty stadium seats
    requireAny: stadium, seat
---
```

**Status flow:** `draft` → `compliance-checked` → `scheduled` → (auto) `published`
(or `queued-import` / `partial` when Medium still needs a human / some platforms failed)

Only items with status `scheduled` or `compliance-checked` and a past `publishAt` will publish.

Canonical URL: `{SITE_URL}/{section}/{slug}` (hash URLs like `/#/slug` redirect).

## Setup (one time)

### 1. Deploy the site

Enable GitHub Pages in repo Settings → Pages → Source: **GitHub Actions**.

After deploy, set your canonical URL:

```bash
# .env
SITE_URL=https://jamesliuzx.github.io/linkedin-operator-notes
```

Or use Vercel/Netlify — any static host works.

### 2. API credentials — where to find everything

Copy `.env.example` → `.env` and fill in keys from the links below.

#### Portal / settings (get the keys)

| Platform | What you need | Open this link |
|----------|---------------|----------------|
| **Medium** | *(usually unavailable)* | Medium **stopped issuing new integration tokens**. See [API/Importing](https://help.medium.com/hc/en-us/articles/213480228-API-Importing). Use **Import a story** instead (below). |
| **Twitter / X** | Developer account + app | [developer.x.com](https://developer.x.com) → sign in → create Project + App |
| **Twitter / X** | API Key, API Secret, Access Token, Access Token Secret | [Developer Portal](https://developer.x.com/en/portal/dashboard) → your App → **Keys and tokens** (App must be Read and Write) |
| **Substack** | Post-by-email address | Substack → your publication → **Settings** → **Publishing** → **Post by email** |
| **Resend** (email for Substack) | `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) |
| **Resend** | Verified from-domain | [resend.com/domains](https://resend.com/domains) |

#### Medium (manual import — recommended)

Medium’s publish API is effectively closed for new accounts. Official stance: no new tokens; existing tokens still work; otherwise import a webpage.

1. Deploy the article on your site (`SITE_URL` must be live)
2. Open [medium.com/p/import](https://medium.com/p/import) (or Write → Import a story)
3. Paste the article URL, e.g. `https://yoursite/markets/01-three-trust-surfaces`
4. Review the draft and publish

When `MEDIUM_INTEGRATION_TOKEN` is empty, `npm run publish` queues the import URL in `.publish/medium-import-queue.jsonl` and returns `queued-import` (not published). `npm run publish:status` nags if a queue entry is older than 72 hours.

Only fill `MEDIUM_*` if you already have a **legacy** token from before Medium locked this down.

#### Official docs (how the APIs work)

| Platform | Docs | Endpoint we use |
|----------|------|-----------------|
| **Medium** | [Help: API/Importing](https://help.medium.com/hc/en-us/articles/213480228-API-Importing) (API closed for new tokens) | Manual import, or legacy `POST /v1/users/{userId}/posts` |
| **Twitter / X** | [docs.x.com — X API](https://docs.x.com/x-api/introduction) | `POST /2/tweets` |
| **Twitter / X** | [Create Post](https://docs.x.com/x-api/posts/create-post) | thread via `reply.in_reply_to_tweet_id` |
| **Twitter / X** | [Authentication](https://docs.x.com/resources/fundamentals/authentication) | OAuth 1.0a user context |
| **Substack** | No public publish API | Post-by-email only (see Settings above) |
| **Resend** | [resend.com/docs](https://resend.com/docs/api-reference/emails/send-email) | `POST /emails` to Substack’s post-by-email address |

#### Quick env map

| Env var | Platform | Source |
|---------|----------|--------|
| `MEDIUM_INTEGRATION_TOKEN` | Medium | **Legacy only** — leave empty unless you already have a token |
| `MEDIUM_USER_ID` | Medium | Legacy only — from `GET /v1/me` |
| `TWITTER_API_KEY` | X | App → Keys and tokens → API Key |
| `TWITTER_API_SECRET` | X | App → Keys and tokens → API Key Secret |
| `TWITTER_ACCESS_TOKEN` | X | App → Keys and tokens → Access Token |
| `TWITTER_ACCESS_TOKEN_SECRET` | X | App → Keys and tokens → Access Token Secret |
| `SUBSTACK_POST_EMAIL` | Substack | Settings → Publishing → Post by email |
| `SUBSTACK_PUBLICATION_URL` | Substack | Your pub URL, e.g. `https://you.substack.com` |
| `RESEND_API_KEY` | Resend | API Keys dashboard |
| `RESEND_FROM` | Resend | Verified sender, e.g. `publish@yourdomain.com` |
| `SITE_URL` | Your site | GitHub Pages / Vercel URL (canonical link + Medium import source) |

### 3. GitHub Secrets (for cloud cron)

Add these in repo Settings → Secrets → Actions:

```
SITE_URL
TWITTER_API_KEY
TWITTER_API_SECRET
TWITTER_ACCESS_TOKEN
TWITTER_ACCESS_TOKEN_SECRET
SUBSTACK_POST_EMAIL
SUBSTACK_PUBLICATION_URL
RESEND_API_KEY
RESEND_FROM
# Optional legacy Medium only:
# MEDIUM_INTEGRATION_TOKEN
# MEDIUM_USER_ID
```

### 4. Enable the cron

The workflow `.github/workflows/publish-schedule.yml` runs daily at **01:00 UTC (09:00 HKT)**.

Trigger manually anytime: Actions → "Publish scheduled posts" → Run workflow.

## Commands

```bash
npm run publish:list          # inventory of all content + schedule
npm run publish:status        # what's already been posted where
npm run publish:dry           # preview due posts without posting
npm run publish -- --now 01-three-trust-surfaces   # publish one now
npm run publish -- --scheduled                     # publish all due (cron uses this)
```

## Local cron (alternative to GitHub Actions)

```bash
crontab -e
```

Add (runs daily at 9am HKT):

```
0 9 * * * cd /Users/jamesl/Projects/linkedin-operator-notes && /usr/local/bin/npm run publish -- --scheduled >> /tmp/publish.log 2>&1
```

## Compliance checks

Before publishing, the script checks:

- No em dashes (`—`)
- No corporate filler words
- Status is `scheduled` or `compliance-checked`
- `platforms` and `publishAt` are set

Warnings (non-blocking): missing Takeaway section on articles.

## Substack note

Substack has no official publish API. This system sends an HTML email to your **post-by-email** address. Posts arrive as drafts — review and publish in Substack, or enable auto-publish in Substack settings if available.

## State tracking

Published URLs and timestamps are stored in `.publish/state.json` (committed by GitHub Actions after each run). Re-posting is prevented automatically.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Twitter 403 | App needs **Read and Write** permissions + Elevated access |
| Medium 401 | Regenerate integration token |
| Substack email not arriving | Check Resend domain verification; confirm post-by-email address |
| Nothing publishes | Run `npm run publish:list` — check `status` and `publishAt` |
| Wrong timezone | `publishAt` is UTC. HKT = UTC+8 |
