// hub/lib/content.mjs
//
// Loads everything the hub renders from disk:
//   hub/content/workflows/<slug>/meta.json + page.md   the handbook pages
//   hub/content/guides/<slug>.md                        short foundation pages
//   hub/content/issues/<date>.json                      newsletter issues
//   skills/<name>/                                      the installable pack
//   digests/*.md                                        the AI digest (news items)

import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { parseFrontmatter } from "../../scripts/lib/frontmatter.mjs";

async function ls(dir) {
  try {
    return (await readdir(dir)).sort();
  } catch {
    return [];
  }
}

async function walk(dir, base = dir) {
  const out = [];
  for (const name of await ls(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const s = await stat(full);
    if (s.isDirectory()) out.push(...(await walk(full, base)));
    else out.push({ path: relative(base, full).split("\\").join("/"), full, size: s.size });
  }
  return out;
}

/** Splits a page.md into its `## ` sections, keyed by a slug of the heading. */
export function sections(md) {
  const out = [];
  let cur = null;
  for (const line of String(md).split(/\r?\n/)) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      cur = { title: m[1], id: slugify(m[1]), body: [] };
      out.push(cur);
    } else if (cur) cur.body.push(line);
  }
  return out.map((s) => ({ ...s, body: s.body.join("\n").trim() }));
}

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export async function loadWorkflows(root) {
  const dir = join(root, "hub", "content", "workflows");
  const out = [];
  for (const slug of await ls(dir)) {
    const metaFile = join(dir, slug, "meta.json");
    if (!existsSync(metaFile)) continue;
    const meta = JSON.parse(await readFile(metaFile, "utf8"));
    const pageFile = join(dir, slug, "page.md");
    const md = existsSync(pageFile) ? await readFile(pageFile, "utf8") : "";
    out.push({ ...meta, slug, md, sections: sections(md) });
  }
  return out.sort((a, b) => (a.order || 99) - (b.order || 99));
}

export async function loadGuides(root) {
  const dir = join(root, "hub", "content", "guides");
  const out = [];
  for (const name of await ls(dir)) {
    if (!name.endsWith(".md")) continue;
    const raw = await readFile(join(dir, name), "utf8");
    const { data, body } = parseFrontmatter(raw);
    out.push({ slug: data.slug || name.replace(/\.md$/, ""), ...data, body });
  }
  return out.sort((a, b) => (a.order || 99) - (b.order || 99));
}

export async function loadIssues(root) {
  const dir = join(root, "hub", "content", "issues");
  const out = [];
  for (const name of await ls(dir)) {
    if (!name.endsWith(".json")) continue;
    const issue = JSON.parse(await readFile(join(dir, name), "utf8"));
    out.push({ slug: name.replace(/\.json$/, ""), ...issue });
  }
  return out.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/** A skill folder: its SKILL.md frontmatter and body, and every file in it. */
export async function loadSkills(root, skillsDir = "skills") {
  const dir = join(root, skillsDir);
  const out = [];
  for (const name of await ls(dir)) {
    const file = join(dir, name, "SKILL.md");
    if (!existsSync(file)) continue;
    const raw = await readFile(file, "utf8");
    const { data, body } = parseFrontmatter(raw);
    const files = await walk(join(dir, name));
    out.push({ name, dir: join(dir, name), raw, body, data, files });
  }
  return out;
}

/** Published AI digests, newest first, with their card data when present. */
export async function loadDigests(root) {
  const dir = join(root, "digests");
  const out = [];
  for (const name of await ls(dir)) {
    if (!name.endsWith(".md") || /readme/i.test(name)) continue;
    const { data, body } = parseFrontmatter(await readFile(join(dir, name), "utf8"));
    if (data.status !== "published") continue;
    const slug = data.slug || name.replace(/\.md$/, "");
    const cardFile = join(dir, name.replace(/\.md$/, ".json"));
    const cards = existsSync(cardFile) ? JSON.parse(await readFile(cardFile, "utf8")) : null;
    out.push({ slug, title: data.title || slug, date: String(data.date || ""), summary: data.summary || "", body, cards });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export { walk };
