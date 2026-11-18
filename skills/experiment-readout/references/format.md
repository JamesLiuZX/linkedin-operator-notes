# The file formats

Two files: the input you write for the script, and the readout you assemble from its output. The examples come from an invented test in a library app. They are there for shape, not content.

## Contents

- [The input: results.json](#the-input-resultsjson)
- [The readout: readout.json](#the-readout-readoutjson)
- [What the script puts in numbers](#what-the-script-puts-in-numbers)
- [How each figure is computed](#how-each-figure-is-computed)

## The input: results.json

```json
{
  "test": {
    "name": "Renewal reminder by text",
    "hypothesis": "A text two days before the due date gets more loans renewed on time.",
    "unit": "members with a loan due",
    "planned_split": [0.5, 0.5],
    "planned_days": 28,
    "ran_days": 28,
    "start": "2026-02-02",
    "end": "2026-03-01",
    "mde_set": 0.02,
    "alpha": 0.05
  },
  "arms": [
    { "name": "Control", "users": 9120 },
    { "name": "Text reminder", "users": 9087 }
  ],
  "primary": { "name": "Renewed on time", "direction": "up", "counts": [5381, 5644] },
  "guardrails": [
    { "name": "Opted out of messages", "harm": "up", "counts": [91, 118], "tolerance": 0.005 },
    { "name": "Loans with a late fee", "harm": "up", "counts": [640, 590], "denominators": [9120, 9087], "tolerance": 0.01 }
  ]
}
```

| Field | Meaning |
|---|---|
| `test.planned_split` | The intended share of users in each arm. Two numbers that add to 1 |
| `test.planned_days`, `test.ran_days` | How long it was meant to run, and how long it did |
| `test.mde_set` | The smallest absolute effect worth shipping, as a proportion (0.02 is two points). `null` if nobody set one before the test |
| `test.alpha` | The significance level. Use 0.05 unless the team set another |
| `arms` | Control first, then the variant. Exactly two |
| `primary.direction` | `up` if more is better, `down` if less is better |
| `primary.counts` | Conversions in each arm, in the same order as `arms` |
| `guardrails[].harm` | `up` if a rise is harmful, `down` if a fall is harmful |
| `guardrails[].denominators` | Optional. The base for this metric in each arm when it is not all users, for example orders |
| `guardrails[].tolerance` | The largest harmful absolute change the team would accept, as a proportion |

Every rate is a proportion between 0 and 1. The script rejects a count larger than its denominator.

## The readout: readout.json

```json
{
  "title": "Renewal reminder by text: readout",
  "date": "2026-03-03",
  "headline": "Ship. On-time renewals rose 3.1 points and no guardrail got worse.",
  "summary": "Two to four plain sentences: what happened to the main metric, what the guardrails did, and why that leads to the decision.",
  "next": ["A concrete step.", "Another."],
  "numbers": {}
}
```

- `headline` starts with the decision in words: `Ship`, `Extend`, `Stop` or `Do not trust`. It has to match `numbers.verdict.decision`.
- `summary` and `next` use only figures that appear in `numbers`. The checker compares them.
- `numbers` is the script's output, pasted in whole and unchanged.

## What the script puts in numbers

```json
{
  "input": {},
  "checks": {
    "srm": { "expected": [], "observed": [], "chi2": 0.06, "p": 0.81, "threshold": 0.001, "pass": true },
    "duration": { "planned_days": 28, "ran_days": 28, "stopped_early": false, "full_weeks": true },
    "power": { "baseline": 0.59, "mde_abs": 0.0204, "mde_rel": 0.035, "mde_set": 0.02, "adequate": false }
  },
  "primary": { "name": "", "rates": [], "diff": 0.031, "lift": 0.053, "se": 0.007, "ci": [0.017, 0.045], "z": 4.3, "p": 0.00002, "result": "positive" },
  "guardrails": [{ "name": "", "rates": [], "diff": 0.003, "se": 0.001, "ci": [0.0, 0.006], "harm": "up", "tolerance": 0.005, "verdict": "unclear" }],
  "verdict": { "decision": "extend", "rule": "Rule 6: ...", "reasons": [] },
  "flags": []
}
```

- `primary.result` is `positive`, `negative` or `inconclusive`.
- A guardrail's `verdict` is `held`, `worse` or `unclear`.
- `verdict.reasons` are sentences the script wrote from the numbers. Use them as the base for your summary.
- `flags` are warnings: stopped early, not a whole number of weeks, no target effect set, many guardrails, a very small arm.

## How each figure is computed

| Figure | Method |
|---|---|
| Sample ratio | Pearson chi-square of the arm sizes against the planned split, one degree of freedom. It fails below p = 0.001 |
| Difference | Variant rate minus control rate |
| Interval | Wald interval on the difference with the unpooled standard error, at 1 minus alpha |
| p-value | Two-sided, from the pooled two-proportion z-test |
| Smallest detectable effect | At 80% power and two-sided alpha, from the control rate and the actual arm sizes |
| Main result | Positive if the whole interval is on the good side of zero, negative if it is all on the bad side, inconclusive otherwise |
| Guardrail | Worse if the whole interval is on the harmful side of zero. Held if the interval rules out a harmful change larger than the tolerance. Unclear otherwise |

The same arithmetic, in the same order, runs in `scripts/ab_stats.py` and in the demo on the handbook's site. `scripts/test_ab_stats.py` holds the tests.
