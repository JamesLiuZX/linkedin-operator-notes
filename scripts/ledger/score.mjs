// scripts/ledger/score.mjs
// Proper scoring rules, calibration decomposition, and the anchoring measure.
//
// The market's closing price is the benchmark. Beating the market is hard and
// mostly not the point; the interesting number is whether the model is
// *calibrated*, and whether the blind arm is calibrated without the price.

const EPS = 1e-6;
const clip = (p) => Math.min(1 - EPS, Math.max(EPS, p));

export const brier = (p, outcome) => (clip(p) - outcome) ** 2;

export const logLoss = (p, outcome) => {
  const q = clip(p);
  return -(outcome * Math.log(q) + (1 - outcome) * Math.log(1 - q));
};

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/**
 * Murphy's three-term decomposition of the Brier score:
 *
 *   BS = reliability - resolution + uncertainty
 *
 * reliability  how far predicted probabilities sit from observed frequencies
 *              (lower is better; this is calibration)
 * resolution   how much the forecasts separate outcomes from the base rate
 *              (higher is better; this is discrimination)
 * uncertainty  the base rate's own variance, which no forecaster controls
 *
 * A model can have a decent Brier score purely by predicting the base rate. The
 * decomposition is what tells the two apart.
 */
export function decompose(pairs, bins = 10) {
  if (!pairs.length) return null;
  const base = mean(pairs.map((x) => x.outcome));
  const buckets = new Map();

  for (const { p, outcome } of pairs) {
    const idx = Math.min(bins - 1, Math.floor(clip(p) * bins));
    if (!buckets.has(idx)) buckets.set(idx, []);
    buckets.get(idx).push({ p, outcome });
  }

  let reliability = 0;
  let resolution = 0;
  const table = [];

  for (const [idx, group] of [...buckets.entries()].sort((a, b) => a[0] - b[0])) {
    const meanP = mean(group.map((x) => x.p));
    const observed = mean(group.map((x) => x.outcome));
    const weight = group.length / pairs.length;
    reliability += weight * (meanP - observed) ** 2;
    resolution += weight * (observed - base) ** 2;
    table.push({
      bin: `${(idx / bins).toFixed(1)}-${((idx + 1) / bins).toFixed(1)}`,
      n: group.length,
      predicted: Number(meanP.toFixed(4)),
      observed: Number(observed.toFixed(4)),
      gap: Number((meanP - observed).toFixed(4)),
    });
  }

  return {
    reliability: Number(reliability.toFixed(5)),
    resolution: Number(resolution.toFixed(5)),
    uncertainty: Number((base * (1 - base)).toFixed(5)),
    baseRate: Number(base.toFixed(4)),
    table,
  };
}

function summarize(pairs) {
  if (!pairs.length) return null;
  return {
    n: pairs.length,
    brier: Number(mean(pairs.map((x) => brier(x.p, x.outcome))).toFixed(5)),
    logLoss: Number(mean(pairs.map((x) => logLoss(x.p, x.outcome))).toFixed(5)),
    meanProb: Number(mean(pairs.map((x) => x.p)).toFixed(4)),
    calibration: decompose(pairs),
  };
}

/**
 * @param scored  [{ arm, probability, marketProb, outcome }]
 * Only rows with outcome 0 or 1 are scorable; voided markets are dropped.
 */
export function scoreAll(scored) {
  const usable = scored.filter((r) => r.outcome === 0 || r.outcome === 1);
  const byArm = {};

  for (const arm of new Set(usable.map((r) => r.arm))) {
    const rows = usable.filter((r) => r.arm === arm);
    byArm[arm] = summarize(rows.map((r) => ({ p: r.probability, outcome: r.outcome })));
  }

  const marketRows = [];
  const seen = new Set();
  for (const r of usable) {
    const key = `${r.venue}:${r.marketId}`;
    if (seen.has(key) || r.marketProb === null) continue;
    seen.add(key);
    marketRows.push({ p: r.marketProb, outcome: r.outcome });
  }
  const market = summarize(marketRows);

  const skill = {};
  for (const [arm, stats] of Object.entries(byArm)) {
    if (stats && market) {
      // Brier skill score: >0 means the arm beat the market, 0 means it tied.
      skill[arm] = Number((1 - stats.brier / market.brier).toFixed(4));
    }
  }

  return { byArm, market, skill, anchoring: anchoring(usable), dropped: scored.length - usable.length };
}

/**
 * The headline measurement.
 *
 * `meanDistance` is how far each arm lands from the market price. If the
 * anchored arm sits much closer than the blind arm, the price is doing the
 * work. `independence` is the blind arm's distance as a multiple of the
 * anchored arm's: near 1 means the price added nothing, and large means the
 * model's own view differs sharply from the market's.
 */
export function anchoring(rows) {
  const paired = new Map();
  for (const r of rows) {
    if (r.marketProb === null) continue;
    const key = `${r.venue}:${r.marketId}:${r.asOf}`;
    if (!paired.has(key)) paired.set(key, {});
    paired.get(key)[r.arm] = r;
  }

  const both = [...paired.values()].filter((x) => x.anchored && x.blind);
  if (!both.length) return null;

  const anchoredGap = mean(both.map((x) => Math.abs(x.anchored.probability - x.anchored.marketProb)));
  const blindGap = mean(both.map((x) => Math.abs(x.blind.probability - x.blind.marketProb)));
  const armGap = mean(both.map((x) => Math.abs(x.anchored.probability - x.blind.probability)));

  return {
    n: both.length,
    meanDistanceToMarket: {
      anchored: Number(anchoredGap.toFixed(4)),
      blind: Number(blindGap.toFixed(4)),
    },
    meanArmDisagreement: Number(armGap.toFixed(4)),
    independence: anchoredGap > 0 ? Number((blindGap / anchoredGap).toFixed(3)) : null,
  };
}
