// site/src/demos/kit.js
//
// The demo kit. Every demo page is built from these pieces so the eight demos
// read as one product: a question, scenario pills, one answer, one chart, the
// assumptions beside it, and the detail a click away. Styles live in kit.css,
// imported once by main.js. The page header and "How this works" come from the
// template in main.js, driven by the demo's `meta`.
//
// A calculator demo is one call (workflow-roi-lab.js is the full example):
//
//   import { calculator, chartCard, hl } from "./kit.js";
//
//   export function mount(root) {
//     calculator(root, {
//       defaults: DEFAULTS,                       // every scenario starts from these
//       scenarios: [                              // first one is selected on load
//         { id: "base", label: "Base case", note: (v) => `A $${v.order} order.` },
//         { id: "dead", label: "A dead market", values: { b: 400, order: 2000 } },
//       ],
//       controls: [                               // the 2 or 3 that move the answer
//         { key: "b", label: "Market depth", hint: "LMSR b", help: "One plain line.",
//           min: 200, max: 40000, step: 200, format: (v) => fmt.int(v) },
//       ],
//       more: [ { heading: "Order book" }, ... ], // the rest, under "More assumptions"
//       view(p) {                                 // runs on every change
//         const r = compute(p);
//         return {
//           hero: { label: "Monthly savings", value: r.monthly, format: usd,
//                   tone: "good", status: "Pays for itself",
//                   verdict: `Saves ${hl(usd(r.monthly))} a month.`,
//                   stats: [{ label: "Cost by hand", value: "$9.00", sub: "per task" }] },
//           chart: { title: "The takeaway, as a sentence.", body: barsH(...) },
//           breakdown: chartCard({ title: "...", body: lineChart(...) }),
//         };
//       },
//     });
//   }
//
// Text tools (linter, slop gate, restyle) skip calculator() and compose the
// same parts by hand: scenarioBar() for sample pills, answerCard() for the
// verdict, card() for findings, disclosure() for rule IDs and detail.

import { esc } from "../viz/charts.js";

let uid = 0;
const nextId = (prefix) => `${prefix}-${++uid}`;

const reducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Emphasise a computed value inside a verdict or note. Escapes its input. */
export const hl = (text) => `<b class="kit-hl">${esc(text)}</b>`;

/* ------------------------------------------------------------ status ---- */

const TONES = new Set(["good", "warn", "bad", "neutral"]);
const GLYPH = {
  good: '<path d="M6.2 10.4l2.6 2.6 5-5.4"/>',
  warn: '<path d="M10 5.8v5"/><path d="M10 14.1v.1"/>',
  bad: '<path d="M7.2 7.2l5.6 5.6M12.8 7.2l-5.6 5.6"/>',
  neutral: '<path d="M10 9v5"/><path d="M10 5.9v.1"/>',
};

const icon = (tone) =>
  `<svg class="kit-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="8.2"/>${GLYPH[tone]}</svg>`;

/**
 * A status word with its icon. Status is never colour alone: the tone sets the
 * colour, the icon and the word carry the meaning. tone: good | warn | bad | neutral.
 */
export function status(tone, text) {
  const t = TONES.has(tone) ? tone : "neutral";
  return `<span class="kit-status tone-${t}">${icon(t)}<span>${esc(text)}</span></span>`;
}

/* ------------------------------------------------------------- motion --- */

const tweens = new WeakMap();

/**
 * Count an element's text from one number to another. Any call cancels the
 * tween already running on that element, and reduced motion (or ms <= 0)
 * sets the final value at once.
 */
export function tweenNumber(el, from, to, format = String, ms = 300) {
  cancelAnimationFrame(tweens.get(el));
  if (ms <= 0 || reducedMotion() || from === to || !Number.isFinite(from) || !Number.isFinite(to)) {
    el.textContent = format(to);
    return;
  }
  const t0 = performance.now();
  const frame = (now) => {
    const t = Math.min(1, (now - t0) / ms);
    el.textContent = format(from + (to - from) * (1 - (1 - t) ** 3));
    if (t < 1) tweens.set(el, requestAnimationFrame(frame));
  };
  tweens.set(el, requestAnimationFrame(frame));
}

