# Test run: Auto-assign, 19 November 2026

A check on whether the skill works when it is all an agent has.

## Setup

- A fresh agent session was given this skill folder and `input/plan.md`.
- It could read nothing else. Nobody answered questions.
- The request was: "Run a pre-mortem on this plan before we commit to it."
- The output, `premortem.json`, is unedited after the checker passed.
- Everything is fictional.

## Result

The checker's final output, verbatim:

```
10 risks (users 1, behaviour 3, operations 1, money 1, rules 1, build 3), 5 with tripwires
Guesses, with no evidence either way: R6, R7, R9
  PASS  Every top risk has a complete tripwire
  PASS  Evidence is labelled
  PASS  All six areas were considered
  PASS  The list is short enough to act on
  PASS  Every risk is a story
  ----  Tripwires use metrics you have (yours to judge)
5 of 5 scripted checks passed
```

The checker ran once. It passed the first time, so no fixes were needed. The build script then wrote the page without error. The page was not opened in a browser.

## What the run changed in the plan

The plan was Auto-assign. Five minutes after a meeting, the recap goes to every invitee, guests included. Every action item becomes a task in its owner's list. Nobody reviews anything first.

The top risks, worst first, each with a tripwire:

- R1: a wrong commitment reaches a customer unreviewed. Five of eight hosts have had a recap reach others unread, and three of those five were outside the company. Tripwire: one or more wrong recaps reaching an external guest in the pilot, checked on 2027-02-15.
- R3: tasks land on the wrong people. Five of eight hosts saw an item go to whoever spoke last, and nothing lets an owner decline. Tripwire: tasks completed per task created falls below its pre-launch level for two weeks running, checked on 2027-04-15.
- R4: raised ideas become settled decisions. Five of eight hosts have seen a passing idea under Decisions. Tripwire: more than three reports in a week, checked on 2027-03-31.
- R2: hosts turn Recap off. Tripwire: the weekly count rises more than two times above its pre-launch level, checked on 2027-04-15.
- R5: the five-minute promise breaks on long meetings. Tripwire: median delivery time above five minutes in any pilot week, checked on 2027-02-15.

Three risks are guesses with no evidence either way: legal blocking the guest send (R6), the partner team not being able to ship task creation (R7), and model spend (R9). R7 is the internal risk the skill says to name. The user has to fill it in.

The plan I would take forward instead:

- Send the recap to the host only, as a draft. The host chooses who gets it.
- Keep guests out unless the host ticks them. Do not ship any guest send until legal has reviewed it.
- Create a task only after its owner confirms, and give the owner a way to decline. Ask the partner team first.
- Split Decisions into settled and raised, and never turn a raised line into a task.
- Pilot first with a small set of workspaces. Measure how often a line is wrong before launch, because no tripwire on "reported as wrong" works when hosts no longer read the recap first.

## What the run found wrong with the skill

- The skill never says whether the plan may count as an input with its own ID. `format.md` lists only research as inputs. I added the plan as input `P` because the skill says it counts as evidence. A line in `format.md` would settle it.
- The checker cannot tell whether a tripwire metric exists. That is a stated limit, but it bit here. R1 uses "Recaps reported as wrong", and its threshold needs that count split by external guests. The plan's metric list does not say it can be split. R3 uses a ratio of two listed metrics. The skill gives no rule for derived or sliced metrics. I decided by hand and wrote the doubt into this file, not into the output.
- The skill gives no guidance for choosing a threshold when there is no baseline. It says to make it relative, but "more than 2 times" is my own number. The checker only needs a digit, so a made-up number passes. The skill could say to mark such a threshold as a starting point to set with the owner.
- The plan has no pilot, yet a tripwire date has to come before launch to act on it. The skill says only "soon enough to act on". I assumed a pilot in February 2027 and put it in the tests. That assumption is not in the JSON anywhere. A field for assumptions would help.
- `failedOn` is "about six months after launch". I chose 2027-09-01 from a March launch with no day given. That is fine, but the skill does not say how to pick the date.
- The checker does not compare counts to the inputs. I wrote "five of eight" from the plan, and nothing would catch a wrong count.
- A serious risk with no metric, such as the legal risk R6, cannot be in `top`. The skill says to leave it out and say in its mitigation what to measure. That worked, but the risk with the biggest impact then has no tripwire and no date, and the checker only warns about that for risks rated high on both.
- `evidence.from` takes one input. R1 rests on S and T. The skill says to name the stronger and mention the other in `detail`, which I did, but the page then shows only one source chip.

## What this does not show

- It is one run by one agent on one fictional plan. It says nothing about how stable the output is across runs.
- It does not show that the likelihoods are right. They are judgments, and the checker does not test them.
- It does not show that the page looks right or works in a browser. I did not open it.
- It does not show that the metrics exist or that anyone would act when a tripwire fires.
- The plan was short and clear. A long, vague plan would test the "stop instead of writing" rules, and this run did not.
