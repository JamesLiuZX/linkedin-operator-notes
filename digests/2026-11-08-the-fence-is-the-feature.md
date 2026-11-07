---
title: "The fence is the feature"
slug: 2026-11-08-the-fence-is-the-feature
date: 2026-11-08
status: published
summary: "Claude reads bank accounts but can't move money, GPT-6 Cyber ships invite-only, DeepMind's agents weakened legacy RSA, Gemini video got 30% cheaper and Microsoft put a coding agent on one GPU. Plus two free courses."
cover: /digests/2026-11-08-the-fence-is-the-feature/cover.png
carousel: /digests/2026-11-08-the-fence-is-the-feature/carousel.pdf
slides: 8
post: posts/dg-2026-11-08-the-fence-is-the-feature.md
window: 5 to 7 Nov 2026
---

# The fence is the feature

Covering 5 to 7 Nov 2026: five launches that change what a product team does this week, the limits each one shipped with, two free courses, and my read. Every number links to where it came from.

## 1. Claude can now read your bank accounts, and only read them

**What happened.** Anthropic launched Personal Finance in Claude on 5 Nov, a beta for Pro, Max and Ultra subscribers in the US. Users sign in to their banks through Plaid, so Claude never sees a password, and can link up to 16 US banks. Claude then reads balances, credit limits and up to 24 months of transactions, and answers questions about spending, upcoming bills and fees.

**Why it matters.** A general-purpose assistant now holds the same transaction feed a budgeting app does. For consumer fintech, insight layered on read access stops being a moat; what you are licensed to do with the money is. The design is also a template worth copying: read-only access, no investment advice, and no access from scheduled tasks, Cowork or Claude Code, so nothing unattended touches the accounts.

**The catch.** It is US only, in beta and rolling out gradually. Investment, loan and card accounts expose only balances and limits, balances can be a day or two old, and Anthropic's help page tells users to check important figures against the bank. Conversations in the Personal Finance hub are not used for training; chats elsewhere follow the user's privacy settings.

