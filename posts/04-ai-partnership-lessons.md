---
title: "Every AI partnership I worked on died the same way"
slug: 04-ai-partnership-lessons
section: agents
pillar: agents
format: lesson
status: draft
---

<!-- EVIDENCE
Claim: AI partnerships fail at integration ownership, not at model quality, and the demo is the least predictive part of the process.
Moment: A signed partnership where the launch happened, usage did not, and both sides spent a quarter calling it change management.
Numbers: first 30 days after signature; 200,000 users; one launch, one quarter of blame.
Names: ByteDance.
Cost: I polished the demo deck. Nobody had written down who owned auth after the press release, and I did not ask.
Counterexample: A partnership can survive a mediocre demo if distribution is real. The reverse has never worked for me.
Reader action: Before signature, name the person who owns auth, data flow, failure modes, and support.
-->

# Every AI partnership I worked on died the same way

The demo is the least predictive part of an AI partnership.

It is also the cheapest, which is why it gets 80% of the attention and almost none of the blame.

I worked an enterprise AI partnership end to end at ByteDance in 2024, from first conversation through contracting and into technical integration. What determined whether value showed up had almost nothing to do with the model.

Who owns integration after the press release. If nobody has their name against all 4 of auth, data flow, failure modes, and support, you bought a logo for 7 figures.

Contracting is product design. Seats, usage tiers, SLAs, brand constraints, data handling. Each one reshapes what you can actually ship, and ignoring them hands engineering a political problem disguised as a technical one. Our SLA alone moved 2 features off the roadmap.

Distribution inside the enterprise beats model quality. A slightly worse experience that 200,000 people can find beats a brilliant one nobody can.

Success metrics have to be boring. "People are excited" is not a metric. Activation, retention, support load, and whether the feature displaced a worse workflow are metrics. We tracked 4 of those and reported on the fifth for two quarters.

The failure is quiet. Launch happens. Usage does not. Both sides spend a quarter calling it change management, and the postmortem never names the thing, which is that integration was treated as a phase instead of the product.

I polished the deck. I did not ask who owned auth on day 31. That was my job and I did not do it.

Takeaway: spend the week before signature mapping the first 30 days after it, and put a name against every box.
