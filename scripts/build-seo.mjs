#!/usr/bin/env node
// scripts/build-seo.mjs
//
// The site is a client-routed SPA, so crawlers get one HTML shell for every URL.
// A real sitemap is the cheapest way to make the canonical paths discoverable.
// Run this AFTER the Vite build; it writes into site/dist.
//
//   node scripts/build-seo.mjs [--base https://example.com]
//
// Base URL resolution order: --base flag, SITE_URL, VERCEL_PROJECT_PRODUCTION_URL,
// VERCEL_URL. Falls back to a relative sitemap, which is still valid.

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "./lib/frontmatter.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "site", "dist");

const argv = process.argv.slice(2);
const flagBase = (() => {
  const i = argv.indexOf("--base");
  return i !== -1 ? argv[i + 1] : null;
})();

function resolveBase() {
  const candidates = [
    flagBase,
    process.env.SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  ].filter(Boolean);
  const picked = candidates.find((c) => !c.includes("your-site"));
  return (picked || "").replace(/\/$/, "");
}

// Statuses the live site actually renders. Must match site/src/content.js.
const LIVE = new Set(["published", "scheduled", "compliance-checked"]);

async function articles() {
  const dir = join(ROOT, "articles");
  let names = [];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }
  const out = [];
  for (const name of names) {
    if (extname(name) !== ".md" || basename(name).toLowerCase() === "readme.md") continue;
    const raw = await readFile(join(dir, name), "utf8");
    const { data } = parseFrontmatter(raw);
    const status = data.status || "draft";
    if (!LIVE.has(status)) continue;
    out.push({
      loc: `/${data.section || "notes"}/${data.slug || name.replace(/\.md$/, "")}`,
      lastmod: (data.publishedAt || data.publishAt || "").slice(0, 10) || null,
      priority: "0.8",
    });
  }
  return out;
}

/** Demo slugs, read from the registry so this cannot drift. */
async function demos() {
  const file = join(ROOT, "site", "src", "demos", "index.js");
  let src = "";
  try {
    src = await readFile(file, "utf8");
  } catch {
    return [];
  }
  const modules = [...src.matchAll(/from\s+"\.\/([\w-]+)\.js"/g)].map((m) => m[1]);
  const out = [];
  for (const mod of modules) {
    const body = await readFile(join(ROOT, "site", "src", "demos", `${mod}.js`), "utf8");
    const slug = /slug:\s*"([^"]+)"/.exec(body)?.[1];
    if (slug) out.push({ loc: `/demos/${slug}`, lastmod: null, priority: "0.7" });
  }
  return out;
}

const SECTIONS = ["markets", "agents", "shipping", "notes"];

async function main() {
  const base = resolveBase();
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: "/", lastmod: today, priority: "1.0" },
    { loc: "/demos", lastmod: today, priority: "0.9" },
    ...SECTIONS.map((s) => ({ loc: `/${s}`, lastmod: today, priority: "0.6" })),
    ...(await articles()),
    ...(await demos()),
  ];

  // /dashboard is deliberately absent: it is a working surface, not a landing page.

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${base}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  // Preview deploys must not be indexed. They can carry unpublished drafts
  // (VITE_SHOW_DRAFTS) and a duplicate of every canonical URL.
  const isProduction = (process.env.VERCEL_ENV || "production") === "production";

  const robots = isProduction
    ? `User-agent: *
Allow: /
Disallow: /dashboard
${base ? `\nSitemap: ${base}/sitemap.xml\n` : ""}`
    : `# Preview deployment. Not for indexing.
User-agent: *
Disallow: /
`;

  await mkdir(DIST, { recursive: true });
  await writeFile(join(DIST, "sitemap.xml"), xml);
  await writeFile(join(DIST, "robots.txt"), robots);

  console.log(
    `seo: wrote sitemap.xml (${urls.length} urls) and robots.txt` +
      `${isProduction ? "" : " [preview: noindex]"}` +
      `${base ? ` for ${base}` : " with relative locs (set SITE_URL for absolute)"}`
  );

  const liveArticles = urls.filter((u) => !["/", "/demos", ...SECTIONS.map((s) => `/${s}`)].includes(u.loc) && !u.loc.startsWith("/demos/"));
  if (liveArticles.length === 0) {
    console.log(
      "seo: note, 0 essays are published. Advance an article's status past 'draft' to put it in the sitemap."
    );
  }
}

main();
