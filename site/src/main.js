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
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "./style.css";
import "./viz/palette.css";
import "./viz/viz.css";
import "./demos/kit.css";
import "./portal.css";
import { marked } from "marked";
import { DIGESTS, digestBySlug, COURSES, SUBSCRIBE_URL, fmtDate } from "./digests.js";
import manifest from "../../articles/unsplash-manifest.json";
import { ARTICLES, bySlug, SECTIONS, VISIBLE } from "./content.js";
import { DEMOS, demoBySlug } from "./demos/index.js";
import { currentPath, navigate, onRoute } from "./router.js";
import { renderDashboard } from "./dashboard/index.js";
import { hydrateCharts } from "./viz/charts.js";

marked.setOptions({ gfm: true, breaks: false });

const SECTION_LABEL = Object.fromEntries(SECTIONS.map((x) => [x.id, x.title]));

/** Essays grouped by category, in SECTIONS order, empty categories dropped. */
function articlesBySection() {
  return SECTIONS.map((s) => ({ ...s, items: ARTICLES.filter((a) => a.section === s.id) })).filter(
    (s) => s.items.length
  );
}

/** Demos grouped by category, same rule as articlesBySection. */
function demosBySection() {
  return SECTIONS.map((s) => ({ ...s, items: DEMOS.filter((d) => d.section === s.id) })).filter(
    (s) => s.items.length
  );
}

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
  if (clean === "/digest") return renderDigestIndex();
  if (clean === "/courses") return renderCourses();

  const parts = clean.split("/").filter(Boolean);
  if (parts[0] === "demos" && parts[1]) {
    const demo = demoBySlug(parts[1]);
    if (demo) return renderDemo(demo);
    return renderDemoIndex();
  }
  if (parts[0] === "digest" && parts[1]) {
    const digest = digestBySlug(parts[1]);
    if (digest) return renderDigest(digest);
    return renderDigestIndex();
  }
  if (parts.length === 1) {
    const item = bySlug(parts[0]);
    if (item) return renderArticle(item);
    // A bare category path, e.g. /markets from a section-nav chip. Without this,
    // every one-segment path that isn't an article slug fell through to the
    // homepage, so the category chips silently never showed a filtered page.
    const bareSection = SECTIONS.find((s) => s.id === parts[0]);
    if (bareSection) return renderSection(bareSection);
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
  const groups = articlesBySection();

  const sectionNav = groups
    .map(
      (s) =>
        `<a class="section-chip" href="${import.meta.env.BASE_URL.replace(/\/$/, "")}/${s.id}">${escapeHtml(s.title)} <span>${s.items.length}</span></a>`
    )
    .join("");
  const demosChip = `<a class="section-chip" href="${import.meta.env.BASE_URL.replace(/\/$/, "")}/demos">Demos <span>${DEMOS.length}</span></a>`;
  const portalChips =
    (DIGESTS.length
      ? `<a class="section-chip" href="${import.meta.env.BASE_URL.replace(/\/$/, "")}/digest">AI digest <span>${DIGESTS.length}</span></a>`
      : "") +
    `<a class="section-chip" href="${import.meta.env.BASE_URL.replace(/\/$/, "")}/courses">Courses</a>`;

  setMeta({
    title: "Market Ops Notes",
    description:
      "Field notes on markets, AI agents, gen media, and growth, each one attached to something you can run.",
    url: window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, "") + "/",
  });

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  // One demo per category, in SECTIONS order, so the front-door strip reads as
  // diverse rather than whichever four happen to sit first in the registry.
  const demoStrip = demosBySection()
    .map((s) => s.items[0])
    .filter(Boolean)
    .slice(0, 4)
    .map((d, i) => demoTile(d, i))
    .join("");

  const essaySections = groups
    .map(
      (s) => `
      <div class="idx-group">
        <div class="idx-group-head">
          <span class="label">${escapeHtml(s.title)}</span>
          <p class="idx-group-blurb">${escapeHtml(s.blurb)}</p>
        </div>
        ${s.items.map((a, i) => indexRow(a, i + 1, s.title)).join("")}
      </div>`
    )
    .join("");

  document.getElementById("app").innerHTML = `
    ${siteNav("/")}
    <main class="home">
      <header class="brand-lockup">
        <div class="eyebrow">Market Ops Notes</div>
        <h1>Field notes from markets, agents, and what else ships</h1>
        <p>Resolution, liquidity, and incentives, plus AI workflows, gen media, and growth, each argument attached to something that runs.</p>
        <div class="section-nav">${sectionNav}${demosChip}${portalChips}</div>
      </header>
      ${latestDigest()}
      <section class="kit-strip" aria-labelledby="strip-h">
        <div class="kit-section-head">
          <h2 id="strip-h">Try a demo</h2>
          <a class="kit-link" href="${base}/demos">All ${DEMOS.length} demos</a>
        </div>
        <div class="kit-tiles">${demoStrip}</div>
      </section>
      <section class="idx">${
        groups.length ?
        essaySections :
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
  const by = [`<span><a href="https://jamesliuzx.com" rel="author">James Liu</a></span>`, `<span>${item.chars} characters</span>`];
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
          <div class="byline"><a href="https://jamesliuzx.com" rel="author">James Liu</a> · ${article.readingMinutes} min read</div>
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
    ["/digest", "AI digest"],
    ["/courses", "Courses"],
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

const ARROW =
  '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8h9.5M8.5 4l4 4-4 4"/></svg>';

/**
 * A demo as a product tile: pillar, name, the question it answers. Under a
 * category heading the pillar only repeats it, so pass { eyebrow: false }.
 */
function demoTile(d, i = 0, { eyebrow = true } = {}) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `
    <a class="kit-tile" href="${base}/demos/${d.slug}" style="animation-delay:${i * 60}ms">
      ${eyebrow ? `<span class="kit-tile-eyebrow">${escapeHtml(d.pillar)}</span>` : ""}
      <span class="kit-tile-title">${escapeHtml(d.title)}</span>
      <span class="kit-tile-q">${escapeHtml(d.tagline)}</span>
      <span class="kit-tile-go" aria-hidden="true">Open ${ARROW}</span>
    </a>`;
}

function renderDemoIndex() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  setMeta({
    title: "Demos · Market Ops Notes",
    description:
      "Interactive demos across market design, AI agents, gen media, and growth. Everything runs in the browser, and the numbers are the same every time you load them.",
    url: window.location.origin + base + "/demos",
  });

  const groups = demosBySection();

  document.getElementById("app").innerHTML = `
    ${siteNav("/demos")}
    <main class="home">
      <header class="kit-head">
        <p class="kit-eyebrow">Demos</p>
        <h1 class="kit-title">Check the numbers yourself</h1>
        <p class="kit-question">${DEMOS.length} small tools, each built to make one argument from these notes checkable. Pick a scenario and the answer updates as you go.</p>
        <p class="kit-intro">Everything runs in your browser: no sign-up and no model calls, so the same inputs always give the same numbers.</p>
      </header>
      ${groups
        .map(
          (s) => `
        <section class="kit-group" aria-labelledby="group-${s.id}">
          <div class="kit-section-head">
            <h2 id="group-${s.id}">${escapeHtml(s.title)}</h2>
            <p>${escapeHtml(s.blurb)}</p>
          </div>
          <div class="kit-tiles">${s.items.map((d, i) => demoTile(d, i, { eyebrow: false })).join("")}</div>
        </section>`
        )
        .join("")}
    </main>`;
  window.scrollTo(0, 0);
}

/**
 * "How this works": the technical detail a converted demo moves out of its
 * header. Reads meta.how (paragraphs), meta.formulas ([{ label, expr }]),
 * meta.buildNote and meta.sources ([{ label, href }]); each one is optional.
 */
function howItWorks(demo) {
  const how = demo.how || [];
  const formulas = demo.formulas || [];
  const sources = demo.sources || [];
  return `
    <details class="kit-disclosure kit-how">
      <summary>How this works</summary>
      <div class="kit-disclosure-body kit-prose">
        ${how.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
        ${
          formulas.length
            ? `<dl class="kit-formulas">${formulas
                .map((f) => `<div><dt>${escapeHtml(f.label)}</dt><dd><code>${escapeHtml(f.expr)}</code></dd></div>`)
                .join("")}</dl>`
            : ""
        }
        ${demo.buildNote ? `<p>${escapeHtml(demo.buildNote)}</p>` : ""}
        ${
          sources.length
            ? `<p class="kit-sources-head">Sources</p>
               <ul class="kit-sources">${sources
                 .map(
                   (s) =>
                     `<li><a href="${escapeHtml(s.href)}" target="_blank" rel="noreferrer">${escapeHtml(s.label)}</a></li>`
                 )
                 .join("")}</ul>`
            : ""
        }
      </div>
    </details>`;
}

/** Three other demos: the same category first, then one from each other. */
function moreDemos(demo) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const groups = demosBySection();
  const same = DEMOS.filter((d) => d.section === demo.section && d.slug !== demo.slug);
  const others = groups.filter((s) => s.id !== demo.section).map((s) => s.items[0]);
  const picks = [...same, ...others].filter(Boolean).slice(0, 3);
  return `
    <section aria-labelledby="more-demos-h">
      <div class="kit-section-head">
        <h2 id="more-demos-h">More demos</h2>
        <a class="kit-link" href="${base}/demos">All ${DEMOS.length} demos</a>
      </div>
      <div class="kit-tiles">${picks.map((d, i) => demoTile(d, i)).join("")}</div>
    </section>`;
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
    <main class="demo-shell viz kit">
      <header class="kit-head">
        <p class="kit-eyebrow">${escapeHtml(demo.pillar)}</p>
        <h1 class="kit-title">${escapeHtml(demo.title)}</h1>
        <p class="kit-question">${escapeHtml(demo.tagline)}</p>
        ${demo.blurb ? `<p class="kit-intro">${escapeHtml(demo.blurb)}</p>` : ""}
      </header>
      <div id="demo-root"></div>
      <footer class="kit-foot">
        ${howItWorks(demo)}
        ${
          essay
            ? `<a class="kit-essay" href="${base}/${essay.section}/${essay.slug}">
                 <span class="kit-essay-kicker">The essay behind this demo</span>
                 <span class="kit-essay-title">${escapeHtml(essay.title)}</span>
                 ${essay.summary ? `<span class="kit-essay-summary">${escapeHtml(essay.summary)}</span>` : ""}
               </a>`
            : ""
        }
        ${moreDemos(demo)}
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

/* ------------------------------------------------------------- portal */

function subscribeBlock(where = "") {
  if (!SUBSCRIBE_URL) return "";
  return `<aside class="subscribe${where ? ` ${where}` : ""}">
    <p>A new digest lands every two days. Get it by email instead of hoping the feed shows it to you.</p>
    <a class="subscribe-btn" href="${escapeHtml(SUBSCRIBE_URL)}" target="_blank" rel="noreferrer">Get it by email</a>
  </aside>`;
}

function slideUrls(d) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return Array.from(
    { length: d.slides },
    (_, i) => `${base}/digests/${d.slug}/slide-${String(i + 1).padStart(2, "0")}.png`
  );
}

/** Alt text per slide, from the same card data the renderer drew them from. */
function slideAlts(d) {
  const c = d.cards;
  if (!c) return [];
  const plain = (s) => String(s || "").replace(/\*/g, "");
  const alts = [`Cover: ${plain(c.cover?.headline || d.title)}`];
  (c.items || []).forEach((it, i) => alts.push(`${i + 1}. ${plain(it.title)}`));
  if (c.courses?.length) alts.push("New courses worth an evening");
  alts.push(`My read: ${plain(c.takeaway)}`);
  return alts;
}

function digestCard(d) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `
    <a class="digest-card" href="${base}/digest/${d.slug}">
      ${d.cover ? `<img src="${base}${d.cover}" alt="" loading="lazy" width="1080" height="1350" />` : ""}
      <div class="digest-card-copy">
        <div class="eyebrow">AI digest · ${escapeHtml(fmtDate(d.date))}</div>
        <div class="digest-card-t">${escapeHtml(d.title)}</div>
        ${d.summary ? `<p>${escapeHtml(d.summary)}</p>` : ""}
      </div>
    </a>`;
}

function latestDigest() {
  const d = DIGESTS[0];
  if (!d) return "";
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `
    <section class="digest-latest" aria-labelledby="dl-h">
      <div class="kit-section-head">
        <h2 id="dl-h">Latest AI digest</h2>
        <a class="kit-link" href="${base}/digest">Every edition</a>
      </div>
      ${digestCard(d)}
    </section>`;
}

function renderDigestIndex() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  setMeta({
    title: "AI digest · Market Ops Notes",
    description:
      "Every two days: what shipped in AI, what it changes for people building products, and the new courses worth an evening. Every number links to its source.",
    url: window.location.origin + base + "/digest",
  });
  document.getElementById("app").innerHTML = `
    ${siteNav("/digest")}
    <main class="home portal">
      <header class="brand-lockup">
        <div class="eyebrow">AI digest</div>
        <h1>What shipped in AI, read by someone who ships</h1>
        <p>Every two days: the releases that change a builder's week, what they mean for people running products, and the new Udemy and YouTube courses worth an evening. Every number links to its source.</p>
      </header>
      ${
        DIGESTS.length
          ? `<section class="digest-list">${DIGESTS.map(digestCard).join("")}</section>`
          : `<div class="empty-lib"><h3>The first edition is on its way.</h3><p>A new one lands here every two days.</p></div>`
      }
      ${subscribeBlock()}
    </main>`;
  window.scrollTo(0, 0);
}

function renderDigest(d) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  let html = stripLeadingH1(marked.parse(d.body));
  html = html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noreferrer"');
  const slides = slideUrls(d);
  const alts = slideAlts(d);
  setMeta({
    title: `${d.title} · AI digest`,
    description: d.summary,
    url: window.location.origin + base + `/digest/${d.slug}`,
    image: d.cover ? window.location.origin + base + d.cover : "",
  });
  const at = DIGESTS.indexOf(d);
  const newer = DIGESTS[at - 1];
  const older = DIGESTS[at + 1];
  document.getElementById("app").innerHTML = `
    ${siteNav("/digest")}
    <main class="digest">
      <header class="digest-head">
        <div class="eyebrow">AI digest · ${escapeHtml(fmtDate(d.date))}</div>
        <h1>${escapeHtml(d.title)}</h1>
        ${d.summary ? `<p class="digest-dek">${escapeHtml(d.summary)}</p>` : ""}
      </header>
      ${
        slides.length
          ? `<section class="digest-media" aria-label="The carousel">
        <div class="digest-strip">${slides
          .map(
            (s, n) =>
              `<a href="${s}" target="_blank" rel="noreferrer"><img src="${s}" alt="${escapeHtml(alts[n] || `Slide ${n + 1}`)}" loading="lazy" width="1080" height="1350" /></a>`
          )
          .join("")}</div>
        ${d.carousel ? `<a class="digest-pdf" href="${base}${d.carousel}" download>Download the carousel as a PDF</a>` : ""}
      </section>`
          : ""
      }
      <article class="content digest-body">${html}</article>
      ${subscribeBlock("inline")}
      <nav class="digest-more">
        ${newer ? `<a href="${base}/digest/${newer.slug}">Newer: ${escapeHtml(fmtDate(newer.date))}</a>` : "<span></span>"}
        <a href="${base}/digest">Every edition</a>
        ${older ? `<a href="${base}/digest/${older.slug}">Older: ${escapeHtml(fmtDate(older.date))}</a>` : "<span></span>"}
      </nav>
    </main>`;
  window.scrollTo(0, 0);
}

function renderCourses() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  setMeta({
    title: "Courses · Market Ops Notes",
    description: "James Liu's AI courses, plus the new Udemy and YouTube courses picked in each AI digest.",
    url: window.location.origin + base + "/courses",
  });
  const mine = (COURSES.mine || [])
    .map(
      (c) => `
    <article class="course-card">
      <div class="course-chips"><span class="pill-chip solid">${escapeHtml(c.platform)}</span><span class="pill-chip">${escapeHtml(c.status)}</span></div>
      <h3>${escapeHtml(c.title)}</h3>
      <p>${escapeHtml(c.promise)}</p>
      ${c.lectures ? `<div class="course-meta">${c.lectures} lectures · ${c.hours} hours</div>` : ""}
      ${
        c.url
          ? `<a class="kit-link" href="${escapeHtml(c.url)}" target="_blank" rel="noreferrer">Open on ${escapeHtml(c.platform)}</a>`
          : SUBSCRIBE_URL
            ? `<a class="kit-link" href="${escapeHtml(SUBSCRIBE_URL)}" target="_blank" rel="noreferrer">Get the launch email</a>`
            : ""
      }
    </article>`
    )
    .join("");
  const picks = [...(COURSES.picks || [])].sort((a, b) => b.added.localeCompare(a.added));
  const platforms = [...new Set(picks.map((p) => p.platform))];
  const rows = picks
    .map(
      (p) => `
    <a class="course-row" href="${escapeHtml(p.url)}" target="_blank" rel="noreferrer" data-platform="${escapeHtml(p.platform)}" data-free="${/free/i.test(p.price) ? "1" : "0"}">
      <div class="course-chips"><span class="pill-chip solid">${escapeHtml(p.platform)}</span><span class="pill-chip">${escapeHtml(p.price)}</span></div>
      <div class="course-row-t">${escapeHtml(p.title)}</div>
      <div class="course-row-p">${escapeHtml(p.provider)} · picked ${escapeHtml(fmtDate(p.added))}</div>
      <p>${escapeHtml(p.why)}</p>
    </a>`
    )
    .join("");
  document.getElementById("app").innerHTML = `
    ${siteNav("/courses")}
    <main class="home portal">
      <header class="brand-lockup">
        <div class="eyebrow">Courses</div>
        <h1>Learn it properly, then use it at work tomorrow</h1>
        <p>My own courses first. Below them, the new Udemy and YouTube courses each AI digest picked as worth an evening, newest first.</p>
      </header>
      ${mine ? `<section class="course-grid" aria-label="My courses">${mine}</section>` : ""}
      <section class="course-picks" aria-labelledby="picks-h">
        <div class="kit-section-head"><h2 id="picks-h">New courses worth your time</h2></div>
        <div class="filter-bar" role="group" aria-label="Filter the course picks">
          <button type="button" class="on" data-filter="all">All</button>
          ${platforms.map((p) => `<button type="button" data-filter="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join("")}
          <button type="button" data-filter="free">Free</button>
        </div>
        <div class="course-list">${rows || `<p class="note">The first picks arrive with the first digest.</p>`}</div>
      </section>
      ${subscribeBlock()}
    </main>`;
  const bar = document.querySelector(".filter-bar");
  bar?.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-filter]");
    if (!b) return;
    bar.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    const f = b.dataset.filter;
    document.querySelectorAll(".course-row").forEach((r) => {
      r.hidden = !(f === "all" || (f === "free" ? r.dataset.free === "1" : r.dataset.platform === f));
    });
  });
  window.scrollTo(0, 0);
}

onRoute(route);
route();
