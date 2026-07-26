// site/src/dashboard/index.js
//
// The posting dashboard. One screen that answers four questions:
//   what ships next, is it actually ready, is the mix right, and what is rotting.
//
// Everything here is derived. The schedule comes from content/schedule.json, the
// readiness score comes from the same analyzer CI runs, and the body text comes
// from the markdown file itself. Nothing is typed twice, so nothing can drift.

import schedule from "../../../content/schedule.json";
import { byPath } from "../content.js";
import { analyze } from "@lib/analyze.mjs";
import { demoBySlug } from "../demos/index.js";
import { statRow, meter, esc, fmt } from "../viz/charts.js";

const KIND_LABEL = {
  essay: "Essay", demo: "Demo", atom: "Atom",
  thread: "Thread", teardown: "Teardown", newsletter: "Newsletter",
};

const STATUS_ORDER = ["idea", "drafted", "ready", "scheduled", "published"];

const STATUS_TONE = {
  idea: "", drafted: "warning", ready: "good",
  scheduled: "good", published: "good",
};

/* ------------------------------------------------------------------ derive */

/** Join each schedule entry to its markdown asset and score it. */
export function buildRows(today = new Date()) {
  return schedule.entries.map((e) => {
    const item = e.asset ? byPath(e.asset) : null;
    const kind = e.asset?.startsWith("articles") ? "article" : "post";
    const quality = item ? analyze(item.raw, kind) : null;
    const when = new Date(`${e.date}T${e.time || "08:30"}:00+08:00`);
    const demo = e.demo ? demoBySlug(e.demo) : null;

    return {
      ...e,
      item,
      demo,
      quality,
      when,
      isPast: when < today,
      // "At risk" is the only judgement this dashboard makes: a date that has
      // arrived with an asset that would not survive the gate.
      atRisk:
        when < today &&
        e.status !== "published" &&
        (!item || (quality && quality.fails > 0)),
    };
  });
}

function mixReport(rows) {
  // The target mix in positioning is per 4-week block, so score the first block
  // and report the rest as a trend rather than pretending 12 weeks is one block.
  const block = rows.filter((r) => r.week <= 4);
  const counts = {};
  for (const r of block) counts[r.kind] = (counts[r.kind] || 0) + 1;
  return Object.entries(schedule.targetMix)
    .filter(([k]) => k !== "$comment")
    .map(([kind, target]) => ({
      kind,
      target,
      actual: counts[kind] || 0,
    }));
}

/* -------------------------------------------------------------------- view */

let filters = { channel: "all", kind: "all", status: "all" };

