// hub/src/js/demos/interview-synthesis.js
//
// The replay for the interview synthesis: a theme is counted person by person,
// its quotes are pulled, and then a script looks for every quote in the
// transcripts. One is not there. When the replay ends, open any quote yourself.

import { createTimeline, ease } from "../stage/timeline.js";
import { createCursor } from "../stage/cursor.js";
import { buildRun } from "../stage/run.js";
import { createPaper } from "../stage/paper.js";
import { mountSynthesis } from "../artifacts/synthesis.js";

export function mount(body, { stage, data, ask } = {}) {
  body.innerHTML = `
    <div class="demo demo-doc demo-synthesis">
      <div class="run" data-run></div>
      <div class="art" data-art></div>
    </div>`;
  const art = body.querySelector("[data-art]");
  const tl = createTimeline();
  const width = stage?.closest(".clip") ? 660 : (stage?.clientWidth || 1200) < 760 ? 440 : 940;
  const paper = createPaper(art, { width, maxZoom: stage?.closest(".clip") ? 2 : 1 });
  const page = mountSynthesis(paper.doc, data);
  paper.wireLinks("");
  const $ = (sel, root = paper.doc) => root.querySelector(sel);
  const $$ = (sel, root = paper.doc) => [...root.querySelectorAll(sel)];

  const people = data.participants.length;
  const themes = data.themes.length;
  const found = data.checked.found;
  const rejected = data.checked.rejected;
  const first = data.themes[0];

  buildRun(tl, body.querySelector("[data-run]"), {
    ask: ask || "Synthesise these interviews. Verify every quote.",
    steps: [
      { title: `Read ${people} transcripts`, detail: `P1.txt to P${people}.txt, line by line`, at: 2.4, dur: 1.5 },
      { title: "Named the themes", detail: `${themes} themes, each counted by person`, at: 4.1, dur: 2.1 },
      { title: "Pulled the quotes", detail: `${found + rejected} quotes, one or more per supporter`, at: 6.4, dur: 2.6 },
      { title: "Ran the quote check", detail: "verify_quotes.py looks for every line", at: 9.2, dur: 5.0 },
      { title: rejected ? `Removed ${rejected} ${rejected === 1 ? "quote" : "quotes"}` : "Every quote was found", detail: rejected ? "Not in any transcript" : "Nothing had to be removed", at: 14.4, dur: 1.3, bad: rejected > 0 },
      { title: "Checked its own work", detail: "5 of 5 checks passed", at: 17.6, dur: 0.9 },
    ],
    foot: `<b>${found} quotes, ${found} line numbers.</b> Open any of them to read it in place.`,
    footAt: 18.7,
  });

  tl.chapter("Read", 0);
  tl.chapter("Themes", 4.1);
  tl.chapter("Quotes", 6.4);
  tl.chapter("Verify", 9.2);
  tl.chapter("Result", 15.9);

  // The page, and the eight people on it.
  tl.show(paper.scroll.parentElement, 2.2, { dur: 0.6, y: 18 });
  tl.show($(".sy-head h1"), 2.5, { dur: 0.5, y: 8 });
  tl.show($(".sy-q"), 2.7, { dur: 0.5, y: 6 });
  $$(".sy-person").forEach((el, i) => tl.show(el, 2.9 + i * 0.13, { dur: 0.4, y: 10 }));

  // The receipt at the top stays empty until the check has run.
  const proof = $('[data-part="proof"]');
  tl.show(proof, 16.5, { dur: 0.45, y: 6 });
  tl.count($("[data-found]"), 0, found, { at: 16.6, dur: 0.8 });
  const miss = $(".sy-proof-x");
  if (miss) tl.show(miss, 17.2, { dur: 0.35, y: 0, scale: 0.9 });

  // The first theme, counted one person at a time.
  const t1 = $(`[data-theme="${first.id}"]`);
  tl.show($(".sy-themes h3"), 4.3, { dur: 0.3, y: 0 });
  tl.show(t1, 4.4, { dur: 0.5, y: 14 });
  tl.to($(".aid", t1), { scale: [0.4, 1] }, { at: 4.6, dur: 0.5, ease: ease.back });
  tl.count($("[data-count] b", t1), 0, first.support.length, { at: 4.9, dur: 0.9 });
  $$(".sy-dots i", t1).forEach((dot, i) => tl.show(dot, 4.9 + i * 0.1, { dur: 0.3, y: 0, scale: 0.5 }));
  tl.show($(".sy-sum", t1), 5.7, { dur: 0.45, y: 6 });

  // Its quotes, the exception, and what it means.
  const quotes = $$(".sy-quotes > .sy-quote:not(.extra)", t1);
  quotes.forEach((q, i) => tl.show(q, 6.6 + i * 0.6, { dur: 0.45, y: 10 }));
  const more = $("[data-more]", t1);
  if (more) tl.show(more, 7.7, { dur: 0.3, y: 0 });
  const counter = $(".sy-counter", t1);
  if (counter) tl.show(counter, 8.0, { dur: 0.45, y: 8 });
  const so = $(".sy-so", t1);
  if (so) tl.show(so, 8.5, { dur: 0.45, y: 8 });

  // The check: each quote gets the line it was found on.
  const pills = $$(".sy-where", t1);
  pills.forEach((pill, i) => {
    tl.show(pill, 9.5 + i * 0.32, { dur: 0.3, y: 0, scale: 0.7 });
  });

  // Open the first quote in its transcript.
  const cursor = createCursor(tl, art);
  const key = `${first.id}-0`;
  const tap = cursor.to(() => $(`[data-quote="${key}"] [data-ctx]`), 10.6, { dur: 0.8 });
  tl.key("ctx", null, 0);
  tl.key("ctx", key, tap);
  tl.key("ctx", null, 13.0);
  cursor.hide(12.2);
  $$(`[data-quote="${key}"] .sy-line`).forEach((line, i) => tl.show(line, tap + 0.1 + i * 0.09, { dur: 0.3, y: 4 }));

  // Everything below the first theme is already written: the camera passes over it.
  $$(".sy-theme").forEach((el) => {
    if (el !== t1) tl.show(el, 12.6, { dur: 0.4, y: 0 });
  });
  tl.show($(".sy-grid"), 12.6, { dur: 0.4, y: 0 });

  // The quote that was not there.
  const out = $('[data-part="rejected"]');
  if (out) {
    tl.show(out, 14.2, { dur: 0.5, y: 12 });
    tl.to($("blockquote", out), { "--strike": [0, 1] }, { at: 14.9, dur: 0.5, ease: ease.out });
    tl.show($("[data-reject] p", out), 15.2, { dur: 0.4, y: 4 });
  }

  paper.follow(tl, [
    { at: 4.1, to: () => t1, dur: 0.9, offset: 56 },
    { at: 6.4, to: () => $(".sy-sum", t1), dur: 0.8, offset: 24 },
    { at: 13.0, to: () => out || t1, dur: 1.5, offset: 120 },
    { at: 15.9, to: 0, dur: 1.1 },
  ]);
  tl.end(20.4);

  tl.on((s) => {
    page.closeAll();
    if (s.ctx) page.context(s.ctx, true);
  });

  return {
    timeline: tl,
    unlive() {
      page.closeAll();
      tl.invalidate();
    },
  };
}
