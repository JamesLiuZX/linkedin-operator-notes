---
title: "Your thumb is the spending limit"
slug: 2026-11-16-your-thumb-is-the-spending-limit
date: 2026-11-16
status: published
summary: "ChatGPT's agents can now check out with a card token and a fingerprint but no spending limit yet, Gemini can read Google Wallet but not move money, a key Cursor issued to Fireworks led to a backdoored extension, Cloudflare caps now pause Workers and the Fed's survey ranks AI the top-cited financial risk. Plus two free courses."
cover: /digests/2026-11-16-your-thumb-is-the-spending-limit/cover.png
carousel: /digests/2026-11-16-your-thumb-is-the-spending-limit/carousel.pdf
slides: 8
post: posts/dg-2026-11-16-your-thumb-is-the-spending-limit.md
window: 13 to 15 Nov 2026
---

# Your thumb is the spending limit

Covering 13 to 15 Nov 2026: five changes that move a product team's week. Four of them are about what an agent may do with money or a key before a person looks, and the fifth is the Fed starting to watch. Plus two free courses and my read. Every number links to where it came from.

## 1. ChatGPT's agents can now check out for you, with no spending limit yet

**What happened.** OpenAI launched ChatGPT Wallet on Friday 13 Nov for a limited number of US ChatGPT Pro subscribers who are 18 or older and hold a US-issued card. It was built with American Express, Mastercard and Visa. You add a card once, and your dot, OpenAI's name for its agents, finds the product, fills the basket and pays at checkout. The dot pays with a payment token that stands in for the card, so neither the agent nor the merchant receives the card number, and every purchase waits for a security check such as Face ID or a fingerprint.

**Why it matters.** That per-purchase check is the only spending control today. TechCrunch reports that OpenAI plans spending limits and rules by purchase category or time period, so users can pre-approve purchases, with no date given. For merchants, OpenAI says existing checkout pages should work without a Wallet-specific integration. It asks them to allow verified ChatGPT cloud-browser requests through Web Bot Auth, to configure fraud systems to recognize legitimate agent purchases and the relevant `Forwarded` header signals, and to build MCP plugins for carts and checkout. If you own checkout or fraud rules, agent traffic is now a policy you have to write down: verify it, let it through, or block it, as Amazon does.

**The catch.** OpenAI's own announcement and help pages would not load for me, so these details come from TechCrunch and OpenAI's post on its developer forum. OpenAI says card rewards and protections still apply to eligible disputes, and neither source says who carries the loss when an agent buys the wrong thing. TechCrunch also notes that DoorDash and Uber have reported low numbers of agent-placed orders.

