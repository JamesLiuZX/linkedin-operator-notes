// hub/src/js/demos/decision-prd.js
//
// The replay for the decision-ready PRD: three pieces of research are read,
// then the document assembles point by point with its evidence beside it.

import { createTimeline, ease } from "../stage/timeline.js";
import { buildRun } from "../stage/run.js";
import { createPaper } from "../stage/paper.js";
import { mountPrd } from "../artifacts/prd.js";

export function mount(body, { base = "/", stage, data, ask, caseId = "tangelo", checks } = {}) {
  body.innerHTML = `
    <div class="demo demo-doc">
      <div class="run" data-run></div>
      <div class="art" data-art></div>
      <div class="fly-layer" data-fly></div>
    </div>`;
  const tl = createTimeline();
  // Drawn narrower where the stage is small, so the text stays readable.
  const width = stage?.closest(".clip") ? 640 : (stage?.clientWidth || 1200) < 760 ? 440 : 1000;
  const paper = createPaper(body.querySelector("[data-art]"), { width, maxZoom: stage?.closest(".clip") ? 2 : 1 });
  mountPrd(paper.doc, data);
  paper.wireLinks(`${base}examples/${caseId}/`);
  const $ = (sel) => paper.doc.querySelector(sel);
  const $$ = (sel, root = paper.doc) => [...root.querySelectorAll(sel)];

  const points = $$("[data-point]");
  const sources = (data.sources || []).slice(0, 3);

  buildRun(tl, body.querySelector("[data-run]"), {
    ask: ask || "Write the PRD from the teardown, the synthesis and the pre-mortem.",
    steps: [
      ...sources.map((src, i) => ({ title: `Read the ${src.label.split(" on ")[0].toLowerCase()}`, detail: src.detail || "", at: 3.0 + i * 0.65, dur: 0.55 })),
      { title: `Wrote ${points.length} points`, detail: "Problem first, evidence beside it", at: 5.1, dur: 11.6 },
      { title: "Ordered the rollout", detail: "3 steps, each with a reason", at: 16.9, dur: 2.0 },
      { title: "Checked its own work", detail: "One number per point, used everywhere", at: 19.2, dur: 0.9 },
    ],
    receipt: checks ? `${checks} checks passed` : "",
    receiptAt: 20.2,
  });

  tl.chapter("Read", 0);
  tl.chapter("Write", 5.1);
  tl.chapter("Prioritise", 16.9);
  tl.chapter("Check", 19.2);

  // The page arrives, then the top of the document fills in.
  tl.land(paper.el, 4.4, { dur: 1.2 });
  tl.show($('[data-part="hero"]'), 5.1, { dur: 0.55 });
  $$("[data-sum]").forEach((el, i) => tl.show(el, 5.7 + i * 0.12, { dur: 0.45 }));
  tl.show($('[data-part="src"]'), 6.2, { dur: 0.4, y: 4 });
  // What it read becomes what it cites: each source travels from the run log to the page.
  const layer = body.querySelector("[data-fly]");
  const stepEls = [...body.querySelectorAll("[data-step]")];
  sources.forEach((src, i) => {
    tl.fly(layer, { from: () => stepEls[i]?.querySelector("b"), to: () => $('[data-part="src"]'), at: 5.45 + i * 0.16, dur: 0.75, className: i === 0 ? "c" : i === 1 ? "" : "ink" });
  });

  const stops = [];
  let t = 6.9;
  const seen = new Set();
  points.forEach((el) => {
    const sec = el.closest(".prd-sec");
    const head = sec.querySelector("[data-part^='sec-']");
    const first = !seen.has(sec);
    seen.add(sec);
    // Bring the section heading in with its first point.
    stops.push({ at: t, to: () => (first ? head : el), dur: 0.8, offset: 48 });
    if (first) tl.show(head, t + 0.25, { dur: 0.45 });
    tl.show(el, t + 0.4, { dur: 0.5, y: 14 });
    tl.pop(el.querySelector(".aid"), t + 0.5, { dur: 0.6, from: 0.3 });
    // The evidence is dealt onto the page like cards.
    $$("[data-fig]", el).forEach((fig, i) => {
      const at = t + 0.72 + i * 0.16;
      tl.to(fig, { opacity: [0, 1] }, { at, dur: 0.22, ease: ease.out });
      tl.to(fig, { ry: [-38, 0], y: [18, 0], scale: [0.9, 1] }, { at, dur: 0.6, ease: ease.outQuint });
    });
    const know = el.querySelector(".prd-know");
    if (know) tl.show(know, t + 1.15, { dur: 0.4, y: 6 });
    t += 1.62;
  });

  const priority = $('[data-part="priority"]');
  const rollout = $('[data-part="rollout"]');
  stops.push({ at: 16.9, to: () => priority, dur: 0.9, offset: 44 });
  tl.show(priority.querySelector(".prd-sec-head"), 17.1, { dur: 0.4 });
  tl.show(priority.querySelector(".prd-tw"), 17.2, { dur: 0.4 });
  $$("[data-row]", priority).forEach((row, i) => tl.show(row, 17.35 + i * 0.09, { dur: 0.35, y: 6 }));
  stops.push({ at: 18.2, to: () => rollout, dur: 0.8, offset: 44 });
  tl.show(rollout.querySelector(".prd-sec-head"), 18.4, { dur: 0.4 });
  tl.show(rollout.querySelector(".prd-tw"), 18.5, { dur: 0.4 });
  $$("[data-row]", rollout).forEach((row, i) => tl.show(row, 18.6 + i * 0.12, { dur: 0.35, y: 6 }));
  const next = rollout.querySelector(".prd-next");
  if (next) tl.show(next, 19.0, { dur: 0.4 });
  tl.show($(".prd-foot"), 19.2, { dur: 0.3, y: 0 });

  // Finish back at the top, so the reader starts where a reviewer would.
  stops.push({ at: 20.3, to: 0, dur: 1.1 });
  paper.follow(tl, stops);
  tl.end(22);

  return {
    timeline: tl,
    hint: "Scroll it. Every screen opens",
    destroy() {
      paper.destroy();
    },
  };
}
