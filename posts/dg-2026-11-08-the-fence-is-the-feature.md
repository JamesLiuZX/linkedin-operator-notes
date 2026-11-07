---
title: "Claude can now read 24 months of your bank transactions"
slug: dg-2026-11-08-the-fence-is-the-feature
pillar: agents
section: agents
status: ready
derivedFrom: digests/2026-11-08-the-fence-is-the-feature.md
publishAt: 2026-11-08T01:00:00Z
platforms: linkedin
tags: ai, fintech, security, digest
digest: 2026-11-08-the-fence-is-the-feature
media: /digests/2026-11-08-the-fence-is-the-feature/carousel.pdf, /digests/2026-11-08-the-fence-is-the-feature/cover.png
---

<!-- EVIDENCE
Claim: this week's most useful AI launches are defined by their limits, so a regulated product team should write the permission model before it picks a model.
Moment: on 5 Nov 2026 Anthropic shipped read-only bank access in Claude and OpenAI shipped GPT-6 Cyber behind identity checks and FIDO2 keys; on 6 Nov DeepMind showed legacy 1024-bit RSA is weaker than assumed.
Numbers: Claude reads up to 24 months of transactions across up to 16 US banks; GPT-6 Cyber costs $20 and $100 per million input and output tokens, ExploitGym 48.45% vs 42.43%, blocker deception 20.29% vs 11.66%; DeepMind batch factoring about 30x cheaper per extra 1024-bit key, forgery about 1,600x in theory; Gemini Omni 1.2 Flash $0.07 per second at 720p, 30% below 1.1, up to 15 seconds, $1.05 per 15-second clip (computed); Foundry Local needs a 24 GB GPU for an 18 GB 4-bit Qwen3.8-27B.
Names: Anthropic, Claude, Plaid, OpenAI, GPT-6 Cyber, Daybreak Red, Google DeepMind, Gemini Omni 1.2 Flash, Microsoft Foundry Local, Qwen3.8-27B, GitHub Copilot, freeCodeCamp.
Cost: every benchmark here is the vendor's own, DeepMind's figures come via press coverage rather than a paper I read, GPT-6 Cyber is closed to most teams, and no Udemy course could be verified for this edition.
Counterexample: a product that never touches money, credentials or private code gains little from a written permission model; there the price and quality of the model still decide.
Reader action: for the next AI feature, write one page that says what the model may read, what it may do and where it runs, and get it signed before choosing the model.
-->

## Draft

Claude can now read 24 months of your bank transactions.

It cannot move a cent. Anthropic shipped that on 5 Nov 2026, and the limit is the interesting part. Five launches from 5 to 7 Nov worth a builder's attention:

1. Claude Personal Finance, a US beta for Pro, Max and Ultra. Up to 16 banks connect through Plaid. Read-only, and switched off inside scheduled tasks and Claude Code.

2. OpenAI GPT-6 Cyber is rated Critical for cybersecurity and open only to approved Daybreak Red orgs. Individuals need a physical FIDO2 key. Output runs $100 per million tokens.

3. Google DeepMind put agents next to cryptanalysts and made batch factoring of legacy 1024-bit RSA keys about 30x cheaper per key. RSA-2048 is fine. Your forgotten VPN box may not be.

4. Gemini Omni 1.2 Flash went GA at $0.07 per second of 720p, 30% under the last version. One 15-second clip lists at $1.05.

5. Microsoft Foundry Local runs Qwen3.8-27B behind GitHub Copilot on a single 24 GB GPU. Microsoft says the code stays on the machine.

New courses worth an evening:
· MCP Security Fundamentals, free on freeCodeCamp's YouTube, about 2 hours
· Learn Vector Databases for Beginners, free, 1.5 hours

My read: three of these five are defined by what the AI is not allowed to do. That permission model is the part of an AI feature that survives the next model swap. The benchmark numbers above are the vendors' own, so treat them as claims.

Takeaway: before you choose a model for a regulated product, write down what it may read, what it may do and where it runs.

#AI #FinTech #CyberSecurity

## First comment

Full digest with every source, the carousel and the course picks: /digest/2026-11-08-the-fence-is-the-feature

## X thread

Claude can now read 24 months of your bank transactions. It can't move a cent.

The week's AI launches were defined by their limits: read-only, invite-only, on-device.

5 launches from 5 to 7 Nov, and what each changes for builders:

---

1/ Claude Personal Finance: a US beta for Pro, Max and Ultra. Up to 16 banks via Plaid, 24 months of transactions, read-only.

It is switched off in scheduled tasks and Claude Code. Worth copying: let the agent read, keep money movement with a human.

---

2/ OpenAI GPT-6 Cyber: rated Critical for cybersecurity, open only to approved Daybreak Red orgs. SSO, MFA, IP allowlists, and a FIDO2 key for individuals.

$100 per million output tokens. Its own system card shows more blocker deception than GPT-6 Astra: 20.29% vs 11.66%.

---

3/ Google DeepMind: agents guided by cryptanalysts found two weaknesses in legacy 1024-bit RSA. Batch factoring gets about 30x cheaper per extra key; forgery improves about 1,600x in theory.

RSA-2048 is untouched. Go find your 1024-bit keys.

---

4/ Gemini Omni 1.2 Flash is GA: clips up to 15 seconds (was 10) at $0.07 per second of 720p, 30% below Omni 1.1 Flash.

One 15-second ad variant lists at $1.05. Generation is no longer the line item that limits a test. Review is.

---

5/ Microsoft Foundry Local runs a 4-bit Qwen3.8-27B (about 18 GB) behind GitHub Copilot on a 24 GB NVIDIA GPU.

Microsoft says code and context never leave the machine. Check what the Copilot client sends before you promise that to compliance.

---

New courses worth an evening, both free on freeCodeCamp's YouTube:

MCP Security Fundamentals, about 2 hours
Learn Vector Databases for Beginners, 1.5 hours

Full digest with every source: /digest/2026-11-08-the-fence-is-the-feature
