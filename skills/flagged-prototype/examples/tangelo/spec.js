// Tangelo: the weekly shop. A flagged prototype spec.
//
// Tangelo is a fictional grocery delivery app. Every name, price and number
// here is made up. The six switches match the six points of the PRD in
// ../../../decision-prd/examples/tangelo/prd.json, ID for ID.

/* ---------- data (illustrative) ---------- */

const TINT = { milk: "#e8f1fb", bread: "#f7ecd9", egg: "#fbf3d6", apple: "#fbe4e1", leaf: "#e3f3e2", coffee: "#efe6de", cheese: "#fdf2c9", pasta: "#f6ecd2", tomato: "#fde3df", yogurt: "#ece9fb" };

const ICON = {
  milk: '<path d="M9 3h6v3l2 4v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V10l2-4V3Z" fill="#fff" stroke="#4b7bb5" stroke-width="1.5" stroke-linejoin="round"/><path d="M7 13h10" stroke="#4b7bb5" stroke-width="1.5"/>',
  bread: '<path d="M4 11a4 4 0 0 1 4-5h8a4 4 0 0 1 4 5v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7Z" fill="#e7b877" stroke="#9a6a2c" stroke-width="1.5"/><path d="M9 6v3M13 6v3" stroke="#9a6a2c" stroke-width="1.5" stroke-linecap="round"/>',
  egg: '<path d="M12 3c3.2 0 6 5 6 9.5a6 6 0 0 1-12 0C6 8 8.8 3 12 3Z" fill="#fff" stroke="#b08a1e" stroke-width="1.5"/>',
  apple: '<path d="M12 8c-1.5-1.6-5.5-1.4-5.5 3.4 0 4 2.6 8.1 5.5 6.6 2.9 1.500 5.5-2.600 5.5-6.600 0-4.800-4-5-5.500-3.400Z" fill="#e2594b" stroke="#a5332a" stroke-width="1.4"/><path d="M12 8c0-2 1-3.500 2.500-4" stroke="#3f7a3a" stroke-width="1.5" stroke-linecap="round" fill="none"/>',
  leaf: '<path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14Z" fill="#6fb86a" stroke="#3f7a3a" stroke-width="1.5" stroke-linejoin="round"/><path d="M5 19 14 10" stroke="#3f7a3a" stroke-width="1.5" stroke-linecap="round"/>',
  coffee: '<path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z" fill="#fff" stroke="#7a5236" stroke-width="1.5"/><path d="M16 11h1.500a2 2 0 0 1 0 4H16" stroke="#7a5236" stroke-width="1.5" fill="none"/><path d="M8 5.500c0-1 1-1 1-2M12 5.500c0-1 1-1 1-2" stroke="#7a5236" stroke-width="1.4" stroke-linecap="round" fill="none"/>',
  cheese: '<path d="M3 15 15 6l6 5v7H3v-3Z" fill="#f4cf4f" stroke="#a9861a" stroke-width="1.5" stroke-linejoin="round"/><circle cx="9" cy="15" r="1.4" fill="#a9861a"/><circle cx="15" cy="13" r="1.1" fill="#a9861a"/>',
  pasta: '<path d="M5 6c2 2 2 10 0 12M10 6c2 2 2 10 0 12M15 6c2 2 2 10 0 12M19 8c1 2 1 6 0 8" stroke="#b98a2c" stroke-width="1.8" stroke-linecap="round" fill="none"/>',
  tomato: '<circle cx="12" cy="13" r="7" fill="#e2594b" stroke="#a5332a" stroke-width="1.4"/><path d="M12 6c-1-1.500-3-1.500-4-.500M12 6c1-1.500 3-1.500 4-.500M12 6V4" stroke="#3f7a3a" stroke-width="1.5" stroke-linecap="round" fill="none"/>',
  yogurt: '<path d="M6 8h12l-1.500 11a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1L6 8Z" fill="#fff" stroke="#6a5bc0" stroke-width="1.5" stroke-linejoin="round"/><path d="M5 8h14" stroke="#6a5bc0" stroke-width="1.8" stroke-linecap="round"/>',
};

