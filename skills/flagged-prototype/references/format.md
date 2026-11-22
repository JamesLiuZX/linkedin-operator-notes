# The prototype spec

A spec is one JavaScript file with a default export. Screens are functions that return HTML strings. The runtime calls them again whenever anything changes.

The runtime draws one of two frames: a phone (the default) or a browser window. Everything below applies to both unless it says otherwise.

## Contents

- [The spec object](#the-spec-object)
- [The context a screen receives](#the-context-a-screen-receives)
- [Making controls work](#making-controls-work)
- [Sheets and dialogs](#sheets-and-dialogs)
- [The tour](#the-tour)
- [What the reviewer gets](#what-the-reviewer-gets)
- [The phone kit](#the-phone-kit)
- [The browser-window kit](#the-browser-window-kit)
- [Your own CSS](#your-own-css)
- [A complete small spec: a phone](#a-complete-small-spec-a-phone)
- [A complete small spec: a browser window](#a-complete-small-spec-a-browser-window)

## The spec object

```js
export default {
  title: "Tangelo · the weekly shop",
  sub: "One or two sentences for the top of the panel.",
  legal: "Concept for review, not a live product. Every item and price is illustrative.",
  theme: { brand: "#14532d", brandInk: "#ffffff", brandSoft: "#e7f0e6", bg: "#f6f5f0" },

  frame: "phone",            // or "desktop"
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
  tour: [{ screen: "home", say: "The app as it is today." }, { flag: "1.1", say: "One card on Home." }],

  state: () => ({ items: [], slot: "today" }),
  screens: { home: { name: "Home", render: (ctx) => `...` } },
  sheets: { rule: (ctx, key) => `...` },
  actions: { add: (ctx, key) => ({ toast: "Added." }) },
};
```

| Field | Required | What it is |
|---|---|---|
| `title` | yes | Heading of the panel |
| `sub` | no | One line of explanation under the heading |
| `legal` | yes | Says it is a concept and that the data is illustrative. The checker looks for this |
| `theme` | no | `brand` is the app's colour, `brandInk` the text on it, `brandSoft` a pale tint, `bg` the app background |
| `frame` | no | `"phone"` (the default) or `"desktop"`, a browser window. Pick it from the product |
| `size` | no | `{ w, h }` in pixels for the device. Defaults are 300 by 620 for a phone and 1000 by 640 for a window |
| `app` | no | A short name. It is set as `data-app` on the root. Use it to scope your own CSS |
| `css` | no | A string of extra CSS the spec ships for its own look. See [Your own CSS](#your-own-css) |
| `url`, `who` | no | Desktop only. The default address and the default "whose browser" line shown in the window bar. A screen can override both |
| `start` | yes | The first screen |
| `journey` | yes | The main path, in order, at least two screens. The checker walks it under every preset |
| `paths` | no | For each screen, the stack that leads to it, so Back works when a screen is opened directly |
| `sections` | no | Groups the switches, usually the PRD's sections |
| `flags` | yes | One per change: `id`, `section`, `label`, `note`, `screens`. All of them are needed in practice, and the checker fails a switch with no label or note |
| `presets` | no | Named sets of switches. `on` is a list of IDs or `"all"`. Defaults to Today and Everything |
| `tour` | no, but write one | The guided walk. See [The tour](#the-tour). The checker warns when it is missing |
| `state` | no | Returns a fresh copy of the made-up data. Called at start and on reset |
| `screens` | yes | For each screen: `name` and `render(ctx)` are needed. `url` (a string or `(ctx) => string`) and `who` are optional and desktop only |
| `sheets` | no | `name: (ctx, key) => html`. A sheet on a phone, a dialog in a window. See below |
| `actions` | no | Named handlers: `name: (ctx, key, api) => result` |

## The context a screen receives

| Call | Returns | Use |
|---|---|---|
| `ctx.on("1.1")` | `true` or `false` | Is this switch on? |
| `ctx.pin("1.1")` | HTML for a numbered pin, or `""` | Place it inside the element the change adds. That element needs the class `has-pin`. In the "today" half of a comparison it returns `""`, so write it without a condition around it if the element is already conditional |
| `ctx.flag("1.1")` | an attribute string | Put it on the element a switch adds: `<div class="p-card" ${ctx.flag("1.1")}>`. It animates in when the switch is turned on and lets the tour ring the element |
| `ctx.data` | the object from `state()` | Read it in screens. Change it only in actions |
| `ctx.esc(text)` | escaped text | Use it on anything that did not come from the spec itself |

Pins have two variants. Replace `class="pin"` with `class="pin left"` to put the pin on the left corner, or with `class="pin inline"` to put it in a line of text. Larkspur does this with `.replace('class="pin"', 'class="pin left"')`.

## Making controls work

Add one of these attributes to any element. The runtime handles the click.

| Attribute | What happens |
|---|---|
| `data-go="basket"` | Opens that screen |
| `data-back` | Goes back one screen |
| `data-act="swap" data-k="oat"` | Calls `actions.swap(ctx, "oat", api)`, then draws the screen again |
| `data-sheet-open="rule" data-k="milk"` | Opens `sheets.rule(ctx, "milk")` |
| `data-close` | Closes the sheet or dialog |
| `data-toast-text="Opens saved payment methods."` | Shows that line. Use it on every control outside the journey |
| `data-cta="share"` | Not read by the runtime. A name for the control, so a tour step can `tap` it with `[data-cta="share"]` |

An action may return any of these, all optional:

| Result | Effect |
|---|---|
| `{ toast: "text" }` | Shows a short message |
| `{ go: "screen" }` | Pushes a screen onto the stack |
| `{ jump: "screen" }` | Switches stack: opens the screen with its `paths` entry |
| `{ close: true }` | Closes the open sheet or dialog |
| `{ sheet: "name", k: "key" }` | Opens a sheet or dialog |

An action may change `ctx.data`. `api.reset()` restores the data and `api.jump("home")` opens a screen with its path. If a sheet is open and the action does not close it, it is drawn again with the new data.

## Sheets and dialogs

One `sheets` entry serves both frames. In a phone frame it rises from the bottom. In a desktop frame the same entry is a centred dialog. Write the markup for the frame you chose: in a phone, plain headings and `p-opt` choices; in a window, a `d-dlg` block with a `d-dlg-foot`.

A change inside a sheet or dialog counts. The checker draws every sheet that a screen opens, so a switch whose only effect is inside a dialog passes check 2, and a pin inside a dialog is read by check 3.

## The tour

`tour` is an array of steps. It drives the Tour button in the prototype and the replay on the handbook site. Steps accumulate: the state at step N is every step up to N applied in order, so a step only says what changes.

| Field | Optional | What it does |
|---|---|---|
| `say` | no, in practice | The caption. One or two plain sentences. If it is missing, the switch's note is shown |
| `flag` | yes | Turns this switch on. Must be a switch ID. The element it adds is ringed unless `spot` says otherwise |
| `off` | yes | Turns this switch off |
| `preset` | yes | Replaces all switches with this preset's set. Must be a preset ID. Applied before `flag` and `off` in the same step |
| `screen` | yes | Jumps to this screen. A step with `screen` and no `sheet` closes any open sheet or dialog |
| `tap` | yes | A CSS selector for the control the walk "presses". The handbook's replay moves a pointer to it. It does not click it, so also set what the click would do (`screen`, `sheet`, `set`) |
| `set` | yes | An object laid over the spec's starting `state()`. Use it to say "the link has been copied" without replaying the clicks. It accumulates |
| `sheet` | yes | `{ name, k }` shows that sheet or dialog. `null` closes it. `k` is optional |
| `spot` | yes | A selector to ring. Defaults to the element marked with `ctx.flag` for this step's `flag` |

Every field is optional, so a step can be only a `say`. The checker (check 4) fails a step that names a switch, screen, sheet or preset that does not exist. It warns when a `tap` selector is not found in the screen as it stands just before the step. It understands `[attr="value"]`, `[attr]`, `.class` and `#id`. It warns when there is no tour or when the tour has fewer than 6 or more than 12 steps.

Write the tour so that the first step shows today, and so that a reviewer who has not read the PRD can follow it.

## What the reviewer gets

Nothing here needs anything from the spec except where noted.

- **Compare.** A divider across the screen: today (everything off) on the left, the current switches on the right. It is only honest if a screen with everything off is the real product today.
- **Review.** Each switch row has Approve, Hold and Cut, a tally, and "Copy the review" as plain text.
- **State in the address.** `#screen?on=1.1,2.1&yes=1.1&hold=2.1&no=3.1&compare=1`.
- **Keys.** `1` to `9` toggle switches in panel order. `0` turns all off. `C` compare. `T` tour. `P` pins. Arrow keys step the tour, or move the divider in compare. `Escape` closes.

## The phone kit

Every phone screen returns a scroll area and, optionally, a fixed bar under it.

```html
<div class="p-scroll"> ...content... </div>
<div class="p-bar"><button class="p-btn wide" data-go="checkout">Go to checkout</button></div>
```

or, on a top-level screen, `<nav class="p-tabbar">` with three to five `<button>`s in place of `p-bar`.

The scrolling part of every screen, phone or window, must carry the class `p-scroll`. The runtime scrolls it to show a ringed element and keeps the two halves of a comparison in step through it.

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

A phone screen is 300 wide and type is 13px. Do not set widths in pixels, and do not load images or fonts from the network. For icons, inline a small SVG.

## The browser-window kit

A window screen is a row: an optional sidebar and a main column. The window bar shows the screen's `url` and `who`.

```html
<div class="d-app">
  <aside class="d-side"> ...nav... </aside>
  <div class="d-main">
    <div class="d-top"> ...crumbs, buttons... </div>
    <div class="p-scroll d-body"> ...content... </div>
  </div>
</div>
```

For a screen with no sidebar (a guest's page, a sign-in wall) use `d-app solo`. The scrolling part is `p-scroll d-body`, or `p-scroll` beside your own class.

| Class | What it draws |
|---|---|
| `d-app` | The whole window content. Add `solo` for no sidebar |
| `d-side`, `d-side-foot` | The sidebar, and its pinned foot |
| `d-brand` | The product mark and name in the sidebar |
| `d-nav` | A sidebar link. Add `on` for the current one and `sub` for a nested one |
| `d-main` | The column beside the sidebar |
| `d-top` | The top bar of the column |
| `d-crumbs` | A breadcrumb. A `<b>` inside is the current page |
| `d-spacer` | Pushes what follows to the right edge of a row |
| `d-body` | The padded content area. Use it with `p-scroll` |
| `d-h1`, `d-sub` | The page title and the line under it |
| `d-btn` | A button. Variants: `ghost`, `quiet`, `ink`, `sm`, `wide`, `off` |
| `d-avatar`, `d-avatars` | A round initials badge (add `sm`), and a row of them. `--tint` and `--tint-ink` set its colours |
| `d-tag` | A small label. Variants: `brand`, `ok`, `warn`, `bad`, `ink` |
| `d-card` | A white card |
| `d-banner` | A tinted notice. Variants: `warn`, `bad`, `plain`. A `<b>` inside is the headline |
| `d-table`, `d-tr` | A table made of rows. Set the columns with `style="--cols: 2fr 1fr 1fr"`. Add `head` to the first row. A `<button class="d-tr add">` is an add-row control |
| `d-field`, `d-input` | A label with a fake input under it. `d-input` is not editable. Add `mono` for a monospace value |
| `d-check` | A check row. Add `on`, and `round` for a circle |
| `d-dlg`, `d-dlg-foot` | The content of a dialog (a `<h3>`, a `<p>`, then fields), and its button row |
| `d-slot` | A visible gap for a value nobody has decided yet: `<span class="d-slot">price</span>`. Use it instead of inventing a number |
| `d-fine` | Small print |

Use `d-slot` for every value the PRD leaves open. A reviewer sees a labelled gap, not a made-up number. This is also the rule behind "never invent a number".

## Your own CSS

Set `app: "larkspur"` and put extra rules in `css`. Give every class of your own a short prefix for the app (the examples use `lk-` and `vr-`) so it cannot collide with the kit. The CSS is inserted inside the prototype, so it applies to screens, sheets and dialogs. Use the variables `--brand`, `--brand-soft` and `--app-bg`. Keep it small: reviewers should argue about scope, not spacing.

## A complete small spec: a phone

```js
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

## A complete small spec: a browser window

This one passes the checker. It has two screens because `journey` needs at least two, and `data-go` on the first screen is how the checker finds the way to the second. A real spec has a tour of 6 to 12 steps. This one has three, so the checker warns about the length.

```js
export default {
  app: "pebble",
  frame: "desktop",
  title: "Pebble · sharing a board",
  sub: "One proposed change to the board screen.",
  legal: "Concept for review. Pebble is fictional and every name and price is illustrative.",
  start: "board",
  journey: ["board", "sent"],
  sections: [{ n: 1, title: "Sharing" }],
  flags: [
    { id: "1.1", section: 1, label: "Share button", screens: ["board"], note: "A Share button opens a dialog with a link. Today the only way to show a board is to add the person as a member." },
  ],
  tour: [
    { screen: "board", say: "The board as it is today. There is no way to show it to someone outside the team." },
    { flag: "1.1", say: "A Share button sits top right." },
    { tap: '[data-cta="share"]', sheet: { name: "share" }, say: "The dialog makes a view-only link. The price of a seat is still open." },
  ],
  state: () => ({}),
  screens: {
    board: {
      name: "Board",
      who: "Ana, the owner",
      url: "app.pebble.example/boards/launch",
      render: (ctx) => `
        <div class="d-app solo">
          <div class="d-main">
            <div class="d-top">
              <div class="d-crumbs">Boards <span>/</span> <b>Launch</b></div>
              <span class="d-spacer"></span>
              ${ctx.on("1.1") ? `<span class="has-pin" ${ctx.flag("1.1")}>${ctx.pin("1.1")}<button class="d-btn" data-sheet-open="share" data-cta="share">Share</button></span>` : ""}
            </div>
            <div class="p-scroll d-body">
              <h1 class="d-h1">Launch</h1>
              <p class="d-sub">3 cards. Only you can see this board.</p>
              <button class="d-btn ghost" data-go="sent">Mark as done</button>
            </div>
          </div>
        </div>`,
    },
    sent: { name: "Done", render: () => `<div class="d-app solo"><div class="p-scroll d-body"><h1 class="d-h1">Marked as done</h1><button class="d-btn ghost" data-go="board">Back to the board</button></div></div>` },
  },
  sheets: {
    share: (ctx) => `
      <div class="d-dlg">
        <div><h3>Share this board</h3><p>Anyone with the link can look. Nobody can edit.</p></div>
        <div class="d-input mono"><span>pebble.example/s/launch</span></div>
        <p class="d-fine">Editing seats cost <span class="d-slot">price</span> per month.</p>
        <div class="d-dlg-foot"><button class="d-btn" data-close>Done</button></div>
      </div>`,
  },
};
```

Worked examples: `examples/tangelo/` (a phone), `examples/larkspur/` (a browser window with two people, dialogs, a tour and a `css` string).
