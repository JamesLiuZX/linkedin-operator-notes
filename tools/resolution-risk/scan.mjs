#!/usr/bin/env node
// tools/resolution-risk/scan.mjs
// Score open prediction markets by how likely their resolution criteria are to
// produce a dispute.
//
// Usage:
//   node tools/resolution-risk/scan.mjs                       # fixtures, table
//   node tools/resolution-risk/scan.mjs --source polymarket   # live, needs network
//   node tools/resolution-risk/scan.mjs --source kalshi --limit 100
//   node tools/resolution-risk/scan.mjs --file ./my-markets.json
//   node tools/resolution-risk/scan.mjs --top 5 --verbose
//   node tools/resolution-risk/scan.mjs --json
//   node tools/resolution-risk/scan.mjs --evidence            # markdown for an article
//
// Zero dependencies.

import { SOURCES, loadFile } from './lib/sources.mjs';
import { scoreAll, ruleFrequency } from './lib/score.mjs';
import { RULES } from './lib/rules.mjs';

// ------------------------------------------------------------------- args

function parseArgs(argv) {
  const args = {
    source: 'fixtures',
    file: null,
    limit: 50,
    top: 0,
    json: false,
    evidence: false,
    verbose: false,
    minScore: 0,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--source') args.source = argv[++i];
    else if (a === '--file') args.file = argv[++i];
    else if (a === '--limit') args.limit = Number(argv[++i]);
    else if (a === '--top') args.top = Number(argv[++i]);
    else if (a === '--min-score') args.minScore = Number(argv[++i]);
    else if (a === '--json') args.json = true;
    else if (a === '--evidence') args.evidence = true;
    else if (a === '--verbose' || a === '-v') args.verbose = true;
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

const HELP = `
resolution-risk: score prediction market criteria by dispute likelihood

  --source <name>   fixtures (default) | polymarket | kalshi
  --file <path>     read markets from a local JSON file instead
  --limit <n>       how many markets to pull from a live source (default 50)
  --top <n>         only show the n riskiest
  --min-score <n>   only show markets at or above this score
  --verbose, -v     show every finding with excerpts and suggested fixes
  --json            machine readable
  --evidence        markdown evidence block for an article draft
  --help, -h        this

Live sources need open outbound network. Default fixtures are synthetic.
`.trim();

// ------------------------------------------------------------------ output

const C = process.stdout.isTTY
  ? { dim: '\x1b[2m', red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m', mag: '\x1b[35m', bold: '\x1b[1m', off: '\x1b[0m' }
  : { dim: '', red: '', yellow: '', green: '', mag: '', bold: '', off: '' };

const BAND_COLOR = { CRITICAL: C.mag, HIGH: C.red, MEDIUM: C.yellow, LOW: C.green };

function truncate(s, n) {
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}

function renderTable(results, args) {
  const shown = results.filter((r) => r.score >= args.minScore);
  const list = args.top > 0 ? shown.slice(0, args.top) : shown;

  console.log('');
  console.log(`${C.bold}Resolution risk scan${C.off} ${C.dim}(${results.length} markets, ${list.length} shown)${C.off}`);
  console.log('');

  for (const r of list) {
    const color = BAND_COLOR[r.band];
    const head = `${color}${String(r.score).padStart(3)} ${r.band.padEnd(8)}${C.off}`;
    console.log(`${head} ${truncate(r.market.question, 68)}`);
    console.log(`    ${C.dim}${r.market.venue} · ${r.market.id}${r.market.url ? ' · ' + r.market.url : ''}${C.off}`);

    if (r.thin) {
      console.log(`    ${C.yellow}!${C.off} criteria too thin to analyse (under 25 words), scored at floor`);
    }

    if (args.verbose) {
      for (const f of r.findings) {
        console.log(`    ${C.bold}${f.severity.toUpperCase()}${C.off} ${f.label} ${C.dim}[${f.id}]${C.off}`);
        console.log(`      ${C.dim}why:${C.off} ${f.why}`);
        for (const h of f.hits) {
          console.log(`      ${C.dim}·${C.off} "${h.term}" ${C.dim}${truncate(h.excerpt, 90)}${C.off}`);
        }
        console.log(`      ${C.green}fix:${C.off} ${f.fix}`);
      }
    } else if (r.findings.length) {
      console.log(`    ${r.findings.map((f) => f.label).join(', ')}`);
    } else {
      console.log(`    ${C.green}no rule hits${C.off}`);
    }
    console.log('');
  }

  const freq = ruleFrequency(results);
  if (freq.length) {
    console.log(`${C.bold}Most common holes across the corpus${C.off}`);
    for (const f of freq.slice(0, 8)) {
      const pct = Math.round((f.markets / results.length) * 100);
      console.log(`  ${String(pct).padStart(3)}%  ${f.label} ${C.dim}(${f.markets}/${results.length})${C.off}`);
    }
    console.log('');
  }
}

// The point of this mode: PLAN-30-DAYS asks for a before/after rewrite as the
// shareable artifact. This emits the raw material for it.
function renderEvidence(results) {
  const worst = results.slice(0, 5);
  const freq = ruleFrequency(results);
  const scored = results.length;
  const critical = results.filter((r) => r.band === 'CRITICAL').length;
  const clean = results.filter((r) => r.findings.length === 0).length;

  const lines = [];
  lines.push('## Evidence block: resolution risk scan');
  lines.push('');
  lines.push(`- Markets scanned: ${scored}`);
  lines.push(`- Scored CRITICAL: ${critical} (${Math.round((critical / scored) * 100)}%)`);
  lines.push(`- Zero rule hits: ${clean} (${Math.round((clean / scored) * 100)}%)`);
  lines.push('');
  lines.push('### Most common hole');
  lines.push('');
  for (const f of freq.slice(0, 5)) {
    lines.push(`- **${f.label}**: ${f.markets} of ${scored} markets (${Math.round((f.markets / scored) * 100)}%)`);
  }
  lines.push('');
  lines.push('### Worst offenders, with the rewrite');
  lines.push('');
  for (const r of worst) {
    lines.push(`#### ${r.market.question}`);
    lines.push('');
    lines.push(`Score ${r.score} (${r.band}) · ${r.market.venue}${r.market.url ? ` · ${r.market.url}` : ''}`);
    lines.push('');
    lines.push('**Before**');
    lines.push('');
    lines.push('> ' + (r.market.criteria || '(empty)').replace(/\n+/g, '\n> '));
    lines.push('');
    lines.push('**What is missing**');
    lines.push('');
    for (const f of r.findings.slice(0, 4)) {
      lines.push(`- ${f.label}: ${f.why}`);
      lines.push(`  - Fix: ${f.fix}`);
    }
    if (r.thin) lines.push('- Criteria is under 25 words. There is not enough text to be wrong about, which is its own problem.');
    lines.push('');
    lines.push('**After**');
    lines.push('');
    lines.push('> TODO: write the rewrite by hand. The scanner finds the hole, you fill it.');
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push('_Generated by `tools/resolution-risk/scan.mjs`. Verify every claim against the live market before publishing._');
  console.log(lines.join('\n'));
}

// -------------------------------------------------------------------- main

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }

  let markets;
  try {
    if (args.file) {
      markets = await loadFile(args.file);
    } else {
      const loader = SOURCES[args.source];
      if (!loader) {
        console.error(`Unknown source "${args.source}". Options: ${Object.keys(SOURCES).join(', ')}`);
        process.exitCode = 2;
        return;
      }
      markets = await loader(args.limit);
    }
  } catch (err) {
    console.error(`Failed to load markets from ${args.file || args.source}: ${err.message}`);
    if (!args.file && args.source !== 'fixtures') {
      console.error('Live sources need open outbound network. Try --source fixtures.');
    }
    process.exitCode = 1;
    return;
  }

  if (!markets.length) {
    console.error('No markets loaded.');
    process.exitCode = 1;
    return;
  }

  const results = scoreAll(markets);

  if (args.json) {
    console.log(JSON.stringify({
      scannedAt: new Date().toISOString(),
      source: args.file || args.source,
      count: results.length,
      rules: RULES.map((r) => ({ id: r.id, label: r.label, severity: r.severity })),
      frequency: ruleFrequency(results),
      results: results.map((r) => ({
        id: r.market.id,
        question: r.market.question,
        venue: r.market.venue,
        url: r.market.url,
        score: r.score,
        band: r.band,
        thin: r.thin,
        findings: r.findings.map((f) => ({
          id: f.id, label: f.label, severity: f.severity, hits: f.hits.map((h) => h.term),
        })),
      })),
    }, null, 2));
    return;
  }

  if (args.evidence) {
    renderEvidence(results);
    return;
  }

  renderTable(results, args);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
