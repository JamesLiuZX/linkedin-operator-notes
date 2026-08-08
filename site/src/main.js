// Latin-subset imports only. The flat "700.css" style import pulls every
// unicode-range subset fontsource ships (latin, latin-ext, cyrillic,
// cyrillic-ext, greek, vietnamese) -- ~9 font files per weight for a site
// that is English-only. The browser only ever downloads the range it needs,
// but the CSS still carries every @font-face declaration, and Vite still
// treats each referenced file as a build asset. latin-*.css cuts each weight
// from 9 files to 1.
import "@fontsource/syne/latin-700.css";
import "@fontsource/syne/latin-800.css";
import "@fontsource/source-serif-4/latin-400.css";
import "@fontsource/source-serif-4/latin-600.css";
import "@fontsource/source-serif-4/latin-400-italic.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./style.css";
import "./viz/palette.css";
import "./viz/viz.css";
import { marked } from "marked";
import manifest from "../../articles/unsplash-manifest.json";
import { ARTICLES, POSTS, bySlug, bySection, SECTIONS, VISIBLE } from "./content.js";
import { DEMOS, demoBySlug } from "./demos/index.js";
import { currentPath, navigate, onRoute } from "./router.js";
import { renderDashboard } from "./dashboard/index.js";
import { hydrateCharts } from "./viz/charts.js";

marked.setOptions({ gfm: true, breaks: false });

const SECTION_LABEL = Object.fromEntries(SECTIONS.map((x) => [x.id, x.title]));

function stripLeadingH1(html) {
  return html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>/i, "");
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function setMeta({ title, description, url, image }) {
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
  if (url) {
    ensure('link[rel="canonical"]', "href", url);
    ensure('meta[property="og:url"]', "content", url);
  }
  if (image) ensure('meta[property="og:image"]', "content", image);
}

function hrefFor(item) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${item.section || "notes"}/${item.slug}`;
}

function route(path = currentPath()) {
  // Legacy hash URLs → path routes
  if (location.hash.startsWith("#/")) {
    const slug = location.hash.slice(2).replace(/\/$/, "");
    if (slug && slug !== "home") {
      const item = bySlug(slug);
      if (item) {
        history.replaceState({}, "", hrefFor(item));
        path = currentPath();
      }
    } else {
      history.replaceState({}, "", import.meta.env.BASE_URL.replace(/\/$/, "") + "/");
      path = "/";
    }
  }

  const clean = path.replace(/\/$/, "") || "/";
  if (clean === "/" || clean === "/home") return renderHome();
  if (clean === "/dashboard") return renderDash();
  if (clean === "/demos") return renderDemoIndex();

  const parts = clean.split("/").filter(Boolean);
  if (parts[0] === "demos" && parts[1]) {
    const demo = demoBySlug(parts[1]);
    if (demo) return renderDemo(demo);
    return renderDemoIndex();
  }
  if (parts.length === 1) {
    const item = bySlug(parts[0]);
    if (item) return renderArticle(item);
  }
  if (parts.length >= 2) {
    const item = bySlug(parts[1]) || bySlug(parts[parts.length - 1]);
    if (item) return renderArticle(item);
    const section = SECTIONS.find((s) => s.id === parts[0]);
    if (section) return renderSection(section);
  }
  return renderHome();
}

// Same rule public visibility uses. "ready" (gate passes, no human sign-off
// yet) is deliberately treated as a draft here too.
const isDraftItem = (i) => !VISIBLE.has(i.status);

/** The gate's own verdict on a piece, set in mono so the digits line up. */
function scoreBadge(item) {
  const g = item.gate;
  if (!g) return "";
  return `<div class="score${g.score < 90 ? " low" : ""}">${g.score} <em>/100</em></div>`;
}

/**
 * One entry in the contents page. Carries what a reader chooses on: what it is,
 * how long it takes, and what the quality gate made of it.
 */
function indexRow(item, n, sectionLabel) {
  const bits = [`<span>${escapeHtml(sectionLabel || item.section)}</span>`];
  if (item.kind === "post") {
    bits.push(`<span>${item.chars} chars</span>`);
    if (item.derivedFrom) {
      bits.push(`<span>from ${escapeHtml(item.derivedFrom.replace(/^[a-z-]+\//, ""))}</span>`);
    }
  } else {
    bits.push(`<span>${item.readingMinutes} min</span>`);
  }
  return `
    <a class="row" href="${hrefFor(item)}">
      <div class="num">${String(n).padStart(2, "0")}</div>
      <div>
        <div class="row-t">${escapeHtml(item.title)}</div>
        ${item.summary ? `<p class="row-s">${escapeHtml(item.summary)}</p>` : ""}
        <div class="row-m">${bits.join("")}</div>
      </div>
      <div class="side">
        ${scoreBadge(item)}
        <span class="chip${isDraftItem(item) ? " draft" : ""}">${
          isDraftItem(item) ? "draft" : "ready"
        }</span>
      </div>
    </a>`;
}

