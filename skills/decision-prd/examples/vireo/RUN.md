# Test run: Draft-first recap with sources, 19 November 2026

A check on whether the skill works when it is all an agent has.

## Setup

- A fresh agent session was given this skill folder and `input/brief.md`.
- It could also read the evidence files the brief names: the teardown and its screens, the synthesis, and the pre-mortem from the earlier run. It read nothing else.
- Nobody answered questions.
- The request was: "Write the PRD for this. I need to make the decision this week."
- The output, `prd.json`, is unedited after the checker passed.
- Everything is fictional.

## Result

The checker's final output, verbatim:

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

The checker ran twice. The first run failed one check: point 2.1 put "2 points", the smallest lift worth shipping, in its expected movement without the word "estimate". I moved that figure to the baseline and labelled it a plan setting, not a forecast. The second run passed with no warnings. The build script then wrote the page without error. The page was not opened in a browser.

Layout was checked by a small script in the scratch folder that mirrors the template's block heights. All 19 schematic screens fit their desktop frame, and no paragraph was cut.

## What the PRD decided

The decision: replace Auto-assign with a draft-first recap with sources, for March 2027. Nothing is sent or assigned automatically.

The six points, one line each:

- 1.1: every line of the recap ends in its time, and clicking it plays the recording from there.
- 1.2: split "Decided" from "Discussed, not decided", and never turn a raised line into a task.
- 2.1: the recap goes to the host alone as a draft, and the host chooses who gets it.
- 2.2: a task is created only after its owner confirms, and the owner can decline.
- 3.1: guests are named, badged and unticked, and a ticked guest gets a trimmed recap with internal remarks off.
- 3.2: lines the model is unsure of are marked "Check this", with the reason.

The rollout puts 2.1 and 1.2 first because neither needs another team. 1.1 and 3.2 follow. 2.2 waits on the partner team and 3.1 waits on legal.

What it left open:

- How often a recap line is wrong. Nobody measures it, so 1.1 and 3.2 have no baseline.
- Whether a held draft costs the speed that some hosts value. The planned experiment tests it.
- Whether the partner team will agree to confirm-before-create (2.2).
- Whether legal will allow any send to external guests (3.1).
- Whether owners will use a decline button, and how late a draft arrives for meetings over 90 minutes.
- Effort for every point is an estimate with no engineering input.

## What the run found wrong with the skill

- The figure check can be dodged. It looks only at `know.expect`. The first run failed because "2 points" was in `expect`. Moving the same figure to `baseline` passed. That was honest here, but the check does not enforce the rule it names.
- The skill has no way to check that screens fit. Blocks that do not fit are dropped without a warning, and the format only gives a height limit of 215 for desktop. I wrote my own height script to be sure. The checker could do this.
- The format does not say how wide a desktop screen is for text. With the sidebar it is 272, without it 348. I worked out from the template code how many characters fit a line.
- The brief's planned experiment has no home. The format has `know` and `next` but no field for a test design, so the 50/50 split, the guardrails and the 2 point and 0.5 point settings went into `next`, `baseline` and `caveats`.
- The brief's guardrail has a flaw the skill cannot catch. Recaps reported as wrong depend on a host reading the recap. Draft-first makes hosts read more, so it may look worse on that guardrail. I put this in the caveats. The skill has no step that tests the experiment as set.
- Source pointers clash with the codes. The brief's teardown is `T`, and the synthesis themes are also `T1` to `T5`. "S:theme 1" is clear, but "T:stage 2" and "S1" screens in the teardown are easy to mix up. The skill could say to pick codes that cannot collide.
- Point 3.2 is thin. The teardown shows the gap, and the interviews show hosts hunting for sources, but no host asked for marks on doubtful lines. The skill says to cut a point it cannot tie to a source. I kept it and cited T and the first interview theme. That is a judgment the checker cannot make.
- The building-verb list in `SKILL.md` has seven verbs and the checker has more, such as Launch, Make, Develop and Ship. The skill should say the list is longer.
- `screen` on a point is for a prototype, but the skill does not say to leave it out when there is no prototype. I set it anyway. It does nothing here.
- Effort is S, M or L with no way to mark it as an estimate except the caveats. A reviewer reading the table alone may take it as engineering's view.
- The skill says `first` is the smallest first step. For two points, 1.1 and 3.2, the first step is to measure something, not to build. The format fits that, but the skill never says so.

## What this does not show

- It is one run by one agent on one fictional brief. It says nothing about how stable the output is across runs.
- It does not show that the PRD is the right decision. The checker does not test whether the evidence supports a point or whether a change solves it.
- It does not show that the page looks right in a browser. I checked layout by script and did not open it.
- It does not show how a reviewer would react, or that anyone would read the points one by one.
- The evidence files were clean and already in the skill's format. Messy real notes would test the skill harder.
