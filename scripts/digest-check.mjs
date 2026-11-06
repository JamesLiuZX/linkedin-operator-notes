#!/usr/bin/env node
// scripts/digest-check.mjs
//
// Gate for the AI digest, part of `npm run check`. Zero dependencies.
// Covers what content-check.mjs does not see:
//   digests/<slug>.md     the portal page (frontmatter, sources, Takeaway, no dashes)
//   digests/<slug>.json   the card data the media renderer reads
//   site/public/digests/  the rendered media, required once a digest is published
//   the digest's post     its "## X thread": at most 9 tweets, each fits in 280
//   content/courses.json  the course list the /courses page reads
// The LinkedIn body of the digest post is gated by content-check.mjs like any atom.

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { xThreadTweets } from "./lib/linkedin.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);

const DASH = /—|\s–\s/;
const HTTPS = /^https:\/\/\S+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const PLATFORMS = new Set(["YouTube", "Udemy", "Coursera", "Maven", "Other"]);

function strings(v, out = []) {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => strings(x, out));
  return out;
}

// X counts every link as 23 characters, and the dashboard turns site-relative
// paths into full links before copying, so both are measured at link length.
function tweetLength(t) {
  return t.replace(/https?:\/\/\S+/g, "x".repeat(23)).replace(/(^|\s)\/[\w/-]+/g, "$1" + "x".repeat(23)).length;
}

async function checkPost(owner, postPath) {
  const abs = join(ROOT, postPath);
  if (!existsSync(abs)) return err(owner, `post ${postPath} not found`);
  const { body } = parseFrontmatter(await readFile(abs, "utf8"));
  const tweets = xThreadTweets(body);
  if (!tweets.length) return err(postPath, 'no "## X thread" section (tweets separated by lines of ---)');
  if (tweets.length > 9) err(postPath, `X thread has ${tweets.length} tweets, max 9`);
  tweets.forEach((t, i) => {
    const n = tweetLength(t);
    if (n > 280) err(postPath, `tweet ${i + 1} is ${n} characters, max 280`);
    if (DASH.test(t)) err(postPath, `tweet ${i + 1} has an em or en dash`);
  });
}

async function checkDigests() {
  const dir = join(ROOT, "digests");
  let names = [];
  try {
    names = await readdir(dir);
  } catch {
    return 0;
  }
  const pages = names.filter((n) => extname(n) === ".md" && n.toLowerCase() !== "readme.md");
  for (const name of pages) {
    const file = `digests/${name}`;
    const slug = name.replace(/\.md$/, "");
    const raw = await readFile(join(dir, name), "utf8");
    const { data, body, hasFrontmatter } = parseFrontmatter(raw);
    if (!hasFrontmatter) {
      err(file, "no frontmatter");
      continue;
    }
    for (const k of ["title", "slug", "date", "summary", "status"]) if (!data[k]) err(file, `frontmatter is missing ${k}`);
    if (data.slug && data.slug !== slug) err(file, `slug "${data.slug}" does not match the file name`);
    if (data.date && !DATE.test(String(data.date))) err(file, `date "${data.date}" is not YYYY-MM-DD`);
    if (data.date && !slug.startsWith(String(data.date))) err(file, "file name must start with the date");
    if (DASH.test(raw)) err(file, "em or en dash (WRITING.md hard rule)");
    if (/\{\{/.test(raw)) err(file, "unfilled {{ }} slot");
    if (!/^\s*takeaway\s*:/im.test(body)) err(file, "no Takeaway: line");
    const links = (body.match(/\]\(https:\/\/[^)\s]+\)/g) || []).length;
    if (links < 3) err(file, `${links} source link(s); every item needs one`);

    const jsonName = `digests/${slug}.json`;
    const jsonPath = join(dir, `${slug}.json`);
    if (!existsSync(jsonPath)) {
      err(file, `missing card data ${jsonName}`);
      continue;
    }
    let d;
    try {
      d = JSON.parse(await readFile(jsonPath, "utf8"));
    } catch (e) {
      err(jsonName, `invalid JSON: ${e.message}`);
      continue;
    }
    if (d.slug !== slug) err(jsonName, "slug does not match the page");
    if (!Array.isArray(d.items) || d.items.length < 3 || d.items.length > 6) err(jsonName, "needs 3 to 6 items");
    (d.items || []).forEach((it, i) => {
      for (const k of ["kicker", "title", "what", "why", "source", "url"]) if (!it[k]) err(jsonName, `item ${i + 1} is missing ${k}`);
      if (it.url && !HTTPS.test(it.url)) err(jsonName, `item ${i + 1} url is not https`);
    });
    (d.courses || []).forEach((c, i) => {
      for (const k of ["title", "platform", "price", "url", "note"]) if (!c[k]) err(jsonName, `course ${i + 1} is missing ${k}`);
    });
    if (strings(d).some((s) => DASH.test(s))) err(jsonName, "em or en dash in card copy");

    if (data.status === "published") {
      for (const m of ["cover.png", "slide-01.png", "carousel.pdf"]) {
        if (!existsSync(join(ROOT, "site", "public", "digests", slug, m))) {
          err(file, `published, but site/public/digests/${slug}/${m} is missing. Run npm run digest:render -- ${jsonName}`);
        }
      }
    }
    if (data.post) await checkPost(file, String(data.post));
  }
  return pages.length;
}

async function checkCourses() {
  const file = "content/courses.json";
  const path = join(ROOT, file);
  if (!existsSync(path)) return 0;
  let c;
  try {
    c = JSON.parse(await readFile(path, "utf8"));
  } catch (e) {
    err(file, `invalid JSON: ${e.message}`);
    return 0;
  }
  (c.mine || []).forEach((m, i) => {
    for (const k of ["slug", "title", "promise", "platform", "status"]) if (!m[k]) err(file, `mine[${i}] is missing ${k}`);
  });
  const seen = new Set();
  (c.picks || []).forEach((p, i) => {
    for (const k of ["added", "title", "provider", "platform", "price", "url", "why"]) if (!p[k]) err(file, `picks[${i}] is missing ${k}`);
    if (p.added && !DATE.test(p.added)) err(file, `picks[${i}].added is not YYYY-MM-DD`);
    if (p.platform && !PLATFORMS.has(p.platform)) err(file, `picks[${i}].platform "${p.platform}" is not one of ${[...PLATFORMS].join(", ")}`);
    if (p.url && !HTTPS.test(p.url)) err(file, `picks[${i}].url is not https`);
    if (p.url && seen.has(p.url)) err(file, `picks[${i}] repeats ${p.url}`);
    seen.add(p.url);
  });
  if (strings(c).some((s) => DASH.test(s))) err(file, "em or en dash");
  return (c.picks || []).length;
}

const pages = await checkDigests();
const picks = await checkCourses();
if (errors.length) {
  console.error(`digest-check: ${errors.length} error(s)`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(`digest-check: ${pages} digest(s), ${picks} course pick(s), clean`);
