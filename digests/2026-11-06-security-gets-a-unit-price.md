---
title: "Security work just got a unit price"
slug: 2026-11-06-security-gets-a-unit-price
date: 2026-11-06
status: published
summary: "OpenAI priced a root exploit at about $1,280, Cloudflare open-sourced its audit skill, Images 2.6 got faster, Conductor's cloud is closing and Devin got a cheap tier. Plus three new courses."
cover: /digests/2026-11-06-security-gets-a-unit-price/cover.png
carousel: /digests/2026-11-06-security-gets-a-unit-price/carousel.pdf
slides: 8
post: posts/dg-2026-11-06-security-gets-a-unit-price.md
window: 4 to 6 Nov 2026
---

# Security work just got a unit price

Covering 4 to 6 Nov 2026: five releases that change what a product team does this week, three new courses, and my read. Every number links to where it came from.

## 1. OpenAI's unreleased cyber model produced 948 root exploits

**What happened.** OpenAI published the results of a research run on 4 Nov. In mid-October an unreleased cyber model worked through 2,308 candidate Linux kernel findings, dynamically reproduced 1,724 of them and produced 948 local privilege escalation exploits, each able to take an unprivileged user to root. The run used about $1.2M of API credits, close to $1,280 per exploit.

**Why it matters.** Offensive security now has a price per finding, and it is small next to a pentest day rate. Anyone with that budget can point the same search at your stack, so the defensive version belongs in the plan with a named owner.

**The catch.** The model has no public name, price or release date. The patches are candidates for kernel maintainers to review, not shipped fixes, and OpenAI's researchers reviewed every exploit before anything went upstream.

Sources: [OpenAI, "A thousand fewer paths to root"](https://openai.com/index/a-thousand-fewer-paths-to-root/) · [AI Weekly, 5 Nov, for the $1,213,430 total](https://aiweekly.co/ai-news-today/edition/2026-11-05) · [summary with the full funnel](https://dev.to/jathurshan_sownthararasa_/tech-trends-week-of-nov-6-2026-ai-security-research-audit-skills-images-26-1b5g)

## 2. Cloudflare open-sourced the skill behind its vulnerability hunting

**What happened.** `security-audit` is an MIT-licensed skill for any coding agent that supports tool use and parallel sub-agents. It maps the architecture and trust boundaries, sends isolated hunters through a coverage ledger, then gives every candidate to a fresh verifier whose only job is to disprove it. Results land as confirmed, needs-validation or rejected.

**Why it matters.** The structure is the lesson, and it travels well beyond security: the agent that finds should never be the agent that checks. The README adds that one run caught roughly half of what repeated runs found, so treat it as a recurring job.

**The catch.** It needs an OS-level sandbox to execute target code. Without one, leads stay in needs-validation.

Install with `npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit`.

Source: [cloudflare/security-audit-skill on GitHub](https://github.com/cloudflare/security-audit-skill)

## 3. OpenAI Images 2.6: faster, with GIFs and two API tiers

**What happened.** Released on 4 Nov across ChatGPT, Codex and the API, with generation OpenAI describes as 50% faster and GIF output. The API splits into GPT-Image-2.6 Flare, the quick model, and Sunburst, which holds more detail and keeps subjects consistent across edits at medium or high quality. Developers also get marked-up edit regions, SVG export and a complexity setting.

**Why it matters.** Two tiers make routing the default for creative teams: iterate cheaply, finish on the detailed model. SVG export means generated work can go into design files and brand systems instead of stopping at a social post.

**The catch.** The speed figure is OpenAI's own. Reported pricing is $30 per million image-output tokens for both models, so check the pricing page before you budget a campaign.

Sources: [OpenAI, "Introducing Images 2.6"](https://openai.com/index/introducing-images-2-6/) · [API and pricing details](https://dev.to/jathurshan_sownthararasa_/tech-trends-week-of-nov-6-2026-ai-security-research-audit-skills-images-26-1b5g)

## 4. Meta bought Conductor, and its cloud closes on 20 Nov

**What happened.** Conductor lets a developer split one coding project across several AI agents. With the team joining Meta, Conductor Cloud turns read-only on 13 Nov and closes on 20 Nov, when deletion of cloud user data begins. The local app keeps getting new models and critical fixes until early 2027.

**Why it matters.** Agent tooling is folding into the big platforms, and a week of notice is what a young vendor can give you. Anything your team runs on a startup's cloud needs an export path and a fallback tool someone has already tried.

**The catch.** If you use Conductor Cloud, export before 20 Nov.

Sources: [Sam on AI, 5 Nov](https://samonai.substack.com/p/ai-brief-november-5-2026) · [The Neuron, 5 Nov](https://www.theneuron.ai/digest/everything-that-happened-in-ai-today-thursday-november-5-2026/)

## 5. Cognition's SWE-2 Flash: a cheap tier inside Devin

**What happened.** SWE-2 Flash is live in Devin Desktop and the CLI, priced at a fifth of SWE-2. It has 276B parameters with 12B active and is built on Thinking Machines' Inkling-Small. Public weights are withheld for now.

**Why it matters.** Price tiers inside one vendor turn model choice into routing: the light tier for routine changes, the full model for hard ones. The number to watch is cost per finished task, not cost per token.

**The catch.** Cognition reports FrontierCode 2.0 rising from 3.2% for the base model to 24.0%, and FrontierCode is Cognition's own benchmark. Wait for independent numbers.

Source: [Sam on AI, 5 Nov](https://samonai.substack.com/p/ai-brief-november-5-2026)

## New courses worth an evening

- **AI Agents, CMU 11-768 (Fall 2026)** · YouTube · free. Graham Neubig and Daniel Fried teach harnesses, evals and RL training for agents, with recordings posted as the term runs to 3 Dec. [cmu-agents.com](https://cmu-agents.com)
- **Complete Claude Code Course: Beginner to Advanced** · Udemy · paid. Badged hot and new, rated 4.6 from 165 reviews, last updated October 2026. [Udemy](https://www.udemy.com/course/complete-claude-code-course-beginner-to-advanced/)
- **Claude Code 2026: Agents Teams, Subagents, MCP & Skills** · Udemy · paid. 28 lectures in 2h 35m, updated October 2026. [Udemy](https://www.udemy.com/course/claude-code-2026-masterclass/)

Every pick so far lives on the [courses page](/courses).

## My read

Two prices showed up in the same week. A working path to root costs about $1,280 in credits, and routine coding now has a tier at a fifth of the flagship's price. Both move a decision out of engineering and into the budget. If your product touches money, the live question is who owns the line item for AI security review and how often it runs.

Takeaway: put AI security review on the launch checklist with a budget and a schedule, because the attacker's version costs the same.
