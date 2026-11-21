#!/usr/bin/env node
// Check a prototype spec against the flagged-prototype quality bar.
//
//   node check.mjs spec.js                  the six scripted checks
//   node check.mjs spec.js --prd prd.json   also compare switch IDs with the PRD's point IDs
//   node check.mjs spec.js --json           the report as JSON
//
// Exit code 0 when every check passes, 1 when any fails, 2 when the spec cannot
// be loaded. No dependencies. It imports the spec, calls its screen functions
// and reads the HTML they return. It never opens a browser or the network.

import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const argv = process.argv.slice(2);
const prdAt = argv.indexOf("--prd");
const prdFile = prdAt === -1 ? null : argv[prdAt + 1];
const file = argv.find((a, i) => !a.startsWith("--") && !(prdAt !== -1 && i === prdAt + 1));
const asJson = argv.includes("--json");

if (!file) {
  console.error("usage: node check.mjs spec.js [--prd prd.json] [--json]");
  process.exit(2);
}

let spec;
try {
  spec = (await import(pathToFileURL(resolve(file)).href)).default;
  if (!spec || typeof spec !== "object") throw new Error("the file has no default export");
} catch (err) {
  console.error(`check.mjs: cannot load ${file}: ${err.message}`);
  process.exit(2);
}

const esc = (s) => String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const flags = spec.flags || [];
const ids = flags.map((f) => String(f.id));
const screens = spec.screens || {};
const names = Object.keys(screens);

/** A stand-in for the runtime's context, enough to call a screen function. */
function context(on, data) {
  return {
    on: (id) => !!on[id],
    pin: (id) => `<button type="button" class="pin" data-pin="${esc(id)}">${esc(id)}</button>`,
    flag: (id) => `data-flag="${esc(id)}"`,
    data,
    esc,
    screen: "",
  };
}

const freshData = () => (spec.state ? spec.state() : {});
const setOf = (list) => Object.fromEntries(ids.map((id) => [id, list === "all" || (list || []).includes(id)]));

function render(name, on, data = freshData()) {
  try {
    return String(screens[name].render(context(on, data)));
  } catch (err) {
    return `<!-- render error: ${err.message} -->`;
  }
}

/**
 * Every sheet or dialog the screens can open in a state, drawn. A change that
 * lives inside a dialog is still a change a reviewer can reach, so the checks
 * below read these as well as the screens.
 */
function sheetsFor(on) {
  const out = new Map();
  for (const n of names) {
    for (const m of render(n, on).matchAll(/data-sheet-open="([^"]+)"(?:[^>]*?data-k="([^"]*)")?/g)) {
      const key = `${m[1]}|${m[2] ?? ""}`;
      if (out.has(key) || !spec.sheets?.[m[1]]) continue;
      let html = "";
      try {
        html = String(spec.sheets[m[1]](context(on, freshData()), m[2]));
      } catch (err) {
        html = `<!-- render error: ${err.message} -->`;
      }
      out.set(key, { screen: n, html });
    }
  }
  return out;
}

const errors = { points: [], changes: [], pins: [], taps: [], journey: [], label: [] };
const warnings = [];

/* 1. Every PRD point has a switch. */
if (new Set(ids).size !== ids.length) errors.points.push("two switches share an ID");
for (const f of flags) {
  if (!String(f.label || "").trim()) errors.points.push(`${f.id}: the switch has no label`);
  if (!String(f.note || "").trim()) errors.points.push(`${f.id}: the switch has no note saying what changes and why`);
  for (const s of f.screens || []) if (!screens[s]) errors.points.push(`${f.id}: names screen "${s}", which does not exist`);
}
if (prdFile) {
  try {
    const prd = JSON.parse(await readFile(prdFile, "utf8"));
    const pointIds = (prd.sections || []).flatMap((s) => (s.points || []).map((p) => String(p.id)));
    for (const id of pointIds) if (!ids.includes(id)) errors.points.push(`PRD point ${id} has no switch`);
    for (const id of ids) if (!pointIds.includes(id)) errors.points.push(`switch ${id} is not a point in the PRD`);
  } catch (err) {
    errors.points.push(`cannot read ${prdFile}: ${err.message}`);
  }
}
const comparedWithPrd = Boolean(prdFile);

