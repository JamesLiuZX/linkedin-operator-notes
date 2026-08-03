---
title: "Your agent is not smarter than the market"
slug: 11-calibration-lab
section: agents
pillar: agents
format: demo
status: draft
derivedFrom: articles/08-the-harness-is-the-edge.md
demo: calibration-lab
linkInComment: /demos/calibration-lab
---

<!-- EVIDENCE
Claim: An unaided frontier model forecasts worse than the market and worse than the general public. Scaffolding, not model size, closes the gap.
Moment: Putting the published Brier scores on one axis and seeing the frontier models land below the general public.
Numbers: 0.075 AIA Forecaster; 0.09 Kalshi and Polymarket; 0.096 superforecasters; 0.109 best general LLM; 0.121 general public; 0.122 to 0.136 frontier LLMs unaided; +0.057 best Brier Skill Score.
Names: Kalshi, Polymarket, AIA Forecaster, Brier.
Cost: My first trading-agent prototype reported 85% and 90% constantly. It felt sharp. It was badly calibrated and I read that as confidence.
Counterexample: A well-scaffolded agent at 0.075 does beat the market, so this is not an argument that agents cannot forecast.
Reader action: Score your agent's Brier against the market price before you scope anything else.
-->

# Your agent is not smarter than the market

Frontier LLMs score 0.122 to 0.136 on Brier. Lower is better.

The market price on Kalshi and Polymarket scores about 0.09.

The general public scores 0.121.

Read that ordering again. An unaided frontier model forecasts worse than the price it wants to trade against, and worse than a crowd of ordinary people.

Human superforecasters sit at 0.096. The AIA Forecaster, a scaffolded LLM, reaches 0.075 and beats everything on the list.

The gap between 0.136 and 0.075 is not model size. Those are often the same weights, wrapped in retrieval over primary sources, a decomposition step that breaks the question into resolvable parts, and an explicit rule for declining to answer when the evidence is thin.

The edge is the harness.

So I built a lab that separates the two things people conflate. Knowledge is how much signal a forecaster actually has. Confidence is how hard it pushes its answers toward 0 and 100.

Hold knowledge fixed and turn confidence up. The forecasts get sharper. They read as more decisive. Any stakeholder in the room will prefer them.

The Brier score gets worse the whole way.

That curve has a minimum, and it is almost never where the confident-sounding output is. Everything to the right of it buys certainty with no new information and pays for it in accuracy.

My first trading-agent prototype reported 85% and 90% on nearly everything. I read that as the model being sure. It was the model being uncalibrated, and I could not tell the difference by reading the output.

You cannot. You have to score it.

Takeaway: before you scope an agent near money, run its Brier against the market price. If it loses, the answer is scaffolding, not a bigger model.
