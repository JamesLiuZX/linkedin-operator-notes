# DIGEST.md: the AI digest, every two days

The scheduled task "AI digest (every 2 days)" runs this file in a cloud session
at 07:23 SGT on even-numbered days. It needs no laptop. If `digests/` already
has an edition dated today, stop: another run made it. One run produces one
edition:

1. **A portal page** on the site, `digests/<slug>.md`, live as soon as the run lands.
2. **A LinkedIn post and an X thread**, `posts/dg-<slug>.md`. They are queued
   for James's supervised posting session and never posted by the run.
3. **Media** rendered from card data `digests/<slug>.json` into
   `site/public/digests/<slug>/`: a 1080x1350 carousel as PNGs and as a PDF,
   plus `cover.png`.
4. **New course picks** appended to `content/courses.json`, which feeds `/courses`.
5. **Receipts** appended to `research/SOURCES.md`, and two rows in `content/schedule.json`.

The first edition, `2026-11-06-security-gets-a-unit-price`, is the reference.
Match its shape and its voice.

## The reader

PMs, founders and operators building with AI, especially in fintech, trading
and other regulated products (`00-positioning.md`). They want to know three
things: what shipped, what it changes for them this week, and what to do about
it. They do not want hype.

## 1. Research the last 48 hours

**How to look things up**
- Use WebSearch first.
- WebFetch only URLs that came back from a search, or that are linked from a
  page you already fetched. Never fetch a URL you built by hand: in an
  unattended run, a fetch that needs approval waits until it times out.

**Which sources to trust**
- Lead with primary sources: the company's own post, docs, repo or paper.
- Use a reputable roundup (AI Weekly, The Neuron, Sam on AI, TechCrunch, The
  Verge, SecurityWeek) only to find stories, or when the primary page will not
  load. When you use one, say so.

**Which items to pick**
- Pick 3 to 5 items by their impact on builders: releases, prices, licences,
  deprecations and shutdowns, security, agent tooling, and regulation that
  changes what a product team can ship.
- Skip funding rounds, rumours, leaks and hot takes unless they change a
  decision this week.
- For each item, record:
  - what happened, with the date
  - the number
  - why it matters for builders
  - the catch: is it vendor-reported, unreleased, or benchmarked by the vendor itself?
  - the source URLs

**Courses**
- Pick 2 or 3 courses that are new or freshly updated:
  - at least one free YouTube course from a university, a lab or a
    freeCodeCamp-grade channel
  - at least one Udemy course rated 4.4 or higher and updated within the last
    60 days
- Prefer courses that complement James's own: AI for PMs, AI agents for office
  work, and AI UGC ads. Never pick a direct competitor to one of them.
- Never repeat a URL that is already in `content/courses.json`.

**When there isn't enough news**
- If fewer than 3 items clear the bar, ship 3 strong ones rather than padding.
- If nothing clears the bar, skip the edition and log why.

## 2. Write

Slug format: `YYYY-MM-DD-<three-to-six-word-kebab-theme>`.

**Card data (`digests/<slug>.json`)**
- Copy the reference file's shape.
- `*word*` marks the accent colour.
- Keep the card copy short:
  - titles under 60 characters
  - "what" and "why" under 170 characters each
  - stat as short as possible: up to 4 characters sits beside its label, and
    anything longer stacks above it

**Portal page (`digests/<slug>.md`)**
- Frontmatter as in the reference, with `status: published` and
  `slides: <items + 3>`.
- One `##` section per item. Each has What happened, Why it matters, The catch,
  and a Sources line with links.
- Then "New courses worth an evening", then "My read", then a closing
  `Takeaway:` line.

**Post (`posts/dg-<slug>.md`)**

This is a LinkedIn atom per WRITING.md section 3, plus an `## X thread` section.

- **Hook:** one line under 12 words, with a number. The fold (the first 210
  characters) must carry a specific.
- **Body:** numbered items (1. to 5.), then courses using the `·` bullet, then
  "My read:", then a `Takeaway:` line, then at most 3 hashtags. Plain text only:
  no URLs and no markdown.
- **`derivedFrom:`** the digest page. Write the post fresh, because reprinting
  the page's sentences fails the 12% overlap check.
- **Evidence block:** fill in every field.
- **`## First comment`:** the site-relative link to the digest.
- **`## X thread`:**
  - Separate tweets with lines of `---`.
  - Use at most 9 tweets, each under 280 characters. Links count as 23.
  - Tweet 1 carries the whole story.
  - The link goes in the last tweet only.
- **Frontmatter:**
  - `status: ready`
  - `platforms: linkedin`
  - `digest: <slug>`
  - `media:` the carousel.pdf and cover.png paths
  - `publishAt:` 01:00 UTC (09:00 SGT) on the edition's date

**Receipts:** append a block under "AI digest receipts" in
`research/SOURCES.md`, with one row per number.

**Courses:** append each pick to `picks` in `content/courses.json`. Each pick
has these fields:
- `added`
- `digest`
- `title`
- `provider`
- `platform`: YouTube, Udemy, Coursera, Maven or Other
- `price`
- `url`
- `why`

**Schedule:** append two rows to `content/schedule.json` by copying the
reference rows:
- `dg-<slug>-li` at 09:00 and `dg-<slug>-x` at 21:00, both on the edition's
  date, so the news is posted while it is fresh. The first edition was made in
  an afternoon, so it was posted the next day.
- `status: ready`
- `week` counted from `startDate`

## 3. Media

1. Run `npm --prefix site ci`. Once per container is enough.
2. Run `npm run digest:render -- digests/<slug>.json`.
3. Before you land, look at a contact sheet of all the slides. One image is
   enough:

   ```
   ffmpeg -v error -y -i site/public/digests/<slug>/slide-%02d.png -vf "scale=360:-1,tile=4x2:padding=8:color=white" -frames:v 1 /tmp/contact.jpg
   ```

4. If a card is clipped or crowded, shorten its copy. Do not shrink the design.

## 4. Gate and land

1. `npm run check` must pass. It runs the content, schedule and digest checks.
2. `npm --prefix site run build` must succeed.
3. Land on master as the "Branching: one trunk" section of `CLAUDE.md`
   describes. The site deploys on push, so the portal page goes live when the
   run ends.
4. Add one line at the top of the status log in `JamesLiuZX/command`
   `AUTOPILOT.md`:

   `### YYYY-MM-DD HH:MM SGT: AI digest: <title>, <n> items, <m> courses, queued for posting`

5. Send a push notification: "AI digest ready: <hook>. Post it from the
   dashboard. The carousel and thread are on the row."

## Hard rules

- **Never post** to LinkedIn, X or anywhere else. Posting is James's supervised
  session (`BROWSER-POSTING.md`).
- **Never invent** a number, a quote or a course detail. Every number needs a
  receipt row.
- **Label vendor claims** as vendor claims. Never present a rumour, a leak or
  an unreleased product as shipped.
- **No em dashes or en dashes** anywhere, no LLM tells and no engagement bait
  (`WRITING.md`).
- **Nothing internal from any employer**, current or past.
- **Cards carry only text the run wrote and data it verified.** No logos, no
  screenshots of other companies' products, and no AI-generated images of real
  people.
- **Do not re-plan existing schedule rows.** Only append the two digest rows.
