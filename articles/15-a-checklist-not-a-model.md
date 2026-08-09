---
title: "A checklist, not a model"
slug: 15-a-checklist-not-a-model
author: James Liu
series: Market Ops Notes
section: agents
summary: "The same 77-word post scored 95/100 on one copy of this site's quality gate and 66/100 on another. Both were real. I found the drift by accident, then merged the two into one, and the gap that is left is now the correct kind."
status: published
publishAt: 2026-08-08T07:20:00Z
platforms: twitter, medium, substack
tags: ai, agents, content-ops, evals
twitterExcerpt: "Same 77-word post. 95/100 on one copy of this site's quality gate, 66/100 on another. I found the drift by accident, merged the two, and the remaining gap is the correct kind."
demo: slop-gate
---

<!-- EVIDENCE
Claim: This repo documented itself as having "one analyzer" with three consumers, but two separately maintained copies of the scoring function existed and had quietly drifted apart, disagreeing on both which checks ran and how harshly a failure was scored. Merging them into one shared core removes the drift; a 30-point gap remains on the same test case, and it is now entirely the correct kind: checks a real repo file can satisfy and a pasted paragraph structurally cannot.
Moment: Running the same clean 77-word LinkedIn post through both copies while building the Slop Gate demo and getting 95/100 from one and 66/100 from the other, for identical text.
Numbers: before the merge, scripts/lib/analyze.mjs ran 11 checks on a post at 14 points off per fail and 5 per warn; scripts/content-check.mjs ran 21 at 10 and 4. After the merge both pull the same 12 shared checks and the same scoring function from scripts/lib/analyze.mjs; content-check.mjs adds 9 more that need a real file. The 77-word test post now scores 96/100 on the shared core (0 fails, 1 warn) and 66/100 through content-check.mjs (3 fails: registered, evidence, provenance; 1 warn), a 30-point gap, entirely from those 3 checks.
Names: scripts/lib/analyze.mjs, scripts/content-check.mjs, Slop Gate, the posting dashboard.
Cost: I found the drift by comparing the two files to decide which one Slop Gate should call, not by setting out to audit the pipeline, and the header comment in scripts/lib/analyze.mjs had been claiming to be the one implementation content-check.mjs consumes since before that stopped being true. Fixing it changed what the dashboard displays for every post in this repo, including ones already scheduled, and I did not spot-check every one of them by hand before merging, only confirmed that npm run check still reports zero blocking failures on non-draft content and that no score dropped enough to flip a pass into a fail.
Counterexample: for text that already cleanly passes every shared check, no em dashes, a real hook, a receipt, low hedge density, the 9 extra checks change nothing, because none of them fire. The gap only shows up on text that is otherwise clean but structurally unregistered, missing an evidence block, or missing a derivedFrom pointer, which describes a pasted paragraph with no frontmatter and almost nothing else.
Reader action: if two tools in your own stack both claim to implement "the" version of a rule, run the same input through both before trusting either number. That is the exact check that found this drift, and it is also the check that will catch the next one.
-->

# A checklist, not a model

Same 77-word post. 95 out of 100 on one copy of this site's own quality gate. 66 out of 100 on another. Not a different draft, not a different day, the identical string of text, scored by two functions that both lived in this repository and both called themselves the analyzer.

The post is the "tightened" example inside the Slop Gate demo: a claim, two numbers, an admission, a Takeaway line. `scripts/lib/analyze.mjs`, the browser-safe copy the dashboard and Slop Gate both import, scored it 95, docked 5 points for one warning on sentence-length variance, nothing else. `scripts/content-check.mjs`, the version the CI gate actually runs before anything ships, scored the same text 66, docked for three hard failures: no frontmatter, no evidence block, no `derivedFrom` pointer. All three are real requirements. None of them are things a bare paragraph pasted into a textbox could ever have, since frontmatter, an evidence block, and a `derivedFrom` field are properties of a file in this repo's specific format, not properties of English prose. That part of the gap was correct on both sides. What was not correct was that two files were independently deciding it.

## What a checklist actually checks

Strip away which copy you are looking at and the mechanism underneath both was the same, and it is worth being plain about how unglamorous it is. There is no model call anywhere in either file. Regex, string matching, arithmetic on word counts: no em dashes, ends with a Takeaway line, none of 40 shared LLM-tell phrases, no manufactured "not merely A, it is B" triad, none of 11 engagement-bait phrases, a hook that lands, specificity density above a threshold, at least one receipt, a named source instead of a vague appeal to authority, sentence-length variance, hedge-word density, word count. Twelve checks, and every one of them means something on a pasted paragraph with no file behind it at all, which is why they now live in one place, `scripts/lib/analyze.mjs`, and both `content-check.mjs` and the Slop Gate demo call that same function instead of each keeping a copy.