const thumb = (k) => `<span class="p-thumb" style="--tint:${TINT[k] || "#f1f2ee"}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k] || ""}</svg></span>`;
const money = (n) => `$${n.toFixed(2)}`;

const SLOTS = [
  { id: "today-6", day: "Today", time: "6 to 7pm" },
  { id: "tom-8", day: "Tomorrow", time: "8 to 9am" },
  { id: "tom-6", day: "Tomorrow", time: "6 to 7pm" },
];

const SWAP = {
  oat: { name: "Oat milk barista 1L", diff: 0.3 },
  sourdough: { name: "Seeded loaf 800g", diff: 0 },
};

const RULES = { similar: "Similar item", named: "A named swap", none: "Do not swap" };

function basket() {
  return [
    { id: "milk", icon: "milk", name: "Whole milk 2L", price: 2.1, was: 1.9, qty: 2, rule: "similar" },
    { id: "oat", icon: "milk", name: "Oat milk 1L", price: 1.85, was: 1.85, qty: 1, rule: "similar", oos: true },
    { id: "sourdough", icon: "bread", name: "Sourdough loaf", price: 3.4, was: 3.4, qty: 1, rule: "similar", oos: true },
    { id: "eggs", icon: "egg", name: "Free range eggs, 12", price: 3.95, was: 3.45, qty: 1, rule: "none" },
    { id: "apples", icon: "apple", name: "Pink Lady apples, 6", price: 2.8, was: 2.8, qty: 1, rule: "similar" },
    { id: "spinach", icon: "leaf", name: "Baby spinach 200g", price: 1.6, was: 1.6, qty: 2, rule: "similar" },
    { id: "coffee", icon: "coffee", name: "Ground coffee 250g", price: 5.2, was: 4.7, qty: 1, rule: "named" },
    { id: "cheddar", icon: "cheese", name: "Mature cheddar 350g", price: 3.75, was: 3.75, qty: 1, rule: "similar" },
  ];
}

const REST = { n: 13, total: 30.05 }; // the part of the shop below the fold, unchanged from last week
const kept = (d) => d.items.filter((i) => !i.removed);
const count = (d) => REST.n + kept(d).reduce((n, i) => n + i.qty, 0);
const subtotal = (d) => REST.total + kept(d).reduce((n, i) => n + (i.price + (i.swapped ? SWAP[i.id].diff : 0)) * i.qty, 0);
const rises = (d) => d.items.filter((i) => i.price > i.was);
const riseTotal = (d) => rises(d).reduce((n, i) => n + (i.price - i.was) * i.qty, 0);
const missing = (d) => d.items.filter((i) => i.oos && !i.swapped && !i.removed);

/* ---------- screens ---------- */

const BACK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 5 8l5 5"/></svg>';
const TAB = {
  home: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 9.500 10 3l7 6.500V17H3V9.500Z"/></svg>',
  search: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="9" cy="9" r="5.500"/><path d="m13.500 13.500 3.500 3.500"/></svg>',
  orders: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 6h12l-1 11H5L4 6Z"/><path d="M7 6a3 3 0 0 1 6 0"/></svg>',
  you: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="10" cy="7" r="3.200"/><path d="M4 17c.800-3 3.200-4.500 6-4.500s5.200 1.500 6 4.500"/></svg>',
};

const tabbar = (on) => `
  <nav class="p-tabbar">
    <button class="${on === "home" ? "on" : ""}" data-go="home">${TAB.home}Home</button>
    <button data-toast-text="Search is not part of this prototype. It covers the reorder journey only.">${TAB.search}Search</button>
    <button class="${on === "orders" ? "on" : ""}" data-go="orders">${TAB.orders}Orders</button>
    <button data-toast-text="Account opens your profile and payment methods.">${TAB.you}You</button>
  </nav>`;

