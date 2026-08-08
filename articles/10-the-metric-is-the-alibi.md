---
title: "The metric is the alibi"
slug: 10-the-metric-is-the-alibi
author: James Liu
series: Market Ops Notes
section: markets
summary: "Cost per filled share stayed at $0.042 while farmer capture went from 49% to 66%. The one number most dashboards show did not move."
status: compliance-checked
publishAt: 2026-10-06T01:00:00Z
platforms: twitter, medium, substack
tags: markets, incentives, rewards
twitterExcerpt: "Cost per filled share: $0.042 either way. Farmer capture: 49% to 66%. Same headline metric, opposite program."
demo: farm-lab
---

<!-- EVIDENCE
Claim: A rewards program's headline efficiency metric can hold steady while the reward flips from paying market quality to paying market decoration, and only the composition underneath would show you.
Moment: Running Farm Lab's default settings against its own "looks fine, buys nothing" preset and watching cost per filled share come back identical to three decimal places while farmer capture moved 17 points.
Numbers: cost per filled share $0.042 in both runs; farmer capture 49.3% ($2,466 of $5,000) in the default run versus 66.1% ($3,303 of $5,000) in the farmed run; displayed depth 12,600 shares versus 7,200 shares; fillable depth 11,070 versus 5,508; farmer fill rate 15% versus 6%; a 30% fill-rate floor applied to the farmed run sends farmer reward to $0 and hands the full $5,000 pool to honest makers.
Names: Farm Lab, Polymarket, the quadratic scoring rule, cost per filled share, fill-rate floor, farmer capture.
Cost: The participant behaviour in this model is mine, not measured off a live order book. The scoring formula is Polymarket's published rule and is exact. The farmer and honest-maker cohorts, their cancel rates, and their sizes are a model, and I labelled it that way in the build rather than passing it off as observed data.
Counterexample: A venue with deep organic liquidity that exists independent of the rewards program will not show this pattern, because the aggregate metric is only blind when the reward is a meaningful share of total depth. Bootstrapping a book from zero and topping up an already-liquid one are different problems, and this essay is about the first one.
Reader action: Pull your own program's cost-per-fill number, then split it by cohort before the next budget review.
-->

# The metric is the alibi

Cost per filled share: $0.042. Then I broke the program, and it was $0.042 again.

Farm Lab is a deterministic simulator of a liquidity rewards program, built on Polymarket's published scoring rule: `S(v) = ((max_spread - order_spread) / max_spread)^2 x order_size`. Feed it a daily pool, a cohort of honest market makers, a cohort of reward farmers, and a rate at which farmers cancel before they fill, and it tells you exactly where the pool went. Same inputs, same output, every time, so anyone can check the arithmetic against the docs.

The default run: a $5,000 daily pool, a 3c maximum spread, 12 honest makers quoting 1.8c off midpoint at 900 shares, 18 farmers sitting 0.1c off midpoint at the 100-share minimum, and a farmer cancel rate of 85%. Farmers capture 49.3% of the pool, $2,466 of it. Honest makers take the rest.

That number alone does not tell you much. Half the pool going to the tightest quotes on the book is not obviously wrong. Tight quotes are what the reward is supposed to buy.

So I loaded the second preset, the one the demo itself calls "looks fine, buys nothing." Same pool, same taker flow. Farmers go from 18 to 45. Honest makers drop from 12 to 6. Minimum order size falls from 100 shares to 40. Cancel rate climbs from 85% to 94%.

Farmer capture jumps to 66.1%, $3,303 of the same $5,000. Displayed depth, the total size resting on the book, falls from 12,600 shares to 7,200. Fillable depth, the part of that book that survives contact with an actual order, falls from 11,070 to 5,508. The farmers' own fill rate drops to 6%, meaning 94 of every 100 shares they display get pulled before anyone can trade against them.

And cost per filled share comes back at $0.042. Identical to three decimal places.

That is the finding. Not that farming happened. Everyone who has run a rewards program already suspects farming happens. The finding is that the one number most teams actually put in a dashboard is structurally incapable of noticing it.

## Why the average holds still

Cost per filled share is `pool / total shares filled`. In both runs, taker demand is 120,000 shares a day, and in both runs every one of those shares eventually gets filled by someone, farmer or honest maker, because the residual after farmers cancel just lands on whoever is left quoting. Total filled volume is 120,000 in the default run and 120,000 in the farmed run. Divide $5,000 by the same denominator twice and you get the same answer twice.

What changed is not how much got filled. It is who got paid for the same 120,000 shares, and what was actually resting on the book while it happened. The average is doing exactly what an average does: one division, one number, the distribution erased. It is not lying. It was never built to see composition, and a metric with 1 input on each side of the fraction will report a farmed program and a healthy program as identical, because on the single axis it measures, they are.

I want to be precise about the mechanism, because it is not "farmers are sneaky." The quadratic rule rewards tightness quadratically and fill probability not at all. An order 0.1c from midpoint scores 93 points at the demo's settings. An order 1.8c out scores 16. Sit as close to the touch as the tick allows, cancel before size trades against you, and you have found the highest-scoring, lowest-risk strategy the rule permits. Nobody had to be dishonest. They had to read the formula, which is public.

## The fix is one term the rule does not have

Farm Lab has a slider called fill-rate floor, off by default because the published rule has no equivalent. Turn it to 30% and apply it to the farmed run: any cohort whose orders fill less than 30% of the time they are attempted is disqualified from the pool entirely. Farmer fill rate in that run is 6%, well under the floor. Farmer reward goes to $0. Honest makers, who fill 100% of what they display, take the full $5,000.

One added term. Not a smarter scoring function, not a bigger pool, not a maximum-farmers rule that a determined farmer routes around with more wallets. A floor on the one thing the quadratic rule never asked about: did the order that scored the points ever trade.

## The counterexample, honestly

This pattern needs the reward to be a meaningful share of total depth. A venue with deep organic liquidity, where the rewards program is topping up a book that would exist without it, will not show a 17-point swing in capture from a parameter change, because farmers are competing against real size rather than against each other for who can be first to disappear. Bootstrapping a market from nothing and subsidizing an already-liquid one are different problems, and everything above is about the first one.

The other limit is mine to disclose. The scoring formula is exact, it is Polymarket's published rule, verified against the docs. The cohorts, their sizes, and their cancel rates are a model I built, not a trade tape I pulled from a live venue. If your farmers behave differently, your numbers move. The mechanism, an aggregate metric blind to composition, does not depend on my specific inputs being right. It depends on the formula having no fill term, which is a fact about the rule, not about my simulation.

## What to check on Monday

Pull your own program's cost-per-fill number if you have one. Then split it. Reward per cohort, fill rate per cohort, displayed depth versus fillable depth. If you cannot produce that split within an afternoon, that is itself the finding: the dashboard was built to report the average, and nobody built the query that would show you the distribution underneath it.

Then ask the harder question before the next budget cycle: does the scoring rule have a term for whether the order filled? If the answer is no, you are not paying for liquidity. You are paying for a number that looks like liquidity from exactly one angle, the one your dashboard happens to show.

Takeaway: an average cannot tell a farmed program from a healthy one when both fill the same volume. Split the metric by cohort before you trust it.
