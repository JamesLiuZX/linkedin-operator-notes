---
title: "The FCA named 5 regulated activities AI agents can drift into"
slug: dg-2026-11-26-the-duty-stays-with-you
pillar: agents
section: agents
status: ready
derivedFrom: digests/2026-11-26-the-duty-stays-with-you.md
publishAt: 2026-11-26T01:00:00Z
platforms: linkedin
tags: ai, fintech, regulation, digest
digest: 2026-11-26-the-duty-stays-with-you
media: /digests/2026-11-26-the-duty-stays-with-you/carousel.pdf, /digests/2026-11-26-the-duty-stays-with-you/cover.png
---

<!-- EVIDENCE
Claim: four changes published 23 to 25 Nov 2026 (the FCA's agentic AI page, Anthropic's Enterprise Frontier Safeguards beta with AWS's Bedrock preview, Skills over MCP in Claude, and 42 attorneys general objecting to the Character.AI chat auction) each put a duty back on the team that ships an AI product, and none of those duties can be handed to a vendor, a protocol or a buyer.
Moment: on 24 Nov 2026 the FCA published "Our approach to Agentic AI", saying that describing yourself as a technology provider does not remove the need for authorisation, and naming five regulated activities for agent makers to check.
Numbers: FCA page first published 24 Nov 2026, with 5 example activities (payments services, financial promotions, an authorised information service, credit broking or intermediation, financial advice); EFS public beta dated 23 Nov 2026; Safety Cases answered within 7 calendar days or access may be suspended; Bedrock stops serving covered models 24 hours after losing the key or bucket; interim ZDR exception for current Fable models through at least 30 Jun 2027; 30-day retention for covered models since 9 Jun 2026; Skills over MCP in beta from 24 Nov 2026; over 700 million monthly MCP SDK downloads (Anthropic) and over 5 billion in total (MCP maintainers); Tasks extension removes the 2025-11-25 experimental tasks from the core protocol; 42 attorneys general (45 in Bonta's quote) on 24 Nov 2026; auction set for 1 Dec 2026; more than 21 million US accounts, more than 2.1 million registered to minors; bidder formed 13 Nov 2026; $350,000 break-up fee; Stanford lecture given 5 Oct 2026; OAuth course 2 hours, posted 6 Jan 2026.
Names: FCA, Consumer Duty, DRCF, Anthropic, AWS, Amazon Bedrock, Enterprise Frontier Safeguards, Enterprise Data Controls, Claude Fable, Claude Mythos, Claude Opus 5.5, Claude Sonnet 5.5, Cyber Verification Program, Claude Platform, Google Cloud, Microsoft Foundry, Model Context Protocol, Skills over MCP, Claude Code, Supabase, Railway, GitHub, SEP-2640, SEP-2663, Character.AI, Rob Bonta, Smirks and Pangs Acquisition LLC, TechCrunch, Stanford CS 329Z, Diyi Yang, Michael Ryan, John Yang, freeCodeCamp, Udemy.
Cost: I read the FCA page but not the DRCF joint statement it points to; I read the California release, not the Character.AI filing; I have not seen how Claude shows a changed skill to the person who approved it; the EFS beta terms are unread; the download figures are Anthropic's and the MCP project's own counts; there is no Udemy pick because none of the 21 pages I tried showed both a recent update and a usable rating; one course pick is from January.
Counterexample: a team with no UK consumers, no Claude Mythos-class models, no third-party MCP servers and no stored chat logs has nothing to change this week.
Reader action: this week, map every action your agent can take against the FCA's five activities; name the person who answers Safety Cases before enrolling in EFS; decide which MCP servers may ship skills before a Team admin turns the feature on; read the change-of-control clause in your privacy policy and check that your retention schedule deletes old chats and risk scores.
-->

## Draft

The FCA named 5 regulated activities AI agents can drift into.

On 24 Nov it said a technology provider label is no exemption from authorisation. Payments, financial promotions, credit broking, advice: what counts is what your agent does.

Four changes from 23 to 25 Nov 2026, all about who carries the duty:

1. The FCA also asks firms to consider whether to accept payments an AI agent instructs at all. Senior managers answer for AI they buy as well as AI they build.

2. Anthropic and AWS now let Claude's most capable models keep prompts in your own bucket, under your key. The trade: your team answers each misuse flag within 7 days, and Bedrock stops serving those models 24 hours after it loses your key.

3. MCP turned two, and servers can now ship skills to Claude, in beta. The spec itself says to treat skill content as untrusted input. Choose which servers may do that before a Team admin turns it on.

4. 42 attorneys general asked a court to reject the sale of Character.AI chats from over 21 million US accounts, set for auction on 1 Dec. Its privacy policy said it does not sell personal information. Under the sale terms, the buyer would not have to honour that.

New courses worth an evening:
· Stanford CS 329Z's lecture on tool use and MCP, free on YouTube
· freeCodeCamp's 2-hour OAuth 2.0 course, from January

My read: you can't outsource any of these duties, whether to a vendor, a protocol or whoever buys your company. I haven't seen how Claude shows a changed skill, and there is no Udemy pick: none I could load had a recent update and a solid rating.

Takeaway: this week, put one person's name against each duty: the FCA activity map, Safety Case replies, approved skill servers, your privacy promise.

#AI #FinTech #Regulation

## First comment

Full digest with every source, the carousel and the course picks: /digest/2026-11-26-the-duty-stays-with-you

## X thread

The FCA says "technology provider" is no exemption: an AI agent that pays, promotes, brokers credit or advises can need authorisation.

Same week: Claude's top models moved logs into your bucket, MCP servers got to ship skills, and 42 attorneys general fought a chat auction.

---

1/ FCA, 24 Nov: as AI moves from giving information to moving money, arranging borrowing and making investment decisions, firms must know what needs authorisation.

Five to check: payments, financial promotions, an authorised information service, credit broking, advice.

---

2/ It asks firms whether they should accept payments an AI agent instructs, or from a wallet an agent controls. Senior managers answer for AI they buy as well as build.

And it "will not hesitate" to use its powers against unauthorised services.

---

3/ Anthropic opened Enterprise Frontier Safeguards in beta on 23 Nov, and AWS put it in preview on Bedrock.

Prompts for Claude's most capable models go to your own bucket under your key. AWS says no AWS or Anthropic person reads them.

---

4/ The review comes with it: your team answers each Safety Case within 7 days, or Anthropic may suspend access.

Bedrock stops serving those models 24 hours after it loses your key or bucket. The interim zero retention exception runs through at least 30 Jun 2027.

---

5/ MCP turned two on 24 Nov. Servers can now ship skills to Claude (beta), and Tasks and Elicitation are GA for Pro, Max and Ultra.

The skills spec: treat skill content as untrusted input. When a file changes, the host must ask for approval again.

---

6/ 42 attorneys general asked a court to reject the sale of Character.AI's chats, set for auction on 1 Dec: over 21 million US accounts, over 2.1 million of them minors'.

Its policy said it does not sell personal information. Under the terms, the buyer needn't honour that.

---

New courses worth an evening:

Stanford CS 329Z, lecture 4: tool use, function calling and MCP, free on YouTube
freeCodeCamp's OAuth 2.0 Course for Beginners, 2 hours, posted in January

---

Give every duty a named owner: the activity map, the Safety Case queue, the skills list, the privacy promise.

Full digest with every source: /digest/2026-11-26-the-duty-stays-with-you