function renderHome() {
  const sections = bySection();
  const cards = ARTICLES.map((a, i) => indexRow(a, i + 1, SECTION_LABEL[a.section])).join("");
  const atoms = POSTS.map((p, i) => indexRow(p, i + 1, SECTION_LABEL[p.section])).join("");

  const sectionNav = sections
    .map(
      (s) =>
        `<a class="section-chip" href="${import.meta.env.BASE_URL.replace(/\/$/, "")}/${s.id}">${escapeHtml(s.title)} <span>${s.items.length}</span></a>`
    )
    .join("");
  const demosChip = `<a class="section-chip" href="${import.meta.env.BASE_URL.replace(/\/$/, "")}/demos">Demos <span>${DEMOS.length}</span></a>`;

  setMeta({
    title: "Market Ops Notes",
    description:
      "Field notes on prediction-market products and shipping AI near money.",
    url: window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, "") + "/",
  });

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const demoStrip = DEMOS.slice(0, 4)
    .map(
      (d) =>
        `<a class="strip-card" href="${base}/demos/${d.slug}">
           <strong>${escapeHtml(d.title)}</strong>
           <span>${escapeHtml(d.tagline)}</span>
         </a>`
    )
    .join("");

  document.getElementById("app").innerHTML = `
    ${siteNav("/")}
    <main class="home">
      <header class="brand-lockup">
        <div class="eyebrow">Market Ops Notes</div>
        <h1>Field notes from markets and agents</h1>
        <p>Resolution, liquidity, incentives, and AI pointed at systems that have consequences.</p>
        <div class="section-nav">${sectionNav}${demosChip}</div>
      </header>
      <section class="strip">
        <div class="strip-head">
          <h2>Poke something</h2>
          <a href="${base}/demos" class="mono">All demos →</a>
        </div>
        <div class="strip-grid">${demoStrip}</div>
      </section>
      <section class="idx">${
        cards ?
        `<span class="label">Essays</span>` + cards :
        `<div class="empty-lib">
           <h3>The essays are being held for a final read.</h3>
           <p>Nine pieces already pass an automated quality gate on evidence, specificity, and voice. None of that replaces a human deciding a piece is ready to put a name on, so the writing publishes on its own schedule while the demos above ship as soon as they work.</p>
           <p>Check back soon, or start with something you can use today.</p>
         </div>`
      }</section>
      <p class="note">
        Demos run entirely in the browser, with no backend and no model calls.
      </p>
    </main>
  `;
}

function renderSection(section) {
  const items = ARTICLES.filter((a) => a.section === section.id);
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const cards = items.map((a, i) => indexRow(a, i + 1, section.title)).join("");

  setMeta({
    title: `${section.title} · Market Ops Notes`,
    description: section.blurb,
  });

  document.getElementById("app").innerHTML = `
    <main class="home">
      <nav class="topbar">
        <a href="${base}/">← All notes</a>
        <a class="brand" href="${base}/">Market Ops Notes</a>
        <span></span>
      </nav>
      <header class="brand-lockup">
        <div class="eyebrow">${escapeHtml(section.id)}</div>
        <h1>${escapeHtml(section.title)}</h1>
        <p>${escapeHtml(section.blurb)}</p>
      </header>
      <section class="idx">${cards}</section>
    </main>
  `;
}