export function renderDashboard(mountEl, { basePath = "" } = {}) {
  const today = new Date();
  const rows = buildRows(today);

  const upcoming = rows
    .filter((r) => !r.isPast && r.status !== "published")
    .sort((a, b) => a.when - b.when);
  const next = upcoming[0];
  const atRisk = rows.filter((r) => r.atRisk);
  const ready = rows.filter((r) => r.status === "ready" || r.status === "scheduled" || r.status === "published");
  const scored = rows.filter((r) => r.quality);
  const avgScore = scored.length
    ? Math.round(scored.reduce((s, r) => s + r.quality.score, 0) / scored.length)
    : 0;
  const blocking = scored.filter((r) => r.quality.fails > 0);

  const visible = rows.filter(
    (r) =>
      (filters.channel === "all" || r.channel === filters.channel) &&
      (filters.kind === "all" || r.kind === filters.kind) &&
      (filters.status === "all" || r.status === filters.status)
  );

  const weeks = [...new Set(visible.map((r) => r.week))].sort((a, b) => a - b);

  const chip = (group, value, label, count) =>
    `<button class="filter-chip${filters[group] === value ? " on" : ""}"
       data-group="${group}" data-value="${value}">${esc(label)}${
       count != null ? `<span>${count}</span>` : ""
     }</button>`;

  const channels = [...new Set(rows.map((r) => r.channel))];
  const kinds = [...new Set(rows.map((r) => r.kind))];

  mountEl.innerHTML = `
  <main class="dash viz">
    <header class="dash-head">
      <div class="eyebrow">Posting dashboard</div>
      <h1>${schedule.weeks} weeks, ${rows.length} slots</h1>
      <p>Every row is joined to a real file and scored by the same analyzer CI runs. A green score means it would survive <code>npm run content:check</code> today.</p>
    </header>

    ${statRow([
      {
        label: "Next up",
        value: next ? `${next.when.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : "nothing queued",
        sub: next ? `${KIND_LABEL[next.kind]} on ${schedule.channels[next.channel].label}` : "",
      },
      { label: "Ready to ship", value: `${ready.length}/${rows.length}`, sub: "status ready or better", tone: ready.length / rows.length > 0.5 ? "good" : "warning" },
      { label: "Mean quality", value: String(avgScore), sub: `${scored.length} scored assets`, tone: avgScore >= 86 ? "good" : avgScore >= 70 ? "warning" : "critical" },
      { label: "Would fail the gate", value: String(blocking.length), sub: "fix before the date arrives", tone: blocking.length ? "critical" : "good" },
    ])}

    ${
      atRisk.length
        ? `<div class="alert tone-critical">
             <strong>${atRisk.length} slot${atRisk.length > 1 ? "s" : ""} past due and not shippable.</strong>
             <span>${atRisk.slice(0, 3).map((r) => esc(r.title)).join(" · ")}${atRisk.length > 3 ? ` and ${atRisk.length - 3} more` : ""}</span>
           </div>`
        : ""
    }

    <section class="mix">
      <h2>Mix against target</h2>
      <p class="dash-note">Target is per four-week block, from the positioning doc: four demos, two essays, one teardown, seven atoms. Weeks 1 to 4 shown.</p>
      <div class="mix-grid">
        ${mixReport(rows)
          .map((m) =>
            meter({
              label: `${KIND_LABEL[m.kind] || m.kind}`,
              value: m.actual,
              max: Math.max(m.target, m.actual, 1),
              display: `${m.actual} of ${m.target}`,
              tone: m.actual >= m.target ? "" : "warning",
            })
          )
          .join("")}
      </div>
    </section>

    <section class="filters">
      <div class="filter-row">
        <span class="filter-label mono">channel</span>
        ${chip("channel", "all", "all", rows.length)}
        ${channels.map((c) => chip("channel", c, schedule.channels[c].label, rows.filter((r) => r.channel === c).length)).join("")}
      </div>
      <div class="filter-row">
        <span class="filter-label mono">format</span>
        ${chip("kind", "all", "all")}
        ${kinds.map((k) => chip("kind", k, KIND_LABEL[k] || k, rows.filter((r) => r.kind === k).length)).join("")}
      </div>
      <div class="filter-row">
        <span class="filter-label mono">status</span>
        ${chip("status", "all", "all")}
        ${STATUS_ORDER.filter((s) => rows.some((r) => r.status === s))
          .map((s) => chip("status", s, s, rows.filter((r) => r.status === s).length))
          .join("")}
      </div>
    </section>

    <section class="weeks">
      ${
        weeks.length === 0
          ? `<p class="note">No slots match that filter.</p>`
          : weeks
              .map((w) => {
                const items = visible.filter((r) => r.week === w);
                const start = items[0]?.when;
                return `
        <div class="week">
          <div class="week-head">
            <h3>Week ${w}</h3>
            <span class="mono">${start ? start.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}</span>
          </div>
          <div class="slot-grid">
            ${items.map((r) => slotCard(r, basePath)).join("")}
          </div>
        </div>`;
              })
              .join("")
      }
    </section>

    <footer class="dash-foot">
      <p><strong>Distribution notes, not writing notes.</strong> ${esc(schedule.channels.linkedin.note)} A post landing at 08:30 SGT needs someone at a keyboard by 09:00, because the first sixty minutes carry the reach.</p>
      <p class="dash-note">Edit <code>content/schedule.json</code> to change any of this. The dashboard has no state of its own.</p>
    </footer>
  </main>`;

  mountEl.querySelectorAll(".filter-chip").forEach((b) =>
    b.addEventListener("click", () => {
      filters[b.dataset.group] = b.dataset.value;
      renderDashboard(mountEl, { basePath });
    })
  );

  mountEl.querySelectorAll("[data-copy]").forEach((b) =>
    b.addEventListener("click", async () => {
      const row = rows.find((r) => r.id === b.dataset.copy);
      if (!row?.item) return;
      const body = row.item.body.replace(/<!--[\s\S]*?-->/g, "").trim();
      try {
        await navigator.clipboard.writeText(body);
        b.textContent = "Copied";
      } catch {
        b.textContent = "Copy blocked";
      }
      setTimeout(() => (b.textContent = "Copy body"), 1400);
    })
  );
}

function slotCard(r, basePath) {
  const q = r.quality;
  const tone = !q ? "" : q.fails ? "critical" : q.warns ? "warning" : "good";
  const day = r.when.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  const links = [];
  if (r.demo) links.push(`<a href="${basePath}/demos/${r.demo.slug}">Open demo</a>`);
  if (r.item && r.item.kind === "article")
    links.push(`<a href="${basePath}/${r.item.section}/${r.item.slug}">Read essay</a>`);
  if (r.linkInComment && !r.demo) links.push(`<a href="${basePath}${r.linkInComment}">Canonical</a>`);

  return `
  <article class="slot${r.atRisk ? " at-risk" : ""}">
    <div class="slot-top">
      <span class="slot-when mono">${esc(day)} · ${esc(r.time)}</span>
      <span class="pill ch-${r.channel}">${esc(schedule.channels[r.channel]?.label || r.channel)}</span>
    </div>
    <h4>${esc(r.title)}</h4>
    ${r.hook ? `<p class="slot-hook">${esc(r.hook)}</p>` : `<p class="slot-hook empty">Hook not written yet.</p>`}
    <div class="slot-tags">
      <span class="tag">${esc(KIND_LABEL[r.kind] || r.kind)}</span>
      <span class="tag">${esc(r.pillar)}</span>
      <span class="tag status tone-${STATUS_TONE[r.status] || ""}">${esc(r.status)}</span>
      ${q ? `<span class="tag score tone-${tone}" title="${esc(q.checks.filter((c) => c.status !== "pass").map((c) => c.label).join(", ") || "all checks pass")}">${q.score}/100</span>` : `<span class="tag score empty">no file</span>`}
    </div>
    ${
      q && q.fails
        ? `<ul class="slot-fails">${q.checks
            .filter((c) => c.status === "fail")
            .map((c) => `<li>${esc(c.label)}: ${esc(c.detail)}</li>`)
            .join("")}</ul>`
        : ""
    }
    ${r.notes ? `<p class="slot-notes">${esc(r.notes)}</p>` : ""}
    <div class="slot-actions">
      ${links.join("")}
      ${r.item ? `<button class="btn-ghost sm" data-copy="${esc(r.id)}">Copy body</button>` : ""}
    </div>
  </article>`;
}
