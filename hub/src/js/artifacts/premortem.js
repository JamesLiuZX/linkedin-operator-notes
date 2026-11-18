// hub/src/js/artifacts/premortem.js
//
// Draws a pre-mortem from premortem.json (see skills/premortem/references/
// format.md): the plan and the imagined date it failed, every risk placed by
// likelihood and impact, the top risks in full with their tripwires, the dates
// to put in a calendar, and the rest of the list.

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const parts = (iso) => /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
const date = (iso) => {
  const m = parts(iso);
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : esc(iso || "");
};
const longDate = (iso) => {
  const m = parts(iso);
  return m ? `${Number(m[3])} ${LONG[Number(m[2]) - 1]} ${m[1]}` : esc(iso || "");
};

const AREAS = [
  ["users", "Users"],
  ["behaviour", "Behaviour"],
  ["operations", "Operations"],
  ["money", "Money"],
  ["rules", "Rules"],
  ["build", "Build"],
];
const AREA = Object.fromEntries(AREAS);
const LEVELS = ["low", "medium", "high"];
const EVIDENCE = {
  supported: ["Evidence for", "ink"],
  contradicted: ["Evidence against", "ok"],
  unknown: ["A guess", "warn"],
};

const level = (l) => `<span class="pm-lv pm-${esc(l)}"><i></i><i></i><i></i></span>`;

function evidence(r, inputs) {
  const e = r.evidence || {};
  const [word, tone] = EVIDENCE[e.status] || EVIDENCE.unknown;
  const from = e.from && inputs[e.from] ? inputs[e.from].label : "";
  return `<div class="pm-ev">
    <div class="pm-ev-top"><span class="atag ${tone}">${word}</span>${from ? `<b>${esc(from)}</b>` : ""}</div>
    ${e.detail ? `<p>${esc(e.detail)}</p>` : e.status === "unknown" ? `<p>Nothing in the inputs speaks to this either way.</p>` : ""}
    ${e.expect ? `<p class="pm-expect"><span>If it is real, you would see</span> ${esc(e.expect)}</p>` : ""}
  </div>`;
}

function topRisk(r, rank, inputs) {
  const w = r.tripwire || {};
  return `<article class="pm-risk" data-risk="${esc(r.id)}" id="${esc(r.id)}">
    <div class="pm-risk-head">
      <span class="pm-rank">${rank}</span>
      <div>
        <div class="pm-meta"><span class="aid">${esc(r.id)}</span><span class="atag">${esc(AREA[r.area] || r.area)}</span></div>
        <h2>${esc(r.title)}</h2>
      </div>
      <dl class="pm-li">
        <div><dt>Likelihood</dt><dd>${level(r.likelihood)}<b>${esc(r.likelihood)}</b></dd></div>
        <div><dt>Impact</dt><dd>${level(r.impact)}<b>${esc(r.impact)}</b></dd></div>
      </dl>
    </div>
    <p class="pm-story">${esc(r.story)}</p>
    ${evidence(r, inputs)}
    <div class="pm-wire" data-wire="${esc(r.id)}">
      <span class="pm-k">Tripwire</span>
      <div class="pm-wire-grid">
        <div class="wide"><span>Watch</span><b>${esc(w.metric || "")}</b></div>
        <div class="wide"><span>Trips when</span><b>${esc(w.threshold || "")}</b></div>
        <div><span>Look on</span><b>${date(w.check)}</b></div>
        <div><span>Who looks</span><b>${esc(w.owner || "")}</b></div>
      </div>
    </div>
    ${
      r.mitigation || r.test
        ? `<div class="pm-do">
      ${r.mitigation ? `<div><span class="pm-k">Change to the plan</span><p>${esc(r.mitigation)}</p></div>` : ""}
      ${r.test ? `<div><span class="pm-k">Cheapest test before launch</span><p>${esc(r.test)}</p></div>` : ""}
    </div>`
        : ""
    }
  </article>`;
}

function restRisk(r, inputs) {
  const [word, tone] = EVIDENCE[r.evidence?.status] || EVIDENCE.unknown;
  return `<details class="pm-row" data-risk="${esc(r.id)}" id="${esc(r.id)}">
    <summary>
      <span class="aid ink">${esc(r.id)}</span>
      <span class="pm-row-title">${esc(r.title)}</span>
      <span class="atag">${esc(AREA[r.area] || r.area)}</span>
      <span class="atag ${tone}">${word}</span>
      <span class="pm-row-li" title="Likelihood ${esc(r.likelihood)}, impact ${esc(r.impact)}">${level(r.likelihood)}${level(r.impact)}</span>
    </summary>
    <div class="pm-row-body">
      <p class="pm-story">${esc(r.story)}</p>
      <p class="pm-why"><b>Likelihood ${esc(r.likelihood)}.</b> ${esc(r.likelihoodWhy || "")} <b>Impact ${esc(r.impact)}.</b> ${esc(r.impactWhy || "")}</p>
      ${evidence(r, inputs)}
      ${r.mitigation ? `<p class="pm-why"><b>What would help.</b> ${esc(r.mitigation)}</p>` : ""}
    </div>
  </details>`;
}

