---
title: "Draw the retention curve assuming rewards go to zero on day 31"
slug: 09-rewards-day-31
pillar: field-notes
section: markets
status: draft
blockedOn: one operating number only James can supply
derivedFrom: articles/04-rewards-vs-farming.md
publishAt: 2026-09-03T01:00:00Z
platforms: linkedin
tags: markets, incentives, growth
---

<!-- EVIDENCE
Claim: A rewards program is worth running only if the retention curve survives the program ending, and most programs are never tested against that question before launch.
Moment: {{MOMENT: the specific reward or incentive design review where someone asked what happens after the program ends and the room did not have an answer. Rough timeframe, no confidential program details.}}
Numbers: {{DAY31: the share of reward-acquired users still active a month after incentives stopped, stated as a ratio or a band rather than an exact internal figure. Include the cohort window.}}
Names: day 31, wash trading, the marginal user, articles/04-rewards-vs-farming.md.
Cost: {{COST: an incentive design you shipped or approved that priced the wrong behaviour, and what it attracted instead. Principle level, no program names.}}
Counterexample: Some programs are honestly bootstrapping rather than retaining. Paying for the first fills in a brand new book is a liquidity cost, not a growth claim, and judging it on day 31 retention misreads what it was for.
Reader action: Before approving a rewards budget, draw the retention curve with the program removed and get the room to sign the drawing.
-->

<!--
HELD BY THE GATE. Three slots above need numbers only the author has.
Fill the {{ }} slots, delete the braces, set status: ready, then run:
npm run content:check posts/09-rewards-day-31.md
-->

## Draft

Before approving a rewards budget, draw the retention curve for day 31.

Not day 1, when the program is live and the dashboard is green. Day 31, with the incentives switched off and nothing left but the product.

{{DAY31_SENTENCE: state the day-31 number you have actually seen, as a ratio or a band. One sentence. Nothing confidential.}}

If the curve collapses, the program was not growth. It was life support with a marketing budget.

The question underneath it is what behaviour got priced. Paying for "trade once during event X" is trivially farmable, and the people best at farming it will read the terms more carefully than your own team did. Paying for sequences that resemble real usage, returning after a resolution, holding across multiple markets, patterns that cost something to fake, is harder to design and harder to game.

The test I keep coming back to: can a spreadsheet beat the product? If someone can win the program without ever developing a view on a market, you have built a payout mechanism rather than an onboarding one.

{{COST_SENTENCE: name an incentive you priced wrong and what showed up instead. One sentence, principle level.}}

Gamification is not the problem. Unexamined incentive design is, and it is unexamined because the day-31 drawing is the one artifact nobody wants to produce before the launch date.

Takeaway: if the retention story needs the rewards to keep running, the rewards were the product.

## First comment

Longer version, with the four tests I run on an incentive design before launch: /markets/04-rewards-vs-farming
