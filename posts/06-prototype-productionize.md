---
title: "A weekend agent cannot validate the 5 things that decide the roadmap"
slug: 06-prototype-productionize
pillar: field-notes
section: agents
status: ready
derivedFrom: articles/03-prototype-aggressively-productionize-suspiciously.md
publishAt: 2026-08-20T01:00:00Z
platforms: linkedin
tags: agents, ai, product
---

<!-- EVIDENCE
Claim: A fluent agent demo validates the interaction and validates nothing about the risk surface, and the gap between those two facts is where trading roadmaps get committed by accident.
Moment: Finishing my own forecasting agent, having it produce clean confident probabilities on the first run, and realising I could not tell whether any of it was skill until I built a second arm that never sees the price.
Numbers: 2 arms needed before a single forecast means anything, 5 things a weekend build cannot validate, 19 self-tests that check the scoring and 0 that check the model is right, 1 dependency.
Names: scripts/ledger, the blind arm, the anchored arm, Brier score, prompt injection.
Cost: My own agent looked most convincing at exactly the moment it was least verified. The demo was ready days before the control that makes it mean anything, and a demo shown in that window would have sold a capability I could not back.
Counterexample: Over-caution has a cost too. Refusing to prototype until the risk surface is mapped means the risk surface gets mapped by people who have never felt the interaction, which produces controls that miss where it actually breaks.
Reader action: Before showing an agent demo to anyone senior, write the list of what it did not test, and read that list out first.
-->

## Draft

A weekend agent prototype validates the interaction. It validates nothing else.

I built one recently. First run, it produced clean confident probabilities on live questions and looked ready. It was not ready. It had 0 controls, and I could not tell whether any of the output was skill until I built a second arm that never sees the market price.

What a weekend build genuinely tests:

· Whether the thing can explain a market in plain language.
· Where the interaction breaks. Tools, memory, permissions, latency.

What it cannot test, and what a room full of stakeholders will assume it tested:

· Risk controls under adversarial input.
· Prompt injection when the input is a public feed.
· Regulatory boundaries on anything touching an order.
· Whether users trust automation with money.
· When helpful becomes liable.

The dangerous sequence has 3 steps. Demo a fluent agent, watch the room imagine production, hand engineering an undefined risk surface with a date attached.

The useful sequence has 4. Demo it, write down what must never be autonomous, design the human checkpoint, then ask for roadmap space. The 2nd step is the one that gets skipped, and it is the only one that costs nothing to do first.

The tell I now trust: my own agent looked most convincing at the exact moment it was least verified. In scripts/ledger, 19 self-tests cover the scoring and the log. 0 of them check that the model is right, because no test can, which is the entire reason the second arm exists.

Prototype aggressively. Productionize suspiciously.

Takeaway: show the demo with the list of what it did not test, and read that list first.

## First comment

The agent, its control arm, and the pre-registration that fixes the rules before any result: github.com/JamesLiuZX/linkedin-operator-notes/tree/master/scripts/ledger

Longer version of the argument: /agents/03-prototype-aggressively-productionize-suspiciously
