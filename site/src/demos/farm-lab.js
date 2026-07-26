// site/src/demos/farm-lab.js
//
// What a liquidity rewards program actually buys.
//
// Modelled on Polymarket's published maker-rewards rule:
//   S(v) = ((max_spread - order_spread) / max_spread)^2 * order_size
//   Q_min = min(Q_one, Q_two); one-sided liquidity is penalised by a factor of 3
//   the daily pool is split pro-rata by score across sampled epochs
//
// The rule has no term for whether the order ever fills. That single gap is the
// whole farming surface, and this demo exists to make it visible in dollars.
//
// Deterministic and analytic, not Monte Carlo, so the same sliders always give
// the same answer and anyone can check the arithmetic.

import { statRow, stackedBar, lineChart, depthLadder, legend, fmt, esc, tableView, meter } from "../viz/charts.js";

export const meta = {
  slug: "farm-lab",
  title: "Farm lab",
  tagline: "Move the sliders until your rewards program is buying nothing.",
  section: "markets",
  pillar: "Market design",
  essay: "04-rewards-vs-farming",
  blurb:
    "A liquidity-rewards simulator built on Polymarket's published quadratic scoring rule. Shows the number nobody reports: dollars paid per dollar of liquidity that actually filled.",
  buildNote:
    "Analytic, not Monte Carlo. Same inputs, same output, every time. The scoring function is the real one; the participant behaviour is a model and is labelled as such.",
};

const EPOCHS = 288; // 5-minute sampling across a day

export const DEFAULTS = {
  pool: 5000, // daily reward pool, USD
  maxSpread: 3, // cents from midpoint
  minSize: 100, // shares
  honest: 12, // honest makers
  farmers: 18, // reward farmers
  honestSpread: 1.8, // cents; they need edge, so they quote wider
  honestSize: 900, // shares
  cancelRate: 0.85, // share of incoming flow the farmer pulls away from
  takerVolume: 120000, // shares/day of taker flow
  requireTwoSided: true,
  fillFloor: 0, // disqualify below this fill rate. The proposed fix.
};

/** The published Polymarket scoring function. */
export function scoreOrder(spreadCents, size, maxSpread) {
  if (spreadCents > maxSpread) return 0;
  const q = (maxSpread - spreadCents) / maxSpread;
  return q * q * size;
}

