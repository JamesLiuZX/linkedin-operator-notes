# Brief: a recap people can send

Vireo is a fictional video-meeting product. Everything in this folder is made up so the skill can be shown end to end.

## What was asked

Write the PRD for one decision: replace "Auto-assign" with "Draft-first recap with sources". Auto-assign emails the recap to every invitee five minutes after the meeting and creates every action item as a task automatically. The draft-first version gives the host a draft first, every line cites its moment in the recording, and owners confirm their own action items. Nothing is sent or assigned automatically.

The question behind it: why do people not trust a recap enough to send it on, and what would make one sendable?

## Evidence supplied

| Code | What | Where |
|---|---|---|
| T | Journey teardown: 4 products, 3 stages, 24 screens | `../../../../journey-teardown/examples/vireo/teardown.json` (screens in `../../../../journey-teardown/examples/vireo/input/screens.json`) |
| S | Interview synthesis: 8 hosts | `../../../../interview-synthesis/examples/vireo/synthesis.json` |
| R | Pre-mortem on Auto-assign | `../../../../premortem/examples/vireo/premortem.json` |

## The six points to cover

Three groups, six points. Use these IDs.

**Group 1: Checking a line**

- 1.1 Every line of the recap cites its moment. Click the time and the recording plays from there.
- 1.2 Separate "Decided" from "Discussed, not decided".

**Group 2: Who sees it, and who owns it**

- 2.1 Draft first: the host reviews and edits before anyone else gets the recap.
- 2.2 Owners confirm their own action items before a task is created.

**Group 3: Outsiders and doubt**

- 3.1 A trimmed version for external guests, off by default for internal remarks.
- 3.2 Lines the model is unsure of are marked "Check this".

## The product today

- **Recap:** a summary, the decisions and the action items, written after every meeting.
- **Delivery:** emailed to every invitee five minutes after the meeting ends. The host is one of the invitees and reads it at the same time.
- **Recap page:** a "Decisions" list that holds settled lines and lines that were only raised. No line has a time or a source. A "Watch recording" row is the only way to check anything.
- **Share recap:** a dialog that asks who should get the recap. It opens after the email has said the recap went to everyone.
- **Action items:** each shows an owner. Nothing lets the owner accept or decline.

## Launch

- Ships March 2027, to every workspace with Recap on.
- Measures available today: recaps opened; recaps shared within 24 hours; hosts who turn Recap off; recaps reported as wrong; tasks created and tasks completed; support contacts by reason; model spend per meeting minute; time from meeting end to recap delivery.

## Experiment planned

An experiment is planned on meeting hosts, draft-first against auto-send, split 50/50. The headline measure is hosts who share a recap within 24 hours. The smallest lift worth shipping is 2 points. Guardrails, counted per host: hosts who turn Recap off, and recaps reported as wrong. A rise in either is the harm, with a tolerance of 0.5 points. No results are part of this brief.

## Constraints given

- Nobody measures how often a recap line is wrong.
- The task-list integrations are owned by a partner team.
- Legal has not reviewed sending recaps to external guests.
- Recaps of meetings over 90 minutes already arrive late.
