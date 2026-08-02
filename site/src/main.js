import "./style.css";
import { marked } from "marked";
import manifest from "../../articles/unsplash-manifest.json";
import { ARTICLES, bySlug, bySection, SECTIONS } from "./content.js";
import { currentPath, navigate, onRoute } from "./router.js";

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

  const parts = clean.split("/").filter(Boolean);
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

  setMeta({
    title: "Market Ops Notes",
    description:
      "Field notes on prediction-market products and shipping AI near money.",
    url: window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, "") + "/",
  });

  document.getElementById("app").innerHTML = `
    <main class="home">
      <header class="brand-lockup">
        <div class="eyebrow">Market Ops Notes</div>
        <h1>Field notes from markets and agents</h1>
        <p>Resolution, liquidity, incentives, and AI pointed at systems that have consequences.</p>
        <div class="section-nav">${sectionNav}</div>
      </header>
      <section class="article-grid">${cards || '<p class="note">No published pieces yet.</p>'}</section>
      <p class="note">
        Images from Unsplash via <code>npm run unsplash</code>.
        Canonical paths: <code>/{section}/{slug}</code>.
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

onRoute(route);
route();
