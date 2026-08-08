---
title: "A checklist, not a model"
slug: 15-a-checklist-not-a-model
author: James Liu
series: Market Ops Notes
section: agents
summary: "The same 77-word post scores 95/100 on one copy of this site's own quality gate and 66/100 on another. Both are real. Neither is wrong. They are checking different things, and I found that out by accident."
status: published
publishAt: 2026-08-08T07:20:00Z
platforms: twitter, medium, substack
tags: ai, agents, content-ops, evals
twitterExcerpt: "Same 77-word post. 95/100 on one copy of this site's quality gate, 66/100 on another. Both real. I found the drift by accident while building a demo."
demo: slop-gate
---

<!-- EVIDENCE
Claim: This repo documents itself as having "one analyzer" with three consumers, but two separately maintained copies of the scoring function exist and have quietly drifted apart, disagreeing on both which checks run and how harshly a failure is scored.
Moment: Running the same clean 77-word LinkedIn post through both copies while building the Slop Gate demo and getting 95/100 from one and 66/100 from the other, for identical text.
Numbers: scripts/lib/analyze.mjs runs 11 checks on a post; scripts/content-check.mjs runs 21, ten more. The two score differently: 14 points off per fail and 5 per warn in the browser copy, 10 and 4 in the CI copy. The same 77-word test post scored 95/100 on the browser copy, 0 fails and 1 warn, and 66/100 on the CI copy, 3 fails (registered, evidence, provenance) and 1 warn. Both copies share the same 40-phrase LLM-tell list and the same 11-phrase engagement-bait list.
Names: scripts/lib/analyze.mjs, scripts/content-check.mjs, Slop Gate, the posting dashboard.
Cost: I found this by comparing the two files to decide which one Slop Gate should call, not by setting out to audit the pipeline. The header comment in scripts/lib/analyze.mjs still claims to be the one implementation content-check.mjs consumes, which has not been true since whenever the two forked. I did not fix the drift in this pass. Rewriting scoring code that six already-published essays' displayed scores depend on is a bigger, separate decision than shipping a demo, and it deserves its own review rather than a quiet side effect of an unrelated piece of writing.
Counterexample: for text that already cleanly passes every shared check, no em dashes, a real hook, a receipt, low hedge density, the ten extra checks change nothing, because none of them fire. The gap only shows up on text that is otherwise clean but structurally unregistered, missing an evidence block, or missing a derivedFrom pointer, which describes a pasted paragraph with no frontmatter and almost nothing else.
Reader action: if two tools in your own stack both claim to implement "the" version of a rule, run the same input through both before trusting either number. That is the exact check that found this drift.
-->

# A checklist, not a model

Same 77-word post. 95 out of 100 on one copy of this site's own quality gate. 66 out of 100 on another. Not a different draft, not a different day, the identical string of text, scored by two functions that both live in this repository and both call themselves the analyzer.

The post is the "tightened" example inside the Slop Gate demo: a claim, two numbers, an admission, a Takeaway line. `scripts/lib/analyze.mjs`, the browser-safe copy the dashboard and Slop Gate both import, scores it 95, docked 5 points for one warning on sentence-length variance, nothing else. `scripts/content-check.mjs`, the version the CI gate actually runs before anything ships, scores the same text 66, docked for three hard failures: no frontmatter, no evidence block, no `derivedFrom` pointer. All three are real requirements. None of them are things a bare paragraph pasted into a textbox could ever have, since frontmatter, an evidence block, and a `derivedFrom` field are properties of a file in this repo's specific format, not properties of English prose.

## What a checklist actually checks

