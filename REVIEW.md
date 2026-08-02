# Pipeline review

Read as two people at once: someone scrolling LinkedIn at 8:40am, and a hiring
manager who opened this repo after a recruiter forwarded the profile.

Reviewed at commit `88f92e8`. Scores are out of 5. Evidence is file-and-line, not vibes.

| # | Dimension | Scroller | Employer | Verdict |
|---|---|---|---|---|
| 1 | Hook and fold discipline | 2 | 3 | Hooks are written for a page, not for LinkedIn's 210-character cut |
| 2 | Proof and receipts | 1 | 1 | Eight atoms, zero verifiable numbers, zero links to shipped artifacts |
| 3 | Differentiation | 2 | 2 | Advice-shaped. Most paragraphs survive a find-and-replace of the author |
| 4 | Platform-native format | 1 | 3 | Drafts contain markdown LinkedIn cannot render. Paste produces literal `**` |
| 5 | Voice and AI-tell resistance | 4 | 4 | `WRITING.md` is genuinely good. The essays mostly honour it |
| 6 | Content architecture | 2 | 2 | Atoms are not derived from essays. Post 08 and Essay 01 overlap in public |
| 7 | Governance | 1 | 2 | The gate cannot fail. Every file is a draft, and drafts are advisory |
| 8 | Distribution coverage | 2 | 3 | The LinkedIn repo has no LinkedIn path. `linkedinPlainText` is dead code |
| 9 | Visual system | 2 | 2 | 20 Unsplash stock photos across 6 essays. Gavels and empty stadiums |
| 10 | Cadence and feedback | 2 | 2 | 13 pieces a month planned. Zero published. No performance capture |
| 11 | Compliance posture | 4 | 4 | Instincts are right. One filter is wrong for this domain |
| 12 | What the repo proves | - | 3 | Proves systems taste. Does not yet prove the market operating claim |

Aggregate: strong system design wrapped around content that has not paid for itself yet.

---

## 1. Hook and fold discipline

LinkedIn truncates the feed preview around 210 characters and inserts "see more".
Everything before the cut is the whole ad for the post. Nothing in the pipeline
knows that number exists.

`WRITING.md:65` requires "hook is a single line under 12 words", and
`scripts/content-check.mjs:176` checks the first *sentence*. A sentence is not a
fold. Post 01 spends its fold like this:

> Marquee events create the illusion of product-market fit. A World Cup final or a huge sports series can light up a prediction market product. Activity...

Three sentences, one idea, cut mid-word. The strongest line in that post
("what does Tuesday look like after the final?") is at character 1,180, which
roughly nobody reaches.

Measured folds across `posts/`: 7 of 8 spend the visible window on setup. Only
post 08 lands its claim inside the cut.

## 2. Proof and receipts

This is the failure that matters, and it is not close.

Run the gate: `posts/01` through `posts/07` fail `Has receipts` outright. Not one
number with a unit. Not one date. Not one named product. Not one admission of a
thing that broke. The strongest evidentiary sentence in the entire post corpus is
"When I worked an enterprise AI partnership end-to-end" (`posts/04`), which names
no partner, no year, no outcome.

The essays are better written and barely better evidenced. `articles/04` and
`articles/06` also fail `Has receipts`. Three of six essays fail specificity
density (`articles/01` scores 3.6 against a required 6.0).

Worse than absent evidence is evidence that cannot be checked. `articles/02:52`
argued from "public reporting around the 2026 World Cup window described sharp
post-final cool-downs", then told the reader to "treat secondary outlets as
directional, not gospel", and line 79 attributed a Kalshi and Polymarket volume
chart to Pew. An employer who cannot verify that citation discounts every number
in the piece, including the defensible ones. Two of the three receipts the old
gate found in the essay corpus were a stray `2026` inside a hero image URL.

As an employer this is the read: *this person writes well about markets and I
cannot verify they have ever operated one.* Every claim is "I've watched people..."
which is unfalsifiable and therefore worthless as a hiring signal. The pieces
would be equally publishable by a smart person who had read a lot of Twitter.

The repo makes this worse by having real proof and never using it:

- `scripts/ledger/` is an append-only, hash-chained, pre-registered forecasting
  ledger with a two-arm anchored/blind design and 19 passing self-tests.
- `tools/resolution-risk/` scores market criteria against 15 rules over 13 fixtures
  and flags "Will a major AI lab release a frontier model before July?" at 67 CRITICAL
  for three separate defects.
- `apps/` contains two shipped browser demos.

Zero posts and zero essays link to any of it. The proof was built and then left in
the drawer. `articles/01` argues that resolution ambiguity is a product defect while
sitting three directories away from a scanner that detects exactly that, and never
mentions it.

## 3. Differentiation

`00-positioning.md:33` sets the target precisely: "fabiano's topic strategy,
Kshitij's format, Paul's packaging discipline" — insider knowledge with money
attached, shown on screen.

