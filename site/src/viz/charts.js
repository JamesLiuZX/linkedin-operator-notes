// site/src/viz/charts.js
//
// Small SVG chart kit for the demos. No dependencies, no canvas, no d3.
// Every chart here ships with: a legend when there are 2+ series, a hover
// layer, tabular figures on anything that lines up in a column, and a table
// view so identity never rests on colour alone.
//
// Deliberate constraints, because they are the ones that go wrong:
//   - one y axis, always. Two measures means two charts.
//   - categorical colour follows the entity, never its rank, so filtering a
//     series out does not repaint the survivors.
//   - dot and scatter forms use SCATTER_SERIES (3 slots), not SERIES (5).

export const SERIES = ["var(--cat-1)", "var(--cat-2)", "var(--cat-3)", "var(--cat-4)", "var(--cat-5)"];
export const SCATTER_SERIES = [
  "var(--cat-scatter-1)",
  "var(--cat-scatter-2)",
  "var(--cat-scatter-3)",
];
export const SEQ = [
  "var(--seq-1)", "var(--seq-2)", "var(--seq-3)", "var(--seq-4)",
  "var(--seq-5)", "var(--seq-6)", "var(--seq-7)",
];

export const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const fmt = {
  int: (n) => Math.round(n).toLocaleString("en-US"),
  usd: (n) =>
    n >= 1000
      ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
      : `$${n.toFixed(n < 10 ? 2 : 0)}`,
  pct: (n, d = 0) => `${(n * 100).toFixed(d)}%`,
  cents: (n) => `${(n * 100).toFixed(1)}c`,
  num: (n, d = 3) => n.toFixed(d),
};

let uid = 0;
const nextId = () => `viz${++uid}`;

/* ------------------------------------------------------------------ legend */

export function legend(items, { scatter = false } = {}) {
  if (items.length < 2) return ""; // one series: the title names it
  const pal = scatter ? SCATTER_SERIES : SERIES;
  return `<ul class="viz-legend">${items
    .map(
      (it, i) =>
        `<li><span class="swatch" style="background:${it.color || pal[i % pal.length]}"></span>${esc(
          it.label
        )}</li>`
    )
    .join("")}</ul>`;
}

/* ------------------------------------------------------- table view (a11y) */

export function tableView(headers, rows, { caption = "" } = {}) {
  const id = nextId();
  return `
    <details class="viz-table" id="${id}">
      <summary>Table view</summary>
      <div class="scroll-x">
        <table>
          ${caption ? `<caption>${esc(caption)}</caption>` : ""}
          <thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
          <tbody>${rows
            .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
            .join("")}</tbody>
        </table>
      </div>
    </details>`;
}

/* ---------------------------------------------------------------- stat tile */

/**
 * A number that does not need a plot. Use this instead of a one-bar chart.
 * `tone` is a status role, so it always ships with the label beside it.
 */
export function stat({ label, value, sub = "", tone = "" }) {
  return `
    <div class="viz-stat${tone ? ` tone-${tone}` : ""}">
      <div class="stat-label">${esc(label)}</div>
      <div class="stat-value">${esc(value)}</div>
      ${sub ? `<div class="stat-sub">${esc(sub)}</div>` : ""}
    </div>`;
}

export function statRow(stats) {
  return `<div class="viz-stat-row">${stats.map(stat).join("")}</div>`;
}

/* --------------------------------------------------------------- meter bar */

/** Single proportion. Reads as a filled track, not a chart. */
export function meter({ label, value, max = 1, display, tone = "" }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return `
    <div class="viz-meter${tone ? ` tone-${tone}` : ""}">
      <div class="meter-head"><span>${esc(label)}</span><span class="mono">${esc(
        display ?? fmt.pct(pct)
      )}</span></div>
      <div class="meter-track"><div class="meter-fill" style="width:${(pct * 100).toFixed(2)}%"></div></div>
    </div>`;
}

/* ------------------------------------------------------------- bar (h) --- */

/**
 * Horizontal bars. Best default for ranked magnitude with readable labels.
 * Data-end is rounded 4px, anchored flat to the baseline.
 */
