// hub/src/js/demos/flagged-prototype.js
//
// The replay for the flagged prototype. The agent reads the PRD, draws the app
// as it is today and wires one switch per PRD point. Then a hand walks the
// tour the spec's author wrote, switch by switch, and drags the divider across
// the screen to compare today with the proposal. When it ends, it is yours.
//
// Nothing here knows which app it is showing: the steps come from spec.tour.

import { createTimeline, ease } from "../stage/timeline.js";
import { createCursor } from "../stage/cursor.js";
import { buildRun } from "../stage/run.js";
import { createPrototype } from "../artifacts/prototype.js";

const esc = (s) => String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export function mount(body, { stage, data: spec, ask, checks } = {}) {
  body.innerHTML = `
    <div class="demo demo-proto">
      <div class="run" data-run></div>
      <div class="art" data-art>
        <div class="demo-proto-host" data-host></div>
        <p class="demo-say" data-say></p>
      </div>
    </div>`;
  const art = body.querySelector("[data-art]");
  const host = body.querySelector("[data-host]");
  const say = body.querySelector("[data-say]");
  const clip = Boolean(stage?.closest(".clip"));

  const tl = createTimeline();
  const proto = createPrototype(host, spec, { follow: false, instant: true, compact: true, maxScale: clip ? 1.9 : spec.frame === "desktop" ? 1 : 1.25 });
  const steps = proto.tour.length ? proto.tour : (spec.flags || []).map((f) => ({ flag: f.id }));
  const flags = spec.flags || [];
  const sections = spec.sections || [];
  const screens = Object.keys(spec.screens || {});

  // Each step: the pointer travels, taps, and the prototype takes that step's state.
  const START = 5.4;
  const STEP = steps.length > 9 ? 1.75 : 1.95;
  const walkEnd = START + steps.length * STEP;
  const compareAt = walkEnd + 0.3;
  const checkAt = compareAt + 4.3;

  buildRun(tl, body.querySelector("[data-run]"), {
    ask: ask || "Build the prototype for this PRD. One switch per point, off by default.",
    steps: [
      { title: "Read the PRD", detail: `prd.json · ${flags.length} points in ${sections.length || 1} sections`, at: 2.5, dur: 0.6 },
      { title: "Drew the app as it is today", detail: `${screens.length} screens, nothing new on them yet`, at: 3.2, dur: 0.9 },
      { title: "Wired one switch per point", detail: `IDs ${flags[0]?.id} to ${flags[flags.length - 1]?.id}, same as the PRD`, at: 4.2, dur: 0.9 },
      { title: "Walked the journey", detail: `${steps.length} steps, each switch on in turn`, at: START, dur: walkEnd - START },
      { title: "Compared it with today", detail: "The same screen, cut at a divider", at: compareAt, dur: 3.8 },
      { title: "Checked its own work", detail: "Every switch changes a screen you can reach", at: checkAt, dur: 0.8 },
    ],
    receipt: checks ? `${checks} checks passed` : "",
    receiptAt: checkAt + 0.95,
  });

  tl.chapter("Read", 0);
  tl.chapter("Today", 3.2);
  tl.chapter("Switch on", START);
  tl.chapter("Compare", compareAt);
  tl.chapter("Check", checkAt);

  // The device tips in while the agent is still "drawing". The panel follows.
  tl.land(proto.el.device, 3.1, { dur: 1.3, ry: spec.frame === "desktop" ? -14 : -24, rx: 12, z: -260, y: 60 });
  tl.show(proto.el.panel, 4.2, { dur: 0.6, y: 14 });

  // One keyed value drives everything, so any moment can be seeked to.
  tl.key("step", -1, 0);
  tl.key("compare", false, 0);
  const cursor = createCursor(tl, art);
  steps.forEach((step, i) => {
    const at = START + i * STEP;
    const target = step.flag || step.off ? () => proto.el.switch(step.flag || step.off) : step.tap ? () => proto.el.find(step.tap) : null;
    const tap = target ? cursor.to(target, at, { dur: 0.8 }) : at + 0.3;
    tl.key("step", i, tap);
    // The new piece of the screen arrives with the tap.
    tl.to(proto.el.view, { "--flash": [1, 0] }, { at: tap, dur: 0.6 });
  });

  // The divider is dragged across the last screen: today on the left.
  const grip = () => proto.el.split.querySelector("i");
  const drag = cursor.to(() => proto.el.compare, compareAt, { dur: 0.7 });
  tl.key("compare", true, drag);
  cursor.to(grip, drag + 0.35, { dur: 0.6, tap: false });
  tl.to(proto.el.screen, { "--split": [0.5, 0.5] }, { at: drag, dur: 0.01 });
  tl.to(proto.el.screen, { "--split": 0.86 }, { at: drag + 0.95, dur: 0.9, ease: ease.inOut });
  tl.to(proto.el.screen, { "--split": 0.14 }, { at: drag + 1.9, dur: 1.25, ease: ease.inOut });
  tl.to(proto.el.screen, { "--split": 0.5 }, { at: drag + 3.2, dur: 0.7, ease: ease.inOut });
  // The pointer is measured every frame, so it rides the grip while it moves.
  cursor.hide(checkAt - 0.1);
  tl.end(checkAt + 3.2);

  let shown = null;
  tl.on((s) => {
    const i = s.step ?? -1;
    const next = i < 0 ? { screen: spec.start || screens[0] } : proto.tourState(i);
    proto.apply({ ...next, compare: Boolean(s.compare), split: 0.5 });
    const step = i >= 0 ? steps[i] : null;
    const f = step ? flags.find((x) => x.id === step.flag) : null;
    const text = s.compare ? "Today on the left. The proposal on the right." : step ? step.say || f?.note || "" : "";
    const html = text ? `${f && !s.compare ? `<span class="proto-id">${esc(f.id)}</span>` : ""}${esc(text)}` : "";
    if (html !== shown) {
      shown = html;
      say.innerHTML = html;
      say.classList.toggle("on", Boolean(html));
    }
  });

  return {
    timeline: tl,
    hint: "Flip the switches, or drag the divider",
    live() {
      // From here a switch takes you to the screen it changes.
      proto.options.follow = true;
      proto.options.instant = false;
      say.classList.remove("on");
    },
    unlive() {
      proto.options.follow = false;
      proto.options.instant = true;
      proto.endTour();
      proto.reset();
      shown = null;
      tl.invalidate();
    },
    destroy() {
      proto.destroy();
    },
  };
}