function slotStrip(ctx) {
  const d = ctx.data;
  return `
    <div class="p-card has-pin" ${ctx.flag("3.1")}>
      ${ctx.pin("3.1")}
      <div class="p-card-row"><h3 style="font-size:13px">Next delivery slots</h3><small style="font-size:11px;color:var(--a-muted)">Held for 20 min once you start</small></div>
      <div class="p-slots">
        ${SLOTS.map((s) => `<button class="p-slot${d.slot === s.id ? " on" : ""}" data-act="slot" data-k="${s.id}"><b>${s.day}</b>${s.time}</button>`).join("")}
      </div>
    </div>`;
}

function home(ctx) {
  const d = ctx.data;
  return `
  <div class="p-scroll">
    <div class="p-top"><span class="p-addr">Deliver to <b>14 Linden Road</b></span><span class="p-avatar">M</span></div>
    <h1 class="p-h1">Good evening, Maya</h1>
    <div class="p-search"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="7" cy="7" r="4.500"/><path d="m10.500 10.500 3 3"/></svg>Search 4,000 items</div>

    ${ctx.on("3.1") ? slotStrip(ctx) : ""}

    ${
      ctx.on("1.1")
        ? `<div class="p-card brand has-pin" ${ctx.flag("1.1")}>
        ${ctx.pin("1.1")}
        <div class="p-card-row">
          <div><h3>Your usual shop</h3><p>${count(d)} items, about $${Math.round(subtotal(d) + 2.8)}. Last ordered Tuesday.</p></div>
          <button class="p-btn light" data-act="reorder" data-cta="reorder">Reorder</button>
        </div>
      </div>`
        : ""
    }

    ${
      ctx.on("1.2")
        ? `<div class="has-pin" ${ctx.flag("1.2")}>
        <div class="p-h"><span>Running low?${ctx.pin("1.2").replace('class="pin"', 'class="pin inline"')}</span><small>From how often you buy</small></div>
        <div class="p-strip">
          ${[
            ["milk", "Whole milk 2L", "Every 6 days"],
            ["egg", "Eggs, 12", "Every 9 days"],
            ["coffee", "Ground coffee", "Every 3 weeks"],
          ]
            .map(
              ([k, n, r]) => `<div class="p-mini">${thumb(k)}<button class="p-add" data-act="add" data-k="${n}" aria-label="Add ${n}">+</button><b>${n}</b><small>${r}</small></div>`
            )
            .join("")}
        </div>
      </div>`
        : ""
    }

    <div class="p-chips">
      ${["For you", "Fruit and veg", "Bakery", "Dairy", "Pantry"].map((c, i) => `<button class="p-chip${i === 0 ? " on" : ""}" data-toast-text="Categories are not part of this prototype.">${c}</button>`).join("")}
    </div>
    <div class="p-banner"><b>Free delivery over $40</b>On every order this week.</div>
    <div class="p-h"><span>Popular this week</span><small>See all</small></div>
    <div class="p-grid">
      ${[
        ["tomato", "Vine tomatoes", "$2.20"],
        ["pasta", "Fresh tagliatelle", "$2.95"],
        ["yogurt", "Greek yoghurt", "$1.80"],
        ["apple", "Pink Lady, 6", "$2.80"],
      ]
        .map(([k, n, p]) => `<div class="p-tile">${thumb(k)}<button class="p-add" data-act="add" data-k="${n}" aria-label="Add ${n}">+</button><b>${n}</b><small>${p}</small></div>`)
        .join("")}
    </div>
    <p class="p-fine">Concept for review. Prices and items are illustrative.</p>
  </div>
  ${tabbar("home")}`;
}

function orders() {
  return `
  <div class="p-scroll">
    <div class="p-top"><span class="p-addr"><b>Orders</b></span><span class="p-avatar">M</span></div>
    <h1 class="p-h1">Past orders</h1>
    ${[
      ["Tuesday 10 Nov", "23 items", "$61.20"],
      ["Tuesday 3 Nov", "21 items", "$57.85"],
      ["Wednesday 28 Oct", "26 items", "$68.10"],
    ]
      .map(
        ([day, n, t], i) => `
      <div class="p-card">
        <div class="p-card-row"><div><h3 style="font-size:14px">${day}</h3><p>${n} · ${t}</p></div>
        <button class="p-btn sm ghost" ${i === 0 ? 'data-act="reorder"' : 'data-toast-text="Opens that order as an editable basket."'}>Reorder</button></div>
      </div>`
      )
      .join("")}
    <p class="p-fine">Today this is the only way to repeat a shop: Orders, the order, Reorder.</p>
  </div>
  ${tabbar("orders")}`;
}