Sources: [TechCrunch, 13 Nov](https://techcrunch.com/2026/11/13/chatgpts-new-wallet-lets-ai-agents-shop-and-check-out-for-you/) · [OpenAI Developer Community, "Introducing ChatGPT Wallet"](https://community.openai.com/t/introducing-chatgpt-wallet/1416044)

## 2. Gemini can read your Google Wallet, but it cannot spend from it

**What happened.** On 13 Nov Google added Google Wallet to the apps that Personal Intelligence in Gemini can connect to, for Gemini app users in the US on the web, Android and iOS, rolling out from that day. You can also link bank and credit card accounts to Wallet through Plaid, then tag @Google Wallet to ask about cash flow, forgotten subscriptions, price rises or a holiday budget. Google's help page says you must be 18 or over, in the US, on a personal Google account, with Keep Activity switched on.

**Why it matters.** Google drew the same line Anthropic drew for Claude's Personal Finance beta on 5 Nov. Gemini "can only read information from your accounts; it can't move, manage, or invest your money," and the help page adds that it cannot make transactions with Wallet's payment methods. So on the same day, two of the largest assistants took opposite positions on paying. For consumer fintech, reading a transaction feed is turning into a free feature of the assistant, and the defensible part is the licensed one: moving the money.

**The catch.** Neither Google page says whether Wallet data is used to train models, how long it is kept, or what happens to it after you disconnect. The help page points to Gemini's Privacy Hub for that. Work and school accounts are excluded, and the rollout is gradual.

Sources: [Google, "Connect Google Wallet to Gemini for personal finance insights"](https://blog.google/innovation-and-ai/products/gemini-app/google-wallet-gemini-app/) · [Gemini Apps Help, Google Wallet with Gemini Apps](https://support.google.com/gemini/answer/18112192)

## 3. A key Cursor issued to Fireworks led to a backdoored Claude Code extension

**What happened.** On 13 Nov Cursor published what two weeks of investigation found about its 29 Oct incident. On that day tampered copies of the Claude Code extension, versions 2.1.312 and 2.1.313, were served from the cache behind Cursor's VS Code marketplace for about 11 hours, and they tried to install a persistent SSH backdoor. The way in was an access key Cursor had issued to Fireworks, which Fireworks exposed. With it the attacker copied a read-only storage bucket of coding agent traces, mostly from 2025 and from sessions outside Privacy Mode. Some traces held unredacted credentials. Those led into Cursor's SaaS tools and, on 29 Oct, to the credential used to plant the extension.

**Why it matters.** Up to 5,000 users may have received the tampered build. Cursor puts exposed traces at fewer than 0.05% of non-Privacy Mode users, and exposed API credentials at fewer than 0.01% of customers. The chain ran from a vendor's key to stored agent logs to the secrets inside them. An agent's trace holds whatever the agent touched, so redact secrets before traces are stored, and give each vendor its own scoped key with a short life and a revocation runbook. Fireworks is the same inference provider whose October breach exposed Notion AI chats in the [12 Nov edition](/digest/2026-11-12-stolen-ai-keys-spend-like-cash).

**The catch.** Cursor says the incident is contained, not closed, and that its app, its updates and its release signing keys were not affected. Anthropic did not publish the copy, and the Open VSX marketplace never carried it. Cursor's security notice warns that uninstalling the extension may not be enough, because the payload leaves persistence scripts behind, and it ships check and remediation scripts for macOS and Windows.

Sources: [Cursor, "An update on our recent security incident"](https://cursor.com/blog/security-incident-update) · [Cursor, security notice on the malicious extension](https://cursor.com/blog/claude-code-extension-security-notice)

## 4. Cloudflare's new spending caps pause Workers at a hard limit

**What happened.** Cloudflare put Spend Management into beta on 13 Nov for pay-as-you-go customers. You set a spending limit per product, starting with Workers and Durable Objects, and email alerts at thresholds you choose. When spend reaches the limit, Cloudflare enforces a blocking policy and pauses the product: new invocations are rejected and Cron Triggers and Queue consumers stop, while static assets keep serving. An audit log records who changed a limit and when a cap was hit.

**Why it matters.** A runaway agent loop on Workers now stops at a number you set rather than at the invoice. AI model spend is outside it: Cloudflare points to AI Gateway's per-user and per-model budgets, which cover only requests routed through a gateway. A team running agents there needs two caps, one for compute and one for model calls.

**The catch.** Enforcement trails measurement. Spend reaches the dashboard in under 10 minutes, caps then propagate asynchronously, and the changelog says plainly that "recorded spend can exceed a limit." Cloudflare's aim of closing the gap to under a minute is future work, so set each cap where the overrun is still affordable. Other products come later.

Sources: [Cloudflare, "Introducing Spend Management"](https://blog.cloudflare.com/spend-management/) · [Cloudflare changelog, 13 Nov](https://developers.cloudflare.com/changelog/post/2026-11-13-spend-management/)

## 5. The Fed's survey now ranks AI the top-cited risk to the financial system

**What happened.** The Federal Reserve's November 2026 Financial Stability Report, posted on 13 Nov, says AI was the top-cited risk in the New York Fed's survey of 23 market contacts in September and October, and that mentions of AI rose more than any other risk since the spring. It puts advanced-computing debt issuance at more than $680 billion by October 2026, about five times the $130 billion issued in all of 2023. The largest US bank holding companies have close to $1 trillion of exposure to large technology firms, data center developers, related financing vehicles and utilities.

**Why it matters.** The report links agents to bank security directly. It says advances in the ability of LLMs and agentic systems to detect and exploit vulnerabilities "have introduced new challenges in safeguarding system security for financial institutions, infrastructures, and third-party service providers," and that reports of agentic systems involved in cyber events have increased since the May report. If you sell AI features to banks, expect their vendor reviews to ask what your agents can touch, which keys they hold and how you would know.

**The catch.** A survey of 23 contacts measures worry, not losses, and the report sets no new rule. Its text gives no share of contacts who cited AI, so I use none. The $680 billion is issuance, and the Fed adds that the exposure of firms in the buildout may be substantially larger than their on-balance-sheet liabilities suggest.

Sources: [Federal Reserve, Financial Stability Report, November 2026 (PDF)](https://www.federalreserve.gov/publications/files/financial-stability-report-20261113.pdf) · [Federal Reserve, Financial Stability Report page](https://www.federalreserve.gov/publications/financial-stability-report.htm)

## New courses worth an evening

- **Agentic Payments: How AI Agents Move Money** · Maven · free. A 60-minute recorded lesson from 23 Sep by Zdenek Nemec, founder and CTO of Superface.ai, and Emmanuel Paraskakis, a three-time VP of Product who previously led Apiary, Swagger and Oracle's first cloud-native API gateway. It sorts agent payments into commerce, machine payments and treasury, walks through ACP, UCP, AP2, x402 and Visa and Mastercard payment identity, and ends with a way to prioritize a payments roadmap. Watch it before your first meeting about ChatGPT Wallet. [Maven](https://maven.com/p/df4c6b/agentic-payments-how-ai-agents-move-money)
- **Build and Train a GLM-5.3-Flash Model From Scratch with Python** · YouTube · free. A 44-minute freeCodeCamp course by @vukrosic, posted 14 Nov. It builds the model's parts in order: tokenization, linear and sparse attention, mixture-of-experts routing, image tokens, pre-training experiments and reward design for reinforcement learning. It is for the engineer on your team who wants to know what the model names on your bill are made of. [YouTube](https://youtu.be/-gfgQfw2g_E)

No Udemy pick again: the Udemy pages I tried either failed to load or loaded without a rating or an update date, and I do not list a course I cannot check. Every pick so far is on the [courses page](/courses).

## My read

Four of these five are one question: what can an agent do with money or a key before a person looks? ChatGPT's answer is a token and a fingerprint on every purchase, with limits promised later. Google's answer, like Anthropic's, is read-only. Cursor's breach is the case where nobody decided: a vendor's key opened stored agent logs, and the secrets in those logs did the rest. Cloudflare's caps are the dull fix done well, with a lag you have to budget for. Payments teams have run this playbook for years with new cardholders: tokenize the card, step up the risky purchase, cap the spend, log everything and make revocation fast. Agents need the same program, and the Fed's report shows that bank supervisors are now watching agents too.

Takeaway: before an agent can spend money or hold a key, give it a cap, scrubbed logs, a scoped key and a named person who approves what it buys.
