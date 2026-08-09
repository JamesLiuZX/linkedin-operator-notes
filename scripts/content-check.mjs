#!/usr/bin/env node
// scripts/content-check.mjs
// Quality gate for posts/ and articles/. Zero dependencies.
//
// Usage:
//   node scripts/content-check.mjs                  # check everything
//   node scripts/content-check.mjs articles/foo.md  # check specific files
//   node scripts/content-check.mjs --json           # machine readable
//   node scripts/content-check.mjs --strict         # drafts block too
//   node scripts/content-check.mjs --warn-only      # never exit non-zero
//
// Blocking model:
//   status: draft            advisory, so work in progress can live in the repo
//   no frontmatter at all    BLOCKING. An unregistered file is not a draft, it
//                            is a file the system cannot see. That hole is what
//                            let 7 of 8 posts violate three hard rules each
//                            while CI stayed green.
//   anything else            blocking.
//
// The shared prose checks (tells, bait, hedges, hook, density, receipts,
// sourcing, rhythm, length) live in ./lib/analyze.mjs and are imported below,
// not re-implemented. This file adds only the checks that need a real repo
// file: frontmatter, the evidence block, unfilled slots, derivedFrom
// provenance, and LinkedIn-native fold/length/hashtag/link rules.

import { readFile, readdir, access } from 'node:fs/promises';
import { join, extname, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './lib/frontmatter.mjs';
import { analyzeLinkedIn, FOLD, MAX } from './lib/linkedin.mjs';
import { coreChecks, scoreChecks, countSpecifics } from './lib/analyze.mjs';

// ---------------------------------------------------------------- rule tables

// Every field is load-bearing. Cost is the one that separates a post from a
// press release, so it is checked hardest (see WRITING.md section 4).
export const EVIDENCE_FIELDS = [
  'Claim', 'Moment', 'Numbers', 'Names', 'Cost', 'Counterexample', 'Reader action',
];

// ---------------------------------------------------------------- file-specific analysis

/** Parse the mandatory evidence block. Returns null when absent. */
export function parseEvidence(raw) {
  const m = raw.match(/<!--\s*EVIDENCE\b([\s\S]*?)-->/i);
  if (!m) return null;
  const fields = {};
  let current = null;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^\s*([A-Za-z][A-Za-z ]*?)\s*:\s*(.*)$/.exec(line);
    if (kv && EVIDENCE_FIELDS.some(f => f.toLowerCase() === kv[1].trim().toLowerCase())) {
      current = EVIDENCE_FIELDS.find(f => f.toLowerCase() === kv[1].trim().toLowerCase());
      fields[current] = kv[2].trim();
    } else if (current && line.trim()) {
      fields[current] += ' ' + line.trim();
    }
  }
  return fields;
}

// Multi-line and long on purpose: a slot carries the instruction for filling it.
const PLACEHOLDER = /\{\{([\s\S]*?)\}\}/g;

/** Word shingles, for detecting an atom that just reprints its source essay. */
function shingles(text, n = 8) {
  const toks = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i + n <= toks.length; i++) out.add(toks.slice(i, i + n).join(' '));
  return out;
}

export function overlapRatio(a, b) {
  const A = shingles(a), B = shingles(b);
  if (!A.size) return 0;
  let hit = 0;
  for (const s of A) if (B.has(s)) hit++;
  return hit / A.size;
}

/**
 * @param {string} raw    full file contents
 * @param {'post'|'article'} kind
 * @param {{ sourceText?: string, sourceExists?: boolean|null }} ctx
 *        cross-file context the caller resolves (derivedFrom target)
 */
