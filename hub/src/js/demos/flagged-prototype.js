// hub/src/js/demos/flagged-prototype.js
//
// The replay for the flagged prototype: the agent reads the PRD, draws the app
// as it is today, wires one switch per PRD point, and then a hand turns the
// switches on one by one. When it ends, the switches are yours.

import { createTimeline } from "../stage/timeline.js";
import { createCursor } from "../stage/cursor.js";
import { buildRun } from "../stage/run.js";
import { createPrototype } from "../artifacts/prototype.js";

export function mount(body, { stage, data: spec, ask } = {}) {
  body.innerHTML = `
    <div class="demo demo-proto">
      <div class="run" data-run></div>
      <div class="art" data-art><div class="demo-proto-host" data-host></div></div>
    </div>`;
  const art = body.querySelector("[data-art]");
  const host = body.querySelector("[data-host]");

  const tl = createTimeline();
  const proto = createPrototype(host, spec, { follow: false, instant: true, maxScale: stage?.closest(".clip") ? 1.9 : 1.25 });

  buildRun(tl, body.querySelector("[data-run]"), {
    ask: ask || "Build the prototype for this PRD. One switch per point, off by default.",
    steps: [
      { title: "Read the PRD", detail: "prd.json · 6 points in 3 sections", at: 2.7, dur: 0.7 },
      { title: "Drew the app as it is today", detail: "5 screens, nothing new on them yet", at: 3.5, dur: 0.8 },
      { title: "Wired one switch per point", detail: "IDs 1.1 to 3.2, same as the PRD", at: 4.4, dur: 0.8 },
      { title: "Checked its own work", detail: "6 of 6 checks passed", at: 19.0, dur: 0.9 },
    ],
    foot: "<b>Every point has a switch.</b> Every switch changes a screen you can reach.",
    footAt: 20.0,
  });

  // The phone and panel arrive while the agent is still "drawing".
  tl.show(proto.el.phone.parentElement, 3.4, { dur: 0.7, y: 16 });
  tl.show(proto.el.panel, 4.3, { dur: 0.6, y: 12 });

  // One keyed state object drives the prototype, so any moment can be seeked to.
  const frame = (screen, on, focus = null, announce = null) => ({ screen, on: Object.fromEntries(on.map((id) => [id, true])), focus, announce });
  tl.key("p", frame("home", []), 0);

  const cursor = createCursor(tl, art);
  const flip = (id, at, screen, onAfter) => {
    const tap = cursor.to(() => proto.el.switch(id), at, { dur: 0.8 });
    tl.key("p", frame(screen, onAfter, id, id), tap);
    tl.to(proto.el.view, { "--flash": [1, 0] }, { at: tap, dur: 0.6 });
    return tap;
  };

  tl.chapter("Read", 0);
  tl.chapter("Today", 5.2);
  tl.chapter("Switch on", 6.3);

  flip("1.1", 6.3, "home", ["1.1"]);
  flip("1.2", 8.2, "home", ["1.1", "1.2"]);
  flip("3.1", 10.0, "home", ["1.1", "1.2", "3.1"]);

  // Tap Reorder on the phone itself: the basket opens.
  const open = cursor.to(() => proto.el.find('[data-cta="reorder"]'), 11.9, { dur: 0.9 });
  tl.key("p", frame("basket", ["1.1", "1.2", "3.1"]), open + 0.15);

  flip("2.1", 13.6, "basket", ["1.1", "1.2", "3.1", "2.1"]);
  flip("2.2", 15.3, "basket", ["1.1", "1.2", "3.1", "2.1", "2.2"]);
  flip("3.2", 17.0, "basket", ["1.1", "1.2", "3.1", "2.1", "2.2", "3.2"]);

  cursor.hide(18.6);
  tl.chapter("Check", 18.9);
  tl.end(21.4);

  tl.on((s) => {
    if (s.p) proto.apply(s.p);
  });

  return {
    timeline: tl,
    live() {
      // From here a switch takes you to the screen it changes.
      proto.options.follow = true;
    },
    unlive() {
      proto.options.follow = false;
      proto.reset();
      tl.invalidate();
    },
  };
}
