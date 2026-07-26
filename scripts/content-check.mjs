#!/usr/bin/env node
// scripts/content-check.mjs
// Quality gate for posts/ and articles/. Zero dependencies.
//
// Usage:
//   node scripts/content-check.mjs                  # check everything
//   node scripts/content-check.mjs articles/foo.md  # check specific files
//   node scripts/content-check.mjs --json           # machine readable
//   node scripts/content-check.mjs --warn-only      # never exit non-zero

import { readFile, readdir } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { parseFrontmatter } from './lib/frontmatter.mjs';

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

const RECEIPT_PATTERNS = [
  /\b\d+(\.\d+)?\s?%/,
  /\$\s?[\d,.]+/,
  /\bq[1-4]\b/i,
  /\b(20\d\d)\b/,
  /\b(i was wrong|got it wrong|it broke|we broke|didn'?t work|failed|lost|missed|regret|my mistake|shipped it anyway|had to roll back)\b/i,
];

export function analyze(raw, kind = 'post') {
  const spec = SPECS[kind] || SPECS.post;
  const { body } = parseFrontmatter(raw);
  const text = body
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

  // hard fails
  const dashes = (text.match(/—/g) || []).length + (text.match(/\s–\s/g) || []).length;
  add('dashes', 'No em dashes', dashes ? 'fail' : 'pass',
    dashes ? `${dashes} found. Replace with a period or a comma.` : 'clean');

  const hasTakeaway =
    /^\s*\*{0,2}takeaway\*{0,2}\s*:/im.test(body) ||
    /^#{1,6}\s+\*{0,2}takeaway\*{0,2}\s*$/im.test(body);
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

  const receipts = RECEIPT_PATTERNS.filter(re => re.test(text)).length;
  add('receipts', 'Has receipts', receipts ? 'pass' : 'fail',
    receipts ? `${receipts} receipt patterns` : 'no number, date, or admission. This is the Cost field being empty.');

  // warns
  const sd = stdev(lens);
  add('rhythm', 'Sentence variance', sd >= 5.5 ? 'pass' : 'warn',
    `stdev ${sd.toFixed(1)} (want 5.5+). Add a short sentence. Then a long specific one.`);

  const hedgeRate = wc ? (hedgeCount / wc) * 100 : 0;
  add('hedges', 'Hedge density', hedgeRate < 2.5 ? 'pass' : 'warn',
    `${hedgeRate.toFixed(1)}% ${hedgeHits.length ? `(${hedgeHits.slice(0, 5).join(', ')})` : ''}`);

  const lenOk = wc >= spec.minWords && wc <= spec.maxWords;
  add('length', 'Word count', lenOk ? 'pass' : 'warn',
    `${wc} words (target ${spec.minWords} to ${spec.maxWords})`);

  const fails = checks.filter(c => c.status === 'fail').length;
  const warns = checks.filter(c => c.status === 'warn').length;
  const score = Math.max(0, Math.round(100 - fails * 14 - warns * 5));

  return { checks, score, fails, warns, stats: { wc, density, sd, specifics: specifics.length, hedgeRate } };
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

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const warnOnly = argv.includes('--warn-only');
const files = argv.filter(a => !a.startsWith('--'));
const targets = files.length ? files : await collect();

const C = { red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m', dim: '\x1b[2m', off: '\x1b[0m' };
const results = [];
let totalFails = 0;

for (const path of targets) {
  const raw = await readFile(path, 'utf8');
  const { data } = parseFrontmatter(raw);
  const kind = path.startsWith('articles') ? 'article' : 'post';
  // drafts are advisory only
  const isDraft = (data.status || 'draft') === 'draft';
  const r = analyze(raw, kind);
  results.push({ path, kind, status: data.status || 'draft', ...r });
  if (!isDraft) totalFails += r.fails;

  if (!asJson) {
    const head = r.fails ? C.red : r.warns ? C.yellow : C.green;
    console.log(`\n${head}${r.score}/100${C.off}  ${path} ${C.dim}[${kind}, ${data.status || 'draft'}]${C.off}`);
    for (const c of r.checks) {
      if (c.status === 'pass') continue;
      const mark = c.status === 'fail' ? `${C.red}FAIL${C.off}` : `${C.yellow}warn${C.off}`;
      console.log(`  ${mark}  ${c.label}: ${c.detail}`);
    }
    if (isDraft && r.fails) console.log(`  ${C.dim}(draft, not blocking)${C.off}`);
  }
}

if (asJson) console.log(JSON.stringify(results, null, 2));
else console.log(`\n${targets.length} file(s). ${totalFails} blocking failure(s) on non-draft content.\n`);

process.exit(warnOnly || !totalFails ? 0 : 1);
