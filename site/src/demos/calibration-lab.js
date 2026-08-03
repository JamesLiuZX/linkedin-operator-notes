// site/src/demos/calibration-lab.js
//
// Your agent is not smarter than the market. Check whether it is even calibrated.
//
// Published Brier scores, lower is better (see research/SOURCES.md):
//   0.075  AIA Forecaster, a scaffolded LLM
//   0.09   Kalshi and Polymarket market prices
//   0.096  human superforecasters
//   0.109  best general LLM forecaster
//   0.121  general public
//   0.13   frontier LLMs, unaided (range 0.122 to 0.136)
//
// The uncomfortable ordering: an unaided frontier model is worse than the market
// it wants to trade against, and worse than the general public. Scaffolding is
// what closes the gap. The edge is the harness, not the model.
//
// The sliders separate two things people conflate. Knowledge is how much signal
// the forecaster has. Confidence is how hard it pushes its forecasts toward 0 or
// 1. Turning up confidence with no extra knowledge makes forecasts feel sharper
// and score worse, which is the failure mode this demo exists to make visible.

import { statRow, barsH, lineChart, reliabilityPlot, legend, fmt, esc, tableView } from "../viz/charts.js";

export const meta = {
  slug: "calibration-lab",
  title: "Calibration lab",
  tagline: "Sharper forecasts feel better and score worse. Watch it happen.",
  section: "agents",
  pillar: "Agents on rails",
  essay: "08-the-harness-is-the-edge",
  blurb:
    "Brier scores, reliability diagrams, and the decomposition that separates knowing things from sounding sure. Benchmarked against published market and LLM forecast accuracy.",
  buildNote:
    "Seeded generator, so a given slider position always produces the same 400 markets. Benchmark Brier scores are published figures, not simulated; the agent is the simulated part and is labelled that way.",
};

const N_MARKETS = 400;
const SEED = 20260726;

/** Published benchmarks. Real numbers, cited in research/SOURCES.md. */
export const BENCHMARKS = [
  { label: "AIA Forecaster (scaffolded)", value: 0.075, note: "arXiv 2511.07678" },
  { label: "Market price (Kalshi, Polymarket)", value: 0.09, note: "Keyrock" },
  { label: "Human superforecasters", value: 0.096, note: "Keyrock" },
  { label: "Best general LLM forecaster", value: 0.109, note: "Hindcast" },
  { label: "General public", value: 0.121, note: "Keyrock" },
  { label: "Frontier LLM, unaided", value: 0.13, note: "range 0.122 to 0.136" },
];

// 0.75 knowledge lands the default agent at Brier 0.133, which is squarely in
// the published "frontier LLM, unaided" band. That is the story, so it is where
// the demo should open.
export const DEFAULTS = { knowledge: 0.75, confidence: 1.0, bias: 0.0, bins: 10 };

/* ------------------------------------------------------------------ maths */

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const logit = (p) => Math.log(p / (1 - p));
const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const clip = (p, e = 1e-4) => Math.min(1 - e, Math.max(e, p));

/**
 * Deterministic world: 400 markets with a true probability and a settled outcome.
 *
 * SPREAD sets how far from 50c real questions sit, and it is load-bearing. The
 * best possible Brier in any world is E[p(1-p)], the irreducible uncertainty, so
 * a world of coin flips has a floor no forecaster can beat. At SPREAD 14 the
 * floor is about 0.071, which puts every published benchmark in this demo
 * (0.075 to 0.136) inside the achievable range. Lower it and the market
 * baseline becomes unreachable, which would make the skill score a lie.
 */
const SPREAD = 14;

export function world() {
  const rnd = mulberry32(SEED);
  const out = [];
  for (let i = 0; i < N_MARKETS; i++) {
    const u = rnd();
    const pTrue = clip(sigmoid((u - 0.5) * SPREAD));
    out.push({ pTrue, outcome: rnd() < pTrue ? 1 : 0 });
  }
  return out;
}

/**
 * A forecaster. `knowledge` in [0,1] is how much of the true logit it recovers.
 * `confidence` scales the logit it reports. `bias` shifts it.
 */
export function forecast(w, { knowledge, confidence, bias }, seedOffset = 0) {
  const rnd = mulberry32(SEED + 7919 * (seedOffset + 1));
  // NOISE_GAIN has to be on the same scale as the logits this world produces
  // (roughly +/- 7 at SPREAD 14), otherwise knowledge saturates immediately and
  // the slider does nothing across most of its travel.
  const NOISE_GAIN = 7;
  return w.map((m) => {
    const noise = (rnd() + rnd() + rnd() - 1.5) * 2.2; // approx normal
    const base = logit(m.pTrue) * knowledge + noise * NOISE_GAIN * (1 - knowledge);
    return clip(sigmoid(base * confidence + bias));
  });
}

