#!/usr/bin/env node
// Build the single-file prototype from a spec.
//
//   node build.mjs spec.js [prototype.html]
//
// Reads ../assets/template.html, puts the spec between its two markers and
// writes the result. No dependencies and no network. The output opens straight
// from disk.

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [specFile, outFile = "prototype.html"] = process.argv.slice(2);
if (!specFile) {
  console.error("usage: node build.mjs spec.js [prototype.html]");
  process.exit(2);
}

const here = dirname(fileURLToPath(import.meta.url));
const template = await readFile(join(here, "..", "assets", "template.html"), "utf8");
const source = await readFile(resolve(specFile), "utf8");

if (!/^\s*export\s+default\s+/m.test(source)) {
  console.error("build.mjs: the spec must contain `export default { ... }`.");
  process.exit(2);
}

const a = template.indexOf("/* SPEC START");
const b = template.indexOf("/* SPEC END */");
if (a === -1 || b === -1) {
  console.error("build.mjs: the template has lost its SPEC markers. Restore assets/template.html.");
  process.exit(2);
}
const start = template.indexOf("*/", a) + 2;
// The spec becomes a plain script: its default export turns into a constant
// named spec, and a closing script tag inside a string is escaped.
const body = source.replace(/^\s*export\s+default\s+/m, "const spec = ").replace(/<\/(script)/gi, "<\\/$1");

await writeFile(resolve(outFile), `${template.slice(0, start)}\n${body.trim()}\n${template.slice(b)}`);
console.log(`build.mjs: wrote ${outFile} (${Math.round((start + body.length + template.length - b) / 1024)} KB)`);
