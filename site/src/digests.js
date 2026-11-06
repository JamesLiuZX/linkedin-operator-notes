// site/src/digests.js
//
// The portal's two data sources:
//   digests/<slug>.md + .json   the AI digest pages (DIGEST.md explains the format)
//   content/courses.json        James's own courses and the curated course picks
//
// A digest renders publicly only when its frontmatter says status: published.
// Dev builds and VITE_SHOW_DRAFTS=1 previews show the rest, same rule as essays.

import { parseFrontmatter } from "@lib/frontmatter.mjs";
import COURSES from "../../content/courses.json";

const pages = import.meta.glob("../../digests/*.md", { query: "?raw", import: "default", eager: true });
const cards = import.meta.glob("../../digests/*.json", { import: "default", eager: true });

const SHOW = Boolean(import.meta.env?.DEV) || import.meta.env?.VITE_SHOW_DRAFTS === "1";

/** Set to James's Substack URL to switch on the "get it by email" buttons. */
export const SUBSCRIBE_URL = "";

export const DIGESTS = Object.entries(pages)
  .filter(([path]) => !/readme\.md$/i.test(path))
  .map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw);
    const slug = data.slug || path.split("/").pop().replace(/\.md$/, "");
    return {
      slug,
      title: data.title || slug,
      date: String(data.date || ""),
      summary: data.summary || "",
      status: data.status || "draft",
      cover: data.cover || "",
      carousel: data.carousel || "",
      slides: Number(data.slides) || 0,
      body,
      cards: cards[path.replace(/\.md$/, ".json")] || null,
    };
  })
  .filter((d) => SHOW || d.status === "published")
  .sort((a, b) => b.date.localeCompare(a.date));

export function digestBySlug(slug) {
  return DIGESTS.find((d) => d.slug === slug) || null;
}

export function fmtDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export { COURSES };
