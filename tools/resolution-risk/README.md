# resolution-risk

Scores prediction market resolution criteria by how likely they are to produce
a dispute.

The premise, which is also the thesis of Essay 1 in
[PLAN-30-DAYS.md](../../PLAN-30-DAYS.md): most disputes are not oracle failures.
They are writing failures. The oracle answered the question correctly. The
question was badly written.

If that is true, dispute risk is detectable before the event resolves, by
reading the sentence rather than modelling the outcome. This tool tests that.

## Run it

```bash
npm run risk                 # scan the synthetic fixture corpus
npm run risk:test            # pin the rule table against fixtures
node tools/resolution-risk/scan.mjs --help
```

Useful flags:

```bash
--source polymarket --limit 100   # live public Gamma API, needs open network
--source kalshi                   # live public Kalshi API
--file ./markets.json             # your own corpus
--top 10 --verbose                # the ten worst, with excerpts and fixes
--evidence                        # markdown evidence block for an article draft
--json                            # machine readable
```

`--evidence` is the one that matters for content. It emits the before/after
scaffold that PLAN-30-DAYS calls the shareable artifact, with the "before"
filled in and the "after" left as a TODO. The scanner finds the hole. You write
the rewrite, because the rewrite is the part that demonstrates judgement.

## What it actually does

Fifteen rules, each encoding one historically dispute-causing hole in a criteria
sentence. Examples:

| Rule | The hole |
|---|---|
| `undefined-threshold` | "major", "significant", "widely reported" with no number behind it |
| `no-tie-clause` | Asks whether A beats B, silent on A equals B |
| `revision-risk` | Resolves on data that gets revised, with no "as first published" clause |
| `missing-null-case` | Contingent on an event that might simply never happen |
| `discretionary-escape-hatch` | Defers to a human, which is the criteria admitting it is incomplete |
| `single-source-fragility` | One URL, no fallback, and the market outlives the page |

Full table with severities and suggested fixes: [lib/rules.mjs](./lib/rules.mjs).

Each rule contributes a weight, weights sum to a 0-100 score, and the score
bands into LOW / MEDIUM / HIGH / CRITICAL.

## What it is not

**The score is not a probability.** It is a ranking device so a human reads the
worst ten criteria first instead of all four hundred. Presenting it as "this
market has a 67% chance of being disputed" would be false and would deserve to
be torn apart in the comments.

**It has no ground truth yet.** The honest next step is backtesting against
markets that actually got disputed. Polymarket's UMA disputes are onchain and
public, which makes the labelled dataset obtainable. Until that exists, this is
a well-reasoned heuristic and should be described as one.

**It reads sentences, not markets.** A market can score 0 and still be a bad
market for reasons no regex will see.

## Fixtures are synthetic

[`fixtures/markets.json`](./fixtures/markets.json) is hand-written to exercise
the rule table. None of those entries are real listings on any venue, and none
are drawn from Crypto.com. Do not publish findings from the fixture corpus as
observations about a real market. Point it at a live source for real data.

Two fixtures (`fx-001`, `fx-013`) are deliberately well-written and must score
0. They are the control group, and `test.mjs` fails if either starts firing
rules, which is the early warning that a regex got too greedy.

## Adding a rule

1. Add it to `RULES` in `lib/rules.mjs` with `why` and `fix` populated. Both
   strings end up in reader-facing output, so write them like you would write
   them in the essay.
2. Add a fixture that triggers it to `fixtures/markets.json`.
3. Add the expectation to `EXPECT` in `test.mjs`.
4. `npm run risk:test`. It fails if any rule is never exercised by a fixture.

## Where this goes

- **Essay**: "The resolution criteria are the product." The scanner supplies the
  frequency table, you supply the rewrite and the war story.
- **Demo**: 90 seconds of the terminal filling with CRITICAL rows next to the
  live market page. Start mid-scan, no intro.
- **Backtest**: the version with real teeth. UMA dispute history as labels,
  measure whether the score separates disputed from undisputed markets. If it
  does not, that finding is more interesting than if it does.
