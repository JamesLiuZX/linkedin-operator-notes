// site/src/demos/workflow-roi-lab.js
//
// Where an AI-assisted workflow actually pays for itself. Token cost is
// almost never the number that decides it, human review time is, which is
// the same gap METR's randomized trial on experienced developers found:
// people forecast a 24% speedup, later still believed 20%, and a stopwatch
// measured 19% slower (research/SOURCES.md, "AI workflow economics"). This
// demo makes that same gap a slider instead of a headline.

import { statRow, barsH, lineChart, fmt, esc, tableView } from "../viz/charts.js";
import { MODELS, DEFAULTS, compute, sweepAiMinutes } from "@lib/workflow-roi.mjs";

export const meta = {
  slug: "workflow-roi-lab",
  title: "Workflow ROI Lab",
  tagline: "Token cost is rarely the number that decides it. Review time is.",
  section: "growth",
  pillar: "AI workflows",
  essay: "13-the-stopwatch-not-the-forecast",
  blurb:
    "A breakeven calculator for AI-assisted workflows, built on Anthropic's published per-token pricing. Set your own task volume, manual time, review time, and rework rate, and read off the exact review-time ceiling before the workflow stops paying for itself.",
  buildNote:
    "Closed-form: cost per task is exact arithmetic over your inputs, and the breakeven review-time is solved directly rather than searched for. The only externally sourced numbers are the four models' published token prices. Everything else, volume, minutes, rework rate, is an assumption you set and can argue with.",
};

const usd3 = (v) => {
  const abs = Math.abs(v);
  return `${v < 0 ? "-" : ""}$${abs < 1 ? abs.toFixed(3) : abs.toFixed(2)}`;
};
const usdSigned = (v) => (v < 0 ? `-$${fmt.int(Math.abs(v))}` : `$${fmt.int(v)}`);

const CONTROLS = [
  { key: "volume", label: "Tasks per month", min: 50, max: 5000, step: 50, fmt: (v) => `${fmt.int(v)}/mo` },
  { key: "manualMinutes", label: "Manual time per task", min: 1, max: 60, step: 1, fmt: (v) => `${fmt.int(v)} min` },
  { key: "hourlyCost", label: "Fully loaded cost of the person", min: 15, max: 150, step: 5, fmt: (v) => `$${fmt.int(v)}/hr` },
  { key: "inputTokens", label: "Input tokens per call", min: 200, max: 50000, step: 200, fmt: (v) => `${fmt.int(v)} tok` },
  { key: "outputTokens", label: "Output tokens per call", min: 50, max: 8000, step: 50, fmt: (v) => `${fmt.int(v)} tok` },
  { key: "aiMinutes", label: "AI-assisted time per task (prompt + review)", min: 0, max: 30, step: 0.5, fmt: (v) => `${v.toFixed(1)} min` },
  { key: "reworkRate", label: "Share of tasks still redone by hand", min: 0, max: 0.5, step: 0.01, fmt: (v) => fmt.pct(v) },
];

