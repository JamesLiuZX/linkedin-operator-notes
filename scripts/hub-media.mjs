#!/usr/bin/env node
// scripts/hub-media.mjs
//
// Renders the handbook's pictures and clips from the demos themselves. Every
// demo is a timeline that can be set to any moment, so a frame here is exactly
// what a visitor sees at that moment on the site.
//
//   node scripts/hub-media.mjs                       everything, for every workflow
//   node scripts/hub-media.mjs premortem             one workflow
//   node scripts/hub-media.mjs --only posters,og     some kinds: art, posters, og, carousel, clip
//
// Writes into hub/static/hub/, which the site build copies as it is:
//   art/<case>/<slug>.webp      a picture of each worked example's output, for tiles, cases and link cards
//   posters/<slug>.png          the demo's stage, wide, for the page and email
//   posters/<slug>-tall.png     the same in the 4:5 clip layout, for the carousel cover
//   og/<slug>.png, og/default.png    1200 by 630 link-preview cards
//   launch/<slug>/carousel.pdf  a LinkedIn document post: cover, one slide per step, closing slide
//   launch/<slug>/slide-01.png  the cover again as an image, for X and for previews
//   launch/<slug>/clip.mp4      the whole replay, 1080 by 1350, 30 frames a second, H.264
//
// Needs Playwright with Chromium, and ffmpeg for the clips. Both are present
// in a Claude cloud session. Elsewhere: npm i -D playwright && npx playwright
// install chromium. The script builds the site first and serves it itself.

import { mkdir, writeFile, readFile, rm, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "hub", "static", "hub");
const DIST = join(ROOT, "site", "dist");
const PORT = Number(process.env.HUB_MEDIA_PORT || 4179);
const ORIGIN = `http://localhost:${PORT}`;
const FPS = 30;

const argv = process.argv.slice(2);
const onlyAt = argv.indexOf("--only");
const KINDS = new Set((onlyAt === -1 ? "art,posters,og,carousel,clip" : argv[onlyAt + 1] || "").split(",").filter(Boolean));
const wanted = argv.filter((a, i) => !a.startsWith("--") && !(onlyAt !== -1 && i === onlyAt + 1));