function basketScreen(ctx) {
  const d = ctx.data;
  const gone = missing(d);
  const slot = SLOTS.find((s) => s.id === d.slot);
  const row = (i) => {
    const swapped = i.oos && i.swapped;
    const name = swapped ? SWAP[i.id].name : i.name;
    const price = swapped ? i.price + SWAP[i.id].diff : i.price;
    const struck = i.oos && !i.swapped && ctx.on("2.1");
    return `
    <div class="p-row${struck ? " oos" : ""}">
      ${thumb(i.icon)}
      <div>
        <b>${name}</b>
        ${
          struck
            ? "<small>Out of stock today</small>"
            : `<span class="p-step"><button data-act="qty" data-k="${i.id}:-1" aria-label="One fewer">−</button><span>${i.qty}</span><button data-act="qty" data-k="${i.id}:1" aria-label="One more">+</button></span>`
        }
        ${ctx.on("2.2") && !struck ? `<br><button class="p-rule" data-sheet-open="rule" data-k="${i.id}" ${ctx.flag("2.2")}>If out: ${RULES[i.rule].toLowerCase()} ▾</button>` : ""}
      </div>
      <span class="p-price">${struck ? "" : money(price * i.qty)}${ctx.on("3.2") && i.price > i.was && !struck ? `<small style="color:var(--a-warn)">was ${money(i.was * i.qty)}</small>` : ""}</span>
    </div>`;
  };

  return `
  <div class="p-scroll">
    <div class="p-top"><button class="p-back" data-back aria-label="Back">${BACK}</button><span class="p-addr">${count(d)} items</span></div>
    <h1 class="p-h1">Your basket</h1>

    ${
      ctx.on("3.1") && slot
        ? `<div class="p-note info has-pin" ${ctx.flag("3.1")}>${ctx.pin("3.1")}<b>Slot held: ${slot.day}, ${slot.time}</b>We will keep it for 20 minutes while you check your basket.</div>`
        : ""
    }

    ${
      ctx.on("2.1") && gone.length
        ? `<div class="p-note has-pin" ${ctx.flag("2.1")}>
        ${ctx.pin("2.1")}
        <b>${gone.length} ${gone.length === 1 ? "item is" : "items are"} out of stock today</b>Pick a swap now, so nothing is missing at the door.
        ${gone
          .map(
            (i) => `<div class="p-swap"><div>${i.name}<small>Swap for ${SWAP[i.id].name}${SWAP[i.id].diff ? `, ${money(SWAP[i.id].diff)} more` : ", same price"}</small></div>
            <div><button class="p-btn sm" data-act="swap" data-k="${i.id}">Swap</button><button class="p-btn sm ghost" data-act="remove" data-k="${i.id}">Remove</button></div></div>`
          )
          .join("")}
      </div>`
        : ""
    }

    <div class="p-list${ctx.on("2.2") ? " has-pin" : ""}">
      ${ctx.on("2.2") ? ctx.pin("2.2") : ""}
      ${d.items.filter((i) => !i.removed).map(row).join("")}
      <div class="p-row"><span class="p-thumb" style="--tint:#f1f2ee"></span><div><b>${REST.n} more items</b><small>Same as last week</small></div><span class="p-price">${money(REST.total)}</span></div>
    </div>

    ${
      ctx.on("3.2") && rises(d).length
        ? `<div class="p-note has-pin" ${ctx.flag("3.2")}>${ctx.pin("3.2")}<b>${rises(d).length} items cost more than last week</b>That adds ${money(riseTotal(d))} to this shop. The old prices are shown beside each one.</div>`
        : ""
    }

    <div style="margin-top:12px">
      <div class="p-kv"><span>Items</span><span>${money(subtotal(d))}</span></div>
      <div class="p-kv"><span>Delivery</span><span>$2.80</span></div>
      <div class="p-kv total"><span>Total</span><span>${money(subtotal(d) + 2.8)}</span></div>
    </div>
  </div>
  <div class="p-bar"><button class="p-btn wide" data-go="checkout" data-cta="checkout">Go to checkout · ${money(subtotal(d) + 2.8)}</button></div>`;
}

