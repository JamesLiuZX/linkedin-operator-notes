#!/usr/bin/env node
// scripts/digest-render.mjs
//
// Renders a digest's social media from its card data, digests/<slug>.json:
//   site/public/digests/<slug>/slide-01.png ...  1080x1350 portrait cards
//   site/public/digests/<slug>/cover.png         same as slide 1, for X and og:image
//   site/public/digests/<slug>/carousel.pdf      LinkedIn document post, vector text
//
// Zero npm dependencies: it shells out to headless Chrome, the same way the
// udemy pipeline does. Fonts come from the site's @fontsource packages, so run
// `npm --prefix site ci` first. Without them the cards fall back to system
// fonts and this script says so.
//
// Usage:
//   node scripts/digest-render.mjs digests/2026-11-06-<slug>.json
//   CHROME_BIN=/path/to/chrome node scripts/digest-render.mjs <file>

import { readFile, writeFile, mkdir, copyFile, rm, stat } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1080;
const H = 1350;

function findChrome() {
  if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    const r = spawnSync("which", [name], { encoding: "utf8" });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  }
  for (const root of ["/opt/pw-browsers", join(process.env.HOME || "", ".cache", "ms-playwright")]) {
    if (!existsSync(root)) continue;
    for (const d of readdirSync(root)) {
      const p = join(root, d, "chrome-linux", "chrome");
      if (d.startsWith("chromium") && existsSync(p)) return p;
    }
  }
  throw new Error("No Chrome or Chromium found. Install one or set CHROME_BIN.");
}

const FONT_DIR = join(ROOT, "site", "node_modules", "@fontsource");
const FONTS = [
  ["Syne", "syne/files/syne-latin-700-normal.woff2", 700],
  ["Syne", "syne/files/syne-latin-800-normal.woff2", 800],
  ["Source Serif 4", "source-serif-4/files/source-serif-4-latin-400-normal.woff2", 400],
  ["Source Serif 4", "source-serif-4/files/source-serif-4-latin-600-normal.woff2", 600],
  ["IBM Plex Mono", "ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2", 400],
  ["IBM Plex Mono", "ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2", 500],
];

