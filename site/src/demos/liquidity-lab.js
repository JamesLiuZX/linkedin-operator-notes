// site/src/demos/liquidity-lab.js
//
// What it costs to make a market feel real.
//
// The operator question this answers: a user is about to put $500 into a market
// at 50c. How much worse than 50c do they actually get, and what does it cost me
// to make that number small enough that they come back?
//
// Uses Hanson's LMSR, because it is the one market maker whose worst-case
// subsidy has a closed form, which makes it the only honest way to put a
// liquidity decision in a budget line:
//
//   C(q) = b * ln(1 + e^(q/b))        cost function, binary, q = net YES shares
//   p(q) = 1 / (1 + e^(-q/b))         marginal price
//   worst-case subsidy = b * ln(2)    the cheque you are writing
//
// Then it prices the same order against a thin order book, so you can read off
// how much resting depth a given subsidy is worth.
//
// The maths below the meta block is unchanged; the view is built with the kit.

import { lineChart, legend, fmt } from "../viz/charts.js";
import { calculator, card, chartCard, hl, stats, table } from "./kit.js";

export const meta = {
  slug: "liquidity-lab",
  title: "Market Depth Budget",
  tagline: "What does it cost to make a market feel alive?",
  section: "markets",
  pillar: "Market design",
  essay: "06-dead-markets-poison",
  blurb:
    "A thin market moves against every order, and users notice. Pick a scenario to see what one order pays over the mid, and what it costs to make that number small.",
  how: [
    "An LMSR sandbox that turns a liquidity complaint into a budget line. Set the slippage a user should feel, read off the subsidy it costs, and see the resting depth that would match it.",
    "It uses Hanson's LMSR because it is the one market maker whose worst-case subsidy has a closed form, which makes it the only honest way to put a liquidity decision in a budget line. Then it prices the same order against a thin order book, so you can read off how much resting depth a given subsidy is worth.",
    "Worst-case subsidy is b times ln 2. That is the number to take into the budget conversation, because it is the largest cheque the market maker can ever be asked to write.",
  ],
  formulas: [
    { label: "Cost function, binary market (q is net YES shares)", expr: "C(q) = b × ln(1 + e^(q/b))" },
    { label: "Marginal price", expr: "p(q) = 1 / (1 + e^(−q/b))" },
    { label: "Worst-case subsidy", expr: "b × ln 2" },
  ],
  buildNote:
    "Closed-form LMSR, no simulation. b * ln(2) is the worst-case loss, which is why this is the market maker to reason with even if you ship an order book.",
};

export const DEFAULTS = {
  b: 2000, // LMSR liquidity parameter, in shares
  price: 0.5, // starting marginal price
  order: 500, // order size in dollars
  fee: 0.0, // taker fee in bps of notional
  bookMakers: 8, // resting makers per side
  bookSize: 250, // shares each
  bookStep: 1.0, // cents between levels
};

/* -------------------------------------------------------------------- LMSR */

const cost = (q, b) => b * Math.log(1 + Math.exp(q / b));
const priceAt = (q, b) => 1 / (1 + Math.exp(-q / b));
/** Inventory q that puts the marginal price at p. */
const qForPrice = (p, b) => b * Math.log(p / (1 - p));

/** Buy `dollars` of YES starting from marginal price p0. Returns the fill. */
export function buyLmsr(dollars, p0, b) {
  const q0 = qForPrice(p0, b);
  const c0 = cost(q0, b);
  // Solve for shares s such that cost(q0+s) - c0 == dollars. Monotone, so bisect.
  let lo = 0;
  let hi = Math.max(dollars * 4, b * 8);
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (cost(q0 + mid, b) - c0 < dollars) lo = mid;
    else hi = mid;
  }
  const shares = (lo + hi) / 2;
  const avg = shares > 0 ? dollars / shares : p0;
  const pEnd = priceAt(q0 + shares, b);
  return { shares, avg, pEnd, slippage: avg - p0, slippagePct: (avg - p0) / p0 };
}

/** Same order against a discrete resting book. */
export function buyBook(dollars, p0, { bookMakers, bookSize, bookStep }) {
  let spent = 0;
  let shares = 0;
  for (let lvl = 1; lvl <= bookMakers; lvl++) {
    const px = Math.min(0.999, p0 + (lvl * bookStep) / 100);
    const avail = bookSize;
    const canSpend = avail * px;
    if (spent + canSpend >= dollars) {
      const rest = dollars - spent;
      shares += rest / px;
      spent = dollars;
      break;
    }
    spent += canSpend;
    shares += avail;
  }
  const filled = spent >= dollars;
  const avg = shares > 0 ? spent / shares : p0;
  return {
    shares, avg, filled, spent,
    slippage: avg - p0,
    slippagePct: (avg - p0) / p0,
  };
}

