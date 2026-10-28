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
//
// The maths below the meta block is unchanged; the view is built with the kit.
// The headline is what the pool paid farmers against what those farmers filled.
// Cost per filled share (pool / shares filled) stays on the page as a stat, but
// it cannot lead: it divides by volume, so it reads the same for a farmed
// program and a healthy one (essay 10, "The metric is the alibi").

import { stackedBar, barsH, lineChart, depthLadder, legend, fmt, esc } from "../viz/charts.js";
import { calculator, card, chartCard, hl, table } from "./kit.js";
import "./farm-lab.css";

export const meta = {
  slug: "farm-lab",
  title: "Rewards Check",
  tagline: "Is your liquidity-rewards program buying real liquidity?",
  section: "markets",
  pillar: "Market design",
  // 04-rewards-vs-farming is the personal-experience essay this demo was
  // originally scoped for; it stays held pending evidence only the author has.
  // 10-the-metric-is-the-alibi is a second, fully public companion piece built
  // entirely from this demo's own deterministic run, so the "read the essay"
  // link below has somewhere to go in the meantime.
  essay: "10-the-metric-is-the-alibi",
  blurb:
    "A rewards program pays makers for quoting tight, whether or not their orders ever fill. Pick a scenario to see how much of the pool goes to quotes that vanish when someone tries to trade.",
  how: [
    "A liquidity-rewards simulator built on Polymarket's published quadratic scoring rule. It prices what the pool bought: dollars paid for each share that actually filled, and who collected them.",
    "The rule pays a resting order for its size and for how tight it quotes, and tightness is squared, so the tightest quotes earn far more. It has no term for whether the order ever fills. That single gap is the whole farming surface, and this page makes it visible in dollars.",
    "Farmers sit as close to the midpoint as the tick allows, at exactly the minimum size, and pull their quotes when trades arrive. Honest makers quote wider, at real size, and stay to be filled.",
    "The scoring function is Polymarket's published rule. Participant behaviour is a model, and the fill mechanics are the part you should argue with.",
  ],
  formulas: [
    { label: "Score for one order", expr: "((max spread − order spread) / max spread)² × order size, and zero past the max spread" },
    { label: "Two-sided quoting", expr: "Q_min = min(Q_one, Q_two); a one-sided quote is scored at a third" },
    { label: "Payout", expr: "daily pool × score / total score of everyone who qualifies" },
    { label: "Shares a farmer fills", expr: "trades that reach them × (1 − cancel rate)" },
    { label: "Cost per filled share", expr: "daily pool / shares filled" },
    { label: "Fill-rate floor", expr: "a group whose fill rate is below the floor earns no reward" },
  ],
  sources: [
    { label: "Polymarket docs: liquidity rewards", href: "https://docs.polymarket.com/market-makers/liquidity-rewards" },
    { label: "Start Polymarket: reward farming", href: "https://startpolymarket.com/strategies/reward-farming/" },
  ],
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

const FARMER = "var(--cat-2)";
const HONEST = "var(--cat-1)";
const FLOOR_MAX = 0.6; // the top of the fill-rate floor slider

const usd = (v) => `$${fmt.int(v)}`;
const usd3 = (v) => `$${v.toFixed(3)}`;
// Whole percents, the precision the page shows, so a status never contradicts
// the two figures printed beside it.
const whole = (share) => Math.round(share * 100);

// The old "Load ..." button, as a named scenario. Each starts from DEFAULTS.
const SCENARIOS = [
  { id: "base", label: "Base case" },
  {
    id: "farmed",
    label: "Looks fine, buys nothing",
    values: { farmers: 45, minSize: 40, cancelRate: 0.94, honest: 6, fillFloor: 0 },
  },
].map((s) => ({
  ...s,
  note: (v) =>
    `${fmt.int(v.farmers)} farmers and ${fmt.int(v.honest)} honest makers share a ${usd(v.pool)} daily pool. Farmers pull their quotes ahead of ${fmt.pct(v.cancelRate)} of incoming trades.`,
}));

const CONTROLS = [
  {
    key: "farmers",
    label: "Reward farmers",
    help: "Makers who quote tight at the minimum size and pull the order when a trade arrives.",
    min: 0,
    max: 60,
    step: 1,
    format: (v) => fmt.int(v),
  },
  {
    key: "cancelRate",
    label: "How often farmers pull out",
    hint: "cancel rate",
    help: "The share of incoming trades that find their quotes already gone.",
    min: 0,
    max: 0.98,
    step: 0.02,
    format: (v) => fmt.pct(v),
  },
  {
    key: "fillFloor",
    label: "Minimum fill rate to earn",
    hint: "the fix",
    help: "Makers whose quotes fill less often than this earn nothing. The published rule has no such term.",
    min: 0,
    max: FLOOR_MAX,
    step: 0.05,
    format: (v) => (v === 0 ? "Off" : fmt.pct(v)),
  },
];

const MORE = [
  { heading: "The program" },
  {
    key: "pool",
    label: "Daily reward pool",
    help: "What the venue pays out each day.",
    min: 500,
    max: 20000,
    step: 500,
    format: (v) => usd(v),
  },
  {
    key: "maxSpread",
    label: "Scoring cutoff",
    hint: "max spread",
    help: "Quotes further than this from the midpoint score nothing.",
    min: 1,
    max: 6,
    step: 0.5,
    format: (v) => `${v}c`,
  },
  {
    key: "minSize",
    label: "Minimum order size",
    help: "The smallest order that earns, in shares.",
    min: 20,
    max: 500,
    step: 20,
    format: (v) => `${fmt.int(v)} shares`,
  },
  {
    key: "requireTwoSided",
    type: "toggle",
    label: "Require quotes on both sides",
    help: "Off applies the published one-sided penalty: a score is divided by 3.",
  },
  { heading: "The makers" },
  {
    key: "honest",
    label: "Honest makers",
    help: "Makers who quote wider, at real size, and stay to be filled.",
    min: 0,
    max: 40,
    step: 1,
    format: (v) => fmt.int(v),
  },
  {
    key: "honestSpread",
    label: "How wide honest makers quote",
    hint: "from the midpoint",
    help: "They need an edge, so they sit further out than farmers.",
    min: 0.5,
    max: 5,
    step: 0.1,
    format: (v) => `${v.toFixed(1)}c`,
  },
  { heading: "Trading" },
  {
    key: "takerVolume",
    label: "Daily trading flow",
    hint: "taker flow",
    help: "Shares traders try to trade each day.",
    min: 10000,
    max: 500000,
    step: 10000,
    format: (v) => `${fmt.int(v / 1000)}k shares`,
  },
];

/**
 * The status and the verdict sentence, from the run. Status is a comparison the
 * run itself makes: what farmers were paid against what they filled, and
 * whether they took more of the pool than the honest makers did.
 */
function judge(p, r, fillShare) {
  const pool = usd(p.pool);
  const paid = r.farmerReward + r.honestReward;

  if (paid <= 0) {
    return {
      tone: "warn",
      status: "Nobody qualifies",
      verdict: "The fill-rate floor cuts the farmers out, and with no honest makers left, none of the pool is paid.",
    };
  }
  if (p.farmers === 0) {
    return {
      tone: "good",
      status: "No farmers",
      verdict: `With no farmers, honest makers take the whole ${hl(pool)} pool for ${hl(fmt.int(r.totalFilled))} filled shares, ${hl(usd3(r.costPerFilled))} each.`,
    };
  }
  if (!r.farmerQualifies) {
    return {
      tone: "good",
      status: "Farmers cut out",
      verdict: `The fill-rate floor cuts the farmers out: their quotes fill only ${hl(fmt.pct(r.farmerFillRate))} of the trades that reach them, under the ${hl(fmt.pct(p.fillFloor))} floor. Honest makers split the whole ${hl(pool)}.`,
    };
  }
  if (p.takerVolume - r.totalFilled > 1) {
    return {
      tone: "bad",
      status: "Trades go unfilled",
      verdict: `Only ${hl(fmt.int(r.totalFilled))} of the ${hl(fmt.int(p.takerVolume))} shares traders try to trade each day find a fill: farmers pull their quotes and too few honest makers are left. Each filled share costs ${hl(usd3(r.costPerFilled))}.`,
    };
  }
  if (whole(r.farmerShare) <= whole(fillShare)) {
    return {
      tone: "good",
      status: "Paid no more than they fill",
      verdict: `Farmers collect ${hl(usd(r.farmerReward))} of the ${hl(pool)} daily pool and fill ${hl(fmt.pct(fillShare))} of the volume, so they are paid no more than they deliver.`,
    };
  }
  const majority = r.farmerReward > r.honestReward;
  const fix = r.farmerFillRate < FLOOR_MAX ? " Set the fill-rate floor above that and they earn nothing." : "";
  return {
    tone: majority ? "bad" : "warn",
    status: majority ? "Farmers take most of the pool" : "Paid more than they fill",
    verdict: `Farmers collect ${hl(usd(r.farmerReward))} of the ${hl(pool)} daily pool, and their quotes fill only ${hl(fmt.pct(r.farmerFillRate))} of the trades that reach them.${fix}`,
  };
}

/**
 * A y-axis top whose quarter is a round step, so the four gridlines read
 * $0.02, $0.04, ... and not $0.01, $0.03, $0.04 from rounding $0.0125 steps.
 */
function niceTop(max) {
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const steps = mag >= 0.1 ? [1, 2, 2.5, 5, 10] : [1, 2, 5, 10];
  return 4 * mag * steps.find((m) => m * mag >= raw - 1e-12);
}

/** One stacked bar with its own title and a legend that carries the numbers. */
function split(title, farmers, honest, farmerLabel, honestLabel) {
  return `
    <div class="rc-split">
      <p class="rc-split-title">${esc(title)}</p>
      ${stackedBar(
        [
          { label: "Farmers", value: farmers, color: FARMER },
          { label: "Honest makers", value: honest, color: HONEST },
        ],
        { format: (v) => fmt.pct(v), height: 34 }
      )}
      ${legend([
        { label: farmerLabel, color: FARMER },
        { label: honestLabel, color: HONEST },
      ])}
    </div>`;
}

function view(p) {
  const r = simulate(p);
  const capital = r.costPerFilled;

  // Nobody is quoting, so there is nothing to compare.
  if (!Number.isFinite(capital)) {
    return {
      hero: {
        label: "Shares filled",
        value: "None",
        tone: "bad",
        status: "Nothing fills",
        verdict: "Nobody is quoting, so nothing fills and no reward is paid.",
      },
    };
  }

  const fillShare = r.farmerFilled / r.totalFilled;
  const { tone, status, verdict } = judge(p, r, fillShare);

  // Sweep cancel rate to show where the program stops buying anything.
  const sweep = [];
  for (let c = 0; c <= 0.98; c += 0.02) {
    const s = simulate({ ...p, cancelRate: c });
    sweep.push([c, Math.min(s.costPerFilled, 1)]);
  }
  const lowest = Math.min(...sweep.map((s) => s[1]));
  const highest = Math.max(...sweep.map((s) => s[1]));
  const flat = highest <= lowest * 1.01;
  const capped = (v) => (v >= 1 ? "$1 or more" : usd3(v));

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

  // When the book cannot fill every trade, say that: the split of the fills
  // that did happen is not the story.
  const unfilled = p.takerVolume - r.totalFilled > 1;
  const chartTitle =
    p.farmers === 0
      ? "With no farmers, honest makers collect the whole pool."
      : unfilled
        ? `Farmers collect ${fmt.pct(r.farmerShare)} of the pool, and ${fmt.pct(1 - r.totalFilled / p.takerVolume)} of the trades find no fill.`
        : `Farmers collect ${fmt.pct(r.farmerShare)} of the pool for ${fmt.pct(fillShare)} of the fills.`;

  return {
    hero: {
      label: "Reward pool paid to farmers",
      value: r.farmerReward,
      format: usd,
      unit: `of the ${usd(p.pool)} daily pool`,
      tone,
      status,
      verdict,
      stats: [
        { label: "Cost per filled share", value: usd3(capital), sub: "pool divided by shares filled" },
        {
          label: "Spread traders actually get",
          value: fmt.cents(r.realisedSpread / 100),
          sub: `the book shows ${fmt.cents(r.quotedSpread / 100)}`,
        },
        {
          label: "Depth you can trade against",
          value: fmt.int(r.fillableDepth),
          sub: `of ${fmt.int(r.displayedDepth)} shares on the book`,
        },
      ],
    },
    chart: {
      title: chartTitle,
      body: `<div class="rc-splits">${split(
        "Where the pool went",
        r.farmerReward,
        r.honestReward,
        `Farmers ${usd(r.farmerReward)} (${fmt.pct(r.farmerShare)})`,
        `Honest makers ${usd(r.honestReward)} (${fmt.pct(r.honestReward / p.pool)})`
      )}${split(
        "Who filled the trades",
        r.farmerFilled,
        r.honestFilled,
        `Farmers ${fmt.int(r.farmerFilled)} shares (${fmt.pct(fillShare)})`,
        `Honest makers ${fmt.int(r.honestFilled)} shares (${fmt.pct(1 - fillShare)})`
      )}</div>`,
      note: "The published rule pays for quotes close to the midpoint. It has no term for whether the order ever fills.",
    },
    breakdown:
      chartCard({
        title: `The book shows ${fmt.int(r.displayedDepth)} shares. ${fmt.int(r.fillableDepth)} can actually be traded against.`,
        body: `<div class="rc-narrow">${barsH(
          [
            { label: "Displayed", value: r.displayedDepth, color: "var(--seq-3)" },
            { label: "Fillable", value: r.fillableDepth, color: "var(--seq-6)" },
          ],
          { format: (v) => fmt.int(v) }
        )}</div>`,
        fit: true,
        note: "The gap is the part of the book that disappears the moment someone tries to trade against it.",
      }) +
      chartCard({
        title: flat
          ? `Cost per filled share holds at ${usd3(capital)} however often farmers pull out.`
          : `Cost per filled share climbs from ${usd3(sweep[0][1])} to ${capped(sweep[sweep.length - 1][1])} as farmers pull out more.`,
        body: lineChart([{ label: "cost per filled share", points: sweep, color: "var(--cat-2)" }], {
          xLabel: "How often farmers pull out (cancel rate)",
          xFormat: (v) => `${(v * 100).toFixed(0)}%`,
          yFormat: (v) => `$${v.toFixed(2)}`,
          yDomain: [0, niceTop(Math.max(0.05, Math.min(1, highest * 1.1)))],
          guide: { y: Math.min(1, capital), label: "you are here" },
        }),
        note: flat
          ? "The headline number cannot tell a farmed program from a healthy one: it divides the pool by the volume, and the volume is the same either way."
          : "Honest makers cannot absorb the trades farmers walk away from, and cancel rate is the one variable the venue does not control.",
      }) +
      chartCard({
        title: "Farmers hold the two rows nearest the midpoint, where the rule pays most per share.",
        body: `<div class="rc-narrow">${depthLadder(levels)}${legend([
          { label: "Bids, the buy side", color: "var(--cat-1)" },
          { label: "Asks, the sell side", color: "var(--cat-2)" },
        ])}</div>`,
        note: "Solid rows earn and faded rows earn nothing. Farmers sit at exactly the minimum size, which is where the quadratic pays the most per share committed.",
      }) +
      card({
        title: "Who earned what, and who actually filled",
        body: table(
          ["Group", "Makers", "Score each", "Reward", "Shares filled", "Fill rate", "Qualifies"],
          [
            ["Farmers", fmt.int(p.farmers), r.perFarmer.toFixed(1), usd(r.farmerReward), fmt.int(r.farmerFilled), fmt.pct(r.farmerFillRate), r.farmerQualifies ? "Yes" : "No"],
            ["Honest makers", fmt.int(p.honest), r.perHonest.toFixed(1), usd(r.honestReward), fmt.int(r.honestFilled), fmt.pct(r.honestFillRate), r.honestQualifies ? "Yes" : "No"],
          ],
          { numeric: [1, 2, 3, 4, 5] }
        ),
      }),
  };
}

export function mount(root) {
  calculator(root, { defaults: DEFAULTS, scenarios: SCENARIOS, controls: CONTROLS, more: MORE, view });
}
