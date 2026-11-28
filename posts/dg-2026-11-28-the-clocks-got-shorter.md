---
title: "Every AI-agent attack Switzerland confirmed got in. Patch in 24 hours"
slug: dg-2026-11-28-the-clocks-got-shorter
pillar: agents
section: agents
status: ready
derivedFrom: digests/2026-11-28-the-clocks-got-shorter.md
publishAt: 2026-11-28T01:00:00Z
platforms: linkedin
tags: ai, cybersecurity, fintech, digest
digest: 2026-11-28-the-clocks-got-shorter
media: /digests/2026-11-28-the-clocks-got-shorter/carousel.pdf, /digests/2026-11-28-the-clocks-got-shorter/cover.png
---

<!-- EVIDENCE
Claim: four changes published or landing between 24 and 30 Nov 2026 (the Swiss NCSC's first confirmed AI-agent attacks, Microsoft's ARTEX report, Google's new rules for AI agents in Workspace, and OpenAI's 30 Nov cut-offs) each shorten a clock a product team runs on, and most teams still run those clocks at human speed.
Moment: on 24 Nov 2026 the Swiss NCSC said that in all cyberattacks known to it, the use of AI agents led to the successful compromise of the victim's IT systems, and asked for critical patches on internet-facing systems no later than 24 hours after release.
Numbers: NCSC statement published 24 Nov 2026; organisations in at least 2 sectors affected; publicly accessible attack agents almost doubled since October 2026; critical patches no later than 24 hours after release; Microsoft's ARTEX post published 25 Nov 2026; 6 named threat actors using ARTEX as of November 2026; one Storm-0940 campaign with more than 151,000 failed sign-ins, peaking at 2,900 failures per minute; ARTEX published as open source in July 2026; Google's announcement dated 24 Nov 2026 by the CSA and others; agents must use Workspace MCP servers or the CLI from 1 Feb 2027, 65 days after 28 Nov 2026; billing above a free daily allowance from 1 Apr 2027 per three write-ups; OpenAI cut-offs on 30 Nov, 1 Dec, 11 Dec and 15 Dec 2026, 4 dates, with notices dated between 7 May and 11 Jun 2026; OWASP API Security Top 10 course 1.5 hours, posted 30 Aug 2023; Learn How To Secure API Servers 1 hour, posted 19 Sep 2024; 16 Udemy pages tried, 7 failed, 2 with a rating.
Names: Swiss NCSC, ARTEX, CyberStrikeAI, ThreatBook, Microsoft Threat Intelligence, Storm-0940, Storm-3358, Onyx Sleet, Pearl Sleet, Crystal Typhoon, Salt Typhoon, Microsoft Defender, Sentinel, Entra, Conditional Access, Google Workspace, Workspace MCP servers, Workspace CLI, Workspace AI Tools Addendum, Google Auth Platform, Gmail, Drive, Calendar, Cloud Security Alliance, Flavio Copes, Paul Lovelace, Help Net Security, OpenAI, Agent Builder, Evals, Promptfoo, Agents SDK, ChatKit, gpt-5, o3, gpt-6.1-sol, freeCodeCamp, Corey Ball, Anthony Aragues, APIsec Labs, OWASP, Udemy, Reuters.
Cost: I could not read Google's addendum or its agent policy page, so the Google dates rest on the CSA's briefing and on write-ups that are not Google; I read a little under half of Microsoft's post word for word and the rest only in summary; I read the NCSC's page, not the Reuters story; three of the four items predate this edition's 26 to 27 Nov window and the last edition missed them; the OpenAI item is six months old and is here because it lands on Monday; both course picks are older courses and there is no Udemy pick for the third edition running.
Counterexample: a team with no internet-facing systems of its own, no agent touching Google Workspace and nothing built on OpenAI's prompt objects, Agent Builder, Evals, gpt-5 or o3 has none of these clocks running this week.
Reader action: this week, measure how long your last critical patch on an internet-facing system took and set a 24-hour rule; add rate limits and a WAF in prevention mode in front of exposed apps; list every place an LLM reads Gmail, Drive or Calendar over the REST APIs and mark agent OAuth clients as agents; move OpenAI prompts and evals out of the dashboard before 30 Nov and pick replacements for gpt-5 and o3 before 11 Dec.
-->

