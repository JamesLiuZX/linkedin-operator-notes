#!/usr/bin/env node
// hub-stats-parity.mjs: prove the website's JavaScript statistics port
// (hub/src/js/artifacts/ab-stats.js) gives the same readout as the published
// Python script (skills/experiment-readout/scripts/ab_stats.py).
//
// For every demo scenario it writes the input to a temp file, runs
//   python3 -I ab_stats.py <file>
// and compares the JSON with readout(input) from the JS module:
//   numbers within 1e-9 (absolute), strings, booleans and nulls exactly,
//   and the same keys and array lengths everywhere.
// It also checks that each scenario reaches its intended decision and rule,
// and that the Tangelo scenario matches the committed example files.
//
// Prints one line per scenario. Exits non-zero on any mismatch.
// Run: node scripts/hub-stats-parity.mjs

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readout, SCENARIOS } from '../hub/src/js/artifacts/ab-stats.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = path.join(ROOT, 'skills', 'experiment-readout');
const SCRIPT = path.join(SKILL, 'scripts', 'ab_stats.py');
const TOL = 1e-9;

// The outcome each scenario exists to demonstrate.
const INTENDED = {
  tangelo: ['extend', 6],
  clean: ['ship', 5],
  srm: ['do-not-trust', 1],
  small: ['extend', 8],
  harm: ['stop', 2],
};

/** Compare two JSON values. Returns a list of mismatch descriptions and tracks the worst number gap. */
function compare(a, b, where, out, stats) {
  if (typeof a === 'number' && typeof b === 'number') {
    const gap = Math.abs(a - b);
    stats.maxGap = Math.max(stats.maxGap, gap);
    if (!(gap <= TOL)) out.push(`${where}: python ${a} vs js ${b} (gap ${gap})`);
    return;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      out.push(`${where}: array shape differs`);
      return;
    }
    a.forEach((x, i) => compare(x, b[i], `${where}[${i}]`, out, stats));
    return;
  }
  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (ka.join('\u0000') !== kb.join('\u0000')) {
      out.push(`${where}: keys differ (python ${ka.join(',')} | js ${kb.join(',')})`);
      return;
    }
    for (const k of ka) compare(a[k], b[k], `${where}.${k}`, out, stats);
    return;
  }
  if (a !== b) out.push(`${where}: python ${JSON.stringify(a)} vs js ${JSON.stringify(b)}`);
}

function runPython(input, dir, id) {
  const file = path.join(dir, `${id}.json`);
  fs.writeFileSync(file, JSON.stringify(input));
  const res = spawnSync('python3', ['-I', SCRIPT, file], { encoding: 'utf8' });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`python3 exited ${res.status}: ${res.stderr.trim()}`);
  return JSON.parse(res.stdout);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ab-parity-'));
let failures = 0;
try {
  for (const s of SCENARIOS) {
    const problems = [];
    const stats = { maxGap: 0 };
    let js;
    let py;
    try {
      js = readout(s.input);
      py = runPython(s.input, tmp, s.id);
      compare(py, js, s.id, problems, stats);
    } catch (err) {
      problems.push(`${s.id}: ${err.message}`);
    }
    if (js) {
      const ruleNo = Number(js.verdict.rule.match(/^Rule (\d+):/)[1]);
      const want = INTENDED[s.id];
      if (!want) problems.push(`${s.id}: no intended outcome recorded`);
      else if (js.verdict.decision !== want[0] || ruleNo !== want[1]) {
        problems.push(`${s.id}: got ${js.verdict.decision} by rule ${ruleNo}, intended ${want[0]} by rule ${want[1]}`);
      }
      if (s.blurb.length >= 90 || s.blurb.includes('—')) problems.push(`${s.id}: blurb too long or has an em dash`);
      if (s.id === 'tangelo') {
        const committedIn = JSON.parse(fs.readFileSync(path.join(SKILL, 'examples', 'tangelo', 'input', 'results.json'), 'utf8'));
        compare(committedIn, s.input, 'tangelo.input-file', problems, stats);
        const committedOut = JSON.parse(fs.readFileSync(path.join(SKILL, 'examples', 'tangelo', 'readout.numbers.json'), 'utf8'));
        compare(committedOut, js, 'tangelo.readout-file', problems, stats);
      }
      const status = problems.length ? 'FAIL' : 'ok  ';
      console.log(`${status} ${s.id.padEnd(8)} ${js.verdict.decision.padEnd(13)} ${js.verdict.rule}  (max number gap ${stats.maxGap.toExponential(1)})`);
    } else {
      console.log(`FAIL ${s.id}`);
    }
    for (const p of problems) console.log(`     ${p}`);
    failures += problems.length;
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (failures) {
  console.error(`hub-stats-parity: ${failures} mismatch(es).`);
  process.exit(1);
}
console.log(`hub-stats-parity: ${SCENARIOS.length} scenarios, Python and JavaScript agree.`);
