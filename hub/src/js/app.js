// hub/src/js/app.js
//
// Everything the pages need beyond HTML and CSS. Each block is small and
// optional: with scripts off the handbook still reads, top to bottom.

import { createPlayer } from "./stage/player.js";

const BASE = document.body.dataset.base || "/";
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ------------------------------------------------------------------- nav */

const nav = $("[data-nav]");
if (nav) {
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const t = $("[data-nav-toggle]");
  t?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    t.setAttribute("aria-expanded", String(open));
  });
}

/* ---------------------------------------------------------------- reveal */

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
);
$$(".rise, [data-hl]").forEach((el) => io.observe(el));

/* ------------------------------------------------------------------ copy */

document.addEventListener("click", async (ev) => {
  const b = ev.target.closest("[data-copy]");
  if (!b) return;
  try {
    await navigator.clipboard.writeText(b.dataset.copy);
  } catch {
    const ta = Object.assign(document.createElement("textarea"), { value: b.dataset.copy });
    document.body.append(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  const label = $("span", b);
  const was = label?.textContent;
  b.classList.add("done");
  if (label) label.textContent = "Copied";
  setTimeout(() => {
    b.classList.remove("done");
    if (label) label.textContent = was;
  }, 1400);
});

/* ------------------------------------------------------------------ tabs */

$$("[data-tabs]").forEach((root) => {
  const tabs = $$('[role="tab"]', root);
  const select = (tab) => {
    tabs.forEach((x) => {
      const on = x === tab;
      x.setAttribute("aria-selected", String(on));
      x.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(x.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (ev) => {
      if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft") return;
      const next = tabs[(i + (ev.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      select(next);
    });
  });
});

/* ------------------------------------------------------------ role filter */

$$("[data-filter]").forEach((bar) => {
  bar.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-role]");
    if (!b) return;
    const role = b.dataset.role;
    $$("[data-role]", bar).forEach((x) => {
      const on = x === b;
      x.classList.toggle("solid", on);
      x.setAttribute("aria-pressed", String(on));
    });
    $$("[data-roles]").forEach((card) => {
      card.hidden = !(role === "all" || card.dataset.roles.split(" ").includes(role));
    });
    $$("[data-stage-row]").forEach((row) => {
      const cards = $$("[data-roles]", row);
      row.hidden = cards.length > 0 && cards.every((c) => c.hidden);
    });
  });
});

/* ---------------------------------------------------- table of contents */

const toc = $$(".rail-toc a");
if (toc.length) {
  const map = new Map(toc.map((a) => [document.getElementById(a.hash.slice(1)), a]));
  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        toc.forEach((a) => a.classList.remove("on"));
        map.get(e.target)?.classList.add("on");
      }
    },
    { rootMargin: "-20% 0px -65% 0px" }
  );
  for (const el of map.keys()) if (el) spy.observe(el);
}

/* ---------------------------------------------------------------- search */

const cmdk = $("[data-cmdk]");
let index = null;

async function openSearch() {
  if (!cmdk) return;
  if (!index) {
    try {
      index = await (await fetch(`${BASE}hub/search.json`)).json();
    } catch {
      index = [];
    }
  }
  cmdk.className = "cmdk";
  cmdk.hidden = false;
  cmdk.innerHTML = `<div class="cmdk-box" role="dialog" aria-label="Search the handbook">
    <div class="cmdk-in"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg><input type="text" placeholder="Search workflows, guides and issues" aria-label="Search" autocomplete="off" spellcheck="false"><kbd>esc</kbd></div>
    <ul class="cmdk-list"></ul></div>`;
  const input = $("input", cmdk);
  const list = $(".cmdk-list", cmdk);
  let sel = 0;
  let hits = [];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const draw = () => {
    const q = input.value.trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    hits = index
      .map((it) => {
        const hay = `${it.t} ${it.d} ${it.x || ""} ${it.k}`.toLowerCase();
        if (!words.every((w) => hay.includes(w))) return null;
        const score = words.reduce((n, w) => n + (it.t.toLowerCase().includes(w) ? 3 : 1), 0) + (it.k === "Workflow" ? 0.5 : 0);
        return { it, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.it);
    sel = Math.min(sel, Math.max(0, hits.length - 1));
    list.innerHTML = hits.length
      ? hits
          .map(
            (it, i) =>
              `<li><a href="${BASE}${it.p.replace(/^\//, "")}" aria-selected="${i === sel}"><b>${esc(it.t)}</b><span>${esc(it.d)}</span><i>${esc(it.k)}</i></a></li>`
          )
          .join("")
      : `<li class="cmdk-none">Nothing matches. Try a role, a stage or a tool name.</li>`;
  };

  const close = () => {
    cmdk.hidden = true;
    cmdk.innerHTML = "";
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (ev) => {
    if (ev.key === "Escape") close();
    else if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      sel = (sel + (ev.key === "ArrowDown" ? 1 : hits.length - 1)) % Math.max(1, hits.length);
      draw();
    } else if (ev.key === "Enter" && hits[sel]) {
      location.href = `${BASE}${hits[sel].p.replace(/^\//, "")}`;
    }
  };
  input.addEventListener("input", () => {
    sel = 0;
    draw();
  });
  cmdk.addEventListener("click", (ev) => {
    if (ev.target === cmdk) close();
  });
  document.addEventListener("keydown", onKey);
  draw();
  input.focus();
}

$$("[data-cmdk-open]").forEach((b) => b.addEventListener("click", openSearch));
document.addEventListener("keydown", (ev) => {
  if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
    ev.preventDefault();
    if (cmdk?.hidden) openSearch();
  }
});

/* ---------------------------------------------------------------- stages */

// A static map so the bundler can split each demo into its own file.
const DEMOS = {
  "flagged-prototype": () => import("./demos/flagged-prototype.js"),
  "decision-prd": () => import("./demos/decision-prd.js"),
  "journey-teardown": () => import("./demos/journey-teardown.js"),
  "interview-synthesis": () => import("./demos/interview-synthesis.js"),
  "experiment-readout": () => import("./demos/experiment-readout.js"),
  premortem: () => import("./demos/premortem.js"),
};

async function mountStage(stage) {
  const load = DEMOS[stage.dataset.demo];
  const body = $("[data-stage-body]", stage);
  if (!load || !body || stage.dataset.mounted) return;
  stage.dataset.mounted = "1";
  // Layout follows the stage's own width, not the window's. A clip page pins it.
  if (!stage.dataset.layout) {
    const size = () => (stage.dataset.layout = stage.clientWidth < 760 ? "narrow" : "wide");
    size();
    new ResizeObserver(size).observe(stage);
  }
  try {
    const mod = await load();
    body.innerHTML = "";
    const demo = await mod.mount(body, { base: BASE, stage });
    createPlayer(stage, demo);
    stage.classList.add("is-ready");
  } catch (err) {
    console.error("demo failed to load", err);
    stage.classList.add("is-error");
  }
}

const stages = $$("[data-stage]");
if (stages.length) {
  const near = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          near.unobserve(e.target);
          mountStage(e.target);
        }
      }
    },
    { rootMargin: "600px 0px" }
  );
  stages.forEach((s) => near.observe(s));
}