/** Smallest b that keeps slippage on `dollars` at or under `target`. */
export function bForSlippage(dollars, p0, target) {
  let lo = 10;
  let hi = 5_000_000;
  for (let i = 0; i < 70; i++) {
    const mid = Math.sqrt(lo * hi);
    if (buyLmsr(dollars, p0, mid).slippagePct > target) lo = mid;
    else hi = mid;
  }
  return hi;
}

/* ------------------------------------------------------------------- view */

const TARGET = 0.005; // half a percent: the slippage bar the essay argues for

// The old "Load ..." buttons, as named scenarios. Each starts from DEFAULTS.
const SCENARIOS = [
  { id: "base", label: "Base case" },
  { id: "dead", label: "A dead market", values: { b: 400, order: 2000, bookMakers: 3, bookSize: 60, bookStep: 3 } },
  { id: "real", label: "One that feels real", values: { b: 24000, order: 2000, bookMakers: 14, bookSize: 900, bookStep: 0.5 } },
].map((s) => ({
  ...s,
  note: (v) =>
    `A $${fmt.int(v.order)} order at ${fmt.cents(v.price)}, market depth ${fmt.int(v.b)}, ${v.bookMakers} book levels a side.`,
}));

const CONTROLS = [
  {
    key: "b",
    label: "Market depth",
    hint: "LMSR b",
    help: "Deeper markets move less per dollar, and cost more to back.",
    min: 200,
    max: 40000,
    step: 200,
    format: (v) => fmt.int(v),
  },
  {
    key: "order",
    label: "Order size",
    help: "What one user puts in.",
    min: 25,
    max: 20000,
    step: 25,
    format: (v) => `$${fmt.int(v)}`,
  },
];

const MORE = [
  {
    key: "price",
    label: "Starting price",
    hint: "the mid",
    help: "Where the market sits before the order.",
    min: 0.05,
    max: 0.95,
    step: 0.01,
    format: (v) => fmt.cents(v),
  },
  { heading: "Order book, for comparison" },
  { key: "bookMakers", label: "Price levels per side", min: 1, max: 20, step: 1, format: (v) => fmt.int(v) },
  { key: "bookSize", label: "Shares at each level", min: 25, max: 2000, step: 25, format: (v) => `${fmt.int(v)} shares` },
  { key: "bookStep", label: "Gap between levels", hint: "tick", min: 0.5, max: 5, step: 0.5, format: (v) => `${v.toFixed(1)}c` },
];

/** Name a comparison depth by its ratio to the one being tested. */
function depthLabel(b, base) {
  if (b === base) return "This depth";
  const r = b / base;
  if (r === 4) return "4× depth";
  if (r === 0.5) return "½ depth";
  if (r === 0.25) return "¼ depth";
  return `${+r.toFixed(2)}× depth`;
}

