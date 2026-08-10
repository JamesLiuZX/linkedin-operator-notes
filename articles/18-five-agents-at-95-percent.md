---
title: "Five agents at 95% each is one system at 77%"
slug: 18-five-agents-at-95-percent
author: James Liu
series: Market Ops Notes
section: agents
summary: "Chain 5 agent steps at 95% reliability each and the end-to-end success rate is 77%, not 95%. Chain 10 steps at 85% and it is 20%. This is not a study finding, it is arithmetic, and it is why a pipeline gets checked after every step instead of at the end."
status: ready
tags: ai, agents, reliability, multi-agent
twitterExcerpt: "0.95 to the 5th power is 0.7738. Chain 5 agent steps at 95% reliability each and the system is 77% reliable, not 95%. The math is why a pipeline gets checked after every step, not at the end."
---

<!-- EVIDENCE
Claim: Chaining independent agent steps compounds their failure rates multiplicatively, not additively, so a pipeline built from individually reliable steps can still be unreliable end to end. This is arithmetic, not a finding that needs a study to hold, though production measurements of multi-agent systems confirm the pattern shows up at the scale people actually build at.
Moment: Verifying every new essay in this same batch against the content gate individually, right after writing it, instead of writing all of them and checking the whole batch at the end. That habit is this piece's argument applied to my own process: check after every step, because a wrong step 20 minutes in costs less to catch immediately than after 5 more steps have been built on top of it.
Numbers: 5 steps at 95% reliability each compound to 0.95^5, about 77%. 10 steps at 85% each compound to 0.85^10, about 20%. A per-token error rate of 1% compounds to roughly 87% cumulative failure probability by token 200 of an uninterrupted chain. Reported multi-agent architectures use 1.6x to 6.2x more tokens than a comparable single-agent workflow for the same task. In one production failure-mode breakdown, specification failures accounted for roughly 42% of documented multi-agent failures and coordination failures roughly 37%.
Names: none proprietary; the compounding-reliability calculation itself, applied to multi-agent pipelines.
Cost: the 42%/37% failure-mode split and the 1.6x-6.2x token-overhead figure come from industry writeups on production multi-agent deployments, not a single controlled academic study, so treat them as directionally real rather than a precise, reproducible benchmark. The compounding math itself needs no such caveat: it is the same identity that prices compound interest.
Counterexample: a chain where a step's failure is independently checked and correctable before the next step starts does not compound the same way, because a caught failure does not propagate. The math above assumes failures are undetected and uncorrected mid-chain, which is the default, not a law, and is exactly the condition a checkpoint is built to break.
Reader action: before adding another step to an agent pipeline, multiply your current end-to-end reliability by the new step's own reliability and look at the product, not at the new step's reliability in isolation. If the product looks worse than doing the added step by hand, the step needs a checkpoint before it needs a place in the chain.
-->

# Five agents at 95% each is one system at 77%

0.95 multiplied by itself 5 times is 0.7738. That is the entire proof for this piece's claim: chain 5 agent steps, each independently correct 95% of the time, and the system that results is correct roughly 77% of the time, not 95%. Nobody has to run an experiment to confirm this. It is the same arithmetic that prices compound interest, applied to failure instead of growth, and it holds regardless of how good any individual step is, because the number of steps is doing as much work in the final answer as any single step's quality.

Extend it further and the shape gets uglier faster than intuition expects. 10 steps at 85% reliability each compound to 0.85^10, about 20%. A pipeline built from 10 steps that each pass code review individually, each one a component a reasonable engineer would sign off on, produces a system that is right about 1 time in 5. At the level of per-token error instead of per-step error, a 1% error rate compounds to roughly 87% cumulative failure probability by token 200 of an uninterrupted chain, which is a completely ordinary length for a single agent turn, let alone a multi-agent one.

## Why this is not obvious in practice

The reason this surprises people who build agent pipelines is that reliability gets evaluated per step, and per-step numbers look fine. 95% is a good score. 85% is a fine score for a component doing something genuinely hard. Nobody ships a step they think is unreliable. The failure is not in any individual step's quality, it is in treating a chain of N independently-scored steps as if its reliability were the average of the parts, or the minimum, rather than the product. The product is always lower than the lowest individual step once there are more than one or two steps in the chain, and it gets lower fast: a 5-step chain at a uniform 95% is already down to 77%, an 18-point loss that no single component's report card would predict.

Production numbers on multi-agent systems are consistent with this being a real, not just theoretical, tax. Multi-agent architectures are reported to use 1.6x to 6.2x more tokens than a comparable single-agent approach to the same task, largely because coordination and re-verification between steps costs tokens on top of the steps themselves. And when multi-agent pipelines are examined for how they actually fail, the split is not dominated by any single step being badly built: specification failures, the handoff between steps not being fully defined, account for roughly 42% of documented failures, and coordination failures, steps disagreeing about state, account for roughly 37%. Fewer than half the failures trace to one component being bad at its job. Most trace to the seams between components, which is exactly where the compounding math predicts the damage accumulates.

## The fix is not a smarter step

Making step 4 slightly better, taking it from 95% to 97%, moves the 5-step product from 77% to about 85%. That is real, worth doing, and still nowhere near enough on its own, because the other 4 steps are still multiplying against it. The lever that actually moves the number is reducing how many undetected failures get to propagate, which is a checkpoint problem, not a model-quality problem.

This is the same argument the rest of this repo makes about long agent runs generally, restated in its most literal, numeric form. A checkpoint that verifies step N's output before step N+1 starts does not raise step N's individual reliability. It stops step N's failure, when it happens, from silently multiplying into steps N+1 through the end of the chain. A caught failure gets fixed and re-run at the cost of 1 step. An uncaught failure gets multiplied by every step built on top of it before anyone notices, which is the entire mechanism by which 95% per step becomes 77% end to end instead of just averaging out to something closer to 95%.

I checked this piece against the same gate right after writing it, rather than writing the next 4 in the queue first and running all 5 checks at the end. That is this argument, not an analogy for it: a mistake caught after 1 step costs 1 fix. The same mistake, uncaught, sitting underneath 4 more steps built on the assumption it was fine, costs 5.

## Where the math does not apply

This is not an argument that agent pipelines cannot exceed 90% end to end, or that every additional step is a net loss. The multiplication above assumes a failure at step N is undetected and silently feeds step N+1. A step whose output is checked, and corrected on the spot when wrong, breaks that assumption: a caught-and-fixed failure does not propagate, so it does not multiply against the steps after it. Two independently-verified parallel checks on the same output, rather than 2 sequential steps each capable of introducing a new, uncaught error, behave completely differently in this math, closer to redundancy than to compounding risk. The danger is specifically the long, unchecked, sequential chain, not steps in general.

## What to check before adding the next step

Multiply, do not average. Take the pipeline's current measured end-to-end reliability, multiply it by the new step's own reliability, and look at the product before deciding the new step is worth adding. A chain already sitting at 80% that gains a 90%-reliable new step is not an 85%-ish system, it is a 72% system, and if that new step has no way to be checked and corrected before its output feeds the next one, the pipeline just got worse in a way no single step's report card will show.

Takeaway: chaining independent steps multiplies their reliabilities, it does not average them. 5 steps at 95% is a 77% system. The fix is not a better model at any 1 step, it is a checkpoint that stops a failure from silently multiplying into every step built on top of it.
