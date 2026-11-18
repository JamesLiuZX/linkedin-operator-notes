// Kerb: parking sessions. Illustrative concept spec.
const money = (n) => `$${n.toFixed(2)}`;
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const RATE30 = 1.6; // illustrative price per 30 minutes
const DUR = { 30: ["30 min", 1.6], 60: ["1 hour", 3.0], 120: ["2 hours", 5.6] };
const NOW = 15 * 60 + 30; // the prototype clock is frozen at 15:30

const BACK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 5 8l5 5"/></svg>';
const TAB = {
  home: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 9.5 10 3l7 6.5V17H3V9.5Z"/></svg>',
  hist: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></svg>',
  acct: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="10" cy="7" r="3.2"/><path d="M4 17c.8-3 3.2-4.5 6-4.5s5.2 1.5 6 4.5"/></svg>',
};
const tabbar = () => `
  <nav class="p-tabbar">
    <button class="on" data-go="home">${TAB.home}Home</button>
    <button data-toast-text="History lists past sessions. Not part of this prototype.">${TAB.hist}History</button>
    <button data-toast-text="Account opens your profile and cards. Not part of this prototype.">${TAB.acct}Account</button>
  </nav>`;

// What the Extend / Add 30 min buttons do: with 2.1 on they show the cost first.
const extendAttr = (ctx) => (ctx.on("2.1") ? 'data-sheet-open="extend"' : 'data-act="extend"');

function home(ctx) {
  const d = ctx.data;
  return `
  <div class="p-scroll">
    <div class="p-top"><span class="p-addr">Parking near <b>Linden Street</b></span><span class="p-avatar">K</span></div>
    <h1 class="p-h1">Home</h1>
    ${ctx.on("1.1") && d.ends - NOW <= 10 ? `<div class="p-note has-pin" ${ctx.flag("1.1")}>${ctx.pin("1.1")}<div class="p-card-row"><div><b>Your parking ends in 10 minutes</b>Ends ${hhmm(d.ends)}</div><button class="p-btn sm" ${extendAttr(ctx)}>Add 30 min</button></div></div>` : ""}
    <div class="p-card" style="padding:0;height:110px;background:var(--brand-soft);display:grid;place-items:center;color:var(--a-muted)">Map area</div>
    <div class="p-card">
      <h3>Active session</h3>
      <p>Bay 14, Linden Street. Ends ${hhmm(d.ends)}</p>
      ${ctx.on("2.1") ? `<div class="has-pin" ${ctx.flag("2.1")} style="margin-top:6px;font-weight:600">${ctx.pin("2.1")}So far: ${money(d.cost)}</div>` : ""}
      <div class="p-card-row" style="margin-top:10px;justify-content:flex-start;gap:8px">
        ${ctx.on("1.2") ? `<div class="has-pin" ${ctx.flag("1.2")}>${ctx.pin("1.2")}<button class="p-btn sm" ${extendAttr(ctx)}>Extend</button></div>` : ""}
        <button class="p-btn sm ghost" data-go="ended">End session</button>
      </div>
    </div>
    <p class="p-fine">Concept for review. Bays, times and prices are illustrative.</p>
  </div>
  ${tabbar()}`;
}

function ended() {
  return `
  <div class="p-done">
    <h2>Session ended</h2>
    <p>Need more time? You have to start a new session.</p>
    <button class="p-btn" data-go="duration">Start a new session</button>
    <button class="p-btn ghost" data-act="again">Back to Home</button>
  </div>`;
}

function duration(ctx) {
  const d = ctx.data;
  return `
  <div class="p-scroll">
    <div class="p-top"><button class="p-back" data-back aria-label="Back">${BACK}</button><span class="p-addr">Bay 14</span></div>
    <h1 class="p-h1">Duration</h1>
    <div class="p-slots">
      ${Object.entries(DUR).map(([m, [t]]) => `<button class="p-slot${d.pick === m ? " on" : ""}" data-act="pick" data-k="${m}"><b>${t}</b></button>`).join("")}
    </div>
  </div>
  <div class="p-bar"><button class="p-btn wide" data-go="payment">Continue</button></div>`;
}

