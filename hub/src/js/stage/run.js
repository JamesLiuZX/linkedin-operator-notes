// hub/src/js/stage/run.js
//
// The run log on the left of every demo: what was asked, then each step the
// agent took, ticking off as the output on the right assembles.

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

/**
 * @param tl    the demo's timeline
 * @param host  the .run element
 * @param spec  { ask, askAt, steps: [{ title, detail, at, dur, bad? }], foot, footAt }
 * @returns the time the last step finishes
 */
export function buildRun(tl, host, spec) {
  host.innerHTML = `
    <div class="run-ask"><small>You asked</small><span data-ask></span></div>
    <ol class="run-steps">
      ${spec.steps.map((s) => `<li class="run-step" data-step><i></i><div><b>${esc(s.title)}</b><small>${esc(s.detail || "")}</small></div></li>`).join("")}
    </ol>
    ${spec.foot ? `<div class="run-foot" data-foot>${spec.foot}</div>` : ""}`;

  const askAt = spec.askAt ?? 0.3;
  tl.type(host.querySelector("[data-ask]"), spec.ask, { at: askAt, cps: spec.cps || 34 });

  let end = 0;
  host.querySelectorAll("[data-step]").forEach((el, i) => {
    const s = spec.steps[i];
    const dur = s.dur ?? 0.8;
    tl.show(el, s.at - 0.05, { dur: 0.35, y: 6 });
    tl.cls(el, "doing", s.at, true);
    tl.cls(el, "doing", s.at + dur, false);
    tl.cls(el, s.bad ? "bad" : "done", s.at + dur, true);
    end = Math.max(end, s.at + dur);
  });

  const foot = host.querySelector("[data-foot]");
  if (foot) tl.show(foot, spec.footAt ?? end + 0.2, { dur: 0.4, y: 6 });
  return end;
}
