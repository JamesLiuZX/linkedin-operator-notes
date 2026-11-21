// hub/src/js/artifacts/prototype.js
//
// The runtime behind a flagged prototype: a device (a phone or a browser
// window), a panel of switches, and the wiring between them. A spec (see
// skills/flagged-prototype/references/format.md) supplies the screens as
// functions that return HTML and branch on ctx.on("1.1"). Every switch carries
// the ID of a PRD point, and every change on a screen carries a pin with the
// same ID, so a reviewer can always get from a pixel to the reason for it.
//
// What a reviewer can do with it:
//   - turn each proposed change on and off, alone or in presets
//   - drag a divider across the screen to compare today with the proposal
//   - take the guided tour the author wrote
//   - mark each point approve, hold or cut, and copy the review as text
//   - share the exact state: it is all in the address
//
// Used twice: bundled into the handbook's demos, and inlined into the
// single-file template the skill fills in.

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const SIZE = { phone: { w: 300, h: 620 }, desktop: { w: 1000, h: 640 } };
const VERDICTS = [
  ["yes", "Approve"],
  ["hold", "Hold"],
  ["no", "Cut"],
];

const I = {
  compare: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="1.8" y="2.800" width="12.400" height="10.400" rx="2.200"/><path d="M8 1.500v13"/></svg>',
  tour: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5 3.200v9.600a.6.6 0 0 0 .92.5l7.300-4.800a.6.6 0 0 0 0-1L5.920 2.700a.6.6 0 0 0-.92.5Z"/></svg>',
  yes: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.500 8.500 3 3 6-7"/></svg>',
  hold: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5.500 4v8M10.500 4v8"/></svg>',
  no: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m4.500 4.500 7 7M11.500 4.500l-7 7"/></svg>',
  copy: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5.500" y="5.500" width="8" height="8" rx="1.500"/><path d="M10.500 5.500v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"/></svg>',
  battery: '<svg viewBox="0 0 26 12" aria-hidden="true"><rect x=".6" y=".6" width="21" height="10.8" rx="3" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="2.4" y="2.4" width="14" height="7.2" rx="1.6" fill="currentColor"/><rect x="23" y="4" width="2" height="4" rx="1" fill="currentColor"/></svg>',
  lock: '<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3.500 5V3.700a2.500 2.500 0 0 1 5 0V5h.400c.500 0 .900.400.900.900v3.700c0 .500-.400.900-.900.900H3.100a.9.9 0 0 1-.900-.900V5.900c0-.500.400-.900.900-.900h.400Zm1.200 0h2.600V3.700a1.300 1.300 0 0 0-2.600 0V5Z"/></svg>',
};

