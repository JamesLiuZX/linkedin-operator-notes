// site/src/main.js
//
// The site renders two registers from one content pipeline:
//
//   essays  long-form, read top to bottom, figures allowed to break the measure
//   atoms   the LinkedIn posts, shown cut at 210 characters where the feed cuts
//           them, because that cut is the argument this whole project makes
//
// Nothing here decides what is public. `content.js` does, from the gate's own
// verdict: a piece carrying an unfilled {{ }} slot never reaches the build.

import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/600.css";
import "@fontsource/source-serif-4/400-italic.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./style.css";

import { marked } from "marked";
import { ARTICLES, POSTS, ALL, bySlug, SECTIONS } from "./content.js";
import { currentPath, navigate, onRoute } from "./router.js";

marked.setOptions({ gfm: true, breaks: false });

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const SECTION_TITLE = Object.fromEntries(SECTIONS.map((s) => [s.id, s.title]));

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const href = (item) => `${BASE}/${item.section || "notes"}/${item.slug}`;
const isDraft = (i) => i.status !== "ready" && i.status !== "published";

function setMeta({ title, description, url }) {
  document.title = title || "Market Ops Notes";
  const ensure = (sel, attr, val) => {
    if (!val) return;
    let el = document.head.querySelector(sel);
    if (!el) {
      el = document.createElement(sel.startsWith("meta") ? "meta" : "link");
      if (sel.includes("property=")) el.setAttribute("property", sel.match(/property="([^"]+)"/)[1]);
      if (sel.includes("name=")) el.setAttribute("name", sel.match(/name="([^"]+)"/)[1]);
      if (sel.includes("rel=")) el.setAttribute("rel", sel.match(/rel="([^"]+)"/)[1]);
      document.head.appendChild(el);
    }
    el.setAttribute(attr, val);
  };
  ensure('meta[name="description"]', "content", description);
  ensure('meta[property="og:title"]', "content", title);
  ensure('meta[property="og:description"]', "content", description);
  ensure('meta[property="og:type"]', "content", "article");
  if (url) ensure('link[rel="canonical"]', "href", url);
}

// —— index ——————————————————————————————————————————————————————

function score(item) {
  const g = item.gate;
  if (!g) return "";
  return `<div class="score${g.score < 90 ? " low" : ""}">${g.score} <em>/100</em></div>`;
}

function row(item, n) {
  const bits = [`<span>${esc(SECTION_TITLE[item.section] || item.section)}</span>`];
  if (item.kind === "post") {
    bits.push(`<span>${item.chars} chars</span>`);
    if (item.derivedFrom) {
      bits.push(`<span>from ${esc(item.derivedFrom.replace(/^[a-z-]+\//, ""))}</span>`);
    }
  } else {
    bits.push(`<span>${item.readingMinutes} min</span>`);
  }
  return `
    <a class="row" href="${href(item)}">
      <div class="num">${String(n).padStart(2, "0")}</div>
      <div>
        <div class="row-t">${esc(item.title)}</div>
        ${item.summary ? `<p class="row-s">${esc(item.summary)}</p>` : ""}
        <div class="row-m">${bits.join("")}</div>
      </div>
      <div class="side">
        ${score(item)}
        <span class="chip${isDraft(item) ? " draft" : ""}">${isDraft(item) ? "draft" : "ready"}</span>
      </div>
    </a>`;
}

function renderHome() {
  const clean = ALL.filter((i) => i.gate && i.gate.fails === 0).length;
  setMeta({
    title: "Market Ops Notes",
    description: "Field notes on prediction-market products and shipping AI near money.",
    url: window.location.origin + BASE + "/",
  });

  document.getElementById("app").innerHTML = `
    <main class="wrap">
      <header class="mast">
        <div class="rule"></div>
        <div class="label">Market Ops Notes &middot; James Liu</div>
        <h1>Field notes from markets and agents</h1>
        <p class="stand">Resolution, liquidity, incentives, and AI pointed at systems
        that have consequences. Every piece carries the score its own quality gate gave it.</p>
        <div class="meta">
          <span><b>${ARTICLES.length}</b> essays</span>
          <span><b>${POSTS.length}</b> LinkedIn atoms</span>
          <span><b>${clean}</b> passing the gate outright</span>
        </div>
      </header>

      ${ARTICLES.length ? `<section class="idx">
        <span class="label">Essays</span>
        ${ARTICLES.map((a, i) => row(a, i + 1)).join("")}
      </section>` : ""}

      ${POSTS.length ? `<section class="idx">
        <span class="label">LinkedIn atoms &middot; derived, never composed independently</span>
        ${POSTS.map((p, i) => row(p, i + 1)).join("")}
      </section>` : ""}

      <footer class="foot">
        <p>Written and checked in the open. Each score comes from
        <span class="mono">npm run content:check</span> at build time. Pieces still carrying
        unfilled evidence slots are held back from this site rather than published
        incomplete. Source: <a href="https://github.com/JamesLiuZX/linkedin-operator-notes">github.com/JamesLiuZX/linkedin-operator-notes</a></p>
      </footer>
    </main>`;
}

