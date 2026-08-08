---
title: "The harness is the edge"
slug: 08-the-harness-is-the-edge
author: James Liu
series: Market Ops Notes
section: agents
summary: "An unaided frontier model forecasts worse than the market and worse than the general public. What closes the gap is not a bigger model."
status: compliance-checked
publishAt: 2026-09-01T01:00:00Z
platforms: twitter, medium, substack
tags: agents, forecasting, calibration
twitterExcerpt: "Frontier LLMs score 0.13 on Brier. The general public scores 0.121. Read that ordering again."
demo: calibration-lab
---

<!-- EVIDENCE
Claim: Unaided frontier models forecast worse than market prices and worse than the general public. Scaffolding rather than model scale closes the gap, and confidence is routinely mistaken for accuracy.
Moment: Putting the published Brier scores on one axis and finding the frontier models below the general public.
Numbers: 0.075 AIA Forecaster; 0.09 Kalshi and Polymarket; 0.096 superforecasters; 0.109 best general LLM forecaster; 0.121 general public; 0.122 to 0.136 frontier LLMs unaided; most models negative Brier Skill Score, best +0.057; Brier decomposes as reliability minus resolution plus uncertainty.
Names: Kalshi, Polymarket, Brier, Murphy, AIA Forecaster, MarketBench, Hindcast.
Cost: My prototype reported 85% and 90% on nearly everything and I read that as the model being sure. I could not tell miscalibration from confidence by reading the output, and I did not think to score it for two weeks.
Counterexample: A scaffolded agent at 0.075 genuinely beats the market, so this is not an argument that agents cannot forecast.
Reader action: Score the agent's Brier against the market price before scoping anything else.
-->

# The harness is the edge

Frontier LLMs score 0.122 to 0.136 on Brier. The general public scores 0.121.

Lower is better. So the unaided frontier model, on published benchmarks, forecasts slightly worse than a crowd of ordinary people, and meaningfully worse than the market price it would be trading against, which sits at about 0.09 on Kalshi and Polymarket.

Human superforecasters land at 0.096. The best general LLM forecaster reaches 0.109. The AIA Forecaster, a scaffolded system, reaches 0.075 and beats everything else on the list.

Sit with the spread between 0.136 and 0.075. Those are frequently the same underlying weights. The difference is what was built around them.

That is the finding. The edge is the harness.

## What a Brier score is, in one paragraph

It is the mean squared error of a probabilistic forecast. Say 70% on something that happens and you eat 0.09. Say 70% on something that does not and you eat 0.49. Range is 0 to 1, and it rewards being right about how sure you are, not just about which way things go.

This is the property that makes it useful here. A forecaster who says 95% on everything and is right 80% of the time carries a reliability penalty of 0.0225 on every one of those calls. It looks decisive in a meeting and scores badly on a scoreboard. There is no way to bluff a Brier score, which is exactly why it belongs in the evaluation of anything you are thinking of putting near money.

Murphy's decomposition splits it 3 ways: reliability minus resolution plus uncertainty. Reliability is miscalibration, and it is the part you can fix without learning anything new about the world. Resolution is discrimination, whether the forecaster separates things that happen from things that do not. Uncertainty is the irreducible difficulty of the question set, and it is a floor: on a set of pure coin flips it is 0.25 and no forecaster alive beats it.

The reason to care about the split is that a mediocre total can come from two completely different diseases, and they have opposite treatments.

## Knowledge and confidence are different variables

The most useful thing I built while working through this was a lab that separates them, because in practice they get conflated constantly, including by me.

Knowledge is how much real signal a forecaster has. Confidence is how hard it pushes its answers toward 0 and 100.

Hold knowledge completely fixed at 75% and turn confidence up from 1.0x to 2.4x. The forecasts get sharper. They read as more decisive. Every stakeholder in the room prefers them, because "there is a 78% chance" sounds like a system that has done work and "there is a 55% chance" sounds like a system hedging.

The Brier score gets worse the whole way up. In my lab, that move alone takes a 0.133 agent past 0.19 without changing a single fact it knows.

The curve has a minimum, and the minimum is almost never where the confident-sounding output sits. Everything to the right of it is buying certainty with no new information and paying for it in accuracy. MarketBench, published in April 2026, found large-scale miscalibration across agents, and a separate 2026 benchmark found most frontier models scoring a negative Brier Skill Score against the market baseline, with the best single model reaching only +0.057. That is a calibration deficit, not a knowledge deficit, and the 2 look identical if you are reading outputs instead of scoring them.

Here is my version of getting this wrong. My first trading-agent prototype reported 85% and 90% on nearly everything. I read that as the model being sure, because that is what those 2 numbers mean when a person says them. It was the model being uncalibrated. I ran it for 2 weeks before I scored it, and I could not have told the difference from the transcripts. Nobody can. That is the point.

## Why the market is a hard baseline

There is a temptation to treat 0.09 as a number to beat with a better model. It is worth understanding why it is that low.

A market price is an aggregate with money behind every input. Participants who are systematically overconfident lose capital and their influence on the price shrinks. That is a calibration mechanism running continuously across $8.6B of April 2026 volume, for free, with no eval harness and no one maintaining it. It is a genuinely hard baseline and it is hard for structural reasons rather than accidental ones.

An agent reading that price and reporting a different number needs a better reason than "the model felt strongly". The useful output of a forecasting agent is usually not a probability at all. It is the disagreement log: the 12 or 15 cases out of 200 where it differs from the market by more than 10 points, with reasoning attached, so a human can check whether that is insight or a hallucinated premise.

Most of the time it is a hallucinated premise. That is still worth having, because you find out for the cost of an afternoon.

## What scaffolding actually means

The AIA result at 0.075 is the interesting one, because it says the ceiling is not where the unaided numbers suggest. What separates it is not exotic, and it comes down to 4 things:

Retrieval against primary sources, so the model reasons over the SEC filing rather than over its memory of coverage of that filing.

Decomposition, breaking a compound question into parts that resolve independently, which is the same discipline good resolution criteria require.

An explicit abstention rule. A forecaster allowed to say "insufficient evidence" scores better than one required to produce a number for all 200 questions, and requiring a number for everything is the default in almost every agent I have seen shipped.

Aggregation across multiple independent passes, which cancels some of the variance a single sampling run carries.

None of that is a model capability. All of it is engineering around the model, which is why the phrase "we will fix it with the next model" is usually the wrong plan and always the more expensive one.

## The counterexample

The numbers do not support "agents cannot forecast", and I do not want to be read that way.

They support something narrower: an unaided model is worse than the price at 0.13, and a scaffolded one is better at 0.075. Both halves are in the data. Quoting only the first half to argue agents are useless is the same error as quoting only the second to argue they are magic.

The benchmarks have a real limit too. Published Brier figures come from different question sets, and question sets differ in irreducible uncertainty, so cross-study comparisons of the kind I made in paragraph 1 are directional rather than exact. I would not stake a roadmap on 0.121 against 0.122. I would stake one on 0.136 against 0.075.

## What to do on Monday

Score it before you scope it. Take 200 resolved markets, have the agent forecast them cold, and compute the Brier against the market price at the same timestamp. That is 1 afternoon, and it tells you more than a month of reading transcripts.

Then decompose. If reliability is the problem, you have a calibration bug and the fix is post-processing rather than retraining. If resolution is the problem, the agent does not know things, and the fix is retrieval.

Then read the disagreement log instead of the aggregate. The aggregate tells you whether to ship. The log tells you what to build.

Takeaway: an agent that loses to the market does not need a bigger model. It needs retrieval, decomposition, and permission to say it does not know.