function loadPlaywright() {
  const bases = [join(ROOT, "site", "package.json"), join(ROOT, "package.json"), "/opt/node-tools/node_modules/x.js"];
  for (const base of bases) {
    try {
      return createRequire(base)("playwright");
    } catch {
      /* try the next place */
    }
  }
  throw new Error("Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function serve() {
  const child = spawn(process.execPath, [join(ROOT, "scripts", "hub-build.mjs"), "--serve", String(PORT)], { cwd: ROOT, stdio: ["ignore", "pipe", "inherit"] });
  let ready = false;
  child.stdout.on("data", (d) => {
    if (String(d).includes("serving")) ready = true;
  });
  for (let i = 0; i < 300 && !ready; i++) await sleep(100);
  if (!ready) {
    child.kill();
    throw new Error("the site did not build and start serving");
  }
  return child;
}

/** Open a page with a stage in capture mode and return a function that seeks it. */
async function openStage(browser, path, viewport, scale = 1) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale });
  await page.goto(`${ORIGIN}${path}${path.includes("?") ? "&" : "?"}capture=1`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__stage, null, { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.__stage.duration);
  const seek = async (t) => {
    await page.evaluate((x) => window.__stage.seek(x), Math.min(t, duration));
    // Two frames, so layout that follows the seek (scroll, camera) has settled.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  };
  return { page, duration, seek };
}

async function posters(browser, w) {
  const dir = join(OUT, "posters");
  await mkdir(dir, { recursive: true });
  const wide = await openStage(browser, `/workflows/${w.slug}/`, { width: 1320, height: 1100 }, 1.5);
  await wide.seek(w.posterAt ?? wide.duration);
  await sleep(150);
  await (await wide.page.$(".stage")).screenshot({ path: join(dir, `${w.slug}.png`) });
  await wide.page.close();

  const tall = await openStage(browser, `/clip/${w.slug}/`, { width: 1080, height: 1350 }, 1);
  await tall.seek(w.posterAt ?? tall.duration);
  await sleep(150);
  await (await tall.page.$(".stage")).screenshot({ path: join(dir, `${w.slug}-tall.png`) });
  await tall.page.close();
  // The cover and the link card read the posters from the served site.
  for (const name of [`${w.slug}.png`, `${w.slug}-tall.png`]) {
    await mkdir(join(DIST, "hub", "posters"), { recursive: true });
    await copyFile(join(dir, name), join(DIST, "hub", "posters", name));
  }
}

async function still(browser, path, viewport, file, scale = 1, type = "png") {
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale });
  await page.goto(`${ORIGIN}${path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(120);
  const el = await page.$("[data-clip]");
  const buf = await el.screenshot(type === "jpeg" ? { type: "jpeg", quality: 92 } : { type: "png" });
  if (file) await writeFile(file, buf);
  await page.close();
  return buf;
}

/** A picture of every worked example's output, as the page itself draws it. */
async function art(browser, w) {
  const made = [];
  for (const caseId of Object.keys(w.cases || {})) {
    const dir = join(OUT, "art", caseId);
    await mkdir(dir, { recursive: true });
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1.5 });
    const res = await page.goto(`${ORIGIN}/examples/${caseId}/${w.skill || w.slug}.html`, { waitUntil: "networkidle" }).catch(() => null);
    if (res && res.status() === 200) {
      await sleep(400);
      const png = join(dir, `${w.slug}.png`);
      await page.screenshot({ path: png });
      const out = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", png, "-c:v", "libwebp", "-quality", "82", join(dir, `${w.slug}.webp`)]);
      await rm(png, { force: true });
      if (out.status === 0) {
        made.push(caseId);
        await mkdir(join(DIST, "hub", "art", caseId), { recursive: true });
        await copyFile(join(dir, `${w.slug}.webp`), join(DIST, "hub", "art", caseId, `${w.slug}.webp`));
      }
    }
    await page.close();
  }
  return made;
}

async function og(browser, w) {
  await mkdir(join(OUT, "og"), { recursive: true });
  await still(browser, w ? `/clip/${w.slug}/og/` : "/clip/og/", { width: 1200, height: 630 }, join(OUT, "og", `${w ? w.slug : "default"}.png`));
}

const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const hl = (s) => esc(s).replace(/\*(.+?)\*/g, '<span class="hl">$1</span>');

async function carousel(browser, w) {
  const dir = join(OUT, "launch", w.slug);
  await mkdir(dir, { recursive: true });
  const slides = w.carousel || [];
  const total = slides.length + 2;
  const view = { width: 1080, height: 1350 };
  const images = [];

  const cover = await still(browser, `/clip/${w.slug}/cover/`, view, null, 2, "jpeg");
  images.push(cover);
  await writeFile(join(dir, "slide-01.png"), await still(browser, `/clip/${w.slug}/cover/`, view, null, 1, "png"));

  const s = await openStage(browser, `/clip/${w.slug}/`, view, 2);
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    await s.page.evaluate(
      ({ label, title, body }) => {
        document.querySelector(".clip-brand span:last-child").textContent = label;
        document.querySelector(".clip-head h1").innerHTML = title;
        document.querySelector(".clip-foot span").textContent = body;
        document.querySelector(".clip-foot b").textContent = "";
        document.querySelector(".clip").classList.add("clip-slide");
      },
      { label: `${String(i + 2).padStart(2, "0")} / ${String(total).padStart(2, "0")} · ${w.short || w.title}`, title: hl(slide.title), body: slide.body },
    );
    await s.seek(slide.at);
    await sleep(160);
    images.push(await (await s.page.$("[data-clip]")).screenshot({ type: "jpeg", quality: 92 }));
  }
  await s.page.close();

  images.push(await still(browser, `/clip/${w.slug}/end/`, view, null, 2, "jpeg"));

  // One PDF page per slide, at the size LinkedIn shows a portrait document.
  const html = `<!doctype html><meta charset="utf-8"><style>@page{size:1080px 1350px;margin:0}html,body{margin:0;background:#ffffff}img{display:block;width:1080px;height:1350px;page-break-after:always}</style>${images
    .map((b) => `<img src="data:image/jpeg;base64,${b.toString("base64")}">`)
    .join("")}`;
  const page = await browser.newPage({ viewport: view });
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({ path: join(dir, "carousel.pdf"), width: "1080px", height: "1350px", printBackground: true });
  await page.close();
  return images.length;
}

async function clip(browser, w) {
  if (spawnSync("ffmpeg", ["-version"]).status !== 0) {
    console.log(`  clip: skipped for ${w.slug}, ffmpeg is not installed`);
    return null;
  }
  const dir = join(OUT, "launch", w.slug);
  await mkdir(dir, { recursive: true });
  const file = join(dir, "clip.mp4");
  const s = await openStage(browser, `/clip/${w.slug}/`, { width: 1080, height: 1350 }, 1);
  const frames = Math.ceil(s.duration * FPS);
  const ff = spawn(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      // Hold the last frame so the result can be read before the clip loops.
      "-vf", "tpad=stop_mode=clone:stop_duration=1.6,format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-movflags", "+faststart", "-an", file],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const done = new Promise((resolve, reject) => ff.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`)))));
  const target = await s.page.$("[data-clip]");
  for (let i = 0; i <= frames; i++) {
    await s.page.evaluate((x) => window.__stage.seek(x), Math.min(i / FPS, s.duration));
    const buf = await target.screenshot({ type: "jpeg", quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await done;
  await s.page.close();
  return frames;
}

async function main() {
  const { chromium } = loadPlaywright();
  const all = [];
  const dir = join(ROOT, "hub", "content", "workflows");
  const { readdir } = await import("node:fs/promises");
  for (const slug of (await readdir(dir)).sort()) {
    const file = join(dir, slug, "meta.json");
    if (!existsSync(file)) continue;
    const meta = JSON.parse(await readFile(file, "utf8"));
    // The carousel and the poster moment are written for a workflow's first case.
    const first = Object.values(meta.cases || {})[0] || {};
    if (meta.status !== "planned") all.push({ slug, ...meta, carousel: first.carousel, posterAt: first.posterAt });
  }
  const list = wanted.length ? all.filter((w) => wanted.includes(w.slug)) : all;
  if (!list.length) throw new Error(`no workflow matches ${wanted.join(", ")}`);

  const server = await serve();
  const browser = await chromium.launch();
  try {
    for (const w of list) {
      const t0 = Date.now();
      const did = [];
      if (KINDS.has("art")) did.push(`pictures of ${(await art(browser, w)).length} outputs`);
      if (KINDS.has("posters")) {
        await posters(browser, w);
        did.push("posters");
      }
      if (KINDS.has("og")) {
        await og(browser, w);
        did.push("link card");
      }
      if (KINDS.has("carousel")) did.push(`carousel of ${await carousel(browser, w)}`);
      if (KINDS.has("clip")) {
        const frames = await clip(browser, w);
        if (frames) did.push(`clip of ${frames} frames`);
      }
      console.log(`hub-media: ${w.slug}: ${did.join(", ")} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
    if (KINDS.has("og") && !wanted.length) {
      await og(browser, null);
      console.log("hub-media: default link card");
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

await main();
