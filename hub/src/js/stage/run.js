// hub/src/js/stage/run.js
//
// The run column on the left of every demo: what was asked, each step the
// agent took, and the receipt at the end. It is the same in every demo, so a
// reader learns it once.

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const TICK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>';
const CROSS = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="m4.5 4.500 7 7M11.500 4.500l-7 7"/></svg>';

/**
 * @param tl    the demo's timeline
 * @param host  the .run element
 * @param spec  { ask, askAt, steps: [{ title, detail, at, dur, bad? }], foot, footAt, receipt, receiptAt, receiptBad }
 * @returns the time the last step finishes
 */
export function buildRun(tl, host, spec) {
  host.innerHTML = `
    <div class="run-ask"><small>You ask</small><p><span data-ask></span><i class="run-caret" aria-hidden="true"></i></p></div>
    <ol class="run-steps">
      ${spec.steps
        .map(
          (s) => `
      <li class="run-step${s.bad ? " is-bad" : ""}" data-step>
        <i class="run-mark"><span class="run-spin"></span><span class="run-tick">${s.bad ? CROSS : TICK}</span></i>
        <div><b>${esc(s.title)}</b><small>${esc(s.detail || "")}</small></div>
      </li>`
        )
        .join("")}
    </ol>
    ${spec.receipt ? `<div class="run-receipt${spec.receiptBad ? " is-bad" : ""}" data-receipt><span>${esc(spec.receipt)}</span></div>` : ""}
    ${spec.foot ? `<div class="run-foot" data-foot>${spec.foot}</div>` : ""}`;

  const askAt = spec.askAt ?? 0.3;
  const ask = host.querySelector(".run-ask");
  tl.show(ask, 0.05, { dur: 0.4, y: 8 });
  tl.type(host.querySelector("[data-ask]"), spec.ask, { at: askAt, cps: spec.cps || 38 });

  let end = 0;
  const steps = [...host.querySelectorAll("[data-step]")];
  steps.forEach((el, i) => {
    const s = spec.steps[i];
    const dur = s.dur ?? 0.8;
    tl.show(el, s.at - 0.05, { dur: 0.35, y: 8 });
    tl.cls(el, "doing", s.at, true);
    tl.cls(el, "doing", s.at + dur, false);
    tl.cls(el, "done", s.at + dur, true);
    tl.pop(el.querySelector(".run-tick"), s.at + dur, { dur: 0.5, from: 0.2 });
    end = Math.max(end, s.at + dur);
  });

  // The rail between the marks fills as the run goes on.
  const first = spec.steps[0]?.at ?? 0;
  tl.to(host.querySelector(".run-steps"), { "--rail": [0, 1] }, { at: first, dur: Math.max(0.1, end - first), ease: (p) => p });

  const receipt = host.querySelector("[data-receipt]");
  const receiptAt = spec.receiptAt ?? end + 0.15;
  if (receipt) tl.stamp(receipt, receiptAt, { rotate: -4 });

  const foot = host.querySelector("[data-foot]");
  if (foot) tl.show(foot, spec.footAt ?? receiptAt + 0.45, { dur: 0.4, y: 6 });
  return end;
}
