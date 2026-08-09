# LinkedIn atoms

Each file is one post. Everything outside the `## Draft` section is notes.

```bash
npm run content:check posts/01-resolution-risk-scanner.md   # the gate
npm run linkedin -- posts/01-resolution-risk-scanner.md     # exact paste + fold
npm run linkedin:list                                       # queue at a glance
npm run linkedin -- posts/01-resolution-risk-scanner.md --raw | pbcopy
```

The dashboard at `/dashboard` also reads this directory, scores every post, and
gives you a copy button.

## The queue

Ordered so the two demos land first. They are the only pieces here that prove
something rather than assert it, and everything after them borrows their credibility.
Filenames collide on a couple of numbers (`02`, `04`, `06`, `09`, `10`) because this
set merged two independently-numbered batches — the number is a display hint, not
a unique key. Use the filename to disambiguate.

| File | Pillar | Derived from | Status |
|---|---|---|---|
| [01-resolution-risk-scanner](./01-resolution-risk-scanner.md) | Prototype in public | `tools/resolution-risk` | ready |
| [02-calibration-ledger](./02-calibration-ledger.md) | Prototype in public | `scripts/ledger` | ready |
| [02-pm-opens-prs](./02-pm-opens-prs.md) | agents | standalone | ready |
| [03-gate-rejected-my-drafts](./03-gate-rejected-my-drafts.md) | How I build | `WRITING.md` | ready |
| [04-the-fold-tax](./04-the-fold-tax.md) | How I build | `scripts/lib/linkedin.mjs` | ready |
| [04-ai-partnership-lessons](./04-ai-partnership-lessons.md) | agents | standalone | ready |
| [05-settle-explainer-test](./05-settle-explainer-test.md) | Field notes | `articles/01` | ready |
| [06-prototype-productionize](./06-prototype-productionize.md) | Field notes | `articles/03` | ready |
| [06-gen-media-product-lens](./06-gen-media-product-lens.md) | shipping | standalone | ready |
| [07-thin-markets](./07-thin-markets.md) | Field notes | `articles/06` | ready |
| [08-tuesday-after-the-final](./08-tuesday-after-the-final.md) | Field notes | `articles/02` | **held** |
| [09-rewards-day-31](./09-rewards-day-31.md) | Field notes | `articles/04` | **held** |
| [09-resolution-linter](./09-resolution-linter.md) | markets | `articles/07` + demo | ready |
| [10-compliance-as-input](./10-compliance-as-input.md) | Field notes | `articles/05` | **held** |
| [10-farm-lab](./10-farm-lab.md) | markets | `articles/04` + demo | ready |
| [11-calibration-lab](./11-calibration-lab.md) | agents | `articles/08` + demo | ready |
| [12-liquidity-budget](./12-liquidity-budget.md) | markets | `articles/06` + demo | ready |
| [13-restyle-lab](./13-restyle-lab.md) | media | `articles/11` + demo | ready |
| [14-retention-curve](./14-retention-curve.md) | media | `articles/12` + demo | ready |
| [15-workflow-roi](./15-workflow-roi.md) | growth | `articles/13` + demo | ready |
| [16-reach-exit-tax](./16-reach-exit-tax.md) | growth | `articles/14` | ready |
| [17-gate-drift](./17-gate-drift.md) | agents | `articles/15` + demo | ready |

13 through 17 are the diversification pass's atoms, one per new essay (11-15). All follow
the `## Draft` / `## First comment` shape below to the letter; a couple of the older atoms
above it predate that convention and the gate flags them for it (`draft`, not blocking).

The exact publish dates live in [`../content/schedule.json`](../content/schedule.json).

## Held drafts

Posts marked **held** carry `{{ }}` slots and the gate will not pass them. That is
the system working, not a bug.

Each needs one operating number that only you have: a peak-day to second-Tuesday
ratio, a day-31 retention figure, a rebuild multiple. Every slot is written to be
satisfiable with a **ratio or a band**, so nothing confidential leaves the
building. Nothing in this repo will invent those numbers to make a draft pass.

To ship one: fill the `{{ }}` slots, delete the braces, set `status: ready`,
re-run the gate.

## Status flow

```
draft  ->  ready  ->  compliance-checked  ->  scheduled  ->  published
           ^                                  ^
           gate passes                        publisher picks it up
```

`ready` means the mechanical gate passes. It does not mean you have read it again
with your employer in mind. That is the `compliance-checked` step, and it is a
human one.

## Publishing

LinkedIn stays manual by design. Personal-profile posting needs an approved app
with `w_member_social`, which is not worth blocking a content system on. Set
`status: scheduled` and the publisher prepares the paste rather than pretending
to post:

```bash
npm run publish -- --now <slug>     # writes .publish/linkedin/<slug>.txt
```

It hard-fails on anything over 3,000 characters, anything with markdown left in
it, and anything with unfilled slots. Post the body, then post the first comment
immediately after.

## Posting mechanics

Distribution notes only. None of this is a reason to write worse.

- **Link goes in the first comment, never the post body.** An outbound link in the
  body costs about 60% of reach.
- **Post 30 to 60 minutes before you can actually reply.** Engagement quality in
  the first hour is a core reach signal, and a post you cannot service is wasted.
- **A demo GIF beats a screenshot.** Dwell time is the strongest signal in the
  ranking now: 0 to 3 seconds gets about 1.2% engagement, 61+ seconds about 15.6%.
  A 40-second screen capture buys those seconds honestly.

Sources for the above are in `../research/SOURCES.md`.

## Adding an atom

Start from the source, never from a blank page. Find the essay or the tool the
atom comes from, put it in `derivedFrom:`, and pick an angle the source does not
already spend. The gate fails an atom that reprints more than 12% of its source.

If the idea has no source yet, it belongs in `../ideas/idea-bank.md` until it does.
