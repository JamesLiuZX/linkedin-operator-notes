#!/usr/bin/env node
// scripts/hub-build.mjs
//
// Builds the AI Workflow Handbook into site/dist as real HTML files, one per
// page, each with its own title, description and link-preview tags. Run it
// AFTER the Vite build of the older single-page app:
//
//   npm --prefix site run build && node scripts/hub-build.mjs
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
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createServer } from "node:http";

import { SITE, STAGES, ROLES } from "../hub/site.config.mjs";
import { page } from "../hub/lib/html.mjs";
import { loadWorkflows, loadGuides, loadIssues, loadSkills, loadDigests } from "../hub/lib/content.mjs";
import { zip } from "../hub/lib/zip.mjs";
import * as pages from "../hub/lib/pages.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "site", "dist");
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
  if (!existsSync(shell)) return false;
  const html = await readFile(shell, "utf8");
  if (!html.includes('id="app"')) return false;
  await writeFile(join(DIST, "404.html"), html);
  await writeFile(join(DIST, "spa.html"), html);
  return true;
}

async function bundle() {
  const out = join(DIST, "hub");
  await rm(out, { recursive: true, force: true });
  await mkdir(join(out, "fonts"), { recursive: true });

  const fonts = [
    ["@fontsource-variable/geist/files/geist-latin-wght-normal.woff2", "geist-latin-wght-normal.woff2"],
    ["@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2", "geist-mono-latin-wght-normal.woff2"],
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
  });
  const css = await esbuild.build({
    ...common,
    entryPoints: { hub: "hub/src/styles/hub.css" },
    entryNames: "[name].[hash]",
    external: ["./fonts/*"],
  });

  const outFile = (meta, entry) => {
    const hit = Object.entries(meta.outputs).find(([, o]) => o.entryPoint === entry);
    return hit ? "/" + hit[0].replace(/^site\/dist\//, "") : null;
  };
  return {
    js: outFile(js.metafile, "hub/src/js/app.js"),
    css: outFile(css.metafile, "hub/src/styles/hub.css"),
  };
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
    loadWorkflows(ROOT),
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

  for (const s of skills) {
    const files = await Promise.all(
      s.files.map(async (f) => ({ name: `${s.name}/${f.path}`, data: await readFile(f.full) }))
    );
    await write(`/skills/${s.name}.zip`, zip(files));
  }

  await write("/hub/routes.json", JSON.stringify(routes, null, 1));

  console.log(
    `hub: ${routes.length} pages, ${workflows.length} workflows, ${skills.length} skills, ${issues.length} issues` +
      ` at base ${BASE}${legacy ? " (old app kept at its routes)" : " (no old app in dist)"}`
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
