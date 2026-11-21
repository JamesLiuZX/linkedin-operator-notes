// Larkspur: share by link. A flagged prototype spec for an app in a browser window.
//
// Larkspur is a fictional planning tool. Every name, date and number here is
// made up. The six switches match the six points of the PRD in
// ../../../decision-prd/examples/larkspur/prd.json, ID for ID.
//
// Two people use this prototype. Dana Whitlock is the trial admin, alone in
// the workspace. Kemal Aydin is the person Dana wants to show the plan to.
// The "guest" screen is Kemal's browser.

/* ---------- data (illustrative) ---------- */

const WORKSPACE = "Whitlock Planning";
const LINK = "larkspur.example/s/q3-roadmap";

const ITEMS = [
  { name: "Customer interviews", status: "In progress", tone: "brand", due: "12 Jun" },
  { name: "Scope review", status: "To do", tone: "", due: "19 Jun" },
  { name: "Draft plan", status: "To do", tone: "", due: "26 Jun" },
];

const SETUP = [
  ["Name your workspace", true],
  ["Create a project", true],
  ["Add three items", false],
  ["Set a due date", false],
  ["Invite your team", false],
];

/* ---------- icons ---------- */

const svg = (d, extra = "") => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const IC = {
  home: svg('<path d="M2.500 7.500 8 3l5.500 4.500V13H2.500V7.500Z"/>'),
  projects: svg('<rect x="2.500" y="3" width="11" height="10" rx="2"/><path d="M2.500 6.500h11M6 6.500V13"/>'),
  docs: svg('<path d="M4 2.500h5.500L12 5v8.500H4v-11Z"/><path d="M6 8h4M6 10.500h4"/>'),
  settings: svg('<circle cx="8" cy="8" r="2"/><path d="M8 2.500v1.500M8 12v1.500M2.500 8H4M12 8h1.500M4.100 4.100l1.100 1.100M10.800 10.800l1.100 1.100M4.100 11.900l1.100-1.100M10.800 5.200l1.100-1.100"/>'),
  share: svg('<path d="M8 10V2.500M5.500 5 8 2.500 10.500 5M3.500 8.500V13h9V8.500"/>'),
  eye: svg('<path d="M1.500 8S4 3.500 8 3.500 14.500 8 14.500 8 12 12.500 8 12.500 1.500 8 1.500 8Z"/><circle cx="8" cy="8" r="1.800"/>'),
  link: svg('<path d="M6.800 9.200a2.600 2.600 0 0 0 3.700 0l2-2a2.600 2.600 0 0 0-3.700-3.700l-.700.700M9.200 6.800a2.600 2.600 0 0 0-3.700 0l-2 2a2.600 2.600 0 0 0 3.700 3.700l.700-.700"/>'),
  plus: svg('<path d="M8 3.500v9M3.500 8h9"/>'),
  more: svg('<circle cx="3.500" cy="8" r=".8" fill="currentColor"/><circle cx="8" cy="8" r=".8" fill="currentColor"/><circle cx="12.500" cy="8" r=".8" fill="currentColor"/>'),
  check: svg('<path d="m3.500 8.500 3 3 6-7"/>', 'stroke-width="2"'),
  pencil: svg('<path d="M10.500 3 13 5.500 6 12.500l-3 .500.500-3 7-7Z"/>'),
  back: svg('<path d="M10 3.500 5.500 8 10 12.500"/>'),
};

/* ---------- pieces shared by more than one screen ---------- */

function sidebar(on) {
  const nav = (key, icon, label, attrs) => `<button class="d-nav${on === key ? " on" : ""}" ${attrs}>${icon}${label}</button>`;
  return `
  <aside class="d-side">
    <div class="d-brand"><i>L</i>Larkspur</div>
    <div class="lk-ws"><span class="d-avatar sm">W</span><b>${WORKSPACE}</b></div>
    ${nav("home", IC.home, "Home", 'data-toast-text="Home lists your projects and the setup checklist."')}
    ${nav("projects", IC.projects, "Projects", 'data-go="project"')}
    <button class="d-nav sub${on === "projects" ? " on" : ""}" data-go="project">Q3 roadmap</button>
    ${nav("docs", IC.docs, "Docs", 'data-toast-text="Docs are not part of this prototype. It covers bringing a second person in."')}
    ${nav("settings", IC.settings, "Settings", 'data-go="members"')}
    <button class="d-nav sub${on === "settings" ? " on" : ""}" data-go="members">Members</button>
    <div class="d-side-foot">
      <div class="lk-trial"><b>Free trial</b><span>Day 3 of 14. No card needed.</span><i><em></em></i></div>
      <div class="lk-me"><span class="d-avatar">DW</span><div><b>Dana Whitlock</b><small>Admin</small></div></div>
    </div>
  </aside>`;
}

