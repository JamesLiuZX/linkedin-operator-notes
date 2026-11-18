// hub/src/js/artifacts/prototype.js
//
// The runtime behind a flagged prototype: a phone, a panel of switches, and
// the wiring between them. A spec (see skills/flagged-prototype/references/
// format.md) supplies the screens as functions that return HTML and branch on
// ctx.on("1.1"). Every switch carries the ID of a PRD point, and every change
// on a screen carries a pin with the same ID, so a reviewer can always get
// from a pixel to the reason for it.
//
// Used twice: bundled into the handbook's demos, and inlined into the
// single-file template the skill fills in.

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const PHONE_W = 300;
const PHONE_H = 620;

export function createPrototype(root, spec, opts = {}) {
  const flags = spec.flags || [];
  const ids = flags.map((f) => f.id);
  const state = {
    stack: [spec.start || Object.keys(spec.screens)[0]],
    on: Object.fromEntries(ids.map((id) => [id, false])),
    pins: true,
    lastOn: null,
    focus: null,
    sheet: null,
    data: spec.state ? spec.state() : {},
  };
  const listeners = [];
  let toastTimer = 0;

  const theme = spec.theme || {};
  root.classList.add("proto");
  root.style.setProperty("--brand", theme.brand || "#0b0c0c");
  root.style.setProperty("--brand-ink", theme.brandInk || "#ffffff");
  root.style.setProperty("--brand-soft", theme.brandSoft || "#eef2ee");
  root.style.setProperty("--app-bg", theme.bg || "#f6f6f2");

  const sections = spec.sections || [];
  const presets = spec.presets || [
    { id: "today", label: "Today", on: [] },
    { id: "all", label: "Everything on", on: "all" },
  ];

  root.innerHTML = `
    <div class="proto-phone-wrap" data-phone-wrap>
      <div class="proto-phone" data-phone>
        <div class="proto-screen">
          <div class="proto-status"><b>9:41</b><i></i><span><svg viewBox="0 0 26 12" aria-hidden="true"><rect x=".6" y=".6" width="21" height="10.8" rx="3" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="2.4" y="2.4" width="14" height="7.2" rx="1.6" fill="currentColor"/><rect x="23" y="4" width="2" height="4" rx="1" fill="currentColor"/></svg></span></div>
          <div class="proto-view" data-view></div>
          <div class="proto-sheet" data-sheet hidden><div class="proto-sheet-scrim" data-close></div><div class="proto-sheet-card" data-sheet-card></div></div>
          <div class="proto-toast" data-toast></div>
        </div>
      </div>
    </div>
    <aside class="proto-panel" data-panel>
      <header class="proto-panel-head">
        <h1>${esc(spec.title || "Prototype")}</h1>
        ${spec.sub ? `<p>${esc(spec.sub)}</p>` : ""}
      </header>
      <div class="proto-presets" role="group" aria-label="Presets">
        ${presets.map((p) => `<button type="button" data-preset="${esc(p.id)}">${esc(p.label)}</button>`).join("")}
        <button type="button" class="proto-hold" data-hold title="Hold to see the app as it is today">Hold for today</button>
      </div>
      <div class="proto-flags" data-flags></div>
      <div class="proto-panel-foot">
        <label class="proto-pins"><input type="checkbox" data-pins checked><span>Show pins on the screens</span></label>
        <div class="proto-screens" data-screens></div>
        ${spec.legal ? `<p class="proto-legal">${esc(spec.legal)}</p>` : ""}
      </div>
    </aside>`;

  const $ = (sel) => root.querySelector(sel);
  const view = $("[data-view]");
  const sheetEl = $("[data-sheet]");
  const sheetCard = $("[data-sheet-card]");
  const toastEl = $("[data-toast]");
  const flagsEl = $("[data-flags]");
  const screensEl = $("[data-screens]");
  const phone = $("[data-phone]");
  const wrap = $("[data-phone-wrap]");
  const panelEl = $("[data-panel]");

  const cur = () => state.stack[state.stack.length - 1];

  // Scroll one container to show an element, without ever moving the page around it.
  function scrollWithin(box, el) {
    if (!box || !el) return;
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const k = b.height / (box.offsetHeight || b.height || 1);
    const top = (r.top - b.top) / k;
    const bottom = (r.bottom - b.top) / k;
    if (top < 12) box.scrollTop += top - 12;
    else if (bottom > box.clientHeight - 12) box.scrollTop += bottom - box.clientHeight + 12;
  }

  const ctx = {
    on: (id) => !!state.on[id],
    /** A numbered marker for the PRD point this piece of UI belongs to. */
    pin: (id) => `<button type="button" class="pin" data-pin="${esc(id)}" aria-label="Point ${esc(id)}">${esc(id)}</button>`,
    /** Marks an element as belonging to a switch, so it can animate in when the switch is turned on. */
    flag: (id) => `data-flag="${esc(id)}"${state.lastOn === id ? " data-new" : ""}`,
    data: state.data,
    esc,
    get screen() {
      return cur();
    },
  };

  function renderPanel() {
    const here = cur();
    const row = (f) => {
      const on = state.on[f.id];
      const onScreen = (f.screens || []).includes(here);
      return `
      <div class="proto-flag${on ? " on" : ""}${state.focus === f.id ? " focus" : ""}${onScreen ? "" : " away"}" data-flag-row="${esc(f.id)}">
        <button type="button" class="proto-switch" role="switch" aria-checked="${on}" data-toggle="${esc(f.id)}" aria-label="${esc(f.label)}"><i></i></button>
        <div class="proto-flag-copy" data-focus="${esc(f.id)}">
          <div class="proto-flag-top"><span class="proto-id">${esc(f.id)}</span><b>${esc(f.label)}</b></div>
          <p>${esc(f.note || "")}</p>
          ${onScreen ? "" : `<small>On ${esc((f.screens || []).map((s) => spec.screens[s]?.name || s).join(", "))}</small>`}
        </div>
      </div>`;
    };
    flagsEl.innerHTML = sections.length
      ? sections
          .map((s) => {
            const items = flags.filter((f) => f.section === s.n);
            return items.length ? `<div class="proto-group"><h2>${esc(String(s.n))}. ${esc(s.title)}</h2>${items.map(row).join("")}</div>` : "";
          })
          .join("")
      : flags.map(row).join("");

    screensEl.innerHTML = Object.entries(spec.screens)
      .map(([k, s]) => `<button type="button" class="${k === here ? "on" : ""}" data-jump="${esc(k)}">${esc(s.name || k)}</button>`)
      .join("");

    const count = ids.filter((id) => state.on[id]).length;
    root.querySelectorAll("[data-preset]").forEach((b) => {
      const p = presets.find((x) => x.id === b.dataset.preset);
      const want = p.on === "all" ? ids : p.on;
      b.classList.toggle("on", want.length === count && want.every((id) => state.on[id]));
    });
  }

  function render({ keepScroll = false } = {}) {
    const name = cur();
    const old = view.querySelector(".p-scroll");
    const top = keepScroll && old ? old.scrollTop : 0;
    view.innerHTML = spec.screens[name].render(ctx);
    view.dataset.screen = name;
    const next = view.querySelector(".p-scroll");
    if (next && top) next.scrollTop = top;
    root.classList.toggle("pins", state.pins);
    renderPanel();
    if (opts.hash) writeHash();
    listeners.forEach((fn) => fn(api.snapshot()));
  }

  function setFlags(next, { announce = null } = {}) {
    for (const id of ids) state.on[id] = !!next[id];
    state.lastOn = announce;
    render({ keepScroll: true });
  }

  function toggle(id, on = !state.on[id]) {
    state.on[id] = on;
    state.lastOn = on ? id : null;
    state.focus = id;
    // Show the change: jump to the first screen the switch touches.
    const f = flags.find((x) => x.id === id);
    if (on && f?.screens?.length && !f.screens.includes(cur()) && opts.follow !== false) {
      state.stack = [...(spec.paths?.[f.screens[0]] || [f.screens[0]])];
    }
    render({ keepScroll: true });
    if (on) scrollWithin(view.querySelector(".p-scroll"), view.querySelector(`[data-flag="${CSS.escape(id)}"]`));
    scrollWithin(panelEl, flagsEl.querySelector(`[data-flag-row="${CSS.escape(id)}"]`));
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
    toastTimer = setTimeout(() => toastEl.classList.remove("on"), 2400);
  }

  function openSheet(name, k) {
    const fn = spec.sheets?.[name];
    if (!fn) return;
    state.sheet = { name, k };
    sheetCard.innerHTML = `<i class="proto-grab"></i>${fn(ctx, k)}`;
    sheetEl.hidden = false;
  }

  function closeSheet() {
    state.sheet = null;
    sheetEl.hidden = true;
  }

  function focusFlag(id) {
    state.focus = id;
    renderPanel();
    scrollWithin(panelEl, flagsEl.querySelector(`[data-flag-row="${CSS.escape(id)}"]`));
  }

  root.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-pin],[data-toggle],[data-focus],[data-preset],[data-jump],[data-go],[data-back],[data-act],[data-sheet-open],[data-toast-text],[data-close]");
    if (!t || !root.contains(t)) return;
    const d = t.dataset;
    if ("pin" in d) return focusFlag(d.pin);
    if ("toggle" in d) return toggle(d.toggle);
    if ("focus" in d) return focusFlag(d.focus);
    if ("preset" in d) {
      const p = presets.find((x) => x.id === d.preset);
      const want = p.on === "all" ? ids : p.on;
      return setFlags(Object.fromEntries(ids.map((id) => [id, want.includes(id)])));
    }
    if ("jump" in d) return jump(d.jump);
    if ("go" in d) return go(d.go);
    if ("back" in d) return back();
    if ("close" in d) return closeSheet();
    if ("sheetOpen" in d) return openSheet(d.sheetOpen, d.k);
    if ("toastText" in d) return toast(d.toastText);
    if ("act" in d) {
      const res = spec.actions?.[d.act]?.(ctx, d.k, api);
      state.lastOn = null;
      if (res?.toast) toast(res.toast);
      if (res?.go) return go(res.go);
      if (res?.close) closeSheet();
      render({ keepScroll: true });
      if (state.sheet && !res?.close) openSheet(state.sheet.name, state.sheet.k);
    }
  });

  $("[data-pins]").addEventListener("change", (ev) => {
    state.pins = ev.target.checked;
    root.classList.toggle("pins", state.pins);
  });

  // Hold to compare: everything off while the button is held.
  const hold = $("[data-hold]");
  let held = null;
  const release = () => {
    if (!held) return;
    const was = held;
    held = null;
    hold.classList.remove("on");
    setFlags(was);
  };
  hold.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    held = { ...state.on };
    hold.classList.add("on");
    setFlags({});
  });
  ["pointerup", "pointerleave", "pointercancel", "blur"].forEach((e) => hold.addEventListener(e, release));

  root.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closeSheet();
  });

  // The phone is drawn at a fixed size and scaled to fit, so its type never reflows.
  function fit() {
    const r = wrap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const k = Math.min(r.width / PHONE_W, r.height / PHONE_H, opts.maxScale || 1.25);
    phone.style.transform = `scale(${k.toFixed(4)})`;
  }
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(fit).observe(wrap);

  function writeHash() {
    const on = ids.filter((id) => state.on[id]);
    const h = `#${cur()}${on.length ? `?on=${on.join(",")}` : ""}`;
    try {
      history.replaceState(null, "", h);
    } catch {
      /* file:// in some browsers */
    }
  }

  function readHash() {
    const m = /^#([\w-]+)(?:\?on=([\w.,-]*))?/.exec(location.hash || "");
    if (!m) return false;
    if (spec.screens[m[1]]) state.stack = [...(spec.paths?.[m[1]] || [m[1]])];
    if (m[2] !== undefined) {
      const want = m[2].split(",");
      for (const id of ids) state.on[id] = want.includes(id);
    }
    return true;
  }

  const api = {
    root,
    spec,
    options: opts,
    toggle,
    setFlags,
    go,
    back,
    jump,
    toast,
    openSheet,
    closeSheet,
    focusFlag,
    render,
    fit,
    setPins(on) {
      state.pins = on;
      $("[data-pins]").checked = on;
      root.classList.toggle("pins", on);
    },
    /** Put the prototype in an exact state. Used by the replay, which must be able to seek. */
    apply({ screen, on = {}, focus = null, announce = null, sheet = null } = {}) {
      if (screen) state.stack = [...(spec.paths?.[screen] || [screen])];
      for (const id of ids) state.on[id] = !!on[id];
      state.focus = focus;
      state.lastOn = announce;
      render();
      if (announce) scrollWithin(view.querySelector(".p-scroll"), view.querySelector(`[data-flag="${CSS.escape(announce)}"]`));
      if (focus) scrollWithin(panelEl, flagsEl.querySelector(`[data-flag-row="${CSS.escape(focus)}"]`));
      if (sheet) openSheet(sheet.name, sheet.k);
      else closeSheet();
    },
    reset() {
      Object.assign(state.data, spec.state ? spec.state() : {});
    },
    snapshot: () => ({ screen: cur(), on: { ...state.on }, focus: state.focus }),
    onChange: (fn) => listeners.push(fn),
    el: {
      switch: (id) => flagsEl.querySelector(`[data-toggle="${CSS.escape(id)}"]`),
      row: (id) => flagsEl.querySelector(`[data-flag-row="${CSS.escape(id)}"]`),
      view,
      phone,
      panel: $("[data-panel]"),
      find: (sel) => view.querySelector(sel),
    },
  };

  if (opts.hash) {
    readHash();
    addEventListener("hashchange", () => readHash() && render());
  }
  render();
  fit();
  return api;
}

export const PHONE = { W: PHONE_W, H: PHONE_H };