/* 2. Every switch changes at least one screen. */
const off = setOf([]);
const offSheets = sheetsFor(off);
for (const id of ids) {
  const only = setOf([id]);
  const changed = names.filter((n) => render(n, off) !== render(n, only));
  // A dialog that reads differently, or that only exists with the switch on, counts for the screen that opens it.
  const viaSheet = new Set();
  for (const [key, sheet] of sheetsFor(only)) if (offSheets.get(key)?.html !== sheet.html) viaSheet.add(sheet.screen);
  if (!changed.length && !viaSheet.size) errors.changes.push(`${id}: turning it on changes no screen and no dialog`);
  const declared = flags.find((f) => String(f.id) === id).screens || [];
  for (const n of changed) if (!declared.includes(n)) warnings.push(`${id}: also changes "${n}", which its screens list does not name`);
  for (const n of declared) if (screens[n] && !changed.includes(n) && !viaSheet.has(n)) warnings.push(`${id}: lists "${n}" but does not change it on its own`);
}

/* 3. Every pin has a switch behind it. */
const all = setOf("all");
const pinsSeen = new Set();
for (const n of names) {
  for (const m of render(n, all).matchAll(/data-pin="([^"]+)"/g)) {
    pinsSeen.add(m[1]);
    if (!ids.includes(m[1])) errors.pins.push(`screen "${n}" has a pin "${m[1]}" with no switch`);
  }
}
for (const [key, sheet] of sheetsFor(all)) {
  for (const m of sheet.html.matchAll(/data-pin="([^"]+)"/g)) {
    pinsSeen.add(m[1]);
    if (!ids.includes(m[1])) errors.pins.push(`dialog "${key.split("|")[0]}" has a pin "${m[1]}" with no switch`);
  }
}
for (const id of ids) if (!pinsSeen.has(id)) warnings.push(`${id}: no pin marks this change on any screen`);

/* 4. No dead taps. */
const LIVE = /data-(go|back|act|sheet-open|toast-text|close|pin)\b|href=/;
for (const state of [off, all]) {
  for (const n of names) {
    const html = render(n, state);
    if (html.startsWith("<!-- render error")) errors.taps.push(`screen "${n}" failed to render: ${html.slice(19, -4)}`);
    for (const m of html.matchAll(/<(button|a)\b[^>]*>/g)) {
      if (!LIVE.test(m[0])) errors.taps.push(`screen "${n}": a ${m[1]} does nothing: ${m[0].slice(0, 70)}`);
    }
    for (const m of html.matchAll(/data-go="([^"]+)"/g)) if (!screens[m[1]]) errors.taps.push(`screen "${n}" links to "${m[1]}", which does not exist`);
    for (const m of html.matchAll(/data-act="([^"]+)"/g)) if (!spec.actions?.[m[1]]) errors.taps.push(`screen "${n}" calls action "${m[1]}", which does not exist`);
    for (const m of html.matchAll(/data-sheet-open="([^"]+)"/g)) if (!spec.sheets?.[m[1]]) errors.taps.push(`screen "${n}" opens sheet "${m[1]}", which does not exist`);
  }
}
// Sheets are drawn too, once for every key a screen opens them with.
for (const state of [off, all]) {
  const opened = new Map();
  for (const n of names) for (const m of render(n, state).matchAll(/data-sheet-open="([^"]+)"(?:[^>]*?data-k="([^"]*)")?/g)) opened.set(`${m[1]}|${m[2] ?? ""}`, [m[1], m[2]]);
  for (const [name, k] of opened.values()) {
    if (!spec.sheets?.[name]) continue;
    let html = "";
    try {
      html = String(spec.sheets[name](context(state, freshData()), k));
    } catch (err) {
      errors.taps.push(`sheet "${name}" failed to render: ${err.message}`);
    }
    for (const m of html.matchAll(/<(button|a)\b[^>]*>/g)) if (!LIVE.test(m[0])) errors.taps.push(`sheet "${name}": a ${m[1]} does nothing: ${m[0].slice(0, 70)}`);
    for (const m of html.matchAll(/data-go="([^"]+)"/g)) if (!screens[m[1]]) errors.taps.push(`sheet "${name}" links to "${m[1]}", which does not exist`);
    for (const m of html.matchAll(/data-act="([^"]+)"/g)) if (!spec.actions?.[m[1]]) errors.taps.push(`sheet "${name}" calls action "${m[1]}", which does not exist`);
  }
}
errors.taps = [...new Set(errors.taps)];