The reason this is worth a full piece rather than a footnote is that a checklist catching AI-flavored prose is itself a small, useful finding independent of the drift: none of the 12 shared checks require a model, a training run, or an API key, and the same 40-phrase tell list that flags corporate-blog filler and manufactured urgency in a stranger's LinkedIn post is the list this repo runs against its own drafts before anything with James's name on it ships. A generic slop-flavored paragraph run through it scores 16, docked for em dashes, tells, a manufactured triad, no hook, and zero receipts, five findings visible in the demo without touching a model.

## Where the two copies actually disagreed, and what changed

The scoring formulas were different by design choice, not typo: the browser copy computed `100 - fails * 14 - warns * 5`, the CI copy computed `100 - fails * 10 - warns * 4`. A single hard fail cost 4 more points on the browser copy than on the CI copy, which alone would have produced close but not identical scores on shared checks. It was not what produced a 29-point gap on the tightened example, because that gap came almost entirely from checks that only existed in the CI copy: three of them, registered, evidence, provenance, fired on a piece of text that has no way to satisfy them, since it has no frontmatter to register, no comment block to hold an evidence section, and no `derivedFrom` field pointing at a source essay. The CI gate was not wrong to check these. They are the actual mechanism that stops an unregistered file from silently shipping, the exact failure mode the top of `content-check.mjs` names directly: "an unregistered file is not a draft, it is a file the system cannot see." A demo running arbitrary pasted text has no file to register in the first place, which is why Slop Gate deliberately calls the lighter, shared-core function and says so in its own build note, rather than quietly inheriting three fails that mean nothing outside this repo's own conventions.

The fix was mechanical: move the 12 shared checks and the one scoring formula into `scripts/lib/analyze.mjs`, have `content-check.mjs` import that and layer its 9 file-specific checks on top rather than keeping a second hand-copied table of the same 40 tell phrases and the same receipt patterns. Both files' behavior on a real repo file, an actual article or post with frontmatter, is unchanged by the merge: `npm run check` still reports zero blocking failures on non-draft content after it, the same result as before. What changed is that the browser copy's receipts check now uses the stronger 12-pattern list the CI copy always used, instead of a 5-pattern list that could not see an artifact path or a link as a receipt, and the browser copy gained the named-sourcing check it never had. The 77-word test post scores 96 on the shared core now, not 95, because the scoring formula unified onto the CI copy's weighting. The gap to the CI-only 66 is 30 points, not 29, for the same reason.

## The counterexample, and what is left after the fix

None of this matters for text that already cleanly passes every shared check. Run a piece with no em dashes, a real hook, a receipt, and reasonable sentence variance through both and they still agree, because the 9 extra checks in the CI copy simply do not fire on clean prose that also happens to have proper frontmatter. The remaining 30-point gap on the tightened example is not a bug anymore, it is the correct answer to a real question: this text is fine as writing and is not a registered file in this repo. That is a narrow, structural fact about a pasted paragraph, not a disagreement between two implementations that should agree.

What is left to admit is smaller and more boring than the original finding, which is usually how a real fix goes. I confirmed the gate still reports 0 blocking failures across all 32 files in `articles/` and `posts/` after the merge, the same result as the 32-file run before it. I did not go read every one of the roughly 20 scheduled posts' dashboard scores by hand to see which ones moved a few points in either direction, because none of them can flip from passing to failing on a formula change alone, only a fail or warn count changing does that, and those counts did not change for anything already shipping. That is a real gap in how thoroughly I checked my own fix, and it is the honest version of "I tested the part that could break something and trusted arithmetic for the rest."

## What to check Monday

If two tools in your own stack both claim to be "the" implementation of a rule, a scoring function, a validator, a linter config copied into two repos, run one input through both before trusting either number. Diverging output is not a hypothetical failure mode, it is what two independently maintained copies of the same logic do by default, quietly, without either one throwing an error. The fix is not more code, it is less: delete one of the copies and make the other one the only place the rule lives.

Takeaway: a checklist beats a vibe check, but only if there is one checklist. Finding a second copy is a bug report. Deleting it, not documenting around it, is the fix.
