---
title: "0.95 to the 5th power is 0.7738"
slug: 20-five-agents-at-95-percent
pillar: agents
section: agents
status: ready
derivedFrom: articles/18-five-agents-at-95-percent.md
publishAt: 2026-08-26T01:00:00Z
platforms: linkedin
tags: ai, agents, reliability, multi-agent
---

<!-- EVIDENCE
Claim: Chaining independent agent steps multiplies their reliability, not averages it, so a pipeline built from individually good steps can still be bad end to end.
Moment: Checking each essay in this batch against the gate right after writing it instead of batching all the checks at the end.
Numbers: 5 steps at 95% each compound to 0.95^5, about 77%. 10 steps at 85% each compound to 0.85^10, about 20%.
Names: none proprietary, the compounding-reliability calculation itself.
Cost: this is arithmetic, not a study finding; production failure-mode data is directional, not a single controlled benchmark.
Counterexample: a checked, corrected step does not propagate its failure, so it does not compound the same way.
Reader action: multiply your pipeline's current reliability by a new step's reliability before adding it, don't just look at the new step in isolation.
-->

## Draft

0.95 multiplied by itself 5 times is 0.7738.

That's the whole proof. Chain 5 agent steps, each independently correct 95% of the time, and the system is correct about 77% of the time. Not 95%. Nobody needs a study to confirm this, it's the same math that prices compound interest, run backward.

10 steps at 85% each: 0.85 to the 10th power, about 20%. A pipeline built from 10 components that each individually pass review comes out right 1 time in 5.

Here's why this doesn't feel true until you do the arithmetic: reliability gets scored per step, and per-step numbers look fine. 95% is a good score. Nobody ships a step they think is bad. The failure isn't in any single step's quality. It's in treating a chain's reliability as the average of the parts instead of the product, and the product drops faster than intuition expects once you're past 2 or 3 steps.

I'm checking each essay in this batch against the content gate right after I write it, not after writing all 6. That's this argument in practice: a mistake caught after 1 step costs 1 fix. The same mistake sitting uncaught under 4 more steps built on top of it costs 5.

Making 1 step better doesn't fix a multi-step chain. A checkpoint that stops a bad step from silently propagating does.

Takeaway: chained steps multiply their reliability, they don't average it. Before adding a step to a pipeline, multiply, don't eyeball.

## First comment

Full math, plus the production failure-mode data on where multi-agent systems actually break: /agents/18-five-agents-at-95-percent
