---
title: "44.4% of PMs want AI for prototypes. 19.8% use it that way"
slug: hb-flagged-prototype
pillar: growth
section: growth
status: ready
derivedFrom: skills/flagged-prototype/SKILL.md
publishAt: 2026-12-10T01:00:00Z
platforms: linkedin
tags: ai, prototyping, product-management, skills
media: /hub/launch/flagged-prototype/carousel.pdf, /hub/launch/flagged-prototype/clip.mp4
---

<!-- EVIDENCE
Claim: A prototype is easier to decide on when each PRD point is a switch that can be turned on alone, with everything off showing the product as it is today.
Moment: On 18 Nov 2026 a test run of the prototype skill on a parking app brief found that the checker skipped the spec entirely when no PRD was given.
Numbers: 44.4% of product managers want AI for prototyping and 19.8% use it for that, in a survey of 1,750 published Dec 2025; example of 5 screens and 6 switches; test run passed 5 of 6 checks on 18 Nov 2026.
Names: Lenny Rachitsky, Noam Segal, AI Workflow Handbook, flagged-prototype skill, check.mjs, Tangelo and Kerb (invented apps).
Cost: My checker had a bug that skipped the spec without a PRD, found only by the test run. The Tangelo prototype was written alongside the skill, and the fresh-run example is the parking app. The screens are schematic and do not use a design system.
Counterexample: A single change with nothing to compare it to needs a mock-up, not switches.
Reader action: In the next design review, show the current product first, then turn on one change at a time and take a decision on each.
-->

## Draft

44.4% of PMs want AI for prototypes. 19.8% use it that way.

Those figures are from Lenny Rachitsky and Noam Segal's survey of 1,750 tech workers, published in December 2025. Prototyping was the most wanted use.

The usual AI prototype is a new design, all at once. A reviewer can like it or not, and when they like most of it there is no way for them to approve half and send the rest back.

This skill builds the prototype differently. Every numbered point in the PRD becomes a switch. With every switch off, the screen is the product as it ships today. Turn on 1.1 and one change appears, with its number pinned to it.

The example is an invented grocery app: 5 screens and 6 switches. The link carries the switch state, so you can send someone straight to 1.1 with 2.1.

A script checks 6 things. Every switch changes at least one screen. No tap is dead. Made-up data is labelled. One check stays with you: with everything off, is that really your product today?

I tested the skill on a different brief, a parking app, with a fresh agent session and nobody to ask. It passed 5 of 6 checks. The sixth compares switch IDs with a PRD, and that brief had none.

The run also found a bug in my checker. Without a PRD it skipped the spec entirely. Fixed on 18 November 2026.

The limit: it draws schematic screens, not your design system. It is for deciding what to build. A designer still has to make it real.

Takeaway: a prototype reviewers can switch on and off gets a decision per change.

#ProductManagement #Prototyping #AI

## First comment

The demo with live switches, both worked examples, the record of the test run and the skill: /workflows/flagged-prototype/
