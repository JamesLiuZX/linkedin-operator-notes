---
title: "I built a forecasting scoreboard designed to make me look worse"
slug: 02-calibration-ledger
pillar: prototype-in-public
section: agents
status: ready
derivedFrom: scripts/ledger/README.md
publishAt: 2026-08-06T01:00:00Z
platforms: linkedin
tags: agents, forecasting, calibration
---

<!-- EVIDENCE
Claim: Most of an LLM forecaster's apparent skill on prediction markets is borrowed from the price it was shown, and you cannot tell how much without running a blind arm alongside the anchored one.
Moment: Reading yet another thread where a model "beat the market" on questions where the model had been handed the market price in its context window, with no control arm and no log anyone could audit.
Numbers: 2 arms per market, 19 passing self-tests, 1 hash-chained append-only log, Brier plus log loss plus a Murphy decomposition, selection rule fixed before any forecast is made.
Names: scripts/ledger, PREREGISTRATION.md, anchored arm, blind arm, Brier score, Murphy decomposition, Manifold.
Cost: I have not run it live yet. The venue adapters were written from documented response shapes and have not been confirmed against a real response, so the honest status is built and tested but not yet scored against reality.
Counterexample: If the blind arm turns out to match the anchored arm, the whole anchoring thesis is wrong and the ledger will say so in public, permanently, in a log I cannot quietly edit.
Reader action: Before believing any "my agent beats the market" claim, ask what the model saw. If it saw the price, that is not a forecast, it is a paraphrase.
-->

## Draft

I built a forecasting scoreboard designed to make me look worse.

Every market gets forecast twice by the same model. Arm 1 sees the live market price. Arm 2 sees the question and nothing else. The delta between the two arms is the only number I care about, because it measures how much of the model's apparent skill was borrowed from a price it was handed.

Most "my agent beats the market" threads never run that second arm. The model reads 68%, says 70%, and scores well against the thing it copied.

The other 4 design choices exist to stop me cheating later:

· The selection rule is fixed before any forecast runs, seeded by date, so I cannot pick 10 easy questions after seeing them.
· The log is append-only and hash-chained. Edit record 14 and the verify step fails on record 15.
· Scoring runs Brier, log loss, and a Murphy decomposition, so calibration and resolution stay separate instead of averaging into 1 flattering figure.
· 19 self-tests run offline, including 1 that edits a record after the fact purely to confirm the chain catches it.

All of it sits in scripts/ledger: 1,482 lines across 8 files, with 1 dependency.

The admission: I have not run it live yet. The Manifold and Polymarket adapters were written from documented response shapes and have not been confirmed against a real response. A silently wrong price field would poison the log, and the log is the entire asset, so verify-venue runs before the first real forecast.

Built, tested, not yet scored. That is the honest status on 2026-08-06, and posting it today is the point. A scoreboard is worth something only if it went public before the results did.

Takeaway: if a model saw the price, it did not forecast. It paraphrased.

## First comment

Pre-registration, scoring code, and the self-test suite: github.com/JamesLiuZX/linkedin-operator-notes/tree/master/scripts/ledger

The design note on why the blind arm exists is in PREREGISTRATION.md. If the anchoring gap comes back at zero, that is a published result too.