export function barsH(data, { width = 560, rowH = 34, format = fmt.int, colorBy, labelW = 160 } = {}) {
  const max = Math.max(...data.map((d) => d.value), 1e-9);
  const h = data.length * rowH + 8;
  const trackW = width - labelW - 60;

  const rows = data
    .map((d, i) => {
      const y = i * rowH + 6;
      const w = Math.max(2, (d.value / max) * trackW);
      const color = d.color || (colorBy ? colorBy(d, i) : SERIES[i % SERIES.length]);
      return `
        <g class="bar-row" tabindex="0" role="listitem"
           aria-label="${esc(d.label)}: ${esc(format(d.value))}">
          <text x="0" y="${y + 14}" class="bar-label">${esc(d.label)}</text>
          <rect x="${labelW}" y="${y}" width="${trackW}" height="20" class="bar-track" />
          <rect x="${labelW}" y="${y}" width="${w}" height="20" rx="4" fill="${color}" class="bar-fill" />
          <text x="${labelW + w + 8}" y="${y + 14}" class="bar-value mono">${esc(format(d.value))}</text>
          <title>${esc(d.label)}: ${esc(format(d.value))}${d.note ? ` — ${esc(d.note)}` : ""}</title>
        </g>`;
    })
    .join("");

  return `<svg class="viz-svg" viewBox="0 0 ${width} ${h}" role="list" aria-label="bar chart">${rows}</svg>`;
}

/* ------------------------------------------------------- stacked bar (h) - */

/** One track split into shares. 2px surface gap between segments. */
export function stackedBar(segments, { width = 560, height = 28, format = fmt.pct } = {}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let x = 0;
  const gap = 2;
  const parts = segments
    .map((s, i) => {
      const w = Math.max(0, (s.value / total) * width - gap);
      const rect = `
        <g tabindex="0" role="listitem" aria-label="${esc(s.label)}: ${esc(format(s.value / total))}">
          <rect x="${x}" y="0" width="${w}" height="${height}" rx="4"
                fill="${s.color || SERIES[i % SERIES.length]}" />
          <title>${esc(s.label)}: ${esc(format(s.value / total))}</title>
        </g>`;
      x += w + gap;
      return rect;
    })
    .join("");
  return `<svg class="viz-svg" viewBox="0 0 ${width} ${height}" role="list">${parts}</svg>`;
}

/* ----------------------------------------------------------------- lines - */

/**
 * Multi-series line chart with a crosshair + tooltip.
 * series: [{ label, points: [[x,y],...], color? }]
 */
