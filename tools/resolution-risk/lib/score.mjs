// tools/resolution-risk/lib/score.mjs
// Turns rule hits into a 0-100 dispute-risk score.
//
// The score is deliberately coarse. It exists to rank a list of markets so a
// human reads the worst ten first. It is not a probability and should never be
// presented as one.

import { RULES, SEVERITY_WEIGHT, MIN_CRITERIA_WORDS } from './rules.mjs';

export const BANDS = [
  { name: 'CRITICAL', min: 60 },
  { name: 'HIGH', min: 35 },
  { name: 'MEDIUM', min: 15 },
  { name: 'LOW', min: 0 },
];

export function bandFor(score) {
  return BANDS.find((b) => score >= b.min).name;
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * @param {{id:string,question:string,criteria:string,venue?:string,url?:string}} market
 * @returns {{market:object,score:number,band:string,findings:Array,thin:boolean}}
 */
export function scoreMarket(market) {
  const criteria = (market.criteria || '').trim();
  const findings = [];

  const thin = wordCount(criteria) < MIN_CRITERIA_WORDS;

  for (const rule of RULES) {
    let hits;
    try {
      hits = rule.detect(criteria, market) || [];
    } catch {
      hits = [];
    }
    if (!hits.length) continue;
    findings.push({
      id: rule.id,
      label: rule.label,
      severity: rule.severity,
      why: rule.why,
      fix: rule.fix,
      weight: SEVERITY_WEIGHT[rule.severity],
      hits,
    });
  }

  // Each distinct rule counts once at full weight. Repeat hits of the same rule
  // add a small amount, because five undefined words is worse than one but not
  // five times worse.
  let raw = 0;
  for (const f of findings) {
    raw += f.weight + Math.min(f.hits.length - 1, 3) * 2;
  }

  // Thin criteria cannot be scored honestly by pattern matching, so it gets a
  // floor rather than a pass.
  if (thin) raw = Math.max(raw, SEVERITY_WEIGHT.high);

  const score = Math.max(0, Math.min(100, Math.round(raw)));

  const sorted = findings.sort(
    (a, b) => b.weight - a.weight || a.label.localeCompare(b.label),
  );

  return { market, score, band: bandFor(score), findings: sorted, thin };
}

export function scoreAll(markets) {
  return markets
    .map(scoreMarket)
    .sort((a, b) => b.score - a.score || a.market.id.localeCompare(b.market.id));
}

/** Aggregate rule frequency across a corpus. This is the number worth publishing. */
export function ruleFrequency(results) {
  const counts = new Map();
  for (const r of results) {
    for (const f of r.findings) {
      const cur = counts.get(f.id) || { id: f.id, label: f.label, severity: f.severity, markets: 0 };
      cur.markets += 1;
      counts.set(f.id, cur);
    }
  }
  return [...counts.values()].sort((a, b) => b.markets - a.markets);
}
