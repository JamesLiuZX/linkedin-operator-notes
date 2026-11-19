# Test run: Share by link, 19 November 2026

A check on whether the skill works when it is all an agent has.

## Setup

- A fresh agent session was given the `skills/decision-prd/` folder and `input/brief.md`.
- It could also read the evidence files the brief names: the teardown and its screens, the interview synthesis, and the pre-mortem.
- Nobody answered questions. The brief already gave the six points and their IDs, so no question was needed.
- The six points kept the IDs 1.1, 1.2, 2.1, 2.2, 3.1 and 3.2.
- Screens are schematic blocks in the desktop frame, drawn from the teardown's screens.
- The output is unedited after the checker's one failure was fixed.
- Everything is fictional.

## Result

```
6 points in 3 sections
  PASS  Every point has a problem, a change and evidence
  PASS  IDs are unique and used consistently
  PASS  Titles state problems
  PASS  Every point says how you would know
  PASS  Every figure has a source or is marked as an estimate
  PASS  Problem and Change stay short
  ----  The first release is small enough to ship (yours to judge)
6 of 6 scripted checks passed
```

The checker ran twice. The first run failed "Problem and Change stay short": point 2.2 had three sentences, because the checker counted the two quoted trial sentences as separate sentences. The agent reworded the problem to two sentences and the second run passed. There were no warnings.

The build script wrote the page without errors. The agent then rendered the page and looked at every screen. Some labels were cut with an ellipsis, so the agent shortened them. All blocks sat inside their frames.

## What the PRD decided

The decision: replace Team suggestions with Share by link, as a staged rollout, not as one release.

- 1.1: a Share button makes a view-only link that is free to the guest.
- 1.2: a Preview as guest step shows what the link will show.
- 2.1: a card offers sharing once a project has three items, not during signup.
- 2.2: the invite dialog states the cost and the billing start, with the words left as slots for the billing owner.
- 3.1: a guest can ask to edit, and the admin approves, and the seat is paid for then.
- 3.2: the link opens straight onto the page, with no signup wall.

The rollout is: 2.2 first and alone, then 1.1, 1.2 and 3.2 together in February 2027 as an experiment, then 2.1 after the first read, then 3.1 when billing is designed.

It left open:

- Whether security will sign off on public links (1.1, 3.2).
- The price words and whether billing really starts today in a trial (2.2).
- How a guest who becomes a member is billed (3.1).
- Every baseline. None was supplied, so no point predicts a size.
- Whether the card in 2.1 moves admins who wait for a tidy plan.

## What the run found wrong with the skill

- The sentence counter treats a quoted sentence inside a problem as a sentence. Quoting the trial promise in full failed the check. The skill says to quote exact words when the wording matters, so the two rules clash. The format should say how to quote, or the checker should ignore quotes.
- The format says `know.expect` may not state a size unless it contains the word "estimate". The brief gives a decision threshold (2 points), which is not an estimate. The agent wrote "a decision threshold, not an estimate of the result", which passes only because it contains the word. The format should say where a threshold belongs.
- The schematic blocks cut a label after about 49 characters. The format says a label that is too long is cut, but gives no number. The agent had to render the page to find the limit. A number in the table would help.
- The format says keep desktop heights within 215, but gives no gap or table row height. The agent could not add heights up and checked by rendering. A table's height is listed as "by rows", with no figure.
- The skill says the first rollout row should be small enough to ship alone. Here the point that best fits is 2.2, but the card in 2.1 needs the link from 1.1. The skill does not say what to do when the smallest point is not the most important. The agent chose a small first row and explained why. This is judgment, and the skill leaves it open.
- The skill and format do not say whether a point can have several proposed screens. The agent used two in 3.1 and the checker accepted it.
- The format shows `sources` pointers like "S:theme 1, 7 of 8", but the checker does not test that the pointer exists. A wrong pointer would pass. The agent checked each one by hand against the inputs.
- Nothing else was unclear.

## What this does not show

- It is one agent, one brief and one run.
- The checker cannot tell whether the evidence supports each point. The agent checked the counts by hand, and a person should too.
- It does not show that a reviewer can decide from the page in ten minutes. Nobody tried.
- The first release, 2.2, is a judgment the script does not check.
- Every input is invented and tidy. Real research is messier.
- The page was viewed in one browser and not on a phone.