export function brier(preds, w) {
  return preds.reduce((s, p, i) => s + (p - w[i].outcome) ** 2, 0) / preds.length;
}

/** BS = reliability - resolution + uncertainty (Murphy). */
export function decompose(preds, w, bins = 10) {
  const N = preds.length;
  const obar = w.reduce((s, m) => s + m.outcome, 0) / N;
  const buckets = Array.from({ length: bins }, () => ({ n: 0, fsum: 0, osum: 0 }));
  preds.forEach((p, i) => {
    const k = Math.min(bins - 1, Math.floor(p * bins));
    buckets[k].n++;
    buckets[k].fsum += p;
    buckets[k].osum += w[i].outcome;
  });
  let reliability = 0;
  let resolution = 0;
  const points = [];
  for (const b of buckets) {
    if (!b.n) continue;
    const f = b.fsum / b.n;
    const o = b.osum / b.n;
    reliability += (b.n * (f - o) ** 2) / N;
    resolution += (b.n * (o - obar) ** 2) / N;
    points.push([f, o, b.n]);
  }
  return { reliability, resolution, uncertainty: obar * (1 - obar), points, obar };
}

/* ------------------------------------------------------------------- view */

const CONTROLS = [
  { key: "knowledge", label: "Knowledge (signal recovered)", min: 0, max: 0.95, step: 0.01, fmt: (v) => fmt.pct(v) },
  { key: "confidence", label: "Confidence (how hard it pushes)", min: 0.2, max: 3, step: 0.05, fmt: (v) => `${v.toFixed(2)}x` },
  { key: "bias", label: "Directional bias", min: -1.5, max: 1.5, step: 0.05, fmt: (v) => v.toFixed(2) },
];

