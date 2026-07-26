---
title: "Prototype aggressively, productionize suspiciously"
slug: 07-ai-trading-agent
section: agents
pillar: agents
format: build log
status: draft
derivedFrom: articles/03-prototype-aggressively-productionize-suspiciously.md
linkInComment: /agents/03-prototype-aggressively-productionize-suspiciously
---

<!-- EVIDENCE
Claim: A weekend agent prototype validates interaction questions and validates nothing about risk, and the gap between those two is where roadmaps get destroyed.
Moment: A fluent demo that made a stakeholder ask about a Q3 launch date, for a system with no defined risk surface.
Numbers: one weekend; 5 things a prototype cannot validate; Brier 0.122 to 0.136 for unaided frontier models against 0.09 for market prices.
Names: Kalshi, Polymarket, Brier.
Cost: My prototype sounded certain about a market it had mispriced, and I showed it anyway because the demo flowed better without the caveat.
Counterexample: Some agent surfaces genuinely are low risk. A market explainer that cannot place an order is worth shipping quickly.
Reader action: Write down what must never be autonomous before you show anyone the demo.
-->

# Prototype aggressively, productionize suspiciously

I built an AI trading agent over a weekend. It was fluent, fast, and completely unfit for production.

That was the useful part.

A weekend prototype answers 3 real questions. Can an agent explain a market in plain language. Can it help someone form a view without pretending to certainty. Where does the interaction break, in tools, memory, permissions, or latency.

It answers none of the 5 that matter. Risk controls. Prompt injection and abuse. Regulatory boundaries under a CFTC regime that changed twice in 2026. Whether users trust automation with money. Whether "helpful" quietly becomes "liable".

That distinction is the whole game for AI near a trading product.

The dangerous sequence is short. Demo a fluent agent on Friday. A stakeholder imagines production by Monday. Engineering inherits an undefined risk surface, and the conversation about what the thing must never do happens after a Q3 date is already on a slide.

The useful sequence is the same demo with one step inserted. Show it, then write down what must never be autonomous, then design the human checkpoint, and only then ask for roadmap space.

Here is my admission. My prototype sounded certain about a market it had mispriced by roughly 20 cents, and I showed it without the caveat because the demo flowed better that way. Nobody caught it. That is worse, not better, and it was my mistake in 2025 rather than a limitation of the model.

The published numbers say why fluency is not evidence. Unaided frontier models score 0.122 to 0.136 on Brier. Kalshi and Polymarket prices score about 0.09, human superforecasters 0.096, and the general public 0.121. Lower is better, so the confident-sounding model is losing to the screen it is reading and to the crowd it is talking over.

AI makes it cheap to fake completeness. Trading products punish fake completeness with real money.

Takeaway: write the list of things that must never be autonomous before the demo, not after someone asks for a launch date.
