---
title: "I wrote the style guide, then broke it eight times out of eight"
slug: 03-gate-rejected-my-drafts
pillar: how-i-build
section: shipping
status: ready
derivedFrom: WRITING.md
publishAt: 2026-08-11T01:00:00Z
platforms: linkedin
tags: writing, systems, ai
---

<!-- EVIDENCE
Claim: A writing standard that is documented but unenforced is worse than no standard, because it teaches the author that the contract is decoration.
Moment: Running the quality gate across my own corpus for the first time and watching it report 28 failures and 0 blocking failures in the same line of output.
Numbers: 8 of 8 drafts missing the mandatory Takeaway, 7 of 8 containing the banned em dash, 7 of 8 with no verifiable receipt, 28 failures total, 0 of them blocking, 0 of 14 files containing the evidence block the standard calls mandatory.
Names: WRITING.md, content-check.mjs, the evidence block, npm run content:check.
Cost: I wrote the standard, I wrote the checker, I wrote the drafts, and I still shipped a corpus where the most important rule in the system had never once been followed. Nobody else to blame for that one.
Counterexample: A gate tuned too hard is its own failure. Blocking every draft means work in progress cannot live in the repo, so unfinished work moves to a private folder where no standard reaches it at all.
Reader action: Run your own linter over your own back catalogue before you write anything new, and check what percentage of the failures are actually blocking.
-->

## Draft

I wrote a writing standard, a linter to enforce it, and 8 drafts that failed it.

The report was the interesting part. 28 failures. 0 of them blocking.

One line of code explained why:

const isDraft = (data.status || 'draft') === 'draft';

None of the drafts had frontmatter. So every file defaulted to draft. So every failure was advisory. So the CI badge stayed green over a corpus where 7 of 8 posts broke three hard rules each.

The tally, since a specific beats a lesson:

· 8 of 8 missing the Takeaway line the standard calls mandatory.
· 7 of 8 containing the em dash the standard bans outright.
· 7 of 8 with no number, no date, and no admission. Nothing a reader could check.
· 0 of 14 files containing the evidence block that the standard says must exist before drafting starts.

That last one is the real finding. The most important rule in the system had a 100% violation rate and no check behind it. A rule like that does not sit neutral. It teaches you that the contract is decoration, and the lesson generalises to the rules that were being enforced.

The fix was not more rules. It was making an unregistered file block rather than default to draft, and making the evidence block a check instead of a paragraph.

Takeaway: a standard nobody can fail is a preference, and preferences lose to deadlines.

## First comment

The standard, the checker, and the full review that produced these numbers: github.com/JamesLiuZX/linkedin-operator-notes

The one-line default that made every check advisory is in scripts/content-check.mjs. It is the cheapest kind of bug to write and the most expensive kind to leave.