/* 5. Any preset can finish the journey. */
const journey = spec.journey || [];
if (journey.length < 2) {
  errors.journey.push('the spec has no journey. Add journey: ["first", "next", ...] naming the main path.');
} else {
  const presets = [{ label: "everything off", on: [] }, ...(spec.presets || []).map((p) => ({ label: `preset "${p.label}"`, on: p.on }))];
  for (const p of presets) {
    const on = setOf(p.on);
    const data = freshData();
    for (let i = 0; i + 1 < journey.length; i++) {
      const [from, to] = [journey[i], journey[i + 1]];
      if (!screens[from] || !screens[to]) {
        errors.journey.push(`the journey names "${!screens[from] ? from : to}", which is not a screen`);
        break;
      }
      // A step is passable if the screen links to the next one, or one action leads there or unlocks the link.
      const reaches = () => new RegExp(`data-go="${to}"`).test(render(from, on, data));
      let ok = reaches();
      if (!ok) {
        const actions = [...render(from, on, data).matchAll(/data-act="([^"]+)"(?:[^>]*data-k="([^"]*)")?/g)];
        for (const [, name, k] of actions) {
          const res = spec.actions?.[name]?.(context(on, data), k, { reset() {}, jump() {} });
          if (res?.go === to || reaches()) {
            ok = true;
            break;
          }
        }
      }
      if (!ok) {
        errors.journey.push(`with ${p.label}, there is no way from "${from}" to "${to}"`);
        break;
      }
    }
  }
}

/* 6. Made-up data is labelled. */
if (!/illustrative|fictional|made up|made-up|not real|concept|sample data|placeholder/i.test(String(spec.legal || ""))) {
  errors.label.push("the legal line does not say the data is illustrative. Set spec.legal.");
}

const CHECKS = [
  ["points", "Every PRD point has a switch"],
  ["changes", "Every switch changes at least one screen"],
  ["pins", "Every pin has a switch behind it"],
  ["taps", "No dead taps"],
  ["journey", "Any preset can finish the journey"],
  ["label", "Made-up data is labelled"],
];
const report = {
  screens: names.length,
  switches: ids.length,
  checks: CHECKS.map(([id, name]) => ({
    id,
    name,
    pass: !errors[id].length,
    // Without --prd the IDs were checked against each other only, not against a PRD.
    partial: id === "points" && !comparedWithPrd,
    errors: errors[id],
  })),
  warnings,
};
const failed = report.checks.filter((c) => !c.pass);

if (asJson) {
  console.log(JSON.stringify(report, null, 1));
} else {
  console.log(`${report.screens} screens, ${report.switches} switches`);
  for (const c of report.checks) {
    console.log(`  ${!c.pass ? "FAIL" : c.partial ? "PART" : "PASS"}  ${c.name}${c.partial && c.pass ? " (no --prd given: IDs not compared with a PRD)" : ""}`);
    for (const e of c.errors) console.log(`        ${e}`);
  }
  console.log("  ----  All switches off is the product today (yours to judge)");
  if (warnings.length) {
    console.log("Warnings:");
    for (const w of warnings) console.log(`  - ${w}`);
  }
  const partial = report.checks.filter((c) => c.pass && c.partial).length;
  console.log(`${report.checks.length - failed.length - partial} of ${report.checks.length} scripted checks passed${partial ? `, ${partial} only in part` : ""}`);
}
process.exit(failed.length ? 1 : 0);
