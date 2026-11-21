#!/usr/bin/env node
// scripts/hub-build.mjs
//
// Builds the AI Workflow Handbook into site/dist as real HTML files, one per
// page, each with its own title, description and link-preview tags. Run it
// AFTER the Vite build of the older single-page app. scripts/build-seo.mjs
// does that for you: it ends by running this script, so `npm run site:build`
// and both deploy targets build the handbook without a step of their own.
//
//   npm run site:build          the whole site
//   npm run hub:build           the handbook only, into the existing site/dist
//   npm run hub:dev             build and serve on http://localhost:4173
//
// What it does, in order:
//   1. Keeps the old app reachable. Its shell (site/dist/index.html) is copied
//      to 404.html and spa.html, so its client-side routes still resolve on
//      GitHub Pages and Vercel after the handbook takes over "/".
//   2. Bundles hub/src (CSS and JS) with esbuild into site/dist/hub/.
//   3. Renders every page from hub/content, skills/ and digests/.
//   4. Writes the feed, llms.txt, the search index, the skill downloads and
//      hub/routes.json (read by scripts/build-seo.mjs for the sitemap).
//
// Environment: BASE_PATH (e.g. /linkedin-operator-notes/), SITE_URL (the
// public root, used for absolute links). `--serve [port]` builds and then
// serves site/dist for local checking.

import { readFile, writeFile, mkdir, copyFile, readdir, rm, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, extname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createServer } from "node:http";

import { SITE, STAGES, ROLES, CASES } from "../hub/site.config.mjs";
import { page } from "../hub/lib/html.mjs";
import { loadWorkflows, loadGuides, loadIssues, loadSkills, loadDigests } from "../hub/lib/content.mjs";
import { zip } from "../hub/lib/zip.mjs";
import * as pages from "../hub/lib/pages.mjs";
import { examples } from "./hub-templates.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// HUB_DIST builds into another folder, so two people (or agents) can preview at once.
const DIST = process.env.HUB_DIST ? resolve(process.env.HUB_DIST) : join(ROOT, "site", "dist");
const require = createRequire(join(ROOT, "site", "package.json"));
const esbuild = require("esbuild");
const { marked } = require("marked");

const argv = process.argv.slice(2);
const BASE = ("/" + (process.env.BASE_PATH || "/").replace(/^\/+|\/+$/g, "") + "/").replace(/^\/\/$/, "/");
const SITE_ROOT = (process.env.SITE_URL || SITE.defaultOrigin).replace(/\/+$/, "");

marked.setOptions({ gfm: true, breaks: false });

async function write(route, contents) {
  const file = route.endsWith("/") ? join(DIST, route, "index.html") : join(DIST, route);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, contents);
}

/** The old single-page app keeps working at its own routes. */
async function keepLegacyApp() {
  const shell = join(DIST, "index.html");
  // A second run finds the handbook's own index.html there. The old shell is already kept.
  const kept = existsSync(join(DIST, "spa.html"));
  if (!existsSync(shell)) return kept;
  const html = await readFile(shell, "utf8");
  if (!html.includes('id="app"')) return kept;
  await writeFile(join(DIST, "404.html"), html);
  await writeFile(join(DIST, "spa.html"), html);
  return true;
}

/** The file that holds each skill's output, inside an example folder. */
const EXAMPLE_FILE = {
  "journey-teardown": "teardown.json",
  "interview-synthesis": "synthesis.json",
  premortem: "premortem.json",
  "decision-prd": "prd.json",
  "flagged-prototype": "spec.js",
  "experiment-readout": "readout.json",
};

/**
 * "hub:examples": every worked example on disk, as a module the demos load
 * on demand. A new example folder is picked up by the next build with no
 * change to the site's code.
 */
