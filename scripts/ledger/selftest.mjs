#!/usr/bin/env node
// scripts/ledger/selftest.mjs
// Exercises everything that does not need the network or an API key: the hash
// chain and its tamper detection, pre-registered selection, the scoring rules,
// the anchoring measure, and the report renderer.
//
// Run with `npm run ledger:test`.

import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { append, readLog, verify, canonical } from './log.mjs';
import { select, eligible, criteriaHash, DEFAULT_CRITERIA } from './select.mjs';
import { brier, logLoss, decompose, scoreAll, anchoring } from './score.mjs';
import { renderReport } from './report.mjs';
import { getVenue } from './venues.mjs';

let passed = 0;
const failures = [];

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ok    ${name}`);
  } catch (err) {
    failures.push({ name, err });
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err.message}`);
  }
}

const NOW = new Date('2026-07-27T00:00:00Z');
const SEED = '2026-07-27';

// ---------------------------------------------------------------- log

await test('canonical() sorts keys so equal records hash equally', () => {
  assert.equal(canonical({ b: 1, a: [2, { d: 4, c: 3 }] }), canonical({ a: [2, { c: 3, d: 4 }], b: 1 }));
});

await test('append() chains records and verify() accepts the chain', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ledger-'));
  const path = join(dir, 'log.jsonl');
  try {
    await append(path, [{ kind: 'a' }, { kind: 'b' }]);
    await append(path, [{ kind: 'c' }]);
    const records = await readLog(path);
    assert.equal(records.length, 3);
    assert.deepEqual(records.map((r) => r.seq), [0, 1, 2]);
    assert.equal(records[1].prev, records[0].hash);
    assert.equal(records[2].prev, records[1].hash);
    assert.equal(verify(records).ok, true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

await test('verify() catches a record edited after the fact', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ledger-'));
  const path = join(dir, 'log.jsonl');
  try {
    await append(path, [
      { kind: 'forecast', probability: 0.2 },
      { kind: 'forecast', probability: 0.4 },
      { kind: 'forecast', probability: 0.9 },
    ]);

    // Retroactively improve a forecast, exactly the fraud the chain exists to catch.
    const lines = (await readFile(path, 'utf8')).trim().split('\n');
    const tampered = JSON.parse(lines[1]);
    tampered.probability = 0.95;
    lines[1] = JSON.stringify(tampered);
    await writeFile(path, lines.join('\n') + '\n');

    const result = verify(await readLog(path));
    assert.equal(result.ok, false, 'tampering went undetected');
    assert.ok(result.errors.some((e) => e.kind === 'hash' && e.line === 2), 'did not flag the edited line');
    assert.ok(result.errors.some((e) => e.kind === 'chain' && e.line === 3), 'did not flag the broken link after it');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- selection

const fixtures = JSON.parse(await readFile(new URL('./fixtures/markets.json', import.meta.url), 'utf8'));

await test('selection applies every published criterion', () => {
  const { selected, rejected } = select(fixtures, { seed: SEED, now: NOW });
  const ids = selected.map((m) => m.id).sort();
  assert.deepEqual(ids, ['fx-eligible-1', 'fx-eligible-2', 'fx-eligible-3', 'fx-eligible-4']);

  const why = Object.fromEntries(rejected.map((r) => [r.id, r.reasons.join('; ')]));
  assert.match(why['fx-reject-price'], /outside/);
  assert.match(why['fx-reject-horizon'], /over 90d/);
  assert.match(why['fx-reject-volume'], /volume/);
  assert.match(why['fx-reject-imminent'], /under 1d/);
});

await test('selection order is deterministic for a seed and changes with the seed', () => {
  const a = select(fixtures, { seed: SEED, now: NOW }).selected.map((m) => m.id);
  const b = select(fixtures, { seed: SEED, now: NOW }).selected.map((m) => m.id);
  assert.deepEqual(a, b, 'same seed produced a different order');

  const c = select(fixtures, { seed: '2026-07-28', now: NOW }).selected.map((m) => m.id);
  assert.equal(c.length, a.length);
  assert.notDeepEqual(a, c, 'a different seed produced an identical order (hash ordering is not working)');
});

await test('selection refuses to run without a seed', () => {
  assert.throws(() => select(fixtures, { now: NOW }), /requires a seed/);
});

await test('per-venue cap is enforced', () => {
  const { selected } = select(fixtures, {
    criteria: { ...DEFAULT_CRITERIA, perVenue: 2 },
    seed: SEED,
    now: NOW,
  });
  assert.equal(selected.length, 2);
});

await test('criteriaHash changes when a criterion changes', () => {
  const a = criteriaHash(DEFAULT_CRITERIA);
  const b = criteriaHash({ ...DEFAULT_CRITERIA, minVolume: 1 });
  assert.notEqual(a, b);
  assert.equal(a, criteriaHash({ ...DEFAULT_CRITERIA }));
});

await test('eligible() explains itself', () => {
  const verdict = eligible(fixtures.find((m) => m.id === 'fx-reject-volume'), DEFAULT_CRITERIA, NOW);
  assert.equal(verdict.ok, false);
  assert.equal(verdict.reasons.length, 1);
});

// ---------------------------------------------------------------- scoring

await test('brier and log loss match known values', () => {
  assert.ok(Math.abs(brier(0.7, 1) - 0.09) < 1e-9);
  assert.ok(Math.abs(brier(0.25, 0) - 0.0625) < 1e-9);
  assert.ok(Math.abs(logLoss(0.5, 1) - Math.LN2) < 1e-9);
  assert.ok(Math.abs(logLoss(0.9, 1) - -Math.log(0.9)) < 1e-9);
});

await test('log loss is finite at the extremes rather than infinite', () => {
  assert.ok(Number.isFinite(logLoss(0, 1)));
  assert.ok(Number.isFinite(logLoss(1, 0)));
});

await test('Murphy decomposition satisfies BS = reliability - resolution + uncertainty', () => {
  // One constant probability per bin, which makes the identity exact.
  const pairs = [
    ...Array.from({ length: 3 }, () => ({ p: 0.25, outcome: 0 })),
    { p: 0.25, outcome: 1 },
    ...Array.from({ length: 3 }, () => ({ p: 0.75, outcome: 1 })),
    { p: 0.75, outcome: 0 },
  ];
  const bs = pairs.reduce((acc, x) => acc + brier(x.p, x.outcome), 0) / pairs.length;
  const d = decompose(pairs);
  assert.ok(Math.abs(bs - 0.1875) < 1e-9, `direct Brier was ${bs}`);
  assert.ok(
    Math.abs(bs - (d.reliability - d.resolution + d.uncertainty)) < 1e-4,
    `identity broken: ${bs} vs ${d.reliability} - ${d.resolution} + ${d.uncertainty}`,
  );
  assert.equal(d.reliability, 0, 'perfectly calibrated input should have zero reliability term');
});

await test('a perfectly calibrated forecaster scores better than a confident wrong one', () => {
  const calibrated = [{ p: 0.6, outcome: 1 }, { p: 0.4, outcome: 0 }];
  const wrong = [{ p: 0.95, outcome: 0 }, { p: 0.05, outcome: 1 }];
  const bs = (xs) => xs.reduce((a, x) => a + brier(x.p, x.outcome), 0) / xs.length;
  assert.ok(bs(calibrated) < bs(wrong));
});

await test('scoreAll separates arms, benchmarks the market, and drops voided markets', () => {
  const rows = [
    { venue: 'fixture', marketId: 'm1', asOf: 'd1', arm: 'anchored', probability: 0.8, marketProb: 0.75, outcome: 1 },
    { venue: 'fixture', marketId: 'm1', asOf: 'd1', arm: 'blind', probability: 0.55, marketProb: 0.75, outcome: 1 },
    { venue: 'fixture', marketId: 'm2', asOf: 'd1', arm: 'anchored', probability: 0.3, marketProb: 0.28, outcome: 0 },
    { venue: 'fixture', marketId: 'm2', asOf: 'd1', arm: 'blind', probability: 0.62, marketProb: 0.28, outcome: 0 },
    { venue: 'fixture', marketId: 'm3', asOf: 'd1', arm: 'anchored', probability: 0.5, marketProb: 0.5, outcome: null },
  ];
  const s = scoreAll(rows);
  assert.equal(s.byArm.anchored.n, 2);
  assert.equal(s.byArm.blind.n, 2);
  assert.equal(s.dropped, 1, 'the voided market should not be scored');
  assert.equal(s.market.n, 2, 'the market benchmark should count each market once, not once per arm');
  assert.ok(s.byArm.anchored.brier < s.byArm.blind.brier, 'anchored arm was the more accurate one here');
  assert.ok(s.skill.anchored > s.skill.blind);
});

await test('anchoring measures how far each arm sits from the price', () => {
  const rows = [
    { venue: 'v', marketId: 'm1', asOf: 'd1', arm: 'anchored', probability: 0.76, marketProb: 0.75, outcome: 1 },
    { venue: 'v', marketId: 'm1', asOf: 'd1', arm: 'blind', probability: 0.45, marketProb: 0.75, outcome: 1 },
  ];
  const a = anchoring(rows);
  assert.equal(a.n, 1);
  assert.ok(Math.abs(a.meanDistanceToMarket.anchored - 0.01) < 1e-9);
  assert.ok(Math.abs(a.meanDistanceToMarket.blind - 0.3) < 1e-9);
  assert.ok(a.independence > 10, 'a price-hugging anchored arm should give a large independence ratio');
});

await test('scoring an empty ledger does not throw', () => {
  const s = scoreAll([]);
  assert.deepEqual(s.byArm, {});
  assert.equal(s.market, null);
  assert.equal(s.anchoring, null);
});

// ---------------------------------------------------------------- venues + report

await test('fixture venue round-trips through the normalized shape', async () => {
  const venue = getVenue('fixture');
  const open = await venue.fetchOpen(100);
  assert.ok(open.length >= 4);
  for (const m of open) {
    for (const key of ['venue', 'id', 'question', 'marketProb', 'closeTime', 'volume', 'resolved']) {
      assert.ok(key in m, `fixture market missing ${key}`);
    }
  }
  const resolved = await venue.fetchOne('fx-eligible-1');
  assert.equal(resolved.resolved, true);
  assert.equal(resolved.outcome, 1);
});

await test('venue adapters normalize their documented shapes', () => {
  const kalshi = getVenue('kalshi').map({
    ticker: 'ABC-25', title: 'Test', yes_bid: 40, yes_ask: 44,
    close_time: '2026-09-01T00:00:00Z', volume: 900, status: 'settled', result: 'yes',
  });
  assert.ok(Math.abs(kalshi.marketProb - 0.42) < 1e-9, 'kalshi cents should become a 0..1 midpoint');
  assert.equal(kalshi.outcome, 1);

  const poly = getVenue('polymarket').map({
    id: '77', question: 'Test', slug: 't', outcomes: '["Yes","No"]',
    outcomePrices: '["0.31","0.69"]', endDate: '2026-09-01T00:00:00Z', volume: 5, closed: false,
  });
  assert.ok(Math.abs(poly.marketProb - 0.31) < 1e-9, 'polymarket string-encoded prices should parse');
  assert.equal(poly.outcome, null);

  assert.equal(getVenue('manifold').map({ id: 'x', outcomeType: 'MULTIPLE_CHOICE' }), null,
    'non-binary markets should be filtered out');
  assert.equal(getVenue('manifold').map({ id: 'x', outcomeType: 'BINARY', resolution: 'CANCEL' }).outcome, null,
    'a cancelled market is not a NO');
});

await test('report renders with data and with an empty ledger', () => {
  const rows = [
    { venue: 'v', marketId: 'm1', asOf: 'd', arm: 'anchored', probability: 0.8, marketProb: 0.75, outcome: 1 },
    { venue: 'v', marketId: 'm1', asOf: 'd', arm: 'blind', probability: 0.55, marketProb: 0.75, outcome: 1 },
  ];
  const md = renderReport({
    scores: scoreAll(rows),
    head: 'a'.repeat(64),
    counts: { forecasts: 2, resolutions: 1 },
    generatedAt: '2026-07-27T00:00:00Z',
    commit: 'abc1234',
  });
  assert.match(md, /# Calibration Ledger/);
  assert.match(md, /## Anchoring/);
  assert.match(md, /Independence ratio/);
  assert.match(md, /abc1234/);

  const empty = renderReport({
    scores: scoreAll([]),
    head: '0'.repeat(64),
    counts: { forecasts: 0, resolutions: 0 },
    generatedAt: '2026-07-27T00:00:00Z',
    commit: null,
  });
  assert.match(empty, /Not enough paired forecasts yet/);
});

// ---------------------------------------------------------------- result

console.log(`\n  ${passed} passed, ${failures.length} failed\n`);
process.exit(failures.length ? 1 : 0);
