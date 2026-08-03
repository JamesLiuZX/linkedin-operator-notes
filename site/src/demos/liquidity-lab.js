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

import { statRow, lineChart, legend, fmt, esc, tableView } from "../viz/charts.js";

export const meta = {
  slug: "liquidity-lab",
  title: "Liquidity lab",
  tagline: "Put a dollar figure on 'this market feels dead'.",
  section: "markets",
  pillar: "Market design",
  essay: "06-dead-markets-poison",
  blurb:
    "An LMSR sandbox that turns a liquidity complaint into a budget line. Set the slippage a user should feel, read off the subsidy it costs, and see the resting depth that would match it.",
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

const CONTROLS = [
  { key: "b", label: "Liquidity parameter b", min: 200, max: 40000, step: 200, fmt: (v) => fmt.int(v) },
  { key: "price", label: "Starting price", min: 0.05, max: 0.95, step: 0.01, fmt: (v) => fmt.cents(v) },
  { key: "order", label: "Order size", min: 25, max: 20000, step: 25, fmt: (v) => `$${fmt.int(v)}` },
  { key: "bookMakers", label: "Book: levels per side", min: 1, max: 20, step: 1, fmt: (v) => fmt.int(v) },
  { key: "bookSize", label: "Book: size per level", min: 25, max: 2000, step: 25, fmt: (v) => `${fmt.int(v)} sh` },
  { key: "bookStep", label: "Book: tick between levels", min: 0.5, max: 5, step: 0.5, fmt: (v) => `${v.toFixed(1)}c` },
];

export function mount(root) {
  const p = { ...DEFAULTS };

  root.innerHTML = `
    <div class="demo-grid lab">
      <section class="demo-input">
        <div class="controls">${CONTROLS.map(
          (c) => `
          <label class="control" for="ll-${c.key}">
            <span class="control-label">${esc(c.label)}<b class="mono" id="ll-${c.key}-v"></b></span>
            <input type="range" id="ll-${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${p[c.key]}" />
          </label>`
        ).join("")}</div>
        <div class="row-actions">
          <button id="ll-reset" class="btn-ghost">Reset</button>
          <button id="ll-dead" class="btn-ghost">Load a dead market</button>
          <button id="ll-real" class="btn-ghost">Load one that feels real</button>
        </div>
        <p class="model-note">Worst-case subsidy is b times ln 2. That is the number to take into the budget conversation, because it is the largest cheque the market maker can ever be asked to write.</p>
      </section>
      <section class="demo-output" id="ll-out"></section>
    </div>`;

  const out = root.querySelector("#ll-out");

  const render = () => {
    const amm = buyLmsr(p.order, p.price, p.b);
    const book = buyBook(p.order, p.price, p);
    const worstCase = p.b * Math.LN2;

    const target = 0.005; // half a percent
    const bNeeded = bForSlippage(p.order, p.price, target);

    // Impact curve: marginal price against dollars spent, three subsidy levels.
    const bs = [Math.max(200, p.b / 4), p.b, p.b * 4];
    const impact = bs.map((b, i) => {
      const pts = [];
      for (let d = 0; d <= p.order * 2; d += Math.max(5, (p.order * 2) / 60)) {
        pts.push([d, buyLmsr(d, p.price, b).pEnd]);
      }
      return { label: `b = ${fmt.int(b)}`, points: pts };
    });

    // Slippage against order size, same three subsidy levels.
    const slip = bs.map((b) => {
      const pts = [];
      for (let d = 25; d <= p.order * 3; d += Math.max(25, (p.order * 3) / 50)) {
        pts.push([d, buyLmsr(d, p.price, b).slippagePct * 100]);
      }
      return { label: `b = ${fmt.int(b)}`, points: pts };
    });

    const tone = amm.slippagePct > 0.03 ? "critical" : amm.slippagePct > 0.01 ? "warning" : "good";

    out.innerHTML = `
      ${statRow([
        { label: "Slippage on this order", value: fmt.pct(amm.slippagePct, 2), sub: `avg ${fmt.cents(amm.avg)} vs ${fmt.cents(p.price)} mid`, tone },
        { label: "Worst-case subsidy", value: `$${fmt.int(worstCase)}`, sub: "b times ln 2" },
        { label: "Price after fill", value: fmt.cents(amm.pEnd), sub: `moved ${((amm.pEnd - p.price) * 100).toFixed(2)}c` },
        { label: "Same order, resting book", value: book.filled ? fmt.pct(book.slippagePct, 2) : "unfillable", sub: book.filled ? `avg ${fmt.cents(book.avg)}` : `only $${fmt.int(book.spent)} available`, tone: book.filled ? "" : "critical" },
      ])}

      <div class="chart-block">
        <h4>Price impact: what a $${fmt.int(p.order)} order does to the screen</h4>
        ${lineChart(impact, {
          xLabel: "dollars bought",
          xFormat: (v) => `$${fmt.int(v)}`,
          yFormat: (v) => fmt.cents(v),
          yDomain: [p.price, Math.min(0.999, Math.max(...impact.flatMap((s) => s.points.map((x) => x[1]))))],
          guide: { y: p.price, label: "starting mid" },
        })}
        ${legend(impact.map((s) => ({ label: s.label })))}
        <p class="chart-note">Quadrupling b flattens the curve. It also quadruples the cheque. That trade is the entire liquidity conversation, and it is usually had without either number on the table.</p>
      </div>

      <div class="chart-block">
        <h4>Slippage against order size</h4>
        ${lineChart(slip, {
          xLabel: "order size, dollars",
          xFormat: (v) => `$${fmt.int(v)}`,
          yFormat: (v) => `${v.toFixed(1)}%`,
          yDomain: [0, Math.max(1, Math.max(...slip.flatMap((s) => s.points.map((x) => x[1]))))],
          guide: { y: 0.5, label: "0.5% target" },
        })}
        ${legend(slip.map((s) => ({ label: s.label })))}
      </div>

      <div class="takeaway-box">
        <strong>The budget line.</strong>
        <p>To hold slippage at or under <b class="mono">0.50%</b> for a <b class="mono">$${fmt.int(p.order)}</b> order at <b class="mono">${fmt.cents(p.price)}</b>, you need <b class="mono">b = ${fmt.int(bNeeded)}</b>, which is a worst-case subsidy of <b class="mono">$${fmt.int(bNeeded * Math.LN2)}</b> per market.</p>
        <p>Listing 40 markets at that depth is a <b class="mono">$${fmt.int(bNeeded * Math.LN2 * 40)}</b> worst-case commitment. Listing four is <b class="mono">$${fmt.int(bNeeded * Math.LN2 * 4)}</b>. That arithmetic is the argument against a full calendar, and it is more persuasive than any opinion about focus.</p>
      </div>

      ${tableView(
        ["Venue", "Shares filled", "Average price", "Slippage", "Notes"],
        [
          ["LMSR", fmt.int(amm.shares), fmt.cents(amm.avg), fmt.pct(amm.slippagePct, 2), `b = ${fmt.int(p.b)}, worst case $${fmt.int(worstCase)}`],
          ["Resting book", fmt.int(book.shares), fmt.cents(book.avg), book.filled ? fmt.pct(book.slippagePct, 2) : "n/a", book.filled ? `${p.bookMakers} levels x ${p.bookSize} sh` : `order exceeds displayed depth`],
        ],
        { caption: "Same order, two venue designs" }
      )}`;
  };

  const syncLabels = () => {
    for (const c of CONTROLS) {
      root.querySelector(`#ll-${c.key}-v`).textContent = c.fmt(p[c.key]);
      root.querySelector(`#ll-${c.key}`).value = p[c.key];
    }
  };

  for (const c of CONTROLS) {
    root.querySelector(`#ll-${c.key}`).addEventListener("input", (e) => {
      p[c.key] = Number(e.target.value);
      syncLabels();
      render();
    });
  }
  root.querySelector("#ll-reset").addEventListener("click", () => {
    Object.assign(p, DEFAULTS);
    syncLabels();
    render();
  });
  root.querySelector("#ll-dead").addEventListener("click", () => {
    Object.assign(p, DEFAULTS, { b: 400, order: 2000, bookMakers: 3, bookSize: 60, bookStep: 3 });
    syncLabels();
    render();
  });
  root.querySelector("#ll-real").addEventListener("click", () => {
    Object.assign(p, DEFAULTS, { b: 24000, order: 2000, bookMakers: 14, bookSize: 900, bookStep: 0.5 });
    syncLabels();
    render();
  });

  syncLabels();
  render();
}