const statusTag = (i) => `<span class="d-tag ${i.tone}">${i.tone ? "<i></i>" : ""}${i.status}</span>`;

/** The plan as a table. Guests get the same rows without the way to add one. */
function planTable(owner, canEdit) {
  return `
  <div class="d-table" style="--cols: 2.2fr 1fr 1.1fr .8fr">
    <div class="d-tr head"><span>Item</span><span>Owner</span><span>Status</span><span>Due</span></div>
    ${ITEMS.map((i) => `<div class="d-tr"><b>${i.name}</b><span class="lk-owner"><span class="d-avatar sm">DW</span>${owner}</span><span>${statusTag(i)}</span><span>${i.due}</span></div>`).join("")}
    ${canEdit ? `<button class="d-tr add" data-toast-text="A new row would open here. The plan in this prototype stays at three items.">${IC.plus} Add item</button>` : ""}
  </div>`;
}

/** The page a guest sees. Drawn in Kemal's browser and inside Dana's preview. */
function sharedPage(ctx, { preview = false } = {}) {
  const asked = ctx.data.asked;
  return `
  <div class="lk-shared">
    <div class="lk-guestline has-pin" ${preview ? "" : ctx.flag("3.2")}>
      ${preview ? "" : ctx.pin("3.2")}
      <span class="d-brand"><i>L</i>Larkspur</span>
      <span class="d-tag">${IC.eye} You are viewing as a guest</span>
      <span class="d-spacer"></span>
      <span class="lk-by"><span class="d-avatar sm">DW</span>Shared by Dana Whitlock</span>
      ${
        ctx.on("3.1") && !preview
          ? asked
            ? `<span class="d-tag ok has-pin" ${ctx.flag("3.1")}>${ctx.pin("3.1")}${IC.check} Request sent to Dana</span>`
            : `<span class="has-pin" ${ctx.flag("3.1")}>${ctx.pin("3.1")}<button class="d-btn sm" data-sheet-open="ask" data-cta="ask">${IC.pencil} Ask to edit</button></span>`
          : ""
      }
    </div>
    <div class="lk-shared-body">
      <h1 class="d-h1">Q3 roadmap</h1>
      <p class="d-sub">3 items. View only.</p>
      <div style="margin-top:18px">${planTable("Dana", false)}</div>
      <p class="d-fine" style="margin-top:14px">This link shows this page only. Nothing else in ${WORKSPACE} is shared.</p>
    </div>
  </div>`;
}

const costBlock = (ctx, id) => `
  <div class="lk-cost has-pin" ${ctx.flag(id)}>
    ${ctx.pin(id)}
    <small>What this costs</small>
    <p><span class="d-slot">price</span> per month, from <span class="d-slot">start</span></p>
    <span class="d-fine">The two open slots are for the billing owner to fill in before this ships.</span>
  </div>`;

/* ---------- screens ---------- */