/** Replay the fade-in on an element (a no-op under reduced motion, via CSS). */
function fade(el) {
  el.classList.remove("kit-fade");
  void el.offsetWidth; // restart the animation
  el.classList.add("kit-fade");
}

/* ------------------------------------------------------ scenario bar --- */

/**
 * Named presets as a segmented pill control.
 * items: [{ id, label, note? }]. Returns { el, select(id), edited() }.
 * edited() clears the selection and says the numbers are now the reader's own.
 */
export function scenarioBar({ items, selected = items[0]?.id, onSelect, label = "Scenario" }) {
  const el = document.createElement("div");
  el.className = "kit-scenarios";
  const labelId = nextId("kit-scenarios");
  el.innerHTML = `
    <span class="kit-scenarios-label" id="${labelId}">${esc(label)}</span>
    <div class="kit-pills" role="group" aria-labelledby="${labelId}">${items
      .map(
        (s) =>
          `<button type="button" class="kit-pill" data-id="${esc(s.id)}" aria-pressed="false">${esc(s.label)}</button>`
      )
      .join("")}</div>
    <p class="kit-scenarios-note"></p>`;

  const pills = [...el.querySelectorAll(".kit-pill")];
  const note = el.querySelector(".kit-scenarios-note");
  let current = null;

  const select = (id) => {
    current = items.find((s) => s.id === id) || null;
    for (const b of pills) b.setAttribute("aria-pressed", String(b.dataset.id === id));
    note.textContent = current?.note || "";
  };
  const edited = () => {
    for (const b of pills) b.setAttribute("aria-pressed", "false");
    note.textContent = current ? `Your own numbers, starting from ${current.label}.` : "Your own numbers.";
  };

  el.querySelector(".kit-pills").addEventListener("click", (e) => {
    const b = e.target.closest(".kit-pill");
    if (b) onSelect?.(b.dataset.id);
  });
  if (selected != null) select(selected);
  return { el, select, edited };
}

/* -------------------------------------------------------- answer card --- */

/**
 * The hero: one number, a status word, and a live one-sentence verdict.
 * Returns { el, update(hero, { animate }) } where hero is
 *   { label, value, format?, unit?, tone, status, verdict, stats? }
 * value: a number (tweened when animate is true) or a ready string.
 * verdict: HTML, built from computed values; wrap numbers in hl().
 * stats: up to 3 quieter numbers, shown along the card's foot.
 */
export function answerCard() {
  const el = document.createElement("section");
  el.className = "kit-card kit-answer";
  const headId = nextId("kit-answer");
  el.setAttribute("aria-labelledby", headId);
  el.innerHTML = `
    <div class="kit-answer-top">
      <h2 class="kit-answer-label" id="${headId}"></h2>
      <span class="kit-answer-status"></span>
    </div>
    <p class="kit-answer-value"><span class="kit-answer-num"></span><span class="kit-answer-unit"></span></p>
    <p class="kit-verdict" aria-live="polite" aria-atomic="true"></p>
    <div class="kit-answer-stats"></div>`;

  const $ = (s) => el.querySelector(s);
  const num = $(".kit-answer-num");
  const verdictEl = $(".kit-verdict");
  let shown = null; // the number currently on screen, for the tween
  let lastVerdict = null;

  const update = (hero, { animate = false } = {}) => {
    const { label = "Result", value, format = String, unit = "", tone = "neutral", verdict = "", stats: items = [] } = hero;
    el.dataset.tone = TONES.has(tone) ? tone : "neutral";
    $(".kit-answer-label").textContent = label;
    $(".kit-answer-status").innerHTML = hero.status ? status(tone, hero.status) : "";
    $(".kit-answer-unit").textContent = unit ? ` ${unit}` : "";

    if (typeof value === "number") {
      tweenNumber(num, shown ?? value, value, format, animate ? 300 : 0);
      shown = value;
    } else {
      cancelAnimationFrame(tweens.get(num));
      num.textContent = String(value ?? "");
      shown = null;
    }

    if (verdict !== lastVerdict) {
      verdictEl.innerHTML = verdict;
      lastVerdict = verdict;
    }
    if (animate) fade(verdictEl);
    $(".kit-answer-stats").innerHTML = items.length ? stats(items) : "";
  };

  return { el, update };
}