function fontFaces() {
  let missing = 0;
  const css = FONTS.map(([family, file, weight]) => {
    const p = join(FONT_DIR, file);
    if (!existsSync(p)) {
      missing++;
      return "";
    }
    return `@font-face{font-family:"${family}";src:url("${pathToFileURL(p).href}") format("woff2");font-weight:${weight};font-style:normal;}`;
  }).join("\n");
  if (missing) console.warn(`digest-render: ${missing} font file(s) missing. Run npm --prefix site ci.`);
  return css;
}

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// *word* in card copy becomes the accent colour. Nothing else is markup.
const accent = (s) => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
@page{size:${W}px ${H}px;margin:0}
html,body{width:${W}px;background:#eceee7}
body{font-family:"Source Serif 4",Georgia,serif;-webkit-font-smoothing:antialiased;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.slide{--s:1;position:relative;width:${W}px;height:${H}px;overflow:hidden;padding:84px 88px 76px;
  display:flex;flex-direction:column;background:var(--bg);color:var(--fg);break-after:page;page-break-after:always}
.slide:last-child{break-after:auto;page-break-after:auto}
.dark{--bg:#133a2d;--fg:#eceee7;--muted:rgba(236,238,231,.72);--accent:#e9a46a;--label:#a9c9b5;--line:rgba(236,238,231,.2)}
.light{--bg:#eceee7;--fg:#0d1310;--muted:#56625a;--accent:#9c4a2c;--label:#133a2d;--line:rgba(13,19,16,.16)}
.top{display:flex;justify-content:space-between;align-items:baseline;font-family:"IBM Plex Mono",monospace;
  font-size:24px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.top b{font-weight:500;color:var(--fg)}
em{font-style:normal;color:var(--accent)}
.cover h1{font-family:"Syne",sans-serif;font-weight:800;font-size:calc(var(--s)*96px);line-height:1.02;
  letter-spacing:-.02em;margin-top:auto}
.cover .sub{font-size:calc(var(--s)*38px);line-height:1.3;color:var(--muted);margin-top:40px;max-width:880px}
.foot{display:flex;justify-content:space-between;align-items:center;font-family:"IBM Plex Mono",monospace;
  font-size:24px;color:var(--muted);border-top:2px solid var(--line);padding-top:26px;margin-top:auto}
.cover .foot{margin-top:72px}
.foot .go{color:var(--fg);font-weight:500}
.item h2{font-family:"Syne",sans-serif;font-weight:800;font-size:calc(var(--s)*62px);line-height:1.04;
  letter-spacing:-.015em;margin-top:44px}
.stat{display:flex;align-items:flex-end;gap:30px;margin-top:calc(var(--s)*44px)}
.stat .v{font-family:"Syne",sans-serif;font-weight:800;font-size:calc(var(--s)*176px);line-height:.86;
  letter-spacing:-.035em;color:var(--accent);white-space:nowrap}
.stat .l{font-family:"IBM Plex Mono",monospace;font-size:calc(var(--s)*26px);line-height:1.35;color:var(--muted);
  max-width:430px;padding-bottom:10px}
.stat.long{flex-direction:column;align-items:flex-start;gap:14px}
.stat.long .v{font-size:calc(var(--s)*136px)}
.stat.long .l{max-width:none;padding-bottom:0}
.block{margin-top:calc(var(--s)*38px)}
.block .k{font-family:"IBM Plex Mono",monospace;font-size:22px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--label);font-weight:500}
.block p{font-size:calc(var(--s)*35px);line-height:1.34;margin-top:10px}
.courses h2,.close h2{font-family:"Syne",sans-serif;font-weight:800;font-size:calc(var(--s)*68px);line-height:1.04;
  letter-spacing:-.015em;margin-top:44px}
.course{border-top:2px solid var(--line);padding:calc(var(--s)*30px) 0}
.course:first-of-type{margin-top:calc(var(--s)*36px)}
.chips{display:flex;gap:10px;margin-bottom:12px}
.chip{font-family:"IBM Plex Mono",monospace;font-size:20px;letter-spacing:.08em;text-transform:uppercase;
  padding:5px 12px;border:2px solid var(--fg);border-radius:4px}
.chip.solid{background:var(--fg);color:var(--bg)}
.course .t{font-family:"Syne",sans-serif;font-weight:700;font-size:calc(var(--s)*40px);line-height:1.12}
.course .n{font-size:calc(var(--s)*30px);line-height:1.32;margin-top:8px;color:var(--muted)}
.close .read{font-size:calc(var(--s)*42px);line-height:1.32;margin-top:40px}
.close .take{font-family:"Syne",sans-serif;font-weight:800;font-size:calc(var(--s)*52px);line-height:1.1;
  color:var(--accent);margin-top:calc(var(--s)*44px)}
`;

// Shrinks a slide's type until its content fits the frame. Runs before Chrome
// captures, because --virtual-time-budget lets load handlers finish first.
const FIT = `<script>
addEventListener("load",()=>{for(const s of document.querySelectorAll(".slide")){
  let k=1;const inner=()=>{let h=0;for(const c of s.children)h=Math.max(h,c.offsetTop+c.offsetHeight);return h};
  while(k>0.66&&(s.scrollHeight>${H}+1||inner()>${H}-60)){k-=0.03;s.style.setProperty("--s",k.toFixed(2))}
}});
</script>`;

function cover(d, n, total) {
  return `<section class="slide dark cover">
  <div class="top"><span><b>AI digest</b> · ${esc(d.edition)}</span><span>${n}/${total}</span></div>
  <h1>${accent(d.cover.headline)}</h1>
  <p class="sub">${esc(d.cover.sub)}</p>
  <div class="foot"><span>${esc(d.handle)}</span><span class="go">Swipe →</span></div>
</section>`;
}

function item(d, it, i, n, total) {
  const num = String(i + 1).padStart(2, "0");
  return `<section class="slide light item">
  <div class="top"><span><b>${num}</b> · ${esc(it.kicker)}</span><span>${n}/${total}</span></div>
  <h2>${accent(it.title)}</h2>
  ${it.stat ? `<div class="stat${String(it.stat).length > 4 ? " long" : ""}"><span class="v">${esc(it.stat)}</span><span class="l">${esc(it.statLabel || "")}</span></div>` : ""}
  <div class="block"><div class="k">What happened</div><p>${accent(it.what)}</p></div>
  <div class="block"><div class="k">Why it matters</div><p>${accent(it.why)}</p></div>
  <div class="foot"><span>${esc(d.handle)}</span><span>Source: ${esc(it.source)}</span></div>
</section>`;
}

function courses(d, n, total) {
  const rows = (d.courses || [])
    .map(
      (c) => `<div class="course">
    <div class="chips"><span class="chip solid">${esc(c.platform)}</span><span class="chip">${esc(c.price)}</span></div>
    <div class="t">${esc(c.title)}</div>
    <p class="n">${esc(c.note)}</p>
  </div>`
    )
    .join("");
  return `<section class="slide light courses">
  <div class="top"><span><b>New courses</b> · Udemy and YouTube</span><span>${n}/${total}</span></div>
  <h2>${accent(d.coursesTitle || "Worth an evening this week")}</h2>
  ${rows}
  <div class="foot"><span>${esc(d.handle)}</span><span>All picks: /courses</span></div>
</section>`;
}

function close(d, n, total) {
  return `<section class="slide dark close">
  <div class="top"><span><b>My read</b></span><span>${n}/${total}</span></div>
  <h2>${accent(d.readTitle || "What I would do with this")}</h2>
  <p class="read">${accent(d.read)}</p>
  <p class="take">${accent(d.takeaway)}</p>
  <div class="foot"><span>${esc(d.handle)}</span><span class="go">Sources: link in comments</span></div>
</section>`;
}

function slides(d) {
  const total = 1 + d.items.length + (d.courses?.length ? 1 : 0) + 1;
  const out = [cover(d, 1, total)];
  d.items.forEach((it, i) => out.push(item(d, it, i, i + 2, total)));
  if (d.courses?.length) out.push(courses(d, out.length + 1, total));
  out.push(close(d, out.length + 1, total));
  return out;
}

function page(body, faces) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${faces}\n${CSS}</style></head><body>${body}${FIT}</body></html>`;
}

function chrome(bin, args) {
  const r = spawnSync(
    bin,
    ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
     "--virtual-time-budget=6000", ...args],
    { encoding: "utf8", timeout: 120000 }
  );
  if (r.status !== 0) throw new Error(`chrome failed (${r.status}): ${(r.stderr || "").slice(-400)}`);
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("usage: node scripts/digest-render.mjs digests/<slug>.json");
    process.exit(2);
  }
  const d = JSON.parse(await readFile(resolve(file), "utf8"));
  for (const key of ["slug", "edition", "handle", "cover", "items", "read", "takeaway"]) {
    if (!d[key]) throw new Error(`${file}: missing "${key}"`);
  }
  const bin = findChrome();
  const faces = fontFaces();
  const out = join(ROOT, "site", "public", "digests", d.slug);
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  const tmp = join(tmpdir(), `digest-${d.slug}-${process.pid}`);
  await mkdir(tmp, { recursive: true });

  const all = slides(d);
  for (let i = 0; i < all.length; i++) {
    const n = String(i + 1).padStart(2, "0");
    const html = join(tmp, `slide-${n}.html`);
    await writeFile(html, page(all[i], faces));
    const png = join(out, `slide-${n}.png`);
    chrome(bin, [`--window-size=${W},${H}`, `--screenshot=${png}`, pathToFileURL(html).href]);
    if (!existsSync(png)) throw new Error(`no screenshot written for slide ${n}`);
  }
  await copyFile(join(out, "slide-01.png"), join(out, "cover.png"));

  const deck = join(tmp, "deck.html");
  await writeFile(deck, page(all.join("\n"), faces));
  chrome(bin, ["--no-pdf-header-footer", "--print-to-pdf-no-header", `--print-to-pdf=${join(out, "carousel.pdf")}`,
    pathToFileURL(deck).href]);
  await rm(tmp, { recursive: true, force: true });

  let bytes = 0;
  for (const f of readdirSync(out)) bytes += (await stat(join(out, f))).size;
  console.log(
    `digest-render: ${all.length} slides, cover.png and carousel.pdf in site/public/digests/${d.slug}/ ` +
      `(${(bytes / 1024).toFixed(0)} KB total)`
  );
}

main().catch((e) => {
  console.error(`digest-render: ${e.message}`);
  process.exit(1);
});
