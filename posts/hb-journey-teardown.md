---
title: "My teardown skill passed all 6 checks. It still had 15 faults"
slug: hb-journey-teardown
pillar: growth
section: growth
status: ready
derivedFrom: skills/journey-teardown/SKILL.md
publishAt: 2026-12-01T01:00:00Z
platforms: linkedin
tags: ai, competitive-analysis, product-management, skills
media: /hub/launch/journey-teardown/carousel.pdf, /hub/launch/journey-teardown/clip.mp4
---

<!-- EVIDENCE
Claim: A check that an output passes on the first try, while the instructions still have many faults, is too lenient, and the check should be fixed before the output is trusted.
Moment: On 18 Nov 2026 the first test run of the journey teardown skill passed all 6 checks and returned 15 faults in the instructions.
Numbers: 24 schematic screens of 4 invented grocery apps across 3 stages; 12 lanes and 60 notes; 15 faults from run one; best-app mean score 4.13 in run one and 3.73 in run two; $4.50 delivery charged on a $56.70 order after a free delivery over $40 banner (all invented data).
Names: AI Workflow Handbook, journey-teardown skill, check.py, Tangelo, Pippin, Marrow, Sorrel (all invented apps).
Cost: The screens are drawings, so nothing here tests how well the skill reads real screenshots. One reader scored every lane in one sitting. The Miro route is written down and has not been run.
Counterexample: With one competitor there is nothing to lay out. The skill refuses fewer than three apps, because a teardown of one is an opinion.
Reader action: In the next competitor review, put your own product in the last row under the best example, and give every score a one-line reason.
-->

## Draft

My teardown skill passed all 6 checks. It still had 15 faults.

The skill compares how several products handle one journey and lays it out as a board: one lane per app, per stage, with notes on every screen and a score on five dimensions.

To test it I gave the folder to a fresh agent session with 24 schematic screens of four invented grocery apps. Nothing else, and nobody to ask.

It passed every check on the first try and returned a list of 15 things wrong with my instructions. A first-time pass with 15 complaints means the checks were too easy.

Three of the fixes:
· the best lane in a stage got a 5 by default. Now a 5 means you would not change it, and the best app's average fell from 4.13 to 3.73
· every gap had to name a competitor that did it better, even when none did. Now it can say no app on the board does this
· a missing verdict only raised a warning. Now it fails

The second run found something no single screen shows. The home screen promised free delivery over $40. The basket two screens later charged $4.50 on a $56.70 order. The skill caught it by comparing two screens in the same lane.

What it has not been tested on: real screenshots. These screens are drawings. And one reader scored every lane in one sitting, so the scores rank the lanes and do not measure them.

Your own product is always the last lane in each stage, under the best example.

Takeaway: when a check passes too easily, fix the check before you trust the output.

#ProductManagement #UXResearch #AI

## First comment

The demo, the board you can drag and zoom, the record of both test runs and the skill: /workflows/journey-teardown/
