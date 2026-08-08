---
title: "The stopwatch, not the forecast"
slug: 13-the-stopwatch-not-the-forecast
author: James Liu
series: Market Ops Notes
section: growth
summary: "Developers forecast AI tools would make them 24% faster. Afterward, they still believed 20%. A stopwatch measured 19% slower. The gap between belief and measurement, not the token bill, is what decides whether a workflow pays for itself."
status: published
publishAt: 2026-08-08T07:10:00Z
platforms: twitter, medium, substack
tags: growth, ai-workflows, roi, claude
twitterExcerpt: "Token cost is rarely the number that breaks an AI workflow's ROI. Review time is, and self-reported speedup is not a measurement of it."
demo: workflow-roi-lab
---

<!-- EVIDENCE
Claim: Token cost is almost never the number that decides whether an AI-assisted workflow pays for itself. Human review time is, and a self-reported sense of being faster is not a reliable measurement of it.
Moment: Building Workflow ROI Lab and finding that across all four Claude pricing tiers, at realistic input and output token counts, the token-cost bar on the chart is consistently the smallest of four, usually by two orders of magnitude.
Numbers: Claude Sonnet 5 costs $2 input / $10 output per million tokens, introductory through 31 August 2026; Haiku 4.5 is $1 / $5; Opus 4.5 is $5 / $25 (Anthropic). METR's randomized trial: 16 experienced open-source developers, 246 real tasks, AI access increased completion time by 19%, against a pre-task forecast of a 24% speedup and a post-task belief of still being 20% faster. At the demo's defaults, 400 tasks a month, 12 manual minutes, $45/hr, Sonnet 5 intro pricing, 3,000 input and 600 output tokens, 4 minutes of AI-assisted review, an 8% rework rate, breakeven review time is 11.0 minutes and the default sits comfortably under it.
Names: Workflow ROI Lab, Anthropic, Claude Sonnet 5, Claude Haiku 4.5, Claude Opus 4.5, METR.
Cost: the token prices are exact and dated. Task volume, manual minutes, review minutes, and rework rate are assumptions the calculator asks you to set yourself, not a benchmark for a "typical" workflow, because I do not have one to offer, and inventing a fake one would be worse than leaving the sliders at a round default and saying so.
Counterexample: a workflow with a genuinely fixed, low, well-understood manual cost, a template fill, a lookup, may not be worth automating at all regardless of how the AI side of the math comes out, because the fixed cost of building and maintaining the automation is not in this model, only the marginal cost per task once it already exists.
Reader action: before claiming a workflow automation saved time, time the review step for real, with a stopwatch, across enough tasks to trust the average. That is the exact check METR ran on developers and the one most teams skip.
-->

# The stopwatch, not the forecast

Developers using AI coding tools forecast they would finish 24% faster. Afterward, still believing the tools had helped, they estimated 20% faster. A stopwatch measured 19% slower. That is METR's randomized trial on 16 experienced open-source developers across 246 real tasks, published in July 2025, and it is the single most important number in this piece, because it is not about coding tools specifically. It is about the reliability of "this feels faster" as a measurement instrument, and the answer the trial gives is that it is not reliable at all.

I built Workflow ROI Lab to put a real breakeven number behind that gap instead of an argument about it. Set a task volume, a manual time per task, a fully loaded hourly cost, a model tier, an input and output token count, an AI-assisted review time, and a rework rate, and it computes exactly what the workflow costs both ways and where the two lines cross. The four token prices in the model are real: Claude Sonnet 5 runs $2 per million input tokens and $10 per million output tokens at its introductory rate, in effect through 31 August 2026. Haiku 4.5 is $1 and $5. Opus 4.5 is $5 and $25. Anthropic publishes all three.

## The bar that is always small

Run the calculator at anything resembling a real workflow, a few thousand input tokens of context, a few hundred of output, and the token-cost bar on the chart is consistently the smallest of four, usually by close to two orders of magnitude next to the human-time bars beside it. At the demo's defaults, 3,000 input tokens and 600 output tokens against Sonnet 5's intro price, the call costs $0.012. Twelve tenths of a cent. Meanwhile 4 minutes of a $45-an-hour reviewer's time costs $3.00, and an 8% rework rate on a $9.00 manual-equivalent task adds another $0.72. The token bill is not close to being the number that decides this. It is a rounding error sitting next to two numbers that are not.

That is not a reason to ignore token cost. It is a reason to stop treating "which model is cheaper per token" as the lever that matters most, when for the overwhelming majority of realistic workflows it barely moves the total. Swapping Opus 4.5 for Haiku 4.5 in the calculator, a fivefold difference in output price, changes the token line from $0.012 to roughly $0.003 and changes almost nothing about whether the workflow is worth shipping, because the review-time line was never close to being the token line's order of magnitude in the first place.

## The number that actually decides it

Breakeven review time, the point where the AI-assisted cost per task equals the manual cost per task, is exact and solvable directly rather than searched for: it is `60 * (manualCost * (1 - reworkRate) - tokenCost) / hourlyCost`. At the demo's defaults that works out to 11.0 minutes. Below that, per task, the workflow is saving money. Above it, the workflow costs more than doing the task by hand, regardless of how fast the process feels while you are doing it, which is exactly the trap METR's developers fell into. Their forecast and their post-task belief both pointed the same direction, faster, and both were wrong by the same measuring instrument's failure: self-report during and after a task is not a stopwatch.

Push the review time past breakeven in the calculator, to 14 minutes at the same defaults, and monthly savings at 400 tasks flips from roughly $2,100 positive to roughly $890 negative. Nothing else changed. The token line barely moved. The rework rate stayed at 8%. One input, minutes of human review time per task, crossed a threshold and the sign of the whole result flipped with it. That is the workflow-automation version of METR's finding: the part of the system doing the deciding is the part nobody times, because timing your own review habit feels unnecessary right up until the total goes negative and nobody can say when it happened.

## The counterexample

None of this argues that every workflow should be automated once the arithmetic clears. A task with a genuinely small, fixed, well-understood manual cost, filling in a known template, a single database lookup, may not be worth touching at all, because this model only prices the marginal cost per task once the automation already exists. It does not price building it, maintaining the prompt as the underlying data drifts, or the engineering time spent wiring it into whatever system runs the task today. A workflow at 50 tasks a month with a two-minute manual cost can clear the per-task breakeven easily and still not be worth a week of engineering time to stand up. The calculator answers "does the marginal unit economics work," not "should you build this," and the two questions have different answers more often than the marginal math alone would suggest.

## What to check Monday

Time the review step. Not a guess, not a vibe, an actual stopwatch across enough tasks that the average means something, the same discipline METR applied to the developers in its trial. Multiply that number against your own hourly cost and your own volume, not the calculator's defaults, and compare it to the breakeven line rather than to a feeling of things going faster. If a workflow has been running for a month and nobody can produce that number, that absence is itself informative: it means the "this is obviously saving us time" conclusion was reached the same way METR's developers reached theirs, and reached it wrong 19 percentage points in the other direction.

Takeaway: token cost is rarely what decides an AI workflow's ROI. Review time is, self-report is not a measurement of it, and the only fix is a stopwatch you actually use.
