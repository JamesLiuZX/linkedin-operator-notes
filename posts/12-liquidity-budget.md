---
title: "What it costs to make a market feel real"
slug: 12-liquidity-budget
section: markets
pillar: markets
format: demo
status: draft
derivedFrom: articles/06-dead-markets-poison.md
demo: liquidity-lab
linkInComment: /demos/liquidity-lab
---

<!-- EVIDENCE
Claim: "This market feels dead" is a budget line with a computable number, and the number is the argument against a long listing calendar.
Moment: Being asked to justify cutting a listing calendar and having only adjectives to argue with.
Numbers: b = 49,750 for 0.5% slippage on a $500 order at 50c; worst case b x ln 2 = $34,484 per market; 40 markets = $1,379,374; 4 markets = $137,937; $1.11B open interest against $8.6B April 2026 volume.
Names: Hanson, LMSR, Kalshi, Polymarket.
Cost: I argued for a shorter listing calendar with taste and lost. The argument needed a number and I did not have one.
Counterexample: Some markets deserve to be thin. A long-dated tail market with three traders is fine if it is labelled.
Reader action: Price the slippage target before the listing meeting, not after the complaint.
-->

# What it costs to make a market feel real

"This market feels dead" is not feedback anyone can act on. So I priced it.

Take a user about to put $500 into a market trading at 50 cents. Decide what slippage they should feel. Half a percent is a reasonable bar.

Under Hanson's LMSR, that requires a liquidity parameter of 49,750, and the worst case loss on that market maker is b times ln 2. Which is $34,484.

Per market.

List 40 of them at that depth and you have written a $1,379,374 worst-case commitment. List four and it is $137,937.

That arithmetic is the argument against a full calendar, and it is more persuasive than any opinion about focus. I know, because I made the opinion version and lost.

The reason to reason in LMSR even if you ship an order book is that it is the one market maker whose worst case has a closed form. You can put it in a budget line. "We need more makers" cannot go in a budget line.

The other number worth carrying into that meeting: sector open interest was $1.11B on 1 May 2026 against $8.6B of April volume. Roughly 13% of the monthly headline is actual positions. The rest is turnover.

So when someone quotes a volume number at you as evidence the category is deep, ask what the open interest was.

There is a version of this that is wrong, and I will say it before someone else does. Some markets should be thin. A long-dated tail market with three traders is fine, as long as the product tells the user that before they tap, rather than after.

Takeaway: pick the slippage a user should feel, price it, and let the number decide how many markets you list.
