# Test run: Kerb, 18 November 2026

A check on whether the skill works when it is all an agent has.

## Setup

A fresh agent session was given this skill folder and the brief below. It could read nothing else, and nobody was available to answer questions. `spec.js` in this folder is what it wrote, unedited.

## The brief

> Build a prototype for these three changes to our parking app, Kerb. Brand colour #1d4ed8.
>
> 1.1 The session ends without warning. Change: ten minutes before a session ends, show a banner on Home: "Your parking ends in 10 minutes" with an "Add 30 min" button.
>
> 1.2 Extending means starting again. Change: add an "Extend" button on the active session card that adds time in one tap, without ending the session.
>
> 2.1 The fee appears only at payment. Change: show the running cost on the active session card, "So far: $3.20", and the cost of the extension before the driver confirms it.
>
> The product today: Home shows a map area, then an "Active session" card: "Bay 14, Linden Street. Ends 15:40" with one button, "End session". To get more time today a driver taps End session, then "Start a new session", picks a duration on a Duration screen (30 min, 1 hour, 2 hours), and pays on a Payment screen that shows the fee for the first time. Then a Receipt screen. There is a tab bar: Home, History, Account.

Kerb is fictional.

## Result

The spec passed every scripted check the first time the checker ran on it.

```
5 screens, 3 switches
  PART  Every PRD point has a switch (no --prd given: IDs not compared with a PRD)
  PASS  Every switch changes at least one screen
  PASS  Every pin has a switch behind it
  PASS  No dead taps
  PASS  Any preset can finish the journey
  PASS  Made-up data is labelled
  ----  All switches off is the product today (yours to judge)
5 of 6 scripted checks passed, 1 only in part
```

The first check is marked in part because the brief was a numbered list, not a `prd.json`, so there was no file to compare the switch IDs with.

## What the run found wrong with the skill

The agent was asked to look for weaknesses. It found one bug and four gaps. All five are fixed in version 1.0.0.

| Found | Fixed by |
|---|---|
| The checker exited with a usage error when run without `--prd` | Corrected the argument handling |
| The first check printed PASS even when there was no PRD to compare with | It now prints PART and says why |
| Controls inside bottom sheets were never checked for dead taps | The checker now draws every sheet a screen opens |
| No guidance for a change that depends on the time | A rule: freeze the moment in `state()` and say so on the screen |
| No guidance for two switches that meet on one control | A rule: each must still do something visible alone |

It also had to invent one screen the brief never described (what the driver sees after ending a session). The skill now says to draw the plainest version in that case and list it as an assumption.

## What this does not show

One run, one brief, one model. It shows the instructions are enough to get a working prototype without help. It does not measure how much better the result is than an agent working without the skill.
