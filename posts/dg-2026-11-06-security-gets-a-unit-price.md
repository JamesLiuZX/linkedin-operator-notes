---
title: "AI found 948 ways to root Linux for about $1,280 each"
slug: dg-2026-11-06-security-gets-a-unit-price
pillar: agents
section: agents
status: ready
derivedFrom: digests/2026-11-06-security-gets-a-unit-price.md
publishAt: 2026-11-07T01:00:00Z
platforms: linkedin
tags: ai, security, agents, digest
digest: 2026-11-06-security-gets-a-unit-price
media: /digests/2026-11-06-security-gets-a-unit-price/carousel.pdf, /digests/2026-11-06-security-gets-a-unit-price/cover.png
---

<!-- EVIDENCE
Claim: AI security review now has a per-exploit price, so it belongs on the launch checklist with a budget and a schedule.
Moment: OpenAI published its Linux kernel research run on 4 Nov 2026, the same week Cloudflare open-sourced its audit skill and Cognition shipped a cheap coding tier.
Numbers: 2,308 candidate findings, 1,724 reproduced, 948 root exploits, $1,213,430 of API credits (about $1,280 each); Cloudflare README: one run finds about half of what repeated runs find; Images 2.6 50% faster; Conductor Cloud read-only 13 Nov, closed 20 Nov; SWE-2 Flash at one-fifth of SWE-2's price, 12B active of 276B.
Names: OpenAI, Cloudflare, Meta, Conductor, Cognition, Devin, Thinking Machines, CMU, Udemy.
Cost: the cyber model is unreleased and its patches are candidates, not shipped fixes; the 50% and FrontierCode figures are vendor-reported.
Counterexample: a team with a mature pentest program and a small attack surface may get little from another scan; the gain is largest where nobody owns security review today.
Reader action: add AI security review to the next launch checklist with an owner, a budget and a run cadence.
-->

## Draft

AI found 948 ways to root Linux for about $1,280 each.

OpenAI published that number on 4 Nov 2026, and it reprices security work. Five moves from the last 48 hours worth a builder's attention:

1. An unreleased OpenAI cyber model took 2,308 candidate kernel bugs, reproduced 1,724 and wrote 948 working root exploits on roughly $1.2M of credits. The patches still need the kernel maintainers.

2. Cloudflare open-sourced its security-audit skill. One set of agents hunts, then a fresh agent tries to knock down every finding. Its README says a single run catches about half of what repeated runs find.

3. OpenAI Images 2.6 generates 50% faster, makes GIFs and splits the API into Flare for speed and Sunburst for detail.

4. Meta bought Conductor, the multi-agent coding tool. Its cloud locks to read-only on 13 Nov and goes dark on 20 Nov.

5. Cognition put SWE-2 Flash into Devin at a fifth of the flagship's price: 12B active parameters, no public weights.

New courses worth an evening:
· CMU 11-768 AI Agents, free on YouTube, lectures posting until 3 Dec
· Complete Claude Code Course on Udemy, updated October 2026, rated 4.6

My read: finding a hole now has a unit cost, and anyone can pay it. If you ship a product that touches money, AI security review belongs on the launch checklist with a budget and a schedule.

Takeaway: an AI-found root exploit costs about $1,280 to produce, so budget security review like a pentest and run it on a schedule.

#AI #ProductManagement #CyberSecurity

## First comment

Full digest with every source, the carousel and the course picks: /digest/2026-11-06-security-gets-a-unit-price

## X thread

AI found 948 ways to root Linux for about $1,280 each.

OpenAI's unreleased cyber model did it in one research run. Security review just got a unit price.

5 AI moves from the last 48 hours, and what each changes for builders:

---

1/ OpenAI: 2,308 candidate kernel bugs in, 1,724 reproduced, 948 working root exploits out. About $1.2M in credits.

The model is unreleased and the patches still need kernel maintainers. Assume attackers can buy the same run.

---

2/ Cloudflare open-sourced its security-audit skill.

Hunters find, then a fresh agent tries to disprove every finding. Per its README, one run catches about half of what repeated runs find. Put it on a schedule.

---

3/ OpenAI Images 2.6: 50% faster, GIF output, two API tiers.

Flare for speed, Sunburst for detail and consistent subjects across edits. SVG export too, so assets drop straight into design files.

---

4/ Meta bought Conductor, the tool that splits a coding project across agents.

Its cloud goes read-only 13 Nov and shuts 20 Nov. If a workflow lives in a startup's cloud, keep an export path.

---

5/ Cognition's SWE-2 Flash is live in Devin at a fifth of SWE-2's price. 12B active parameters, weights withheld.

Send routine work to the cheap tier and judge it on cost per finished task.

---

New courses worth an evening:

CMU 11-768 AI Agents, free on YouTube, lectures until 3 Dec
Complete Claude Code Course on Udemy, updated Oct 2026

Full digest with every source: /digest/2026-11-06-security-gets-a-unit-price
