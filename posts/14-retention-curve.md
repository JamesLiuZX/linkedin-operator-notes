---
title: "A 30% hook rate is elite on one platform and mediocre on another"
slug: 14-retention-curve
pillar: media
section: media
status: ready
derivedFrom: articles/12-the-hook-rate-is-not-one-number.md
publishAt: 2026-08-12T01:00:00Z
platforms: linkedin
tags: media, ugc, growth, short-form-video
---

<!-- EVIDENCE
Claim: A hook rate from one platform is not comparable to a hook rate from another without knowing the measurement window, because Meta and TikTok do not count the same seconds.
Moment: Building a platform picker for a retention simulator and realising a single "good" line could not sit on the chart, since the two platforms' bands do not share a denominator.
Numbers: Meta measures a hook at 3 seconds, TikTok at 2. Meta's bands: 25-30% solid, 30-40% good, 40%+ elite (Hawky.ai). TikTok's: 30-35% baseline, 40%+ top quartile. A 30% hook rate sits inside Meta's "good" band and barely inside TikTok's "baseline."
Names: Retention Curve Lab, Hawky.ai, Meta, TikTok.
Cost: the hook-style and pacing deltas in the demo are a model calibrated to land inside Hawky's published bands, not measurements pulled from a real ad account.
Counterexample: an organic creator with no business account never sees this metric at all, the comparison only applies once a platform is surfacing the 2s or 3s number back to you.
Reader action: before comparing a hook rate across two platforms, check which window produced each number, not just the percentage.
-->

## Draft

A 30% hook rate is elite on one platform and barely passing on another. Same footage, same 30%.

Meta counts a hook at 3 seconds. TikTok counts it at 2, a full second narrower. A viewer who bails at 2.5 seconds counts against a TikTok creative and for a Meta one, on the identical clip, because the two platforms drew the finish line in different places.

Run the numbers against Hawky.ai's published bands and the gap gets concrete. On Meta, 30% sits inside the "good" tier, 30 to 40%. On TikTok, that same 30% is barely inside "baseline," the lowest tier named at all. Nobody's ad dashboard flags this. It just quietly reports two numbers on the same scale, when they were never on the same scale to begin with.

I built Retention Curve Lab so a marketer can see the shape instead of arguing about it: set a hook style, a platform, a pacing value, and watch the curve fall against that platform's own bands, not a borrowed universal one. At weak settings, roughly 7,900 of every 10,000 impressions never make it past the hook window at all, a number most reach reports never break out.

A slider cannot rescue a video with nothing in it, and I would not want it to. Delivery math is a multiplier on a real argument, not a substitute for one.

Takeaway: a hook rate is not a fact about a video, it is a fact about a video measured against a specific window. Convert before you compare across platforms.

## First comment

Try it: /demos/retention-lab

The full breakdown, including why the two platforms measure different windows at all: /media/12-the-hook-rate-is-not-one-number
