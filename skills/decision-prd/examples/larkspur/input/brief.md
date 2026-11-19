# Brief: getting a second person in

Larkspur is a fictional planning tool for product and engineering teams. Everything in this folder is made up so the skill can be shown end to end.

## What was asked

Write the PRD for replacing "Team suggestions" with "Share by link". Team suggestions asked for calendar access and invited the five people the admin meets most. Share by link is one page, shared by a link, view-only and free, sent by the admin to people the admin chooses.

The question behind it: why do most trial workspaces never get a second active person in the first week, and what would get one in?

## The six points to cover

Three groups, six points. Keep these IDs.

| ID | Point |
|---|---|
| 1.1 | Share any page by a link, view-only, free |
| 1.2 | Preview what the guest will see before sharing |
| 2.1 | Offer sharing after the first project has three items (not during signup) |
| 2.2 | Show what a seat costs, and when billing starts, inside the invite dialog |
| 3.1 | A guest can ask to edit, and the admin approves (that is when a seat is paid for) |
| 3.2 | The guest lands on the shared page, not on a signup wall |

## Evidence supplied

| Code | What | Where |
|---|---|---|
| T | Journey teardown: 4 products, 3 stages, 24 screens | `../../../../journey-teardown/examples/larkspur/teardown.json` (screens in `../../../../journey-teardown/examples/larkspur/input/screens.json`) |
| S | Interview synthesis: 8 people who started a trial alone | `../../../../interview-synthesis/examples/larkspur/synthesis.json` |
| R | Pre-mortem on Team suggestions | `../../../../premortem/examples/larkspur/premortem.json` |

## The product today

- **Pricing:** $12 per member per month. A 14-day free trial, started by one person, the trial admin.
- **Signup:** two fields. The page says "Free for 14 days. No card needed." There is no ask for a teammate.
- **Home:** empty at first. A "New project" card and a five item setup checklist. "Invite your team" is the last item and has no button.
- **Project page:** a table whose Owner column only lists "You". Nothing on the page mentions other people. The checklist reads "2 of 5" with three items and dates entered.
- **Inviting:** Settings, then Members, then "Add member". The Members table shows the admin as "Paid" during the trial. The dialog says "Adding a member starts billing today: $12 per month". There is one role, Member.
- **Viewing only:** not possible. Every second person is a paid seat. There is no share link and no preview of what a new person will see.
- **Invite email:** sent to the address typed. The synthesis has what people said about it.

## Launch facts

- Ships February 2027, to new trials only.
- Measures available today: workspaces with a second active person within 7 days; invites sent and accepted; trials that convert to paid within 30 days; workspaces that report an unwanted invite; workspaces that turn sharing off; invite emails marked as spam; contacts to support, by reason; paid seats per paying workspace.
- No baselines have been supplied. Do not put figures in the expected results.
- An experiment is planned after launch. The smallest lift worth shipping is 2 points on "second active person within 7 days". Guardrails: paid conversion within 30 days, unwanted-invite reports, and sharing turned off. The PRD should say what to measure and when to stop. It should not predict the result.

## Constraints given

- Billing for a guest who becomes a member is not designed.
- The security team has questions about public links. They have not signed off.
- Nothing may be said about price that the billing owner has not confirmed.