function matrix(risks, top) {
  const cell = (l, i) => risks.filter((r) => r.likelihood === l && r.impact === i);
  const rows = [...LEVELS].reverse();
  return `<div class="pm-matrix" data-part="matrix">
    <span class="pm-axis-y">Impact</span>
    <div class="pm-cells">
      ${rows
        .map((i) =>
          LEVELS.map((l) => {
            const heat = LEVELS.indexOf(l) + LEVELS.indexOf(i);
            return `<div class="pm-cell h${heat}" data-cell="${l}-${i}">${cell(l, i)
              .map((r) => `<a href="#${esc(r.id)}" class="aid${top.includes(r.id) ? "" : " ghost"}" data-chip="${esc(r.id)}" title="${esc(r.title)}">${esc(r.id)}</a>`)
              .join("")}</div>`;
          }).join(""),
        )
        .join("")}
    </div>
    <div class="pm-axis-x"><span>Low</span><span>Likelihood</span><span>High</span></div>
  </div>`;
}

export function renderPremortem(data) {
  const risks = data.risks || [];
  const top = (data.top || []).filter((id) => risks.some((r) => r.id === id));
  const byId = Object.fromEntries(risks.map((r) => [r.id, r]));
  const inputs = Object.fromEntries((data.inputs || []).map((i) => [i.id, i]));
  const rest = risks.filter((r) => !top.includes(r.id));
  const count = (status) => risks.filter((r) => (r.evidence?.status || "unknown") === status).length;
  const wires = top
    .map((id) => byId[id])
    .filter((r) => r.tripwire && r.tripwire.check)
    .sort((a, b) => String(a.tripwire.check).localeCompare(String(b.tripwire.check)));
  const skipped = data.skipped || {};
  const plan = data.plan || {};

  return `
  <div class="pm-wrap">
    <header class="pm-head">
      <div class="pm-ey">Pre-mortem${data.asOf ? ` · written ${date(data.asOf)}` : ""}</div>
      <h1>${esc(data.title || plan.name || "Pre-mortem")}</h1>
      <p class="pm-premise">It is <mark>${longDate(data.failedOn)}</mark>. The plan shipped, and it went badly. These are the reasons, written while the plan can still change.</p>
      <div class="pm-plan">
        <div class="wide"><span class="pm-k">The plan</span><p><b>${esc(plan.name || "")}.</b> ${esc(plan.summary || "")}</p></div>
        ${plan.ships ? `<div><span class="pm-k">Ships</span><p>${esc(plan.ships)}</p></div>` : ""}
        ${plan.goal ? `<div><span class="pm-k">Meant to change</span><p>${esc(plan.goal)}</p></div>` : ""}
      </div>
    </header>

    <section class="pm-over" data-part="map">
      ${matrix(risks, top)}
      <div class="pm-side">
        <div class="pm-tally" data-part="tally">
          <div><b>${risks.length}</b><span>risks</span></div>
          <div><b>${top.length}</b><span>with a tripwire</span></div>
          <div><b>${count("unknown")}</b><span>are guesses</span></div>
        </div>
        <div class="pm-areas">
          ${AREAS.map(([id, name]) => {
            const n = risks.filter((r) => r.area === id).length;
            return `<div class="${n ? "" : "none"}" title="${esc(skipped[id] || "")}"><span>${name}</span><i style="--n:${n}"></i><b>${n || "none"}</b></div>`;
          }).join("")}
        </div>
        ${(data.inputs || []).length ? `<p class="pm-inputs"><span class="pm-k">Weighed against</span>${data.inputs.map((i) => `<span title="${esc(i.detail || "")}">${esc(i.label)}</span>`).join("")}</p>` : ""}
      </div>
    </section>

    <section class="pm-top" data-part="top">
      <h3>The ${top.length} to watch, worst first</h3>
      ${top.map((id, i) => topRisk(byId[id], i + 1, inputs)).join("")}
    </section>

    ${
      wires.length
        ? `<section class="pm-cal" data-part="calendar">
      <h3>Dates to put in a calendar today</h3>
      <ol>${wires
        .map((r) => {
          const m = parts(r.tripwire.check);
          return `<li data-date="${esc(r.id)}"><time datetime="${esc(r.tripwire.check)}"><b>${m ? Number(m[3]) : ""}</b><span>${m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : esc(r.tripwire.check)}</span></time><div><a href="#${esc(r.id)}" class="aid">${esc(r.id)}</a><b>${esc(r.tripwire.metric)}</b><span>${esc(r.tripwire.owner)}</span></div></li>`;
        })
        .join("")}</ol>
    </section>`
        : ""
    }

    ${
      rest.length
        ? `<section class="pm-rest" data-part="rest">
      <h3>The rest of the list</h3>
      ${rest.map((r) => restRisk(r, inputs)).join("")}
    </section>`
        : ""
    }

    ${
      (data.cut || []).length || Object.keys(skipped).length
        ? `<footer class="pm-foot">
      ${Object.entries(skipped).map(([area, why]) => `<p><b>No ${esc((AREA[area] || area).toLowerCase())} risk.</b> ${esc(why)}</p>`).join("")}
      ${(data.cut || []).map((c) => `<p><b>Left out.</b> ${esc(c)}</p>`).join("")}
    </footer>`
        : ""
    }
  </div>`;
}

export function mountPremortem(root, data) {
  root.classList.add("adoc", "premortem");
  root.innerHTML = renderPremortem(data);
  root.addEventListener("click", (ev) => {
    const chip = ev.target.closest("[data-chip]");
    if (!chip) return;
    const row = root.querySelector(`details[data-risk="${chip.dataset.chip}"]`);
    if (row) row.open = true;
  });
  return {
    root,
    open(id, on = true) {
      const row = root.querySelector(`details[data-risk="${id}"]`);
      if (row) row.open = on;
    },
  };
}
