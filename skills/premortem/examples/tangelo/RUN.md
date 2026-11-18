# Test run: one-tap reorder, 18 November 2026

A check on whether the skill works when it is all an agent has.

## Setup

A fresh agent session was given this skill folder and the plan in `input/plan.md`. It could read nothing else, and nobody was available to answer questions. `premortem.json` in this folder is what it produced, unedited. The plan, the company and the research it cites are fictional.

## Result

```
11 risks (users 2, behaviour 2, operations 2, money 2, rules 1, build 2), 5 with tripwires
Guesses, with no evidence either way: R5, R6, R7, R9, R10, R11
  PASS  Every top risk has a complete tripwire
  PASS  Evidence is labelled
  PASS  All six areas were considered
  PASS  The list is short enough to act on
  PASS  Every risk is a story
  ----  Tripwires use metrics you have (yours to judge)
5 of 5 scripted checks passed
```

It passed on the first run of the checker. The agent said why, and it is worth repeating: it had read the checker before writing, so it knew the exact limits. That is allowed, and it means a first-time pass says less than it seems to.

## What the run changed in the plan

The plan was a button on Home that places last week's order again, with one tap, on the saved card. The top five risks all come from that one tap: stock is only checked at the end, substitutions go unseen, the next slot fills up, the "about $61" becomes a charge nobody reviewed, and a stray tap places an order. The plan that went into the PRD is different. The card opens last week's basket, ready to edit, and never pays.

## What the run found wrong with the skill

The agent listed sixteen points. These are fixed in version 1.0.0.

| Found | Fixed by |
|---|---|
| A threshold needs a number, and the plan had no baseline to take one from | Make it relative: "rises more than 2 points above its level in the four weeks before launch" |
| A risk that ranks high and has no metric the team measures had no rule. R10, the slow stock service, is one | It cannot be a top risk. It stays on the list and its mitigation says what would have to be measured |
| It was unclear whether the plan's own stated constraints count as evidence | They do. The plan is an input |
| `from` takes one input, and two inputs supported the same risk | Name the stronger, mention the other in `detail` |
| The checker fails a reason shorter than four words. The format did not say so | The format says so |
| "Say which you cut" and "`cut` is optional" disagreed | `cut` is needed only when risks were left out to stay within twelve |
| The format said a tripwire date is "after the plan's date". The checker compares it with the day of writing | The format now says what the checker does |

Left as they are, and worth knowing:

- **A tripwire dated before launch passes.** The checker compares the date with the day the pre-mortem was written. The launch date is free text, so it cannot be compared. Read the dates yourself.
- **The ranking leans towards what is easy to measure.** R10 is as likely and as damaging as R3 and is not in the top five, because nothing the team measures today would show it. The page says so in the risk itself.
- **The threshold numbers are judgment.** Two points, 25%, 95%: the agent chose them. The owner of each tripwire should set the real line before the date arrives.
- **No tie-break.** "Likelihood and impact together" does not say which comes first when they disagree. This run put impact first.
- A title longer than ten words is not checked, and neither is whether the imagined failure date is about six months after launch.

## What this does not show

One run, one plan, one model. The checker can see that a tripwire has a metric, a number, a date and an owner. It cannot see whether the metric exists in the team's dashboards, whether the number is the right one, or whether the story is the one that will happen. A pre-mortem also cannot see what only the team knows: the reorganisation, the dependency, the person who was never asked. The skill tells the agent to name that gap under `build` and hand it back.
