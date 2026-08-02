import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./config.mjs";
import { parseFrontmatter } from "../lib/frontmatter.mjs";
import { draftBody } from "../lib/linkedin.mjs";

const CONTENT_DIRS = [
  { dir: "articles", type: "article" },
  { dir: "posts", type: "post" },
];

function slugFromFilename(filename) {
  return filename.replace(/\.md$/, "");
}

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return String(value)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

// One definition of "the publishable part of a post", shared with the gate and
// the renderer. This used to be a second regex here that only matched the exact
// heading "## Draft (copy to LinkedIn)".
const extractPostDraft = draftBody;

export function loadContent() {
  const items = [];

  for (const { dir, type } of CONTENT_DIRS) {
    const absDir = join(ROOT, dir);
    let files;
    try {
      files = readdirSync(absDir).filter((f) => f.endsWith(".md") && !f.startsWith("README"));
    } catch {
      continue;
    }

    for (const file of files) {
      const path = join(dir, file);
      const raw = readFileSync(join(ROOT, path), "utf8");
      const { data: meta, body } = parseFrontmatter(raw);
      const slug = meta.slug || slugFromFilename(file);
      const title =
        meta.title ||
        body.match(/^#\s+(.+)$/m)?.[1]?.replace(/^Post \d+ —\s*/, "") ||
        slug;

      const content = type === "post" ? extractPostDraft(body) : body;
      const platforms = asList(meta.platforms).map((p) => p.toLowerCase());
      const tags = asList(meta.tags);
      const twitterBeats = asList(meta.twitterBeats);

      items.push({
        slug,
        title,
        type,
        kind: type,
        path,
        absPath: join(ROOT, path),
        status: String(meta.status || "draft").toLowerCase(),
        publishAt: meta.publishAt || null,
        platforms,
        tags,
        twitterExcerpt: meta.twitterExcerpt || "",
        twitterBeats,
        section: meta.section || (type === "article" ? "notes" : "notes"),
        series: meta.series || "",
        author: meta.author || "James Liu",
        hero: meta.hero || "",
        summary: meta.summary || "",
        frontmatter: meta,
        raw,
        body,
        content,
      });
    }
  }

  return items;
}

export function findDueItems(items, { now = new Date(), includeFuture = false } = {}) {
  return items.filter((item) => {
    if (!["scheduled", "compliance-checked"].includes(item.status)) return false;
    if (!item.platforms.length) return false;
    if (!item.publishAt) return false;
    const due = new Date(item.publishAt);
    if (Number.isNaN(due.getTime())) return false;
    return includeFuture ? true : due <= now;
  });
}

export function findBySlug(items, slug) {
  return items.find((item) => item.slug === slug);
}

export { parseFrontmatter };
