// hub/src/js/demos/premortem.js
//
// The replay for the pre-mortem: the plan is assumed to have failed, the
// failure stories land on a likelihood and impact map, each is weighed against
// the research, and the worst five get a tripwire with a date.

import { createTimeline, ease } from "../stage/timeline.js";
import { buildRun } from "../stage/run.js";
import { createPaper } from "../stage/paper.js";
import { mountPremortem } from "../artifacts/premortem.js";

export function mount(body, { stage, data, ask, checks } = {}) {
  body.innerHTML = `
    <div class="demo demo-doc demo-premortem">
      <div class="run" data-run></div>
      <div class="art" data-art></div>
    </div>`;
  const tl = createTimeline();
  const width = stage?.closest(".clip") ? 680 : (stage?.clientWidth || 1200) < 760 ? 450 : 960;
  const paper = createPaper(body.querySelector("[data-art]"), { width, maxZoom: stage?.closest(".clip") ? 2 : 1 });
  mountPremortem(paper.doc, data);
  paper.wireLinks("");
  const $ = (sel, root = paper.doc) => root.querySelector(sel);
  const $$ = (sel, root = paper.doc) => [...root.querySelectorAll(sel)];

  const risks = data.risks;
  const top = data.top;
  const guesses = risks.filter((r) => r.evidence.status === "unknown").length;
  const areas = new Set(risks.map((r) => r.area)).size;

  buildRun(tl, body.querySelector("[data-run]"), {
    ask: ask || "Run a pre-mortem on this plan before we commit to it.",
    steps: [
      { title: "Read the plan", detail: "plan.md, and the research it cites", at: 2.3, dur: 0.7 },
      { title: "Assumed it failed", detail: "Six months after launch", at: 3.1, dur: 1.0 },
      { title: "Wrote the failure stories", detail: `${risks.length} stories across ${areas} areas`, at: 4.3, dur: 4.3 },
      { title: "Weighed each against the research", detail: `${risks.length - guesses} with evidence · ${guesses} guesses`, at: 8.8, dur: 2.6 },
      { title: "Set the tripwires", detail: `The worst ${top.length}: a metric, a line, a date, a name`, at: 11.6, dur: 5.2 },
      { title: "Checked its own work", detail: `${top.length} dates for a calendar, ${guesses} marked as guesses`, at: 17.2, dur: 0.9 },
    ],
    receipt: checks ? `${checks} checks passed` : "",
    receiptAt: 18.2,
  });

  tl.chapter("Assume it failed", 0);
  tl.chapter("Stories", 4.3);
  tl.chapter("Evidence", 8.8);
  tl.chapter("Tripwires", 11.6);
  tl.chapter("Check", 17.2);

  // The plan, then the date it is imagined to have failed by.
  tl.land(paper.el, 2.0, { dur: 1.2 });
  tl.show($(".pm-head h1"), 2.4, { dur: 0.5, y: 8 });
  tl.show($(".pm-plan"), 2.7, { dur: 0.5, y: 10 });
  tl.show($(".pm-premise"), 3.2, { dur: 0.5, y: 6 });
  tl.pop($(".pm-premise mark"), 3.5, { dur: 0.6, from: 0.5 });

  // The map fills one story at a time. Nothing is ranked yet, so every chip is plain.
  const matrix = $('[data-part="matrix"]');
  const side = $(".pm-side");
  tl.show(matrix, 4.3, { dur: 0.5, y: 14 });
  tl.show(side, 4.5, { dur: 0.5, y: 14 });
  tl.cls(matrix, "unranked", 0, true);
  tl.cls(matrix, "unranked", 11.7, false);
  risks.forEach((r, i) => {
    const chip = $(`[data-chip="${r.id}"]`);
    const at = 4.8 + i * 0.3;
    tl.pop(chip, at, { dur: 0.55, from: 0.2 });
    if (top.includes(r.id)) tl.to(chip, { scale: [1, 1.25] }, { at: 11.7 + top.indexOf(r.id) * 0.12, dur: 0.18 }).to(chip, { scale: 1 }, { at: 11.9 + top.indexOf(r.id) * 0.12, dur: 0.3 });
  });
  const tally = $$(".pm-tally > div");
  tl.count($("b", tally[0]), 0, risks.length, { at: 4.8, dur: risks.length * 0.3 });
  $$(".pm-areas > div").forEach((row, i) => tl.show(row, 5.2 + i * 0.45, { dur: 0.35, y: 0 }));

  // Evidence: which stories the research speaks to, and which are guesses.
  tl.show(tally[2], 9.0, { dur: 0.4, y: 6 });
  tl.count($("b", tally[2]), 0, guesses, { at: 9.1, dur: 0.8 });
  const inputs = $(".pm-inputs");
  if (inputs) tl.show(inputs, 9.6, { dur: 0.4, y: 6 });

  // Tripwires: the worst five are marked, then the first is read in full.
  tl.show(tally[1], 11.7, { dur: 0.4, y: 6 });
  tl.count($("b", tally[1]), 0, top.length, { at: 11.8, dur: 0.6 });

  const firstRisk = $(`[data-risk="${top[0]}"]`);
  tl.show($(".pm-top h3"), 12.5, { dur: 0.3, y: 0 });
  tl.show(firstRisk, 12.6, { dur: 0.5, y: 14 });
  tl.show($(".pm-story", firstRisk), 13.0, { dur: 0.45, y: 6 });
  tl.show($(".pm-ev", firstRisk), 13.4, { dur: 0.45, y: 6 });
  const wire = $("[data-wire]", firstRisk);
  tl.show(wire, 13.9, { dur: 0.45, y: 8 });
  $$(".pm-wire-grid > div", wire).forEach((cell, i) => tl.show(cell, 14.2 + i * 0.28, { dur: 0.35, y: 6 }));
  const doIt = $(".pm-do", firstRisk);
  if (doIt) tl.show(doIt, 15.3, { dur: 0.4, y: 6 });

  // The other top risks are already written. The camera goes to the dates.
  $$(".pm-risk").forEach((el) => {
    if (el !== firstRisk) tl.show(el, 15.4, { dur: 0.3, y: 0 });
  });
  const cal = $('[data-part="calendar"]');
  if (cal) {
    tl.show($("h3", cal), 15.9, { dur: 0.3, y: 0 });
    $$("li", cal).forEach((li, i) => tl.show(li, 16.0 + i * 0.16, { dur: 0.4, y: 12 }));
  }
  const rest = $('[data-part="rest"]');
  if (rest) tl.show(rest, 16.8, { dur: 0.4, y: 0 });
  const foot = $(".pm-foot");
  if (foot) tl.show(foot, 16.8, { dur: 0.4, y: 0 });

  // The camera: in on the map while it fills, in on the first tripwire while it is set.
  paper.camera(tl, [
    { at: 4.9, to: () => matrix, zoom: 1.18, dur: 1.0, anchor: 0.42 },
    { at: 8.4, to: null, dur: 0.8 },
    { at: 13.9, to: () => wire, zoom: 1.2, dur: 0.9 },
    { at: 15.4, to: null, dur: 0.7 },
  ]);

  const fits = (el) => el.getBoundingClientRect().height + 60 <= paper.scroll.clientHeight;
  paper.follow(tl, [
    { at: 4.2, to: () => matrix, dur: 0.9, offset: 20 },
    { at: 12.4, to: () => firstRisk, dur: 0.9, offset: 44 },
    // Stay on the whole card when it fits. Follow the tripwire down only when the frame is short.
    { at: 13.8, to: () => (fits(firstRisk) ? paper.topOf(firstRisk) - 44 : paper.topOf(wire) - 150), dur: 0.8 },
    { at: 15.6, to: () => cal || firstRisk, dur: 1.0, offset: 60 },
    { at: 18.0, to: () => matrix, dur: 1.1, offset: 20 },
  ]);
  tl.end(20.4);

  return {
    timeline: tl,
    hint: "Open any risk to read its story",
    destroy() {
      paper.destroy();
    },
  };
}
