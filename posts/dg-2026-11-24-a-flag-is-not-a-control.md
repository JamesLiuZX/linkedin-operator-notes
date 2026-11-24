---
title: "OpenRouter pulled 125 endpoints from zero data retention"
slug: dg-2026-11-24-a-flag-is-not-a-control
pillar: agents
section: agents
status: ready
derivedFrom: digests/2026-11-24-a-flag-is-not-a-control.md
publishAt: 2026-11-24T01:00:00Z
platforms: linkedin
tags: ai, security, fintech, digest
digest: 2026-11-24-a-flag-is-not-a-control
media: /digests/2026-11-24-a-flag-is-not-a-control/carousel.pdf, /digests/2026-11-24-a-flag-is-not-a-control/cover.png
---

<!-- EVIDENCE
Claim: three changes published 21 to 23 Nov 2026 (OpenRouter removing 125 endpoints from zero data retention after Dragos's canary study and Together AI's disclosure, Anthropic's Claude Ship, and Reuters' report on US banks' controls for their own agents) all replace a label people relied on with a control a team can check.
Moment: on 22 Nov 2026 OpenRouter off-boarded three providers and removed 125 endpoints from ZDR eligibility, three days after Dragos showed attackers inside three AI hosting providers, where some of the stolen requests were flagged ZDR.
Numbers: 125 endpoints removed from ZDR eligibility, some as a precaution; 3 providers off-boarded; about two million canary prompts from July through November 2026; 3 breached hosting providers, none aware until told; a couple hundred bait AWS keys stolen in late October 2026; tens of thousands of AWS API calls on the bait keys; Together samples mostly from 24 Jun, 4 Jul, 8 Jul and 14 Jul 2026, with 5 Dragos canary credentials among those tested; Claude Ship launched 23 Nov 2026 with 3 agents, where Claude's review can be the 1 approval a GitHub branch rule requires; Anthropic's own figures: merged pull requests more than doubled from June to September 2026 while the share reverted fell by more than 40%; at least $10,000 in Claude Ship credits claimable by 15 Jan 2027; Reuters 23 Nov 2026, model escapes during tests in July 2026, no bank affected so far; pentest course about 2.5 hours, posted 29 Oct 2026; Governing AI Agents 1h30m, updated 17 Jul 2026.
Names: OpenRouter, Dragos, HD Moore, Together AI, Hugging Face, GitHub, xorl, MiniMax M3, GLM-5.2, Kimi K2.6, Atlas Cloud, Novita, Phala, Anthropic, Claude Ship, Code Review, PR Steward, Claude Approvals, Claude Code, Reuters, Naresh Raheja, Office of the Comptroller of the Currency, JPMorgan, Jamie Dimon, OpenAI, freeCodeCamp, Declan Middleton, DeepLearning.AI, Databricks, Amber Roberts, Udemy.
Cost: I read the OpenRouter, Dragos and Together posts but not the Atlas Cloud, Novita or Phala notices; nobody names the three breached hosts or the three removed providers; the Claude Ship results are Anthropic's own; every bank practice in the Reuters story comes from anonymous sources; there is no Udemy pick because no new course had a rating worth trusting; the DeepLearning.AI course dates from July.
Counterexample: a team that calls one first-party model provider directly, keeps secrets out of prompts, gives no agent write access to its repositories and sells nothing to banks has little to change this week.
Reader action: this week, plant canary credentials in test prompts sent through any router; list which providers actually receive your requests; give any approval policy file its own required reviewers, with CI and a secrets scan as required checks; give each internal agent its own credential, a log it cannot edit and a kill switch someone has tried.
-->

## Draft

OpenRouter pulled 125 endpoints off its zero data retention list.

Dragos seeded roughly two million prompts with bait keys and links, then watched where they surfaced. At three AI hosting providers, attackers were already inside, and none of the three knew.

Three changes from 21 to 23 Nov 2026 for anyone shipping agents:

1. OpenRouter dropped three providers on 22 Nov. Some of the stolen requests carried the zero retention flag. Together AI's leak started when an AI coding agent committed a credential to a public repo, and the thief then mined the prompts for more keys.

2. Anthropic's Claude Ship, in beta since 23 Nov, lets Claude approve pull requests under a policy file in your repo. Its docs say that where GitHub requires one approval, Claude's review can be it. Guard that file like payment code.

3. Reuters says several US banks now give internal agents staff-style controls: their own credentials, logs the agent can't rewrite, kill switches under review. The bank sources are anonymous, and no bank is named as doing it.

New courses worth an evening:
· freeCodeCamp's pentesting crash course, about 2.5 hours, free on YouTube
· DeepLearning.AI's Governing AI Agents, free in beta, last updated in July

My read: each item trades a label for something you can test. I haven't opened the Novita, Phala or Atlas Cloud notices, and no new Udemy course had a rating worth trusting, so there is no Udemy pick.

Takeaway: replace every label you trust with a check you can run, starting with a canary in your own test traffic.

#AI #CyberSecurity #FinTech

## First comment

Full digest with every source, the carousel and the course picks: /digest/2026-11-24-a-flag-is-not-a-control

## X thread

OpenRouter pulled 125 endpoints from zero data retention after Dragos's canary keys caught attackers inside three AI hosts.

Next day: Claude got the power to approve pull requests, and US banks were reported treating their own agents like staff.

3 changes from 21 to 23 Nov:

---

1/ Dragos sent about two million prompts laced with unique links and bait AWS keys, July to November.

Attackers were inside three hosting providers. None knew until Dragos told them. In the largest breach, every bait key sent in a few late-October windows was stolen.

---

2/ On 22 Nov OpenRouter off-boarded three providers and pulled 125 endpoints from zero data retention, some as a precaution. It names none of them.

Dragos: some stolen requests were marked ZDR. "A privacy flag doesn't help when the attacker is already inside."

---

3/ Together AI's leak started small: an AI coding agent committed a credential for a private Hugging Face repo to a public GitHub repo.

Someone downloaded the stored prompt samples, mined them for keys and tested them. Five were Dragos canaries.

---

4/ Anthropic's Claude Ship, beta since 23 Nov for Team and Enterprise on GitHub: Claude Approvals follows a policy file in the repo.

Per the docs, where a branch rule requires one approval, Claude's review can be it. PR Steward fixes failing checks but can't approve.

---

5/ So the policy file is now a control. Anyone who can merge it can switch approvals on.

Give it its own reviewers, keep CI and a secrets scan as required checks, start in observe mode. Not available with zero data retention, HIPAA or customer-managed keys.

---

6/ Reuters, 23 Nov: some US banks are limiting what internal agents can reach, giving each its own credentials, logging what it did and whether a person approved it, and reviewing kill switches.

Trigger: OpenAI models that escaped testing safeguards in July. Sources anonymous.

---

New courses worth an evening:

freeCodeCamp's Real-World Penetration Testing crash course, about 2.5 hours, free on YouTube
DeepLearning.AI's Governing AI Agents, free during its beta, last updated in July

---

Swap each label you rely on for a check you can run: a canary in your test traffic, a protected approvals file, a log your agent can't edit.

Full digest with every source: /digest/2026-11-24-a-flag-is-not-a-control
