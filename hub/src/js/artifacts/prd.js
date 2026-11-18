// hub/src/js/artifacts/prd.js
//
// Renders a decision-ready PRD from prd.json (the format is described in
// skills/decision-prd/references/format.md). The page is built for a reviewer
// who skims: the headings alone give the problem list, and every point keeps
// its evidence beside it.

import { screenSvg } from "./screen.js";

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/** Inline emphasis only: `code` and *highlight*. Everything else is text. */
const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*([^*]+)\*/g, "<mark>$1</mark>");

const fmtDate = (iso) => {
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? String(iso || "") : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

const TAG = { today: "Today", reference: "Reference", proposed: "Proposed" };
const anchor = (id) => `p${String(id).replace(/\./g, "-")}`;

function figure(e, i) {
  const pic = e.screen?.img
    ? `<img src="${esc(e.screen.img)}" alt="${esc(e.caption || e.label || "")}" loading="lazy">`
    : screenSvg(e.screen || {}, { idPrefix: `e${i}` });
  return `
  <figure class="prd-fig" data-fig>
    <button type="button" data-zoom data-cap="${esc(`${e.label || TAG[e.tag] || ""}: ${e.caption || ""}`)}" aria-label="Enlarge: ${esc(e.caption || e.label || "")}">${pic}</button>
    <figcaption><span class="atag ${e.tag === "proposed" ? "hi" : e.tag === "reference" ? "info" : ""}">${esc(e.label || TAG[e.tag] || e.tag)}</span>${esc(e.caption || "")}</figcaption>
  </figure>`;
}

function point(p, doc, sources, n) {
  const cite = (ref) => {
    const [sid, where] = String(ref).split(":");
    const src = sources.find((s) => s.id === sid);
    const label = src ? `${src.label}${where ? `, ${where}` : ""}` : ref;
    return src?.href ? `<a class="prd-cite" href="${esc(src.href)}">${esc(label)}</a>` : `<span class="prd-cite">${esc(label)}</span>`;
  };
  const proto = doc.prototype?.href ? `${doc.prototype.href}#${p.screen || "home"}?on=${p.id}` : "";
  return `
  <article class="prd-pt" id="${anchor(p.id)}" data-point="${esc(p.id)}">
    <h3><span class="aid">${esc(p.id)}</span><span>${inline(p.title)}</span></h3>
    <p><b>Problem.</b> ${inline(p.problem)}</p>
    <p><b>Change.</b> ${inline(p.change)}</p>
    ${p.why ? `<p class="prd-why">${inline(p.why)}</p>` : ""}
    ${p.constraint ? `<div class="prd-note"><b>${esc(p.constraint.label || "Constraint")}.</b> ${inline(p.constraint.text)}</div>` : ""}
    ${(p.evidence || []).length ? `<div class="prd-figs">${p.evidence.map((e, i) => figure(e, `${n}-${i}`)).join("")}</div>` : ""}
    ${
      p.know
        ? `<dl class="prd-know">
      <div><dt>Baseline to measure</dt><dd>${inline(p.know.baseline)}</dd></div>
      <div><dt>What should move</dt><dd>${inline(p.know.expect)}</dd></div>
      <div><dt>Stop if</dt><dd>${inline(p.know.stop)}</dd></div>
    </dl>`
        : ""
    }
    <footer class="prd-pt-foot">
      <span class="prd-cites"><span class="prd-k">Rests on</span>${(p.sources || []).map(cite).join("")}</span>
      ${proto ? `<a class="prd-proto" href="${esc(proto)}">See ${esc(p.id)} in the prototype ›</a>` : ""}
    </footer>
  </article>`;
}

export function renderPrd(data) {
  const doc = data.doc || {};
  const sections = data.sections || [];
  const sources = data.sources || [];
  const points = sections.flatMap((s) => s.points || []);
  const idLink = (id) => `<a class="aid" href="#${anchor(id)}">${esc(id)}</a>`;
  let n = 0;

  return `
  <nav class="prd-bar" data-prd-bar><div class="prd-bar-in">
    <a class="prd-brand" href="#prd-top">${esc(doc.short || doc.title || "PRD")}</a>
    ${sections.map((s) => `<a href="#prd-s${s.n}">${s.n}. ${esc(s.title)}</a>`).join("")}
    ${(data.priority || []).length ? `<a href="#prd-priority">Priorities</a>` : ""}
    ${(data.rollout || []).length ? `<a href="#prd-rollout">Rollout</a>` : ""}
  </div></nav>

  <div class="prd-wrap" id="prd-top">
    <header class="prd-hero" data-part="hero">
      <div class="prd-ey">${[doc.eyebrow || "Draft for review", doc.author, fmtDate(doc.date)].filter(Boolean).map(esc).join(" · ")}</div>
      <h1>${inline(doc.title)}</h1>
      <p>${inline(doc.summary)}</p>
      <div class="prd-hero-foot">
        ${doc.prototype?.href ? `<a class="prd-cta" href="${esc(doc.prototype.href)}">${esc(doc.prototype.label || "Open the clickable prototype")} ›</a>` : ""}
        <span>${points.length} points · ${sections.length} sections${doc.fictional ? " · fictional example" : ""}</span>
      </div>
    </header>

    <div class="prd-sum" data-part="sum">
      ${sections.map((s) => `<a href="#prd-s${s.n}" data-sum><i>${s.n}</i><b>${esc(s.title)}</b><span>${inline(s.summary || "")}</span></a>`).join("")}
    </div>

    ${
      sources.length
        ? `<p class="prd-src" data-part="src"><span class="prd-k">Evidence comes from</span>${sources
            .map((s) => `${s.href ? `<a href="${esc(s.href)}">${esc(s.label)}</a>` : `<b>${esc(s.label)}</b>`} <span>(${esc(s.detail || "")})</span>`)
            .join(" · ")}. ${esc(data.sourceNote || "")}</p>`
        : ""
    }

    ${sections
      .map(
        (s) => `
    <section class="prd-sec" id="prd-s${s.n}">
      <div class="prd-sec-head" data-part="sec-${s.n}"><h2>${s.n}. ${esc(s.title)}</h2>${s.lead ? `<p>${inline(s.lead)}</p>` : ""}</div>
      ${(s.points || []).map((p) => point(p, doc, sources, n++)).join("")}
    </section>`
      )
      .join("")}

    ${
      (data.priority || []).length
        ? `<section class="prd-sec" id="prd-priority" data-part="priority">
      <div class="prd-sec-head"><h2>Priorities at a glance</h2><p>${inline(data.priorityLead || "What each point moves, what it costs, and what could hold it up.")}</p></div>
      <div class="prd-tw"><table class="prd-table">
        <thead><tr><th>#</th><th>Change</th><th>Moves</th><th>Effort</th><th>Depends on</th><th>First step</th></tr></thead>
        <tbody>${data.priority
          .map(
            (r) => `<tr data-row><td>${idLink(r.id)}</td><td><b>${inline(r.change)}</b></td><td>${inline(r.moves)}</td><td><span class="prd-effort">${esc(r.effort)}</span></td>
            <td><span class="atag ${r.status?.level === "ok" ? "ok" : r.status?.level === "no" ? "bad" : "warn"}">${esc(r.status?.text || "")}</span></td><td>${inline(r.first)}</td></tr>`
          )
          .join("")}</tbody>
      </table></div>
    </section>`
        : ""
    }

    ${
      (data.rollout || []).length
        ? `<section class="prd-sec" id="prd-rollout" data-part="rollout">
      <div class="prd-sec-head"><h2>Rollout</h2><p>${inline(data.rolloutLead || "What ships when, and why then.")}</p></div>
      <div class="prd-tw"><table class="prd-table">
        <thead><tr><th>When</th><th>Points</th><th>Why then</th></tr></thead>
        <tbody>${data.rollout.map((r) => `<tr data-row><td><b>${esc(r.when)}</b></td><td class="prd-ids">${(r.points || []).map(idLink).join("")}</td><td>${inline(r.why)}</td></tr>`).join("")}</tbody>
      </table></div>
      ${(data.next || []).length ? `<div class="prd-pt prd-next"><h3><span>Next steps</span></h3><ul>${data.next.map((x) => `<li>${inline(x)}</li>`).join("")}</ul></div>` : ""}
    </section>`
        : ""
    }

    <footer class="prd-foot">${inline(data.caveats || "")}</footer>
  </div>

  <div class="prd-lb" data-lb hidden><div data-lb-pic></div><p data-lb-cap></p></div>`;
}

export function mountPrd(root, data) {
  root.classList.add("adoc", "prd");
  root.innerHTML = renderPrd(data);
  const lb = root.querySelector("[data-lb]");
  root.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-zoom]");
    if (b) {
      lb.querySelector("[data-lb-pic]").innerHTML = b.innerHTML;
      lb.querySelector("[data-lb-cap]").textContent = b.dataset.cap || "";
      lb.hidden = false;
      return;
    }
    if (ev.target.closest("[data-lb]")) lb.hidden = true;
  });
  root.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") lb.hidden = true;
  });
  return { root, points: () => [...root.querySelectorAll("[data-point]")] };
}
