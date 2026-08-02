---
title: "I scored 13 market questions for dispute risk. One hit 67."
slug: 01-resolution-risk-scanner
pillar: prototype-in-public
section: markets
status: ready
derivedFrom: tools/resolution-risk/README.md
publishAt: 2026-08-04T01:00:00Z
platforms: linkedin
tags: markets, resolution, tooling
---

<!-- EVIDENCE
Claim: Most prediction market disputes are writing failures in the question, not oracle failures at settlement, and the bad sentences are detectable before listing.
Moment: Writing the third essay about resolution ambiguity and realising I had produced 1,500 words of advice and zero tools, so I built the linter instead of the fourth essay.
Numbers: 15 rules, 13 fixture markets, worst score 67 of 100 with 3 separate defects on one question, runs offline in about a second, 15 rules pinned by tools/resolution-risk/test.mjs.
Names: tools/resolution-risk, rules.mjs, npm run risk, npm run risk:test.
Cost: The fixtures are synthetic rather than sampled from a live venue, and the rule table is my judgement written down rather than anything trained or validated. Saying that out loud costs the demo its shine.
Counterexample: Over-tight criteria kill markets too. A question so narrowly specified that no ambiguity survives is often a question nobody wants to trade, and the scanner cannot see that failure at all.
Reader action: Run your next 10 draft questions through a rule list before marketing writes the copy. Anything scoring high gets a named source and a tie clause, or it does not list.
-->

## Draft

I scored 13 market questions for dispute risk. One hit 67 out of 100.

The question: "Will a major AI lab release a frontier model before July?"

It reads fine in a feed. It is a support ticket with a countdown attached.

Three defects, all in the sentence, none in the oracle:

· No named source of truth. Who announces it, and where does the resolver look?
· Undefined qualitative threshold. "Major" and "frontier" are vibes with money behind them.
· A discretionary escape hatch. Someone decides after the fact, under pressure, with holders watching.

So I built the linter instead of writing another essay about it. 15 rules, 13 fixture questions, one score each, and a test file that pins every rule so the table cannot drift quietly. The rules are in tools/resolution-risk/lib/rules.mjs and it runs offline in about a second.

The honest limits. The fixtures are synthetic, written to exercise the rules rather than sampled from a live venue. The rules are patterns I have watched cause arguments, written down. That is a linter, not an oracle.

A linter still catches the class of defect that costs a week of support and a chunk of trust you do not get back.

What I would do with it on a Monday: run the next 10 draft questions through a rule list before anyone writes marketing copy. Anything that scores high gets a named source and a tie clause, or it does not list.

Most disputes are not oracle failures. They are writing failures, and writing failures are the cheapest kind to catch.

Takeaway: if you cannot name the source of truth in one line, the market is not ready to list.

## First comment

The scanner, the rule table, and the fixtures: github.com/JamesLiuZX/linkedin-operator-notes/tree/master/tools/resolution-risk

Longer argument for why resolution is a UX surface rather than a legal footnote: /markets/01-three-trust-surfaces
