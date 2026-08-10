---
title: "Multi-agent systems don't fail because 1 agent is bad"
slug: 24-spec-failures-vs-coordination-failures
pillar: agents
section: agents
status: ready
derivedFrom: articles/18-five-agents-at-95-percent.md
publishAt: 2026-09-04T01:00:00Z
platforms: linkedin
tags: ai, agents, reliability, multi-agent
---

<!-- EVIDENCE
Claim: Most documented multi-agent failures trace to the seams between steps, not to any 1 step being poorly built, which matches what the compounding-reliability math predicts.
Moment: Breaking down a production failure-mode analysis of multi-agent systems while writing about the 0.95^5 compounding math, and noticing the split didn't point at model quality.
Numbers: specification failures roughly 42% of documented multi-agent failures, coordination failures roughly 37%. Multi-agent token overhead 1.6x to 6.2x a comparable single-agent workflow.
Names: none proprietary.
Cost: these figures come from industry writeups on production deployments, directional, not a single controlled academic benchmark.
Counterexample: a well-specified handoff with an explicit shared-state contract removes the failure category entirely, it doesn't just reduce its rate.
Reader action: before debugging which agent in your pipeline is "bad," check the handoff between agents first, that's where most of the failures actually are.
-->

## Draft

When multi-agent pipelines get examined for how they actually fail, the split isn't dominated by 1 step being badly built.

Specification failures, the handoff between 2 steps not being fully defined, account for roughly 42% of documented failures. Coordination failures, 2 steps disagreeing about shared state, account for roughly 37%. Under half the failures trace to any single component doing a bad job at its own task.

That matches the compounding math exactly. 5 steps at 95% reliability each produce a 77% system, and the 18-point loss isn't concentrated in 1 weak link, it's distributed across every seam between steps that has no explicit contract for what gets handed off and in what shape.

This is why "just use a better model for the weak step" is usually the wrong fix. If 79% of your failures are specification and coordination problems, the model swap is aimed at the 21% that's left.

Multi-agent pipelines also cost more to run than the reliability math alone suggests: reported token overhead runs 1.6x to 6.2x a comparable single-agent workflow for the same task, mostly spent on the coordination and re-verification the seams require.

Fix the handoff, not the agent. A specification failure and a coordination failure both disappear when the contract between 2 steps is made explicit instead of assumed, which costs design time up front and saves debugging time that would otherwise get spent blaming the wrong step.

Takeaway: most multi-agent failures aren't 1 bad agent, they're an undefined handoff. Check the seams before you swap the model.

## First comment

The compounding math this failure-mode data confirms: /agents/18-five-agents-at-95-percent
