// hub/lib/html.mjs
//
// The page shell every hub page is rendered into, plus the small helpers the
// templates share. Plain template strings: no framework, nothing to learn.

import { SITE, repoUrl } from "../site.config.mjs";

export const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/** Marks `*word*` as a highlighter stroke. Everything else is escaped. */
export const hl = (s) => esc(s).replace(/\*([^*]+)\*/g, '<span class="hl">$1</span>');

export const ICON = {
  arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5"/></svg>',
  arrowUpRight: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg>',
  search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg>',
  copy: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"/></svg>',
  check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>',
  play: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4.5 2.8v10.4a.6.6 0 0 0 .92.5l8.1-5.2a.6.6 0 0 0 0-1L5.42 2.3a.6.6 0 0 0-.92.5Z"/></svg>',
  pause: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="3.5" y="2.5" width="3.2" height="11" rx="1"/><rect x="9.3" y="2.5" width="3.2" height="11" rx="1"/></svg>',
  replay: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 8a5.5 5.5 0 1 0 1.7-4"/><path d="M2.5 2.5v3h3"/></svg>',
  github: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 .2a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0 0 8 .2Z"/></svg>',
  rss: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3 3a10 10 0 0 1 10 10M3 7.5A5.5 5.5 0 0 1 8.5 13"/><circle cx="3.6" cy="12.4" r="1" fill="currentColor" stroke="none"/></svg>',
  menu: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2.5 5h11M2.5 11h11"/></svg>',
  download: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2.5v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10"/></svg>',
  expand: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9"/></svg>',
  linkedin: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.6 0H2.4A2.4 2.4 0 0 0 0 2.4v11.2A2.4 2.4 0 0 0 2.4 16h11.2a2.4 2.4 0 0 0 2.4-2.4V2.4A2.4 2.4 0 0 0 13.6 0ZM5 13H2.9V6.2H5V13ZM3.9 5.3a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4ZM13.1 13H11V9.6c0-.9-.3-1.5-1.1-1.5-.6 0-1 .4-1.1.8-.1.2-.1.4-.1.6V13H6.6V6.2h2.1v.9c.3-.5.9-1.1 2-1.1 1.5 0 2.4 1 2.4 3V13Z"/></svg>',
};

/** The mark: a page with one highlighted line. */
const MARK_BODY =
  '<rect width="24" height="24" rx="7" fill="#0c0c0b"/><rect x="6" y="6.300" width="9.500" height="2" rx="1" fill="#ffffff" opacity=".42"/><rect x="4.800" y="10.200" width="14.400" height="3.800" rx="1.200" fill="#d8ff3f"/><rect x="6" y="15.900" width="6.500" height="2" rx="1" fill="#ffffff" opacity=".42"/>';
export const MARK = `<svg class="mark" viewBox="0 0 24 24" aria-hidden="true">${MARK_BODY}</svg>`;

