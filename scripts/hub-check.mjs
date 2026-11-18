#!/usr/bin/env node
// scripts/hub-check.mjs
//
// The gate for the AI Workflow Handbook. Part of `npm run check`.
//
//   1. House style: no em dashes or en dashes in anything a reader sees.
//   2. Every skill's own checker passes on every worked example it ships.
//   3. A workflow page claims as many scripted checks as its checker runs.
//   4. The statistics pass their tests, and the Python and JavaScript
//      implementations agree.
//   5. Versions line up: skill, workflow page, plugin manifest, changelog.
//   6. Newsletter issues are well formed and every item names its source.
//   7. The page templates in skills/*/assets are current (needs the site's
//      dependencies; skipped with a note when they are not installed).
//
// Exit code 0 when everything passes, 1 otherwise. Reads files and runs the
// skills' own scripts. Writes nothing.

import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const rel = (p) => relative(ROOT, p).split("\\").join("/");
const failures = [];
const notes = [];
let passed = 0;

const ok = (name) => {
  passed++;
  console.log(`  PASS  ${name}`);
};
const fail = (name, detail) => {
  failures.push(name);
  console.log(`  FAIL  ${name}`);
  for (const line of [].concat(detail).slice(0, 12)) console.log(`        ${line}`);
};
const skip = (name, why) => {
  notes.push(`${name}: ${why}`);
  console.log(`  SKIP  ${name} (${why})`);
};

