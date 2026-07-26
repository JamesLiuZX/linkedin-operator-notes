// site/src/content.js
//
// REPLACES the hardcoded ARTICLES array in site/src/main.js.
// Adding an essay is now: drop a .md file in articles/. That is the whole step.
//
// Requires in vite.config.js:
//   server: { fs: { allow: ['..'] } }
//   resolve: { alias: { '@lib': path.resolve(__dirname, '../scripts/lib') } }

import { parseFrontmatter } from "@lib/frontmatter.mjs";

const articleFiles = import.meta.glob("../../articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
const postFiles = import.meta.glob("../../posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function fileSlug(path) {
  return path.split("/").pop().replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function firstHeading(body) {
  const m = /^#\s+(.+)$/m.exec(body);
  return m ? m[1].trim() : null;
}

function excerpt(body, n = 200) {
  const plain = body
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^#{1,6}\s.*$/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > n ? plain.slice(0, n).replace(/\s\S*$/, "") + "..." : plain;
}

function build(files, kind) {
  return Object.entries(files).map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw);
    const slug = data.slug || fileSlug(path);
    return {
      kind,
      slug,
      path,
      title: data.title || firstHeading(body) || slug,
      status: data.status || "draft",
      publishAt: data.publishAt || null,
      date: data.publishedAt || data.publishAt || /(\d{4}-\d{2}-\d{2})/.exec(path)?.[1] || null,
      tags: data.tags || [],
      section: data.section || "notes",
      series: data.series || "",
      summary: data.summary || excerpt(body),
      figure: data.figure || data.hero || null,
      heroAlt: data.heroAlt || "",
      readingMinutes: Math.max(1, Math.round(body.split(/\s+/).length / 225)),
      body,
      frontmatter: data,
      raw,
    };
  });
}

// Only 'published' renders on the live site. In DEV, show drafts too.
const VISIBLE = new Set(["published", "scheduled", "compliance-checked"]);
const isDev = import.meta.env?.DEV;

const all = [...build(articleFiles, "article"), ...build(postFiles, "post")]
  .filter((item) => {
    if (item.path.toLowerCase().includes("readme")) return false;
    if (isDev) return true;
    return VISIBLE.has(item.status) || item.status === "published";
  })
  .filter((item) => item.kind === "article" || isDev)
  .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

export const ARTICLES = all.filter((i) => i.kind === "article");
export const POSTS = all.filter((i) => i.kind === "post");
export const ALL = all;

export function bySlug(slug) {
  return all.find((i) => i.slug === slug) || null;
}

export const SECTIONS = [
  {
    id: "markets",
    title: "Market design",
    blurb: "Resolution, liquidity, incentives, and what breaks when real money shows up.",
  },
  {
    id: "agents",
    title: "Agents on rails",
    blurb: "LLMs pointed at systems that have consequences.",
  },
  {
    id: "shipping",
    title: "Shipping",
    blurb: "Zero to one inside a regulated exchange.",
  },
  {
    id: "notes",
    title: "Field notes",
    blurb: "Shorter observations from the desk.",
  },
];

export function bySection() {
  return SECTIONS.map((s) => ({ ...s, items: all.filter((i) => i.section === s.id) })).filter(
    (s) => s.items.length
  );
}
