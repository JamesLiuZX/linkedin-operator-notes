---
title: "ChatGPT's agents got a wallet on 13 Nov. Limits come later"
slug: dg-2026-11-16-your-thumb-is-the-spending-limit
pillar: agents
section: agents
status: ready
derivedFrom: digests/2026-11-16-your-thumb-is-the-spending-limit.md
publishAt: 2026-11-16T01:00:00Z
platforms: linkedin
tags: ai, payments, fintech, digest
digest: 2026-11-16-your-thumb-is-the-spending-limit
media: /digests/2026-11-16-your-thumb-is-the-spending-limit/carousel.pdf, /digests/2026-11-16-your-thumb-is-the-spending-limit/cover.png
---

<!-- EVIDENCE
Claim: on 13 Nov 2026 ChatGPT Wallet let agents pay with a card token and a per-purchase biometric check but no spending limit, while Gemini's Google Wallet link stayed read-only, so a team building agents near money should copy the controls of a card program (token, step-up check, cap, logs, fast revocation) before an agent spends.
Moment: on 13 Nov 2026 OpenAI launched ChatGPT Wallet and Google connected Gemini to Google Wallet on the same day, and Cursor's same-day incident update traced a backdoored extension to a vendor key and to credentials left in stored agent traces.
Numbers: ChatGPT Wallet for a limited number of US Pro subscribers aged 18 or over with US-issued cards; up to 5,000 Cursor users may have received the tampered build, live about 11 hours on 29 Oct 2026; fewer than 0.05% of non-Privacy Mode users had traces exposed and fewer than 0.01% of customers had API credentials exposed; Cloudflare spend reaches the dashboard in under 10 minutes; the Fed surveyed 23 market contacts in Sep and Oct 2026 and AI was the top-cited risk; advanced-computing debt issuance above $680 billion by Oct 2026 against $130 billion in all of 2023; close to $1 trillion of exposure at the largest US bank holding companies.
Names: OpenAI, ChatGPT Wallet, dots, American Express, Mastercard, Visa, Web Bot Auth, TechCrunch, Amazon, Google, Gemini, Google Wallet, Plaid, Anthropic, Claude Personal Finance, Cursor, Fireworks, Claude Code, Open VSX, Cloudflare, Spend Management, Workers, Durable Objects, AI Gateway, Federal Reserve, New York Fed, Maven, Superface.ai, freeCodeCamp, GLM-5.3-Flash.
Cost: OpenAI's own Wallet pages would not load, so those details rest on TechCrunch and OpenAI's developer forum post; nobody has said who carries the loss when an agent buys the wrong thing; the Fed's text gives no percentage, so the share quoted in some write-ups is left out; the Maven lesson is from 23 Sep, not this week; and no Udemy course could be verified for the fourth edition running.
Counterexample: a team whose agents never touch payment credentials or customer secrets, and whose model spend already runs through a capped gateway, has little to change this week.
Reader action: this week, write down what each agent may buy, read or call without a person approving, put hard caps on both compute and model spend, and check that agent traces redact secrets before they are stored.
-->

## Draft

ChatGPT's agents got a wallet on 13 Nov. Limits come later.

For now the agent pays with a token instead of your card number, and you approve each purchase with Face ID or a fingerprint. That check is the only spending control. Five things from 13 Nov that matter if you build near money:

1. ChatGPT Wallet is rolling out to some US Pro subscribers, with Amex, Mastercard and Visa. OpenAI tells merchants their checkout should already work, and asks fraud teams to recognize verified agent traffic instead of blocking it.

2. Google connected Gemini to Google Wallet for US users, with banks and cards linked through Plaid. It reads spending and cannot move a cent, the same fence Claude drew on 5 Nov.

3. Cursor traced its backdoored Claude Code extension to an access key it had issued to Fireworks. The key opened stored agent traces, and credentials left inside them did the rest. Up to 5,000 users may have pulled the tampered build.

4. Cloudflare's Spend Management beta stops Workers and Durable Objects at a hard limit. Spend takes up to 10 minutes to register, so leave room for the overrun. Model calls need a separate AI Gateway budget.

5. The Fed's November stability report says AI topped the risks named by 23 market contacts, and advanced-computing debt issuance passed $680 billion by October.

New courses worth an evening:
· Agentic Payments: How AI Agents Move Money, a free 60-minute Maven lesson covering ACP, AP2 and x402
· Build a GLM-5.3-Flash model from scratch, free on freeCodeCamp, 44 minutes

My read: give an agent a card the way a bank onboards a new cardholder. Token, step-up check, cap, logs, fast revocation. ChatGPT shipped the token and the check, and the cap is still a plan. OpenAI's own Wallet page would not load for me, so those details rest on TechCrunch.

Takeaway: before an agent spends money or holds a key, give it a cap, scrubbed logs, a scoped key and a named approver.

#AI #FinTech #Payments

## First comment

Full digest with every source, the carousel and the course picks: /digest/2026-11-16-your-thumb-is-the-spending-limit

## X thread

ChatGPT's agents can now pay at checkout. They use a card token, never the card number, and every purchase waits for Face ID or a fingerprint.

Spending limits aren't built yet.

5 AI changes from 13 Nov that move a builder's week:

---

1/ ChatGPT Wallet: a limited US rollout to Pro subscribers aged 18+ with US cards, built with Amex, Mastercard and Visa.

OpenAI says existing checkouts should work, and asks merchants to verify its cloud browser with Web Bot Auth and tune fraud rules for agent purchases.

---

2/ Gemini can now read Google Wallet for US users, plus bank and card accounts linked through Plaid.

Google says it "can't move, manage, or invest your money." Claude's finance beta drew the same line on 5 Nov. One assistant pays, two read.

---

3/ Cursor traced its backdoored Claude Code extension to an access key it had issued to Fireworks.

The key opened stored coding-agent traces. Credentials inside them led to the attack. Up to 5,000 users may have received the tampered build.

---

4/ The lesson from Cursor: an agent's logs hold whatever the agent touched.

Redact secrets before traces are stored, and give each vendor its own scoped key that you can revoke in minutes.

---

5/ Cloudflare Spend Management (beta) pauses Workers and Durable Objects at a hard limit.

Spend reaches the dashboard within 10 minutes and the cap acts after that, so budget for the overrun. AI model calls need AI Gateway budgets.

---

6/ The Fed's November Financial Stability Report: AI was the top-cited risk among 23 market contacts. Advanced-computing debt issuance passed $680B by October.

It also says reports of agentic systems in cyber events have risen since May.

---

New courses worth an evening, both free:

Agentic Payments: How AI Agents Move Money, a 60-minute Maven lesson on ACP, AP2 and x402
Build and Train a GLM-5.3-Flash Model From Scratch, 44 minutes on freeCodeCamp

---

Give an agent a card the way a bank onboards a new cardholder: token, step-up check, cap, logs, fast revocation.

Full digest with every source: /digest/2026-11-16-your-thumb-is-the-spending-limit
