# Calibration Ledger

An LLM forecasting live public prediction markets, scored in public against real
resolutions, in an append-only log that cannot be quietly edited afterwards.

Two arms run on every market: **anchored** sees the current market price,
**blind** does not. The delta between them measures how much of the model's
apparent skill is borrowed from the price. That measurement is the point of the
project. See [`data/ledger/PREREGISTRATION.md`](../../data/ledger/PREREGISTRATION.md).

## Commands

```bash
npm run ledger -- verify-venue --venue manifold   # check the live API shape FIRST
npm run ledger -- forecast --venue manifold       # select, run both arms, append
npm run ledger -- resolve                         # pull outcomes for open forecasts
npm run ledger -- score                           # Brier, calibration, anchoring
npm run ledger -- report                          # render data/ledger/REPORT.md
npm run ledger -- verify                          # walk the hash chain
npm run ledger:test                               # offline self-test
```

Useful flags on `forecast`: `--limit N` (markets per venue), `--effort low|medium|high|xhigh|max`,
`--no-research` (skip web search), `--dry-run` (selection only), `--date YYYY-MM-DD`
(the selection seed; defaults to today UTC).

## Run it offline

Everything except `forecast` works with no network and no API key. The `fixture`
venue exercises selection, resolution, scoring, and reporting end to end:

```bash
npm run ledger -- forecast --venue fixture --date 2026-07-27 --dry-run
LEDGER_DIR=/tmp/ledger-sandbox npm run ledger -- score
```

`LEDGER_DIR` redirects reads and writes to a throwaway log. Leave it unset for
the real ledger.

## Before the first live run

**Verify the venue adapters.** The field mappings in `venues.mjs` were written
from each venue's documented response shape and have not been confirmed against
a live response. Run `verify-venue` first; if it reports missing fields, fix that
venue's `map` function before forecasting against it. A silently wrong price
field would poison the log, and the log is the whole asset.

Set credentials the usual way (`ANTHROPIC_API_KEY`, or `ant auth login`).

## Files

| File | Role |
|---|---|
| `log.mjs` | append-only hash-chained JSONL, plus tamper detection |
| `venues.mjs` | read-only public venue adapters, normalized to one shape |
| `select.mjs` | the pre-registered, deterministic selection rule |
| `forecast.mjs` | the two-arm forecaster |
| `score.mjs` | Brier, log loss, Murphy decomposition, anchoring |
| `report.mjs` | renders the public scoreboard |
| `index.mjs` | CLI |
| `selftest.mjs` | offline tests for everything above |

## Operating rules

1. **Commit after every run.** An uncommitted forecast is not a public forecast.
   The hash chain catches careless edits; the git history is what makes a
   wholesale rewrite visible.
2. **Do not loosen the selection criteria to get a hit.** A day with no eligible
   markets publishes nothing. Changing the criteria changes `criteriaHash` on
   every later record, which is the intended signal, not a workaround.
3. **One forecast per arm per market per run.** A failed run appends what it
   produced. It is not re-run for a better answer.
4. **Nothing is a finding under 100 resolved forecasts per arm.** Below that the
   error bars swallow any claim.

Takeaway: the ledger is only worth anything because it was written down first and
cannot be edited after.