The delivered content is none of those. It is numbered-list product wisdom:

- "Who owns integration after the press release" (`posts/04`)
- "What behavior is priced?" (`posts/03`)
- "Does it win the channel's ranking/quality bar?" (`posts/06`)

Each is true. Each is available in a thousand PM newsletters. The test in
`WRITING.md:135` ("find every sentence that could appear in any article on this
topic by any author") would delete roughly 60% of `posts/`.

The non-obvious claims James actually owns are sitting unwritten in
`PLAN-30-DAYS.md:47` ("most disputes are writing failures, not oracle failures")
and in the ledger's premise (most apparent LLM forecasting skill is borrowed from
the price it was shown). Those are positions someone could disagree with. The
posts contain no position anyone would argue against.

## 4. Platform-native format

`posts/*.md` ships a section literally headed "## Draft (copy to LinkedIn)". Copy
it to LinkedIn and you get:

```
1. **What is the next natural bet?**
```

Asterisks and all. LinkedIn renders no markdown. Measured artifacts per draft:
12, 6, 14, 12, 8, 14, 8, 6. Post 03 would paste with 14 pieces of visible syntax.

`scripts/publish/transform.mjs:161` defines `linkedinPlainText`. Nothing imports
it. It is dead code in a repository named `linkedin-operator-notes`.

Also missing: character budget (LinkedIn caps at 3,000), hashtag policy in the gate
(`01-profile.md` sets one, the checker does not know), and the link-in-first-comment
convention. Two posts embed a soft CTA that reads like a newsletter footer.

## 5. Voice and AI-tell resistance

The genuine strength. `WRITING.md` is the best artifact in the repo: it diagnoses
five root causes, ties every rule to one, and gives a bad-versus-good pair at
line 121 that actually teaches.

The essays largely deliver on it. `articles/01` has real rhythm and real lines
("Silence is UX too. People fill silence by assuming you're hiding something.").
`articles/02` and `articles/03` pass the full gate at 100/100.

Two leaks. First, `posts/` predate the contract and were never brought under it:
7 of 8 contain em dashes the spec forbids at `WRITING.md:47`, and 8 of 8 lack the
mandatory `Takeaway:`. Second, the em dash ban is enforced on `—` but the drafts
route around it with the "X. Not Y." cadence often enough that the rhythm gets
predictable across a run of posts.

## 6. Content architecture

`00-positioning.md:47` states the rule plainly: "Nothing is written twice. Atoms
are derived from essays, never composed independently."

Reality: `posts/01-07` were composed independently and the essays came later.
There is no `derivedFrom` field anywhere in the repo. `00-positioning.md:94` shows
a `derives:` YAML block that no script reads and no file contains.

The visible cost is cannibalization. `posts/08` and `articles/01` share their
whole spine and several near-verbatim sentences:

> posts/08: "In a social app, surprise is annoying. In a market, surprise feels extractive."
> articles/01: "In a social app, surprise is annoying. In a market, surprise feels extractive."

A reader who follows the LinkedIn account and the site gets served the same piece
twice with no acknowledgement, which reads as recycling rather than as a system.

## 7. Governance

The gate does not gate. `scripts/content-check.mjs:242`:

```js
const isDraft = (data.status || 'draft') === 'draft';
```

`posts/*.md` have no frontmatter at all, so every post defaults to draft, so every
failure is advisory. The current run reports **28 failures and 0 blocking failures**
across 14 files.
CI at `.github/workflows/content.yml:22` runs the checker and passes green over a
corpus where 7 of 8 posts violate three hard rules each.

The most important rule in the entire system is unenforced. `WRITING.md:86`: "No
drafting starts before this exists" about the evidence block. Grep the repo: the
string `EVIDENCE` appears in `articles/README.md` and nowhere else. Not one piece
of content has one. The checker strips HTML comments at
`scripts/content-check.mjs:134` and never asks whether one was there.

A rule that is documented, universally violated, and unchecked is worse than no
rule. It teaches the operator that the contract is decorative.

Related, and still open: `tools/content-desk/ContentDesk.jsx:35` reimplements the
rule tables inline with a comment claiming it "mirrors scripts/content-check.mjs".
Two copies of a standard is one copy and one future divergence. The desk was left
alone in this pass and now scores against an older, laxer ruleset than CI does.

## 8. Distribution coverage

`scripts/publish/index.mjs:30` registers three platforms: twitter, medium,
substack. The primary channel is absent, so the flagship surface is the only one
still driven by manual copy-paste out of a markdown file that contains markdown.

Worse, `posts/` is invisible to the publisher. `findDueItems`
(`scripts/publish/content.mjs:100`) requires status, platforms, and `publishAt`.
Posts have none, so the LinkedIn atoms cannot be listed, scheduled, dry-run, or
compliance-checked. `.publish/state.json` is `{"posts": {}}`. The pipeline has
never run against real content.

