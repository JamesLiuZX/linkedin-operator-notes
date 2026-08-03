import "./style.css";
import "./viz/palette.css";
import "./viz/viz.css";
import { marked } from "marked";
import manifest from "../../articles/unsplash-manifest.json";
import { ARTICLES, bySlug, bySection, SECTIONS } from "./content.js";
import { DEMOS, demoBySlug } from "./demos/index.js";
import { currentPath, navigate, onRoute } from "./router.js";
import { renderDashboard } from "./dashboard/index.js";
import { hydrateCharts } from "./viz/charts.js";

marked.setOptions({ gfm: true, breaks: false });

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

function renderHome() {
  const sections = bySection();
  const cards = ARTICLES.map((a, idx) => {
    const hero = manifest.articles[a.slug]?.hero;
    const featured = idx === 0 ? "featured" : "";
    return `
      <a class="article-card ${featured}" href="${hrefFor(a)}" style="animation-delay:${idx * 80}ms">
        <div class="media" style="background-image:url('${hero?.url || a.figure || ""}')"></div>
        <div class="body">
          <div class="series">${escapeHtml(a.series || a.section)}${
            a.status === "draft" ? " · draft" : ""
          }</div>
          <h2>${escapeHtml(a.title)}</h2>
          <div class="meta">${escapeHtml(a.summary)}</div>
        </div>
      </a>
    `;
  }).join("");

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
      <section class="article-grid">${
        cards ||
        `<div class="empty-lib">
           <h3>No essays are published yet.</h3>
           <p>Nine are written and pass the quality gate. They stay invisible until their <code>status:</code> frontmatter is advanced past <code>draft</code>, which is deliberate: the gate is editorial, not mechanical.</p>
           <p>To read them all on a preview deploy, set <code>VITE_SHOW_DRAFTS=1</code>. To publish one, set its status to <code>compliance-checked</code>.</p>
           <p>The demos above need no such approval and are live now.</p>
         </div>`
      }</section>
      <p class="note">
        Canonical paths: <code>/{section}/{slug}</code>. Demos run entirely in the browser, with no backend and no model calls.
      </p>
    </main>
  `;
}

function renderSection(section) {
  const items = ARTICLES.filter((a) => a.section === section.id);
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const cards = items
    .map(
      (a, idx) => `
      <a class="article-card" href="${hrefFor(a)}" style="animation-delay:${idx * 80}ms">
        <div class="media" style="background-image:url('${manifest.articles[a.slug]?.hero?.url || a.figure || ""}')"></div>
        <div class="body">
          <div class="series">${escapeHtml(a.series || section.title)}</div>
          <h2>${escapeHtml(a.title)}</h2>
          <div class="meta">${escapeHtml(a.summary)}</div>
        </div>
      </a>`
    )
    .join("");

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
      <section class="article-grid">${cards}</section>
    </main>
  `;
}

function renderArticle(article) {
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
        <a href="${hero?.unsplashUrl || "https://unsplash.com"}" target="_blank" rel="noreferrer">Unsplash credit</a>
      </nav>
      <header class="hero">
        <img src="${heroUrl}" alt="${escapeHtml(heroAlt)}" />
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