export function simulate(p) {
  const { pool, maxSpread, minSize, honest, farmers, honestSpread, honestSize,
    cancelRate, takerVolume, requireTwoSided, fillFloor } = p;

  // Farmers sit as close to the midpoint as the tick allows, at exactly min size.
  const farmerSpread = 0.1;
  const perFarmer = scoreOrder(farmerSpread, minSize, maxSpread);
  const perHonest = scoreOrder(honestSpread, honestSize, maxSpread);

  // Two-sided is Q_min = min(Q_one, Q_two). Both cohorts quote symmetrically
  // here, so Q_min equals the per-side score. Single-sided takes the /3 penalty.
  const sidePenalty = requireTwoSided ? 1 : 1 / 3;
  const farmerScore = perFarmer * sidePenalty;
  const honestScore = perHonest * sidePenalty;

  // --- fills -------------------------------------------------------------
  // Farmers are tighter, so they are first in the queue for incoming flow.
  const farmerDisplayed = farmers * minSize;
  const honestDisplayed = honest * honestSize;

  const farmerCapacity = farmerDisplayed * EPOCHS;
  const honestCapacity = honestDisplayed * EPOCHS;

  const farmerAttempted = Math.min(takerVolume, farmerCapacity);
  const farmerFilled = farmerAttempted * (1 - cancelRate);
  const residual = Math.max(0, takerVolume - farmerFilled);
  const honestFilled = Math.min(residual, honestCapacity);

  const farmerFillRate = farmerAttempted > 0 ? farmerFilled / farmerAttempted : 0;
  const honestAttempted = Math.min(residual, honestCapacity);
  const honestFillRate = honestAttempted > 0 ? honestFilled / honestAttempted : 1;

  // --- the fix: disqualify makers whose orders do not fill ---------------
  const farmerQualifies = farmerFillRate >= fillFloor;
  const honestQualifies = honestFillRate >= fillFloor;

  const farmerPool = farmerQualifies ? farmers * farmerScore : 0;
  const honestPool = honestQualifies ? honest * honestScore : 0;
  const totalScore = farmerPool + honestPool;

  const farmerReward = totalScore > 0 ? (pool * farmerPool) / totalScore : 0;
  const honestReward = totalScore > 0 ? (pool * honestPool) / totalScore : 0;

  const totalFilled = farmerFilled + honestFilled;
  const costPerFilled = totalFilled > 0 ? pool / totalFilled : Infinity;

  // --- what the taker experiences ---------------------------------------
  // Quoted spread is what the book shows. Realised is what they got after the
  // tight orders vanished.
  const quotedSpread = farmerDisplayed > 0 ? farmerSpread : honestSpread;
  const realisedSpread =
    totalFilled > 0
      ? (farmerFilled * farmerSpread + honestFilled * honestSpread) / totalFilled
      : honestSpread;

  const displayedDepth = farmerDisplayed + honestDisplayed;
  const fillableDepth = farmerDisplayed * (1 - cancelRate) + honestDisplayed;

  return {
    farmerReward, honestReward,
    farmerFilled, honestFilled, totalFilled,
    farmerFillRate, honestFillRate,
    costPerFilled,
    quotedSpread, realisedSpread,
    displayedDepth, fillableDepth,
    farmerShare: pool > 0 ? farmerReward / pool : 0,
    farmerQualifies, honestQualifies,
    perFarmer, perHonest,
  };
}

/* ------------------------------------------------------------------- view */

const CONTROLS = [
  { key: "pool", label: "Daily reward pool", min: 500, max: 20000, step: 500, fmt: (v) => `$${fmt.int(v)}` },
  { key: "maxSpread", label: "Max spread (scoring cutoff)", min: 1, max: 6, step: 0.5, fmt: (v) => `${v}c` },
  { key: "minSize", label: "Min order size", min: 20, max: 500, step: 20, fmt: (v) => `${fmt.int(v)} sh` },
  { key: "farmers", label: "Reward farmers", min: 0, max: 60, step: 1, fmt: (v) => fmt.int(v) },
  { key: "honest", label: "Honest makers", min: 0, max: 40, step: 1, fmt: (v) => fmt.int(v) },
  { key: "honestSpread", label: "Honest maker spread", min: 0.5, max: 5, step: 0.1, fmt: (v) => `${v.toFixed(1)}c` },
  { key: "cancelRate", label: "Farmer cancel rate", min: 0, max: 0.98, step: 0.02, fmt: (v) => fmt.pct(v) },
  { key: "takerVolume", label: "Taker flow", min: 10000, max: 500000, step: 10000, fmt: (v) => `${fmt.int(v / 1000)}k sh` },
  { key: "fillFloor", label: "Fill-rate floor (the fix)", min: 0, max: 0.6, step: 0.05, fmt: (v) => (v === 0 ? "off" : fmt.pct(v)) },
];

