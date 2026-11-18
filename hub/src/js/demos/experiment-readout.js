// hub/src/js/demos/experiment-readout.js
//
// The replay for the experiment readout: the counts go to a script, the test
// itself is checked before anyone looks at the result, and the decision is the
// last thing to appear. When it ends, the counts are yours to change.

import data from "../../../../skills/experiment-readout/examples/tangelo/readout.json";
import { createTimeline, ease } from "../stage/timeline.js";
import { buildRun } from "../stage/run.js";
import { createPaper } from "../stage/paper.js";
import { mountReadout } from "../artifacts/readout.js";

export function mount(body, { stage } = {}) {
  body.innerHTML = `
    <div class="demo demo-doc demo-readout">
      <div class="run" data-run></div>
      <div class="art" data-art></div>
    </div>`;
  const tl = createTimeline();
  const width = stage?.closest(".clip") ? 700 : (stage?.clientWidth || 1200) < 760 ? 460 : 980;
  const paper = createPaper(body.querySelector("[data-art]"), { width });

  // Two copies: one the timeline animates, one the reader edits afterwards.
  const replay = document.createElement("div");
  const live = document.createElement("div");
  live.hidden = true;
  paper.doc.append(replay, live);
  mountReadout(replay, data);
  const editable = mountReadout(live, data, { interactive: true });

  const $ = (sel) => replay.querySelector(sel);
  const $$ = (sel, root = replay) => [...root.querySelectorAll(sel)];
  const n = data.numbers;
  const users = n.input.arms[0].users + n.input.arms[1].users;
  const guards = n.guardrails;
  const unclear = guards.filter((g) => g.verdict !== "held").length;

  buildRun(tl, body.querySelector("[data-run]"), {
    ask: "Read out the reorder card test. Should we ship?",
    steps: [
      { title: "Wrote the counts down", detail: `results.json · ${users.toLocaleString("en-US")} customers`, at: 2.5, dur: 0.6 },
      { title: "Ran the script", detail: "ab_stats.py does the arithmetic", at: 3.2, dur: 0.7 },
      { title: "Checked the test first", detail: "The split, the duration, the power", at: 4.1, dur: 3.5 },
      { title: "Read the result", detail: "+1.7 points, interval 0.8 to 2.6", at: 7.8, dur: 3.0 },
      { title: "Read the guardrails", detail: `${guards.length - unclear} held · ${unclear} not settled`, at: 11.0, dur: 3.6, bad: unclear > 0 },
      { title: "Applied the fixed rule", detail: n.verdict.rule.split(":")[0], at: 14.8, dur: 1.5 },
      { title: "Checked its own work", detail: "6 of 6 checks passed", at: 16.8, dur: 0.9 },
    ],
    foot: "<b>The script decides.</b> The model only explains what it found.",
    footAt: 17.9,
  });

  tl.chapter("Counts", 0);
  tl.chapter("Check the test", 4.1);
  tl.chapter("Result", 7.8);
  tl.chapter("Guardrails", 11.0);
  tl.chapter("Decide", 14.8);

  // The verdict card waits, visibly, until everything under it has been read.
  const verdict = $('[data-part="verdict"]');
  const pending = document.createElement("div");
  pending.className = "ro-pending";
  pending.innerHTML = "<b>No decision yet</b><span>The test is checked before the result is read.</span>";
  verdict.appendChild(pending);

  tl.show(paper.scroll.parentElement, 3.3, { dur: 0.6, y: 18 });
  tl.show($(".ro-ey"), 3.6, { dur: 0.4 });
  tl.show(verdict, 3.7, { dur: 0.5, y: 10 });
  tl.show($(".ro-word"), 15.2, { dur: 0.5, scale: 0.86 });
  tl.show($(".ro-why"), 15.5, { dur: 0.5, y: 8 });
  tl.hide(pending, 15.0, { dur: 0.25 });

  // 1. The three checks on the test itself.
  $$("[data-check]").forEach((el, i) => {
    const at = 4.3 + i * 1.05;
    tl.show(el, at, { dur: 0.45, y: 12 });
    tl.to(el.querySelector("b"), { scale: [0.7, 1] }, { at: at + 0.3, dur: 0.45, ease: ease.back });
  });

  // 2. The main metric: the rates, then the difference, then how sure.
  const main = $('[data-part="primary"]');
  tl.show(main, 7.8, { dur: 0.5, y: 14 });
  tl.show(main.querySelector(".ro-rates"), 8.2, { dur: 0.45, y: 6 });
  tl.show(main.querySelector(".ro-big"), 8.7, { dur: 0.4 });
  tl.count(main.querySelector("[data-diff]"), 0, n.primary.diff * 100, { at: 8.7, dur: 1.0, fmt: (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)}` });
  tl.show(main.querySelector(".forest"), 9.3, { dur: 0.4 });
  tl.to(main.querySelector("[data-ci]"), { "--grow": [0, 1] }, { at: 9.6, dur: 0.8, ease: ease.out });
  tl.show(main.querySelector("[data-dot]"), 9.5, { dur: 0.3, y: 0, scale: 0.4 });
  tl.show(main.querySelector(".atag"), 10.3, { dur: 0.35, y: 0, scale: 0.8 });

  // 3. The guardrails, one at a time.
  const guardBox = $('[data-part="guardrails"]');
  tl.show(guardBox, 11.0, { dur: 0.5, y: 14 });
  $$("[data-guard]").forEach((el, i) => {
    const at = 11.3 + i * 0.95;
    tl.show(el, at, { dur: 0.4, y: 8 });
    tl.to(el.querySelector("[data-ci]"), { "--grow": [0, 1] }, { at: at + 0.2, dur: 0.6, ease: ease.out });
    tl.show(el.querySelector(".atag"), at + 0.65, { dur: 0.3, y: 0, scale: 0.8 });
    if (guards[i].verdict !== "held") tl.to(el, { "--flag": [0, 1] }, { at: at + 0.7, dur: 0.5 });
  });
  tl.show(guardBox.querySelector(".ro-fine"), 14.0, { dur: 0.4, y: 0 });

  // 4. The words, and everything behind them.
  tl.show($('[data-part="text"]'), 16.2, { dur: 0.5, y: 10 });
  const rest = $(".ro-numbers");
  if (rest) tl.show(rest, 16.6, { dur: 0.4, y: 0 });

  const both = () => paper.topOf(guardBox) + guardBox.getBoundingClientRect().height - paper.topOf(main) + 40 <= paper.scroll.clientHeight;
  paper.follow(tl, [
    { at: 7.6, to: () => main, dur: 0.9, offset: 20 },
    // Keep the main metric above the guardrails when both fit in the frame.
    { at: 10.9, to: () => paper.topOf(both() ? main : guardBox) - 20, dur: 0.9 },
    { at: 14.6, to: 0, dur: 1.0 },
  ]);
  tl.end(19.6);

  return {
    timeline: tl,
    live() {
      // From here the scenarios and the counts are the reader's.
      replay.hidden = true;
      live.hidden = false;
      paper.scroll.scrollTop = 0;
    },
    unlive() {
      editable.scenario("tangelo");
      live.hidden = true;
      replay.hidden = false;
      tl.invalidate();
    },
  };
}