const FAVICON = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${MARK_BODY}</svg>`);

const NAV = [
  ["/workflows/", "Workflows"],
  ["/cases/", "Cases"],
  ["/skills/", "Skills"],
  ["/weekly/", "Weekly"],
  ["/about/", "About"],
];

/**
 * @param {object} ctx  build context: { url(path), abs(path), assets: { css, js } }
 * @param {object} p    page: { title, description, path, body, active, ogImage, type, bodyClass, head, noindex }
 */
export function page(ctx, p) {
  const fullTitle = p.path === "/" ? `${SITE.name}: ${SITE.tagline[0].toLowerCase()}${SITE.tagline.slice(1)}` : `${p.title} · ${SITE.name}`;
  const description = p.description || SITE.description;
  const canonical = ctx.abs(p.path);
  const og = ctx.abs(p.ogImage || "/hub/og/default.png");
  const active = p.active || "";

  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${p.noindex ? '<meta name="robots" content="noindex">' : ""}
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(p.path === "/" ? SITE.name : p.title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="${p.type || "website"}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="author" content="${esc(SITE.author.name)}">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="${esc(p.themeColor || "#ffffff")}">
<link rel="icon" href="${FAVICON}">
<link rel="alternate" type="application/rss+xml" title="${esc(SITE.weekly.name)}" href="${ctx.url("/feed.xml")}">
<link rel="preload" href="${ctx.url("/hub/fonts/geist-latin-wght-normal.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${ctx.url("/hub/fonts/bricolage-grotesque-latin-opsz-normal.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${ctx.url(ctx.assets.css)}">
<script>document.documentElement.className="js"</script>
${p.head || ""}
</head>
<body class="${esc(p.bodyClass || "")}" data-base="${esc(ctx.url("/"))}"${p.wf ? ` data-wf="${esc(p.wf)}"` : ""}>
<a class="sr" href="#main">Skip to content</a>
<header class="nav" data-nav>
  <div class="wrap nav-in">
    <a class="brand" href="${ctx.url("/")}">${MARK}<span>${esc(SITE.name)}</span></a>
    <nav class="nav-links" aria-label="Main">
      ${NAV.map(([href, label]) => `<a href="${ctx.url(href)}"${active === href ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
    </nav>
    <div class="nav-end">
      <button class="kbd-btn" type="button" data-cmdk-open aria-label="Search the handbook">${ICON.search}<span>Search</span><kbd>⌘K</kbd></button>
      <a class="icon-btn" href="${repoUrl()}" target="_blank" rel="noopener" aria-label="The skills on GitHub">${ICON.github}</a>
      <a class="btn sm" href="${ctx.url("/weekly/")}#subscribe">Subscribe</a>
      <button class="icon-btn nav-toggle" type="button" data-nav-toggle aria-label="Menu" aria-expanded="false">${ICON.menu}</button>
    </div>
  </div>
</header>
<main id="main">
${p.body}
</main>
<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-about">
        <a class="brand" href="${ctx.url("/")}">${MARK}<span>${esc(SITE.name)}</span></a>
        <p>Working AI workflows for product, research, data and strategy people. Free. Every example on this site has passed its skill's own checks.</p>
      </div>
      <div>
        <h4 class="label">Handbook</h4>
        <ul>
          <li><a href="${ctx.url("/workflows/")}">All workflows</a></li>
          <li><a href="${ctx.url("/cases/")}">The three cases</a></li>
          <li><a href="${ctx.url("/guides/start/")}">Start here</a></li>
          <li><a href="${ctx.url("/guides/checking-ai-output/")}">Checking AI output</a></li>
          <li><a href="${ctx.url("/guides/write-your-own/")}">Write your own skill</a></li>
        </ul>
      </div>
      <div>
        <h4 class="label">Skills</h4>
        <ul>
          <li><a href="${ctx.url("/skills/")}">Install the pack</a></li>
          <li><a href="${repoUrl(SITE.repo.skillsDir)}" target="_blank" rel="noopener">Read the source</a></li>
          <li><a href="${ctx.url("/changelog/")}">Changelog</a></li>
          <li><a href="${ctx.url("/llms.txt")}">llms.txt</a></li>
        </ul>
      </div>
      <div>
        <h4 class="label">Follow</h4>
        <ul>
          <li><a href="${ctx.url("/weekly/")}">${esc(SITE.weekly.name)}</a></li>
          <li><a href="${ctx.url("/feed.xml")}">RSS</a></li>
          <li><a href="${esc(SITE.author.linkedin)}" target="_blank" rel="noopener">LinkedIn</a></li>
          <li><a href="${ctx.url("/about/")}">About</a></li>
          <li><a href="${ctx.url("/archive/")}">Earlier notes and digest</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-base">
      <span>Made by <a href="${esc(SITE.author.url)}" target="_blank" rel="noopener">${esc(SITE.author.name)}</a>. Every company, person and number in the examples is invented.</span>
      <span>Skills are MIT licensed.</span>
    </div>
    <p class="footer-word" aria-hidden="true">Show your work.</p>
  </div>
</footer>
<div data-cmdk hidden></div>
<script type="module" src="${ctx.url(ctx.assets.js)}"></script>
</body>
</html>
`;
}
