---
title: "A pre-mortem with no dates is a list of worries"
slug: hb-premortem
pillar: growth
section: growth
status: ready
derivedFrom: skills/premortem/SKILL.md
publishAt: 2026-12-03T01:00:00Z
platforms: linkedin
tags: ai, risk, product-management, skills
media: /hub/launch/premortem/carousel.pdf, /hub/launch/premortem/clip.mp4
---

<!-- EVIDENCE
Claim: A risk review changes a plan only when each top risk carries a metric, a threshold with a number in it, a date and an owner.
Moment: On 18 Nov 2026 a test run of the pre-mortem skill on an invented one-tap reorder plan traced all five top risks to the single tap, and the plan was changed to a card that opens an editable basket.
Numbers: 11 failure stories across 6 areas; 5 with evidence and 6 marked as guesses; 5 tripwires with check dates from 15 Jan 2027 to 1 Feb 2027 (invented plan); 16 gaps listed by the test run on 18 Nov 2026.
Names: AI Workflow Handbook, premortem skill, check.py, tripwire, Tangelo (an invented grocery app).
Cost: A risk as serious as the top five stayed out of them because no metric the team has would show it, so the ranking leans towards what is easy to measure. The thresholds are the agent's judgment. A tripwire dated before launch still passes the checker.
Counterexample: A decision that is already final gains nothing from a pre-mortem. The skill says so and offers a launch watch-list instead.
Reader action: Take the top three risks from the last review and write next to each a metric, a number, a date and a name. Drop any risk that cannot get all four into a second list.
-->

## Draft

A pre-mortem with no dates is a list of worries.

Twenty risks, no owner, nothing anyone will look at again. So this skill ends somewhere else: the top risks each get a tripwire.

A tripwire is four things:
· a metric the team already has
· a line it must not cross, with a number in it
· a date to look
· a person who looks

The test case is invented. Tangelo, a grocery app, plans a button that places last week's order again with one tap. On 18 November 2026 a fresh agent session got the plan and the skill folder, nothing else.

It wrote 11 failure stories across 6 areas and weighed each against the research. 5 had evidence. 6 it marked as guesses, and the page says so at the top.

The top five all came from the one tap. Stock is only checked at the end. Substitutions go unseen. A stray tap places an order. So the plan changed before any code: the button became a card that opens last week's basket, ready to edit, and never pays.

What the run exposed in my skill: one risk as serious as the others, R10 on the page, stayed out of the top five, because nothing the team measures would show it. A ranking that needs a metric leans towards what is easy to measure. The page now says that in the risk itself.

Also true: the thresholds, such as 2 points above the level before launch, are the agent's judgment. The owner of each tripwire should set the real line before 15 January 2027, the first of 5 check dates. The last is 1 February 2027.

Takeaway: a risk review is done when each top risk has a number, a date and a name.

#ProductManagement #RiskManagement #AI

## First comment

The demo, the finished risk register with its five tripwires, the record of the test run and the skill: /workflows/premortem/