function project(ctx) {
  const d = ctx.data;
  const done = SETUP.filter(([, ok]) => ok).length;
  const guestHere = d.copied && ctx.on("1.1");
  return `
  <div class="d-app">
    ${sidebar("projects")}
    <div class="d-main">
      <div class="d-top">
        <div class="d-crumbs">Projects <span>/</span> <b>Q3 roadmap</b></div>
        <span class="d-spacer"></span>
        <div class="d-avatars">${guestHere ? "1 guest viewing" : "Only you"}<span class="d-avatar">DW</span>${guestHere ? '<span class="d-avatar" style="--tint:#fde9d9;--tint-ink:#b4530a">KA</span>' : ""}</div>
        ${ctx.on("1.2") ? `<span class="has-pin" ${ctx.flag("1.2")}>${ctx.pin("1.2")}<button class="d-btn ghost" data-go="preview" data-cta="preview-top">${IC.eye} Preview as guest</button></span>` : ""}
        ${
          ctx.on("1.1")
            ? `<span class="has-pin" ${ctx.flag("1.1")}>${ctx.pin("1.1")}<button class="d-btn" data-sheet-open="share" data-cta="share">${IC.share} Share</button></span>`
            : `<button class="d-btn ghost sm" aria-label="Page menu" data-toast-text="The page menu has Rename, Duplicate and Delete. Nothing in it is about other people.">${IC.more}</button>`
        }
      </div>
      <div class="p-scroll d-body">
        ${
          ctx.on("3.1") && d.asked && !d.approved
            ? `<div class="d-banner has-pin lk-request" ${ctx.flag("3.1")}>${ctx.pin("3.1")}<span class="d-avatar" style="--tint:#fde9d9;--tint-ink:#b4530a">KA</span><div><b>Kemal Aydin asked to edit this page</b><br>Kemal has a view-only link. Approving adds a member seat.</div><span class="d-spacer"></span><button class="d-btn sm" data-sheet-open="approve" data-cta="review">Review</button></div>`
            : ""
        }
        <div class="lk-head">
          <div><h1 class="d-h1">Q3 roadmap</h1><p class="d-sub">3 items. Edited just now.</p></div>
        </div>
        ${
          ctx.on("2.1") && !d.hideOffer
            ? `<div class="lk-offer has-pin" ${ctx.flag("2.1")}>
            ${ctx.pin("2.1")}
            <div><b>Ready to show someone?</b><p>${ctx.on("1.1") ? "Share this page as a link. Whoever opens it can look, and looking is free." : "This plan has three items now. It is a good moment to let one person see it."}</p></div>
            <span class="d-spacer"></span>
            ${ctx.on("1.1") ? `<button class="d-btn" data-sheet-open="share">${IC.share} Share this page</button>` : `<button class="d-btn" data-go="members">Add someone</button>`}
            <button class="d-btn quiet" data-act="hideOffer">Not now</button>
          </div>`
            : ""
        }
        <div class="lk-cols">
          ${planTable("You", true)}
          <div class="d-card lk-setup">
            <div class="lk-setup-top"><b>Setup checklist</b><span>${done} of ${SETUP.length}</span></div>
            <i class="lk-bar"><em style="width:${(done / SETUP.length) * 100}%"></em></i>
            ${SETUP.map(([t, ok]) => `<div class="d-check round${ok ? " on" : ""}"><i></i><span>${t}</span></div>`).join("")}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function preview(ctx) {
  if (!ctx.on("1.2")) {
    return `
    <div class="d-app solo">
      <div class="p-scroll d-body lk-center">
        <div class="d-card lk-wall">
          <h1 class="d-h1">There is no preview today</h1>
          <p class="d-sub">Dana cannot see what another person would see before inviting them. Turn on point 1.2 to add it.</p>
          <button class="d-btn ghost" data-go="project" style="margin-top:14px">${IC.back} Back to the plan</button>
        </div>
      </div>
    </div>`;
  }
  return `
  <div class="d-app solo">
    <div class="lk-previewbar has-pin" ${ctx.flag("1.2")}>
      ${ctx.pin("1.2")}
      <span class="d-tag ink">${IC.eye} Preview</span>
      <div><b>This is exactly what a guest sees.</b> The sidebar, your other projects and Settings are not shared.</div>
      <span class="d-spacer"></span>
      <button class="d-btn ghost sm" data-go="project">${IC.back} Back to editing</button>
      ${ctx.on("1.1") ? `<button class="d-btn sm" data-act="copy" data-cta="copy-preview">${IC.link} ${ctx.data.copied ? "Link copied" : "Copy the link"}</button>` : ""}
    </div>
    <div class="p-scroll d-body lk-frame"><div class="lk-framed">${sharedPage(ctx, { preview: true })}</div></div>
  </div>`;
}

function members(ctx) {
  const d = ctx.data;
  return `
  <div class="d-app">
    ${sidebar("settings")}
    <div class="d-main">
      <div class="d-top">
        <div class="d-crumbs">Settings <span>/</span> <b>Members</b></div>
        <span class="d-spacer"></span>
        <button class="d-btn" data-sheet-open="invite" data-cta="add-member">${IC.plus} Add member</button>
      </div>
      <div class="p-scroll d-body">
        <h1 class="d-h1">Members</h1>
        <p class="d-sub">${d.approved ? "2 members" : "1 member"} of ${WORKSPACE}.</p>
        <div class="d-table" style="--cols: 2fr 1fr 1fr; margin-top:18px">
          <div class="d-tr head"><span>Name</span><span>Role</span><span>Seat</span></div>
          <div class="d-tr"><span class="lk-owner"><span class="d-avatar sm">DW</span><b>Dana Whitlock</b>&nbsp;(you)</span><span>Admin</span><span><span class="d-tag">Paid</span></span></div>
          ${d.approved ? `<div class="d-tr"><span class="lk-owner"><span class="d-avatar sm" style="--tint:#fde9d9;--tint-ink:#b4530a">KA</span><b>Kemal Aydin</b></span><span>Member</span><span><span class="d-tag">Paid</span></span></div>` : ""}
        </div>
        ${
          ctx.on("3.1")
            ? `<div class="has-pin lk-guests" ${ctx.flag("3.1")}>
            ${ctx.pin("3.1")}
            <h2>Guests</h2>
            <p class="d-sub">People with a view-only link. A guest is free. A seat is paid for only when a guest asks to edit and you approve.</p>
            <div class="d-table" style="--cols: 2fr 1.4fr 1fr; margin-top:12px">
              ${
                d.asked && !d.approved
                  ? `<div class="d-tr"><span class="lk-owner"><span class="d-avatar sm" style="--tint:#fde9d9;--tint-ink:#b4530a">KA</span><b>Kemal Aydin</b></span><span>Asked to edit Q3 roadmap</span><span><button class="d-btn sm" data-sheet-open="approve">Review</button></span></div>`
                  : `<div class="d-tr"><span class="d-fine">${d.approved ? "No guests waiting. Kemal is a member now." : "No requests yet. Guests appear here when they ask to edit."}</span><span></span><span></span></div>`
              }
            </div>
          </div>`
            : ""
        }
      </div>
    </div>
  </div>`;
}

function guest(ctx) {
  if (!ctx.on("3.2")) {
    // Today there is no link. The only way in is a member invite, and it starts with an account.
    return `
    <div class="d-app solo">
      <div class="p-scroll d-body lk-center">
        <div class="d-card lk-wall">
          <div class="d-brand" style="padding:0 0 14px"><i>L</i>Larkspur</div>
          <h1 class="d-h1">Dana Whitlock invited you to ${WORKSPACE}</h1>
          <p class="d-sub">Create an account to open Q3 roadmap.</p>
          <div class="d-field" style="margin-top:16px">Work email<div class="d-input"><span>kemal@whitlock-logistics.example</span></div></div>
          <div class="d-field" style="margin-top:10px">Password<div class="d-input"><span>••••••••••</span></div></div>
          <button class="d-btn wide" style="margin-top:16px" data-toast-text="Today a reader has to join as a member before seeing anything. The prototype stops here.">Create account</button>
          <p class="d-fine" style="margin-top:10px">Joining adds a seat to ${WORKSPACE}.</p>
          ${ctx.on("3.1") ? `<p class="d-fine has-pin" style="margin-top:8px" ${ctx.flag("3.1")}>${ctx.pin("3.1").replace('class="pin"', 'class="pin inline"')} Asking to edit lives on the shared page. Turn on 3.2 to see it.</p>` : ""}
        </div>
      </div>
    </div>`;
  }
  return `<div class="d-app solo"><div class="p-scroll d-body lk-guestbody">${sharedPage(ctx)}</div></div>`;
}

/* ---------- the spec ---------- */

export default {
  app: "larkspur",
  frame: "desktop",
  title: "Larkspur · share by link",
  sub: "Six proposed changes to how a second person gets into a trial. Turn each one on to see it. The numbers match the PRD.",
  legal: "Concept for review, not a live product. Larkspur is fictional, and every name, date and price is illustrative.",
  theme: { brand: "#3157d5", brandInk: "#ffffff", brandSoft: "#e9edff", bg: "#f7f7f4" },
  start: "project",
  // The path the checker walks under every preset: the plan, then the only place people can be added today.
  journey: ["project", "members", "project"],
  paths: { project: ["project"], preview: ["project", "preview"], members: ["project", "members"], guest: ["guest"] },
  sections: [
    { n: 1, title: "The link" },
    { n: 2, title: "When to ask, and what it costs" },
    { n: 3, title: "The guest's side" },
  ],
  flags: [
    { id: "1.1", section: 1, label: "A Share button on every page", screens: ["project"], note: "It makes a link anyone can open to view the page. View only, and free to the guest. The admin sends it to whoever they choose." },
    { id: "1.2", section: 1, label: "Preview as guest", screens: ["project", "preview"], note: "Before the link goes out, the admin sees the page exactly as a view-only guest gets it." },
    { id: "2.1", section: 2, label: "Offer sharing at three items", screens: ["project"], note: "A card above the plan once it has three items. Nothing is asked during signup, when there is nothing to show." },
    { id: "2.2", section: 2, label: "Seat cost in the invite dialog", screens: ["members"], note: "What a seat costs and when billing starts, above the button. The exact words are open slots for the billing owner." },
    { id: "3.1", section: 3, label: "Ask to edit, and the admin approves", screens: ["guest", "members"], note: "A guest who needs more asks. The admin approves, and the seat is paid for at that moment, with the cost shown." },
    { id: "3.2", section: 3, label: "The link opens the page", screens: ["guest"], note: "No signup wall. The page opens view only, with one slim line that says you are a guest." },
  ],
  presets: [
    { id: "today", label: "Today", on: [] },
    { id: "first", label: "First release", on: ["2.2"] },
    { id: "link", label: "With the link", on: ["2.2", "1.1", "1.2", "3.2"] },
    { id: "all", label: "Everything", on: "all" },
  ],
  tour: [
    { screen: "project", say: "The app as it is today. Dana is alone here. The only way to bring anyone in is Settings, then Members." },
    { flag: "1.1", say: "A Share button, top right on every page." },
    { tap: '[data-cta="share"]', sheet: { name: "share" }, say: "The link is view only and free to whoever opens it. Dana sends it to people Dana chooses." },
    { flag: "1.2", spot: '[data-cta="preview"]', say: "Before the link goes out, Dana can look at the page as a guest will." },
    { tap: '[data-cta="preview"]', screen: "preview", say: "The page exactly as the link shows it. Nothing else in the workspace is shared." },
    { screen: "guest", say: "Kemal's side, as it is today. An account comes before anything can be seen." },
    { flag: "3.2", say: "With the link, the page opens straight away. One slim line says Kemal is a guest." },
    { flag: "3.1", say: "If looking is not enough, Kemal can ask to edit." },
    { tap: '[data-cta="ask"]', set: { asked: true }, screen: "project", sheet: { name: "approve" }, say: "Dana gets the request with the cost in front of the button. The seat is paid for only now." },
    { flag: "2.2", screen: "members", sheet: { name: "invite" }, say: "The invite dialog says what a seat costs and when billing starts. The exact words wait for the billing owner." },
    { flag: "2.1", screen: "project", say: "And the offer to share arrives when the plan has three items, not during signup." },
  ],
  state: () => ({ copied: false, asked: false, approved: false, hideOffer: false }),
  screens: {
    project: { name: "The plan", who: "Dana, the admin", url: "app.larkspur.example/projects/q3-roadmap", render: project },
    preview: { name: "Preview", who: "Dana, the admin", url: "app.larkspur.example/projects/q3-roadmap?preview=guest", render: preview },
    members: { name: "Members", who: "Dana, the admin", url: "app.larkspur.example/settings/members", render: members },
    guest: { name: "Kemal's side", who: "Kemal, the reader", url: (ctx) => (ctx.on("3.2") ? LINK : "app.larkspur.example/join?invite=q3-roadmap"), render: guest },
  },
  sheets: {
    share(ctx) {
      const copied = ctx.data.copied;
      return `
      <div class="d-dlg">
        <div><h3>Share this page</h3><p>Q3 roadmap</p></div>
        <div class="lk-linkrow">
          <div class="d-input mono">${IC.link}<span>${LINK}</span>${copied ? '<span class="d-tag ok" style="flex:none">Copied</span>' : ""}</div>
          <button class="d-btn" data-act="copy" data-cta="copy">${copied ? "Copy again" : "Copy link"}</button>
        </div>
        <ul class="lk-facts">
          <li>${IC.eye}<span><b>Anyone with the link can view this page.</b> They cannot edit it.</span></li>
          <li>${IC.projects}<span><b>This page only.</b> Nothing else in ${WORKSPACE} is shared.</span></li>
          <li>${IC.check}<span><b>Free to the guest.</b> You pay for a seat only if a guest asks to edit and you approve.</span></li>
        </ul>
        <div class="d-dlg-foot">
          ${ctx.on("1.2") ? `<span class="has-pin" ${ctx.flag("1.2")}>${ctx.pin("1.2")}<button class="d-btn ghost" data-go="preview" data-cta="preview">${IC.eye} Preview as guest</button></span>` : ""}
          <button class="d-btn ink" data-close>Done</button>
        </div>
      </div>`;
    },
    invite(ctx) {
      return `
      <div class="d-dlg">
        <div><h3>Add member</h3><p>Members can edit everything in ${WORKSPACE}.</p></div>
        ${ctx.on("2.2") ? "" : `<div class="d-banner warn"><b>Adding a member starts billing today: $12 per month</b></div>`}
        <div class="d-field">Email address<div class="d-input"><span style="color:var(--a-faint)">name@company.example</span></div></div>
        <div class="d-field">Role<div class="d-input"><span>Member</span></div></div>
        ${ctx.on("2.2") ? costBlock(ctx, "2.2") : ""}
        ${ctx.on("1.1") ? `<p class="d-fine">Only need someone to look? A view-only link is free. Use Share on any page.</p>` : ""}
        <div class="d-dlg-foot">
          <button class="d-btn quiet" data-close>Cancel</button>
          <button class="d-btn" data-toast-text="An invite would be sent. The prototype stops here.">Add member</button>
        </div>
      </div>`;
    },
    ask() {
      return `
      <div class="d-dlg">
        <div><h3>Ask Dana for edit access</h3><p>Dana gets your request. If Dana approves, you join ${WORKSPACE} as a member and can edit this page.</p></div>
        <div class="d-field">A note for Dana (optional)<div class="d-input" style="min-height:58px;align-items:flex-start;padding-top:9px"><span style="white-space:normal">I would like to add the launch dates.</span></div></div>
        <div class="d-dlg-foot">
          <button class="d-btn quiet" data-close>Cancel</button>
          <button class="d-btn" data-act="ask" data-cta="send-request">Send request</button>
        </div>
      </div>`;
    },
    approve(ctx) {
      return `
      <div class="d-dlg">
        <div><h3>Kemal Aydin asked to edit</h3><p>Kemal has a view-only link to Q3 roadmap. Approving makes Kemal a member of ${WORKSPACE}.</p></div>
        <div class="lk-note"><span class="d-avatar" style="--tint:#fde9d9;--tint-ink:#b4530a">KA</span><p>I would like to add the launch dates.</p></div>
        ${costBlock(ctx, "3.1")}
        <div class="d-dlg-foot">
          <button class="d-btn quiet" data-close>Not now</button>
          <button class="d-btn" data-act="approve" data-cta="approve">Approve and add the seat</button>
        </div>
      </div>`;
    },
  },
  actions: {
    copy(ctx) {
      ctx.data.copied = true;
      return { toast: "Link copied. Send it to anyone you choose." };
    },
    hideOffer(ctx) {
      ctx.data.hideOffer = true;
    },
    ask(ctx) {
      ctx.data.asked = true;
      return { close: true, toast: "Request sent. Dana will see it on the plan and under Members." };
    },
    approve(ctx) {
      ctx.data.approved = true;
      return { close: true, toast: "Kemal is a member now and can edit this page." };
    },
  },
  css: `
    .lk-ws { display:flex; align-items:center; gap:8px; margin:0 0 10px; padding:7px 8px; border-radius:9px; background:#fff; box-shadow:0 0 0 1px var(--a-line2); font-size:12.500px; }
    .lk-ws b { font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .lk-trial { display:grid; gap:2px; padding:10px 11px; border-radius:11px; background:#fff; box-shadow:0 0 0 1px var(--a-line2); font-size:12px; }
    .lk-trial b { font-weight:600; } .lk-trial span { color:var(--a-muted); }
    .lk-trial i { display:block; height:4px; margin-top:6px; border-radius:2px; background:var(--a-line2); overflow:hidden; }
    .lk-trial em { display:block; width:21%; height:100%; background:var(--brand); }
    .lk-me { display:flex; align-items:center; gap:9px; padding:4px 6px; }
    .lk-me b { display:block; font-size:12.500px; font-weight:600; } .lk-me small { color:var(--a-muted); font-size:11.500px; }
    .lk-head { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:16px; }
    .lk-cols { display:grid; grid-template-columns:minmax(0,1fr) 214px; gap:16px; align-items:start; }
    .lk-owner { display:flex; align-items:center; gap:7px; }
    .lk-setup { display:grid; gap:1px; padding:14px 15px; font-size:12.500px; }
    .lk-setup-top { display:flex; justify-content:space-between; font-weight:600; } .lk-setup-top span { color:var(--a-muted); font-weight:500; }
    .lk-bar { display:block; height:5px; margin:8px 0 6px; border-radius:3px; background:var(--a-line2); overflow:hidden; } .lk-bar em { display:block; height:100%; background:var(--brand); }
    .lk-setup .d-check { min-height:27px; cursor:default; } .lk-setup .d-check.on span { color:var(--a-muted); text-decoration:line-through; }
    .lk-offer { display:flex; align-items:center; gap:10px; margin-bottom:16px; padding:14px 16px; border-radius:14px; background:var(--brand-soft); box-shadow:inset 0 0 0 1.500px color-mix(in srgb, var(--brand) 30%, transparent); }
    .lk-offer b { font-size:14.500px; font-weight:650; letter-spacing:-.01em; } .lk-offer p { margin-top:2px; color:var(--a-ink2); }
    .lk-request { margin-bottom:16px; } .lk-request div { line-height:1.4; }
    .lk-guests { margin-top:26px; } .lk-guests h2 { font-size:16px; font-weight:650; letter-spacing:-.015em; }
    .lk-center { display:grid; place-items:center; background:var(--app-bg); }
    .lk-wall { width:380px; padding:26px; } .lk-wall .d-h1 { font-size:20px; }
    .lk-previewbar { display:flex; align-items:center; gap:12px; flex:none; padding:10px 18px; background:#0c0c0b; color:#fff; font-size:12.500px; }
    .lk-previewbar b { font-weight:600; } .lk-previewbar .d-tag.ink { background:var(--a-hi); color:var(--a-hi-ink); }
    .lk-previewbar .d-btn.ghost { background:rgba(255,255,255,.14); color:#fff; box-shadow:none; }
    .lk-frame { background:repeating-linear-gradient(135deg, #f1f1ec 0 10px, #ecece6 10px 20px); padding:22px 34px 0; }
    .lk-framed { min-height:100%; border-radius:14px 14px 0 0; background:#fff; box-shadow:0 0 0 1px var(--a-line), 0 20px 40px -20px rgba(12,12,11,.3); overflow:hidden; }
    .lk-guestbody { padding:0; }
    .lk-guestline { display:flex; align-items:center; gap:12px; height:50px; padding:0 22px; border-bottom:1px solid var(--a-line2); background:#fafaf7; }
    .lk-guestline .d-brand { padding:0; font-size:14px; } .lk-guestline svg { width:13px; height:13px; }
    .lk-by { display:flex; align-items:center; gap:7px; color:var(--a-muted); font-size:12.500px; }
    .lk-shared-body { max-width:720px; margin:0 auto; padding:30px 28px 34px; }
    .lk-linkrow { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:8px; } .lk-linkrow svg { width:14px; height:14px; flex:none; color:var(--a-muted); }
    .lk-facts { display:grid; gap:9px; margin:0; padding:0; list-style:none; }
    .lk-facts li { display:flex; gap:10px; align-items:flex-start; color:var(--a-ink2); line-height:1.4; } .lk-facts b { color:var(--a-ink); font-weight:600; }
    .lk-facts svg { flex:none; width:16px; height:16px; margin-top:1px; color:var(--brand); }
    .lk-cost { display:grid; gap:3px; padding:12px 14px; border-radius:12px; background:#f5f5f1; }
    .lk-cost small { color:var(--a-muted); font-size:11.500px; font-weight:600; } .lk-cost p { font-size:15px !important; font-weight:600; color:var(--a-ink) !important; }
    .lk-note { display:flex; gap:10px; align-items:flex-start; } .lk-note p { padding:9px 12px; border-radius:4px 12px 12px 12px; background:#f5f5f1; }
  `,
};