export function mount(root) {
  const p = { ...DEFAULTS };

  root.innerHTML = `
    <div class="demo-grid lab">
      <section class="demo-input">
        <label class="restyle-field">
          <span>Model</span>
          <select id="wr-model">${MODELS.map(
            (m) => `<option value="${m.id}" ${m.id === p.modelId ? "selected" : ""}>${esc(m.name)}</option>`
          ).join("")}</select>
        </label>
        <p class="restyle-style-blurb mono" id="wr-model-blurb"></p>

        <div class="controls">${CONTROLS.map(
          (c) => `
          <label class="control" for="wr-${c.key}">
            <span class="control-label">${esc(c.label)}<b class="mono" id="wr-${c.key}-v"></b></span>
            <input type="range" id="wr-${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${p[c.key]}" />
          </label>`
        ).join("")}</div>

        <div class="row-actions">
          <button id="wr-reset" class="btn-ghost">Reset</button>
          <button id="wr-metr" class="btn-ghost">Load the METR pattern</button>
          <button id="wr-clean" class="btn-ghost">Load a clean automation</button>
        </div>
        <p class="model-note">Token prices are Anthropic's published rates, verified August 2026. Volume, minutes, and rework rate are your own assumptions, not a benchmark.</p>
      </section>
      <section class="demo-output" id="wr-out"></section>
    </div>`;

  const out = root.querySelector("#wr-out");
  const modelBlurb = root.querySelector("#wr-model-blurb");
  const modelSelect = root.querySelector("#wr-model");

  const render = () => {
    const r = compute(p);
    const sweep = sweepAiMinutes(p);
    const tone = r.savingsPerTask >= 0 ? "good" : "critical";

    modelBlurb.textContent = `${r.model.name} — $${r.model.inputPrice}/M input, $${r.model.outputPrice}/M output tokens`;

    out.innerHTML = `
      ${statRow([
        { label: "Cost per task, manual", value: usd3(r.manualCost) },
        { label: "Cost per task, AI-assisted", value: usd3(r.aiCost), sub: `${usd3(r.tokenCost)} tokens + ${usd3(r.reviewCost)} review + ${usd3(r.reworkCost)} rework` },
        { label: "Savings per task", value: usd3(r.savingsPerTask), tone },
        { label: "Monthly savings", value: usd3(r.monthlySavings), sub: `at ${fmt.int(p.volume)} tasks/mo`, tone },
      ])}

      <div class="chart-block">
        <h4>Cost per task, by line item</h4>
        ${barsH(
          [
            { label: "Manual, today", value: r.manualCost },
            { label: "AI: tokens", value: r.tokenCost },
            { label: "AI: review time", value: r.reviewCost },
            { label: "AI: rework", value: r.reworkCost },
          ],
          { format: usd3 }
        )}
        <p class="chart-note">The token line is usually the smallest bar on the chart. Review time is what actually decides whether this workflow is worth shipping.</p>
      </div>

      <div class="chart-block">
        <h4>Monthly savings against AI-assisted minutes per task</h4>
        ${lineChart([{ label: "Monthly savings", points: sweep }], {
          xLabel: "AI-assisted minutes per task",
          xFormat: (v) => `${v.toFixed(0)}m`,
          yFormat: usdSigned,
          guide: { y: 0, label: "breakeven" },
        })}
        <p class="chart-note">Breakeven at these settings: <b class="mono">${r.breakevenAiMinutes.toFixed(1)} minutes</b> of AI-assisted time per task. Past that, the workflow costs more than doing it by hand, no matter how fast it feels.</p>
      </div>

      <div class="takeaway-box">
        <strong>The line to check before shipping the automation.</strong>
        <p>At <b class="mono">${fmt.int(p.volume)}</b> tasks a month, this workflow is worth <b class="mono">${usd3(r.monthlySavings)}</b> a month at <b class="mono">${p.aiMinutes.toFixed(1)} min</b> of review time per task, and crosses to zero at <b class="mono">${r.breakevenAiMinutes.toFixed(1)} min</b>.</p>
        <p>Time the review step for real before you claim the savings. METR ran exactly this check on experienced developers: they forecast a 24% speedup, still believed 20% afterward, and a stopwatch measured 19% slower. Perceived speed and measured speed were not the same number.</p>
      </div>

      ${tableView(
        ["Model", "Input $/M", "Output $/M", "Token cost, this call"],
        MODELS.map((m) => [
          m.name,
          `$${m.inputPrice}`,
          `$${m.outputPrice}`,
          usd3((p.inputTokens / 1e6) * m.inputPrice + (p.outputTokens / 1e6) * m.outputPrice),
        ]),
        { caption: `Token cost at ${fmt.int(p.inputTokens)} input / ${fmt.int(p.outputTokens)} output tokens per call, across all four tiers` }
      )}`;
  };

  const syncLabels = () => {
    modelSelect.value = p.modelId;
    for (const c of CONTROLS) {
      root.querySelector(`#wr-${c.key}-v`).textContent = c.fmt(p[c.key]);
      root.querySelector(`#wr-${c.key}`).value = p[c.key];
    }
  };

  modelSelect.addEventListener("change", (e) => {
    p.modelId = e.target.value;
    render();
  });
  for (const c of CONTROLS) {
    root.querySelector(`#wr-${c.key}`).addEventListener("input", (e) => {
      p[c.key] = Number(e.target.value);
      syncLabels();
      render();
    });
  }
  root.querySelector("#wr-reset").addEventListener("click", () => {
    Object.assign(p, DEFAULTS);
    syncLabels();
    render();
  });
  root.querySelector("#wr-metr").addEventListener("click", () => {
    Object.assign(p, DEFAULTS, { aiMinutes: 14, reworkRate: 0.08 });
    syncLabels();
    render();
  });
  root.querySelector("#wr-clean").addEventListener("click", () => {
    Object.assign(p, DEFAULTS, { aiMinutes: 1.5, reworkRate: 0.03 });
    syncLabels();
    render();
  });

  syncLabels();
  render();
}
