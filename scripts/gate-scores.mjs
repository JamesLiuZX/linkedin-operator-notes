#!/usr/bin/env node
// scripts/gate-scores.mjs
//
// Emits site/src/gate-scores.json so the site can show each piece's real gate
// score without reimplementing the checker in the browser. The score is the
// repo's own quality signal, and a visitor evaluating the author is better
// served seeing it than not.
//
// This is also the ONLY correct source for a per-file score anywhere in the
// browser bundle. The file-specific checks (cannibalization against
// derivedFrom, LinkedIn-renderable, evidence block, provenance) need real fs
// access to resolve, which a browser bundle cannot do, so nothing client-side
// may recompute a score for a real repo file. It must read this JSON instead.
// The dashboard learned this the hard way: it used to call the lighter
// core-only analyze() straight from lib/analyze.mjs, which quietly agreed
// with npm run content:check on nothing but the shared prose checks. See
// posts/17-gate-drift.md for the same bug, once already, in a different pair
// of files.
//
// Also records whether a piece carries unfilled {{ }} slots, which is what the
// production build uses to decide visibility: a piece the gate refuses to pass
// is a piece that has no business on a public URL.
//
// Run before `vite build`. CI does this via `npm run site:data`.

import { readFile, readdir, writeFile, access, mkdir } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyze } from './content-check.mjs';
import { parseFrontmatter } from './lib/frontmatter.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'site/src/gate-scores.json');

async function sourceContext(from) {
  if (!from) return {};
  const candidate = resolve(ROOT, String(from));
  try {
    await access(candidate);
    const raw = await readFile(candidate, 'utf8');
    const isProse = /\.(md|markdown|txt)$/i.test(candidate);
    return {
      sourceExists: true,
      sourceText: isProse
        ? parseFrontmatter(raw).body.replace(/<!--[\s\S]*?-->/g, ' ')
        : '',
    };
  } catch {
    return { sourceExists: false };
  }
}

const out = {};
for (const [dir, kind] of [['articles', 'article'], ['posts', 'post']]) {
  let files = [];
  try { files = await readdir(join(ROOT, dir)); } catch { continue; }
  for (const f of files.filter((x) => /^\d.*\.md$/.test(x))) {
    const raw = await readFile(join(ROOT, dir, f), 'utf8');
    const { data } = parseFrontmatter(raw);
    const slug = data.slug || f.replace(/\.md$/, '');
    const r = analyze(raw, kind, kind === 'post' ? await sourceContext(data.derivedFrom) : {});
    const holes = r.checks.find((c) => c.id === 'placeholders');
    out[slug] = {
      score: r.score,
      fails: r.fails,
      warns: r.warns,
      // A piece with an unfilled slot is unfinished by definition. The site
      // uses this, not the status field, to decide what goes public.
      hasHoles: holes ? holes.status === 'fail' : false,
      // Full per-check detail, not just the totals, so a UI (the dashboard)
      // can show which named check failed and why without re-scoring the
      // file itself.
      checks: r.checks,
    };
  }
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');

const total = Object.keys(out).length;
const shippable = Object.values(out).filter((v) => !v.hasHoles).length;
console.log(`  gate scores: ${total} piece(s), ${shippable} without unfilled slots -> ${OUT.replace(ROOT + '/', '')}`);