function checkout(ctx) {
  const d = ctx.data;
  const slot = SLOTS.find((s) => s.id === d.slot);
  const gone = missing(d);
  const blocked = gone.length > 0 && !ctx.on("2.1");
  return `
  <div class="p-scroll">
    <div class="p-top"><button class="p-back" data-back aria-label="Back">${BACK}</button><span class="p-addr">Step 2 of 2</span></div>
    <h1 class="p-h1">Checkout</h1>

    ${
      blocked
        ? `<div class="p-note bad"><b>${gone.length} items are no longer available</b>${gone.map((i) => i.name).join(" and ")} went out of stock while you were shopping.<br><button class="p-btn sm ghost" style="margin-top:8px" data-act="dropMissing">Remove them and carry on</button></div>`
        : ""
    }

    ${
      ctx.on("3.1") && slot
        ? `<div class="p-card has-pin" ${ctx.flag("3.1")}>${ctx.pin("3.1")}<div class="p-card-row"><div><h3 style="font-size:14px">${slot.day}, ${slot.time}</h3><p>Your held slot. Nothing to choose here.</p></div><button class="p-btn sm ghost" data-toast-text="Opens the full slot list.">Change</button></div></div>`
        : `<div class="p-h"><span>Choose a delivery slot</span></div>
        <div class="p-slots">
          <button class="p-slot full" data-toast-text="That slot filled while you were shopping."><b>Today</b>6 to 7pm · full</button>
          ${SLOTS.slice(1).map((s) => `<button class="p-slot${d.slot === s.id ? " on" : ""}" data-act="slot" data-k="${s.id}"><b>${s.day}</b>${s.time}</button>`).join("")}
        </div>`
    }

    <div class="p-card"><div class="p-card-row"><div><h3 style="font-size:14px">Visa ending 4242</h3><p>Default payment method</p></div><button class="p-btn sm ghost" data-toast-text="Opens saved payment methods.">Change</button></div></div>

    <div style="margin-top:14px">
      <div class="p-kv"><span>Items</span><span>${money(subtotal(d))}</span></div>
      ${ctx.on("3.2") && rises(d).length ? `<div class="p-kv up has-pin" ${ctx.flag("3.2")}><span>Price changes since last week</span><span>+${money(riseTotal(d))}</span></div>` : ""}
      <div class="p-kv"><span>Delivery</span><span>$2.80</span></div>
      <div class="p-kv total"><span>Total</span><span>${money(subtotal(d) + 2.8)}</span></div>
    </div>
  </div>
  <div class="p-bar"><button class="p-btn wide" ${blocked ? 'data-toast-text="Remove the unavailable items first." style="opacity:.45"' : 'data-go="done"'}>Place order</button></div>`;
}

function done(ctx) {
  const slot = SLOTS.find((s) => s.id === ctx.data.slot) || SLOTS[1];
  return `
  <div class="p-done">
    <i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.500 4.500 4.500L19 7"/></svg></i>
    <h2>Order placed</h2>
    <p>Arriving ${slot.day.toLowerCase()}, ${slot.time}. We will message you if anything changes.</p>
    <button class="p-btn ghost" data-act="again">Start again</button>
  </div>`;
}

/* ---------- the spec ---------- */