function renderSection(section) {
  const items = ALL.filter((a) => a.section === section.id);
  setMeta({ title: `${section.title} · Market Ops Notes`, description: section.blurb });
  document.getElementById("app").innerHTML = `
    <nav class="bar"><div class="wrap">
      <a href="${BASE}/">&larr; Index</a>
      <a class="home" href="${BASE}/">Market Ops Notes</a>
      <span></span>
    </div></nav>
    <main class="wrap">
      <header class="mast">
        <div class="label">${esc(section.id)}</div>
        <h1>${esc(section.title)}</h1>
        <p class="stand">${esc(section.blurb)}</p>
      </header>
      <section class="idx">
        <span class="label">${items.length} piece${items.length === 1 ? "" : "s"}</span>
        ${items.map((a, i) => row(a, i + 1)).join("")}
      </section>
    </main>`;
}

// —— piece ——————————————————————————————————————————————————————

function paragraphs(text) {
  return String(text)
    .split(/\n{2,}/)
    .filter((p) => p.trim())
    .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function nextPrev(item) {
  const list = item.kind === "post" ? POSTS : ARTICLES;
  const n = list.indexOf(item);
  const prev = list[n - 1];
  const next = list[n + 1];
  return `<div class="nextprev">
    ${prev ? `<a href="${href(prev)}"><i>Previous</i>${esc(prev.title)}</a>` : "<span></span>"}
    ${next ? `<a href="${href(next)}" style="text-align:right"><i>Next</i>${esc(next.title)}</a>` : "<span></span>"}
  </div>`;
}

function renderPiece(item) {
  setMeta({
    title: `${item.title} · Market Ops Notes`,
    description: item.summary,
    url: window.location.origin + href(item),
  });

  const by = ["<span>James Liu</span>"];
  if (item.kind === "post") {
    by.push(`<span>${item.chars} characters</span>`);
    if (item.derivedFrom) by.push(`<span>derived from ${esc(item.derivedFrom)}</span>`);
  } else {
    by.push(`<span>${item.readingMinutes} min read</span>`);
  }
  if (item.gate) by.push(`<span>gate ${item.gate.score}/100</span>`);

  let main;
  if (item.kind === "post") {
    main = `
      <div class="atom">
        <div class="above">${paragraphs(item.fold.visible)}</div>
        ${item.fold.truncated ? '<div class="fold"><b>see more</b></div>' : ""}
        ${paragraphs(item.fold.hidden)}
      </div>
      ${item.firstComment
        ? `<div class="fc"><span class="label">First comment</span>${paragraphs(item.firstComment)}</div>`
        : ""}`;
  } else {
    // Local figures are authored as assets/foo.svg so the path stays readable in
    // the markdown. Resolve them against BASE_URL, since an article renders at
    // /{section}/{slug} and a relative path would look for /markets/assets/.
    const html = marked
      .parse(item.body.replace(/<!--[\s\S]*?-->/g, ""))
      .replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>/i, "")
      .replace(/(<img[^>]+src=")(?:\.\/)?assets\//gi, `$1${BASE}/assets/`);
    main = `<div class="body">${html}</div>`;
  }

  const draftNote = isDraft(item)
    ? `<div class="draft-note"><b>Draft</b>This piece passes the mechanical gate but has not
       been through a final read. It is here because the work is done in the open, not
       because it is finished.</div>`
    : "";

  document.getElementById("app").innerHTML = `
    <nav class="bar"><div class="wrap">
      <a href="${BASE}/">&larr; Index</a>
      <a class="home" href="${BASE}/">Market Ops Notes</a>
      <a href="${BASE}/${item.section}">${esc(SECTION_TITLE[item.section] || item.section)}</a>
    </div></nav>
    <main class="wrap">
      <header class="head">
        <div class="label">${esc(SECTION_TITLE[item.section] || item.section)}${
          item.pillar ? ` &middot; ${esc(item.pillar)}` : ""
        }</div>
        <h1>${esc(item.title)}</h1>
        <div class="by">${by.join("")}</div>
        ${draftNote}
      </header>
      ${main}
      ${nextPrev(item)}
    </main>`;

  // Wide content gets its own scroller so the page body never moves sideways.
  document.querySelectorAll(".body table").forEach((t) => {
    if (t.parentElement.classList.contains("tbl")) return;
    const w = document.createElement("div");
    w.className = "tbl";
    t.replaceWith(w);
    w.appendChild(t);
  });

  window.scrollTo(0, 0);
}

// —— routing ————————————————————————————————————————————————————

function route() {
  let path = currentPath();

  // GitHub Pages serves 404.html for deep links; recover the intended path.
  const redirect = new URLSearchParams(window.location.search).get("p");
  if (redirect) {
    history.replaceState({}, "", BASE + redirect);
    path = currentPath();
  }

  const clean = path.replace(/\/$/, "") || "/";
  if (clean === "/" || clean === "/home") return renderHome();

  const parts = clean.split("/").filter(Boolean);
  const item = bySlug(parts[parts.length - 1]);
  if (item) return renderPiece(item);

  const section = SECTIONS.find((s) => s.id === parts[0]);
  if (section) return renderSection(section);

  return renderHome();
}

onRoute(route);
route();
