# Calibration Ledger, pre-registration

This document is the commitment. It is written before the ledger accumulates
enough data to say anything, and it is version controlled so that any later
change to the rules is visible in the diff.

The point of a pre-registration is narrow and unglamorous: it removes the
degrees of freedom that would otherwise let me produce whatever calibration
curve I wanted after the fact. A forecasting track record without one is a
selection of screenshots.

## The claim being tested

**H1 (calibration).** An LLM producing probability estimates on live binary
markets is overconfident at the tails: in the 0.9 to 1.0 bucket it resolves YES
less often than it predicts.

**H2 (anchoring).** The model's apparent skill is largely borrowed from the
market price. Specifically, an arm shown the current price will sit far closer
to that price than an arm that is not, and the blind arm will score
substantially worse.

H2 is the one worth running. Everyone assumes it. Nobody has published the
measurement.

If H2 is false (the blind arm is calibrated and roughly as accurate), that is
the more interesting result and gets published just as loudly.

## Design

Two arms, same model, same market, same day:

| Arm | Sees the market price | Purpose |
|---|---|---|
| `anchored` | yes | the realistic setting, and the one everyone demos |
| `blind` | no | measures whether the model has an independent view |

The blind prompt is built by a separate function from the anchored one and is
given no field that could carry a price, volume, or consensus hint. See
`scripts/ledger/forecast.mjs`.

## Selection rule

Fixed in `scripts/ledger/select.mjs` as `DEFAULT_CRITERIA`. A market is eligible
when all of the following hold at run time:

| Criterion | Value | Why |
|---|---|---|
| Market price | between 0.05 and 0.95 | outside this band the question has effectively decided |
| Time to close | 1 to 90 days | far enough out to be a forecast, near enough to score inside a quarter |
| Volume | at least 1000 venue-native units | thin markets are noise |
| Type | binary, unresolved | multi-outcome markets are a different scoring problem |

Eligible markets are then ordered by `sha256(runDate:venue:marketId)` and the
first 5 per venue are taken. The run date is the only seed, so the selection is
reproducible by anyone with the same date and market universe.

Nothing in the selection path reads the model's output. Selection happens before
any forecast is made.

The criteria are hashed into every forecast record as `criteriaHash`. If I ever
change them, forecasts made under the old rules stay distinguishable from
forecasts made under the new ones, and the mixed period can be excluded.

## Scoring

- **Brier score**, mean squared error of the probability. Primary metric.
- **Log loss**, which punishes confident errors harder. Secondary.
- **Murphy decomposition** into reliability, resolution, and uncertainty.
  Reliability is calibration; resolution is discrimination. Reporting only the
  Brier score hides a forecaster who does nothing but predict the base rate.
- **Benchmark**: the market's own price at the time of the forecast, scored on
  the same resolutions. Skill is reported relative to that.

Markets that resolve void, cancelled, or partial (Manifold `MKT`, for example)
are recorded and excluded from scoring rather than being coerced into a 0 or 1.
The count of dropped markets is published alongside the scores.

## What would make this ledger worthless

Stated up front, because they are the failure modes I would otherwise be tempted
to paper over:

1. **Editing the log.** Every record is hash-chained to the one before it and
   `npm run ledger -- verify` walks the chain. The chain is necessary but not
   sufficient: someone could rewrite the whole log and re-chain it. That is why
   the log is committed to git after every run and the commit hash is published
   on the report. The git history is the real tamper evidence; the chain just
   makes accidental corruption loud.
2. **Selecting markets after seeing them.** Addressed by the rule above. If a
   run produces no eligible markets, the correct response is to publish nothing
   that day, not to loosen the criteria.
3. **Retrying a bad forecast.** One forecast per arm per market per run. A run
   that fails mid-way appends what it produced; it is not re-run to get a
   different answer.
4. **Quietly dropping a venue that scores badly.** Venue is a field on every
   record. Per-venue breakdowns are available from the raw log whether or not
   they flatter the model.
5. **Changing the model or effort mid-run and comparing across it.** Both are
   stamped on every record. Comparisons are made within a model and effort
   level, or the change is called out.

## Sample size

Nothing gets published as a finding before **100 resolved forecasts per arm**.
Below that the confidence intervals on a Brier score are wide enough that any
claim is storytelling. Interim reports may show the running numbers, clearly
marked as interim.

## Cadence

Forecasts run daily. Resolutions are polled daily. The report regenerates on
every run. All three are committed.

Takeaway: the rules were fixed before the data arrived, and the diff will show
if they ever moved.
