---
title: "Four questions before you spend the next rewards dollar"
slug: 03-rewards-vs-farming
section: markets
pillar: markets
format: tradeoff
status: draft
derivedFrom: articles/04-rewards-vs-farming.md
---

<!-- EVIDENCE
Claim: Reward programs pay for the behaviour they price, and most price the behaviour that is easiest to fake.
Moment: Realising the published maker-reward formula has no execution term in it.
Numbers: Polymarket scoring S(v) = ((max_spread - spread)/max_spread)^2 x size; 3c cutoff; one-sided liquidity penalised 3x; day 31.
Names: Polymarket, Kalshi.
Cost: I have run a program that paid for "trade once during the event". It bought a crowd and I called it growth for a quarter.
Counterexample: Wash-trading rules do work. Disqualification is enforceable. The failure is in what gets priced, not in whether rules exist.
Reader action: Draw the day-31 retention curve with rewards at zero before approving the budget.
-->

# Four questions before you spend the next rewards dollar

Polymarket pays makers for tightness. It does not pay them for fills.

The published rule scores a maker order as ((max_spread - order_spread) / max_spread)² × order_size, with a 3 cent cutoff and a 3x penalty for quoting one side only.

The square matters. An order 0.5 cents from the midpoint earns about 69% of a mid-touching order. At 2.5 cents it earns 2.8%.

It is a well-built rule. Tightness is what a book needs.

It contains no variable for whether the order fills. That gap is why resting tight on both sides and pulling before execution works. In my simulator at a $5,000 daily pool, farmers took 49% of the budget and filled 15% of the volume.

Incentives in a trading product have 2 jobs that fight each other. Teach real users the loop. Avoid paying professionals to extract the program. Most teams optimise for a volume screenshot and act surprised when the professionals show up on day 2.

Four tests I run before launch, in this order.

Who is the marginal user of the next dollar? If they leave on day 31 when the program ends, you are renting volume at a price you never computed.

What behaviour is priced? "Trade once during event X" is trivially farmable. A sequence that looks like real usage is harder to fake and usually healthier.

Can a spreadsheet beat the product? If someone can win without ever developing a view on a market, they will.

What does day 31 look like at zero rewards? Draw that curve. If the product story collapses, the rewards were life support.

I ran a program that paid for showing up during one event. It bought a crowd. I called it growth for a quarter and was wrong by about 90% of the cohort.

Takeaway: gamification is not the problem. Pricing the wrong behaviour is, and you can catch it with a spreadsheet before you catch it in a cohort.