async function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of (await readdir(dir)).sort()) {
    if (name.startsWith(".") && name !== ".claude-plugin") continue;
    if (name === "node_modules" || name === "__pycache__") continue;
    const full = join(dir, name);
    if ((await stat(full)).isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const run = (cmd, args, cwd = ROOT) => {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  return { code: r.status, out: `${r.stdout || ""}${r.stderr || ""}`, missing: r.error?.code === "ENOENT" };
};
const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

/* ------------------------------------------------------------ 1. style */

const TEXT = new Set([".md", ".json", ".mjs", ".js", ".py", ".css", ".txt", ".html"]);
const DASH = /[\u2013\u2014]/;

async function style() {
  const roots = ["hub/content", "hub/lib", "hub/src", "hub/site.config.mjs", "skills", ".claude-plugin", "NEWSLETTER.md", "scripts/hub-build.mjs", "scripts/hub-templates.mjs", "scripts/hub-media.mjs", "scripts/weekly-send.mjs"];
  const hits = [];
  for (const r of roots) {
    const full = join(ROOT, r);
    if (!existsSync(full)) continue;
    const files = (await stat(full)).isDirectory() ? await walk(full) : [full];
    for (const file of files) {
      if (!TEXT.has(extname(file))) continue;
      const lines = (await readFile(file, "utf8")).split("\n");
      lines.forEach((line, i) => {
        if (DASH.test(line)) hits.push(`${rel(file)}:${i + 1}`);
      });
    }
  }
  if (hits.length) fail("No em dashes or en dashes", hits);
  else ok("No em dashes or en dashes");
}

/* --------------------------------------------- 2 and 3. skills' checkers */

// How each skill checks one example folder. `args` gets the example directory.
const CHECKERS = {
  "decision-prd": { cmd: "python3", file: "prd.json", args: () => ["scripts/check.py", "prd.json"] },
  "journey-teardown": { cmd: "python3", file: "teardown.json", args: () => ["scripts/check.py", "teardown.json"] },
  premortem: { cmd: "python3", file: "premortem.json", args: () => ["scripts/check.py", "premortem.json"] },
  "experiment-readout": { cmd: "python3", file: "readout.json", args: () => ["scripts/check.py", "readout.json"] },
  "interview-synthesis": { cmd: "python3", file: "synthesis.json", args: () => ["scripts/verify_quotes.py", "synthesis.json", "input"] },
  "flagged-prototype": {
    cmd: "node",
    file: "spec.js",
    args: (dir) => {
      const prd = join(ROOT, "skills", "decision-prd", "examples", dir.split("/").pop(), "prd.json");
      return existsSync(prd) ? ["scripts/check.mjs", "spec.js", "--prd", prd] : ["scripts/check.mjs", "spec.js"];
    },
  },
};

async function skills() {
  const dir = join(ROOT, "skills");
  const scripted = {};
  let python = true;
  for (const [skill, c] of Object.entries(CHECKERS)) {
    const examples = join(dir, skill, "examples");
    if (!existsSync(examples)) {
      fail(`${skill}: has a worked example`, "no examples folder");
      continue;
    }
    for (const name of (await readdir(examples)).sort()) {
      const ex = join(examples, name);
      if (!existsSync(join(ex, c.file))) continue;
      const args = c.args(ex).map((a, i) => (i === 0 ? join(dir, skill, a) : a));
      const r = run(c.cmd, args, ex);
      if (r.missing) {
        python = false;
        continue;
      }
      const m = /(\d+) of (\d+) scripted checks passed/.exec(r.out);
      if (m) scripted[skill] = Number(m[2]);
      if (r.code === 0) ok(`${skill}: its checker passes on examples/${name}`);
      else fail(`${skill}: its checker passes on examples/${name}`, r.out.trim().split("\n").filter((l) => /FAIL|^\s{6,}/.test(l)));
    }
    for (const need of ["SKILL.md", "references/format.md", "references/quality-bar.md", "assets/template.html"]) {
      if (!existsSync(join(dir, skill, need))) fail(`${skill}: ships ${need}`, "missing");
    }
  }
  if (!python) skip("Skill checkers", "python3 or node is not available here");
  return scripted;
}

async function pagesMatch(scripted) {
  const dir = join(ROOT, "hub", "content", "workflows");
  const bad = [];
  for (const slug of (await readdir(dir)).sort()) {
    const file = join(dir, slug, "meta.json");
    if (!existsSync(file)) continue;
    const m = await readJson(file);
    if (m.status === "planned") continue;
    const claimed = (m.checks || []).filter((c) => c.how === "script").length;
    const real = scripted[m.skill];
    if (real != null && claimed !== real) bad.push(`${slug}: the page lists ${claimed} scripted checks, the checker runs ${real}`);
    if (m.run && m.run.total != null && real != null && m.run.total !== real) bad.push(`${slug}: the run record says ${m.run.total} checks, the checker runs ${real}`);
    const skillFile = join(ROOT, "skills", m.skill || slug, "SKILL.md");
    if (!existsSync(skillFile)) {
      bad.push(`${slug}: no skill folder called ${m.skill}`);
      continue;
    }
    const v = /version:\s*"?([\d.]+)"?/.exec(await readFile(skillFile, "utf8"))?.[1];
    if (v !== m.version) bad.push(`${slug}: the page says version ${m.version}, SKILL.md says ${v}`);
    for (const input of m.example?.inputs || []) {
      if (!existsSync(join(ROOT, "skills", m.skill, "examples", m.example.case, input))) bad.push(`${slug}: example file ${input} does not exist`);
    }
    if (m.run?.log && !existsSync(join(ROOT, "skills", m.skill, m.run.log))) bad.push(`${slug}: run record ${m.run.log} does not exist`);
  }
  if (bad.length) fail("Workflow pages match their skills", bad);
  else ok("Workflow pages match their skills");
}

/* ------------------------------------------------------- 4. statistics */

function statistics() {
  const t = run("python3", [join(ROOT, "skills", "experiment-readout", "scripts", "test_ab_stats.py")]);
  if (t.missing) return skip("Statistics tests", "python3 is not available here");
  if (t.code === 0) ok(`Statistics tests (${/Ran (\d+) tests/.exec(t.out)?.[1] || "?"} tests)`);
  else fail("Statistics tests", t.out.trim().split("\n").slice(-8));
  const p = run("node", [join(ROOT, "scripts", "hub-stats-parity.mjs")]);
  if (p.code === 0) ok("Python and JavaScript statistics agree");
  else fail("Python and JavaScript statistics agree", p.out.trim().split("\n").slice(-6));
}

/* --------------------------------------------------------- 5. versions */

async function versions() {
  const bad = [];
  const plugin = await readJson(join(ROOT, "skills", ".claude-plugin", "plugin.json"));
  const market = await readJson(join(ROOT, ".claude-plugin", "marketplace.json"));
  if (!market.plugins?.some((p) => p.name === plugin.name && p.source === "./skills")) bad.push("marketplace.json does not list the plugin at ./skills");
  const logFile = join(ROOT, "hub", "content", "changelog.json");
  if (existsSync(logFile)) {
    const log = (await readJson(logFile)).filter((e) => e.version).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (log.length && log[0].version !== plugin.version) bad.push(`plugin.json is version ${plugin.version}, the newest changelog entry is ${log[0].version}. Bump both together.`);
  }
  if (bad.length) fail("Plugin manifest and changelog line up", bad);
  else ok("Plugin manifest and changelog line up");
}

/* ----------------------------------------------------------- 6. issues */

async function issues() {
  const dir = join(ROOT, "hub", "content", "issues");
  if (!existsSync(dir)) return ok("Newsletter issues are well formed (none yet)");
  const bad = [];
  const seen = new Set();
  const names = (await readdir(dir)).filter((n) => n.endsWith(".json")).sort();
  for (const name of names) {
    let i;
    try {
      i = await readJson(join(dir, name));
    } catch (err) {
      bad.push(`${name}: not valid JSON (${err.message})`);
      continue;
    }
    const at = (msg) => bad.push(`${name}: ${msg}`);
    if (!/^\d{4}-\d{2}-\d{2}/.test(name)) at("the file name has to start with the issue date, YYYY-MM-DD");
    if (!Number.isInteger(i.n)) at("n has to be the issue number");
    else if (seen.has(i.n)) at(`issue number ${i.n} is used twice`);
    seen.add(i.n);
    for (const k of ["date", "title", "preheader", "hook"]) if (!i[k]) at(`${k} is missing`);
    if (i.date && !name.startsWith(i.date)) at("the date does not match the file name");
    if ((i.title || "").length > 70) at("the title is over 70 characters");
    if ((i.preheader || "").length > 110) at("the preheader is over 110 characters");
    const slug = i.workflow?.slug;
    if (!slug || !existsSync(join(ROOT, "hub", "content", "workflows", slug, "meta.json"))) at(`workflow.slug "${slug}" is not a workflow`);
    if (!(i.workflow?.steps || []).length) at("workflow.steps is empty");
    if (!i.workflow?.prompt) at("workflow.prompt is missing");
    const things = i.things || [];
    if (things.length !== 3) at(`there are ${things.length} things, and each issue has three`);
    things.forEach((t, k) => {
      for (const f of ["title", "what", "why", "catch"]) if (!t[f]) at(`things[${k}].${f} is missing`);
      if (!/^https:\/\//.test(t.source?.url || "")) at(`things[${k}] has no https source`);
      if (!t.source?.label) at(`things[${k}].source.label is missing`);
    });
    if (!i.tip?.title || !i.tip?.body) at("the tip is missing");
    if (i.number && (!i.number.value || !i.number.label || !/^https:\/\//.test(i.number.source?.url || ""))) at("the number needs a value, a label and an https source");
  }
  if (bad.length) fail("Newsletter issues are well formed", bad);
  else ok(`Newsletter issues are well formed (${names.length})`);
}

/* -------------------------------------------------------- 7. templates */

function templates() {
  if (!existsSync(join(ROOT, "site", "node_modules", "esbuild"))) {
    return skip("Skill page templates are current", "site dependencies are not installed. Run npm run site:install");
  }
  const r = run("node", [join(ROOT, "scripts", "hub-templates.mjs"), "--check"]);
  if (r.code === 0) ok("Skill page templates are current");
  else fail("Skill page templates are current", r.out.trim().split("\n"));
}

console.log("hub-check: the AI Workflow Handbook");
await style();
const scripted = await skills();
await pagesMatch(scripted);
statistics();
await versions();
await issues();
templates();

if (failures.length) {
  console.log(`\nhub-check: ${failures.length} failed, ${passed} passed.`);
  process.exit(1);
}
console.log(`\nhub-check: all ${passed} checks passed${notes.length ? `, ${notes.length} skipped` : ""}.`);
