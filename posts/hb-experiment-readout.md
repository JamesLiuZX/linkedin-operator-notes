---
title: "The test won by 1.7 points. The verdict was extend, not ship"
slug: hb-experiment-readout
pillar: growth
section: growth
status: ready
derivedFrom: skills/experiment-readout/SKILL.md
publishAt: 2026-11-26T01:00:00Z
platforms: linkedin
tags: ai, experimentation, product-management, skills
media: /hub/launch/experiment-readout/carousel.pdf, /hub/launch/experiment-readout/clip.mp4
---

<!-- EVIDENCE
Claim: An A/B readout should check the test before the result, compute every figure with a script, and take its decision from a rule fixed in advance.
Moment: On 18 Nov 2026 the first test run of the readout skill returned a clear win whose interval, 0.8 to 2.6 points, reached below the 1 point the team had set as worth shipping, and nothing in the skill remarked on it.
Numbers: Invented test: 41,870 customers over 14 days; order rate 33.4% to 35.1%, up 1.7 points, interval 0.8 to 2.6; large-order share down 1.0 points with an interval reaching a fall of 2.6 against a tolerance of 1.0; 42 tests on the statistics; 6 scripted checks.
Names: AI Workflow Handbook, experiment-readout skill, ab_stats.py, check.py, sample ratio mismatch, Tangelo (an invented grocery app).
Cost: My first version did not flag a win whose interval dips below the agreed minimum. The skill does not size an extension, so run 14 more days is the agent's proposal. It covers two arms and a rate only.
Counterexample: A test with millions of users and no guardrail near its tolerance reads the same with or without the skill. The checks matter when the result is close.
Reader action: On the next readout, ask for the sample ratio check and the smallest detectable effect before anyone shows the lift.
-->

## Draft

The test won by 1.7 points. The verdict was extend, not ship.

This is a made-up test from the handbook's running example: a reorder card on a grocery app's home screen. 41,870 customers, 14 days, split in half.

Orders within 7 days rose from 33.4% to 35.1%. Most dashboards stop there, and so do most summaries written by a model.

The readout skill does three things before it looks at that number:
· checks the split was the 50/50 that was planned
· checks the test ran its full 14 days
· works out the smallest effect the test was able to see

Then it reads the guardrails. One did not hold. The share of large orders fell 1.0 points, and its interval reached a fall of 2.6. The team had said it would accept 1.0 at most.

So a fixed rule fired: better on the main metric, unclear on a guardrail, extend.

The model does none of the arithmetic. A script does, with 42 tests behind it, and a checker reruns it on the stored counts. If one figure in the summary is not in the numbers, the check fails.

What I got wrong first: the team had set 1 point as the smallest lift worth shipping, the interval ran from 0.8 to 2.6, and my first version said nothing about it. A test run pointed that out. The script now flags it.

It handles two arms and a rate. Revenue per user, or a test someone watched daily and stopped on a good day, needs a different method. The skill stops and says so.

Takeaway: check the test before the result, and let a script hold the rule.

#Experimentation #ProductManagement #AI

## First comment

The demo with editable counts, the finished readout, the script, its 42 tests and the record of both test runs: /workflows/experiment-readout/