export default {
  title: "Tangelo · the weekly shop",
  sub: "Six proposed changes to the reorder journey. Turn each one on to see it. The numbers match the PRD.",
  legal: "Concept for review, not a live product. Tangelo is fictional, and every item, price and slot is illustrative.",
  theme: { brand: "#14532d", brandInk: "#ffffff", brandSoft: "#e7f0e6", bg: "#f6f5f0" },
  start: "home",
  // The main path a reviewer walks. The checker confirms it can be finished under every preset.
  journey: ["home", "orders", "basket", "checkout", "done"],
  paths: { home: ["home"], orders: ["home", "orders"], basket: ["home", "basket"], checkout: ["home", "basket", "checkout"], done: ["home", "basket", "checkout", "done"] },
  sections: [
    { n: 1, title: "Home" },
    { n: 2, title: "Basket" },
    { n: 3, title: "Checkout" },
  ],
  flags: [
    { id: "1.1", section: 1, label: "Reorder card on Home", screens: ["home"], note: "Last week's shop becomes one tap from Home. Today it is three taps away, under Orders." },
    { id: "1.2", section: 1, label: "Running low row", screens: ["home"], note: "Staples appear when they are due, from how often this customer buys each one." },
    { id: "2.1", section: 2, label: "Stock check when the basket opens", screens: ["basket", "checkout"], note: "Missing items are flagged in the basket with one suggested swap each. Today the customer finds out at checkout." },
    { id: "2.2", section: 2, label: "A substitution rule per item", screens: ["basket"], note: "Each item carries a rule: similar item, a named swap, or do not swap. No more surprises at the door." },
    { id: "3.1", section: 3, label: "Slot first, and held", screens: ["home", "basket", "checkout"], note: "The next three slots show on Home. Picking one holds it for 20 minutes, so it cannot fill while the basket is being checked." },
    { id: "3.2", section: 3, label: "Price changes shown early", screens: ["basket", "checkout"], note: "Items that cost more than last week are marked in the basket, with the total difference." },
  ],
  presets: [
    { id: "today", label: "Today", on: [] },
    { id: "first", label: "First release", on: ["1.1", "2.1", "3.1"] },
    { id: "all", label: "Everything", on: "all" },
  ],
  state: () => ({ items: basket(), slot: "today-6", added: 0 }),
  screens: {
    home: { name: "Home", render: home },
    orders: { name: "Orders", render: orders },
    basket: { name: "Basket", render: basketScreen },
    checkout: { name: "Checkout", render: checkout },
    done: { name: "Receipt", render: done },
  },
  sheets: {
    rule(ctx, k) {
      const item = ctx.data.items.find((i) => i.id === k);
      if (!item) return "";
      return `<h3>If ${item.name} is out of stock</h3><p>Your choice is saved for this item and used on every order.</p>
        ${[
          ["similar", "Swap for something similar", "Same type and size, never more than 10% dearer"],
          ["named", "Swap for a named item", SWAP[k] ? SWAP[k].name : "Choose the exact replacement"],
          ["none", "Do not swap", "Leave it out and refund it"],
        ]
          .map(([v, t, s]) => `<button class="p-opt${item.rule === v ? " on" : ""}" data-act="rule" data-k="${k}:${v}"><span>${t}<small>${s}</small></span></button>`)
          .join("")}`;
    },
  },
  actions: {
    reorder: () => ({ go: "basket" }),
    add: (ctx, k) => ({ toast: `${k} added to your basket.` }),
    slot(ctx, k) {
      ctx.data.slot = k;
      const s = SLOTS.find((x) => x.id === k);
      return ctx.on("3.1") ? { toast: `${s.day}, ${s.time} is held for 20 minutes.` } : {};
    },
    qty(ctx, k) {
      const [id, n] = k.split(":");
      const item = ctx.data.items.find((i) => i.id === id);
      if (item) item.qty = Math.max(1, item.qty + Number(n));
    },
    swap(ctx, k) {
      const item = ctx.data.items.find((i) => i.id === k);
      if (item) item.swapped = true;
      return { toast: `Swapped for ${SWAP[k].name}.` };
    },
    remove(ctx, k) {
      const item = ctx.data.items.find((i) => i.id === k);
      if (item) item.removed = true;
    },
    dropMissing(ctx) {
      for (const item of ctx.data.items) if (item.oos && !item.swapped) item.removed = true;
      return { toast: "Removed. Your total has been updated." };
    },
    rule(ctx, k) {
      const [id, v] = k.split(":");
      const item = ctx.data.items.find((i) => i.id === id);
      if (item) item.rule = v;
      return { close: true };
    },
    again(ctx, k, api) {
      api.reset();
      api.jump("home");
    },
  },
};
