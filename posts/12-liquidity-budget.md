---
title: "What it costs to make a market feel real"
slug: 12-liquidity-budget
section: markets
pillar: markets
format: demo
status: ready
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

## Draft

"This market feels dead" is not feedback anyone can act on. So I priced it.

A user is about to put $500 into a market trading at 50 cents. Say half a percent of slippage is the most you want them to feel.

Hanson's LMSR gets there with a liquidity parameter, b, of 49,750. The market maker's worst-case loss is b times ln 2: $34,484.

Per market.

At that depth, 40 markets is a $1,379,374 worst-case commitment. Four is $137,937.

That arithmetic is the argument against a full calendar, and it is more persuasive than any opinion about focus. I know, because I made the opinion version and lost.

I reach for LMSR even when the venue runs an order book, because its worst case has a closed form. That gives you a number for the budget. "We need more makers" is not one.

One more number for that meeting. On 1 May 2026, sector open interest was $1.11B. April volume was $8.6B. Roughly 13% of the monthly headline is actual positions, and the rest is turnover.

So when someone quotes a volume number at you as evidence the category is deep, ask what the open interest was.

There is a version of this that is wrong, and I will say it before someone else does. Some markets should be thin. A long-dated tail market with three traders is fine, as long as the product tells the user that before they tap, rather than after.

Takeaway: pick the slippage a user should feel, price it, and let the number decide how many markets you list.

## First comment

Try it: /demos/liquidity-lab

The longer version of the argument: /markets/06-dead-markets-poison
