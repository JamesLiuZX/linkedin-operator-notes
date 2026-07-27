#!/usr/bin/env node
// scripts/ledger/index.mjs
// The Calibration Ledger CLI.
//
//   npm run ledger -- verify-venue manifold     check the live API shape first
//   npm run ledger -- forecast --venue manifold run both arms, append to the log
//   npm run ledger -- resolve                   pull outcomes for open forecasts
//   npm run ledger -- score                     compute Brier, calibration, anchoring
//   npm run ledger -- report                    render the public scoreboard
//   npm run ledger -- verify                    walk the hash chain
//
// Everything except `forecast` runs offline. Use `--venue fixture` to exercise
// the whole pipeline with no network and no API key.

import { execFile } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { promisify } from 'node:util';

import { append, readLog, verify } from './log.mjs';
import { getVenue, probeVenue } from './venues.mjs';
import { select, criteriaHash, DEFAULT_CRITERIA } from './select.mjs';
import { forecastOne, makeClient, ARMS } from './forecast.mjs';
import { scoreAll } from './score.mjs';
import { renderReport } from './report.mjs';

const execFileAsync = promisify(execFile);

// LEDGER_DIR lets you run against a throwaway log (testing, a dry run you do not
// want in the record). The real ledger is the default and is what gets committed.
const DATA = process.env.LEDGER_DIR ?? 'data/ledger';
const FORECASTS = `${DATA}/forecasts.jsonl`;
const RESOLUTIONS = `${DATA}/resolutions.jsonl`;
const REPORT = `${DATA}/REPORT.md`;

// ---------------------------------------------------------------- args

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const [key, inline] = token.slice(2).split('=');
      const next = argv[i + 1];
      if (inline !== undefined) args[key] = inline;
      else if (next && !next.startsWith('--')) args[key] = argv[++i];
      else args[key] = true;
    } else {
      args._.push(token);
    }
  }
  return args;
}

const utcDate = (d = new Date()) => d.toISOString().slice(0, 10);

