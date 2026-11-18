// hub/lib/templates.mjs
//
// Builds the single-file HTML templates the skills ship in assets/, and fills
// them with example data for the site. Each template is the same renderer the
// handbook's demos use, inlined with its CSS so the output opens anywhere:
// no build step, no network, no account.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createRequire } from "node:module";

/**
 * kind      the artifact (matches hub/src/js/standalone/<kind>.js)
 * skill     the skill folder the template belongs to
 * dataId    id of the <script type="application/json"> element the skill fills in (null for the prototype)
 * title     default <title>
 * blank     what the data slot holds until a skill replaces it
 */
export const TEMPLATES = [
  { kind: "prd", skill: "decision-prd", dataId: "prd-data", title: "PRD", example: "prd.json" },
  { kind: "prototype", skill: "flagged-prototype", dataId: null, title: "Prototype", example: "spec.js" },
  { kind: "board", skill: "journey-teardown", dataId: "teardown-data", title: "Journey teardown", example: "teardown.json" },
  { kind: "synthesis", skill: "interview-synthesis", dataId: "synthesis-data", title: "Interview synthesis", example: "synthesis.json" },
  { kind: "premortem", skill: "premortem", dataId: "premortem-data", title: "Pre-mortem", example: "premortem.json" },
  { kind: "readout", skill: "experiment-readout", dataId: "readout-data", title: "Experiment readout", example: "readout.json" },
];

const BASE_CSS = `*,*::before,*::after{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:#f3f3ef;color:#0b0c0c;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}img,svg{max-width:100%}`;

const safeJson = (obj) => JSON.stringify(obj, null, 1).replace(/<\/(script)/gi, "<\\/$1");

async function bundle(root, kind) {
  const require = createRequire(join(root, "site", "package.json"));
  const esbuild = require("esbuild");
  const common = { bundle: true, write: false, minify: true, absWorkingDir: root, logLevel: "warning", target: ["es2020"] };
  const js = await esbuild.build({ ...common, entryPoints: [`hub/src/js/standalone/${kind}.js`], format: "iife", loader: { ".json": "json" } });
  const css = await esbuild.build({ ...common, entryPoints: [`hub/src/styles/standalone/${kind}.css`] });
  return { js: js.outputFiles[0].text.trim(), css: css.outputFiles[0].text.trim() };
}

const CREDIT = (site) =>
  `<!-- Made with the ${site.name} skill "{{skill}}". Free, MIT licensed: ${site.defaultOrigin}/skills/ -->`;

/** The template as shipped in skills/<skill>/assets/template.html. */
export async function buildTemplate(root, site, t, blank) {
  const { js, css } = await bundle(root, t.kind);
  const credit = CREDIT(site).replace("{{skill}}", t.skill);
  if (t.kind === "prototype") {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${t.title}</title>
${credit}
<style>${BASE_CSS}${css}</style>
</head>
<body class="proto-page">
<div id="root"></div>
<script>${js}</script>
<script>
/* SPEC START: replace everything between the two markers with your spec. */
${blank}
/* SPEC END */
Prototype.create(document.getElementById("root"), spec, { hash: true });
document.title = spec.title || document.title;
</script>
</body>
</html>
`;
  }
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${t.title}</title>
${credit}
<style>${BASE_CSS}${css}</style>
</head>
<body>
<div id="root"></div>
<!-- DATA: replace the JSON inside this element with your own. -->
<script id="${t.dataId}" type="application/json">
${safeJson(blank)}
</script>
<script>${js}</script>
</body>
</html>
`;
}

/** Put data into a JSON template. */
export function fillJson(template, t, data) {
  const open = `<script id="${t.dataId}" type="application/json">`;
  const a = template.indexOf(open);
  const b = template.indexOf("</script>", a);
  if (a === -1 || b === -1) throw new Error(`template for ${t.kind} has no ${t.dataId} slot`);
  return template.slice(0, a + open.length) + "\n" + safeJson(data) + "\n" + template.slice(b);
}

/** Put a spec module (`export default { ... }`) into the prototype template. */
export function fillSpec(template, source) {
  const a = template.indexOf("/* SPEC START");
  const b = template.indexOf("/* SPEC END */");
  if (a === -1 || b === -1) throw new Error("prototype template has no spec slot");
  const start = template.indexOf("*/", a) + 2;
  const body = source.replace(/^\s*export\s+default\s+/m, "const spec = ").replace(/<\/(script)/gi, "<\\/$1");
  return template.slice(0, start) + "\n" + body.trim() + "\n" + template.slice(b);
}

export async function readExample(root, t, file = t.example, caseName = "tangelo") {
  return readFile(join(root, "skills", t.skill, "examples", caseName, file), "utf8");
}
