---
title: "Stolen AI keys spend like cash"
slug: 2026-11-12-stolen-ai-keys-spend-like-cash
date: 2026-11-12
status: published
summary: "Railway's attacker went for AI keys first and stolen keys ran up about $740,000, a breach at Fireworks exposed Notion AI chats, Gemini 4 Carbon's price doubles on 1 Dec, Claude Data goes default-on for Enterprise on 19 Nov and New York opened RAISE Act registration. Plus two free courses."
cover: /digests/2026-11-12-stolen-ai-keys-spend-like-cash/cover.png
carousel: /digests/2026-11-12-stolen-ai-keys-spend-like-cash/carousel.pdf
slides: 8
post: posts/dg-2026-11-12-stolen-ai-keys-spend-like-cash.md
window: 10 to 11 Nov 2026
---

# Stolen AI keys spend like cash

Covering 10 to 11 Nov 2026: five changes that move a product team's week, two of them about who pays when an AI key or an AI vendor gets breached, plus two free courses and my read. Every number links to where it came from.

## 1. Railway's attacker went for the AI keys first, and stolen keys ran up about $740,000

**What happened.** Railway, a cloud platform for deploying apps, published its full incident report on 10 Nov. On 20 Oct an attacker used an unknown flaw to partly escape filesystem isolation on a shared build machine and took a build credential. On 21 Oct a misconfigured OIDC binding handed over a short-lived cloud credential, and a machine holding a long-lived decryption credential let the attacker decrypt a subset of customer environment variables. Railway puts the exposure at no more than 1.85% of workspaces, about 100,000. The attacker prioritized AI provider keys, and Railway estimates about $740,000 of unauthorized spend on stolen keys.

**Why it matters.** A leaked AI key behaves like a leaked card number. Whoever holds it can spend on it, and the issuer decides whether the money comes back. Railway's report lists where each provider landed: AWS Bedrock and Google Gemini refund fraud under their policies, OpenAI reviews refunds case by case, and OpenRouter has a no-refund policy, so Railway is covering those costs, plus Anthropic's while talks continue. The damage from one leaked key depends on which provider issued it and what cap sat on it.

**The catch.** The $740,000 is Railway's estimate, and the 100,000 is a ceiling: Railway's logs identify environments, not single variables. Railway says forensics found no evidence that customer databases were accessed. BleepingComputer's write-up would not load for me, so every figure here comes from Railway's own report.