export function mount(root) {
  const p = { ...DEFAULTS };

  root.innerHTML = `
    <div class="demo-grid lab">
      <section class="demo-input">
        <div class="controls">${CONTROLS.map(
          (c) => `
          <label class="control" for="fl-${c.key}">
            <span class="control-label">${esc(c.label)}<b class="mono" id="fl-${c.key}-v"></b></span>
            <input type="range" id="fl-${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${p[c.key]}" />
          </label>`
        ).join("")}
        <label class="control check">
          <input type="checkbox" id="fl-twosided" ${p.requireTwoSided ? "checked" : ""} />
          <span>Require two-sided quoting (else /3 penalty)</span>
        </label>
        </div>
        <div class="row-actions">
          <button id="fl-reset" class="btn-ghost">Reset</button>
          <button id="fl-broken" class="btn-ghost">Load "looks fine, buys nothing"</button>
        </div>
        <p class="model-note">The scoring function is Polymarket's published rule. Participant behaviour is a model, and the fill mechanics are the part you should argue with.</p>
      </section>
      <section class="demo-output" id="fl-out"></section>
    </div>`;

  const out = root.querySelector("#fl-out");

  const render = () => {
    const r = simulate(p);
    const capital = r.costPerFilled;

    // Sweep cancel rate to show where the program stops buying anything.
    const sweep = [];
    const sweepShare = [];
    for (let c = 0; c <= 0.98; c += 0.02) {
      const s = simulate({ ...p, cancelRate: c });
      sweep.push([c, Math.min(s.costPerFilled, 1)]);
      sweepShare.push([c, s.farmerShare]);
    }

    // A depth ladder: which resting orders actually earn.
    const levels = [];
    for (let i = 3; i >= 1; i--) {
      const sp = p.honestSpread * (i / 2);
      levels.push({ side: "ask", price: 0.5 + sp / 100, size: p.honest * p.honestSize / 3, rewarded: sp <= p.maxSpread });
    }
    levels.push({ side: "ask", price: 0.5 + 0.001, size: p.farmers * p.minSize, rewarded: true });
    levels.push({ side: "bid", price: 0.5 - 0.001, size: p.farmers * p.minSize, rewarded: true });
    for (let i = 1; i <= 3; i++) {
      const sp = p.honestSpread * (i / 2);
      levels.push({ side: "bid", price: 0.5 - sp / 100, size: p.honest * p.honestSize / 3, rewarded: sp <= p.maxSpread });
    }

    const wasted = r.farmerReward;
    const verdictTone = capital > 0.15 ? "critical" : capital > 0.05 ? "warning" : "good";

    out.innerHTML = `
      ${statRow([
        {
          label: "Cost per filled share",
          value: Number.isFinite(capital) ? `$${capital.toFixed(3)}` : "no fills",
          sub: "the number nobody reports",
          tone: verdictTone,
        },
        { label: "Farmer capture", value: fmt.pct(r.farmerShare), sub: `$${fmt.int(r.farmerReward)} of $${fmt.int(p.pool)}` },
        { label: "Quoted spread", value: fmt.cents(r.quotedSpread / 100), sub: "what the book shows" },
        { label: "Realised spread", value: fmt.cents(r.realisedSpread / 100), sub: "what the taker got", tone: r.realisedSpread > r.quotedSpread * 3 ? "serious" : "" },
      ])}

      <div class="chart-block">
        <h4>Where the pool went</h4>
        ${stackedBar([
          { label: "Farmers", value: r.farmerReward, color: "var(--cat-2)" },
          { label: "Honest makers", value: r.honestReward, color: "var(--cat-1)" },
        ], { format: (v) => fmt.pct(v) })}
        ${legend([
          { label: `Farmers  $${fmt.int(r.farmerReward)}`, color: "var(--cat-2)" },
          { label: `Honest makers  $${fmt.int(r.honestReward)}`, color: "var(--cat-1)" },
        ])}
      </div>

      <div class="chart-block">
        <h4>Displayed depth is not fillable depth</h4>
        ${meter({ label: "Displayed depth", value: r.displayedDepth, max: r.displayedDepth || 1, display: `${fmt.int(r.displayedDepth)} sh` })}
        ${meter({ label: "Fillable depth", value: r.fillableDepth, max: r.displayedDepth || 1, display: `${fmt.int(r.fillableDepth)} sh`, tone: r.fillableDepth < r.displayedDepth * 0.6 ? "critical" : "" })}
        <p class="chart-note">The gap is the part of the book that disappears the moment someone tries to trade against it.</p>
      </div>

      <div class="chart-block">
        <h4>Cost per filled share, as farmers get better at cancelling</h4>
        ${lineChart([{ label: "cost per filled share", points: sweep, color: "var(--cat-2)" }], {
          xLabel: "farmer cancel rate",
          xFormat: (v) => `${(v * 100).toFixed(0)}%`,
          yFormat: (v) => `$${v.toFixed(2)}`,
          yDomain: [0, Math.max(0.05, Math.min(1, Math.max(...sweep.map((s) => s[1])) * 1.1))],
          guide: { y: Math.min(1, capital), label: "you are here" },
        })}
        <p class="chart-note">The curve is convex. A program that looks efficient at a 40% cancel rate is not close to efficient at 85%, and cancel rate is the one variable the venue does not control.</p>
      </div>

      <div class="chart-block">
        <h4>Which resting orders earn</h4>
        ${depthLadder(levels)}
        <p class="chart-note">Solid earns, faded does not. Farmers hold the two rows nearest the midpoint at exactly minimum size, which is where the quadratic pays the most per share committed.</p>
      </div>

      ${tableView(
        ["Cohort", "Count", "Score each", "Reward", "Filled (sh)", "Fill rate", "Qualifies"],
        [
          ["Farmers", fmt.int(p.farmers), r.perFarmer.toFixed(1), `$${fmt.int(r.farmerReward)}`, fmt.int(r.farmerFilled), fmt.pct(r.farmerFillRate), r.farmerQualifies ? "yes" : "no"],
          ["Honest makers", fmt.int(p.honest), r.perHonest.toFixed(1), `$${fmt.int(r.honestReward)}`, fmt.int(r.honestFilled), fmt.pct(r.honestFillRate), r.honestQualifies ? "yes" : "no"],
        ],
        { caption: "Cohort outcomes at the current settings" }
      )}

      <div class="takeaway-box">
        <strong>What this run says.</strong>
        ${
          !Number.isFinite(capital)
            ? "<p>Nothing filled. The pool paid for a picture of a market.</p>"
            : `<p>You paid <b class="mono">$${fmt.int(p.pool)}</b> and bought <b class="mono">${fmt.int(r.totalFilled)}</b> filled shares, at <b class="mono">$${capital.toFixed(3)}</b> each. Farmers took <b class="mono">${fmt.pct(r.farmerShare)}</b> of the pool and filled <b class="mono">${fmt.pct(r.farmerFilled / (r.totalFilled || 1))}</b> of the volume.</p>
               ${p.fillFloor > 0 && !r.farmerQualifies ? '<p>The fill-rate floor disqualified the farmers. Note what happened to cost per filled share when you turned it on.</p>' : "<p>Try dragging the fill-rate floor above the farmer fill rate. That one term is the whole fix, and it is the term the published rule does not have.</p>"}`
        }
      </div>`;
  };

  const syncLabels = () => {
    for (const c of CONTROLS) {
      root.querySelector(`#fl-${c.key}-v`).textContent = c.fmt(p[c.key]);
      root.querySelector(`#fl-${c.key}`).value = p[c.key];
    }
    root.querySelector("#fl-twosided").checked = p.requireTwoSided;
  };

  for (const c of CONTROLS) {
    root.querySelector(`#fl-${c.key}`).addEventListener("input", (e) => {
      p[c.key] = Number(e.target.value);
      syncLabels();
      render();
    });
  }
  root.querySelector("#fl-twosided").addEventListener("change", (e) => {
    p.requireTwoSided = e.target.checked;
    render();
  });
  root.querySelector("#fl-reset").addEventListener("click", () => {
    Object.assign(p, DEFAULTS);
    syncLabels();
    render();
  });
  root.querySelector("#fl-broken").addEventListener("click", () => {
    Object.assign(p, DEFAULTS, { farmers: 45, minSize: 40, cancelRate: 0.94, honest: 6, fillFloor: 0 });
    syncLabels();
    render();
  });

  syncLabels();
  render();
}
