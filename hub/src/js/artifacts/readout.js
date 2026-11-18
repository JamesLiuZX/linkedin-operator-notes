// hub/src/js/artifacts/readout.js
//
// Draws an experiment readout from readout.json (see skills/experiment-readout/
// references/format.md). The page leads with the decision, then shows the three
// checks on the test itself, then the effect and the guardrails as intervals.
// With `interactive` on, the counts can be edited and everything recomputes
// with the same arithmetic the skill's Python script uses.

import { readout as compute, SCENARIOS } from "./ab-stats.js";

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const DECISION = {
  ship: { word: "Ship", tone: "ok" },
  extend: { word: "Extend", tone: "warn" },
  stop: { word: "Stop", tone: "bad" },
  "do-not-trust": { word: "Do not trust", tone: "bad" },
};
const VERDICT = { held: ["Held", "ok"], worse: ["Worse", "bad"], unclear: ["Unclear", "warn"] };
const RESULT = { positive: ["Better", "ok"], negative: ["Worse", "bad"], inconclusive: ["No clear effect", "warn"] };

const pct = (x, d = 1) => `${(x * 100).toFixed(d)}%`;
const pts = (x, d = 1) => `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(d)}`;
const plain = (x, d = 1) => `${x < 0 ? "−" : ""}${Math.abs(x * 100).toFixed(d)}`;
const num = (n) => Number(n).toLocaleString("en-US");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (iso, year) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]}${year ? ` ${m[1]}` : ""}` : esc(iso || "");
};
const pval = (p) => (p < 0.0001 ? "< 0.0001" : p < 0.001 ? p.toFixed(4) : p.toFixed(3));

/** An interval drawn on a shared axis of percentage points. Plain HTML, so the labels never stretch. */
function forest({ diff, ci, span, zone = null, good = "up", mark = null }) {
  const x = (v) => Math.max(1, Math.min(99, 50 + (v / span) * 46));
  const ticks = [-1, -0.5, 0, 0.5, 1].map((k) => k * span);
  const lab = (t) => (t === 0 ? "0" : `${t < 0 ? "\u2212" : "+"}${Math.round(Math.abs(t) * 10000) / 100}`);
  const side = (v) => (good === "up" ? v > 0 : v < 0);
  const tone = ci[0] > 0 || ci[1] < 0 ? (side(diff) ? "ok" : "bad") : "mut";
  const z = zone ? [zone[0] === -Infinity ? 0 : x(zone[0]), zone[1] === Infinity ? 100 : x(zone[1])] : null;
  return `<div class="forest" role="img" aria-label="Difference ${pts(diff)} points, interval ${plain(ci[0])} to ${plain(ci[1])}">
    <div class="f-plot">
      ${z ? `<i class="f-zone" style="left:${z[0]}%;width:${z[1] - z[0]}%"></i>` : ""}
      ${ticks.map((t) => `<i class="${t === 0 ? "f-zero" : "f-tick"}" style="left:${x(t)}%"></i>`).join("")}
      ${mark ? `<i class="f-mark" style="left:${x(mark.at)}%"><b>${esc(mark.label)}</b></i>` : ""}
      <i class="f-bar f-${tone}" data-ci style="left:${x(ci[0])}%;width:${x(ci[1]) - x(ci[0])}%"></i>
      <i class="f-dot f-${tone}" data-dot style="left:${x(diff)}%"></i>
    </div>
    <div class="f-axis">${ticks.map((t) => `<span style="left:${x(t)}%">${lab(t)}</span>`).join("")}</div>
  </div>`;
}

const niceSpan = (values) => {
  const m = Math.max(...values.map((v) => Math.abs(v)), 0.005) * 1.15;
  for (const s of [0.005, 0.01, 0.02, 0.03, 0.04, 0.05, 0.075, 0.1, 0.15, 0.2, 0.3, 0.5, 1]) if (m <= s) return s;
  return 1;
};

export function renderReadout(data) {
  const n = data.numbers;
  const input = n.input;
  const d = DECISION[n.verdict.decision] || DECISION.extend;
  const p = n.primary;
  const span = niceSpan([p.ci[0], p.ci[1], n.checks.power.mde_set || 0]);
  const gspan = niceSpan(n.guardrails.flatMap((g) => [g.ci[0], g.ci[1], g.tolerance]));
  const srm = n.checks.srm;
  const dur = n.checks.duration;
  const pow = n.checks.power;
  const total = srm.observed[0] + srm.observed[1];
  const [rw, rt] = RESULT[p.result];

  return `
  <div class="ro-wrap">
    <header class="ro-head">
      <div class="ro-ey">${esc(input.test.name)} · ${esc(input.test.unit || "")}${input.test.start ? ` · ${day(input.test.start)} to ${day(input.test.end, true)}` : ""}</div>
      <div class="ro-verdict ro-${d.tone}" data-part="verdict">
        <div class="ro-word" data-decision>${d.word}</div>
        <div class="ro-why">
          <p class="ro-headline">${esc(data.headline || n.verdict.reasons[0] || "")}</p>
          <p class="ro-rule">${esc(n.verdict.rule)}</p>
        </div>
      </div>
    </header>

    <section class="ro-checks" data-part="checks">
      <div class="ro-check ${srm.pass ? "ok" : "bad"}" data-check="srm">
        <span class="ro-k">1 · Was the split as planned?</span>
        <b>${srm.pass ? "Yes" : "No"}</b>
        <p>${num(srm.observed[0])} and ${num(srm.observed[1])} users. Planned ${input.test.planned_split.map((x) => Math.round(x * 100)).join("/")}, got ${pct(srm.observed[0] / total)} and ${pct(srm.observed[1] / total)}. p = ${pval(srm.p)}${srm.pass ? "." : ", far below the 0.001 line."}</p>
      </div>
      <div class="ro-check ${dur.stopped_early || !dur.full_weeks ? "warn" : "ok"}" data-check="duration">
        <span class="ro-k">2 · Did it run its course?</span>
        <b>${dur.stopped_early ? "Stopped early" : dur.full_weeks ? "Yes" : "Part week"}</b>
        <p>Ran ${dur.ran_days} of ${dur.planned_days} planned days${dur.full_weeks ? ", whole weeks" : ", not a whole number of weeks"}.</p>
      </div>
      <div class="ro-check ${pow.adequate === false ? "warn" : pow.adequate ? "ok" : "mut"}" data-check="power">
        <span class="ro-k">3 · Could it have seen the effect?</span>
        <b>${pow.adequate == null ? "No target set" : pow.adequate ? "Yes" : "Not quite"}</b>
        <p>It could reliably detect ${plain(pow.mde_abs)} points or more${pow.mde_set != null ? `. The effect worth shipping was set at ${plain(pow.mde_set)}` : ""}.</p>
      </div>
    </section>

    <section class="ro-main" data-part="primary">
      <div class="ro-metric">
        <div class="ro-metric-top"><h2>${esc(p.name)}</h2><span class="atag ${rt}">${rw}</span></div>
        <div class="ro-rates"><span>${esc(input.arms[0].name)} <b>${pct(p.rates[0])}</b></span><i>→</i><span>${esc(input.arms[1].name)} <b>${pct(p.rates[1])}</b></span></div>
      </div>
      <div class="ro-effect">
        <div class="ro-big"><b data-diff>${pts(p.diff)}</b><span>points<br>95% interval ${plain(p.ci[0])} to ${plain(p.ci[1])}</span></div>
        ${forest({ diff: p.diff, ci: p.ci, span, good: input.primary.direction, mark: pow.mde_set != null ? { at: input.primary.direction === "down" ? -pow.mde_set : pow.mde_set, label: "worth shipping" } : null })}
      </div>
    </section>

    <section class="ro-guards" data-part="guardrails">
      <h3>Guardrails</h3>
      ${n.guardrails
        .map((g) => {
          const [word, tone] = VERDICT[g.verdict];
          const zone = g.harm === "down" ? [-Infinity, -g.tolerance] : [g.tolerance, Infinity];
          return `<div class="ro-guard" data-guard>
          <div class="ro-guard-name"><b>${esc(g.name)}</b><span>${pct(g.rates[0])} → ${pct(g.rates[1])} · harm is ${g.harm === "down" ? "a fall" : "a rise"} of more than ${plain(g.tolerance)}</span></div>
          <div class="ro-guard-plot">${forest({ diff: g.diff, ci: g.ci, span: gspan, zone, good: g.harm === "down" ? "up" : "down" })}</div>
          <div class="ro-guard-v"><b>${pts(g.diff)}</b><span class="atag ${tone}">${word}</span></div>
        </div>`;
        })
        .join("")}
      <p class="ro-fine">The shaded band is the harm the team said it would not accept. An interval that reaches into it has not ruled that harm out.</p>
    </section>

    <section class="ro-text" data-part="text">
      <div><h3>In plain words</h3><p>${esc(data.summary || n.verdict.reasons.join(" "))}</p></div>
      ${(data.next || []).length ? `<div><h3>Next</h3><ul>${data.next.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
    </section>

    ${n.flags.length ? `<section class="ro-flags"><h3>Read with care</h3><ul>${n.flags.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></section>` : ""}

    <details class="ro-numbers">
      <summary>Every number, and how it was reached</summary>
      <table>
        <tr><th>Sample ratio</th><td>chi-square ${srm.chi2.toFixed(3)}, p = ${pval(srm.p)}, passes at p ≥ ${srm.threshold}</td></tr>
        <tr><th>${esc(p.name)}</th><td>${num(input.primary.counts[0])} of ${num(input.arms[0].users)} and ${num(input.primary.counts[1])} of ${num(input.arms[1].users)}. Difference ${pts(p.diff, 2)} points, standard error ${(p.se * 100).toFixed(2)}, z = ${p.z.toFixed(2)}, p = ${pval(p.p)}, relative lift ${pts(p.lift)}%</td></tr>
        ${n.guardrails.map((g) => `<tr><th>${esc(g.name)}</th><td>Difference ${pts(g.diff, 2)} points, interval ${plain(g.ci[0], 2)} to ${plain(g.ci[1], 2)}, tolerance ${plain(g.tolerance, 2)}</td></tr>`).join("")}
        <tr><th>Power</th><td>Smallest detectable effect at 80% power: ${plain(pow.mde_abs, 2)} points (${pts(pow.mde_rel).slice(1)}% of the baseline rate)</td></tr>
        <tr><th>Method</th><td>Two-proportion z-test, Wald interval with unpooled standard error, alpha ${input.test.alpha}. The arithmetic is in scripts/ab_stats.py, with its tests beside it.</td></tr>
      </table>
    </details>
  </div>`;
}

const HEADLINE = {
  ship: "Ship. The main metric is better and every guardrail held.",
  extend: "Extend. The result is not settled yet.",
  stop: "Stop. The numbers do not support shipping this.",
  "do-not-trust": "Do not trust this result. The users were not split as planned.",
};

export function mountReadout(root, data, { interactive = false } = {}) {
  root.classList.add("adoc", "readout");
  let current = data;
  const draw = () => {
    root.querySelector("[data-ro-body]").innerHTML = renderReadout(current);
  };

  root.innerHTML = `${
    interactive
      ? `<div class="ro-controls" data-ro-controls>
      <div class="ro-scenarios" role="group" aria-label="Scenarios">${SCENARIOS.map((s, i) => `<button type="button" data-scenario="${esc(s.id)}" class="${i === 0 ? "on" : ""}" title="${esc(s.blurb)}">${esc(s.label)}</button>`).join("")}</div>
      <div class="ro-inputs" data-ro-inputs></div>
    </div>`
      : ""
  }<div data-ro-body></div>`;
  draw();

  if (!interactive) return { root, set() {} };

  const inputsEl = root.querySelector("[data-ro-inputs]");
  const field = (label, key, value) => `<label><span>${esc(label)}</span><input type="number" inputmode="numeric" min="0" step="1" data-in="${key}" value="${value}"></label>`;
  const drawInputs = () => {
    const i = current.numbers.input;
    inputsEl.innerHTML =
      `<div><b>${esc(i.arms[0].name)}</b>${field("Users", "u0", i.arms[0].users)}${field("Converted", "c0", i.primary.counts[0])}</div>` +
      `<div><b>${esc(i.arms[1].name)}</b>${field("Users", "u1", i.arms[1].users)}${field("Converted", "c1", i.primary.counts[1])}</div>`;
  };

  function recompute(input, base) {
    try {
      const numbers = compute(input);
      // The example's own counts keep the headline and summary that were written for them.
      const near = (x, y) => Math.abs(x - y) < 1e-9;
      const b = base && base.numbers;
      const same =
        !!b &&
        near(numbers.primary.diff, b.primary.diff) &&
        near(numbers.primary.se, b.primary.se) &&
        near(numbers.checks.srm.chi2, b.checks.srm.chi2) &&
        numbers.guardrails.length === b.guardrails.length &&
        numbers.guardrails.every((g, i) => near(g.diff, b.guardrails[i].diff) && near(g.se, b.guardrails[i].se));
      current = same ? base : { numbers, headline: `${HEADLINE[numbers.verdict.decision]}`, summary: numbers.verdict.reasons.join(" "), next: [] };
      root.classList.remove("ro-invalid");
      draw();
    } catch (err) {
      root.classList.add("ro-invalid");
      root.querySelector("[data-ro-body]").innerHTML = `<div class="ro-wrap"><p class="ro-error">${esc(err.message || "Those counts cannot be read out.")}</p></div>`;
    }
  }

  const api = {
    root,
    /** Show a named scenario. The example's own scenario keeps its written headline and summary. */
    scenario(id) {
      const s = SCENARIOS.find((x) => x.id === id);
      if (!s) return;
      root.querySelectorAll("[data-scenario]").forEach((b) => b.classList.toggle("on", b.dataset.scenario === id));
      recompute(JSON.parse(JSON.stringify(s.input)), data);
      drawInputs();
    },
    set(next) {
      current = next;
      draw();
    },
  };

  root.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-scenario]");
    if (b) api.scenario(b.dataset.scenario);
  });
  inputsEl.addEventListener("input", () => {
    const v = (k) => Math.max(0, Math.round(Number(inputsEl.querySelector(`[data-in="${k}"]`).value) || 0));
    const input = JSON.parse(JSON.stringify(current.numbers.input));
    // Guardrails counted per order keep their own bases. Only the arms and the main metric are editable here.
    input.arms[0].users = v("u0");
    input.arms[1].users = v("u1");
    input.primary.counts = [v("c0"), v("c1")];
    root.querySelectorAll("[data-scenario]").forEach((x) => x.classList.remove("on"));
    recompute(input, data);
  });
  drawInputs();
  return api;
}
