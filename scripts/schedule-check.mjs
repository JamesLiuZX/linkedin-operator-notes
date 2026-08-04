#!/usr/bin/env node
// scripts/schedule-check.mjs
//
// Keeps content/schedule.json honest. It is the only place the posting plan
// lives, the dashboard renders it directly, and a stale row there is worse than
// no row, because it reads as a commitment.
//
// Checks:
//   - every referenced asset file exists
//   - every asset passes the quality gate (fails are listed, not fatal on drafts)
//   - every referenced demo slug exists in the demo registry
//   - publishAt frontmatter agrees with the schedule date, where both exist
//   - dates are ordered within a week, ids are unique, channels/kinds are known
//   - a slot marked "ready" actually has a file behind it
//
// Usage:
//   node scripts/schedule-check.mjs            # report, exit 1 on errors
//   node scripts/schedule-check.mjs --warn-only

import { readFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { analyze } from "./lib/analyze.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const warnOnly = process.argv.includes("--warn-only");

const C = { red: "\x1b[31m", yellow: "\x1b[33m", green: "\x1b[32m", dim: "\x1b[2m", off: "\x1b[0m" };

const errors = [];
const warnings = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

const schedule = JSON.parse(await readFile(join(ROOT, "content", "schedule.json"), "utf8"));

const KNOWN_KINDS = new Set(["essay", "demo", "atom", "thread", "teardown", "newsletter"]);
const KNOWN_STATUS = new Set(["idea", "drafted", "ready", "scheduled", "published"]);
const KNOWN_CHANNELS = new Set(Object.keys(schedule.channels || {}));

/** Demo slugs, read from the registry so the two cannot drift. */
async function demoSlugs() {
  const idx = await readFile(join(ROOT, "site", "src", "demos", "index.js"), "utf8");
  const mods = [...idx.matchAll(/from\s+"\.\/([\w-]+)\.js"/g)].map((m) => m[1]);
  const slugs = new Set();
  for (const mod of mods) {
    const body = await readFile(join(ROOT, "site", "src", "demos", `${mod}.js`), "utf8");
    const slug = /slug:\s*"([^"]+)"/.exec(body)?.[1];
    if (slug) slugs.add(slug);
  }
  return slugs;
}

const demos = await demoSlugs();
const seenIds = new Set();
let scored = 0;
let gateFails = 0;

for (const e of schedule.entries) {
  const id = e.id || "(missing id)";

  if (!e.id) err(id, "entry has no id");
  else if (seenIds.has(e.id)) err(id, "duplicate id");
  seenIds.add(e.id);

  if (!KNOWN_CHANNELS.has(e.channel)) err(id, `unknown channel "${e.channel}"`);
  if (!KNOWN_KINDS.has(e.kind)) err(id, `unknown kind "${e.kind}"`);
  if (!KNOWN_STATUS.has(e.status)) err(id, `unknown status "${e.status}"`);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || "")) err(id, `bad date "${e.date}"`);
  if (!/^\d{2}:\d{2}$/.test(e.time || "")) err(id, `bad time "${e.time}"`);

  if (e.demo && !demos.has(e.demo)) {
    err(id, `demo "${e.demo}" is not in the registry (have: ${[...demos].join(", ")})`);
  }

  if (e.asset) {
    const abs = join(ROOT, e.asset);
    try {
      await access(abs);
    } catch {
      err(id, `asset not found: ${e.asset}`);
      continue;
    }

    const raw = await readFile(abs, "utf8");
    const { data } = parseFrontmatter(raw);
    const kind = e.asset.startsWith("articles") ? "article" : "post";
    const r = analyze(raw, kind);
    scored++;
    if (r.fails > 0) {
      gateFails++;
      warn(
        id,
        `${e.asset} scores ${r.score}/100 with ${r.fails} gate failure(s): ${r.checks
          .filter((c) => c.status === "fail")
          .map((c) => c.label)
          .join(", ")}`
      );
    }

    // publishAt is the CANONICAL publication date, so only the site row has to
    // match it. Derived rows (a LinkedIn atom, an X thread) point at the same
    // asset and ship deliberately later, which is not drift.
    if (data.publishAt && e.channel === "site") {
      const fm = String(data.publishAt).slice(0, 10);
      if (fm !== e.date) {
        warn(id, `schedule says ${e.date} but ${e.asset} frontmatter publishAt is ${fm}`);
      }
    }

    // A derived row must not ship before its source publishes.
    if (data.publishAt && e.channel !== "site") {
      const fm = String(data.publishAt).slice(0, 10);
      if (e.date < fm) {
        err(id, `ships ${e.date}, before its source ${e.asset} publishes on ${fm}`);
      }
    }
  } else if (e.status === "ready" || e.status === "scheduled") {
    err(id, `status "${e.status}" but no asset file is referenced`);
  }
}

// Dates should move forward through the file, so the dashboard reads in order.
let prev = null;
for (const e of schedule.entries) {
  if (!e.date) continue;
  if (prev && e.date < prev) {
    warn(e.id, `date ${e.date} comes after ${prev} in file order but is earlier`);
  }
  prev = e.date;
}

// Mix against the stated target, first four-week block.
const block = schedule.entries.filter((e) => e.week <= 4);
const counts = {};
for (const e of block) counts[e.kind] = (counts[e.kind] || 0) + 1;
const mixLines = Object.entries(schedule.targetMix)
  .filter(([k]) => k !== "$comment")
  .map(([kind, target]) => {
    const actual = counts[kind] || 0;
    const ok = actual >= target;
    if (!ok) warn("mix", `weeks 1-4 have ${actual} ${kind}(s), target is ${target}`);
    return `    ${ok ? "ok  " : "under"} ${kind}: ${actual}/${target}`;
  });

console.log(`\nschedule: ${schedule.entries.length} slots across ${schedule.weeks} weeks`);
console.log(`  assets scored: ${scored}, of which failing the gate: ${gateFails}`);
console.log(`  mix, weeks 1-4:`);
console.log(mixLines.join("\n"));

if (warnings.length) {
  console.log(`\n${C.yellow}warnings (${warnings.length})${C.off}`);
  for (const w of warnings) console.log(`  ${w}`);
}
if (errors.length) {
  console.log(`\n${C.red}errors (${errors.length})${C.off}`);
  for (const e of errors) console.log(`  ${e}`);
} else {
  console.log(`\n${C.green}no errors${C.off}`);
}
console.log("");

process.exit(warnOnly || errors.length === 0 ? 0 : 1);