function view(p) {
  const amm = buyLmsr(p.order, p.price, p.b);
  const book = buyBook(p.order, p.price, p);
  const worstCase = p.b * Math.LN2;
  const bNeeded = bForSlippage(p.order, p.price, TARGET);
  const needed = bNeeded * Math.LN2;

  // Impact curve: marginal price against dollars spent, three subsidy levels.
  const bs = [Math.max(200, p.b / 4), p.b, p.b * 4];
  const impact = bs.map((b) => {
    const pts = [];
    for (let d = 0; d <= p.order * 2; d += Math.max(5, (p.order * 2) / 60)) {
      pts.push([d, buyLmsr(d, p.price, b).pEnd]);
    }
    return { label: depthLabel(b, p.b), points: pts };
  });

  // Slippage against order size, same three subsidy levels.
  const slip = bs.map((b) => {
    const pts = [];
    for (let d = 25; d <= p.order * 3; d += Math.max(25, (p.order * 3) / 50)) {
      pts.push([d, buyLmsr(d, p.price, b).slippagePct * 100]);
    }
    return { label: depthLabel(b, p.b), points: pts };
  });

  const within = amm.slippagePct <= TARGET;
  const tone = within ? "good" : amm.slippagePct > 0.03 ? "bad" : "warn";
  const order = `$${fmt.int(p.order)}`;

  const verdict = within
    ? `A ${hl(order)} order fills at an average ${hl(fmt.cents(amm.avg))}, ${hl(fmt.pct(amm.slippagePct, 2))} over the ${fmt.cents(p.price)} mid. The cheapest depth that holds the 0.5% target costs ${hl(`$${fmt.int(needed)}`)} per market, worst case.`
    : `A ${hl(order)} order fills at an average ${hl(fmt.cents(amm.avg))}, ${hl(fmt.pct(amm.slippagePct, 2))} over the ${fmt.cents(p.price)} mid. Holding it to 0.5% would cost ${hl(`$${fmt.int(needed)}`)} per market, worst case.`;

  // Where the slippage curve at this depth crosses the target, from its samples.
  const mine = slip[1].points;
  const firstOver = mine.findIndex(([, s]) => s > TARGET * 100);
  const slipTitle =
    firstOver === -1
      ? `At this depth, every order up to $${fmt.int(mine[mine.length - 1][0])} stays inside the 0.5% target.`
      : firstOver === 0
        ? `At this depth, even a $${fmt.int(mine[0][0])} order slips past the 0.5% target.`
        : `At this depth, orders over about $${fmt.int(mine[firstOver - 1][0])} slip past the 0.5% target.`;

  const venueTitle = book.filled
    ? `A resting book fills this order at ${fmt.pct(book.slippagePct, 2)} slippage, against ${fmt.pct(amm.slippagePct, 2)} from the market maker.`
    : `The resting book cannot fill this order: only $${fmt.int(book.spent)} is on it.`;

  return {
    hero: {
      label: "Worst-case cost of this depth",
      value: worstCase,
      format: (v) => `$${fmt.int(v)}`,
      unit: "per market",
      tone,
      status: within ? "Inside the 0.5% target" : "Over the 0.5% target",
      verdict,
      stats: [
        { label: "Price after the order", value: fmt.cents(amm.pEnd), sub: `moved ${((amm.pEnd - p.price) * 100).toFixed(2)}c` },
        {
          label: "Same order on an order book",
          value: book.filled ? fmt.pct(book.slippagePct, 2) : "Not enough depth",
          sub: book.filled ? `slippage, average ${fmt.cents(book.avg)}` : `only $${fmt.int(book.spent)} on the book`,
        },
        { label: "Depth for the 0.5% target", value: fmt.int(bNeeded), sub: `this market has ${fmt.int(p.b)}` },
      ],
    },
    chart: {
      title: "Four times the depth flattens the curve. It also costs four times as much.",
      body:
        lineChart(impact, {
          xLabel: "Dollars bought",
          xFormat: (v) => `$${fmt.int(v)}`,
          yFormat: (v) => fmt.cents(v),
          yDomain: [p.price, Math.min(0.999, Math.max(...impact.flatMap((s) => s.points.map((x) => x[1]))))],
          guide: { y: p.price, label: "starting mid" },
        }) + legend(impact.map((s, i) => ({ label: `${s.label}, $${fmt.int(bs[i] * Math.LN2)} worst case` }))),
      note: "That trade is the entire liquidity conversation, and it is usually had without either number on the table.",
    },
    breakdown:
      chartCard({
        title: slipTitle,
        body:
          lineChart(slip, {
            xLabel: "Order size",
            xFormat: (v) => `$${fmt.int(v)}`,
            yFormat: (v) => `${v.toFixed(1)}%`,
            yDomain: [0, Math.max(1, Math.max(...slip.flatMap((s) => s.points.map((x) => x[1]))))],
            guide: { y: 0.5, label: "0.5% target" },
          }) + legend(slip.map((s) => ({ label: s.label }))),
      }) +
      card({
        title: `Listing 40 markets at this standard is a $${fmt.int(needed * 40)} worst-case commitment. Four is $${fmt.int(needed * 4)}.`,
        body: `
          <p>Holding a ${hl(order)} order at ${hl(fmt.cents(p.price))} to 0.5% slippage takes depth ${hl(fmt.int(bNeeded))}, a worst case of ${hl(`$${fmt.int(needed)}`)} per market.</p>
          ${stats([
            { label: "One market", value: `$${fmt.int(needed)}` },
            { label: "Four markets", value: `$${fmt.int(needed * 4)}` },
            { label: "Forty markets", value: `$${fmt.int(needed * 40)}` },
          ])}
          <p>That arithmetic is the argument against a full calendar, and it is more persuasive than any opinion about focus.</p>`,
      }) +
      card({
        title: venueTitle,
        body: table(
          ["Venue", "Shares filled", "Average price", "Slippage", "Notes"],
          [
            ["Market maker (LMSR)", fmt.int(amm.shares), fmt.cents(amm.avg), fmt.pct(amm.slippagePct, 2), `depth ${fmt.int(p.b)}, worst case $${fmt.int(worstCase)}`],
            [
              "Resting book",
              fmt.int(book.shares),
              fmt.cents(book.avg),
              book.filled ? fmt.pct(book.slippagePct, 2) : "n/a",
              book.filled ? `${p.bookMakers} levels × ${fmt.int(p.bookSize)} shares` : "order exceeds displayed depth",
            ],
          ],
          { numeric: [1, 2, 3] }
        ),
      }),
  };
}

export function mount(root) {
  calculator(root, { defaults: DEFAULTS, scenarios: SCENARIOS, controls: CONTROLS, more: MORE, view });
}
