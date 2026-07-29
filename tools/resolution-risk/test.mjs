#!/usr/bin/env node
// tools/resolution-risk/test.mjs
// Pins the rule table against the fixture corpus.
//
// The failure mode this guards against: you loosen one regex to catch a market
// you saw in the wild, and three other rules start firing on everything. A rule
// table with no tests degrades into a noise generator within about a week.
//
// Run: node tools/resolution-risk/test.mjs

import { loadFixtures } from './lib/sources.mjs';
import { scoreMarket } from './lib/score.mjs';
import { RULES } from './lib/rules.mjs';

// Each fixture declares which rules it was written to trigger.
// `clean` fixtures must trigger nothing at all.
const EXPECT = {
  'fx-001-clean-price': { clean: true },
  'fx-013-good-event': { clean: true },
  'fx-002-vague-price': { must: ['price-precision'], thin: true },
  'fx-003-macro-revision': { must: ['revision-risk'] },
  'fx-004-ambiguous-actor': { must: ['ambiguous-actor', 'no-named-source'] },
  'fx-005-no-tie': { must: ['no-tie-clause'] },
  'fx-006-thin': { thin: true },
  'fx-007-compound': { must: ['compound-condition'] },
  'fx-008-discretion': { must: ['discretionary-escape-hatch', 'undefined-threshold'] },
  'fx-009-counting': { must: ['undefined-counting'] },
  'fx-010-relative-date': { must: ['relative-date', 'single-source-fragility'] },
  'fx-011-negation': { must: ['negation-ambiguity'] },
  'fx-012-null-case': { must: ['missing-null-case'] },
};

const failures = [];
function check(cond, msg) {
  if (!cond) failures.push(msg);
}

const markets = await loadFixtures();

// Every rule id referenced by the expectations must actually exist.
const known = new Set(RULES.map((r) => r.id));
for (const [id, exp] of Object.entries(EXPECT)) {
  for (const rid of exp.must || []) {
    check(known.has(rid), `${id}: expectation names unknown rule "${rid}"`);
  }
}

check(
  markets.length === Object.keys(EXPECT).length,
  `fixture count ${markets.length} does not match expectation count ${Object.keys(EXPECT).length}, add the new fixture to EXPECT`,
);

for (const market of markets) {
  const exp = EXPECT[market.id];
  if (!exp) {
    failures.push(`${market.id}: no expectation declared`);
    continue;
  }
  const res = scoreMarket(market);
  const fired = new Set(res.findings.map((f) => f.id));

  if (exp.clean) {
    check(
      res.findings.length === 0,
      `${market.id}: expected zero findings, got [${[...fired].join(', ')}]`,
    );
    check(res.score === 0, `${market.id}: expected score 0, got ${res.score}`);
  }

  for (const rid of exp.must || []) {
    check(fired.has(rid), `${market.id}: expected rule "${rid}" to fire, fired [${[...fired].join(', ')}]`);
  }

  if (exp.thin) {
    check(res.thin, `${market.id}: expected to be flagged thin`);
  }

  check(res.score >= 0 && res.score <= 100, `${market.id}: score ${res.score} out of range`);
  check(typeof res.band === 'string' && res.band.length > 0, `${market.id}: missing band`);
}

// Every rule should be exercised by at least one fixture, otherwise it is
// untested and probably wrong.
const everFired = new Set();
for (const m of markets) for (const f of scoreMarket(m).findings) everFired.add(f.id);
for (const r of RULES) {
  check(everFired.has(r.id), `rule "${r.id}" is never triggered by any fixture, add one`);
}

if (failures.length) {
  console.error(`\n resolution-risk: ${failures.length} failure(s)\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error('');
  process.exit(1);
}

console.log(`\n resolution-risk: all checks passed (${markets.length} fixtures, ${RULES.length} rules)\n`);