export function mount(root) {
  const p = { ...DEFAULTS };
  const w = world();

  // The baseline has to BE the published market number, otherwise the skill
  // score on the left disagrees with the benchmark bar on the right and the
  // whole demo stops being trustworthy. So: solve for the knowledge level whose
  // simulated Brier lands on the published 0.09, and use that same forecaster
  // for the reliability diagram.
  const marketBrier = BENCHMARKS.find((b) => b.label.startsWith("Market price")).value;
  const marketPreds = (() => {
    let lo = 0.5;
    let hi = 0.999;
    let preds = forecast(w, { knowledge: hi, confidence: 1, bias: 0 }, 1);
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      preds = forecast(w, { knowledge: mid, confidence: 1, bias: 0 }, 1);
      if (brier(preds, w) > marketBrier) lo = mid;
      else hi = mid;
    }
    return preds;
  })();

  root.innerHTML = `
    <div class="demo-grid lab">
      <section class="demo-input">
        <div class="controls">${CONTROLS.map(
          (c) => `
          <label class="control" for="cl-${c.key}">
            <span class="control-label">${esc(c.label)}<b class="mono" id="cl-${c.key}-v"></b></span>
            <input type="range" id="cl-${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${p[c.key]}" />
          </label>`
        ).join("")}</div>
        <div class="row-actions">
          <button id="cl-reset" class="btn-ghost">Reset</button>
          <button id="cl-loud" class="btn-ghost">Load "confident and wrong"</button>
          <button id="cl-best" class="btn-ghost">Find best confidence</button>
        </div>
        <p class="model-note">Benchmark scores are published figures. The agent is simulated across ${N_MARKETS} seeded markets, so the same slider position always gives the same result.</p>
      </section>
      <section class="demo-output" id="cl-out"></section>
    </div>`;

  const out = root.querySelector("#cl-out");

  const render = () => {
    const preds = forecast(w, p, 0);
    const bs = brier(preds, w);
    const d = decompose(preds, w, p.bins);
    const md = decompose(marketPreds, w, p.bins);
    const bss = 1 - bs / marketBrier; // skill against the market baseline

    // Sweep confidence at fixed knowledge. The whole point of the demo.
    const sweep = [];
    for (let c = 0.2; c <= 3.001; c += 0.05) {
      sweep.push([c, brier(forecast(w, { ...p, confidence: c }, 0), w)]);
    }
    const best = sweep.reduce((a, b) => (b[1] < a[1] ? b : a));

    const bars = [
      ...BENCHMARKS.map((b) => ({ label: b.label, value: b.value, note: b.note, color: "var(--seq-3)" })),
      { label: "Your agent", value: bs, color: "var(--cat-2)", note: "simulated" },
    ].sort((a, b) => a.value - b.value);

    const tone = bs <= 0.09 ? "good" : bs <= 0.121 ? "warning" : "critical";

    out.innerHTML = `
      ${statRow([
        { label: "Brier score", value: bs.toFixed(3), sub: "lower is better", tone },
        { label: "Skill vs market", value: (bss >= 0 ? "+" : "") + bss.toFixed(3), sub: bss > 0 ? "beats the market baseline" : "worse than the market baseline", tone: bss > 0 ? "good" : "critical" },
        { label: "Reliability", value: d.reliability.toFixed(4), sub: "miscalibration, lower is better", tone: d.reliability > 0.02 ? "warning" : "" },
        { label: "Resolution", value: d.resolution.toFixed(4), sub: "discrimination, higher is better" },
      ])}

      <div class="chart-block">
        <h4>Brier scores, published benchmarks against your agent</h4>
        ${barsH(bars, { format: (v) => v.toFixed(3), width: 660, labelW: 250 })}
        <p class="chart-note">Lower is better, so the bars read backwards from the usual instinct. The unaided frontier model at 0.130 sits below the general public at 0.121. That is the finding that should change how you scope an agent.</p>
      </div>

      <div class="chart-block two-up">
        <div>
          <h4>Reliability diagram</h4>
          ${reliabilityPlot([
            { label: "Market", points: md.points.map((q) => [q[0], q[1]]) },
            { label: "Your agent", points: d.points.map((q) => [q[0], q[1]]) },
          ])}
          ${legend([{ label: "Market" }, { label: "Your agent" }], { scatter: true })}
          <p class="chart-note">On the diagonal means when it says 70% the thing happens 70% of the time. Below the line to the right is overconfidence, and it is what the confidence slider manufactures.</p>
        </div>
        <div>
          <h4>Brier against confidence, knowledge held fixed</h4>
          ${lineChart([{ label: "Brier", points: sweep, color: "var(--cat-2)" }], {
            xLabel: "confidence multiplier",
            xFormat: (v) => `${v.toFixed(1)}x`,
            yFormat: (v) => v.toFixed(3),
            // Domain deliberately includes the market baseline, so the reader can
            // see how far below the curve it sits even at the agent's best setting.
            yDomain: [
              Math.min(marketBrier, ...sweep.map((s) => s[1])) * 0.95,
              Math.max(...sweep.map((s) => s[1])) * 1.02,
            ],
            guide: { y: marketBrier, label: "market baseline" },
          })}
          <p class="chart-note">The minimum sits at <b class="mono">${best[0].toFixed(2)}x</b>. Everything to the right buys confidence with no extra knowledge, and pays for it in score.</p>
        </div>
      </div>

      <div class="takeaway-box">
        <strong>Read this before you put it near money.</strong>
        <p>Your agent scores <b class="mono">${bs.toFixed(3)}</b> against a market baseline of <b class="mono">${marketBrier.toFixed(3)}</b>. ${
          bss > 0
            ? "It beats the baseline here. Before believing that, check the reliability term, because a good total can hide a badly calibrated middle."
            : `It is worse than the price it would be trading against, by <b class="mono">${(bs - marketBrier).toFixed(3)}</b>. An agent in this state does not need a bigger model. It needs retrieval, a resolution-criteria reader, and a reason to abstain.`
        }</p>
        <p>Of the total, <b class="mono">${d.reliability.toFixed(4)}</b> is miscalibration you could fix without knowing anything new, just by reporting less extreme numbers.</p>
      </div>

      ${tableView(
        ["Forecaster", "Brier", "Source"],
        [
          ...BENCHMARKS.map((b) => [b.label, b.value.toFixed(3), b.note]),
          ["Your agent (simulated)", bs.toFixed(3), `knowledge ${fmt.pct(p.knowledge)}, confidence ${p.confidence.toFixed(2)}x`],
        ],
        { caption: "Published benchmarks and the current simulated agent" }
      )}`;
  };

  const syncLabels = () => {
    for (const c of CONTROLS) {
      root.querySelector(`#cl-${c.key}-v`).textContent = c.fmt(p[c.key]);
      root.querySelector(`#cl-${c.key}`).value = p[c.key];
    }
  };

  for (const c of CONTROLS) {
    root.querySelector(`#cl-${c.key}`).addEventListener("input", (e) => {
      p[c.key] = Number(e.target.value);
      syncLabels();
      render();
    });
  }
  root.querySelector("#cl-reset").addEventListener("click", () => {
    Object.assign(p, DEFAULTS);
    syncLabels();
    render();
  });
  root.querySelector("#cl-loud").addEventListener("click", () => {
    Object.assign(p, DEFAULTS, { knowledge: 0.45, confidence: 2.4, bias: 0.25 });
    syncLabels();
    render();
  });
  root.querySelector("#cl-best").addEventListener("click", () => {
    let best = { c: 1, v: Infinity };
    for (let c = 0.2; c <= 3.001; c += 0.05) {
      const v = brier(forecast(w, { ...p, confidence: c }, 0), w);
      if (v < best.v) best = { c, v };
    }
    p.confidence = Number(best.c.toFixed(2));
    syncLabels();
    render();
  });

  syncLabels();
  render();
}