Sources: [Anthropic, "Introducing Personal Finance in Claude"](https://claude.com/blog/introducing-personal-finance-in-claude) · [Claude Help Center, "Use Personal Finance in Claude"](https://support.claude.com/en/articles/18185620-use-personal-finance-in-claude)

## 2. GPT-6 Cyber ships, but only to vetted defenders

**What happened.** OpenAI released GPT-6 Cyber on 5 Nov, a cyber-specialized GPT-6 Astra for authorized vulnerability discovery, exploit development and pentesting. It carries GPT-6 Astra's Preparedness ratings, including Critical for cybersecurity. Access runs through Daybreak Red: organizations need SSO, MFA and API IP allowlisting, and individuals need an invitation, identity and liveness checks, a legal attestation and a physical FIDO2 key. The API costs $20 per million input tokens and $100 per million output tokens, with a 1.05M-token context window.

**Why it matters.** This is the access model to copy for the strongest AI tools inside a regulated firm: verified identity, hardware keys and allowlisted networks before anyone reaches the capable model. If your security team wants GPT-6 Cyber, plan it as an identity and procurement project first and a model evaluation second.

**The catch.** Every benchmark is OpenAI's own. On ExploitGym it lands 48.45% of intended exploits against GPT-6 Astra's 42.43%, but the same system card scores it worse on blocker deception, 20.29% against 11.66%, where lower is better. Only approved Daybreak Red organizations can call it today.

Sources: [OpenAI, GPT-6 Cyber system card](https://deploymentsafety.openai.com/gpt-6-cyber) · [OpenAI API docs, GPT-6-Cyber](https://developers.openai.com/api/docs/models/gpt-6-cyber)

## 3. DeepMind's agents found two weaknesses in legacy 1024-bit RSA

**What happened.** Google DeepMind said on 6 Nov that AI agents, guided by human cryptanalysts, found two weaknesses in 1024-bit RSA. The first is a signature forgery that improves on the best known attack by about 1,600 times in theory, when the attacker controls a small part of the signed data such as a 32-byte fingerprint. The second cuts the average cost of factoring each additional 1024-bit key in a batch by about 30 times. Dj Dvijotham and Abhradeep Thakurta led the work with researchers from UC San Diego and Inria.

**Why it matters.** 1024-bit keys still turn up in embedded firmware, old VPN appliances, internal PKI and HSMs with keys locked in. In a payments or trading stack those are the boxes nobody owns. Run an inventory this week and give every 1024-bit key you find a retirement date.

**The catch.** The 1,600x figure is a theoretical estimate, not a demonstrated break, and RSA-2048 and larger keys are not affected. The figures here come from Interesting Engineering's report of the announcement, not from a DeepMind paper I could read.

Sources: [Google DeepMind on X, 6 Nov](https://x.com/GoogleDeepMind/status/2118755418675765656) · [Interesting Engineering, 6 Nov, for the 1,600x and 30x figures](https://interestingengineering.com/ai-robotics/google-deepmind-agents-expose-older-encryption-flaws)

## 4. Gemini Omni 1.2 Flash: 15-second video at $0.07 a second

**What happened.** Google released Gemini Omni 1.2 Flash on 5 Nov and made it generally available on Google Cloud on 6 Nov. Clips now run up to 15 seconds, up from 10. Output at 720p costs $0.07 per second, which Google puts 30% below Gemini Omni 1.1 Flash, with similar cuts at other resolutions. Drafts render at 360p or 720p and upscale to 1080p or 4K.

**Why it matters.** At list price one 15-second 720p ad variant costs $1.05 to generate. Generation stops being the budget line that limits a creative test; human review and the media spend behind the winners are what is left.

**The catch.** These are Google's list prices, and the 1080p and 4K rates live on the pricing page, not in the announcement. Every output carries an invisible SynthID watermark, and audio references are gated behind allowlisting.

Sources: [Google Cloud blog, 6 Nov](https://cloud.google.com/blog/products/ai-machine-learning/gemini-omni-1-2-flash-generally-available) · [RuntimeWire, 5 Nov, for the release date](https://runtimewire.com/article/google-gemini-omni-1-2-flash-15-second-clips)

## 5. Microsoft put a coding agent on one GPU

**What happened.** Microsoft showed on 5 Nov how Foundry Local serves Qwen3.8-27B to GitHub Copilot through bring-your-own-key. The 4-bit model is about 18 GB and needs an NVIDIA GPU with at least 24 GB of memory, which allows a 64K-token context; 32 GB or more allows up to 262K. Qwen's published scores are 73.0 on Terminal Bench 2.1 and 61.7 on SWE-bench Pro.

**Why it matters.** Teams whose code cannot leave the building get agentic coding without a cloud exception. Microsoft itself suggests a hybrid setup: local for routine changes, a cloud model when the reasoning gets hard.

**The catch.** Microsoft's line is that code and context never leave the machine. Check what the Copilot client still sends before you repeat that to compliance. Macs and AMD GPUs are planned, not supported, and the benchmark figures are Qwen's own.

Source: [Microsoft Foundry blog, "Bring Agentic Coding On-Device with Foundry Local"](https://devblogs.microsoft.com/foundry/foundry-local-agentic-coding-qwen3-8-27b/)

## New courses worth an evening

- **MCP Security Fundamentals** · YouTube · free. A freeCodeCamp course of about two hours, posted 29 Oct, on how agents get exploited and how to break Simon Willison's lethal trifecta with architectural boundaries instead of prompt filters. [YouTube](https://www.youtube.com/watch?v=gYXLRMycVMk)
- **Learn Vector Databases for Beginners** · YouTube · free. A 1.5-hour freeCodeCamp course posted 3 Nov: embeddings, cosine similarity, HNSW and IVF indexes, then a semantic search build in ChromaDB. [YouTube](https://youtu.be/lR931Iz8Z6U)

Every pick so far lives on the [courses page](/courses).

## My read

Three of these launches are defined by what the AI cannot do. Claude reads two years of transactions and cannot move money, and it stays out of scheduled tasks and Claude Code. GPT-6 Cyber sits behind SSO, IP allowlists and FIDO2 keys. Foundry Local keeps the code on the laptop. DeepMind's result is the same lesson from the other side: a fence built for 1024-bit RSA is lower than the people relying on it assume. In a regulated product, the permission model is the decision that survives the next model swap.

Takeaway: write down what your AI feature may read, what it may do and where it runs, then pick the model that fits inside those lines.
