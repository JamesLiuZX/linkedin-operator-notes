// scripts/ledger/report.mjs
// Renders the scoreboard as markdown. This is the artifact people link to.

const pct = (x) => (x === null || x === undefined ? 'n/a' : `${(x * 100).toFixed(1)}%`);
const n4 = (x) => (x === null || x === undefined ? 'n/a' : x.toFixed(4));

function armTable(byArm, market, skill) {
  const rows = [];
  for (const [arm, s] of Object.entries(byArm)) {
    if (!s) continue;
    rows.push(
      `| ${arm} | ${s.n} | ${n4(s.brier)} | ${n4(s.logLoss)} | ${n4(s.calibration?.reliability)} | ${n4(s.calibration?.resolution)} | ${skill[arm] ?? 'n/a'} |`,
    );
  }
  if (market) {
    rows.push(`| **market close** | ${market.n} | ${n4(market.brier)} | ${n4(market.logLoss)} | ${n4(market.calibration?.reliability)} | ${n4(market.calibration?.resolution)} | 0 |`);
  }
  return [
    '| arm | n | Brier | log loss | reliability | resolution | skill vs market |',
    '|---|---:|---:|---:|---:|---:|---:|',
    ...rows,
  ].join('\n');
}

function reliabilityTable(calibration) {
  if (!calibration?.table?.length) return '_Not enough resolved forecasts yet._';
  return [
    '| bucket | n | predicted | observed | gap |',
    '|---|---:|---:|---:|---:|',
    ...calibration.table.map(
      (r) => `| ${r.bin} | ${r.n} | ${pct(r.predicted)} | ${pct(r.observed)} | ${r.gap > 0 ? '+' : ''}${(r.gap * 100).toFixed(1)}pp |`,
    ),
  ].join('\n');
}

export function renderReport({ scores, head, counts, generatedAt, commit }) {
  const { byArm, market, skill, anchoring, dropped } = scores;
  const lines = [];

  lines.push('# Calibration Ledger');
  lines.push('');
  lines.push(
    `An LLM forecasting live public prediction markets, scored against real resolutions. Two arms: one sees the market price, one does not.`,
  );
  lines.push('');
  lines.push(`- Forecasts logged: **${counts.forecasts}**`);
  lines.push(`- Markets resolved: **${counts.resolutions}**`);
  lines.push(`- Scored pairs: **${byArm.anchored?.n ?? 0} anchored / ${byArm.blind?.n ?? 0} blind**${dropped ? ` (${dropped} dropped as voided)` : ''}`);
  lines.push(`- Log head: \`${head.slice(0, 16)}\``);
  if (commit) lines.push(`- Commit: \`${commit}\``);
  lines.push(`- Generated: ${generatedAt}`);
  lines.push('');
  lines.push('The log is append-only and hash-chained. Every record carries the hash of the one before it, so a forecast edited after resolution breaks the chain and `npm run ledger -- verify` fails.');
  lines.push('');

  lines.push('## Scores');
  lines.push('');
  lines.push('Lower Brier and log loss are better. Lower reliability is better (it measures how far predictions sit from observed frequencies). Higher resolution is better. Skill above 0 means the arm beat the market close.');
  lines.push('');
  lines.push(armTable(byArm, market, skill));
  lines.push('');

  lines.push('## Anchoring');
  lines.push('');
  if (!anchoring) {
    lines.push('_Not enough paired forecasts yet._');
  } else {
    lines.push(`Across ${anchoring.n} markets forecast by both arms:`);
    lines.push('');
    lines.push(`- Anchored arm sits **${pct(anchoring.meanDistanceToMarket.anchored)}** from the market price on average`);
    lines.push(`- Blind arm sits **${pct(anchoring.meanDistanceToMarket.blind)}** away`);
    lines.push(`- The two arms disagree with each other by **${pct(anchoring.meanArmDisagreement)}**`);
    lines.push(`- Independence ratio: **${anchoring.independence ?? 'n/a'}**`);
    lines.push('');
    lines.push('An independence ratio near 1 means showing the model the price changed nothing. A large ratio means the anchored arm is tracking the price rather than reasoning to its own answer. Read it alongside the skill scores above: an anchored arm that hugs the price will look competent and have taught you nothing.');
  }
  lines.push('');

  for (const [arm, s] of Object.entries(byArm)) {
    if (!s) continue;
    lines.push(`## Reliability, ${arm} arm`);
    lines.push('');
    lines.push('Predicted versus observed frequency per probability bucket. A positive gap in the high buckets is overconfidence.');
    lines.push('');
    lines.push(reliabilityTable(s.calibration));
    lines.push('');
  }

  lines.push('## Method');
  lines.push('');
  lines.push('Selection is pre-registered: markets are filtered by published criteria, then ordered by `sha256(date:venue:id)` and taken in that order. Nothing is chosen after the model has seen it. See `data/ledger/PREREGISTRATION.md`.');
  lines.push('');
  lines.push('Takeaway: a forecast is only evidence if it was written down before the outcome and cannot be edited after it.');
  lines.push('');

  return lines.join('\n');
}