Strip away which copy you are looking at and the mechanism underneath both is the same, and it is worth being plain about how unglamorous it is. There is no model call anywhere in either file. `scripts/lib/analyze.mjs` runs 11 checks: no em dashes, ends with a Takeaway line, none of 40 shared LLM-tell phrases, no manufactured "not merely A, it is B" triad, none of 11 engagement-bait phrases, a hook that lands, specificity density above a threshold, at least one receipt, sentence-length variance, hedge-word density, word count. `scripts/content-check.mjs` runs those same 11 plus 10 more that only make sense inside this repo's own publishing pipeline: registered (has frontmatter at all), named sourcing instead of vague appeals to authority, the evidence block itself, no unfilled `{{ }}` slots, a `derivedFrom` trail back to a source essay, and five LinkedIn-specific checks on the fold, the character count, whether the markdown renders clean, the hashtag count, and outbound links sitting in the body instead of the first comment. Regex, string matching, arithmetic on word counts. That is the entire mechanism, on both sides of the drift.

The reason this is worth a full piece rather than a footnote is that a checklist catching AI-flavored prose is itself a small, useful finding independent of the drift: none of the checks on either side, 11 or 21, require a model, a training run, or an API key, and the same 40-phrase tell list that flags corporate-blog filler and manufactured urgency in a stranger's LinkedIn post is the list this repo runs against its own drafts before anything with James's name on it ships. A generic slop-flavored paragraph run through it scores 0, twice over, docked on both copies for em dashes, tells, a manufactured triad, no hook, and zero receipts, all five findings visible in the demo without touching a model.

## Where the two copies actually disagree

The scoring formulas are different by design choice, not typo: `scripts/lib/analyze.mjs` computes `100 - fails * 14 - warns * 5`, `scripts/content-check.mjs` computes `100 - fails * 10 - warns * 4`. A single hard fail costs 4 more points on the browser copy than on the CI copy. That alone would produce close but not identical scores on shared checks. It is not what produced a 29-point gap on the tightened example, because that gap came entirely from the 10 checks that only exist in the CI copy: three of them, registered, evidence, provenance, fired on a piece of text that has no way to satisfy them because it has no frontmatter to register, no comment block to hold an evidence section, and no `derivedFrom` field pointing at a source essay. The CI gate is not wrong to check these. They are the actual mechanism that stops an unregistered file from silently shipping, the exact failure mode the top of `content-check.mjs` names directly: "an unregistered file is not a draft, it is a file the system cannot see." A demo running arbitrary pasted text has no file to register in the first place, which is why Slop Gate deliberately calls the lighter, 11-check copy and says so in its own build note, rather than quietly inheriting three fails that mean nothing outside this repo's own conventions.

That distinction, and the header comment's stale claim of "one implementation," are two separate findings, and only the second one is a real bug. `scripts/lib/analyze.mjs` opens with a comment naming `scripts/content-check.mjs` as a consumer of the shared function. It is not. `content-check.mjs` carries its own complete, independently maintained copy of every shared rule, which is how the 10-check gap and the 14-versus-10 scoring difference were able to open in the first place: two people, or two sessions, editing what was meant to be one file, in two different files that happen to start from the same rule tables.

## The counterexample, and why it is not a bigger deal than this

None of this matters for text that already cleanly passes every shared check. Run a piece with no em dashes, a real hook, a receipt, and reasonable sentence variance through both copies and they agree, because the 10 extra checks in the CI copy simply do not fire on clean prose that also happens to have proper frontmatter. The gap is specific to the boundary this piece is about: text that is fine as writing but structurally unregistered in the repo's own sense. That is a narrow, mostly cosmetic seam for a demo whose entire premise is a pasted paragraph. It would stop being cosmetic the moment anyone tries to use `lib/analyze.mjs`'s score as a stand-in for whether a real file would pass CI, which is exactly the assumption the stale header comment invites and exactly why leaving it there uncorrected, even after finding this, is the part of this piece that costs something to admit.

## What to check Monday

If two tools in your own stack both claim to be "the" implementation of a rule, a scoring function, a validator, a linter config copied into two repos, run one input through both before trusting either number. Diverging output is not a hypothetical failure mode, it is what two independently maintained copies of the same logic do by default, quietly, without either one throwing an error, and the only way to catch it is the boring one: pick a test case and check that two things which claim to agree actually do.

Takeaway: a checklist beats a vibe check, but only if there is one checklist. The moment "the" analyzer has a second copy, it has stopped being the analyzer, and nothing will tell you that except running the same input through both.
