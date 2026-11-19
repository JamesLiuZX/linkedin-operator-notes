# Test run: Team suggestions, 19 November 2026

A check on whether the skill works when it is all an agent has.

## Setup

- A fresh agent session was given the `skills/premortem/` folder and `input/plan.md`.
- It could read nothing else.
- Nobody answered questions. Where the skill says to ask, the agent made the most careful assumption and wrote it down.
- The assumed launch day is 1 February 2027, because the plan says only "February 2027". The failure date is 1 August 2027.
- The output is unedited.
- Everything is fictional.

## Result

```
10 risks (users 2, behaviour 2, operations 1, money 2, rules 1, build 2), 5 with tripwires
Guesses, with no evidence either way: R3, R8, R10
  PASS  Every top risk has a complete tripwire
  PASS  Evidence is labelled
  PASS  All six areas were considered
  PASS  The list is short enough to act on
  PASS  Every risk is a story
  ----  Tripwires use metrics you have (yours to judge)
5 of 5 scripted checks passed
```

The checker ran once and passed. The agent wrote to the story-length and tripwire rules while drafting, so nothing needed fixing. The build script then wrote the page without errors.

## What the run changed in the plan

The plan was one button, "Invite all 5", after a calendar permission, on every new trial from February 2027. The goal was more second people in week one, and more trials that pay.

The top risks say:

- R1: admins will invite before the workspace is presentable. Six of eight interviewees held it back. Tripwire: more than 1 in 20 workspaces that use the card report an unwanted invite, checked 22 February 2027.
- R2: invitees meet a billing step the admin did not expect. Five of eight could not tell what an invite costs. Tripwire: billing contacts to support rise to more than 2 times their pre-launch level.
- R4: guests look once and leave, because there is no view-only role and no preview. Tripwire: second active person within 7 days does not rise at least 3 points.
- R5: five emails at once get marked as spam. Tripwire: spam marks rise to more than 2 times their pre-launch level.
- R6: free guests never become paying seats, and the billing for them is not designed.

The plan to take forward instead: do not ship one button that sends five invites. Ship a card that lists the suggested people with nobody ticked, shows what an invitee will see, and says what an invite costs and when billing starts. Make the calendar step skippable. Decide the guest rules before launch. Start the calendar provider reviews and the security review now.

## What the run found wrong with the skill

- Tripwire thresholds need a number, but the metrics list has no baselines. The skill says to use a relative threshold, which worked. The agent had to pick the multiples (2 times, 3 points, 1 in 20) itself. The skill should say plainly that these are proposals for the owner to confirm.
- The skill says a check date must be "soon enough to act on" and "after today". The checker only tests "after the plan's date". The plan ships in February 2027, so every date had to fall after launch. The skill does not say whether a pre-launch check date is better. A line on that would help.
- A risk with no metric cannot be in `top`. R7 (cautious companies refuse the calendar ask) and R9 (provider approval) were serious, but no listed metric covers them. The skill handles this, but the handover does not tell the user that important risks sit outside `top`. The agent said so in the mitigation text.
- `cut` is shown as optional but the template example always has a line. The agent left it as an empty list and the checker accepted that. This is fine, but the format file could say so.
- The checker does not test that a tripwire metric matches the "What we can measure" list. It marks this "yours to judge", which is honest, but an agent could still invent a metric and pass. The agent checked its five by hand.
- The format says `skipped` is needed only for an empty area. The file has `"skipped": {}`. It passed, so this is fine.
- Nothing else was unclear or wrong.

## What this does not show

- It is one agent, one plan and one run. It does not show the skill works on a plan that is vague, long or in another field.
- The likelihoods and impacts are the agent's judgment. The checker cannot tell whether they are right.
- The thresholds have no real baseline, so they could not be tested.
- Nobody has acted on a tripwire, so it shows nothing about whether the page changes a decision.
- Every input is invented and tidy. Real evidence is messier.