/* -------------------------------------------------------------- stats --- */

/** Up to three supporting numbers: [{ label, value, sub? }]. Returns HTML. */
export function stats(items) {
  return `<dl class="kit-stats">${items
    .slice(0, 3)
    .map(
      (s) => `
      <div class="kit-stat">
        <dt>${esc(s.label)}</dt>
        <dd class="kit-stat-value">${esc(s.value)}</dd>
        ${s.sub ? `<dd class="kit-stat-sub">${esc(s.sub)}</dd>` : ""}
      </div>`
    )
    .join("")}</dl>`;
}

/* -------------------------------------------------- cards and tables --- */

/** A chart whose title states the takeaway. body is chart HTML; note is HTML. */
export function chartCard({ title, body = "", note = "", level = 3 }) {
  return `
    <section class="kit-card kit-chart">
      <h${level} class="kit-chart-title">${esc(title)}</h${level}>
      <div class="kit-chart-body">${body}</div>
      ${note ? `<p class="kit-chart-note">${note}</p>` : ""}
    </section>`;
}

/** A plain card for a block of text, a stats row or a finding. body is HTML. */
export function card({ title = "", body = "", level = 3, className = "" }) {
  return `
    <section class="kit-card kit-block${className ? ` ${className}` : ""}">
      ${title ? `<h${level} class="kit-block-title">${esc(title)}</h${level}>` : ""}
      ${body}
    </section>`;
}

/**
 * A visible table. The first cell of each row is its header. numeric lists the
 * column indexes to right-align. Returns HTML.
 */
export function table(headers, rows, { caption = "", numeric = [] } = {}) {
  const num = new Set(numeric);
  const cls = (i) => (num.has(i) ? ' class="num"' : "");
  return `
    <div class="kit-table-wrap">
      <table class="kit-table">
        ${caption ? `<caption>${esc(caption)}</caption>` : ""}
        <thead><tr>${headers.map((h, i) => `<th scope="col"${cls(i)}>${esc(h)}</th>`).join("")}</tr></thead>
        <tbody>${rows
          .map(
            (r) =>
              `<tr>${r
                .map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td${cls(i)}>${esc(c)}</td>`))
                .join("")}</tr>`
          )
          .join("")}</tbody>
      </table>
    </div>`;
}

/** A native <details> disclosure. body is HTML. Returns HTML. */
export function disclosure({ summary, body = "", open = false, className = "" }) {
  return `
    <details class="kit-disclosure${className ? ` ${className}` : ""}"${open ? " open" : ""}>
      <summary>${esc(summary)}</summary>
      <div class="kit-disclosure-body">${body}</div>
    </details>`;
}

/* ----------------------------------------------------------- controls --- */

// One control descriptor, three shapes:
//   range:  { key, label, hint?, help?, min, max, step, format }
//   select: { key, type: "select", label, hint?, help?, options: [{ value, label }] }
//   toggle: { key, type: "toggle", label, hint?, help? }
//   group heading inside a list: { heading: "Order book" }
// help may be a function of the current state, re-read on every change.

const chevron =
  '<svg class="kit-chevron" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5.5 7.75l4.5 4.5 4.5-4.5"/></svg>';

function controlHtml(c, id) {
  if (c.heading) return `<p class="kit-controls-heading">${esc(c.heading)}</p>`;
  const helpId = `${id}-help`;
  const hint = c.hint ? ` <span class="kit-hint">${esc(c.hint)}</span>` : "";
  const help = c.help ? `<p class="kit-help" id="${helpId}"></p>` : "";
  const described = c.help ? ` aria-describedby="${helpId}"` : "";

  if (c.type === "select") {
    return `
      <div class="kit-field">
        <label class="kit-label" for="${id}">${esc(c.label)}${hint}</label>
        <div class="kit-select">
          <select id="${id}"${described}>${c.options
            .map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`)
            .join("")}</select>${chevron}
        </div>
        ${help}
      </div>`;
  }
  if (c.type === "toggle") {
    return `
      <div class="kit-field">
        <label class="kit-toggle" for="${id}">
          <input type="checkbox" role="switch" id="${id}"${described} />
          <span class="kit-toggle-track" aria-hidden="true"></span>
          <span class="kit-label">${esc(c.label)}${hint}</span>
        </label>
        ${help}
      </div>`;
  }
  return `
    <div class="kit-field">
      <div class="kit-field-head">
        <label class="kit-label" for="${id}">${esc(c.label)}${hint}</label>
        <span class="kit-value" id="${id}-v" aria-hidden="true"></span>
      </div>
      <input class="kit-range" type="range" id="${id}" min="${c.min}" max="${c.max}" step="${c.step}"${described} />
      ${help}
    </div>`;
}