export function lineChart(series, opts = {}) {
  const {
    width = 620,
    height = 260,
    xLabel = "",
    yLabel = "",
    xFormat = fmt.num,
    yFormat = fmt.num,
    xDomain,
    yDomain,
    yTicks = 4,
    xTicks = 5,
    directLabel = true,
    guide = null, // { y, label } reference line
  } = opts;

  const m = { t: 14, r: 84, b: 34, l: 52 };
  const iw = width - m.l - m.r;
  const ih = height - m.t - m.b;

  const xs = series.flatMap((s) => s.points.map((p) => p[0]));
  const ys = series.flatMap((s) => s.points.map((p) => p[1]));
  const [x0, x1] = xDomain || [Math.min(...xs), Math.max(...xs)];
  const [y0, y1] = yDomain || [Math.min(...ys, 0), Math.max(...ys)];

  const sx = (v) => m.l + ((v - x0) / (x1 - x0 || 1)) * iw;
  const sy = (v) => m.t + ih - ((v - y0) / (y1 - y0 || 1)) * ih;

  const grid = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = y0 + ((y1 - y0) * i) / yTicks;
    return `<line x1="${m.l}" x2="${m.l + iw}" y1="${sy(v)}" y2="${sy(v)}" class="grid" />
            <text x="${m.l - 8}" y="${sy(v) + 4}" class="tick mono" text-anchor="end">${esc(yFormat(v))}</text>`;
  }).join("");

  const xAxis = Array.from({ length: xTicks + 1 }, (_, i) => {
    const v = x0 + ((x1 - x0) * i) / xTicks;
    return `<text x="${sx(v)}" y="${m.t + ih + 20}" class="tick mono" text-anchor="middle">${esc(xFormat(v))}</text>`;
  }).join("");

  // A guide outside the y domain would render outside the plot box and collide
  // with whatever is next in the document. Drop it rather than draw it wrong;
  // callers that need it visible should widen yDomain to include it.
  const guideInRange = guide && guide.y >= Math.min(y0, y1) && guide.y <= Math.max(y0, y1);
  const guideEl = guideInRange
    ? `<line x1="${m.l}" x2="${m.l + iw}" y1="${sy(guide.y)}" y2="${sy(guide.y)}" class="guide" />
       <text x="${m.l + iw - 4}" y="${sy(guide.y) - 6}" class="guide-label" text-anchor="end">${esc(guide.label)}</text>`
    : "";

  const paths = series
    .map((s, i) => {
      const color = s.color || SERIES[i % SERIES.length];
      const d = s.points.map((p, j) => `${j ? "L" : "M"}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(" ");
      const last = s.points[s.points.length - 1];
      // A single series is already named by the chart title, so labelling the
      // line as well just collides with the guide label at the right edge.
      const label =
        directLabel && series.length > 1 && series.length <= 4
          ? `<text x="${sx(last[0]) + 8}" y="${sy(last[1]) + 4}" class="series-label" fill="${color}">${esc(s.label)}</text>`
          : "";
      return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2"
                    stroke-linejoin="round" stroke-linecap="round" />${label}`;
    })
    .join("");

  const id = nextId();
  const payload = esc(
    JSON.stringify({
      m, iw, ih, x0, x1, y0, y1,
      series: series.map((s, i) => ({
        label: s.label,
        color: s.color || SERIES[i % SERIES.length],
        points: s.points,
      })),
    })
  );

  return `
    <div class="viz-plot" id="${id}" data-line="${payload}">
      <svg class="viz-svg" viewBox="0 0 ${width} ${height}" role="img"
           aria-label="${esc(yLabel)} against ${esc(xLabel)}">
        ${grid}${guideEl}
        <line x1="${m.l}" x2="${m.l + iw}" y1="${m.t + ih}" y2="${m.t + ih}" class="axis" />
        ${xAxis}${paths}
        <g class="crosshair" hidden><line class="cross-line" y1="${m.t}" y2="${m.t + ih}" /></g>
        <rect x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent" class="hit" />
      </svg>
      ${xLabel ? `<div class="axis-title">${esc(xLabel)}</div>` : ""}
      <div class="viz-tip" hidden></div>
    </div>`;
}

/**
 * Wire hover on every lineChart inside `root`. Idempotent per element.
 * Call after innerHTML assignment.
 */
export function hydrateCharts(root) {
  root.querySelectorAll("[data-line]").forEach((el) => {
    if (el.dataset.wired) return;
    el.dataset.wired = "1";
    const cfg = JSON.parse(el.dataset.line);
    const svg = el.querySelector("svg");
    const hit = el.querySelector(".hit");
    const cross = el.querySelector(".crosshair");
    const line = el.querySelector(".cross-line");
    const tip = el.querySelector(".viz-tip");
    const { m, iw, x0, x1 } = cfg;

    const move = (evt) => {
      const box = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      const px = ((evt.clientX - box.left) / box.width) * vb.width;
      const t = Math.max(0, Math.min(1, (px - m.l) / iw));
      const xv = x0 + t * (x1 - x0);

      cross.hidden = false;
      line.setAttribute("x1", m.l + t * iw);
      line.setAttribute("x2", m.l + t * iw);

      const rows = cfg.series.map((s) => {
        let best = s.points[0];
        for (const p of s.points) if (Math.abs(p[0] - xv) < Math.abs(best[0] - xv)) best = p;
        return `<div class="tip-row"><span class="swatch" style="background:${s.color}"></span>${esc(
          s.label
        )}<b class="mono">${best[1].toFixed(3)}</b></div>`;
      });
      tip.innerHTML = `<div class="tip-head mono">${xv.toFixed(3)}</div>${rows.join("")}`;
      tip.hidden = false;
      const localX = ((evt.clientX - box.left) / box.width) * 100;
      tip.style.left = `${Math.min(72, Math.max(4, localX))}%`;
    };

    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerleave", () => {
      cross.hidden = true;
      tip.hidden = true;
    });
  });
}

/* ----------------------------------------------------- reliability diagram */

/**
 * Calibration plot. Dots, so it uses the all-pairs-safe 3-slot subset and
 * caps series at 3. Diagonal is the perfect-calibration reference.
 */
