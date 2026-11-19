// hub/src/js/demos/journey-teardown.js
//
// The replay for the journey teardown: the board is laid out stage by stage,
// the camera goes in close while the notes land on two lanes, pulls back for
// the scores, crosses to the synthesis and ends on the whole board. When it
// ends, the board is yours to drag, zoom and filter.

import { createTimeline, ease } from "../stage/timeline.js";
import { buildRun } from "../stage/run.js";
import { mountBoard } from "../artifacts/board.js";

export function mount(body, { data, ask } = {}) {
  body.innerHTML = `
    <div class="demo demo-board">
      <div class="run" data-run></div>
      <div class="art" data-art><div class="demo-board-host" data-host></div></div>
    </div>`;
  const tl = createTimeline();
  const board = mountBoard(body.querySelector("[data-host]"), data, { interactive: false });
  const world = board.world;
  const $ = (sel, root = world) => root.querySelector(sel);
  const $$ = (sel, root = world) => [...root.querySelectorAll(sel)];

  const stages = data.stages;
  const s1 = stages[0];
  const us = data.us;
  const firstApp = s1.lanes[0].app;
  const patterns = stages.reduce((n, s) => n + (s.synthesis?.patterns || []).length, 0);
  const gaps = stages.reduce((n, s) => n + (s.synthesis?.gaps || []).length, 0);
  const { lanes, screens, notes } = board.counts;

  buildRun(tl, body.querySelector("[data-run]"), {
    ask: ask || "Tear down how these apps handle this journey.",
    steps: [
      { title: "Laid out the lanes", detail: `${data.apps.length} apps × ${stages.length} stages = ${lanes} lanes`, at: 2.4, dur: 2.0 },
      { title: "Annotated every screen", detail: `${screens} screens · ${notes} notes`, at: 4.6, dur: 5.2 },
      { title: "Scored each lane", detail: `${data.dimensions.length} dimensions, a reason for each score`, at: 10.0, dur: 3.0 },
      { title: "Synthesised each stage", detail: `${patterns} patterns · ${gaps} gaps`, at: 13.3, dur: 3.5 },
      { title: "Drew out the principles", detail: `${(data.principles || []).length} that hold across every stage`, at: 17.0, dur: 1.7 },
      { title: "Checked its own work", detail: "6 of 6 checks passed", at: 19.0, dur: 0.9 },
    ],
    foot: "<b>By stage, not by competitor.</b> Your product is always the last lane, under the best example.",
    footAt: 20.1,
  });

  tl.chapter("Lay out", 0);
  tl.chapter("Annotate", 4.6);
  tl.chapter("Score", 10.0);
  tl.chapter("Synthesise", 13.3);
  tl.chapter("The board", 19.0);

  const lane = (stage, app) => $(`[data-lane="${stage}-${app}"]`);
  const shots = (stage, app) => $(".lane-shots", lane(stage, app));
  const closeA = lane(s1.id, firstApp);
  const closeB = lane(s1.id, us);

  // 1. Frames, lanes and screens arrive, a stage at a time.
  tl.show($('[data-frame="start"]'), 2.4, { dur: 0.5, y: 20 });
  tl.show($('[data-frame="score"]'), 2.55, { dur: 0.5, y: 20 });
  stages.forEach((st, i) => {
    const at = 2.7 + i * 0.32;
    tl.show($(`[data-frame="${st.id}"]`), at, { dur: 0.5, y: 24 });
    $$(`[data-frame="${st.id}"] [data-lane]`).forEach((el, k) => {
      tl.show(el, at + 0.15 + k * 0.09, { dur: 0.4, y: 14 });
      $$("[data-shot] .shot-pic", el).forEach((pic, j) => tl.show(pic, at + 0.3 + k * 0.09 + j * 0.08, { dur: 0.4, y: 0, scale: 0.92 }));
    });
  });

  // 2. Notes land on the best example, then on our own lane. The rest follow off camera.
  const noteIn = (el, at) => tl.show(el, at, { dur: 0.32, y: 8, scale: 0.94 });
  $$("[data-note]", closeA).forEach((el, k) => noteIn(el, 5.7 + k * 0.3));
  $$("[data-note]", closeB).forEach((el, k) => noteIn(el, 8.2 + k * 0.27));
  $$("[data-note]").forEach((el) => {
    if (!closeA.contains(el) && !closeB.contains(el)) tl.show(el, 9.7, { dur: 0.3, y: 0 });
  });

  // 3. Scores: our lane first, bar by bar, then everyone.
  const score = (el, at, step) => {
    const overall = $("[data-overall]", el);
    const value = Number($("b", overall).textContent) || 0;
    tl.show(overall, at, { dur: 0.35, y: 6 });
    tl.count($("b", overall), 0, value, { at, dur: step ? 1.0 : 0.5, fmt: (v) => v.toFixed(1) });
    $$("[data-bar]", el).forEach((bar, k) => {
      const em = $("em", bar);
      const n = Number(em.style.getPropertyValue("--n")) || 0;
      tl.show(bar, at + k * step, { dur: 0.3, y: 0 });
      tl.to(em, { "--n": [0, n] }, { at: at + k * step, dur: 0.45, ease: ease.out });
    });
    tl.show($("[data-verdict]", el), at + (step ? 1.0 : 0.25), { dur: 0.45, y: 8 });
  };
  score(closeB, 10.7, 0.16);
  $$("[data-lane]").forEach((el, k) => {
    if (el !== closeB) score(el, 12.1 + (k % 4) * 0.08, 0);
  });
  $$("[data-cell]").forEach((el, k) => tl.show(el, 12.4 + k * 0.04, { dur: 0.3, y: 0, scale: 0.7 }));

  // 4. The synthesis for the first stage, block by block.
  const syn = $(`[data-frame="${s1.id}-syn"]`);
  const blocks = $$("[data-syn]", syn);
  tl.show(syn, 13.3, { dur: 0.5, y: 24 });
  blocks.forEach((el, k) => tl.show(el, 13.8 + k * 0.42, { dur: 0.4, y: 10 }));
  $$(".bf-syn").forEach((el) => {
    if (el !== syn) tl.show(el, 16.7, { dur: 0.4, y: 0 });
  });

  // 5. What holds across every stage.
  const ideal = $('[data-frame="ideal"]');
  if (ideal) {
    tl.show(ideal, 17.0, { dur: 0.5, y: 24 });
    $$("[data-principle]", ideal).forEach((el, k) => tl.show(el, 17.6 + k * 0.2, { dur: 0.4, y: 10 }));
  }

  board.follow(tl, [
    { at: 0, to: "all", mode: "fit", pad: 18 },
    { at: 4.5, to: () => shots(s1.id, firstApp), mode: "fit", pad: 26, dur: 1.2 },
    { at: 7.2, to: () => shots(s1.id, us), mode: "fit", pad: 26, dur: 1.0 },
    { at: 9.9, to: () => closeB, mode: "fit", pad: 18, dur: 1.0 },
    { at: 11.9, to: s1.id, mode: "fit", pad: 18, dur: 1.1 },
    { at: 13.2, to: `${s1.id}-syn`, mode: "top", pad: 22, dur: 1.2 },
    { at: 15.0, to: () => blocks[blocks.length - 1] || syn, mode: "top", pad: 22, dur: 1.7 },
    { at: 16.9, to: () => ideal || syn, mode: "fit", pad: 22, dur: 1.2 },
    { at: 19.0, to: "all", mode: "fit", pad: 18, dur: 1.5 },
  ]);
  tl.end(21.6);

  return {
    timeline: tl,
    live() {
      board.setInteractive(true);
    },
    unlive() {
      board.setInteractive(false);
      tl.invalidate();
    },
  };
}
