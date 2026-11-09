---
title: "Same price, different bill"
slug: 2026-11-10-same-price-different-bill
date: 2026-11-10
status: published
summary: "Meta's Muse Ember costs what Claude Haiku 5.5 costs per token and a third as much per task, Claude Fable 5.2 got 20% cheaper with 30-day retention attached, ChatGPT Enterprise now bills through AWS and Google Maps came to AI Studio. Plus two free courses."
cover: /digests/2026-11-10-same-price-different-bill/cover.png
carousel: /digests/2026-11-10-same-price-different-bill/carousel.pdf
slides: 7
post: posts/dg-2026-11-10-same-price-different-bill.md
window: 8 to 9 Nov 2026
---

# Same price, different bill

Covering 8 to 9 Nov 2026: four launches that change what a product team does this week, the terms behind each price, two free courses, and my read. Every number links to where it came from.

## 1. Muse Ember costs the same as Claude Haiku 5.5 per token, and a third as much per task

**What happened.** Meta released Muse Ember on 9 Nov, the smallest model in its Muse family, built for the repetitive half of agent work: tool calls, routing, extraction and coding subtasks under a bigger planner. It is live on the Meta Model API and in Muse Code as `muse-ember-1.0`, and on Google Cloud and Oracle Cloud, with a 1M-token context and up to 512K output tokens. The list price is $0.10 per million input tokens and $0.50 per million output, exactly what Anthropic charges for Claude Haiku 5.5 on prompts up to 100,000 tokens.

