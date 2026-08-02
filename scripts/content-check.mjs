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

import { readFile, readdir, access } from 'node:fs/promises';
import { join, extname, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './lib/frontmatter.mjs';
import { analyzeLinkedIn, FOLD, MAX } from './lib/linkedin.mjs';

// ---------------------------------------------------------------- rule tables

export const LLM_TELLS = [
  'delve', 'tapestry', 'testament to', 'in today\'s fast-paced', 'ever-evolving',
  'game-changer', 'game changer', 'dive into', 'deep dive into', 'navigate the complexities',
  'at the end of the day', 'moreover', 'furthermore', 'in conclusion', 'revolutionize',
  'seamless', 'seamlessly', 'robust solution', 'cutting-edge', 'harness the power',
  'elevate your', 'empower', 'supercharge', 'myriad', 'plethora', 'underscore',
  'pivotal', 'the realm of', 'crucial', 'paradigm shift', 'holistic approach',
  'unlock the', 'unleash', 'transformative', 'leverage the', 'landscape of',
  'it\'s worth noting', 'that being said', 'a double-edged sword', 'the bottom line is',
];

export const BAIT = [
  'save this', 'bookmark this', 'comment below', 'drop a comment', 'agree?',
  'thoughts?', 'like and share', 'follow for more', 'let me know in the comments',
  'read till the end', 'you won\'t believe',
];

export const HEDGES = [
  'might', 'could be', 'perhaps', 'generally', 'typically', 'somewhat',
  'arguably', 'i think', 'i believe', 'kind of', 'sort of', 'fairly', 'relatively',
  'in some ways', 'to some extent', 'it seems',
];

export const BAD_OPENERS = [
  /^in the world of/i, /^as a (pm|product manager|founder)/i, /^have you ever/i,
  /^let'?s talk about/i, /^i'?ve been thinking about/i, /^in recent years/i,
  /^picture this/i, /^imagine/i, /^we all know/i,
];

// Appeals to authority with no authority named. Worse than no citation: an
// employer who cannot check "public reporting described sharp cool-downs"
// discounts every number in the piece, including the ones you can defend.
export const VAGUE_SOURCING = [
  'public reporting', 'reports suggest', 'studies show', 'research shows',
  'it is widely', 'many teams report', 'secondary outlets', 'industry data',
  'sources indicate', 'some estimates', 'commonly cited',
];

// Every field is load-bearing. Cost is the one that separates a post from a
// press release, so it is checked hardest (see WRITING.md section 4).
export const EVIDENCE_FIELDS = [
  'Claim', 'Moment', 'Numbers', 'Names', 'Cost', 'Counterexample', 'Reader action',
];

const SPECS = {
  post:    { minWords: 150, maxWords: 350,  minDensity: 5.0, maxHook: 12 },
  article: { minWords: 900, maxWords: 2200, minDensity: 6.0, maxHook: 15 },
};

// ---------------------------------------------------------------- analysis

const STOP_CAPS = new Set(['The', 'A', 'An', 'I', 'It', 'This', 'That', 'But', 'And',
  'If', 'When', 'What', 'Why', 'How', 'So', 'Then', 'You', 'We', 'They', 'There',
  'He', 'She', 'My', 'Most', 'Every', 'No', 'Not', 'One', 'Two', 'Now', 'Here']);

function sentences(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map(s => s.trim())
    .filter(s => s.length > 1);
}

function words(text) {
  return text.split(/\s+/).filter(w => /[a-z0-9]/i.test(w));
}

function stdev(nums) {
  if (nums.length < 2) return 0;
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const v = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / (nums.length - 1);
  return Math.sqrt(v);
}

/** Specificity = things a generic article could not contain. */
const NUM_WORDS = 'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|dozen|half';

function countSpecifics(text) {
  const spans = [];
  // Ordered most specific first. Later patterns cannot claim characters an
  // earlier pattern already took, so "$48,000" counts once as money, not twice.
  const patterns = [
    [/\$\s?[\d,.]+\s?(k|m|bn|b|million|billion)?/gi, 'money'],
    [/\b\d+(\.\d+)?\s?%/g, 'percent'],
    [/\b\d{4}-\d{2}-\d{2}\b/g, 'date'],
    [/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}(,?\s+\d{4})?/gi, 'date'],
    [/\bq[1-4]\s?('?\d{2}|\d{4})?\b/gi, 'quarter'],
    [new RegExp(`\\b(${NUM_WORDS})\\s+[a-z]{3,}`, 'gi'), 'measure'],
    [/\b\d[\d,]*(\.\d+)?(st|nd|rd|th|x|k|m)?\b/gi, 'number'],
  ];

  const taken = (a, b) => spans.some(s => a < s.end && b > s.start);
  for (const [re, kind] of patterns) {
    for (const m of text.matchAll(re)) {
      const start = m.index, end = m.index + m[0].length;
      if (!taken(start, end)) spans.push({ start, end, kind, text: m[0].trim() });
    }
  }

  // Proper nouns, skipping the first token of each sentence.
  for (const s of sentences(text)) {
    const at = text.indexOf(s);
    const toks = s.split(/\s+/);
    let cursor = 0;
    for (let i = 0; i < toks.length; i++) {
      const raw = toks[i];
      const idx = s.indexOf(raw, cursor);
      cursor = idx + raw.length;
      if (i === 0) continue;
      const t = raw.replace(/[^A-Za-z0-9.'-]/g, '');
      if (/^[A-Z][A-Za-z0-9.'-]{2,}$/.test(t) && !STOP_CAPS.has(t)) {
        const start = at + idx, end = start + raw.length;
        if (!taken(start, end)) spans.push({ start, end, kind: 'name', text: t });
      }
    }
  }
  return spans;
}

// A receipt is something a reader could check, or something that cost the
// author to admit. "three surfaces" and "30 seconds" are neither, and the old
// gate counted them, which is how articles/02 scored 100/100 with nothing in it
// a stranger could verify.
const STRONG_RECEIPTS = [
  [/\$\s?[\d,.]+/, 'money'],
  [/\b\d+(\.\d+)?\s?%/, 'percentage'],
  [/\b\d{4}-\d{2}-\d{2}\b/, 'ISO date'],
  [/\bq[1-4]\s?(20\d\d|'\d\d)\b/i, 'quarter'],
  [/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+20\d\d/i, 'calendar date'],
  [/\b(in|since|during|by)\s+20\d\d\b/i, 'year anchor'],
  [/\b(i was wrong|got it wrong|it broke|we broke|didn'?t work|failed|lost|missed|regret|my mistake|shipped it anyway|had to roll back|i shipped a bug|i mispriced|i misread)\b/i, 'admission'],
  // First-person admissions of a gap. Narrow on purpose: "I have not" only
  // counts in first person, so "teams have not" cannot buy a receipt.
  [/\bi (have not|had not|haven'?t|hadn'?t) \w+/i, 'admission'],
  [/\bwould have (shipped|published|posted|sent|listed)\b/i, 'near miss'],
  // A path or URL into something the reader can actually open and run.
  [/\b(scripts|tools|apps|articles|posts|data)\/[\w./-]+/, 'artifact path'],
  [/https?:\/\/[^\s)]+/, 'link'],
];

function strongReceipts(text) {
  return STRONG_RECEIPTS.filter(([re]) => re.test(text)).map(([, label]) => label);
}

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
  const spec = SPECS[kind] || SPECS.post;
  const { data, body, hasFrontmatter } = parseFrontmatter(raw);

  // For posts, only the Draft section is the published artifact. Editorial
  // headers above it are notes to self and must not dilute the stats.
  const li = kind === 'post' ? analyzeLinkedIn(body) : null;
  const source = li ? li.draft : body;

  const text = source
    .replace(/<!--[\s\S]*?-->/g, '')     // evidence block never counts
    .replace(/^#{1,6}\s.*$/gm, '')       // headings excluded from prose stats
    .trim();
  const lower = text.toLowerCase();

  const sents = sentences(text);
  const wordList = words(text);
  const wc = wordList.length;
  const lens = sents.map(s => words(s).length).filter(n => n > 0);
  const specifics = countSpecifics(text);
  const density = wc ? (specifics.length / wc) * 100 : 0;
  const hedgeHits = HEDGES.filter(h => lower.includes(h));
  const hedgeCount = HEDGES.reduce(
    (n, h) => n + (lower.match(new RegExp(`\\b${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')) || []).length, 0);

  const checks = [];
  const add = (id, label, status, detail) => checks.push({ id, label, status, detail });

  // ------------------------------------------------------------ registration
  add('registered', 'Has frontmatter', hasFrontmatter ? 'pass' : 'fail',
    hasFrontmatter ? `status: ${data.status || 'draft'}`
      : 'no frontmatter. The gate and the publisher both treat this file as invisible.');

  // ------------------------------------------------------------ hard fails
  const dashes = (text.match(/—/g) || []).length + (text.match(/\s–\s/g) || []).length;
  add('dashes', 'No em dashes', dashes ? 'fail' : 'pass',
    dashes ? `${dashes} found. Replace with a period or a comma.` : 'clean');

  const hasTakeaway =
    /^\s*\*{0,2}takeaway\*{0,2}\s*:/im.test(source) ||
    /^#{1,6}\s+\*{0,2}takeaway\*{0,2}\s*$/im.test(source);
  add('takeaway', 'Ends with a Takeaway', hasTakeaway ? 'pass' : 'fail',
    hasTakeaway ? 'present' : 'add a Takeaway section or Takeaway: line at the end');

  const tells = LLM_TELLS.filter(t => lower.includes(t));
  add('tells', 'No LLM tells', tells.length ? 'fail' : 'pass',
    tells.length ? tells.slice(0, 6).join(', ') : 'clean');

  const notJust = /\bnot (just|only)\b[^.;]{1,60}\b(but|it'?s)\b/i.test(text);
  add('notjust', 'No "not just X, but Y"', notJust ? 'fail' : 'pass',
    notJust ? 'rewrite as a direct claim' : 'clean');

  const baitHits = BAIT.filter(b => lower.includes(b));
  add('bait', 'No engagement bait', baitHits.length ? 'fail' : 'pass',
    baitHits.length ? baitHits.join(', ') : 'clean');

  const first = sents[0] || '';
  const firstLen = words(first).length;
  const badOpener = BAD_OPENERS.some(re => re.test(first));
  const firstOk = !badOpener && (firstLen <= spec.maxHook || /\d/.test(first) ||
    countSpecifics(first).some(h => h.kind === 'name'));
  add('hook', 'Hook lands', firstOk ? 'pass' : 'fail',
    badOpener ? 'banned opener' : firstOk ? `${firstLen} words` :
    `${firstLen} words with no number or name. Cut it or anchor it.`);

  add('density', 'Specificity density', density >= spec.minDensity ? 'pass' : 'fail',
    `${density.toFixed(1)} per 100 words (need ${spec.minDensity}). ${specifics.length} specifics in ${wc} words.`);

  const receipts = strongReceipts(text);
  add('receipts', 'Has receipts', receipts.length ? 'pass' : 'fail',
    receipts.length ? receipts.join(', ')
      : 'nothing checkable and nothing admitted. A bare count is not a receipt.');

  // A named source with a link is evidence. "Public reporting described" is a
  // shrug wearing evidence's clothes, and it discounts the claims either side.
  const vague = VAGUE_SOURCING.filter(v => lower.includes(v));
  add('sourcing', 'Named sources', vague.length ? 'fail' : 'pass',
    vague.length ? `${vague.join(', ')}. Name the source and link it, or cut the claim.` : 'clean');

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

  // ------------------------------------------------------------ warns
  const sd = stdev(lens);
  add('rhythm', 'Sentence variance', sd >= 5.5 ? 'pass' : 'warn',
    `stdev ${sd.toFixed(1)} (want 5.5+). Add a short sentence. Then a long specific one.`);

  const hedgeRate = wc ? (hedgeCount / wc) * 100 : 0;
  add('hedges', 'Hedge density', hedgeRate < 2.5 ? 'pass' : 'warn',
    `${hedgeRate.toFixed(1)}% ${hedgeHits.length ? `(${hedgeHits.slice(0, 5).join(', ')})` : ''}`);

  const lenOk = wc >= spec.minWords && wc <= spec.maxWords;
  add('length', 'Word count', lenOk ? 'pass' : 'warn',
    `${wc} words (target ${spec.minWords} to ${spec.maxWords})`);

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

  const fails = checks.filter(c => c.status === 'fail').length;
  const warns = checks.filter(c => c.status === 'warn').length;
  const score = Math.max(0, Math.round(100 - fails * 10 - warns * 4));

  return {
    checks, score, fails, warns,
    stats: { wc, density, sd, specifics: specifics.length, hedgeRate, chars: li?.chars ?? null },
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