function payment(ctx) {
  const [t, fee] = DUR[ctx.data.pick];
  return `
  <div class="p-scroll">
    <div class="p-top"><button class="p-back" data-back aria-label="Back">${BACK}</button><span class="p-addr">Step 2 of 2</span></div>
    <h1 class="p-h1">Payment</h1>
    <div class="p-card"><div class="p-card-row"><div><h3>Visa ending 4242</h3><p>Default card</p></div><button class="p-btn sm ghost" data-toast-text="Opens saved cards.">Change</button></div></div>
    <div style="margin-top:14px">
      <div class="p-kv"><span>Parking, ${t}</span><span>${money(fee)}</span></div>
      <div class="p-kv total"><span>Total</span><span>${money(fee)}</span></div>
    </div>
  </div>
  <div class="p-bar"><button class="p-btn wide" data-go="receipt">Pay ${money(fee)}</button></div>`;
}

function receipt(ctx) {
  const [t, fee] = DUR[ctx.data.pick];
  return `
  <div class="p-done">
    <h2>Receipt</h2>
    <p>Bay 14, Linden Street. ${t}. ${money(fee)} paid.</p>
    <button class="p-btn ghost" data-act="again">Back to Home</button>
  </div>`;
}

export default {
  title: "Kerb · more time, fewer surprises",
  sub: "Three proposed changes to the parking session. Turn each on to see it. The numbers match the list of changes.",
  legal: "Concept for review, not a live product. Kerb is a working name and every bay, time and price is illustrative.",
  theme: { brand: "#1d4ed8", brandInk: "#ffffff", brandSoft: "#e8eefc", bg: "#f5f6fa" },
  start: "home",
  journey: ["home", "ended", "duration", "payment", "receipt"],
  paths: { home: ["home"], ended: ["home", "ended"], duration: ["home", "ended", "duration"], payment: ["home", "ended", "duration", "payment"], receipt: ["home", "ended", "duration", "payment", "receipt"] },
  sections: [
    { n: 1, title: "Warning and extending" },
    { n: 2, title: "Cost" },
  ],
  flags: [
    { id: "1.1", section: 1, label: "Warning ten minutes before the end", screens: ["home"], note: "A banner on Home says the parking ends in 10 minutes and offers Add 30 min. Today the session ends without warning. The prototype clock is fixed at 15:30." },
    { id: "1.2", section: 1, label: "Extend in one tap", screens: ["home"], note: "An Extend button on the active session card adds time without ending the session. Today the driver must end, start again, pick a duration and pay." },
    { id: "2.1", section: 2, label: "Cost shown as you go", screens: ["home"], note: "The card shows the running cost, and the cost of an extension is shown before the driver confirms it. Today the fee first appears at payment." },
  ],
  presets: [
    { id: "today", label: "Today", on: [] },
    { id: "first", label: "First release", on: ["1.1", "1.2"] },
    { id: "all", label: "Everything", on: "all" },
  ],
  state: () => ({ ends: 15 * 60 + 40, cost: 3.2, pick: "30" }),
  screens: {
    home: { name: "Home", render: home },
    ended: { name: "Session ended", render: ended },
    duration: { name: "Duration", render: duration },
    payment: { name: "Payment", render: payment },
    receipt: { name: "Receipt", render: receipt },
  },
  sheets: {
    extend: (ctx) => `<h3>Add 30 min</h3><p>New end time ${hhmm(ctx.data.ends + 30)}.</p>
      <div class="p-kv"><span>Cost of the extension</span><span>${money(RATE30)}</span></div>
      <div class="p-kv total"><span>Total so far after extending</span><span>${money(ctx.data.cost + RATE30)}</span></div>
      <button class="p-btn wide" style="margin-top:12px" data-act="extend">Confirm</button>
      <button class="p-btn wide ghost" style="margin-top:8px" data-close>Cancel</button>`,
  },
  actions: {
    extend(ctx) {
      ctx.data.ends += 30;
      ctx.data.cost += RATE30;
      return { close: true, toast: `Added 30 min. Ends ${hhmm(ctx.data.ends)}.` };
    },
    pick(ctx, k) { ctx.data.pick = k; },
    again(ctx, k, api) { api.reset(); api.jump("home"); },
  },
};