function atomParagraphs(text) {
  return String(text)
    .split(/\n{2,}/)
    .filter((t) => t.trim())
    .map((t) => `<p>${escapeHtml(t).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** A LinkedIn atom, shown split at the fold. Visible in dev and preview only. */
function renderAtom(item) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  setMeta({
    title: `${item.title} · Market Ops Notes`,
    description: item.summary,
    url: window.location.origin + hrefFor(item),
  });
  const by = ["<span>James Liu</span>", `<span>${item.chars} characters</span>`];
  if (item.derivedFrom) by.push(`<span>derived from ${escapeHtml(item.derivedFrom)}</span>`);
  if (item.gate) by.push(`<span>gate ${item.gate.score}/100</span>`);

  document.getElementById("app").innerHTML = `
    <nav class="bar"><div class="wrap">
      <a href="${base}/">&larr; Index</a>
      <a class="home" href="${base}/">Market Ops Notes</a>
      <a href="${base}/${item.section}">${escapeHtml(SECTION_LABEL[item.section] || item.section)}</a>
    </div></nav>
    <main class="wrap">
      <header class="head">
        <div class="label">${escapeHtml(SECTION_LABEL[item.section] || item.section)}${
          item.pillar ? ` &middot; ${escapeHtml(item.pillar)}` : ""
        }</div>
        <h1>${escapeHtml(item.title)}</h1>
        <div class="by">${by.join("")}</div>
      </header>
      <div class="atom">
        <div class="above">${atomParagraphs(item.fold?.visible || item.draft)}</div>
        ${item.fold?.truncated ? '<div class="fold"><b>see more</b></div>' : ""}
        ${atomParagraphs(item.fold?.hidden || "")}
      </div>
      ${item.firstComment
        ? `<div class="fc"><span class="label">First comment</span>${atomParagraphs(item.firstComment)}</div>`
        : ""}
    </main>`;
  window.scrollTo(0, 0);
}

function renderArticle(article) {
  if (article.kind === "post") return renderAtom(article);
  const hero = manifest.articles[article.slug]?.hero;
  const heroUrl = article.figure || hero?.url || "";
  const heroAlt = article.heroAlt || hero?.alt || article.title;
  let html = marked.parse(article.body);
  html = stripLeadingH1(html);
  // Local figures are authored as assets/foo.svg so the path is readable in the
  // markdown itself. Resolve them against BASE_URL, since an article renders at
  // /{section}/{slug} and a relative path would look for /markets/assets/.
  html = html.replace(
    /(<img[^>]+src=")(?:\.\/)?assets\//gi,
    `$1${import.meta.env.BASE_URL.replace(/\/$/, "")}/assets/`
  );

  const hasFigure = /<figure>/i.test(html);
  if (!hasFigure && hero) {
    html =
      `<figure><img src="${hero.url}" alt="${escapeHtml(hero.alt)}" /><figcaption>Photo by ${escapeHtml(hero.photographer)} on Unsplash</figcaption></figure>` +
      html;
  }

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const canonical =
    window.location.origin + base + `/${article.section || "notes"}/${article.slug}`;

  setMeta({
    title: `${article.title} · Market Ops Notes`,
    description: article.summary,
    url: canonical,
    image: heroUrl,
  });

  document.getElementById("app").innerHTML = `
    <div class="article-shell">
      <nav class="topbar">
        <a href="${base}/">← All notes</a>
        <a class="brand" href="${base}/">Market Ops Notes</a>
        ${hero ? `<a href="${hero.unsplashUrl || "https://unsplash.com"}" target="_blank" rel="noreferrer">Unsplash credit</a>` : "<span></span>"}
      </nav>
      <header class="hero${heroUrl ? "" : " no-photo"}">
        ${heroUrl ? `<img src="${heroUrl}" alt="${escapeHtml(heroAlt)}" />` : ""}
        <div class="veil"></div>
        <div class="copy">
          <div class="series">${escapeHtml(article.series || article.section)}</div>
          <h1>${escapeHtml(article.title)}</h1>
          <div class="byline">James Liu · ${article.readingMinutes} min read</div>
        </div>
      </header>
      <article class="content">${html}</article>
    </div>
  `;
  window.scrollTo(0, 0);
}

/* ------------------------------------------------------------------ demos */

function siteNav(active = "") {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const links = [
    ["/", "Notes"],
    ["/demos", "Demos"],
    ["/dashboard", "Dashboard"],
  ];
  return `<nav class="site-nav">
    <a class="brand" href="${base}/">Market Ops Notes</a>
    <div class="nav-links">${links
      .map(
        ([href, label]) =>
          `<a href="${base}${href}"${active === href ? ' class="on"' : ""}>${label}</a>`
      )
      .join("")}</div>
  </nav>`;
}

function renderDemoIndex() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  setMeta({
    title: "Demos · Market Ops Notes",
    description:
      "Interactive prototypes for prediction-market product decisions. Resolution linting, reward farming, liquidity budgets, and forecast calibration.",
    url: window.location.origin + base + "/demos",
  });

  document.getElementById("app").innerHTML = `
    ${siteNav("/demos")}
    <main class="home">
      <header class="brand-lockup">
        <div class="eyebrow">Demos</div>
        <h1>Things you can poke</h1>
        <p>Four prototypes, each one attached to an argument. Everything runs in the browser. No keys, no backend, no model calls, so the numbers are the same every time you load them.</p>
      </header>
      <section class="demo-cards">
        ${DEMOS.map(
          (d, i) => `
          <a class="demo-card" href="${base}/demos/${d.slug}" style="animation-delay:${i * 70}ms">
            <div class="series">${escapeHtml(d.pillar)}</div>
            <h2>${escapeHtml(d.title)}</h2>
            <p class="tagline">${escapeHtml(d.tagline)}</p>
            <p class="meta">${escapeHtml(d.blurb)}</p>
            <span class="go mono">Open →</span>
          </a>`
        ).join("")}
      </section>
    </main>`;
  window.scrollTo(0, 0);
}

function renderDemo(demo) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const essay = demo.essay ? bySlug(demo.essay) : null;

  setMeta({
    title: `${demo.title} · Market Ops Notes`,
    description: demo.blurb,
    url: window.location.origin + base + `/demos/${demo.slug}`,
  });

  document.getElementById("app").innerHTML = `
    ${siteNav("/demos")}
    <main class="demo-shell viz">
      <header class="demo-head">
        <div class="eyebrow">${escapeHtml(demo.pillar)}</div>
        <h1>${escapeHtml(demo.title)}</h1>
        <p class="tagline">${escapeHtml(demo.tagline)}</p>
        <p class="demo-blurb">${escapeHtml(demo.blurb)}</p>
        <div class="demo-links">
          ${essay ? `<a href="${base}/${essay.section}/${essay.slug}">Read the essay this came from</a>` : ""}
          <a href="${base}/demos">All demos</a>
        </div>
      </header>
      <div id="demo-root"></div>
      <footer class="demo-foot">
        <h4>How it is built</h4>
        <p>${escapeHtml(demo.buildNote)}</p>
      </footer>
    </main>`;

  const root = document.getElementById("demo-root");
  demo.mount(root);
  hydrateCharts(root);

  // Charts are re-rendered on every slider move, so re-wire hover as they appear.
  const obs = new MutationObserver(() => hydrateCharts(root));
  obs.observe(root, { childList: true, subtree: true });

  window.scrollTo(0, 0);
}

function renderDash() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  setMeta({
    title: "Posting dashboard · Market Ops Notes",
    description: "Twelve weeks of scheduled essays, demos, and atoms, scored against the quality gate.",
    url: window.location.origin + base + "/dashboard",
  });
  const app = document.getElementById("app");
  app.innerHTML = siteNav("/dashboard") + '<div id="dash-root"></div>';
  renderDashboard(document.getElementById("dash-root"), { basePath: base });
  window.scrollTo(0, 0);
}

onRoute(route);
route();
