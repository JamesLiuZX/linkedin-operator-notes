import "./style.css";
import { marked } from "marked";
import manifest from "../../articles/unsplash-manifest.json";

import raw01 from "../../articles/01-three-trust-surfaces.md?raw";
import raw02 from "../../articles/02-after-the-final.md?raw";
import raw03 from "../../articles/03-prototype-aggressively-productionize-suspiciously.md?raw";

marked.setOptions({ gfm: true, breaks: false });

const ARTICLES = [
  {
    slug: "01-three-trust-surfaces",
    title: "People don’t quit because they lost. They quit because they felt hustled.",
    series: "Market Ops Notes",
    status: "ready",
    blurb: "Price quality, resolution clarity, and surprise — the three places market products actually leak trust.",
    raw: raw01,
  },
  {
    slug: "02-after-the-final",
    title: "After the final: designing for the Tuesday nobody watches",
    series: "Market Ops Notes",
    status: "draft-rewrite",
    blurb: "Marquee spikes aren’t product-market fit. Week-two is.",
    raw: raw02,
  },
  {
    slug: "03-prototype-aggressively-productionize-suspiciously",
    title: "Prototype aggressively. Productionize suspiciously.",
    series: "Build Notes",
    status: "draft-rewrite",
    blurb: "AI demos steal roadmaps. Bounded autonomy is the adult version.",
    raw: raw03,
  },
];

function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) {
    return { meta: {}, body: raw };
  }
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: raw };
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\s+/, "");
  const meta = {};
  for (const line of fm.split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    meta[key] = val;
  }
  return { meta, body };
}

function stripLeadingH1(html) {
  return html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>/i, "");
}

function route() {
  const hash = location.hash.replace(/^#\/?/, "");
  if (!hash || hash === "home") return renderHome();
  const article = ARTICLES.find((a) => a.slug === hash);
  if (!article) return renderHome();
  return renderArticle(article);
}

function renderHome() {
  const cards = ARTICLES.map((a, idx) => {
    const hero = manifest.articles[a.slug]?.hero;
    const featured = idx === 0 ? "featured" : "";
    return `
      <a class="article-card ${featured}" href="#/${a.slug}" style="animation-delay:${idx * 80}ms">
        <div class="media" style="background-image:url('${hero?.url || ""}')"></div>
        <div class="body">
          <div class="series">${a.series}${a.status !== "ready" ? " · rewrite pending" : ""}</div>
          <h2>${a.title}</h2>
          <div class="meta">${a.blurb}</div>
        </div>
      </a>
    `;
  }).join("");

  document.getElementById("app").innerHTML = `
    <main class="home">
      <header class="brand-lockup">
        <div class="eyebrow">Preview · local only</div>
        <h1>Market Ops Notes</h1>
        <p>Field notes on prediction-market products and shipping AI near money — rendered the way a reader would see them.</p>
      </header>
      <section class="article-grid">${cards}</section>
      <p class="note">
        Images resolved from Unsplash via <code>npm run unsplash</code> →
        <code>articles/unsplash-manifest.json</code>. Generated ${new Date(manifest.generatedAt).toLocaleString()}.
      </p>
    </main>
  `;
}

function renderArticle(article) {
  const { meta, body } = parseFrontmatter(article.raw);
  const hero = manifest.articles[article.slug]?.hero;
  const heroUrl = meta.hero || hero?.url || "";
  const heroAlt = meta.heroAlt || hero?.alt || article.title;
  let html = marked.parse(body);
  html = stripLeadingH1(html);

  // For non-rewritten drafts: inject hero from manifest at top if no figure yet
  const hasFigure = /<figure>/i.test(html);
  if (!hasFigure && hero) {
    html =
      `<figure><img src="${hero.url}" alt="${escapeHtml(hero.alt)}" /><figcaption>Photo by ${escapeHtml(hero.photographer)} on Unsplash</figcaption></figure>` +
      html;
  }

  const draft =
    article.status !== "ready"
      ? `<div class="draft-banner">Voice rewrite still pending for this piece — previewing structure + Unsplash heroes only.</div>`
      : "";

  document.getElementById("app").innerHTML = `
    <div class="article-shell">
      <nav class="topbar">
        <a href="#/home">← All notes</a>
        <a class="brand" href="#/home">Market Ops Notes</a>
        <a href="${hero?.unsplashUrl || "https://unsplash.com"}" target="_blank" rel="noreferrer">Unsplash credit</a>
      </nav>
      <header class="hero">
        <img src="${heroUrl}" alt="${escapeHtml(heroAlt)}" />
        <div class="veil"></div>
        <div class="copy">
          <div class="series">${article.series}</div>
          <h1>${article.title}</h1>
          <div class="byline">James Liu · Operator notes</div>
        </div>
      </header>
      ${draft}
      <article class="content">${html}</article>
    </div>
  `;
  window.scrollTo(0, 0);
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

window.addEventListener("hashchange", route);
route();