function examplesPlugin() {
  const order = CASES.map((c) => c.id);
  const lines = [];
  for (const [skill, file] of Object.entries(EXAMPLE_FILE)) {
    const dir = join(ROOT, "skills", skill, "examples");
    const cases = order.filter((id) => existsSync(join(dir, id, file)));
    lines.push(`  ${JSON.stringify(skill)}: {\n${cases.map((id) => `    ${JSON.stringify(id)}: () => import(${JSON.stringify(join(dir, id, file))}),`).join("\n")}\n  },`);
  }
  const contents = `export const EXAMPLES = {\n${lines.join("\n")}\n};\n`;
  return {
    name: "hub-examples",
    setup(build) {
      build.onResolve({ filter: /^hub:examples$/ }, () => ({ path: "hub:examples", namespace: "hub-examples" }));
      build.onLoad({ filter: /.*/, namespace: "hub-examples" }, () => ({ contents, loader: "js", resolveDir: ROOT }));
    },
  };
}

async function bundle() {
  const out = join(DIST, "hub");
  await rm(out, { recursive: true, force: true });
  await mkdir(join(out, "fonts"), { recursive: true });

  const fonts = [
    ["@fontsource-variable/geist/files/geist-latin-wght-normal.woff2", "geist-latin-wght-normal.woff2"],
    ["@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2", "geist-mono-latin-wght-normal.woff2"],
    ["@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2", "bricolage-grotesque-latin-opsz-normal.woff2"],
  ];
  for (const [from, to] of fonts) await copyFile(require.resolve(from), join(out, "fonts", to));

  const common = {
    bundle: true,
    minify: !argv.includes("--no-minify"),
    metafile: true,
    outdir: out,
    logLevel: "warning",
    absWorkingDir: ROOT,
    target: ["es2022"],
  };
  const js = await esbuild.build({
    ...common,
    entryPoints: { app: "hub/src/js/app.js" },
    format: "esm",
    splitting: true,
    entryNames: "[name].[hash]",
    chunkNames: "chunks/[name].[hash]",
    loader: { ".json": "json", ".md": "text", ".svg": "text" },
    plugins: [examplesPlugin()],
  });
  const css = await esbuild.build({
    ...common,
    entryPoints: { hub: "hub/src/styles/hub.css" },
    entryNames: "[name].[hash]",
    external: ["./fonts/*"],
  });

  const outFile = (meta, entry) => {
    const hit = Object.entries(meta.outputs).find(([, o]) => o.entryPoint === entry);
    return hit ? "/" + relative(DIST, resolve(ROOT, hit[0])).split(sep).join("/") : null;
  };
  return {
    js: outFile(js.metafile, "hub/src/js/app.js"),
    css: outFile(css.metafile, "hub/src/styles/hub.css"),
  };
}

/** The old app's main sections as real files, so they answer 200 and not the 404 fallback. */
const LEGACY_SECTIONS = ["/archive/", "/digest/", "/courses/", "/demos/", "/dashboard/"];

/** One sitemap for both: the handbook's pages first, then whatever the old app's build listed. */
async function writeSitemap(routes, legacy) {
  const file = join(DIST, "sitemap.xml");
  const urls = new Map();
  for (const r of routes) {
    urls.set(SITE_ROOT + r.loc, `  <url><loc>${SITE_ROOT}${r.loc}</loc><lastmod>${r.lastmod}</lastmod><priority>${r.priority}</priority></url>`);
  }
  if (legacy) urls.set(SITE_ROOT + "/archive/", `  <url><loc>${SITE_ROOT}/archive/</loc><priority>0.3</priority></url>`);
  if (existsSync(file)) {
    const xml = await readFile(file, "utf8");
    for (const m of xml.matchAll(/<url>[\s\S]*?<\/url>/g)) {
      const loc = /<loc>(.*?)<\/loc>/.exec(m[0])?.[1] || "";
      // "/" belongs to the handbook now, and its own pages are already listed.
      const bare = loc.replace(/\/+$/, "");
      if (!loc || bare === "" || bare === SITE_ROOT || urls.has(loc)) continue;
      urls.set(loc, "  " + m[0].trim());
    }
  }
  await writeFile(file, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls.values()].join("\n")}\n</urlset>\n`);
  if (!existsSync(join(DIST, "robots.txt"))) {
    await writeFile(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ROOT}/sitemap.xml\n`);
  }
  return urls.size;
}

