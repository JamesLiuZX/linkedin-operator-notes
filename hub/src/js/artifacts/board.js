// hub/src/js/artifacts/board.js
//
// Draws a journey teardown as a board from teardown.json (the format is in
// skills/journey-teardown/references/format.md) and makes it pannable,
// zoomable and filterable. The layout mirrors how the board is built on Miro:
// a "Start here" frame with the vocabulary, a scorecard, then one frame per
// stage with its synthesis beside it, and the principles at the bottom.

import { screenSvg } from "./screen.js";

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const LABEL = { good: "Good", friction: "Friction", note: "Note", idea: "Idea" };
const MEANS = {
  good: "Something the screen does well that others should copy.",
  friction: "Confusion, a missing disclosure, an extra step or a dark pattern.",
  note: "A neutral observation worth recording.",
  idea: "A concrete improvement.",
};
const DIMS = [
  { id: "clarity", name: "Clarity", means: "You can tell what to do next without reading twice." },
  { id: "speed", name: "Speed", means: "Few steps and little typing to finish the stage." },
  { id: "transparency", name: "Transparency", means: "Costs, limits and consequences are shown before they bite." },
  { id: "trust", name: "Trust", means: "Nothing surprises the user later." },
  { id: "engagement", name: "Engagement", means: "It gives a reason to come back or go further." },
];

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const tint = (v) => (v == null ? "none" : v >= 4.5 ? "hi" : v >= 3.5 ? "mid" : "low");
const fix1 = (v) => (v == null ? "" : v.toFixed(1));

function laneMean(lane, dims) {
  return mean(dims.map((d) => lane.scores?.[d.id]?.n).filter((n) => typeof n === "number"));
}