**Why it matters.** Artificial Analysis scores both models 36 on its Intelligence Index at their top settings. Its estimated cost per index task is $0.136 for Ember and $0.411 for Haiku 5.5. With matching rate cards, that threefold gap comes from how many tokens each model spends on a task, plus cheaper cached input on Ember ($0.004 per million against Haiku's $0.01). Two models with one sticker price produced bills three times apart, which is the cleanest case yet for comparing models on dollars per finished task.

**The catch.** The cost-per-task figures are Artificial Analysis estimates that Meta chose to publish in its own launch post, and most of the other benchmarks there are Meta's internal ones. Meta's table also puts Ember behind Haiku 5.5 on FrontierCode 2.0, 27.2% against 34.9%, so the cheap worker is not the coding specialist. Test it on your own traces before you move traffic.

Sources: [Meta, "Introducing Our Smallest, Most Efficient Model: Muse Ember"](https://research.meta.ai/blog/muse-ember) · [Claude Platform pricing, for Haiku 5.5](https://platform.claude.com/docs/en/about-claude/pricing) · [TechCrunch, 9 Nov](https://techcrunch.com/2026/11/09/meta-releases-muse-ember-a-new-lightweight-model-for-agent-execution)

## 2. Claude Fable 5.2 is 20% cheaper, and still needs 30-day retention

**What happened.** Anthropic released Claude Fable 5.2 on 9 Nov at $8 per million input tokens and $40 per million output, down from $10 and $50 for Fable 5.1. It has a 1M-token context and 128K output, and Artificial Analysis puts it first on its Intelligence Index at 65. Claude Mythos 5.2 is the same model with fewer cyber and biology restrictions, open only to organizations in Anthropic's verification programs. Anthropic says outputs arrive up to 30% faster than on 5.1.

**Why it matters.** After the cut, Fable still costs twice Opus 5.5 per token ($4 and $20), and Anthropic still names Opus 5.5 as the everyday model. For a regulated team the bigger line sits in the release notes: Fable 5.2 and Mythos 5.2 require 30-day data retention and are not available under zero data retention unless Anthropic expressly authorizes it. Anthropic's route for enterprises is Enterprise Frontier Safeguards, which runs the safety monitoring on prompts and responses stored in the customer's own infrastructure. It is in private beta with Bridgewater, Salesforce and Stripe.

**The catch.** The upgrade is more than a model string. Forced `tool_choice` and fixed thinking budgets return 400 errors, and Fable's thinking blocks are dropped when a conversation moves to another model. Safety classifiers block high-risk cyber work, such as penetration testing and exploit generation, and most research biology. A blocked request comes back as a refusal (HTTP 200 with `stop_reason: "refusal"`) or, with the beta fallback switched on, as an answer from Opus 4.8 or Opus 5. Anthropic reports about 55% fewer blocks than on Fable 5.1; that figure and the speed claim are its own.

Sources: [Anthropic, "Introducing Claude Fable 5.2 and Claude Mythos 5.2"](https://www.anthropic.com/claude-fable-and-mythos-5-2) · [Claude Platform release notes, 9 Nov](https://platform.claude.com/docs/en/release-notes/overview) · [What's new in Claude Fable 5.2](https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2) · [The Decoder, 9 Nov, for the Artificial Analysis score](https://the-decoder.com/claude-fable-5-2-and-mythos-5-2-cement-anthropics-ai-lead-just-before-its-ipo/)

## 3. ChatGPT Enterprise can now be bought through AWS

**What happened.** OpenAI listed ChatGPT Enterprise on AWS Marketplace on 9 Nov. It is sold by OpenAI and billed by AWS, and eligible spend counts toward a customer's AWS Enterprise Discount Program or Private Pricing Agreement, subject to that agreement. One listing bundles four products: Chat, ChatGPT Work, Codex and dots, OpenAI's always-on agents. Pricing is by private offer only. ChatGPT for Financial Services is available to eligible customers the same way.

**Why it matters.** For a company already committed to AWS spend, an AI rollout no longer needs its own budget line or a separate purchase contract. Procurement stops being the slowest step for a team that has already picked the product.

**The catch.** The invoice moves; the data does not. The listing names OpenAI as the data processor, with AWS as one of its subprocessors, and does not say where data for AWS-billed customers is processed. Vendor review, data-protection terms and model-risk sign-off still run against OpenAI. OpenAI's own announcement would not load for me, so these details come from PPC Land's reading of the listing.

Sources: [OpenAI, "ChatGPT Enterprise now available in AWS Marketplace"](https://openai.com/index/chatgpt-enterprise-aws-marketplace/) · [PPC Land, 9 Nov, for the listing details](https://ppc.land/aws-customers-can-now-buy-chatgpt-enterprise-against-cloud-commitments/)

## 4. Google Maps Platform now works inside AI Studio, with no credit card

**What happened.** On 9 Nov Google connected Maps Platform to Google AI Studio. You describe an app to Gemini and AI Studio sets up the Maps, Places, Routes and environment APIs without a credit card, then loads a live map in the preview. The sandbox allows 100 calls per API per day, and the quota resets every 24 hours.

**Why it matters.** A location feature, such as a branch finder, a delivery route or a merchant map, can go from idea to a clickable demo in one sitting, with no cloud project and no procurement ticket.

**The catch.** The quota is sized for prototypes. Production needs a Google Cloud billing account at standard Maps Platform prices, so cost the API calls before the demo turns into a roadmap commitment.

Source: [Google Developers Blog, "From prompt to app: Build with Google Maps in AI Studio"](https://developers.googleblog.com/from-prompt-to-app-build-with-google-maps-in-ai-studio/)

## New courses worth an evening

- **Jev Course: Prefill-Only Inference and Decision Models from Scratch** · YouTube · free. A freeCodeCamp course of about two hours, posted 29 Oct, on PyTorch models that classify and act in the prefill pass instead of generating token by token, with KV-cache reuse across repeated system prompts. It is the engineering side of this week's lesson: the cheapest output token is the one you never generate. [YouTube](https://www.youtube.com/watch?v=aZglGvBPQGs)
- **Build a Hybrid Search Engine in PostgreSQL: BM25 + Vector Retrieval** · YouTube · free. About an hour from freeCodeCamp, posted 21 Oct: keyword and vector search in one PostgreSQL database, merged with Reciprocal Rank Fusion in SQL, over 240,000 Simple English Wikipedia articles. [YouTube](https://youtu.be/kT7nXO32L-Q)

No Udemy pick this time: the course pages I could reach did not show a rating or an update date, and I do not list a course I cannot check. Every pick so far lives on the [courses page](/courses).

## My read

In all four launches the rate card was the least useful number. Ember and Haiku 5.5 share a sticker and land three times apart per task. Fable 5.2 got 20% cheaper and still costs double Opus 5.5 per token, so it earns its price only on the tasks Opus gets wrong. ChatGPT Enterprise on AWS changes who sends the invoice, not who processes the data. In a regulated product, two numbers decide a model switch: dollars per finished task on your own traffic, and the retention terms your compliance team has already signed.

Takeaway: price the next model switch per finished task on your own traffic, and check the retention and processor terms before you look at the rate card.
