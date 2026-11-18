# The prototype spec

A spec is one JavaScript file with a default export. Screens are functions that return HTML strings. The runtime calls them again whenever anything changes.

## Contents

- [The spec object](#the-spec-object)
- [The context a screen receives](#the-context-a-screen-receives)
- [Making controls work](#making-controls-work)
- [The screen kit](#the-screen-kit)
- [A complete small spec](#a-complete-small-spec)

## The spec object

```js
export default {
  title: "Tangelo · the weekly shop",
  sub: "One or two sentences for the top of the panel.",
  legal: "Concept for review, not a live product. Every item and price is illustrative.",
  theme: { brand: "#14532d", brandInk: "#ffffff", brandSoft: "#e7f0e6", bg: "#f6f5f0" },

  start: "home",
  journey: ["home", "basket", "checkout", "done"],
  paths: { home: ["home"], basket: ["home", "basket"], checkout: ["home", "basket", "checkout"] },

  sections: [{ n: 1, title: "Home" }, { n: 2, title: "Basket" }],
  flags: [
    { id: "1.1", section: 1, label: "Reorder card on Home", screens: ["home"],
      note: "Last week's shop becomes one tap from Home. Today it is three taps away." },
  ],
  presets: [
    { id: "today", label: "Today", on: [] },
    { id: "first", label: "First release", on: ["1.1", "2.1"] },
    { id: "all", label: "Everything", on: "all" },
  ],

  state: () => ({ items: [], slot: "today" }),
  screens: { home: { name: "Home", render: (ctx) => `...` } },
  sheets: { rule: (ctx, key) => `...` },
  actions: { add: (ctx, key) => ({ toast: "Added." }) },
};
```

| Field | Required | What it is |
|---|---|---|
| `title`, `sub` | title | Heading and one line of explanation in the panel |
| `legal` | yes | Says it is a concept and that the data is illustrative. The checker looks for this |
| `theme` | no | `brand` is the app's colour, `brandInk` the text on it, `brandSoft` a pale tint, `bg` the app background |
| `start` | yes | The first screen |
| `journey` | yes | The main path, in order. The checker walks it under every preset |
| `paths` | no | For each screen, the stack that leads to it, so Back works when a screen is opened directly |
| `sections` | no | Groups the switches, usually the PRD's sections |
| `flags` | yes | One per change: `id`, `section`, `label`, `note`, `screens` |
| `presets` | no | Named sets of switches. `on` is a list of IDs or `"all"`. Defaults to Today and Everything |
| `state` | no | Returns a fresh copy of the made-up data. Called at start and on reset |
| `screens` | yes | `name` and `render(ctx)` for each screen |
| `sheets` | no | Bottom sheets: `name: (ctx, key) => html` |
| `actions` | no | Named handlers: `name: (ctx, key, api) => result` |

## The context a screen receives

| Call | Returns | Use |
|---|---|---|
| `ctx.on("1.1")` | `true` or `false` | Is this switch on? |
| `ctx.pin("1.1")` | HTML for a numbered pin | Place it inside the element the change adds. That element needs the class `has-pin` |
| `ctx.flag("1.1")` | an attribute string | Put it on the element a switch adds: `<div class="p-card" ${ctx.flag("1.1")}>`. It animates in when the switch is turned on |
| `ctx.data` | the object from `state()` | Read it in screens. Change it only in actions |
| `ctx.esc(text)` | escaped text | Use it on anything that did not come from the spec itself |

## Making controls work

Add one of these attributes to any element. The runtime handles the click.

| Attribute | What happens |
|---|---|
| `data-go="basket"` | Opens that screen |
| `data-back` | Goes back one screen |
| `data-act="swap" data-k="oat"` | Calls `actions.swap(ctx, "oat", api)`, then draws the screen again |
| `data-sheet-open="rule" data-k="milk"` | Opens `sheets.rule(ctx, "milk")` as a bottom sheet |
| `data-close` | Closes the sheet |
| `data-toast-text="Opens saved payment methods."` | Shows that line. Use it on every control outside the journey |

An action may return `{ toast: "text" }`, `{ go: "screen" }` or `{ close: true }` (close the sheet). It may change `ctx.data`. `api.reset()` restores the data and `api.jump("home")` opens a screen with its path.

## The screen kit

Every screen returns a scroll area and, optionally, a fixed bar under it.

```html
<div class="p-scroll"> ...content... </div>
<div class="p-bar"><button class="p-btn wide" data-go="checkout">Go to checkout</button></div>
```

or, on a top-level screen, `<nav class="p-tabbar">` with three to five `<button>`s in place of `p-bar`.

| Class | What it draws |
|---|---|
| `p-top` | The row at the top: a back button (`<button class="p-back" data-back>`) or an address on the left, something small on the right |
| `p-h1` | The screen's title |
| `p-h` | A section heading. A `<small>` inside sits on the right |
| `p-search` | A search field (not editable) |
| `p-chips` with `p-chip` buttons | A row of filter chips. Add `on` to the selected one |
| `p-card` | A white card. Add `brand` to fill it with the app colour. `p-card-row` inside lays out text and a button side by side |
| `p-banner` | A tinted promo block. A `<b>` inside is the headline |
| `p-note` | A notice. Plain is amber, `info` is tinted, `bad` is red. A `<b>` inside is the headline |
| `p-grid` with `p-tile` | A two-column grid of product tiles |
| `p-strip` with `p-mini` | A horizontal scroller of small tiles |
| `p-list` with `p-row` | A list. Each row is thumb, text, right-hand value. `<b>` is the name and `<small>` the second line |
| `p-thumb` | A tinted square for an icon: `<span class="p-thumb" style="--tint:#e8f1fb">...svg...</span>` |
| `p-step` | A quantity stepper: two buttons around a `<span>` |
| `p-slots` with `p-slot` | Three choices side by side. Add `on` or `full` |
| `p-kv` | A label and a value on one line. Add `total` for the last line |
| `p-btn` | A button. Variants: `light`, `ghost`, `sm`, `wide` |
| `p-opt` | A choice in a sheet. Add `on` to the selected one |
| `p-done` | A centred confirmation screen |
| `p-fine` | Small print at the foot of a screen |
| `has-pin` | Put this on any element that contains `ctx.pin(...)`, so the pin sits on its corner |

Screens are 300 wide. Type is 13px. Do not set widths in pixels, and do not load images or fonts from the network. For icons, inline a small SVG.

## A complete small spec

```js
const money = (n) => `$${n.toFixed(2)}`;

export default {
  title: "Loanly · renewing a book",
  sub: "Two proposed changes to the loans screen.",
  legal: "Concept for review. Loanly is fictional and every title and date is illustrative.",
  theme: { brand: "#1d4ed8", brandInk: "#fff", brandSoft: "#e8eefc", bg: "#f5f6fa" },
  start: "loans",
  journey: ["loans", "done"],
  sections: [{ n: 1, title: "Loans" }],
  flags: [
    { id: "1.1", section: 1, label: "Due dates in plain words", screens: ["loans"], note: "Shows \"Due in 2 days\" in place of a date the reader has to work out." },
    { id: "1.2", section: 1, label: "Renew everything at once", screens: ["loans"], note: "One button renews every loan that can be renewed. Today each needs its own tap." },
  ],
  state: () => ({ loans: [{ t: "The Left Hand of Darkness", due: "20 Nov", days: 2 }, { t: "Piranesi", due: "27 Nov", days: 9 }], renewed: false }),
  screens: {
    loans: {
      name: "Loans",
      render: (ctx) => `
        <div class="p-scroll">
          <h1 class="p-h1">Your loans</h1>
          <div class="p-list${ctx.on("1.1") ? " has-pin" : ""}">
            ${ctx.on("1.1") ? ctx.pin("1.1") : ""}
            ${ctx.data.loans.map((l) => `
              <div class="p-row"><span class="p-thumb"></span>
                <div><b>${l.t}</b><small ${ctx.on("1.1") ? ctx.flag("1.1") : ""}>${ctx.on("1.1") ? `Due in ${l.days} days` : `Due ${l.due}`}</small></div>
                <button class="p-btn sm ghost" data-act="renew">Renew</button>
              </div>`).join("")}
          </div>
          <p class="p-fine">Concept for review. Titles and dates are illustrative.</p>
        </div>
        <div class="p-bar${ctx.on("1.2") ? " has-pin" : ""}">
          ${ctx.on("1.2")
            ? `${ctx.pin("1.2")}<button class="p-btn wide" data-go="done" ${ctx.flag("1.2")}>Renew all 2 loans</button>`
            : `<button class="p-btn wide ghost" data-go="done">Done</button>`}
        </div>`,
    },
    done: { name: "Receipt", render: () => `<div class="p-done"><h2>All set</h2><p>Your loans are up to date.</p><button class="p-btn ghost" data-go="loans">Back to loans</button></div>` },
  },
  actions: { renew: () => ({ toast: "Renewed for 3 weeks." }) },
};
```
