# Plan: Auto-assign

Vireo is a fictional video-meeting product. This plan and everything around it is made up so the skill can be shown end to end.

## What ships

Auto-assign for Vireo Recap. Five minutes after a meeting ends, the recap is emailed to every invitee, external guests included. Each action item in the recap is created as a task in its owner's task list, automatically. Nobody reviews the recap first, and nobody has to accept a task.

## Who gets it

Every workspace that has Recap turned on. Planned for March 2027.

## What it is meant to change

- More recaps are acted on, not just opened.
- Fewer follow-ups are dropped after a meeting.

## What we already know

- **Journey teardown (code T):** four products, three stages, 24 screens. Two of the four send the recap to every invitee before the host has seen it. One of those two is Vireo, whose email says "Sent to all 9 invitees at 10:47". The other two hold the recap for the host. One of them lets owners confirm their own action items, and keeps external guests unticked by default. Vireo's recap page has no source on any line and one Decisions list for lines that were settled and lines that were only raised. Vireo's Share dialog asks who should get the recap after the email has said it went to all 9. Its action items show "Owner: Sam" with nothing for Sam to accept or decline. Vireo scores 1 out of 5 on trust at every stage, the lowest of the four.
- **Interview synthesis (code S):** eight hosts who run at least five meetings a week with Recap on, or until lately. Six of eight check a recap by hunting through the recording, because no line says where it came from. Five of eight have seen a passing idea listed under Decisions. Five of eight have seen an action item go to whoever spoke last. Five of eight have had a recap reach other people before they read it, and three of those five were outside the company. Five of eight rewrite the recap or have stopped sending it. One host turned Recap off for customer calls after a wrong commitment reached a customer. One host likes the automatic send and checks nothing. One host never reads the recap. Two hosts said that the more the recap does by itself, the more they have to check.
- Nobody has measured how often a recap line is wrong. The interviews cannot say, and no log does.

## What we can measure today

- Recaps opened
- Recaps shared within 24 hours
- Hosts who turn Recap off
- Recaps reported as wrong
- Tasks created and tasks completed
- Support contacts, by reason
- Model spend per meeting minute
- Time from meeting end to recap delivery

## Constraints

- Nobody measures how often a recap line is wrong.
- The task-list integrations are owned by a partner team.
- Legal has not reviewed sending recaps to external guests.
- Recaps of meetings over 90 minutes already arrive late.