Sources: [Railway, "Incident Report: October 21st Security Attack"](https://blog.railway.com/p/incident-report-october-security-incident) · [The Neuron, 11 Nov, where I found the story](https://www.theneuron.ai/digest/everything-that-happened-in-ai-today-wednesday-november-11-2026/)

## 2. A breach at Fireworks AI exposed Notion AI chats

**What happened.** Fireworks AI, an inference provider, says attackers used a 23 Oct security incident at a third-party cloud provider to reach its development machines on 24 Oct. Its 9 Nov update adds account and billing details, some secrets, datasets and incomplete model weights to what was accessed. Notion used Fireworks to serve open-weight models. Its advisory, updated 10 Nov, says Notion AI chat transcripts used for its Insights feature were affected in under 1% of workspaces, and that for most of them the transcripts carry no author or workspace label. Notion disconnected Fireworks on 3 Nov, deleted its data there, switched Insights off and no longer serves open-weight models through Fireworks.

**Why it matters.** Your vendors' vendors hold your data too, and you hear about their breaches last. Fireworks first told Notion on 2 Nov that "a small set of data" had been accessed, and confirmed the final affected dataset on 8 Nov. Fireworks says its zero-data-retention products, inference among them, show no impact so far. The data that was hit had been stored, which makes retention terms a security control as well as a compliance one.

**The catch.** Both investigations are still open, and neither company gives a customer count. Notion's advice is to treat affected data as exposed, and to rotate any password or API key pasted into Notion AI during the incident period. Fireworks links the attack to a financially motivated group that allegedly resells tokens from stolen access to AI models.

Sources: [Notion, "Fireworks AI incident" advisory](https://www.notion.com/en-gb/security/advisories/security-incident-involving-a-third-party-ai-vendor) · [Fireworks AI, October 2026 security incident update](https://fireworks.ai/security/bulletins/october-2026-security-incident-update)

## 3. Gemini 4 Carbon is on the paid API, and its price doubles on 1 Dec

**What happened.** Google opened Gemini 4 Carbon, its model for cybersecurity and long agent runs, to paying developers and enterprises on 10 Nov through Google AI Studio and Gemini for business, and to Google AI Ultra subscribers. It costs $2 per million input tokens and $10 per million output, the same as Gemini 4 Argon, until the introductory period ends on 30 Nov. After that it is $4 and $20. Google also previewed /swarm in Antigravity, which turns one prompt into a coordinated team of agents.

**Why it matters.** Google reports that Carbon ranks first on CursorBench 4.0, Perplexity's WANDR and Zapier's AutomationBench, at more than 2x lower cost per task than the next best external model. It also cites two finance results from pre-release testing: Carbon matched the best model tested on Hebbia's E2E Financial Agentic evaluation, and ranked top of 23 frontier configurations on Balyasny Asset Management's General Financial Intelligence benchmark. Teams building research or analyst agents should put it in the next bake-off.

**The catch.** Google's own guidance is that "Argon remains the ideal choice for the majority of software engineering and knowledge work," and Carbon uses more tokens than Argon. More tokens at double the price from 1 Dec means a pilot costed at the launch rate understates the bill. Every benchmark result above comes from Google's post, and the 92% pass rate on agentic honesty, against 70% for Argon, is Google's own 375-task benchmark. The strongest cyber version stays gated behind Google's Fairwind program.

Sources: [Google, "Gemini 4 Carbon is now available"](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Google, "Gemini 4 Carbon is now available for developers"](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-4-carbon-developers/)

## 4. Claude adds Sheets and Whiteboards, and Claude Data turns on by default on 19 Nov

**What happened.** Anthropic released Claude Sheets and Claude Whiteboards in beta on all paid plans on 10 Nov, and made Claude Data, formerly Claude Dashboards, generally available. Sheets export to .xlsx or CSV. Whiteboards export to a doc or a deck, or move to Lucid, Miro or Vani. Claude Data needs a data connector such as a warehouse or a CRM. Interactive connectors now open partner apps, Adobe, Atlassian, Box and Notion among them, beside the conversation.

**Why it matters.** On Enterprise plans, Sheets and Whiteboards start switched off, and Claude Data switches on by default on 19 Nov unless an admin changes it. A companion post says admins can restrict what each connector does (its example: Claude may read Slack but not send messages), set spend limits, and send audit data to more than 100 security and compliance tools through the Compliance API. In the new Enterprise experience each cloud session runs in an isolated virtual machine with connector credentials kept outside it, the same separation Railway has now rebuilt its builds around.

**The catch.** Sheets and Whiteboards are betas, and certified queries and live sharing in Claude Data are still in beta too. The customer results Anthropic quotes, such as Advantage Solutions cutting forecast assembly from about 10 hours to under 30 minutes, are Anthropic's figures. Its post lists Claude Meetings, which joins calls to take notes, as "coming soon."

Sources: [Anthropic, "Claude Whiteboards, Claude Sheets, and Claude Data"](https://claude.com/resources/articles/sheets-whiteboards-data) · [Anthropic, "Working with Claude Sheets, Whiteboards, and Interactive Connectors"](https://claude.com/resources/articles/more-ways-to-work-with-claude-sheets-whiteboards-and-interactive-connectors)

## 5. New York opened registration under its frontier AI law

**What happened.** On 10 Nov New York opened the registration portal for the RAISE Act. Frontier developers with more than $500 million in annual revenue, OpenAI and Anthropic among them, must register by 1 Jan 2027, publish safety frameworks, issue model transparency reports and report critical safety incidents within 72 hours. Fines run up to $1 million for a first violation and up to $3 million for later ones.

**Why it matters.** The law binds your model vendor, not your app, but its regulator sits close to fintech. The Office of Digital Innovation, Governance, Integrity and Trust (DIGIT) is part of the Department of Financial Services, New York's banking and insurance regulator. A vendor that has to tell DIGIT about a critical incident within 72 hours can tell its customers on a similar clock, so write a notice window into the contract.

**The catch.** Compliance and regular reporting start in January 2027, and New York has not said how it will enforce registration: a spokesperson declined to give specifics. The duties fall on large frontier developers, and TechCrunch's report does not address companies that only deploy their models.

Sources: [TechCrunch, 10 Nov](https://techcrunch.com/2026/11/10/openai-anthropic-face-new-oversight-as-new-yorks-ai-safety-law-takes-effect/) · [Governor of New York, 21 Sep, on DIGIT and the RAISE Act timeline](https://www.governor.ny.gov/news/ai-safety-governor-hochul-announces-next-steps-regulate-major-ai-developers-and-protect-new)

## New courses worth an evening

- **Learn Agentic Coding with Codex & AI Coding Agents** · YouTube · free. About two hours from freeCodeCamp, taught by Tom Chant of Scrimba and posted 10 Nov. It covers prompts and AGENTS.md files, Plan Mode and skills, tests for agent changes and MCP, plus a section on using Git safely with an agent and protecting API keys and other secrets, which is this week's lesson at the keyboard. [YouTube](https://youtu.be/ajfQWhGQGLE)
- **The Anatomy of an AI Data Center** · YouTube · free. An 8-hour freeCodeCamp course by Beau Carnes, posted 16 Oct. It runs from power, cooling and optical networking to the economics of GPU cloud hosting and capacity contracts, which is worth knowing before you sign a compute commitment. [YouTube](https://youtu.be/QKNsHZatiWU)

No Udemy pick again: the Udemy course pages I tried either failed to load or showed no rating or update date, and I do not list a course I cannot check. Every pick so far lives on the [courses page](/courses).

## My read

Railway's report reads like a card-fraud case file. The attacker went for AI keys first, and whether the money comes back depends on which provider issued the key. Fireworks links its breach to a group that allegedly resells stolen model access, so stolen AI capacity has buyers. For a product that runs on AI APIs, key hygiene is now a payments problem: one key per service, a hard monthly cap, an alert on unusual spend, and a revocation runbook with a named owner. Gemini 4 Carbon's 1 Dec price and Claude Data's 19 Nov default are quieter versions of the same lesson: the date in the footnote moves the bill.

Takeaway: treat every AI key like a card number, scoped to one service, capped, monitored and quick to revoke, and know which of your providers refunds fraud.
