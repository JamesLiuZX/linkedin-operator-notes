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
//
// The maths below the meta block is unchanged; the view is built with the kit.

import { barsH, lineChart, reliabilityPlot, legend, fmt } from "../viz/charts.js";
import { calculator, card, chartCard, hl, table } from "./kit.js";
import "./calibration-lab.css";

export const meta = {
  slug: "calibration-lab",
  title: "Forecast Scorecard",
  tagline: "Are your forecasts as good as they feel?",
  section: "agents",
  pillar: "Agents on rails",
  essay: "08-the-harness-is-the-edge",
  blurb:
    "A forecaster can sound sure without knowing more. Compare a simulated agent with published benchmarks, then turn its confidence up and see what the extra certainty costs.",
  how: [
    "Brier scores, reliability diagrams, and the decomposition that separates knowing things from sounding sure. Benchmarked against published market and LLM forecast accuracy.",
    "Benchmark scores are published figures. The agent is simulated across 400 seeded markets, so the same slider position always gives the same result.",
    "Knowledge is how much signal the forecaster has. Confidence is how hard it pushes its forecasts toward 0 or 1. Turning confidence up with no extra knowledge makes forecasts feel sharper and score worse, which is the failure mode this page exists to make visible.",
    "The ordering to take away: an unaided frontier model scores worse than the market it wants to trade against, and worse than the general public. Scaffolding closes the gap. The edge is the harness, not the model.",
    "The market baseline is a simulated forecaster tuned until its Brier score lands on the published 0.09, so the skill score and the benchmark bar always agree. The markets sit far enough from 50 cents that every published benchmark here is reachable. In a world of coin flips the market baseline would be out of reach.",
  ],
  formulas: [
    { label: "Brier score", expr: "average of (forecast − outcome)² over the 400 markets" },
    { label: "Skill against the market", expr: "1 − your Brier score / the market's Brier score" },
    { label: "Murphy decomposition", expr: "Brier = reliability − resolution + uncertainty" },
    {
      label: "The simulated forecaster",
      expr: "sigmoid(confidence × (knowledge × logit(true probability) + noise × (1 − knowledge)) + bias)",
    },
  ],
  sources: [
    {
      label: "Keyrock: prediction market accuracy and Brier scores",
      href: "https://keyrock.com/knowledge-hub/prediction-market-accuracy-brier-scores/",
    },
    { label: "arXiv 2511.07678: the AIA Forecaster", href: "https://arxiv.org/pdf/2511.07678" },
    { label: "Hindcast, arXiv 2607.14051: the best general LLM forecaster", href: "https://arxiv.org/html/2607.14051" },
  ],
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

// The old "Load ..." button, as a named scenario. Each starts from DEFAULTS.
const SCENARIOS = [
  { id: "base", label: "Base case" },
  { id: "loud", label: "Confident and wrong", values: { knowledge: 0.45, confidence: 2.4, bias: 0.25 } },
].map((s) => ({
  ...s,
  note: (v) =>
    `Knowledge ${fmt.pct(v.knowledge)}, confidence ${v.confidence.toFixed(2)}x, ${
      v.bias === 0 ? "no lean" : v.bias > 0 ? "leaning toward yes" : "leaning toward no"
    }.`,
}));

const signed = (v, digits = 2) => `${v < 0 ? "−" : v > 0 ? "+" : ""}${Math.abs(v).toFixed(digits)}`;

const CONTROLS = [
  {
    key: "knowledge",
    label: "What it actually knows",
    hint: "knowledge",
    help: "How much of the real signal it recovers. More is better.",
    min: 0,
    max: 0.95,
    step: 0.01,
    format: (v) => fmt.pct(v),
  },
  {
    key: "confidence",
    label: "How sure it sounds",
    hint: "confidence",
    help: "How hard it pushes forecasts toward 0% or 100%. It adds no knowledge.",
    min: 0.2,
    max: 3,
    step: 0.05,
    format: (v) => `${v.toFixed(2)}x`,
  },
];

const MORE = [
  {
    key: "bias",
    label: "Lean toward yes",
    hint: "directional bias",
    help: "Nudges every forecast the same way. Below zero leans toward no.",
    min: -1.5,
    max: 1.5,
    step: 0.05,
    format: (v) => signed(v),
  },
];

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

export function mount(root) {
  const w = world();

  // The baseline has to BE the published market number, otherwise the skill
  // score on the left disagrees with the benchmark bar on the right and the
  // whole demo stops being trustworthy. So: solve for the knowledge level whose
  // simulated Brier lands on the published 0.09, and use that same forecaster
  // for the reliability diagram.
  const marketBrier = BENCHMARKS.find((b) => b.label.startsWith("Market price")).value;
  const publicBrier = BENCHMARKS.find((b) => b.label === "General public").value;
  const frontierBrier = BENCHMARKS.find((b) => b.label.startsWith("Frontier")).value;
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

  // Sweep confidence at fixed knowledge. The whole point of the demo.
  const sweepFor = (p) => {
    const sweep = [];
    for (let c = 0.2; c <= 3.001; c += 0.05) {
      sweep.push([c, brier(forecast(w, { ...p, confidence: c }, 0), w)]);
    }
    return sweep;
  };
  const bestOf = (sweep) => sweep.reduce((a, b) => (b[1] < a[1] ? b : a));

  function view(p) {
    const preds = forecast(w, p, 0);
    const bs = brier(preds, w);
    const d = decompose(preds, w, p.bins);
    const md = decompose(marketPreds, w, p.bins);
    const bss = 1 - bs / marketBrier; // skill against the market baseline

    const sweep = sweepFor(p);
    const best = bestOf(sweep);
    const bestX = `${best[0].toFixed(2)}x`;
    const atBest = Math.abs(p.confidence - best[0]) < 0.025; // within half a slider step

    const bars = [
      ...BENCHMARKS.map((b) => ({ label: b.label, value: b.value, note: b.note, color: "var(--seq-3)" })),
      { label: "Your agent", value: bs, color: "var(--cat-2)", note: "simulated" },
    ].sort((a, b) => a.value - b.value);
    const rank = bars.findIndex((b) => b.label === "Your agent") + 1;

    const tone = bs <= marketBrier ? "good" : bs <= publicBrier ? "warn" : "bad";
    const status = { good: "Beats the market", warn: "Behind the market", bad: "Behind the general public" }[tone];

    let verdict;
    if (bs <= marketBrier) {
      verdict = `Your agent scores ${hl(bs.toFixed(3))}, ahead of the market's ${hl(marketBrier.toFixed(3))}. Before you believe that, check the miscalibration: a good total can hide a badly calibrated middle.`;
    } else if (atBest) {
      verdict = `Your agent scores ${hl(bs.toFixed(3))}, behind the market's ${hl(marketBrier.toFixed(3))}. Its confidence is already at the best setting for this much knowledge, ${hl(bestX)}.`;
    } else if (best[1] <= marketBrier) {
      verdict = `Your agent scores ${hl(bs.toFixed(3))}, behind the market's ${hl(marketBrier.toFixed(3))}. At its best confidence, ${hl(bestX)}, it would score ${hl(best[1].toFixed(3))}, ahead of the market. The knowledge is there, but the confidence is off.`;
    } else {
      verdict = `Your agent scores ${hl(bs.toFixed(3))}, behind the market's ${hl(marketBrier.toFixed(3))}. At its best confidence, ${hl(bestX)}, it would score ${hl(best[1].toFixed(3))}, still behind the market. Confidence alone cannot close the gap.`;
    }

    const chartTitle =
      rank === 1
        ? "Your agent beats every published forecaster on this chart."
        : rank === bars.length
          ? `Your agent ranks last of ${bars.length}, behind every published forecaster.`
          : `Your agent ranks ${ordinal(rank)} of ${bars.length}.`;

    // The most confident bucket of forecasts: what the agent says against what happens.
    const top = d.points[d.points.length - 1];

    const lowest = sweep[0][0];
    const highest = sweep[sweep.length - 1][0];
    const sweepTitle =
      best[0] <= lowest + 1e-9
        ? `At this much knowledge, the best confidence is the lowest on the slider, ${bestX}.`
        : best[0] >= highest - 1e-9
          ? `At this much knowledge, the best confidence is the highest on the slider, ${bestX}.`
          : `Your agent would score best at ${bestX} confidence. Past that, extra certainty costs score.`;

    return {
      hero: {
        label: "Your agent's Brier score",
        value: bs,
        format: (v) => v.toFixed(3),
        unit: "lower is better",
        tone,
        status,
        verdict,
        stats: [
          { label: "Against the market", value: signed(bss, 3), sub: "skill score, 0 is a tie" },
          { label: "Miscalibration", value: d.reliability.toFixed(4), sub: "reliability, fixable without new knowledge" },
          { label: "Discrimination", value: d.resolution.toFixed(4), sub: "resolution, higher is better" },
        ],
      },
      chart: {
        title: chartTitle,
        body: barsH(bars, { format: (v) => v.toFixed(3), width: 560, labelW: 225 }),
        note: `Lower is better, so a shorter bar is a better forecaster. The unaided frontier model at ${frontierBrier.toFixed(3)} scores worse than the general public at ${publicBrier.toFixed(3)}. That is the finding that should change how you scope an agent.`,
      },
      breakdown:
        `<div class="sc-pair">${chartCard({
          title: `When your agent says ${fmt.pct(top[0])}, it happens ${fmt.pct(top[1])} of the time.`,
          body:
            reliabilityPlot([
              { label: "Market baseline", points: md.points.map((q) => [q[0], q[1]]) },
              { label: "Your agent", points: d.points.map((q) => [q[0], q[1]]) },
            ]) + legend([{ label: "Market baseline" }, { label: "Your agent" }], { scatter: true }),
          note: "Dots on the diagonal mean that when it says 70%, the thing happens 70% of the time. Dots below the line on the right mean overconfidence, which is what the confidence slider manufactures. The market baseline is simulated to match the published 0.09.",
        })}${chartCard({
          title: sweepTitle,
          body: lineChart([{ label: "Brier", points: sweep, color: "var(--cat-2)" }], {
            xLabel: "How sure the agent sounds (confidence multiplier)",
            xFormat: (v) => `${v.toFixed(1)}x`,
            yFormat: (v) => v.toFixed(3),
            // Domain deliberately includes the market baseline, so the reader can
            // see how far below the curve it sits even at the agent's best setting.
            yDomain: [
              Math.min(marketBrier, ...sweep.map((s) => s[1])) * 0.95,
              Math.max(...sweep.map((s) => s[1])) * 1.02,
            ],
            guide: { y: marketBrier, label: "market baseline" },
          }),
          note:
            best[0] >= highest - 1e-9
              ? "The dashed line is the market baseline. Here the extra confidence is backed by enough knowledge to pay for itself."
              : "Everything to the right of the minimum buys confidence with no extra knowledge, and pays for it in score. The dashed line is the market baseline.",
        })}</div>` +
        card({
          title: "Published benchmarks and your agent",
          body: table(
            ["Forecaster", "Brier", "Source"],
            [
              ...BENCHMARKS.map((b) => [b.label, b.value.toFixed(3), b.note]),
              ["Your agent (simulated)", bs.toFixed(3), `knowledge ${fmt.pct(p.knowledge)}, confidence ${p.confidence.toFixed(2)}x`],
            ],
            { numeric: [1] }
          ),
        }),
    };
  }

  calculator(root, {
    defaults: DEFAULTS,
    scenarios: SCENARIOS,
    controls: CONTROLS,
    more: MORE,
    actions: [
      {
        label: "Find best confidence",
        run(state) {
          state.confidence = Number(bestOf(sweepFor(state))[0].toFixed(2));
        },
      },
    ],
    view,
  });
}