## 9. Visual system

`WRITING.md:79` is explicit: "A diagram you drew beats an Unsplash photo. Unsplash
is a fallback, not a default."

Count: 20 Unsplash images across 6 essays, 0 diagrams. `articles/01` carries five,
including a wooden gavel for the resolution section and an empty stadium for the
hero. The fallback became the default, and the system industrialized it with a
manifest, a fetcher, and per-slot preference lists.

Stock gavels are, to a market operator, the visual equivalent of "in today's
fast-paced world". Meanwhile the three-surface framework in `articles/01` is a
diagram waiting to happen, and the resolution-risk scanner emits a scored table
that would make a better figure than anything in the manifest.

## 10. Cadence and feedback

`00-positioning.md:46` commits to 4 demos, 2 essays, 1 teardown, and 6 to 8 atoms
per month. That is roughly 13 pieces monthly alongside a full-time PM job that
owns a live market. `PLAN-30-DAYS.md:11` itself names the risk: "this becomes the
fourth thing that gets built to 95% and never deploys."

Current state proves the concern. Fourteen pieces written, zero published, all
`publishAt` dates clustered in the next few weeks, `TRACKER.md` fully unchecked,
and the opportunities log empty.

There is also no learning loop. `README.md:66` names the right success metrics
(inbound from operators, real intros) and nothing captures them per piece. Without
that, the next batch is written from taste rather than from evidence, which is the
same failure the system was built to fix.

## 11. Compliance posture

The instincts are right and consistently applied: principle-level writing, explicit
per-post caution notes, no internal metrics.

One concrete defect. `scripts/publish/compliance.mjs:3` hard-blocks the word
`leverage` as "corporate filler". In a prediction markets and derivatives corpus,
leverage is domain vocabulary. Any honest essay about perps, margin, or liquidation
mechanics is now unpublishable by the tooling. Same overreach applies to `unlock`
and `robust` as bare word matches.

Second gap: the compliance module never checks for the things the README actually
warns about at `README.md:74` (non-public metrics, named unreleased work, customer
data). It checks style and calls it compliance.

## 12. What the repo proves to an employer

Honest read. The repo proves:

- Systems thinking. A hash-chained pre-registered ledger with an anchoring control
  arm is a serious design, and the self-test suite is real.
- Taste in written English, encoded as an enforceable contract.
- Ability to ship working tools alone.

The repo does not yet prove:

- That the author operates a market at exchange scale. That claim appears only in
  `01-profile.md` and is never evidenced in the content.
- That any of this reached an audience. Nothing is published.

The gap between the two lists is the whole problem. The build quality is a hiring
signal that the writing is currently failing to cash.

---

## What was changed in response

1. **The gate now gates.** Evidence blocks are required, unfilled receipt slots
   hard-fail, provenance is required on atoms, and files that omit frontmatter are
   no longer silently treated as drafts.
2. **LinkedIn became a first-class target.** Fold, character budget, unrenderable
   markdown, hashtags, and bare links are checked. `npm run linkedin` renders a
   paste-ready plain-text version and previews the cut.
3. **Atoms are derived, and cannibalization is detected.** `derivedFrom` is a
   required field, and a shingle-overlap check fails an atom that recycles its
   source essay verbatim.
4. **Receipts got harder to fake and impossible to invent.** The checker
   distinguishes a real receipt from an incidental number, and refuses to publish
   any file containing an unfilled `{{ }}` slot. Where only the author holds a
   number, the pipeline leaves a hole rather than filling it with fiction.
5. **The content was rewritten against all of the above.** The `posts/` queue is
   now 10 atoms: the two shipped proofs that had never been written up, two on
   the content system itself, three derived from essays, and three held on
   numbers only the author has. Seven score 100/100. Three are held, which is the
   correct state for a piece whose evidence does not exist yet.
6. **The flagship essay got a drawn figure.** `articles/assets/three-trust-surfaces.svg`
   replaces a stock stadium photo with the actual framework and its three operator
   tests, and `npm run apps` mirrors figures into the served site so the two
   copies cannot drift.
7. **The compliance filter stopped banning domain vocabulary** and started
   checking what `README.md` actually warns about: possible non-public metrics,
   unreleased roadmap, employer names adjacent to figures, customer anecdotes.

### Still open

- `tools/content-desk` duplicates the rule tables instead of importing them, so
  the browser scorer now lags CI.
- Five of six essays are held on unfilled evidence fields, and four still fail
  specificity density. They are drafts and the gate says so honestly, but they
  are the work that most needs the author's own numbers.
- Nothing has been published. Every structural finding here stays theoretical
  until something ships and the tracker gets a row in it.

Takeaway: the system was engineered well above the standard of the content it
governs, and its one structural bug was that every check was advisory. Making the
gate real, and pointing the content at the artifacts already in the repo, is worth
more than another six essays.