## Draft

Every AI-agent attack Switzerland confirmed got in. Patch in 24 hours.

On 24 Nov the Swiss NCSC reported its first attacks run with AI agents, hitting organisations and critical infrastructure in at least two sectors. All the ones it knows of succeeded.

Four clocks, 24 to 30 Nov 2026:

1. The agents came in through guessable passwords and known holes in exposed systems. The NCSC's answer is the old checklist, faster: critical patches on internet-facing systems within 24 hours of release, plus MFA or passkeys on webmail and VPN.

2. Microsoft says ARTEX, an open-source AI pentest platform, gets from recon to privileged access in minutes. Six groups now use it, Salt Typhoon among them. One campaign peaked at 2,900 failed sign-ins a minute. Rate limits and decoys help.

3. Google is moving AI agents onto their own door into Gmail and Drive: its Workspace MCP servers or CLI, not the REST APIs, from 1 Feb 2027. Agent OAuth clients get their own flag.

4. On Monday 30 Nov, OpenAI shuts down prompt objects and Agent Builder and turns Evals read-only. gpt-5 and o3 follow on 11 Dec.

New courses worth an evening, both older but on target:
· freeCodeCamp's OWASP API Security Top 10 with Corey Ball, free on YouTube
· freeCodeCamp's Learn How To Secure API Servers, rate limiting included

My read: every clock got shorter, and most patch cycles still run monthly. I could not read Google's new terms myself, and no Udemy course I could load had both a 4.4 rating and a recent update.

Takeaway: this week, set a 24-hour rule for critical patches on exposed systems, flag your agents' OAuth clients, and move OpenAI prompts into code before Monday.

#AI #CyberSecurity #FinTech

## First comment

Full digest with every source, the carousel and the course picks: /digest/2026-11-28-the-clocks-got-shorter

## X thread

Swiss officials say every AI-agent attack they know of got in. Their advice: install critical patches on internet-facing systems within 24 hours.

Same week: Microsoft named 6 groups on one open-source attack agent, Google set 1 Feb for agents, OpenAI cuts off prompts Monday.

---

1/ Swiss NCSC, 24 Nov: its first confirmed attacks run with AI agents hit organisations and critical infrastructure in at least two sectors. All succeeded.

They used guessable passwords and known holes. Public attack agents like ARTEX have almost doubled since October.

---

2/ Its fix is the old checklist on a shorter clock: critical patches on internet-facing systems within 24 hours of release, MFA or passkeys on webmail and VPN, least privilege, regular pen tests.

---

3/ Microsoft, 25 Nov: ARTEX, an open-source AI pentest platform, goes from recon to privileged access "in a matter of minutes".

Storm-0940, Storm-3358, Onyx Sleet, Pearl Sleet, Crystal Typhoon and Salt Typhoon now use it.

---

4/ One Storm-0940 campaign: 151,000+ failed sign-ins, peaking at 2,900 a minute.

Microsoft's advice: rate limits, a WAF in prevention mode, Conditional Access for every workload identity, secrets out of code. In its tests, decoys cut attack traffic to real assets.

---

5/ Google, 24 Nov, per the CSA and others (its own pages block bots): from 1 Feb 2027, AI agents reach Workspace data through Google's MCP servers or CLI, not the REST APIs.

Agent OAuth clients must be marked "AI-powered agent".

---

6/ OpenAI: on Monday 30 Nov, prompt objects and Agent Builder shut down and Evals goes read-only. Image models go 1 Dec, gpt-5 and o3 on 11 Dec, new fine-tuning jobs on 15 Dec.

The notices came in May and June.

---

Two older free courses on the bugs attack agents hunt:

freeCodeCamp's OWASP API Security Top 10 with Corey Ball, 1.5 hours, from 2023
freeCodeCamp's Learn How To Secure API Servers, 1 hour, from 2024

---

Every clock got shorter: minutes to break in, 24 hours to patch, 1 Feb for agents, Monday for OpenAI.

Full digest with every source: /digest/2026-11-28-the-clocks-got-shorter