/** hub/static is copied as is; it holds rendered images, clips and example outputs. */
async function copyStatic() {
  const from = join(ROOT, "hub", "static");
  if (existsSync(from)) await cp(from, DIST, { recursive: true });
}

async function main() {
  await mkdir(DIST, { recursive: true });
  const legacy = await keepLegacyApp();
  const assets = await bundle();
  await copyStatic();

  const [workflows, guides, issues, skills, digests] = await Promise.all([
    loadWorkflows(ROOT, CASES.map((c) => c.id)),
    loadGuides(ROOT),
    loadIssues(ROOT),
    loadSkills(ROOT, SITE.repo.skillsDir),
    loadDigests(ROOT),
  ]);

  const ctx = {
    root: ROOT,
    url: (path) => (BASE + String(path).replace(/^\//, "")).replace(/\/{2,}/g, "/"),
    abs: (path) => SITE_ROOT + (path.startsWith("/") ? path : `/${path}`),
    assets,
    md: (s) => marked.parse(String(s || "")),
    mdInline: (s) => marked.parseInline(String(s || "")),
    site: SITE,
    stages: STAGES,
    roles: ROLES,
    cases: CASES,
    workflows,
    guides,
    issues,
    skills,
    digests,
    built: new Date().toISOString().slice(0, 10),
    exists: (rel) => existsSync(join(ROOT, rel)),
    read: (rel) => readFile(join(ROOT, rel), "utf8"),
  };
  ctx.workflow = (slug) => workflows.find((w) => w.slug === slug);
  ctx.skill = (name) => skills.find((s) => s.name === name);

  const routes = [];
  const emit = async (p) => {
    await write(p.path, page(ctx, p));
    if (!p.noindex) routes.push({ loc: p.path, priority: p.priority || "0.7", lastmod: p.lastmod || ctx.built });
  };

  for (const p of await pages.all(ctx)) await emit(p);

  // Machine-readable twins and downloads.
  for (const f of await pages.files(ctx)) await write(f.path, f.contents);

  // Every worked example as a finished page, built from the skill's own template.
  const built = await examples(ROOT);
  for (const e of built) await write(e.path, e.contents);

  for (const s of skills) {
    const files = await Promise.all(
      s.files.map(async (f) => ({ name: `${s.name}/${f.path}`, data: await readFile(f.full) }))
    );
    await write(`/skills/${s.name}.zip`, zip(files));
  }

  await write("/hub/routes.json", JSON.stringify(routes, null, 1));

  if (legacy) {
    const shell = await readFile(join(DIST, "spa.html"), "utf8");
    for (const r of LEGACY_SECTIONS) await write(r, shell);
  }
  const listed = await writeSitemap(routes, legacy);

  console.log(
    `hub: ${routes.length} pages, ${workflows.length} workflows, ${skills.length} skills, ${built.length} examples, ${issues.length} issues` +
      `, ${listed} urls in the sitemap, at base ${BASE}${legacy ? " (old app kept at its routes)" : " (no old app in dist)"}`
  );
}

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".zip": "application/zip",
  ".mp4": "video/mp4", ".pdf": "application/pdf", ".webm": "video/webm",
};

function serve(port) {
  createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (BASE !== "/" && path.startsWith(BASE)) path = "/" + path.slice(BASE.length);
    let file = join(DIST, path);
    if (existsSync(file) && !extname(file)) file = join(file, "index.html");
    if (!existsSync(file)) file = join(DIST, "404.html");
    try {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  }).listen(port, () => console.log(`hub: serving site/dist on http://localhost:${port}${BASE}`));
}

await main();
const s = argv.indexOf("--serve");
if (s !== -1) serve(Number(argv[s + 1]) || 4173);