export function reliabilityPlot(series, { width = 420, height = 420 } = {}) {
  if (series.length > 3) throw new Error("reliabilityPlot: max 3 series (all-pairs colour cap)");
  const m = { t: 16, r: 16, b: 42, l: 46 };
  const iw = width - m.l - m.r;
  const ih = height - m.t - m.b;
  const sx = (v) => m.l + v * iw;
  const sy = (v) => m.t + ih - v * ih;

  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map(
      (v) => `
      <line x1="${m.l}" x2="${m.l + iw}" y1="${sy(v)}" y2="${sy(v)}" class="grid" />
      <line y1="${m.t}" y2="${m.t + ih}" x1="${sx(v)}" x2="${sx(v)}" class="grid" />
      <text x="${m.l - 8}" y="${sy(v) + 4}" class="tick mono" text-anchor="end">${v.toFixed(2)}</text>
      <text x="${sx(v)}" y="${m.t + ih + 20}" class="tick mono" text-anchor="middle">${v.toFixed(2)}</text>`
    )
    .join("");

  const diag = `<line x1="${sx(0)}" y1="${sy(0)}" x2="${sx(1)}" y2="${sy(1)}" class="guide" />
                <text x="${sx(0.78)}" y="${sy(0.84)}" class="guide-label">perfect</text>`;

  const marks = series
    .map((s, i) => {
      const color = s.color || SCATTER_SERIES[i % SCATTER_SERIES.length];
      const path = s.points
        .map((p, j) => `${j ? "L" : "M"}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`)
        .join(" ");
      const dots = s.points
        .map(
          (p) => `
          <g tabindex="0" role="listitem"
             aria-label="${esc(s.label)} predicted ${p[0].toFixed(2)}, observed ${p[1].toFixed(2)}">
            <circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="5.5" fill="${color}"
                    stroke="var(--viz-surface)" stroke-width="2" />
            <title>${esc(s.label)} — said ${(p[0] * 100).toFixed(0)}%, happened ${(p[1] * 100).toFixed(0)}%</title>
          </g>`
        )
        .join("");
      return `<path d="${path}" fill="none" stroke="${color}" stroke-width="2" opacity="0.55" />${dots}`;
    })
    .join("");

  return `
    <svg class="viz-svg" viewBox="0 0 ${width} ${height}" role="list"
         aria-label="reliability diagram, forecast probability against observed frequency">
      ${grid}${diag}
      <line x1="${m.l}" x2="${m.l + iw}" y1="${m.t + ih}" y2="${m.t + ih}" class="axis" />
      <line x1="${m.l}" x2="${m.l}" y1="${m.t}" y2="${m.t + ih}" class="axis" />
      ${marks}
      <text x="${m.l + iw / 2}" y="${height - 6}" class="axis-label" text-anchor="middle">forecast probability</text>
    </svg>`;
}

/* ------------------------------------------------------------- order book */

/** Depth ladder. Sequential ramp by size, one hue. Not a categorical chart. */
export function depthLadder(levels, { width = 520, rowH = 20, maxSize } = {}) {
  const max = maxSize || Math.max(...levels.map((l) => l.size), 1e-9);
  const mid = width / 2;
  const h = levels.length * rowH + 4;
  const rows = levels
    .map((l, i) => {
      const y = i * rowH + 2;
      const w = Math.max(1, (l.size / max) * (mid - 60));
      const isBid = l.side === "bid";
      const x = isBid ? mid - 46 - w : mid + 46;
      const color = isBid ? "var(--cat-1)" : "var(--cat-2)";
      return `
        <g tabindex="0" role="listitem" aria-label="${l.side} ${fmt.cents(l.price)} size ${fmt.int(l.size)}">
          <rect x="${x}" y="${y}" width="${w}" height="${rowH - 4}" rx="3" fill="${color}" opacity="${l.rewarded ? 1 : 0.42}" />
          <text x="${mid}" y="${y + rowH - 8}" class="tick mono" text-anchor="middle">${esc(fmt.cents(l.price))}</text>
          <title>${l.side} ${fmt.cents(l.price)} · size ${fmt.int(l.size)} · ${l.rewarded ? "inside max spread (earns)" : "outside max spread (earns nothing)"}</title>
        </g>`;
    })
    .join("");
  return `<svg class="viz-svg" viewBox="0 0 ${width} ${h}" role="list" aria-label="order book depth">${rows}</svg>`;
}
