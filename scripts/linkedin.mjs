#!/usr/bin/env node
// scripts/linkedin.mjs
//
// Renders a post into exactly what goes in the LinkedIn composer, and shows the
// two things the composer will not tell you until it is too late: where the
// feed cuts the post off, and how many characters are left.
//
// Usage:
//   node scripts/linkedin.mjs posts/02-pm-opens-prs.md      # render one
//   node scripts/linkedin.mjs --list                        # queue with folds
//   node scripts/linkedin.mjs <file> --raw                  # body only, pipe-safe
//
// --raw prints the paste-ready body and nothing else:
//   node scripts/linkedin.mjs posts/09-... .md --raw | pbcopy

import { readFile, readdir } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';
import { parseFrontmatter } from './lib/frontmatter.mjs';
import { analyzeLinkedIn, FOLD, MAX } from './lib/linkedin.mjs';

const C = {
  red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m',
  dim: '\x1b[2m', bold: '\x1b[1m', inv: '\x1b[7m', off: '\x1b[0m',
};

const argv = process.argv.slice(2);
const raw = argv.includes('--raw');
const list = argv.includes('--list');
const targets = argv.filter(a => !a.startsWith('--'));

async function postFiles() {
  const entries = await readdir('posts');
  return entries
    .filter(f => extname(f) === '.md' && basename(f).toLowerCase() !== 'readme.md')
    .sort()
    .map(f => join('posts', f));
}

function bar(n, max, width = 32) {
  const filled = Math.min(width, Math.round((n / max) * width));
  return '#'.repeat(filled) + '.'.repeat(width - filled);
}

async function renderOne(path) {
  const src = await readFile(path, 'utf8');
  const { data, body } = parseFrontmatter(src);
  const li = analyzeLinkedIn(body);

  if (raw) {
    process.stdout.write(li.plain + '\n');
    if (li.firstComment) process.stdout.write('\n--- FIRST COMMENT ---\n' + li.firstComment + '\n');
    return;
  }

  const over = li.chars > MAX;
  console.log(`\n${C.bold}${data.title || basename(path)}${C.off}  ${C.dim}${path}${C.off}`);
  console.log(`${C.dim}status ${data.status || 'draft'} · derivedFrom ${data.derivedFrom || 'unset'}${C.off}`);

  // The fold, shown as the feed shows it.
  console.log(`\n${C.dim}--- above the fold (what the feed shows) ---${C.off}`);
  console.log(C.inv + li.fold.visible + C.off);
  if (li.fold.truncated) {
    console.log(`${C.dim}...see more${C.off}`);
    if (li.fold.cleanBreak === false) {
      console.log(`${C.yellow}note${C.off} the cut lands mid-word. Rework so a sentence ends near ${FOLD} chars.`);
    }
  }

  console.log(`\n${C.dim}--- paste this ---${C.off}`);
  console.log(li.plain);

  if (li.firstComment) {
    console.log(`\n${C.dim}--- first comment (post this immediately after) ---${C.off}`);
    console.log(li.firstComment);
  }

  const col = over ? C.red : li.chars < 400 ? C.yellow : C.green;
  console.log(`\n${col}${bar(li.chars, MAX)}${C.off} ${li.chars}/${MAX} chars`);
  if (li.unrenderable.length) {
    console.log(`${C.red}markdown that will paste literally:${C.off} ` +
      li.unrenderable.map(u => `${u.label} x${u.count}`).join(', '));
  }
  if (li.urls.length) {
    console.log(`${C.red}${li.urls.length} URL(s) in the body.${C.off} Outbound links suppress reach. Move them to the first comment.`);
  }
  if (li.hashtags.length) console.log(`${C.dim}hashtags:${C.off} ${li.hashtags.join(' ')}`);
}

async function renderList() {
  const files = await postFiles();
  console.log(`\n${C.bold}Queue${C.off} ${C.dim}(${files.length} atoms)${C.off}\n`);
  for (const path of files) {
    const src = await readFile(path, 'utf8');
    const { data, body } = parseFrontmatter(src);
    const li = analyzeLinkedIn(body);
    const status = (data.status || 'draft').padEnd(18);
    const chars = String(li.chars).padStart(4);
    const col = li.chars > MAX ? C.red : C.green;
    console.log(`${C.dim}${basename(path).padEnd(32)}${C.off} ${status} ${col}${chars}c${C.off}`);
    console.log(`  ${C.dim}fold:${C.off} ${li.fold.visible.replace(/\n+/g, ' ').slice(0, 96)}${li.fold.truncated ? '...' : ''}`);
  }
  console.log('');
}

if (list || !targets.length) {
  await renderList();
} else {
  for (const t of targets) await renderOne(t);
}