export function renderBoard(data) {
  const apps = data.apps || [];
  const appOf = (id) => apps.find((a) => a.id === id) || { id, name: id, accent: "#0b0c0c" };
  const dims = data.dimensions?.length ? data.dimensions : DIMS;
  const stages = data.stages || [];
  const us = data.us;
  const usName = appOf(us).name;
  const maxShots = Math.max(1, ...stages.flatMap((s) => (s.lanes || []).map((l) => (l.screens || []).length)));
  const names = (ids) => (ids || []).map((id) => esc(appOf(id).name)).join(", ");
  let shotN = 0;

  const lane = (st, l) => {
    const app = appOf(l.app);
    const overall = laneMean(l, dims);
    const mine = l.app === us;
    return `
    <div class="lane${mine ? " us" : ""}" data-lane="${esc(st.id)}-${esc(l.app)}" style="--accent:${esc(app.accent || "#0b0c0c")}">
      <div class="lane-meta">
        <div class="lane-app"><i></i>${esc(app.name)}${mine ? '<span class="atag hi">Ours</span>' : ""}</div>
        <div class="lane-flow">${esc(l.flow || "")}</div>
        <div class="lane-src">${esc(l.source || "")}${l.coverage ? `<br><b>Thin coverage:</b> ${esc(l.coverage)}` : ""}</div>
        <div class="lane-overall" data-overall><b>${fix1(overall)}</b><span>out of 5</span></div>
        <div class="lane-bars">
          ${dims
            .map((d) => {
              const s = l.scores?.[d.id];
              return `<div class="bar" data-bar title="${esc(s?.why || "")}"><span>${esc(d.name)}</span><i><em style="--n:${s?.n || 0}"></em></i><b>${s?.n ?? ""}</b></div>`;
            })
            .join("")}
        </div>
      </div>
      <div class="lane-shots">
        ${(l.screens || [])
          .map((sc, i) => {
            const pic = sc.img
              ? `<img src="${esc(sc.img)}" alt="${esc(sc.step || "")}" loading="lazy">`
              : screenSvg({ accent: app.accent, blocks: sc.blocks || [], frame: sc.frame, url: sc.url, nav: sc.nav, bg: sc.bg }, { idPrefix: `b${shotN++}` });
            return `${i ? '<div class="lane-arrow" aria-hidden="true"><svg viewBox="0 0 24 12"><path d="M0 6h21M16 1.500 21 6l-5 4.500" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></div>' : ""}
          <div class="shot${sc.frame === "desktop" ? " desktop" : ""}" data-shot>
            <div class="shot-step"><b>${i + 1}</b>${esc(sc.step || "")}</div>
            <div class="shot-row">
              <div class="shot-pic">${pic}</div>
              <div class="shot-notes">
                ${(sc.notes || []).map((n) => `<div class="bnote ${esc(n.k)}" data-note data-k="${esc(n.k)}"><b>${LABEL[n.k] || esc(n.k)}</b>${esc(n.t)}</div>`).join("")}
              </div>
            </div>
          </div>`;
          })
          .join("")}
      </div>
      <div class="lane-verdict" data-verdict>
        ${l.verdict ? `<div class="vd-line">${esc(l.verdict)}</div>` : ""}
        ${(l.well || []).length ? `<div class="vd good"><b>Does well</b><ul>${l.well.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
        ${(l.wrong || []).length ? `<div class="vd bad"><b>Does wrong</b><ul>${l.wrong.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
        ${(l.steal || []).length ? `<div class="vd idea"><b>Steal for ${esc(usName)}</b><ul>${l.steal.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
      </div>
    </div>`;
  };

  const synthesis = (st, n) => {
    const s = st.synthesis || {};
    const lanes = st.lanes || [];
    return `
    <section class="bf bf-syn" data-frame="${esc(st.id)}-syn">
      <div class="bf-ey">Stage ${n} synthesis</div>
      <h2>${esc(st.name)}</h2>
      ${st.finding ? `<p class="syn-finding" data-syn>${esc(st.finding)}</p>` : ""}
      <div class="syn-block" data-syn>
        <h3>Scores in this stage</h3>
        <table class="syn-scores"><thead><tr><th></th>${dims.map((d) => `<th>${esc(d.name)}</th>`).join("")}<th>Overall</th></tr></thead>
        <tbody>${lanes
          .map((l) => `<tr class="${l.app === us ? "us" : ""}"><td>${esc(appOf(l.app).name)}</td>${dims.map((d) => `<td class="t-${tint(l.scores?.[d.id]?.n)}">${l.scores?.[d.id]?.n ?? ""}</td>`).join("")}<td class="t-${tint(laneMean(l, dims))}"><b>${fix1(laneMean(l, dims))}</b></td></tr>`)
          .join("")}</tbody></table>
      </div>
      ${(s.best || []).length ? `<div class="syn-block" data-syn><h3>Best in class</h3>${s.best.map((b, i) => `<div class="syn-card"><b>${i + 1}. ${esc(appOf(b.app).name)}</b>${esc(b.why)}</div>`).join("")}</div>` : ""}
      ${(s.patterns || []).length ? `<div class="syn-block" data-syn><h3>Patterns to adopt</h3>${s.patterns.map((p) => `<div class="syn-card good"><b>${esc(p.name)}</b>${esc(p.text)}<em>Seen in ${names(p.seen)}</em></div>`).join("")}</div>` : ""}
      ${(s.anti || []).length ? `<div class="syn-block" data-syn><h3>Anti-patterns to avoid</h3>${s.anti.map((p) => `<div class="syn-card bad"><b>${esc(p.name)}</b>${esc(p.text)}<em>Seen in ${names(p.seen)}</em></div>`).join("")}</div>` : ""}
      ${(s.ideal || []).length ? `<div class="syn-block" data-syn><h3>The ideal flow</h3><ol class="syn-ideal">${s.ideal.map((x, i) => `<li><span>${i + 1}</span><div><b>${esc(x.name)}</b>${esc(x.text)}</div></li>`).join("")}</ol></div>` : ""}
      ${(s.gaps || []).length ? `<div class="syn-block" data-syn><h3>${esc(usName)} gaps</h3>${s.gaps.map((g) => `<div class="syn-card gap"><div class="gap-top"><span class="atag ${g.p === "P0" ? "bad" : g.p === "P1" ? "warn" : ""}">${esc(g.p)}</span><b>${esc(g.title)}</b></div><p><i>Today</i> ${esc(g.today)}</p><p><i>Fix</i> ${esc(g.fix)}</p><em>${g.benchmark ? `Benchmark: ${esc(appOf(g.benchmark).name)}` : esc(g.benchmarkNote || "No app on the board does this.")}</em></div>`).join("")}</div>` : ""}
    </section>`;
  };

  const counts = {
    lanes: stages.reduce((n, s) => n + (s.lanes || []).length, 0),
    screens: stages.reduce((n, s) => n + (s.lanes || []).reduce((m, l) => m + (l.screens || []).length, 0), 0),
    notes: stages.reduce((n, s) => n + (s.lanes || []).reduce((m, l) => m + (l.screens || []).reduce((k, sc) => k + (sc.notes || []).length, 0), 0), 0),
  };

  const html = `
  <section class="bf bf-start" data-frame="start">
    <div class="bf-ey">Start here</div>
    <h1>${esc(data.title || "Journey teardown")}</h1>
    <p class="start-q">${esc(data.question || "")}</p>
    <div class="start-grid">
      <div data-start>
        <h3>How to read this board</h3>
        <ol>
          <li>One frame per stage of the journey, top to bottom.</li>
          <li>Inside a stage, one row per app. Read it left to right.</li>
          <li>Up to three notes beside every screen.</li>
          <li>${esc(usName)} is always the last row, under the best examples.</li>
          <li>The synthesis sits to the right of each stage.</li>
        </ol>
      </div>
      <div data-start>
        <h3>The four notes</h3>
        ${Object.keys(LABEL).map((k) => `<div class="bnote ${k}" data-k="${k}"><b>${LABEL[k]}</b>${MEANS[k]}</div>`).join("")}
      </div>
      <div data-start>
        <h3>Scores, 1 to 5</h3>
        <dl class="start-dims">${dims.map((d) => `<div><dt>${esc(d.name)}</dt><dd>${esc(d.means || "")}</dd></div>`).join("")}</dl>
        <p class="start-small">Relative to the best example seen for the stage. One reader scored every lane, so the numbers rank screens. They are not measurements.</p>
      </div>
      <div data-start>
        <h3>Apps compared</h3>
        <ul class="start-apps">${apps.map((a) => `<li style="--accent:${esc(a.accent || "#0b0c0c")}"><i></i><b>${esc(a.name)}</b><span>${esc(a.role || "")}</span></li>`).join("")}</ul>
        <p class="start-small">${counts.lanes} lanes · ${counts.screens} screens · ${counts.notes} notes${data.captured ? ` · captured ${esc(data.captured)}` : ""}</p>
        ${data.note ? `<p class="start-small">${esc(data.note)}</p>` : ""}
      </div>
    </div>
  </section>

  <section class="bf bf-score" data-frame="score">
    <div class="bf-ey">Scorecard</div>
    <h2>Who is strongest where</h2>
    <table class="heat">
      <thead><tr><th></th>${stages.map((s) => `<th>${esc(s.id)}<span>${esc(s.name)}</span></th>`).join("")}</tr></thead>
      <tbody>${apps
        .map(
          (a) => `<tr class="${a.id === us ? "us" : ""}"><td>${esc(a.name)}</td>${stages
            .map((s) => {
              const l = (s.lanes || []).find((x) => x.app === a.id);
              const v = l ? laneMean(l, dims) : null;
              return `<td><span class="cell t-${tint(v)}" data-cell>${fix1(v)}</span></td>`;
            })
            .join("")}</tr>`
        )
        .join("")}</tbody>
    </table>
    <p class="start-small">Each cell is the mean of the five scores for that app's lane. A blank cell means no screens were captured.</p>
  </section>

  ${stages
    .map(
      (st, i) => `
  <section class="bf bf-stage" data-frame="${esc(st.id)}">
    <div class="bf-ey">Stage ${i + 1}</div>
    <h2>${esc(st.name)}</h2>
    ${Object.keys(st.missing || {}).length ? `<p class="start-small">Not covered: ${Object.entries(st.missing).map(([a, why]) => `${esc(appOf(a).name)} (${esc(why)})`).join("; ")}</p>` : ""}
    <div class="lanes">${(st.lanes || []).map((l) => lane(st, l)).join("")}</div>
  </section>
  ${synthesis(st, i + 1)}`
    )
    .join("")}

  ${
    (data.principles || []).length
      ? `<section class="bf bf-ideal" data-frame="ideal">
    <div class="bf-ey">Across every stage</div>
    <h2>What the best versions have in common</h2>
    <div class="ideal-grid">${data.principles.map((p) => `<div class="syn-card" data-principle><b>${esc(p.name)}</b>${esc(p.text)}<em>Evidence: ${(p.evidence || []).map(esc).join(", ")}</em></div>`).join("")}</div>
  </section>`
      : ""
  }`;

  const desktop = stages.some((s) => (s.lanes || []).some((l) => (l.screens || []).some((sc) => sc.frame === "desktop")));
  return { html, maxShots, desktop, stages: stages.map((s) => ({ id: s.id, name: s.name })), counts };
}

/**
 * Mount an interactive board.
 * opts.toolbar: draw the bar of filters and jumps (default true)
 */
export function mountBoard(root, data, opts = {}) {
  const r = renderBoard(data);
  const colA = 300 + r.maxShots * (r.desktop ? 640 : 430) + 380;
  root.classList.add("board");
  root.innerHTML = `
    <div class="board-view" data-view>
      <div class="board-world adoc" data-world style="--col-a:${colA}px">${r.html}</div>
    </div>
    ${
      opts.toolbar === false
        ? ""
        : `<div class="board-bar" data-bar>
      <div class="board-jump">
        <button type="button" data-jump="start">Start</button>
        ${r.stages.map((s) => `<button type="button" data-jump="${esc(s.id)}">${esc(s.id)}</button>`).join("")}
        <button type="button" data-jump="score">Scores</button>
        <button type="button" data-jump="all">All</button>
      </div>
      <div class="board-filter" role="group" aria-label="Show notes">
        ${Object.keys(LABEL).map((k) => `<button type="button" class="on ${k}" data-filter="${k}" aria-pressed="true">${LABEL[k]}</button>`).join("")}
      </div>
      <div class="board-zoom">
        <button type="button" data-zoom="-1" aria-label="Zoom out">−</button>
        <button type="button" data-zoom="1" aria-label="Zoom in">+</button>
      </div>
    </div>`
    }`;

  const view = root.querySelector("[data-view]");
  const world = root.querySelector("[data-world]");
  const cam = { x: 0, y: 0, z: 0.4 };
  let interactive = opts.interactive !== false;
  let anim = 0;

  const apply = () => {
    world.style.transform = `translate3d(${cam.x.toFixed(2)}px,${cam.y.toFixed(2)}px,0) scale(${cam.z.toFixed(5)})`;
  };

  /** An element's box in world coordinates, whatever the current camera. */
  function rectOf(el) {
    let x = 0;
    let y = 0;
    let n = el;
    while (n && n !== world) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }

  const frame = (id) => (id === "all" ? world : world.querySelector(`[data-frame="${CSS.escape(id)}"]`) || world.querySelector(`[data-lane="${CSS.escape(id)}"]`));

  /** The camera that shows a target. mode "fit" shows all of it, "top" fits its width and starts at its top. */
  function cameraFor(target, { mode = "fit", pad = 24, zoom = null } = {}) {
    const el = typeof target === "string" ? frame(target) : target;
    const rect = el === world ? { x: 0, y: 0, w: world.offsetWidth, h: world.offsetHeight } : rectOf(el);
    const vw = view.clientWidth;
    const vh = view.clientHeight;
    const zw = (vw - pad * 2) / rect.w;
    const zh = (vh - pad * 2) / rect.h;
    const z = zoom || (mode === "top" ? zw : Math.min(zw, zh));
    const x = (vw - rect.w * z) / 2 - rect.x * z;
    const y = mode === "top" || rect.h * z > vh - pad * 2 ? pad - rect.y * z : (vh - rect.h * z) / 2 - rect.y * z;
    return { x, y, z };
  }

  function set(c) {
    cam.x = c.x;
    cam.y = c.y;
    cam.z = c.z;
    apply();
  }

  /** Blend two cameras the way a hand does: move the centre in a line, change the zoom by ratio. */
  function mix(a, b, p) {
    const vw = view.clientWidth;
    const vh = view.clientHeight;
    const ca = { cx: (vw / 2 - a.x) / a.z, cy: (vh / 2 - a.y) / a.z };
    const cb = { cx: (vw / 2 - b.x) / b.z, cy: (vh / 2 - b.y) / b.z };
    const z = a.z * Math.pow(b.z / a.z, p);
    const cx = ca.cx + (cb.cx - ca.cx) * p;
    const cy = ca.cy + (cb.cy - ca.cy) * p;
    return { x: vw / 2 - cx * z, y: vh / 2 - cy * z, z };
  }

  function glide(to, ms = 480) {
    cancelAnimationFrame(anim);
    const from = { ...cam };
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      set(mix(from, to, e));
      if (p < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  function zoomAt(factor, px, py) {
    const z = Math.max(0.08, Math.min(2.2, cam.z * factor));
    const wx = (px - cam.x) / cam.z;
    const wy = (py - cam.y) / cam.z;
    set({ x: px - wx * z, y: py - wy * z, z });
  }

  // Dragging pans. Two fingers, or the wheel with Ctrl or Cmd held, zoom.
  const pointers = new Map();
  let pinch = 0;
  view.addEventListener("pointerdown", (ev) => {
    if (!interactive || ev.target.closest("a, button")) return;
    cancelAnimationFrame(anim);
    view.setPointerCapture(ev.pointerId);
    pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    view.classList.add("dragging");
  });
  view.addEventListener("pointermove", (ev) => {
    const p = pointers.get(ev.pointerId);
    if (!p) return;
    if (pointers.size === 1) {
      set({ x: cam.x + ev.clientX - p.x, y: cam.y + ev.clientY - p.y, z: cam.z });
    } else if (pointers.size === 2) {
      const other = [...pointers.entries()].find(([id]) => id !== ev.pointerId)[1];
      const d = Math.hypot(ev.clientX - other.x, ev.clientY - other.y);
      const b = view.getBoundingClientRect();
      if (pinch) zoomAt(d / pinch, (ev.clientX + other.x) / 2 - b.left, (ev.clientY + other.y) / 2 - b.top);
      pinch = d;
    }
    p.x = ev.clientX;
    p.y = ev.clientY;
  });
  const up = (ev) => {
    pointers.delete(ev.pointerId);
    pinch = 0;
    if (!pointers.size) view.classList.remove("dragging");
  };
  view.addEventListener("pointerup", up);
  view.addEventListener("pointercancel", up);
  view.addEventListener(
    "wheel",
    (ev) => {
      if (!interactive || !(ev.ctrlKey || ev.metaKey)) return;
      ev.preventDefault();
      const b = view.getBoundingClientRect();
      zoomAt(Math.exp(-ev.deltaY * 0.0022), ev.clientX - b.left, ev.clientY - b.top);
    },
    { passive: false }
  );
  view.addEventListener("dblclick", (ev) => {
    if (!interactive) return;
    const b = view.getBoundingClientRect();
    const wx = (ev.clientX - b.left - cam.x) / cam.z;
    const wy = (ev.clientY - b.top - cam.y) / cam.z;
    const z = Math.min(1.2, cam.z * 1.9);
    glide({ x: view.clientWidth / 2 - wx * z, y: view.clientHeight / 2 - wy * z, z }, 380);
  });

  root.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-jump],[data-filter],[data-zoom]");
    if (!b) return;
    if (b.dataset.jump) {
      const id = b.dataset.jump;
      glide(cameraFor(id, { mode: id === "all" || id === "start" || id === "score" ? "fit" : "top" }));
    } else if (b.dataset.filter) {
      const on = b.classList.toggle("on");
      b.setAttribute("aria-pressed", String(on));
      world.classList.toggle(`hide-${b.dataset.filter}`, !on);
    } else if (b.dataset.zoom) {
      const z = Math.max(0.08, Math.min(2.2, cam.z * (b.dataset.zoom === "1" ? 1.35 : 1 / 1.35)));
      const vw = view.clientWidth / 2;
      const vh = view.clientHeight / 2;
      glide({ x: vw - ((vw - cam.x) / cam.z) * z, y: vh - ((vh - cam.y) / cam.z) * z, z }, 240);
    }
  });

  set(cameraFor("start"));

  return {
    root,
    view,
    world,
    counts: r.counts,
    rectOf,
    cameraFor,
    set,
    glide,
    frame,
    setInteractive(on) {
      interactive = on;
      root.classList.toggle("is-interactive", on);
    },
    /**
     * Timeline-driven camera. stops: [{ at, dur, to, mode, zoom, pad }], where
     * `to` is a frame or lane id, an element, or a function returning one.
     */
    follow(tl, stops) {
      const list = [...stops].sort((a, b) => a.at - b.at);
      const target = (s) => cameraFor(typeof s.to === "function" ? s.to() : s.to, s);
      tl.each((t) => {
        if (interactive) return;
        let i = 0;
        while (i + 1 < list.length && t >= list[i + 1].at) i++;
        const s = list[i];
        if (i === 0) return set(target(s));
        const raw = Math.max(0, Math.min(1, (t - s.at) / (s.dur ?? 1)));
        const p = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
        set(mix(target(list[i - 1]), target(s), p));
      });
      for (const s of list) tl.end(s.at + (s.dur ?? 1));
    },
  };
}