export function createPrototype(root, spec, opts = {}) {
  const flags = spec.flags || [];
  const ids = flags.map((f) => f.id);
  const frame = spec.frame === "desktop" ? "desktop" : "phone";
  const size = { ...SIZE[frame], ...(spec.size || {}) };
  const tour = Array.isArray(spec.tour) ? spec.tour : [];
  const fresh = () => (spec.state ? spec.state() : {});

  const state = {
    stack: [spec.start || Object.keys(spec.screens)[0]],
    on: Object.fromEntries(ids.map((id) => [id, false])),
    pins: true,
    lastOn: null,
    focus: null,
    sheet: null,
    data: fresh(),
    compare: false,
    split: 0.5,
    review: {},
    tour: -1,
    spot: null,
  };
  const listeners = [];
  const off = new AbortController();
  let toastTimer = 0;
  let layout = "";

  const theme = spec.theme || {};
  root.classList.add("proto", `is-${frame}`);
  if (spec.app) root.dataset.app = spec.app;
  root.style.setProperty("--brand", theme.brand || "#0c0c0b");
  root.style.setProperty("--brand-ink", theme.brandInk || "#ffffff");
  root.style.setProperty("--brand-soft", theme.brandSoft || "#eef2ee");
  root.style.setProperty("--app-bg", theme.bg || "#f6f6f2");
  root.style.setProperty("--dev-w", `${size.w}px`);
  root.style.setProperty("--dev-h", `${size.h}px`);

  const sections = spec.sections || [];
  const presets = spec.presets || [
    { id: "today", label: "Today", on: [] },
    { id: "all", label: "Everything", on: "all" },
  ];

  const views = `
          <div class="proto-view is-before" data-before aria-hidden="true"></div>
          <div class="proto-view" data-view></div>
          <div class="proto-split" data-split hidden><span>Today</span><i></i><span>Proposed</span></div>
          <div class="proto-sheet" data-sheet hidden><div class="proto-sheet-scrim" data-close></div><div class="proto-sheet-card" data-sheet-card></div></div>
          <div class="proto-toast" data-toast></div>`;

  root.innerHTML = `
    ${spec.css ? `<style>${spec.css}</style>` : ""}
    <div class="proto-stage" data-device-wrap>
      <div class="proto-device" data-device>
        ${
          frame === "desktop"
            ? `<div class="proto-window" data-phone>
          <div class="proto-chrome"><span class="proto-dots"><i></i><i></i><i></i></span><span class="proto-who" data-who></span><span class="proto-url">${I.lock}<b data-url></b></span></div>
          <div class="proto-screen">${views}</div>
        </div>`
            : `<div class="proto-phone" data-phone>
          <div class="proto-screen">
            <div class="proto-status"><b>9:41</b><i></i><span>${I.battery}</span></div>${views}
          </div>
        </div>`
        }
      </div>
      <div class="proto-tour" data-tour hidden></div>
    </div>
    <aside class="proto-panel" data-panel>
      <header class="proto-panel-head">
        <h1>${esc(spec.title || "Prototype")}</h1>
        ${spec.sub ? `<p>${esc(spec.sub)}</p>` : ""}
      </header>
      <div class="proto-tools">
        <div class="proto-presets" role="group" aria-label="Presets">
          ${presets.map((p) => `<button type="button" data-preset="${esc(p.id)}">${esc(p.label)}</button>`).join("")}
        </div>
        <div class="proto-modes">
          <button type="button" class="proto-mode" data-compare aria-pressed="false" title="Drag a divider across the screen: today on the left, the proposal on the right (C)">${I.compare}<span>Compare</span></button>
          ${tour.length ? `<button type="button" class="proto-mode" data-tour-start title="A guided walk through the changes (T)">${I.tour}<span>Tour</span></button>` : ""}
        </div>
      </div>
      <div class="proto-flags" data-flags></div>
      <p class="proto-caption" data-caption></p>
      <div class="proto-panel-foot">
        <div class="proto-review" data-review></div>
        <label class="proto-pins"><input type="checkbox" data-pins checked><span>Show the numbered pins</span></label>
        <div class="proto-screens" data-screens></div>
        ${spec.legal ? `<p class="proto-legal">${esc(spec.legal)}</p>` : ""}
      </div>
    </aside>`;

  const $ = (sel) => root.querySelector(sel);
  const view = $("[data-view]");
  const before = $("[data-before]");
  const splitEl = $("[data-split]");
  const screenEl = $(".proto-screen");
  const sheetEl = $("[data-sheet]");
  const sheetCard = $("[data-sheet-card]");
  const toastEl = $("[data-toast]");
  const flagsEl = $("[data-flags]");
  const screensEl = $("[data-screens]");
  const reviewEl = $("[data-review]");
  const captionEl = $("[data-caption]");
  const tourEl = $("[data-tour]");
  const device = $("[data-device]");
  const phone = $("[data-phone]");
  const wrap = $("[data-device-wrap]");
  const panelEl = $("[data-panel]");

  const cur = () => state.stack[state.stack.length - 1];
  const flagOf = (id) => flags.find((f) => f.id === id);

  // Scroll one container to show an element, without ever moving the page around it.
  function scrollWithin(box, el) {
    if (!box || !el) return;
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const k = b.height / (box.offsetHeight || b.height || 1);
    const top = (r.top - b.top) / k;
    const bottom = (r.bottom - b.top) / k;
    const left = (r.left - b.left) / k;
    const right = (r.right - b.left) / k;
    if (top < 12) box.scrollTop += top - 12;
    else if (bottom > box.clientHeight - 12) box.scrollTop += bottom - box.clientHeight + 12;
    if (left < 12) box.scrollLeft += left - 12;
    else if (right > box.clientWidth - 12) box.scrollLeft += right - box.clientWidth + 12;
  }

  const makeCtx = (isOn, withPins) => ({
    on: isOn,
    /** A numbered marker for the PRD point this piece of UI belongs to. */
    pin: (id) => (withPins ? `<button type="button" class="pin" data-pin="${esc(id)}" aria-label="Point ${esc(id)}">${esc(id)}</button>` : ""),
    /** Marks an element as belonging to a switch, so it can animate in when the switch is turned on. */
    flag: (id) => `data-flag="${esc(id)}"${withPins && state.lastOn === id ? " data-new" : ""}`,
    get data() {
      return state.data;
    },
    esc,
    get screen() {
      return cur();
    },
  });
  const ctx = makeCtx((id) => !!state.on[id], true);
  // The same screen with nothing switched on: the left half of the comparison.
  const ctxToday = makeCtx(() => false, false);

  function renderPanel() {
    const here = cur();
    const row = (f, n) => {
      const on = state.on[f.id];
      const onScreen = (f.screens || []).includes(here);
      const open = state.focus === f.id;
      const verdict = state.review[f.id];
      return `
      <div class="proto-flag${on ? " on" : ""}${open ? " focus" : ""}${onScreen ? "" : " away"}${verdict ? ` is-${verdict}` : ""}" data-flag-row="${esc(f.id)}">
        <button type="button" class="proto-switch" role="switch" aria-checked="${on}" data-toggle="${esc(f.id)}" aria-label="${esc(f.label)}" title="${esc(f.label)} (${n})"><i></i></button>
        <div class="proto-flag-copy" data-focus="${esc(f.id)}">
          <div class="proto-flag-top"><span class="proto-id">${esc(f.id)}</span><b>${esc(f.label)}</b>${verdict ? `<em class="proto-verdict">${esc(VERDICTS.find((v) => v[0] === verdict)[1])}</em>` : ""}</div>
          <p>${esc(f.note || "")}</p>
          ${onScreen ? "" : `<small>Shows on ${esc((f.screens || []).map((s) => spec.screens[s]?.name || s).join(", "))}</small>`}
          <div class="proto-decide" role="group" aria-label="Your decision on ${esc(f.id)}">
            ${VERDICTS.map(([v, label]) => `<button type="button" data-verdict="${esc(f.id)}:${v}" aria-pressed="${verdict === v}" class="v-${v}">${I[v]}<span>${label}</span></button>`).join("")}
          </div>
        </div>
      </div>`;
    };
    let n = 0;
    flagsEl.innerHTML = sections.length
      ? sections
          .map((s) => {
            const items = flags.filter((f) => f.section === s.n);
            return items.length ? `<div class="proto-group"><h2>${esc(String(s.n))}. ${esc(s.title)}</h2>${items.map((f) => row(f, ++n)).join("")}</div>` : "";
          })
          .join("")
      : flags.map((f) => row(f, ++n)).join("");

    const touched = new Set(flags.filter((f) => state.on[f.id]).flatMap((f) => f.screens || []));
    screensEl.innerHTML = Object.entries(spec.screens)
      .map(([k, s]) => `<button type="button" class="${k === here ? "on" : ""}${touched.has(k) ? " changed" : ""}" data-jump="${esc(k)}">${esc(s.name || k)}</button>`)
      .join("");

    const count = ids.filter((id) => state.on[id]).length;
    root.querySelectorAll("[data-preset]").forEach((b) => {
      const p = presets.find((x) => x.id === b.dataset.preset);
      const want = p.on === "all" ? ids : p.on;
      b.classList.toggle("on", want.length === count && want.every((id) => state.on[id]));
    });

    // The one line a narrow layout has room for: the point in focus.
    const f = flagOf(state.focus) || flags.find((x) => state.on[x.id] && (x.screens || []).includes(here)) || flags[0];
    captionEl.innerHTML = f ? `<span class="proto-id">${esc(f.id)}</span><b>${esc(f.label)}</b> ${esc(f.note || "")}` : "";

    const tally = { yes: 0, hold: 0, no: 0 };
    for (const id of ids) if (state.review[id]) tally[state.review[id]]++;
    const decided = tally.yes + tally.hold + tally.no;
    reviewEl.innerHTML = `
      <div class="proto-review-bar" aria-hidden="true">${ids.map((id) => `<i class="${state.review[id] ? `is-${state.review[id]}` : ""}"></i>`).join("")}</div>
      <p>${decided ? `<b>${tally.yes}</b> approved, <b>${tally.hold}</b> on hold, <b>${tally.no}</b> cut, ${ids.length - decided} to go` : "Open a point to approve it, hold it or cut it."}</p>
      <button type="button" class="proto-copy" data-copy-review${decided ? "" : " disabled"}>${I.copy}<span>Copy the review</span></button>`;
  }

  function renderScreen(target, c) {
    const name = cur();
    target.innerHTML = spec.screens[name].render(c);
    target.dataset.screen = name;
  }

  function render({ keepScroll = false } = {}) {
    const name = cur();
    const old = view.querySelector(".p-scroll");
    const top = keepScroll && old ? old.scrollTop : 0;
    renderScreen(view, ctx);
    const next = view.querySelector(".p-scroll");
    if (next && top) next.scrollTop = top;
    if (state.compare) {
      renderScreen(before, ctxToday);
      const b = before.querySelector(".p-scroll");
      if (b && top) b.scrollTop = top;
    } else before.innerHTML = "";
    if (frame === "desktop") {
      const s = spec.screens[name];
      const url = typeof s.url === "function" ? s.url(ctx) : s.url || spec.url || "";
      $("[data-url]").textContent = url;
      $("[data-who]").textContent = s.who || spec.who || "";
    }
    root.classList.toggle("pins", state.pins);
    root.classList.toggle("is-compare", state.compare);
    splitEl.hidden = !state.compare;
    $("[data-compare]").setAttribute("aria-pressed", String(state.compare));
    screenEl.style.setProperty("--split", String(state.split));
    renderPanel();
    spot();
    if (opts.hash) writeHash();
    listeners.forEach((fn) => fn(api.snapshot()));
  }

  /** Ring the element a tour step or a pin points at. */
  function spot() {
    view.querySelectorAll(".is-spot").forEach((el) => el.classList.remove("is-spot"));
    if (!state.spot) return;
    let el = null;
    try {
      el = view.querySelector(state.spot) || sheetCard.querySelector(state.spot);
    } catch {
      el = null;
    }
    if (el) {
      el.classList.add("is-spot");
      scrollWithin(view.querySelector(".p-scroll"), el);
    }
  }

  function setFlags(next, { announce = null } = {}) {
    for (const id of ids) state.on[id] = !!next[id];
    state.lastOn = announce;
    render({ keepScroll: true });
  }

  function toggle(id, on = !state.on[id]) {
    if (!flagOf(id)) return;
    state.on[id] = on;
    state.lastOn = on ? id : null;
    state.focus = id;
    state.spot = null;
    // Show the change: jump to the first screen the switch touches.
    const f = flagOf(id);
    if (on && f?.screens?.length && !f.screens.includes(cur()) && opts.follow !== false) {
      state.stack = [...(spec.paths?.[f.screens[0]] || [f.screens[0]])];
      closeSheet();
    }
    render({ keepScroll: true });
    if (on) scrollWithin(view.querySelector(".p-scroll"), view.querySelector(`[data-flag="${CSS.escape(id)}"]`));
    scrollWithin(flagsEl, flagsEl.querySelector(`[data-flag-row="${CSS.escape(id)}"]`));
  }

  function go(name) {
    if (!spec.screens[name]) return;
    state.stack.push(name);
    state.lastOn = null;
    closeSheet();
    render();
  }

  function back() {
    if (state.stack.length > 1) state.stack.pop();
    state.lastOn = null;
    closeSheet();
    render();
  }

  function jump(name) {
    if (!spec.screens[name]) return;
    state.stack = [...(spec.paths?.[name] || [name])];
    state.lastOn = null;
    closeSheet();
    render();
  }

  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add("on");
    clearTimeout(toastTimer);
    if (!opts.instant) toastTimer = setTimeout(() => toastEl.classList.remove("on"), 2600);
  }

  function openSheet(name, k) {
    const fn = spec.sheets?.[name];
    if (!fn) return;
    state.sheet = { name, k };
    sheetCard.innerHTML = `<i class="proto-grab"></i>${fn(ctx, k)}`;
    sheetCard.dataset.sheetName = name;
    sheetEl.hidden = false;
  }

  function closeSheet() {
    state.sheet = null;
    sheetEl.hidden = true;
  }

  function focusFlag(id) {
    state.focus = state.focus === id && layout === "side" ? null : id;
    renderPanel();
    scrollWithin(flagsEl, flagsEl.querySelector(`[data-flag-row="${CSS.escape(id)}"]`));
  }

  function setCompare(on, x = state.split) {
    state.compare = !!on;
    state.split = Math.max(0.04, Math.min(0.96, x));
    if (state.compare) closeSheet();
    render({ keepScroll: true });
  }

  /* ----------------------------------------------------------- the tour */

  /** The whole state a tour step stands for: every step before it, applied in order. */
  function tourState(i) {
    const s = { screen: spec.start || Object.keys(spec.screens)[0], on: {}, data: {}, sheet: null, focus: null, spot: null, say: "" };
    for (let k = 0; k <= i && k < tour.length; k++) {
      const step = tour[k];
      if (step.preset) {
        const p = presets.find((x) => x.id === step.preset);
        const want = p ? (p.on === "all" ? ids : p.on) : [];
        s.on = Object.fromEntries(want.map((id) => [id, true]));
      }
      if (step.flag) s.on[step.flag] = true;
      if (step.off) delete s.on[step.off];
      if (step.screen) s.screen = step.screen;
      if (step.set) Object.assign(s.data, step.set);
      if ("sheet" in step) s.sheet = step.sheet;
      else if (step.screen) s.sheet = null;
      s.focus = step.flag || step.off || (k === i ? null : s.focus);
      s.spot = k === i ? step.spot || (step.flag ? `[data-flag="${step.flag}"]` : null) : null;
      s.announce = k === i ? step.flag || null : null;
      s.say = step.say || "";
    }
    return s;
  }

  function showTour(i) {
    if (!tour.length) return;
    state.tour = Math.max(0, Math.min(tour.length - 1, i));
    state.compare = false;
    api.apply(tourState(state.tour));
    const step = tour[state.tour];
    const f = flagOf(step.flag);
    tourEl.hidden = false;
    tourEl.innerHTML = `
      <div class="proto-tour-dots" aria-hidden="true">${tour.map((_, k) => `<i class="${k === state.tour ? "on" : k < state.tour ? "done" : ""}"></i>`).join("")}</div>
      <p>${f ? `<span class="proto-id">${esc(f.id)}</span>` : ""}${esc(step.say || f?.note || "")}</p>
      <div class="proto-tour-nav">
        <button type="button" data-tour-go="-1"${state.tour === 0 ? " disabled" : ""}>Back</button>
        ${state.tour < tour.length - 1 ? `<button type="button" class="is-next" data-tour-go="1">Next <kbd>→</kbd></button>` : `<button type="button" class="is-next" data-tour-end>Done</button>`}
        <button type="button" class="proto-tour-x" data-tour-end aria-label="Leave the tour">${I.no}</button>
      </div>`;
    root.classList.add("is-touring");
  }

  function endTour() {
    state.tour = -1;
    state.spot = null;
    tourEl.hidden = true;
    root.classList.remove("is-touring");
    spot();
  }

  /* ---------------------------------------------------------- the review */

  function reviewText() {
    const where = opts.hash && typeof location !== "undefined" ? location.href : "";
    const line = (f) => `- ${f.id} ${f.label}`;
    const pick = (v) => flags.filter((f) => state.review[f.id] === v);
    const open = flags.filter((f) => !state.review[f.id]);
    const block = (title, list) => (list.length ? `\n${title}\n${list.map(line).join("\n")}\n` : "");
    return `Review: ${spec.title || "Prototype"}\n${block("Approve", pick("yes"))}${block("Hold", pick("hold"))}${block("Cut", pick("no"))}${block("Not decided", open)}${where ? `\nThe prototype, in the state I reviewed: ${where}\n` : ""}`;
  }

  async function copyReview(button) {
    const text = reviewText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      root.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    const label = button.querySelector("span");
    if (label) {
      label.textContent = "Copied";
      setTimeout(() => (label.textContent = "Copy the review"), 1500);
    }
  }

  /* -------------------------------------------------------------- events */

  root.addEventListener(
    "click",
    (ev) => {
      const t = ev.target.closest(
        "[data-pin],[data-toggle],[data-verdict],[data-focus],[data-preset],[data-compare],[data-tour-start],[data-tour-go],[data-tour-end],[data-copy-review],[data-jump],[data-go],[data-back],[data-act],[data-sheet-open],[data-toast-text],[data-close]"
      );
      if (!t || !root.contains(t)) return;
      const d = t.dataset;
      if ("pin" in d) {
        state.focus = null;
        return focusFlag(d.pin);
      }
      if ("toggle" in d) return toggle(d.toggle);
      if ("verdict" in d) {
        const [id, v] = d.verdict.split(":");
        if (state.review[id] === v) delete state.review[id];
        else state.review[id] = v;
        renderPanel();
        if (opts.hash) writeHash();
        return;
      }
      if ("focus" in d) return focusFlag(d.focus);
      if ("preset" in d) {
        const p = presets.find((x) => x.id === d.preset);
        const want = p.on === "all" ? ids : p.on;
        return setFlags(Object.fromEntries(ids.map((id) => [id, want.includes(id)])));
      }
      if ("compare" in d) return setCompare(!state.compare);
      if ("tourStart" in d) return showTour(0);
      if ("tourGo" in d) return showTour(state.tour + Number(d.tourGo));
      if ("tourEnd" in d) return endTour();
      if ("copyReview" in d) return copyReview(t);
      if ("jump" in d) return jump(d.jump);
      if ("go" in d) return go(d.go);
      if ("back" in d) return back();
      if ("close" in d) return closeSheet();
      if ("sheetOpen" in d) return openSheet(d.sheetOpen, d.k);
      if ("toastText" in d) return toast(d.toastText);
      if ("act" in d) {
        const res = spec.actions?.[d.act]?.(ctx, d.k, api);
        state.lastOn = null;
        state.spot = null;
        if (res?.toast) toast(res.toast);
        if (res?.go) return go(res.go);
        if (res?.jump) return jump(res.jump);
        if (res?.close) closeSheet();
        render({ keepScroll: true });
        if (res?.sheet) openSheet(res.sheet, res.k);
        else if (state.sheet && !res?.close) openSheet(state.sheet.name, state.sheet.k);
      }
    },
    { signal: off.signal }
  );

  $("[data-pins]").addEventListener("change", (ev) => {
    state.pins = ev.target.checked;
    root.classList.toggle("pins", state.pins);
  });

  // The comparison divider: drag it, or use the arrow keys.
  const moveSplit = (ev) => {
    const r = screenEl.getBoundingClientRect();
    state.split = Math.max(0.04, Math.min(0.96, (ev.clientX - r.left) / Math.max(1, r.width)));
    screenEl.style.setProperty("--split", String(state.split));
  };
  splitEl.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    splitEl.setPointerCapture(ev.pointerId);
    splitEl.classList.add("is-drag");
    moveSplit(ev);
    const stop = () => {
      splitEl.classList.remove("is-drag");
      splitEl.removeEventListener("pointermove", moveSplit);
      splitEl.removeEventListener("pointerup", stop);
      splitEl.removeEventListener("pointercancel", stop);
    };
    splitEl.addEventListener("pointermove", moveSplit);
    splitEl.addEventListener("pointerup", stop);
    splitEl.addEventListener("pointercancel", stop);
  });
  // The two halves scroll as one.
  view.addEventListener(
    "scroll",
    (ev) => {
      if (!state.compare || !ev.target.classList?.contains("p-scroll")) return;
      const b = before.querySelector(".p-scroll");
      if (b) b.scrollTop = ev.target.scrollTop;
    },
    true
  );
  screenEl.addEventListener(
    "wheel",
    (ev) => {
      if (!state.compare) return;
      const a = view.querySelector(".p-scroll");
      if (a && !view.contains(ev.target)) a.scrollTop += ev.deltaY;
    },
    { passive: true }
  );

  function onKey(ev) {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (ev.target.closest?.("input, textarea, select, [contenteditable]")) return;
    const k = ev.key;
    if (k === "Escape") {
      if (state.tour >= 0) return endTour();
      if (state.sheet) return closeSheet();
      if (state.compare) return setCompare(false);
      return;
    }
    if (state.tour >= 0 && (k === "ArrowRight" || k === "ArrowLeft")) {
      ev.preventDefault();
      return showTour(state.tour + (k === "ArrowRight" ? 1 : -1));
    }
    if (state.compare && (k === "ArrowRight" || k === "ArrowLeft")) {
      ev.preventDefault();
      return setCompare(true, state.split + (k === "ArrowRight" ? 0.05 : -0.05));
    }
    if (/^[1-9]$/.test(k) && ids[Number(k) - 1]) return toggle(ids[Number(k) - 1]);
    if (k === "0") return setFlags({});
    if (k === "c" || k === "C") return setCompare(!state.compare);
    if ((k === "t" || k === "T") && tour.length) return state.tour >= 0 ? endTour() : showTour(0);
    if (k === "p" || k === "P") return api.setPins(!state.pins);
  }
  (opts.keys === "page" ? document : root).addEventListener("keydown", onKey, { signal: off.signal });

  /* -------------------------------------------------------------- layout */

  // The device is drawn at a fixed size and scaled to fit, so its type never reflows.
  function fit() {
    const w = root.clientWidth;
    if (!w) return;
    // Side by side when there is room for the device at a readable size, else stacked.
    const need = frame === "desktop" ? 1120 : 700;
    const next = opts.layout && opts.layout !== "auto" ? opts.layout : w >= need ? "side" : "strip";
    if (next !== layout) {
      layout = next;
      root.dataset.layout = layout;
      renderPanel();
    }
    const r = wrap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const k = Math.min(r.width / size.w, r.height / size.h, opts.maxScale || (frame === "desktop" ? 1 : 1.25));
    device.style.width = `${(size.w * k).toFixed(1)}px`;
    device.style.height = `${(size.h * k).toFixed(1)}px`;
    phone.style.transform = `scale(${k.toFixed(4)})`;
  }
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
  ro?.observe(root);
  ro?.observe(wrap);

  /* ---------------------------------------------------------- the address */

  function writeHash() {
    const on = ids.filter((id) => state.on[id]);
    const parts = [];
    if (on.length) parts.push(`on=${on.join(",")}`);
    for (const [v] of VERDICTS) {
      const list = ids.filter((id) => state.review[id] === v);
      if (list.length) parts.push(`${v}=${list.join(",")}`);
    }
    if (state.compare) parts.push("compare=1");
    const h = `#${cur()}${parts.length ? `?${parts.join("&")}` : ""}`;
    try {
      history.replaceState(null, "", h);
    } catch {
      /* file:// in some browsers */
    }
  }

  function readHash() {
    const m = /^#([\w-]+)(?:\?(.*))?/.exec(location.hash || "");
    if (!m) return false;
    if (spec.screens[m[1]]) state.stack = [...(spec.paths?.[m[1]] || [m[1]])];
    const q = new URLSearchParams(m[2] || "");
    const want = (q.get("on") || "").split(",");
    for (const id of ids) state.on[id] = want.includes(id);
    state.review = {};
    for (const [v] of VERDICTS) for (const id of (q.get(v) || "").split(",")) if (ids.includes(id)) state.review[id] = v;
    state.compare = q.get("compare") === "1";
    return true;
  }

  const api = {
    root,
    spec,
    options: opts,
    frame,
    tour,
    toggle,
    setFlags,
    go,
    back,
    jump,
    toast,
    openSheet,
    closeSheet,
    focusFlag,
    setCompare,
    showTour,
    endTour,
    tourState,
    reviewText,
    render,
    fit,
    setPins(on) {
      state.pins = on;
      $("[data-pins]").checked = on;
      root.classList.toggle("pins", on);
    },
    /**
     * Put the prototype in an exact state. Used by the replay and the tour,
     * which must be able to go to any step from any other.
     * `data` is laid over the spec's starting state, so a step can say
     * "the link has been copied" without replaying the clicks before it.
     */
    apply({ screen, on = {}, focus = null, announce = null, sheet = null, data = null, spot: ring = null, compare = false, split = 0.5, toast: text = "" } = {}) {
      if (screen) state.stack = [...(spec.paths?.[screen] || [screen])];
      for (const id of ids) state.on[id] = !!on[id];
      state.focus = focus;
      state.lastOn = announce;
      state.spot = ring;
      state.compare = !!compare;
      state.split = split;
      if (data) {
        for (const k of Object.keys(state.data)) delete state.data[k];
        Object.assign(state.data, fresh(), data);
      }
      closeSheet();
      render();
      if (sheet) {
        openSheet(sheet.name, sheet.k);
        spot();
      }
      if (text) toast(text);
      else toastEl.classList.remove("on");
      if (announce) scrollWithin(view.querySelector(".p-scroll"), view.querySelector(`[data-flag="${CSS.escape(announce)}"]`));
      if (focus) scrollWithin(flagsEl, flagsEl.querySelector(`[data-flag-row="${CSS.escape(focus)}"]`));
    },
    reset() {
      for (const k of Object.keys(state.data)) delete state.data[k];
      Object.assign(state.data, fresh());
      state.spot = null;
      toastEl.classList.remove("on");
    },
    snapshot: () => ({ screen: cur(), on: { ...state.on }, focus: state.focus, compare: state.compare, review: { ...state.review } }),
    onChange: (fn) => listeners.push(fn),
    destroy() {
      off.abort();
      ro?.disconnect();
      clearTimeout(toastTimer);
    },
    el: {
      switch: (id) => flagsEl.querySelector(`[data-toggle="${CSS.escape(id)}"]`),
      row: (id) => flagsEl.querySelector(`[data-flag-row="${CSS.escape(id)}"]`),
      view,
      phone,
      device,
      screen: screenEl,
      split: splitEl,
      panel: panelEl,
      compare: $("[data-compare]"),
      find: (sel) => {
        try {
          return (state.sheet && sheetCard.querySelector(sel)) || view.querySelector(sel);
        } catch {
          return null;
        }
      },
    },
  };

  if (opts.hash) {
    readHash();
    addEventListener("hashchange", () => readHash() && render(), { signal: off.signal });
  }
  fit();
  if (!layout) {
    layout = opts.layout && opts.layout !== "auto" ? opts.layout : "side";
    root.dataset.layout = layout;
  }
  render();
  return api;
}

export const PHONE = SIZE.phone;
export const DEVICE = SIZE;
