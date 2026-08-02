# LinkedIn atoms

Each file is one post. Everything outside the `## Draft` section is notes.

```bash
npm run content:check posts/01-resolution-risk-scanner.md   # the gate
npm run linkedin -- posts/01-resolution-risk-scanner.md     # exact paste + fold
npm run linkedin:list                                       # queue at a glance
npm run linkedin -- posts/01-resolution-risk-scanner.md --raw | pbcopy
```

## The queue

Ordered so the two demos land first. They are the only pieces here that prove
something rather than assert it, and everything after them borrows their credibility.

| # | File | Pillar | Derived from | Status |
|---|---|---|---|---|
| 1 | [01-resolution-risk-scanner](./01-resolution-risk-scanner.md) | Prototype in public | `tools/resolution-risk` | ready |
| 2 | [02-calibration-ledger](./02-calibration-ledger.md) | Prototype in public | `scripts/ledger` | ready |
| 3 | [03-gate-rejected-my-drafts](./03-gate-rejected-my-drafts.md) | How I build | `WRITING.md` | ready |
| 4 | [04-the-fold-tax](./04-the-fold-tax.md) | How I build | `scripts/lib/linkedin.mjs` | ready |
| 5 | [05-settle-explainer-test](./05-settle-explainer-test.md) | Field notes | `articles/01` | ready |
| 6 | [06-prototype-productionize](./06-prototype-productionize.md) | Field notes | `articles/03` | ready |
| 7 | [07-thin-markets](./07-thin-markets.md) | Field notes | `articles/06` | ready |
| 8 | [08-tuesday-after-the-final](./08-tuesday-after-the-final.md) | Field notes | `articles/02` | **held** |
| 9 | [09-rewards-day-31](./09-rewards-day-31.md) | Field notes | `articles/04` | **held** |
| 10 | [10-compliance-as-input](./10-compliance-as-input.md) | Field notes | `articles/05` | **held** |

## Held drafts

Posts 8, 9 and 10 carry `{{ }}` slots and the gate will not pass them. That is
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

## Adding an atom

Start from the source, never from a blank page. Find the essay or the tool the
atom comes from, put it in `derivedFrom:`, and pick an angle the source does not
already spend. The gate fails an atom that reprints more than 12% of its source.

If the idea has no source yet, it belongs in `../ideas/idea-bank.md` until it does.
