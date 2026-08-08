---
title: "The hook rate is not one number"
slug: 12-the-hook-rate-is-not-one-number
author: James Liu
series: Market Ops Notes
section: media
summary: "Two campaigns, both reporting a 30% hook rate. On Meta that is inside the 'good' band. On TikTok it is barely 'baseline.' Same number, different platform, different verdict."
status: published
publishAt: 2026-08-08T07:05:00Z
platforms: twitter, medium, substack
tags: media, ugc, growth, short-form-video
twitterExcerpt: "A 30% hook rate is 'good' on Meta and barely 'baseline' on TikTok. Same number, two different meanings, because the platforms measure different windows."
demo: retention-lab
---

<!-- EVIDENCE
Claim: A hook rate reported from one platform is not comparable to a hook rate reported from another without knowing the measurement window, because Meta and TikTok do not count the same seconds.
Moment: Building Retention Curve Lab's platform picker and finding that a single "good" guide line could not sit on the chart, because the two platforms' published bands do not share a denominator: three seconds against two.
Numbers: Meta's hook rate is 3-second video plays divided by impressions; TikTok's is 2-second video views divided by impressions. Meta's published bands: 25-30% solid, 30-40% good, 40%+ elite. TikTok's: 30-35% baseline, 40%+ top quartile (Hawky.ai). At the demo's default settings, a slow-build hook style with no captions, the simulated rate lands at 20.9% on Meta, under the solid band.
Names: Retention Curve Lab, Hawky.ai, Meta, TikTok.
Cost: the hook-style deltas in the demo (cold open, pattern interrupt, on-screen question, slow build) and the pacing and caption modifiers are a model I calibrated so the defaults land inside Hawky's published bands, not measurements pulled from a real ad account. Plug in numbers from your own account instead of the defaults, because the defaults are a starting point, not a claim about your content.
Counterexample: a creator with no ad spend and no platform-reported hook-rate column cannot run this comparison at all. The whole framework only applies once a platform is surfacing the 2-second or 3-second metric back to you, which today usually means a business or ads account, not every account on the platform.
Reader action: before comparing a hook rate across two campaigns or two platforms, check which platform produced each number and what window it used, not just the percentage.
-->

# The hook rate is not one number

Two campaigns, both reporting a 30% hook rate. On Meta that sits inside the "good" band, 30 to 40%. On TikTok the same 30% is barely inside "baseline," the lowest tier Hawky.ai names at all. Same number. Different platforms. Not the same result, and not close.

The reason is not creative quality. It is the denominator. Meta's hook rate is 3-second video plays divided by impressions. TikTok's is 2-second video views divided by impressions, a window one full second narrower. A viewer who bails at second 2.5 counts against a TikTok creative and for a Meta one, on the exact same footage, because the two platforms drew the finish line for "hooked" in different places. I built Retention Curve Lab to make this concrete rather than argued about: pick a platform, a hook style, a pacing setting, and a video length, and it draws the retention curve and reads off where it lands against each platform's own published bands, not a single universal number.

## Where the cliff actually sits

The curve the demo draws has two phases. From zero to the platform's window, 3 seconds on Meta or 2 on TikTok, retention falls from 100% toward whatever the hook rate turns out to be, a steep, front-loaded drop. Past the window, the decay is slower and roughly exponential, governed by pacing: more cuts per 10 seconds tightens it, a slow talking-head opening loosens it. At the demo's defaults, a slow-build hook style with no captions and light pacing, the simulated rate lands at 20.9% on Meta, under the solid band's 25% floor. Switch nothing except the platform to TikTok and the same creative choices produce a different number entirely, because the window it is being measured against is a second shorter and the underlying decay curve samples a different slice of the same fall.

Per 10,000 impressions at that default, roughly 7,900 viewers are already gone before the hook window closes. That is the number worth sitting with before optimizing anything downstream of it: a call to action placed at the video's midpoint is not reaching half the impression count an ad dashboard advertises, it is reaching whatever fraction survived the cliff, which on a weak opener is usually well under a third.

The demo ships two presets to make the spread concrete. "Load a weak opener" sets a slow-build style on Meta, no captions, pacing at 2 cuts per 10 seconds, a 34-second runtime, and lands at a 19.7% hook rate, under Meta's own solid floor. "Load a cold open" sets a cold-open style on TikTok, captions on, pacing at 8, an 18-second runtime, and lands at 47.3%, past TikTok's 40% top-quartile line. Nothing about the underlying claim changed between the two runs. Style, platform, captions, pacing, and length all moved at once, which is the honest version of what changes between two real campaigns that get compared on a single percentage and nothing else.

## Why pacing and captions move the number, and why the token cost of testing this is basically zero

Two levers move the curve independent of the hook style itself. Pacing, cuts per 10 seconds, changes the decay rate after the window: a video that cuts every 2 seconds holds attention longer per second than one that holds a single shot, independent of what is actually being said, because the platform's own recommendation systems read cut frequency as a signal and viewers' attention follows a faster edit rhythm even when the content underneath is identical. Captions add a flat bump to both the hook rate and the post-window decay in the model, a deliberately modest one, because burned-in text gives a scrolling viewer something to read in the first frame even with the sound off, and a lot of feed video is watched that way.

Neither lever is free to test in the real world. A single paid test across hook style, pacing, and caption presence, at any meaningful sample size, costs real ad spend and real days of flight time before the platform's own reporting stabilizes. The simulator costs nothing to test against, which is exactly its limit as well as its use: it tells you the shape of the tradeoff and the vocabulary to describe it, cold open against slow build, 2-cut pacing against 8-cut, captions on against off, none of it a substitute for the paid test once a real budget is on the line.

## The counterexample

This entire framework assumes a platform is handing you the 2-second or 3-second number in the first place. An organic creator with no ads account and no business dashboard does not see a hook-rate column at all, and for that account the comparison in this piece does not exist, because there is nothing to compare. Retention Curve Lab and the bands it is built against apply specifically to accounts running paid or business-tier video, where the platform's own reporting surfaces the metric. That is a real, narrower audience than "anyone posting short-form video," and it is worth saying plainly rather than letting the framing imply otherwise.

## What to check Monday

Before comparing a hook rate across two campaigns, or across two platforms, or across two agencies reporting numbers to the same client, check which platform produced each number and what window it used. A 3-point gap between two Meta campaigns is a real signal. A 3-point gap between a Meta number and a TikTok number is close to meaningless until both are converted to the same window, and neither platform's ad manager does that conversion for you. Hawky.ai's own published guidance says the same thing from the other direction: your own account's median, tracked over time on one platform, is a better benchmark than any universal percentage, precisely because it holds the window constant.

Takeaway: a hook rate is not a fact about a video. It is a fact about a video measured against a specific window, and the window changes by platform. Convert before you compare, or stop comparing across platforms at all.
