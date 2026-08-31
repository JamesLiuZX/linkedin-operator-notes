# Reddit post proposals — UNPOSTED DRAFTS, James reviews and posts by hand

Status: **proposals only. Nothing below has been posted anywhere.** Per
AUTOPILOT doctrine, Reddit is manual-first: James reads the target
subreddit's live rules, decides, and posts from his own account. Automate
nothing here until two manual weeks show it lands.

## Rules verification — REQUIRED before posting, still owed

This session (2026-08-31) could not fetch reddit.com: the remote
environment's network policy blocks it, so the per-subreddit rules below
could NOT be read and are NOT quoted verbatim. Fabricating a quote would be
worse than leaving the box unticked, so the box is left unticked. Before
posting either draft, James must:

- [ ] Open the target subreddit's sidebar rules and wiki and read the
      self-promotion / blogspam rule in full.
- [ ] Check for a designated "share your project" weekly thread; if one
      exists, post there instead of the main feed.
- [ ] Confirm account standing meets any karma/age gates.
- [ ] Sitewide baseline (Reddit's own guidance, and every third-party guide
      found in search agrees): roughly 90% genuine participation to 10%
      self-promotion, disclose that you built the thing, never repost the
      same promo across subs.

If a sub's rules prohibit tool links outright, drop the link and post the
analysis alone; the analysis carries the value.

---

## Proposal 1 — r/PredictionMarkets (analysis-first, tool linked once)

**Why this sub:** the resolution-linter material is native here: it is
market-design analysis of a real, publicly documented dispute, not product
promotion. Every number below already passed this repo's gate in
`posts/09-resolution-linter.md` / `articles/07-the-sentence-is-the-product.md`
and traces to `research/SOURCES.md`.

**Suggested title:**
The Ukraine minerals market wasn't an oracle failure. The sentence was the
failure, and it was catchable before listing.

**Draft body:**

The Ukraine minerals market moved from 9% to 100% between 24 and 25 March
2025 and resolved YES with no agreement reached. An attacker cast 5M UMA,
about 25% of that resolution round. Everyone called it an oracle attack.

Read the resolution text again, though:

"This market will resolve YES if Ukraine officially agrees to the minerals
deal before April. The resolution will be determined by credible reporting."

Three undefined words: "officially," "before April," "credible." The oracle
was handed a sentence with no test in it, and a sentence with no test
resolves to whoever votes hardest.

I wrote 16 rules that lint the criteria text instead of judging the
outcome. No model call, just regex and a clause checklist: a named source,
a timezone, a fallback if the source fails, a void rule, edge cases, a
comparison operator on any threshold, then the constructions that precede
disputes (subjective adjectives, passive verbs with no actor, "before" with
no instant, AND/OR in one sentence with no grouping).

That market's original text scores 3/100. A rewrite of the same market
scores 95. Same event, same oracle, same traders. The only thing that
changed was the sentence.

The linter runs in the browser, free, no signup:
https://jamesliuzx.github.io/linkedin-operator-notes/demos/resolution-linter

Disclosure: I built it. Happy to run any market's criteria text through it
in the comments if you paste one.

---

## Proposal 2 — r/SideProject (build-share, the sub's stated purpose)

**Why this sub:** it exists for "I built this" posts, so rule risk is the
lowest of any candidate; still verify the live rules first. Numbers come
from `posts/15-workflow-roi.md` / `articles/13-the-stopwatch-not-the-forecast.md`
(METR trial, Claude Sonnet pricing), already gate-checked and sourced.

**Suggested title:**
I built a calculator after learning developers who felt 20% faster with AI
were measured 19% slower

**Draft body:**

METR ran a trial where 16 experienced developers forecast AI coding tools
would make them 24% faster. A stopwatch across 246 real tasks measured 19%
slower, and afterward they still self-reported 20% faster. Every
self-estimate pointed the same wrong direction.

I wanted the equivalent number for AI workflow automation generally, so I
built a small browser calculator instead of trusting a guess. Feed it
realistic token counts at published API rates ($2 in / $10 out per million
tokens) and the token line is almost never the biggest cost; it usually
sits two orders of magnitude under the human-time lines.

Review time is the real variable. At the defaults (400 tasks/month, $45/hr)
breakeven lands at 11 minutes of AI-assisted review per task; push review
to 14 minutes and monthly savings flips from about +$2,100 to −$890 with
nothing else changed.

No backend, no signup, runs entirely client-side:
https://jamesliuzx.github.io/linkedin-operator-notes/demos/workflow-roi-lab

Stack: vanilla JS + Vite, one JSON of published rates, and a quality gate
in CI that lints my own copy before it ships. Feedback welcome, especially
if your review-time numbers look different from the defaults.

---

## Considered and parked

- **r/ProductManagement** — known to be hostile to self-promotion and
  survey/blog links; the PM-opens-PRs material fits, but only as a
  text-only post with no link, and its atom is still gate-held
  (`posts/02-pm-opens-prs.md`, no derivedFrom). Revisit after it clears.
- One post per sub, spaced at least a week apart, per the 90/10 baseline.
