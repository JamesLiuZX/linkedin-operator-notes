---
title: "The 30-second test I run before a market lists"
slug: 05-settle-explainer-test
pillar: field-notes
section: markets
status: ready
derivedFrom: articles/01-three-trust-surfaces.md
publishAt: 2026-08-18T01:00:00Z
platforms: linkedin
tags: markets, resolution, product
---

<!-- EVIDENCE
Claim: If someone outside the team cannot explain how a market settles in 30 seconds, the market is not ready to list, and that test catches more disputes than any oracle upgrade.
Moment: Watching a scanner I wrote flag 3 of 13 sample questions as too thin to even analyse, all of them under 25 words, all of them the kind of question that reads perfectly well in a feed.
Numbers: 30 seconds, 3 of 13 fixtures under 25 words, 15 rules in the scanner, top score 67 of 100 driven by an undefined qualitative threshold.
Names: tools/resolution-risk, npm run risk, the settle explainer, named source of truth, tie clause.
Cost: I wrote 1,500 words arguing resolution is a UX surface before I wrote a single line that would catch a bad question, and the essay scored 3.6 specifics per 100 words against a bar of 6. It was advice, not a tool.
Counterexample: The test rewards questions that are easy to explain, which biases toward boring markets. Some genuinely interesting questions are hard to settle and worth listing anyway, with the ambiguity disclosed rather than hidden.
Reader action: Take your next listing, hand the resolution rules to someone outside the team, and time them explaining it back including what happens if the source is late.
-->

## Draft

Hand your resolution rules to someone outside the team. Give them 30 seconds.

If they cannot tell you how it settles, and what happens when the source is late or contradicts itself, the market is not ready to list. That is the whole test.

It sounds soft. It is the hardest gate I know, because the questions that fail it are exactly the ones that perform in a feed.

I ran 13 sample questions through a 15-rule scanner in tools/resolution-risk. 3 of them came back under 25 words, too thin to analyse at all. Short, punchy, screenshot-friendly, and carrying 0 named sources of truth between them. The worst scored 67 of 100 on dispute risk for 1 reason: it hinged on a word that no 2 people would define the same way.

I built that scanner after writing 1,539 words arguing resolution is a UX surface. My own gate scored that essay at 3.6 specifics per 100 words against a bar of 6. It was advice. The 15 rules are the version that catches something.

Nobody argues with a settle they understood before they committed. They argue with a settle that felt negotiable afterwards.

So the explainer is a listing artifact, not a legal appendix. Named source. What happens if that source is late. What happens on a tie, an abandonment, a cancellation. Plain sentences, written before marketing writes the headline, not after support inherits the gap.

The cost of skipping it is not the dispute. It is that one messy outcome spends the trust balance built by every clean settle before it, and the balance refills slower than it drains.

Takeaway: if writing the settle explainer makes you squirm, that feeling is the product telling you something.

## First comment

The scanner and its 15 rules: github.com/JamesLiuZX/linkedin-operator-notes/tree/master/tools/resolution-risk

The longer argument, including the two other surfaces where market products leak trust: /markets/01-three-trust-surfaces
