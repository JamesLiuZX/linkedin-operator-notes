# Post 07 — AI trading agent prototype
**Pillar:** AI ships · **Format:** build log  
**Status:** ready to edit · careful: no product secrets, no performance claims  
**Reuse:** Newsletter build notes · AI-native PM module

---

## Draft

I prototyped an AI trading agent as a PM.

Not because I think agents replace trading systems next quarter.  
Because I wanted to feel where the product boundaries actually are.

A weekend prototype can validate:

• Can an agent explain a market in plain language?  
• Can it help a user form a thesis without pretending certainty?  
• Where does the UX break — tools, memory, permissions, latency?

A weekend prototype cannot validate:

• Risk controls  
• Abuse and prompt injection  
• Regulatory boundaries  
• Whether users trust automation with money  
• Whether "helpful" becomes "liable"

That distinction is the whole game for AI in trading products.

The dangerous pattern: demo a fluent agent → stakeholders imagine production → eng inherits an undefined risk surface.

The useful pattern: demo a fluent agent → write down what must never be autonomous → design the human checkpoint → only then ask for roadmap space.

AI makes it easier to fake completeness.

Trading products punish fake completeness.

If you're a PM building agents near money: prototype aggressively, productionize suspiciously.

---