function setFill(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const pct = max > min ? ((Number(input.value) - min) / (max - min)) * 100 : 0;
  input.style.setProperty("--fill", `${Math.max(0, Math.min(100, pct))}%`);
}

/**
 * The assumptions panel: the decisive controls, the rest under "More
 * assumptions", a quiet Reset, and optional quiet actions. Below 640px it
 * folds into an "Adjust assumptions" disclosure that starts closed.
 * Returns { el, sync(state) }. onChange(key, value) fires on every edit.
 */
export function assumptions({
  controls = [],
  more = [],
  state,
  onChange,
  onReset,
  actions = [],
  title = "Assumptions",
  moreLabel = "More assumptions",
}) {
  const el = document.createElement("aside");
  el.className = "kit-panel";
  el.setAttribute("aria-label", title);
  const bodyId = nextId("kit-panel");
  const all = [...controls, ...more].filter((c) => !c.heading);
  const ids = new Map(all.map((c) => [c.key, nextId(`kit-${c.key}`)]));
  const list = (cs) => cs.map((c) => controlHtml(c, ids.get(c.key))).join("");

  el.innerHTML = `
    <button type="button" class="kit-panel-toggle" aria-expanded="false" aria-controls="${bodyId}">
      <span>Adjust assumptions</span>${chevron}
    </button>
    <div class="kit-panel-body" id="${bodyId}">
      <div class="kit-panel-head">
        <h2>${esc(title)}</h2>
        ${onReset ? '<button type="button" class="kit-text-btn" data-kit-reset>Reset</button>' : ""}
      </div>
      <div class="kit-controls">${list(controls)}</div>
      ${
        actions.length
          ? `<div class="kit-actions">${actions
              .map((a, i) => `<button type="button" class="kit-text-btn" data-kit-action="${i}">${esc(a.label)}</button>`)
              .join("")}</div>`
          : ""
      }
      ${
        more.length
          ? `<details class="kit-more"><summary>${esc(moreLabel)}</summary><div class="kit-controls">${list(more)}</div></details>`
          : ""
      }
    </div>`;

  const input = (c) => el.querySelector(`#${ids.get(c.key)}`);
  const keyOf = new Map(all.map((c) => [ids.get(c.key), c]));

  const read = (c, target) => {
    if (c.type === "toggle") return target.checked;
    if (c.type === "select") {
      const numeric = typeof c.options[0]?.value === "number";
      return numeric ? Number(target.value) : target.value;
    }
    return Number(target.value);
  };

  const handle = (e) => {
    const c = keyOf.get(e.target.id);
    if (!c) return;
    // Ranges report while dragging ("input"); selects and switches on "change".
    const isRange = c.type !== "select" && c.type !== "toggle";
    if (e.type !== (isRange ? "input" : "change")) return;
    onChange?.(c.key, read(c, e.target));
  };
  el.addEventListener("input", handle);
  el.addEventListener("change", handle);

  el.querySelector("[data-kit-reset]")?.addEventListener("click", () => onReset?.());
  el.querySelectorAll("[data-kit-action]").forEach((b) =>
    b.addEventListener("click", () => actions[Number(b.dataset.kitAction)].run())
  );

  const toggle = el.querySelector(".kit-panel-toggle");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    el.classList.toggle("is-open", open);
  });

  const sync = (s) => {
    for (const c of all) {
      const node = input(c);
      const v = s[c.key];
      if (c.type === "toggle") node.checked = Boolean(v);
      else if (c.type === "select") node.value = String(v);
      else {
        node.value = v;
        setFill(node);
        const text = c.format ? c.format(v) : String(v);
        el.querySelector(`#${ids.get(c.key)}-v`).textContent = text;
        node.setAttribute("aria-valuetext", text);
      }
      if (c.help) {
        el.querySelector(`#${ids.get(c.key)}-help`).textContent =
          typeof c.help === "function" ? c.help(s) : c.help;
      }
    }
  };
  if (state) sync(state);
  return { el, sync };
}

