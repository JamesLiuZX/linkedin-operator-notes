---
title: "Generated media is a cost curve decision before it is a taste decision"
slug: 06-gen-media-product-lens
section: shipping
pillar: shipping
format: teardown
status: draft
---

<!-- EVIDENCE
Claim: Generated media is worth shipping when it changes the unit economics of content without spending trust, and the failure mode is operational rather than aesthetic.
Moment: Watching a generation pipeline produce assets faster than the human review step could clear them, and the queue becoming the product.
Numbers: one human pass; 4 failure modes; the ranking bar; day one versus month three.
Names: ByteDance.
Cost: I shipped a pipeline where review was the bottleneck and let volume targets push past it for two weeks. The cleanup took longer than the build.
Counterexample: For internal assets with no distribution surface, full automation is fine. Nobody is ranking your seed data.
Reader action: Size the human review step before the generation step, then set volume to whatever review can clear.
-->

# Generated media is a cost curve decision before it is a taste decision

Most generative media posts are demos. "Look what I made." Fine for art, weak for product.

Inside a growth system the question is never model quality on its own. It is whether the output survives contact with distribution, and there are 4 tests for that.

Does it clear the channel's ranking bar? Google, TikTok and the App Store all have a developed taste for spam. Models cut the cost of producing 1,000 assets by maybe 90%, which is worth nothing if the channel is tuned to punish exactly that.

What is the human edit loop? Fully automated content reads as automated within 2 paragraphs. Every system I have seen work had 1 tight human pass covering taste, factual risk, and brand.

Is the marginal asset compounding? One good image is a toy. A system producing assets that still attract qualified traffic in month 3 is a product.

What breaks at scale? Duplication, thin pages, wrong claims in the support queue. Generated media fails operationally long before it fails aesthetically, and only the operational failure has a dollar figure attached.

I shipped a pipeline at ByteDance in 2024 where the human review step was the bottleneck, and then let a volume target push output past what review could clear for 2 weeks. The queue became the product. Cleanup took roughly 3x longer than the build, and that was my mistake, not the model's.

The lesson was ordering. Size the review capacity first, then set generation volume to whatever review can actually clear. It feels backwards and it is the only version that holds.

One case escapes all of this. Internal assets with no distribution surface can be fully automated, because nobody at Google is ranking your seed data.

If the strategy is "publish more", you automated mediocrity and bought a support queue.

Takeaway: generated media earns its place when it shortens the path from insight to distributed asset without spending trust to do it.
