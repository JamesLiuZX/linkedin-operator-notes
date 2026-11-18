# The quality bar

A prototype from this skill is not handed over until these hold. Six are checked by `scripts/check.mjs`. One is yours.

| # | Check | Who checks | What fails it |
|---|---|---|---|
| 1 | Every PRD point has a switch | Script | A point with no switch, a switch that is not a point, a switch with no label or note |
| 2 | Every switch changes at least one screen | Script | Each screen is drawn with the switch off and on. If nothing differs, it fails |
| 3 | Every pin has a switch behind it | Script | A pin whose ID is not a switch |
| 4 | No dead taps | Script | A button or link with no behaviour, or one pointing at a screen, action or sheet that does not exist |
| 5 | Any preset can finish the journey | Script | Under some preset there is no way from one journey screen to the next |
| 6 | Made-up data is labelled | Script | The legal line does not say the data is illustrative |
| 7 | All switches off is the product today | You | Compare the Today preset with the live product |

## Why these seven

1. **A switch per point.** The prototype is only useful in a review if it and the PRD describe the same list.
2. **Every switch does something.** A switch that changes nothing teaches reviewers to stop trusting the others.
3. **Pins match switches.** Pins and notes drift apart when they are maintained by hand. Tying both to one list of IDs stops that.
4. **No dead taps.** The first dead tap ends the review and starts a conversation about the prototype.
5. **A finishable journey.** Reviewers will try every combination. A preset that strands them reads as a bug in the proposal.
6. **Labelled data.** Someone will screenshot it. The screenshot has to say it is not real.
7. **Off is today.** This is the check the script cannot make and the one that matters most. If the baseline is wrong, every comparison is wrong.

## What the checker does not see

- Whether a change looks right. It compares strings of HTML, not pixels.
- Whether two switches collide when both are on. Use the Everything preset and look.
- Whether the copy is good.

The checker reads the HTML your screen functions return. It does not run a browser.
