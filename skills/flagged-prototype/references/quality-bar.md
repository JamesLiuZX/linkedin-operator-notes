# The quality bar

A prototype from this skill is not handed over until these hold. Six are checked by `scripts/check.mjs`. One is yours.

| # | Check | Who checks | What fails it |
|---|---|---|---|
| 1 | Every PRD point has a switch | Script | A point with no switch, a switch that is not a point, a switch with no label or note |
| 2 | Every switch changes at least one screen | Script | Each screen is drawn with the switch off and on. If nothing differs, it fails. A change inside a sheet or dialog that a screen opens counts |
| 3 | Every pin has a switch behind it | Script | A pin whose ID is not a switch, on a screen or inside a sheet or dialog |
| 4 | No dead taps | Script | A button or link with no behaviour, one pointing at a screen, action or sheet that does not exist, or a tour step that names a switch, screen, sheet or preset that does not exist |
| 5 | Any preset can finish the journey | Script | Under some preset there is no way from one journey screen to the next |
| 6 | Made-up data is labelled | Script | The legal line does not say the data is illustrative |
| 7 | All switches off is the product today | You | Compare the Today preset with the live product |

The checker also prints warnings. They do not fail the run, but read each one: a switch with no pin, a switch that changes a screen it does not list, a tour step whose `tap` is not on the screen before it, a missing tour, a tour shorter than 6 or longer than 12 steps.

## Why these seven

1. **A switch per point.** The prototype is only useful in a review if it and the PRD describe the same list.
2. **Every switch does something.** A switch that changes nothing teaches reviewers to stop trusting the others. A switch whose only effect is inside a dialog is fine, because the reviewer can open the dialog.
3. **Pins match switches.** Pins and notes drift apart when they are maintained by hand. Tying both to one list of IDs stops that.
4. **No dead taps, and a tour that works.** The first dead tap ends the review and starts a conversation about the prototype. A tour that points at a switch or screen that is not there does the same.
5. **A finishable journey.** Reviewers will try every combination. A preset that strands them reads as a bug in the proposal.
6. **Labelled data.** Someone will screenshot it. The screenshot has to say it is not real.
7. **Off is today.** This is the check the script cannot make and the one that matters most. If the baseline is wrong, every comparison is wrong. Compare puts the off screen on the left of a divider, so a flattering or half-drawn "today" is the first thing a reviewer sees.

## Three things only you can judge

- **Off must be honest.** Compare draws every screen with all switches off beside the same screen with the current switches on. It works only if the off screen is the real product today, including its dead ends and its awkward steps. Never tidy it.
- **The tour must be walkable.** A reviewer who has not read the PRD should follow it from the first step to the last. Step one shows today. Each step adds one change and says in a sentence what it is. A step that sets data (`set`) or opens a dialog (`sheet`) must show something the reviewer can see. Press Next through the whole tour once and read the captions aloud.
- **Open values stay open.** Where the PRD has not decided a price, a date or a limit, the screen shows a `d-slot`. It does not show a guess. A number on a screen must come from the PRD or from clearly made-up data.

## What the checker does not see

- Whether a change looks right. It compares strings of HTML, not pixels.
- Whether two switches collide when both are on. Use the Everything preset and look.
- Whether the copy is good.
- Whether a tour step's `tap` selector matches more than one element, or whether the ring lands where you meant. It looks only for a simple attribute, class or id.

The checker reads the HTML your screen functions return. It does not run a browser.