export function analyze(raw, kind = 'post', ctx = {}) {
  const { data, body, hasFrontmatter } = parseFrontmatter(raw);

  // For posts, only the Draft section is the published artifact. Editorial
  // headers above it are notes to self and must not dilute the stats.
  const li = kind === 'post' ? analyzeLinkedIn(body) : null;
  const source = li ? li.draft : body;

  const core = coreChecks(source, kind);
  const { text } = core;

  // Splice the file-specific checks in at the same points this gate has
  // always reported them, so `npm run content:check`'s output reads the way
  // it always has: registered, then the shared prose checks, then the
  // file-specific hard checks, then LinkedIn-native, then the shared warns.
  const checks = [];
  const add = (id, label, status, detail) => checks.push({ id, label, status, detail });
  const [sharedHard, sharedWarn] = [core.checks.slice(0, 9), core.checks.slice(9)];

  // ------------------------------------------------------------ registration
  add('registered', 'Has frontmatter', hasFrontmatter ? 'pass' : 'fail',
    hasFrontmatter ? `status: ${data.status || 'draft'}`
      : 'no frontmatter. The gate and the publisher both treat this file as invisible.');

  checks.push(...sharedHard);

  // ------------------------------------------------------------ evidence block
  const evidence = parseEvidence(raw);
  if (!evidence) {
    add('evidence', 'Evidence block', 'fail',
      'missing. WRITING.md section 4: no drafting starts before this exists.');
  } else {
    const missing = EVIDENCE_FIELDS.filter(f => !evidence[f] || /^\(.*\)$/.test(evidence[f]));
    add('evidence', 'Evidence block', missing.length ? 'fail' : 'pass',
      missing.length ? `empty field(s): ${missing.join(', ')}` : `${EVIDENCE_FIELDS.length} fields filled`);
  }

  // Refuse to publish a hole. The generator is not allowed to invent a number
  // the author has not confirmed, so it leaves {{ }} and this stops the file.
  const holes = [...raw.matchAll(PLACEHOLDER)]
    .map(m => m[1].replace(/\s+/g, ' ').trim())
    .filter(Boolean)                       // "{{ }}" in instructions is not a slot
    .map(h => (h.split(':')[0] || h).slice(0, 32));
  add('placeholders', 'No unfilled slots', holes.length ? 'fail' : 'pass',
    holes.length ? `${holes.length} unfilled: ${[...new Set(holes)].slice(0, 4).join(', ')}` : 'clean');

  // ------------------------------------------------------------ provenance
  if (kind === 'post') {
    const from = data.derivedFrom;
    if (!from) {
      add('provenance', 'Traces to a source', 'fail',
        'set derivedFrom: to the essay or the artifact this atom came from. Atoms are derived, never composed independently.');
    } else if (ctx.sourceExists === false) {
      add('provenance', 'Traces to a source', 'fail', `derivedFrom: ${from} does not exist`);
    } else {
      add('provenance', 'Traces to a source', 'pass', String(from));
    }

    if (ctx.sourceText) {
      const ratio = overlapRatio(text, ctx.sourceText);
      const pct = (ratio * 100).toFixed(1);
      add('cannibalization', 'Not a reprint of its source',
        ratio > 0.12 ? 'fail' : ratio > 0.06 ? 'warn' : 'pass',
        `${pct}% of this atom's phrasing also appears in ${data.derivedFrom}`);
    }
  }

  // ------------------------------------------------------------ LinkedIn native
  if (li) {
    const cut = li.fold;
    const foldSpecifics = countSpecifics(cut.visible);
    add('fold', 'Fold earns the click',
      foldSpecifics.length ? 'pass' : 'fail',
      cut.truncated
        ? `${FOLD} visible chars carry ${foldSpecifics.length} specific(s). "see more" cuts after: ...${cut.visible.slice(-40)}`
        : `whole post fits above the fold (${li.chars} chars)`);

    add('chars', 'LinkedIn length',
      li.chars > MAX ? 'fail' : li.chars < 400 ? 'warn' : 'pass',
      `${li.chars} chars (max ${MAX})`);

    add('renderable', 'Pastes clean into LinkedIn',
      li.unrenderable.length ? 'fail' : 'pass',
      li.unrenderable.length
        ? li.unrenderable.map(u => `${u.label} x${u.count}`).join(', ') + '. LinkedIn renders no markdown; run npm run linkedin.'
        : 'plain text');

    add('hashtags', 'Hashtags',
      li.hashtags.length > 3 ? 'fail' : 'pass',
      li.hashtags.length ? li.hashtags.join(' ') : 'none');

    // Outbound links in the body suppress distribution. They belong in the
    // first comment, which is also where the proof link belongs.
    add('links', 'No links in the body',
      li.urls.length ? 'fail' : 'pass',
      li.urls.length ? `${li.urls.length} URL(s) in body. Move to "## First comment".` : 'clean');
  }

  checks.push(...sharedWarn);

  if (kind === 'article') {
    // WRITING.md: a diagram you drew beats an Unsplash photo. Currently the
    // fallback is the default, 20 stock images to 0 diagrams.
    const figures = Array.isArray(data.figures) ? data.figures.length : 0;
    const localAssets = (body.match(/\((?:\.\/)?(?:assets|\.\.\/assets)\/[^)]+\)/g) || []).length
      + (body.match(/src="(?:\.\/)?(?:assets|\.\.\/assets)\//g) || []).length;
    add('figures', 'Owned artwork', figures === 0 ? 'warn' : localAssets ? 'pass' : 'warn',
      localAssets ? `${localAssets} local figure(s)`
        : figures ? `${figures} stock slot(s), 0 drawn. Unsplash is the fallback, not the default.`
          : 'no figures declared');
  }

  const { score, fails, warns } = scoreChecks(checks);

  return {
    checks, score, fails, warns,
    stats: { ...core.stats, chars: li?.chars ?? null },
  };
}

// ---------------------------------------------------------------- cli

async function collect() {
  const out = [];
  for (const dir of ['posts', 'articles']) {
    let entries = [];
    try { entries = await readdir(dir); } catch { continue; }
    for (const f of entries) {
      if (extname(f) === '.md' && basename(f).toLowerCase() !== 'readme.md') {
        out.push(join(dir, f));
      }
    }
  }
  return out;
}

/** Resolve derivedFrom, which may be repo-relative or relative to the post. */
async function resolveSource(path, from) {
  if (!from) return { sourceExists: null };
  const candidates = [resolve(process.cwd(), String(from)), resolve(dirname(path), String(from))];
  for (const c of candidates) {
    try {
      await access(c);
      const raw = await readFile(c, 'utf8');
      const { body } = parseFrontmatter(raw);
      // Only prose sources can be cannibalized; a script cannot be.
      // Strip the source's evidence block: it never renders, so reusing a phrase
      // from it is not recycling published text.
      const isProse = /\.(md|markdown|txt)$/i.test(c);
      return { sourceExists: true, sourceText: isProse ? body.replace(/<!--[\s\S]*?-->/g, ' ') : '' };
    } catch { /* try next */ }
  }
  return { sourceExists: false };
}

// Importing this module for `analyze` or `overlapRatio` must not run the CLI.
// It previously did, so any consumer got a full report printed at import time.
const isCli =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const warnOnly = argv.includes('--warn-only');
const strict = argv.includes('--strict');
const files = argv.filter(a => !a.startsWith('--'));
// READMEs are operator documentation, never publishable content. Filter them
// even when the shell expanded a glob onto them.
const targets = (files.length ? files : await collect())
  .filter(f => basename(f).toLowerCase() !== 'readme.md');

const C = { red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m', dim: '\x1b[2m', off: '\x1b[0m' };
const results = [];
let totalFails = 0;

for (const path of targets) {
  const raw = await readFile(path, 'utf8');
  const { data, hasFrontmatter } = parseFrontmatter(raw);
  const kind = path.startsWith('articles') ? 'article' : 'post';
  const ctx = kind === 'post' ? await resolveSource(path, data.derivedFrom) : {};
  const r = analyze(raw, kind, ctx);

  // An unregistered file is not a draft. It is a file nothing in the pipeline
  // can see, which is strictly worse, so it always blocks.
  const isDraft = hasFrontmatter && (data.status || 'draft') === 'draft';
  const blocking = strict || !isDraft;

  results.push({ path, kind, status: hasFrontmatter ? (data.status || 'draft') : 'unregistered', blocking, ...r });
  if (blocking) totalFails += r.fails;

  if (!asJson) {
    const head = r.fails ? C.red : r.warns ? C.yellow : C.green;
    const label = hasFrontmatter ? (data.status || 'draft') : 'UNREGISTERED';
    console.log(`\n${head}${r.score}/100${C.off}  ${path} ${C.dim}[${kind}, ${label}]${C.off}`);
    for (const c of r.checks) {
      if (c.status === 'pass') continue;
      const mark = c.status === 'fail' ? `${C.red}FAIL${C.off}` : `${C.yellow}warn${C.off}`;
      console.log(`  ${mark}  ${c.label}: ${c.detail}`);
    }
    if (!blocking && r.fails) console.log(`  ${C.dim}(draft, not blocking. --strict to enforce)${C.off}`);
  }
}

if (asJson) console.log(JSON.stringify(results, null, 2));
else console.log(`\n${targets.length} file(s). ${totalFails} blocking failure(s)${strict ? ' (strict)' : ' on non-draft content'}.\n`);

process.exit(warnOnly || !totalFails ? 0 : 1);
}
