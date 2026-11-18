---
title: "I planted a fake customer quote. The script removed it"
slug: hb-interview-synthesis
pillar: growth
section: growth
status: ready
derivedFrom: skills/interview-synthesis/SKILL.md
publishAt: 2026-11-24T01:00:00Z
platforms: linkedin
tags: ai, user-research, product-management, skills
media: /hub/launch/interview-synthesis/carousel.pdf, /hub/launch/interview-synthesis/clip.mp4
---

<!-- EVIDENCE
Claim: A research synthesis written by a model can be trusted only when a script has looked for every quote in the transcripts and has the power to remove one.
Moment: On 18 Nov 2026 a test brief asked for a line nobody says in any of 8 invented transcripts. The agent included it, and the skill's script removed it and failed the count for that theme.
Numbers: 8 invented interview transcripts; 36 quotes matched to a line; 1 quote rejected; 6 themes; quotes under 6 words are now rejected; test run on 18 Nov 2026.
Names: AI Workflow Handbook, interview-synthesis skill, verify_quotes.py, Tangelo (an invented grocery app), Claude Code.
Cost: The first version let a three-word fragment pass as a quote. The published synthesis predates a flag for themes the interviewer led, so its sixth theme says so only in prose. One run on invented transcripts shows the check works, not that the themes are right.
Counterexample: With two or three interviews you can read every line yourself, and counting people adds nothing.
Reader action: Before the next readout, pick three quotes from the deck and find each one in the recording or transcript. If one is missing, check them all.
-->

## Draft

I planted a fake customer quote. The script removed it.

The test, on 18 November 2026: 8 invented interview transcripts about a grocery app called Tangelo, and a brief that said to include the line where someone says ordering the food takes longer than cooking it. Nobody says that in any of the 8.

The agent put the line in anyway, and gave it to participant 2, the one it judged most likely. Models do this. People do it too, from memory.

Then the skill's Python script ran, the first of its 5 checks. It looks for every quote in the transcripts, word for word, and records the line number. It found 36. It did not find the 37th, so it removed it and said so.

That left one participant with no quote under the first theme, and a second check failed. The agent went back to his transcript, found what he had really said, and the next run passed.

What ends up on the page:
· 6 themes, each counted by person, such as 6 of 8
· every quote opens in its transcript, with 2 lines either side
· the exception to each theme, in that person's words
· the rejected quote at the bottom, struck out

The limit: a script can prove a quote exists. It cannot tell you the quote was read in the right context, or that the themes answer your question. That part stays with you.

My first version also let a three-word fragment pass, because any fragment matches somewhere. Quotes under 6 words are now rejected.

Takeaway: a synthesis is only as good as the check that can remove a quote from it.

#UserResearch #ProductManagement #AI

## First comment

The demo, the finished synthesis with every quote in its transcript, the record of the test run and the skill: /workflows/interview-synthesis/
