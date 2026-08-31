---
title: "Your rewards program has no term for whether the order fills"
slug: 10-farm-lab
section: markets
pillar: markets
format: demo
status: ready
derivedFrom: articles/04-rewards-vs-farming.md
demo: farm-lab
linkInComment: /demos/farm-lab
---

<!-- EVIDENCE
Claim: Liquidity reward formulas pay for displayed tightness and have no fill term, which is the entire farming surface.
Moment: Reading Polymarket's published scoring rule and noticing there is no variable in it for execution.
Numbers: S(v) = ((max_spread - spread)/max_spread)^2 x size; 3c max spread; /3 one-sided penalty; $5,000 pool; 49% farmer capture; $0.042 per filled share; 0.1c quoted vs 1.5c realised.
Names: Polymarket, Kalshi.
Cost: I have defended a rewards program on displayed-depth charts. Displayed depth was the wrong chart.
Counterexample: A fill-rate floor set too high drives off honest makers who get adversely selected. The fix has a cost.
Reader action: Compute cost per FILLED unit, not cost per displayed unit, before the next budget review.
-->

## Draft

Polymarket publishes its maker reward formula. Read it closely:

S(v) = ((max_spread - order_spread) / max_spread)² × order_size

Squared. An order resting half a cent from the midpoint scores about 69% of a mid-touching order. One sitting 2.5 cents out scores 2.8%.

The rule is built to pay for tightness. It works.

Now find the term for whether the order ever gets filled.

There isn't one.

So I rebuilt the whole thing as a simulator to see what that gap is worth. Same scoring function, same 3 cent cutoff, same divide-by-three penalty for quoting one side.

At settings that look ordinary, a $5,000 daily pool buys liquidity at $0.042 per filled share. Farmers take 49% of the pool and fill 15% of the volume.

The book shows a 0.1 cent spread. The taker gets 1.5 cents. That gap is not slippage. It is orders that vanish the moment someone tries to trade against them.

Drag the cancel rate up and the cost curve goes convex. A program that looks efficient at a 40% cancel rate is nowhere near efficient at 85%, and cancel rate is the one variable the venue does not control.

One term fixes it. Disqualify makers below a fill-rate floor. It is the term the published rule does not have.

It also has a cost, which I would rather state than hide: set the floor too high and you drive off honest makers, who get filled precisely when they are wrong.

I have defended a rewards program using displayed-depth charts. Displayed depth was the wrong chart.

Takeaway: report dollars per filled unit, not dollars per displayed unit, or you are buying a picture of a market.

## First comment

Try it: /demos/farm-lab