/* --------------------------------------------------------- calculator --- */

/**
 * The whole calculator page body: scenario bar, then the answer card and main
 * chart beside a sticky assumptions panel, then "See the full breakdown".
 *
 * spec: { defaults, scenarios, controls, more?, actions?, view, breakdownLabel? }
 *   scenarios: [{ id, label, values?, note? }]; values merge over defaults,
 *     note is a string or a function of the merged values.
 *   actions: [{ label, run(state) }]; run may edit state, the page re-renders.
 *   view(state) returns { hero, chart?, breakdown? } (see answerCard and
 *     chartCard for their shapes; breakdown is HTML).
 * Returns { state, render, apply(id) } for anything a demo adds on top.
 */
export function calculator(root, spec) {
  const { defaults, scenarios = [], controls = [], more = [], actions = [], view } = spec;
  const state = { ...defaults, ...(scenarios[0]?.values || {}) };
  let active = scenarios[0] || null;

  root.innerHTML = `
    <div class="kit-calc">
      <div data-kit-slot="scenarios"></div>
      <div class="kit-grid">
        <div class="kit-stage">
          <div data-kit-slot="answer"></div>
          <div class="kit-main-chart" data-kit-slot="chart"></div>
        </div>
        <div data-kit-slot="panel"></div>
      </div>
      ${disclosure({ summary: spec.breakdownLabel || "See the full breakdown", className: "kit-breakdown" })}
    </div>`;

  const slot = (name) => root.querySelector(`[data-kit-slot="${name}"]`);
  const chartSlot = slot("chart");
  const breakdown = root.querySelector(".kit-breakdown");
  const breakdownBody = breakdown.querySelector(".kit-disclosure-body");

  const answer = answerCard();
  slot("answer").replaceWith(answer.el);

  let bar = null;
  let panel = null;

  const render = ({ animate = false } = {}) => {
    const v = view(state);
    answer.update(v.hero, { animate });
    chartSlot.innerHTML = v.chart ? chartCard(v.chart) : "";
    breakdownBody.innerHTML = v.breakdown || "";
    breakdown.hidden = !v.breakdown;
    panel?.sync(state);
  };

  const apply = (id, { animate = true } = {}) => {
    active = scenarios.find((s) => s.id === id) || active;
    Object.assign(state, defaults, active?.values || {});
    bar?.select(active?.id);
    render({ animate });
  };

  panel = assumptions({
    controls,
    more,
    state,
    onChange(key, value) {
      state[key] = value;
      bar?.edited();
      render();
    },
    onReset: () => apply(active?.id),
    actions: actions.map((a) => ({
      label: a.label,
      run() {
        a.run(state);
        bar?.edited();
        render({ animate: true });
      },
    })),
  });
  slot("panel").replaceWith(panel.el);

  if (scenarios.length) {
    bar = scenarioBar({
      items: scenarios.map((s) => ({
        ...s,
        note: typeof s.note === "function" ? s.note({ ...defaults, ...(s.values || {}) }) : s.note,
      })),
      selected: active.id,
      onSelect: (id) => apply(id),
    });
    slot("scenarios").replaceWith(bar.el);
  } else {
    slot("scenarios").remove();
  }

  render();
  return { state, render, apply };
}
