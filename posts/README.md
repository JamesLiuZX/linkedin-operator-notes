# LinkedIn atoms

Short pieces for LinkedIn and X. Each one is **derived** from an essay in
`../articles/`, never composed independently. That rule is the whole reason the
voice stays consistent: an atom written from scratch has no evidence block behind
it and reads like content.

These never render as web pages, in any environment. They are working copy.
The dashboard at `/dashboard` reads them, scores them, and gives you a copy button.

All 12 currently score 100/100 on `npm run content:check`.

## The set

| # | File | Pillar | Derived from | Scheduled |
|---|---|---|---|---|
| 1 | [01-post-event-retention.md](./01-post-event-retention.md) | markets | articles/02 | Tue, week 4 |
| 2 | [02-pm-opens-prs.md](./02-pm-opens-prs.md) | agents | standalone | Thu, week 2 |
| 3 | [03-rewards-vs-farming.md](./03-rewards-vs-farming.md) | markets | articles/04 | Tue, week 8 |
| 4 | [04-ai-partnership-lessons.md](./04-ai-partnership-lessons.md) | agents | standalone | Tue, week 6 |
| 5 | [05-compliance-as-product.md](./05-compliance-as-product.md) | shipping | articles/05 | Thu, week 8 |
| 6 | [06-gen-media-product-lens.md](./06-gen-media-product-lens.md) | shipping | standalone | Thu, week 6 |
| 7 | [07-ai-trading-agent.md](./07-ai-trading-agent.md) | agents | articles/03 | Thu, week 4 |
| 8 | [08-three-trust-surfaces.md](./08-three-trust-surfaces.md) | markets | articles/01 | Tue, week 2 |
| 9 | [09-resolution-linter.md](./09-resolution-linter.md) | markets | articles/07 + demo | **Tue, week 1** |
| 10 | [10-farm-lab.md](./10-farm-lab.md) | markets | articles/04 + demo | Tue, week 3 |
| 11 | [11-calibration-lab.md](./11-calibration-lab.md) | agents | articles/08 + demo | Tue, week 5 |
| 12 | [12-liquidity-budget.md](./12-liquidity-budget.md) | markets | articles/06 + demo | Tue, week 7 |

The four demo drops (9 to 12) are the strongest, because each one points at
something the reader can open and poke. Start with 09.

The exact dates live in [`../content/schedule.json`](../content/schedule.json).

## Before posting

1. Edit it. These are drafts written to give you a starting shape, not final copy.
   Anything phrased as personal experience needs to be checked against yours.
2. Verify the numbers. Every figure traces to
   [`../research/SOURCES.md`](../research/SOURCES.md), but re-verify anything over
   90 days old before it goes out.
3. Compliance pass. No non-public metrics, no unreleased roadmaps.
4. `npm run content:check posts/your-file.md`

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
