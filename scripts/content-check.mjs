#!/usr/bin/env node
// scripts/content-check.mjs
// CLI wrapper around lib/analyze.mjs. The rules live there so the site
// dashboard, the content desk, and CI cannot disagree about a score.
//
// Usage:
//   node scripts/content-check.mjs                  # check everything
//   node scripts/content-check.mjs articles/foo.md  # check specific files
//   node scripts/content-check.mjs --json           # machine readable
//   node scripts/content-check.mjs --warn-only      # never exit non-zero

import { readFile, readdir } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { analyze } from "./lib/analyze.mjs";

export { analyze, LLM_TELLS, BAIT, HEDGES, BAD_OPENERS } from "./lib/analyze.mjs";

async function collect() {
  const out = [];
  for (const dir of ["posts", "articles"]) {
    let entries = [];
    try {
      entries = await readdir(dir);
    } catch {
      continue;
    }
    for (const f of entries) {
      if (extname(f) === ".md" && basename(f).toLowerCase() !== "readme.md") {
        out.push(join(dir, f));
      }
    }
  }
  return out;
}

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const warnOnly = argv.includes("--warn-only");
const files = argv.filter((a) => !a.startsWith("--"));
const targets = files.length ? files : await collect();

const C = {
  red: "\x1b[31m", yellow: "\x1b[33m", green: "\x1b[32m",
  dim: "\x1b[2m", off: "\x1b[0m",
};
const results = [];
let totalFails = 0;

for (const path of targets) {
  const raw = await readFile(path, "utf8");
  const { data } = parseFrontmatter(raw);
  const kind = path.startsWith("articles") ? "article" : "post";
  // drafts are advisory only
  const isDraft = (data.status || "draft") === "draft";
  const r = analyze(raw, kind);
  results.push({ path, kind, status: data.status || "draft", ...r });
  if (!isDraft) totalFails += r.fails;

  if (!asJson) {
    const head = r.fails ? C.red : r.warns ? C.yellow : C.green;
    console.log(
      `\n${head}${r.score}/100${C.off}  ${path} ${C.dim}[${kind}, ${data.status || "draft"}]${C.off}`
    );
    for (const c of r.checks) {
      if (c.status === "pass") continue;
      const mark = c.status === "fail" ? `${C.red}FAIL${C.off}` : `${C.yellow}warn${C.off}`;
      console.log(`  ${mark}  ${c.label}: ${c.detail}`);
    }
    if (isDraft && r.fails) console.log(`  ${C.dim}(draft, not blocking)${C.off}`);
  }
}

if (asJson) console.log(JSON.stringify(results, null, 2));
else console.log(`\n${targets.length} file(s). ${totalFails} blocking failure(s) on non-draft content.\n`);

process.exit(warnOnly || !totalFails ? 0 : 1);
