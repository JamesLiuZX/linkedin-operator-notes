---
title: "AI agents found and exploited a zero-day in about 11 minutes"
slug: dg-2026-11-22-before-the-agent-runs
pillar: agents
section: agents
status: ready
derivedFrom: digests/2026-11-22-before-the-agent-runs.md
publishAt: 2026-11-22T01:00:00Z
platforms: linkedin
tags: ai, security, fintech, digest
digest: 2026-11-22-before-the-agent-runs
media: /digests/2026-11-22-before-the-agent-runs/carousel.pdf, /digests/2026-11-22-before-the-agent-runs/cover.png
---

<!-- EVIDENCE
Claim: five changes published on 20 Nov 2026 (Amazon's Cairn report, Claude computer use for Team and Enterprise, Signal's screen block, the House report on Chinese models in US products, METR's results on AI judges) point to the same discipline: settle what an agent may touch, who checks its work and where its model came from before it runs.
Moment: on 20 Nov 2026 Amazon published that a suspected China-nexus operator's Cairn agents went from mapping an API to writing arbitrary files on a university server in about 11 minutes, the same day Anthropic opened computer use to Team and Enterprise plans with "no sandbox between Claude and a user's applications."
Numbers: about 11 minutes from API mapping to arbitrary file writes; a campaign of about 48 hours from 8 Sep 2026, found on 10 Sep 2026; 16 hours and 148 actions against Redis and more than 30,000 credential combinations over more than 6 hours, both failed; fix dated 18 Nov 2026 by BleepingComputer; computer use off by default, macOS 14 or later, changes take about an hour to reach every computer; Signal's Block Siri AI setting on iOS 27; DoorDash 25 Chinese model families at $5,000 or more each to run, up to six months to swap an embedded model; Airbnb about 80,000 conversations and 250,000 support cases a day on Qwen; METR: the best AI judge about 0.2 out of 1 above the human scorer, 50% time horizons of 40 hours for GPT-6 Astra (95% interval 13 to 2,645) and 39 hours for Opus 5.5, doubling roughly every 3.61 months (about 110 days).
Names: Amazon Threat Intelligence, CJ Moses, Cairn, MONAI Label, BleepingComputer, Anthropic, Claude, Signal, Engadget, Siri AI, Gemini Intelligence, Microsoft Recall, Meta Muse, Reuters, House Homeland Security Committee, House Select Committee on China, TNW, Anysphere, Cursor, Composer 2, Moonshot AI, Kimi K2.5, Airbnb, Alibaba Qwen, DoorDash, DeepSeek, METR, Opus 5.5, GPT-6 Astra, Stanford CS 329Z, Diyi Yang, Michael Ryan, John Yang, CMU 11-768, Graham Neubig, Udemy.
Cost: I could not open Signal's own post, the House report or CNBC's story, so items 3 and 4 rest on Engadget and TNW; Amazon's attribution is only moderate confidence and its post also sells AWS defenses; METR's intervals are wide and I did not read its later appendices; no Udemy page loaded, so there is no Udemy pick again; the CMU lecture is from 16 Oct and from a course this digest already picked.
Counterexample: a team whose agents only call scoped APIs, never see a screen, run on a model with a documented origin and are graded by people has little to change this week.
Reader action: this week, write one page per agent listing the apps and data it may reach, who reviews its output and how, and the base model under it including any fine-tune; write the computer-use allow list before switching it on; decide which of your app's screens block OS assistants.
-->

## Draft

AI agents found and exploited a zero-day in about 11 minutes.

Amazon says a suspected China-nexus operator aimed Cairn, an open-source AI pentest tool, at East Asian universities in September. Going from a first API map to arbitrary file writes took the agents about 11 minutes. Amazon says they found the hole on their own.

Five things from 20 Nov 2026 for anyone shipping agents:

1. Amazon spotted the campaign on 10 Sep, when it found the attackers' own Cairn server online with no login. Its advice is automated response on high-confidence alerts, with people judging outcomes.

2. Claude computer use is now in beta for Team and Enterprise plans, switched off until an Owner turns it on. Anthropic's guide warns there is no sandbox between Claude and your apps, so write the allow list first.

3. Signal switched on screenshot blocking for iOS 27 to keep Siri AI out of chats, and stops AI screen capture on Android. A Mac gets no protection, and your block can't help if the other person has switched theirs off.

4. A House report says DoorDash runs 25 Chinese model families, and replacing an embedded one could take up to six months. Cursor is exploring a move away from Chinese open-weight models.

5. METR's best AI judge marked GPT-6 Astra's work about 0.2 out of 1 higher than a human grader did. Not one eval task written by agents made the cut.

New courses worth an evening:
· Stanford's CS 329Z, Engineering AI Agents, 9 free lecture videos so far
· Graham Neubig's Agentic Safety lecture for CMU, free on YouTube

My read: together these ask three questions to settle before an agent runs. What can it touch, who checks it, where did its model come from. I haven't read Signal's post or the House report myself, because neither page loaded, so items 3 and 4 rest on Engadget and TNW.

Takeaway: before any agent runs, put three things in writing: what it may touch, who checks its work, and where its model came from.

#AI #CyberSecurity #FinTech

## First comment

Full digest with every source, the carousel and the course picks: /digest/2026-11-22-before-the-agent-runs

## X thread

AI agents found and exploited a zero-day on their own in about 11 minutes, Amazon says.

Same day: Claude got screen control at work, Signal locked AI out of its screen, and Congress asked where your models come from.

5 changes from 20 Nov for anyone building agents:

---

1/ A suspected China-nexus operator ran Cairn, an open-source AI pentest framework, against East Asian universities from 8 Sep.

The agents went from mapping an API to arbitrary file writes in about 11 minutes. Another run adapted for 16 hours and 148 actions, and failed.

---

2/ Amazon spotted it on 10 Sep, when it found the attackers' own Cairn server online with no login.

Its advice: high-confidence detections that trigger automated response, with humans overseeing outcomes rather than every action. Put a login on your own agent servers.

---

3/ Claude computer use is in beta on Team and Enterprise plans, off by default. Only an Owner or Primary Owner can turn it on, and an allow list can limit it to named apps.

Anthropic's own guide: there is no sandbox between Claude and a user's apps.

---

4/ Signal now blocks screenshots by default on iOS 27, with a new Block Siri AI setting, and blocks AI screen capture on Android.

Its limits, per Engadget: no help if the other person turns it off, none against agents reading notifications, none on Mac.

---

5/ A House report on Chinese open-weight models in US products: DoorDash reported 25 model families in use, and swapping an embedded one could take up to six months.

Cursor, whose Composer 2 is built on Moonshot's Kimi K2.5, is exploring a phase-out.

---

6/ METR: the best AI judge scored GPT-6 Astra's tasks about 0.2 out of 1 higher than METR's human grader, and none of the eval tasks agents wrote were usable.

If an LLM grades your agent, recheck it against human scores after every model upgrade.

---

New courses worth an evening:

Stanford CS 329Z, Engineering AI Agents: 9 free lecture videos so far
CMU AI Agents, lecture 13, Agentic Safety, by Graham Neubig, free on YouTube

---

Before an agent runs, write down what it may touch, who checks its work and where its model came from.

Full digest with every source: /digest/2026-11-22-before-the-agent-runs