async function gitCommit() {
  try {
    const { stdout } = await execFileAsync('git', ['rev-parse', '--short', 'HEAD']);
    return stdout.trim();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- commands

async function cmdVerifyVenue(args) {
  const names = args.venue ? String(args.venue).split(',') : ['manifold', 'kalshi', 'polymarket'];
  let bad = 0;

  for (const name of names) {
    try {
      const result = await probeVenue(name.trim());
      if (result.ok) {
        console.log(`  OK    ${result.venue}  ${result.sample.question ?? ''}`);
        console.log(`        price=${result.sample.marketProb} closes=${result.sample.closeTime}`);
      } else {
        bad++;
        console.log(`  FAIL  ${result.venue}  ${result.reason ?? `missing: ${result.missing.join(', ')}`}`);
        console.log(`        adapter expects: ${result.dependsOn.join(', ')}`);
      }
    } catch (err) {
      bad++;
      console.log(`  ERROR ${name}  ${err.message}`);
    }
  }

  if (bad) {
    console.log('\nA failing venue means its response shape moved. Fix the `map` function in');
    console.log('scripts/ledger/venues.mjs before running a forecast against it.');
  }
  return bad ? 1 : 0;
}

async function cmdForecast(args) {
  const venueNames = String(args.venue ?? 'manifold').split(',').map((s) => s.trim());
  const asOf = args.date ?? utcDate();
  const criteria = { ...DEFAULT_CRITERIA };
  if (args.limit) criteria.perVenue = Number(args.limit);
  const effort = args.effort ?? 'high';
  const research = args.research !== 'false' && args['no-research'] !== true;
  const dryRun = Boolean(args['dry-run']);

  const universe = [];
  for (const name of venueNames) {
    const venue = getVenue(name);
    const markets = await venue.fetchOpen(Number(args.scan ?? 200));
    console.log(`  scanned ${markets.length} open markets on ${name}`);
    universe.push(...markets);
  }

  const { selected, rejected } = select(universe, { criteria, seed: asOf, now: new Date(`${asOf}T00:00:00Z`) });
  console.log(`  selected ${selected.length}, rejected ${rejected.length} (seed ${asOf})`);

  if (!selected.length) {
    console.log('  nothing eligible today. Criteria are pre-registered; do not loosen them to get a hit.');
    return 0;
  }

  for (const m of selected) console.log(`    - [${m.venue}] ${m.question?.slice(0, 72)} @ ${m.marketProb.toFixed(3)}`);

  if (dryRun) {
    console.log('\n  --dry-run: selection only, nothing forecast and nothing written.');
    return 0;
  }

  const client = makeClient();
  const runId = `${asOf}-${Date.now().toString(36)}`;
  const records = [];

  for (const market of selected) {
    for (const arm of ARMS) {
      process.stdout.write(`  ${arm.padEnd(8)} ${market.venue}:${market.id} ... `);
      try {
        const f = await forecastOne({ client, market, arm, asOf, effort, research });
        console.log(`p=${f.probability.toFixed(3)} (market ${market.marketProb.toFixed(3)})`);
        records.push({
          kind: 'forecast',
          runId,
          asOf,
          venue: market.venue,
          marketId: market.id,
          question: market.question,
          url: market.url,
          closeTime: market.closeTime,
          marketProb: market.marketProb,
          arm,
          probability: f.probability,
          confidence: f.confidence,
          keyFactors: f.keyFactors,
          wrongIf: f.wrongIf,
          rationale: f.rationale,
          model: f.model,
          effort: f.effort,
          research: f.research,
          repaired: f.repaired,
          criteriaHash: criteriaHash(criteria),
          usage: f.usage,
          loggedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.log(`FAILED: ${err.message}`);
      }
    }
  }

  if (!records.length) {
    console.log('\n  no forecasts produced; nothing appended.');
    return 1;
  }

  const written = await append(FORECASTS, records);
  console.log(`\n  appended ${written.length} forecasts. head=${written[written.length - 1].hash.slice(0, 16)}`);
  console.log('  commit the log now. An uncommitted forecast is not a public forecast.');
  return 0;
}

async function cmdResolve() {
  const forecasts = await readLog(FORECASTS);
  const resolutions = await readLog(RESOLUTIONS);
  const done = new Set(resolutions.map((r) => `${r.venue}:${r.marketId}`));

  const open = new Map();
  for (const f of forecasts) {
    const key = `${f.venue}:${f.marketId}`;
    if (!done.has(key)) open.set(key, f);
  }

  if (!open.size) {
    console.log('  no open forecasts to resolve.');
    return 0;
  }
  console.log(`  checking ${open.size} open markets`);

  const records = [];
  for (const [key, f] of open) {
    try {
      const venue = getVenue(f.venue);
      const current = await venue.fetchOne(f.marketId);
      if (!current?.resolved) continue;
      if (current.outcome === null) {
        console.log(`  ${key} resolved without a binary outcome (voided or partial); recording as unscorable`);
      }
      records.push({
        kind: 'resolution',
        venue: f.venue,
        marketId: f.marketId,
        outcome: current.outcome,
        finalMarketProb: current.marketProb,
        question: f.question,
        resolvedAt: new Date().toISOString(),
      });
      console.log(`  ${key} -> ${current.outcome === null ? 'void' : current.outcome ? 'YES' : 'NO'}`);
    } catch (err) {
      console.log(`  ${key} check failed: ${err.message}`);
    }
  }

  if (!records.length) {
    console.log('  nothing newly resolved.');
    return 0;
  }
  const written = await append(RESOLUTIONS, records);
  console.log(`\n  appended ${written.length} resolutions.`);
  return 0;
}

/** Join forecasts to resolutions. A forecast without a resolution is not scored. */
async function buildScored() {
  const forecasts = await readLog(FORECASTS);
  const resolutions = await readLog(RESOLUTIONS);
  const byMarket = new Map(resolutions.map((r) => [`${r.venue}:${r.marketId}`, r]));

  const scored = [];
  for (const f of forecasts) {
    const res = byMarket.get(`${f.venue}:${f.marketId}`);
    if (!res) continue;
    scored.push({
      venue: f.venue,
      marketId: f.marketId,
      asOf: f.asOf,
      arm: f.arm,
      probability: f.probability,
      marketProb: f.marketProb,
      outcome: res.outcome,
    });
  }
  return { scored, counts: { forecasts: forecasts.length, resolutions: resolutions.length } };
}

async function cmdScore(args) {
  const { scored, counts } = await buildScored();
  const scores = scoreAll(scored);

  if (args.json) {
    console.log(JSON.stringify({ counts, scores }, null, 2));
    return 0;
  }

  console.log(`  forecasts=${counts.forecasts} resolutions=${counts.resolutions} scorable=${scored.length}`);
  for (const [arm, s] of Object.entries(scores.byArm)) {
    if (!s) continue;
    console.log(`  ${arm.padEnd(9)} n=${String(s.n).padStart(3)} brier=${s.brier} logloss=${s.logLoss} skill=${scores.skill[arm] ?? 'n/a'}`);
  }
  if (scores.market) console.log(`  ${'market'.padEnd(9)} n=${String(scores.market.n).padStart(3)} brier=${scores.market.brier} logloss=${scores.market.logLoss}`);
  if (scores.anchoring) {
    const a = scores.anchoring;
    console.log(`  anchoring n=${a.n} anchored-gap=${a.meanDistanceToMarket.anchored} blind-gap=${a.meanDistanceToMarket.blind} independence=${a.independence}`);
  }
  return 0;
}

async function cmdReport() {
  const { scored, counts } = await buildScored();
  const scores = scoreAll(scored);
  const forecasts = await readLog(FORECASTS);
  const head = forecasts.length ? forecasts[forecasts.length - 1].hash : '0'.repeat(64);

  const markdown = renderReport({
    scores,
    head,
    counts,
    generatedAt: new Date().toISOString(),
    commit: await gitCommit(),
  });

  await mkdir(DATA, { recursive: true });
  await writeFile(REPORT, markdown, 'utf8');
  console.log(`  wrote ${REPORT} (${markdown.split('\n').length} lines)`);
  return 0;
}

async function cmdVerify() {
  let failed = 0;
  for (const path of [FORECASTS, RESOLUTIONS]) {
    const records = await readLog(path);
    const result = verify(records);
    if (result.ok) {
      console.log(`  OK    ${path}  ${result.count} records, head ${result.head.slice(0, 16)}`);
    } else {
      failed = 1;
      console.log(`  BROKEN ${path}  ${result.errors.length} problem(s)`);
      for (const e of result.errors.slice(0, 10)) {
        console.log(`         line ${e.line} [${e.kind}] ${e.detail}`);
      }
    }
  }
  if (failed) {
    console.log('\n  A broken chain means the log was edited after the fact. That is the one');
    console.log('  failure this project cannot write its way out of. Restore from git.');
  }
  return failed;
}

// ---------------------------------------------------------------- main

const COMMANDS = {
  'verify-venue': cmdVerifyVenue,
  forecast: cmdForecast,
  resolve: cmdResolve,
  score: cmdScore,
  report: cmdReport,
  verify: cmdVerify,
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (!command || args.help) {
    console.log('Calibration Ledger\n');
    console.log('  verify-venue [--venue a,b]   check live API shapes before trusting a run');
    console.log('  forecast --venue manifold    select markets, run both arms, append');
    console.log('           [--limit N] [--effort high] [--no-research] [--dry-run] [--date YYYY-MM-DD]');
    console.log('  resolve                      pull outcomes for open forecasts');
    console.log('  score [--json]               Brier, calibration, anchoring');
    console.log('  report                       render data/ledger/REPORT.md');
    console.log('  verify                       walk the hash chain\n');
    console.log('  Use --venue fixture to run the whole pipeline offline.');
    return 0;
  }

  const handler = COMMANDS[command];
  if (!handler) {
    console.error(`Unknown command "${command}". Run with --help.`);
    return 1;
  }
  console.log(`\nledger ${command}\n`);
  return (await handler(args)) ?? 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(`\n  ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  });
