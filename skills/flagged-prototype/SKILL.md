---
name: flagged-prototype
description: Builds a clickable phone prototype as a single HTML file in which every proposed change is a switch that can be turned on and off, numbered like the points of a PRD, with a pin on each change and presets for today, the first release and everything. Use when someone wants a prototype, mock-up or clickable demo of proposed product changes, wants to compare the product today with a proposal, wants reviewers to judge each change separately, or has a PRD (prd.json from decision-prd or any numbered list of changes) to bring to life. Not for production UI or design files, and not for changes with no screen such as pricing logic.
license: MIT
compatibility: The prototype itself needs only a browser. scripts/build.mjs and scripts/check.mjs need Node 18 or later. Without Node, paste the spec into assets/template.html by hand and apply references/quality-bar.md by reading.
metadata:
  author: James Liu
  version: "1.0.0"
  homepage: https://jamesliuzx.github.io/linkedin-operator-notes/workflows/flagged-prototype/
---

# Flagged prototype

Produce `prototype.html`: one file a reviewer opens in a browser. On the left, a phone running the product. On the right, a panel with one switch per proposed change. With every switch off the phone shows the product as it is today. Each switch adds one change and puts a numbered pin on it.

You write one thing: a **spec**, a JavaScript module that describes the screens and the switches. The runtime in `assets/template.html` does the rest (the phone, the panel, navigation, presets, pins, links that carry the state). The spec format and the kit of screen classes are in [references/format.md](references/format.md). Read it before writing.

## What you need before building

1. **The changes, numbered.** `prd.json` from `decision-prd`, or any list where each change has an ID. If the changes are not numbered, number them yourself as N.n and show the user the list before building.
2. **The product today.** Screenshots or a description of each screen on the journey. If you have neither, ask. Do not invent the current product. If one screen on the journey was never described and nobody can be asked, draw the plainest version of it, and list it under assumptions when you hand over.
3. **One colour and the product's name.**

## Stop instead of building when

- **A change has no screen.** Say which, and leave it out. A switch that changes nothing visible fails the check.
- **You do not know what the screen looks like today.** The off state is the whole point. Ask for it.
- **There are more than about ten switches.** A reviewer cannot hold more. Propose one prototype per area.

## Procedure

1. **Choose the journey.** The three to six screens a reviewer walks through, in order. Write it down as `journey`.
2. **Build every screen as it is today**, with all switches off. Use the kit classes so it looks like an app, not a wireframe. Use realistic, clearly made-up data and keep it in one `state()` function.
3. **Add one switch per change.** For each: the ID from the PRD, a label of a few words, a note of one or two sentences saying what changes and why, and the screens it touches.
4. **Branch the screens on the switches.** Wrap each addition in `ctx.on("1.1")`. Give the added element `ctx.flag("1.1")` so it animates in, and `ctx.pin("1.1")` so it carries its number. When a switch replaces something, render the old version when it is off.
5. **Make every control answer.** A control on the journey navigates or acts. Anything else carries `data-toast-text` saying what it would do: "Opens saved payment methods." No dead taps.
6. **Make the journey finishable** with every switch off, with every switch on, and under each preset. If today's product has a dead end that a change fixes, keep the dead end and give it today's way out.
7. **Add presets:** Today (nothing on), the first release (the IDs in the first rollout row), Everything. Add `paths` so each screen can be opened directly.
8. **Label what is made up.** Set `legal` to one or two sentences: it is a concept, and which data is illustrative. Put a short line on the first screen too.
9. **Check.** Run `node scripts/check.mjs spec.js --prd prd.json`, or without `--prd` when the changes did not come from a `prd.json`. Fix every failure. Read the warnings.
10. **Build.** Run `node scripts/build.mjs spec.js prototype.html`. Without Node, copy `assets/template.html`, replace everything between `SPEC START` and `SPEC END` with the spec, and change `export default` to `const spec =`.

## Rules that keep it honest

- **Off is today.** Never improve the current product in the off state, even where it is embarrassing. The comparison is the deliverable.
- **One change per switch.** If turning a switch on changes two unrelated things, it is two points.
- **Same numbers as the PRD.** Never renumber. If the PRD has a point with no screen, skip it and say so.
- **Deterministic data.** No random values, no dates read from the clock, no network. The same link must show the same thing to everyone. When a change depends on time ("ten minutes before it ends"), freeze the moment in `state()` and say so on the screen: "It is 15:30 in this prototype."
- **Switches that meet on one control.** When two changes touch the same element, each must still do something visible alone. Draw the element for every combination, and say in each switch's note what it adds when the other is already on.
- **A sketch, not a design.** Do not spend effort on pixel polish beyond the kit. Reviewers should argue about scope, not spacing.

## Handing over

Tell the user:

- the file, the number of screens and switches, and the result of each check;
- any PRD point left out and why;
- every assumption you made about the product today;
- two or three links worth sending: the address carries the state, as `prototype.html#basket?on=1.1,2.1`;
- that the first thing to do is compare the Today preset with the live product.

A worked example is in [examples/tangelo/](examples/tangelo/): a five-screen, six-switch spec for a fictional grocery app.
