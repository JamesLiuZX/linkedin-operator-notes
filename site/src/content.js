// site/src/content.js
//
// REPLACES the hardcoded ARTICLES array in site/src/main.js.
// Adding an essay is now: drop a .md file in articles/. That is the whole step.
//
// Requires in vite.config.js:
//   server: { fs: { allow: ['..'] } }
//   resolve: { alias: { '@lib': path.resolve(__dirname, '../scripts/lib') } }

import { parseFrontmatter } from "@lib/frontmatter.mjs";
import { draftBody, firstCommentBlock, fold } from "@lib/linkedin.mjs";
import { SECTIONS } from "@lib/sections.mjs";
import { VISIBLE_STATUSES } from "@lib/status.mjs";
import GATE from "./gate-scores.json";

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
      pillar: data.pillar || "",
      derivedFrom: data.derivedFrom || "",
      summary: data.summary || excerpt(body),
      figure: data.figure || data.hero || null,
      heroAlt: data.heroAlt || "",
      readingMinutes: Math.max(1, Math.round(body.split(/\s+/).length / 225)),
      // An atom's publishable body is the Draft section. Everything above it is
      // notes to the operator and must never reach a reader.
      draft: kind === "post" ? draftBody(body) : "",
      firstComment: kind === "post" ? firstCommentBlock(body) : "",
      fold: kind === "post" ? fold(draftBody(body)) : null,
      chars: kind === "post" ? draftBody(body).length : 0,
      gate: GATE[slug] || null,
      body,
      frontmatter: data,
      raw,
    };
  });
}

// Statuses that render publicly. A piece stays invisible until its status is
// advanced by hand, which is the editorial gate, not an accident.
// `ready` means the mechanical gate passes but a human has not signed it off,
// so it deliberately does NOT appear here. Exported so the UI's "draft" chip
// checks the exact same set as public visibility rather than a second,
// independently-maintained list that can silently drift from this one.
// The set itself lives in @lib/status.mjs, shared with scripts/build-seo.mjs,
// for the same reason.
export const VISIBLE = new Set(VISIBLE_STATUSES);
const isDev = import.meta.env?.DEV;

/**
 * Drafts are visible in dev, and on any deploy that opts in with
 * VITE_SHOW_DRAFTS=1. Use that on a preview deployment to read the whole
 * library before promoting anything. Never set it on production: it would
 * publish unedited drafts under the author's name.
 */
export const SHOW_DRAFTS = isDev || import.meta.env?.VITE_SHOW_DRAFTS === "1";

/**
 * A piece carrying an unfilled {{ }} slot is unfinished by definition: the
 * quality gate refuses to pass it and the publisher refuses to send it. This is
 * a floor under every other visibility rule, including SHOW_DRAFTS, so a
 * preview build can never leak "{{COST: name the thing that went wrong}}" onto
 * a public URL.
 */
const isFinished = (item) => !item.gate?.hasHoles;

// Everything on disk, before any visibility filtering. The dashboard needs the
// drafts; the public site must not render them.
const everything = [...build(articleFiles, "article"), ...build(postFiles, "post")].filter(
  (item) => !item.path.toLowerCase().includes("readme")
);

const all = everything
  .filter(isFinished)
  .filter((item) => (SHOW_DRAFTS ? true : VISIBLE.has(item.status)))
  // posts/ are LinkedIn and X drafts, not web pages. They never render publicly.
  .filter((item) => item.kind === "article" || SHOW_DRAFTS)
  .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

export const ARTICLES = all.filter((i) => i.kind === "article");
export const POSTS = all.filter((i) => i.kind === "post");
export const ALL = all;

export function bySlug(slug) {
  return all.find((i) => i.slug === slug) || null;
}

/**
 * Look an item up by its repo-relative path, e.g. "posts/09-resolution-linter.md".
 * The schedule refers to assets that way; the Vite glob keys are "../../posts/...".
 * Unlike bySlug this searches EVERY file, including ones the live site filters
 * out, because the dashboard has to show a draft that is not on the site yet.
 */
export function byPath(repoPath) {
  const want = String(repoPath || "").replace(/^\.?\//, "");
  if (!want) return null;
  return everything.find((i) => i.path.replace(/^(\.\.\/)+/, "") === want) || null;
}

/** Every parsed file regardless of status. Dashboard only. */
export const ALL_INCLUDING_DRAFTS = everything;

export { SECTIONS };

export function bySection() {
  return SECTIONS.map((s) => ({ ...s, items: all.filter((i) => i.section === s.id) })).filter(
    (s) => s.items.length
  );
}
