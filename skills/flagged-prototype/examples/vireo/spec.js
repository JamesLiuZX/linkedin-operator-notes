// Vireo Recap: draft first, with sources. A flagged prototype spec for an app in a browser window.
//
// Vireo is a fictional video-meeting product. Its AI feature, Recap, writes a
// summary, the decisions and the action items after a meeting. Every name,
// time and line here is made up. The six switches match the six points of the
// PRD in ../../../decision-prd/examples/vireo/prd.json, ID for ID.
//
// Two people use this prototype. Priya Raman hosted the meeting. Sam Ortiz was
// in it, and the recap names Sam as the owner of an action item. The "owner"
// screen is Sam's inbox.

/* ---------- data (illustrative) ---------- */

const MEETING = { title: "Pricing review with Northgate", when: "Thu 12 Nov", length: "42 min", minutes: 42 };

const PEOPLE = {
  priya: { name: "Priya Raman", short: "Priya", initials: "PR", role: "Host", tint: "#dff3ec", ink: "#0e7c66" },
  sam: { name: "Sam Ortiz", short: "Sam", initials: "SO", role: "Sales", tint: "#e6ecff", ink: "#2b50ff" },
  dana: { name: "Dana Whitlock", short: "Dana", initials: "DW", role: "Finance", tint: "#fdebd3", ink: "#a85a00" },
  jonah: { name: "Jonah Reyes", short: "Jonah", initials: "JR", role: "Product", tint: "#f1e8ff", ink: "#6a3fd6" },
  mei: { name: "Mei Tanaka", short: "Mei", initials: "MT", role: "Support", tint: "#ffe6ef", ink: "#c21d68" },
  arjun: { name: "Arjun Patel", short: "Arjun", initials: "AP", role: "Legal", tint: "#e4f1f7", ink: "#1b6e93" },
  lena: { name: "Lena Fischer", short: "Lena", initials: "LF", role: "Sales", tint: "#eef1dc", ink: "#5d6b13" },
  marcus: { name: "Marcus Webb", short: "Marcus", initials: "MW", role: "Northgate", tint: "#ececE6", ink: "#3b3b36", external: true },
  ines: { name: "Ines Duarte", short: "Ines", initials: "ID", role: "Northgate", tint: "#ececE6", ink: "#3b3b36", external: true },
};
const INVITEES = Object.keys(PEOPLE);

// What was said, at the moments the recap's lines point to.
const MOMENTS = {
  "03:18": [
    ["marcus", "We would need <mark>three tiers</mark> to get this past finance."],
    ["priya", "Understood. We will send a <mark>revised quote by Tuesday</mark>."],
  ],
  "12:04": [
    ["marcus", "So we keep annual billing as the default?"],
    ["priya", "Yes, <mark>annual stays the default</mark>."],
  ],
  "18:22": [
    ["sam", "We could offer <mark>a two-year term</mark> at a lower rate."],
    ["marcus", "Maybe. I would have to ask."],
  ],
  "31:40": [
    ["marcus", "Could the pilot start on <mark>the 4th of January</mark>?"],
    ["sam", "The 4th or <mark>the 11th</mark>, depending on the contract."],
  ],
  "36:05": [
    ["dana", "Should we <mark>move the kickoff call to Friday</mark>?"],
    ["priya", "Let us see how the quote lands first."],
  ],
  "38:10": [["sam", "<mark>I will send the revised quote</mark> to Northgate."]],
  "38:40": [["dana", "<mark>I can check the seat counts.</mark>"]],
  "39:12": [
    ["priya", "Someone should <mark>book the kickoff call</mark>."],
    ["marcus", "Sure, sounds good."],
  ],
};

const SUMMARY = { text: "Northgate wants three price tiers. We will send a revised quote by Tuesday.", at: "03:18" };
// `settled` is what the meeting actually agreed. Today the recap lists all four under Decisions.
const LINES = [
  { id: "annual", text: "Annual billing stays the default.", at: "12:04", settled: true },
  { id: "term", text: "Offer a two-year term.", at: "18:22", settled: false },
  { id: "pilot", text: "The pilot starts on 4 January.", at: "31:40", settled: true, unsure: "Heard as 4 January and 11 January" },
  { id: "kickoff", text: "Move the kickoff call to Friday.", at: "36:05", settled: false },
];
const ACTIONS = [
  { id: "quote", text: "Send the revised quote to Northgate", owner: "sam", at: "38:10" },
  { id: "seats", text: "Check seat counts", owner: "dana", at: "38:40" },
  { id: "call", text: "Book the kickoff call", owner: "marcus", at: "39:12" },
];

const pct = (at) => {
  const [m, s] = at.split(":").map(Number);
  return ((m * 60 + s) / (MEETING.minutes * 60)) * 100;
};

/* ---------- icons ---------- */

const svg = (d, extra = "") => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const IC = {
  play: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5 3.200v9.600a.6.6 0 0 0 .92.5l7.300-4.800a.6.6 0 0 0 0-1L5.920 2.700a.6.6 0 0 0-.92.5Z"/></svg>',
  send: svg('<path d="M14 2 7 9M14 2 9.500 14 7 9 2 6.500 14 2Z"/>'),
  lock: svg('<rect x="3.500" y="7" width="9" height="6.500" rx="1.500"/><path d="M5.500 7V5a2.500 2.500 0 0 1 5 0v2"/>'),
  check: svg('<path d="m3.500 8.500 3 3 6-7"/>', 'stroke-width="2"'),
  flag: svg('<path d="M3.500 14V2.500M3.500 3h8l-1.500 3 1.500 3h-8"/>'),
  clock: svg('<circle cx="8" cy="8" r="5.500"/><path d="M8 5v3.200l2 1.300"/>'),
  pencil: svg('<path d="M10.500 3 13 5.500 6 12.500l-3 .500.500-3 7-7Z"/>'),
  back: svg('<path d="M10 3.500 5.500 8 10 12.500"/>'),
  users: svg('<circle cx="6" cy="6" r="2.300"/><path d="M2 13c.500-2.200 2-3.300 4-3.300s3.500 1.100 4 3.300M11 4a2.200 2.200 0 0 1 0 4.300M12 9.900c1.200.400 1.800 1.500 2 3.100"/>'),
  mail: svg('<rect x="2" y="3.500" width="12" height="9" rx="1.800"/><path d="m2.500 5 5.500 4 5.500-4"/>'),
};

/* ---------- pieces shared by more than one screen ---------- */

const avatar = (k, cls = "") => `<span class="d-avatar ${cls}" style="--tint:${PEOPLE[k].tint};--tint-ink:${PEOPLE[k].ink}">${PEOPLE[k].initials}</span>`;

function topbar(on) {
  const tab = (key, label, attrs) => `<button class="vr-tab${on === key ? " on" : ""}" ${attrs}>${label}</button>`;
  return `
  <header class="vr-top">
    <span class="d-brand"><i>V</i>Vireo</span>
    <nav>
      ${tab("meetings", "Meetings", 'data-toast-text="Meetings lists your calendar. This prototype covers one recap."')}
      ${tab("recaps", "Recaps", 'data-go="recap"')}
      ${tab("settings", "Settings", 'data-toast-text="Settings is where a host turns Recap on or off."')}
    </nav>
    <span class="d-spacer"></span>
    ${avatar("priya")}
  </header>`;
}

/** The time a line was said, as a button that plays the recording from there. */
const cite = (ctx, at) => (ctx.on("1.1") ? `<button class="vr-cite${ctx.data.at === at ? " on" : ""}" data-act="seek" data-k="${at}" data-cite="${at}" aria-label="Play from ${at}">${IC.play}${at}</button>` : "");

function line(ctx, l) {
  const d = ctx.data;
  const flagged = ctx.on("3.2") && l.unsure;
  const fixed = flagged && d.pilotChecked;
  return `
  <li class="vr-line${flagged && !fixed ? " unsure" : ""}${d.at === l.at && ctx.on("1.1") ? " playing" : ""}">
    <span class="vr-text">${l.text}</span>${cite(ctx, l.at)}
    ${
      flagged
        ? fixed
          ? `<span class="d-tag ok has-pin" ${ctx.flag("3.2")}>${IC.check} Checked by you</span>`
          : `<span class="vr-check has-pin" ${ctx.flag("3.2")}>${ctx.pin("3.2")}<b>${IC.flag} Check this</b><span>${l.unsure}</span><button class="d-btn sm ghost" data-sheet-open="editline" data-cta="editline">${IC.pencil} Edit line</button></span>`
        : ""
    }
  </li>`;
}

function recording(ctx) {
  const d = ctx.data;
  if (!ctx.on("1.1")) {
    return `
    <aside class="vr-rec today">
      <div class="vr-video still"><span class="vr-len">${MEETING.length}</span><i>${IC.play}</i></div>
      <button class="d-btn ghost wide" data-toast-text="Opens the whole 42 minute recording at 0:00. Nothing links a line of the recap to a moment in it.">${IC.play} Watch recording (${MEETING.length})</button>
      <p class="d-fine">To check a line today, a host scrubs through the recording until they find it.</p>
    </aside>`;
  }
  const at = d.at;
  const said = at ? MOMENTS[at] || [] : [];
  const speaking = said.length ? said[said.length - 1][0] : null;
  const marks = [SUMMARY.at, ...LINES.map((l) => l.at), ...ACTIONS.map((a) => a.at)];
  return `
  <aside class="vr-rec has-pin" ${ctx.flag("1.1")}>
    ${ctx.pin("1.1").replace('class="pin"', 'class="pin left"')}
    <div class="vr-video">
      <div class="vr-tiles">${["priya", "sam", "dana", "marcus"].map((k) => `<span class="vr-tile${speaking === k ? " on" : ""}">${avatar(k)}<small>${PEOPLE[k].short}</small></span>`).join("")}</div>
      ${at ? `<span class="vr-now">${IC.play} Playing from ${at}</span>` : `<span class="vr-now idle">Pick a time on the left</span>`}
    </div>
    <div class="vr-track">
      <i style="width:${at ? pct(at) : 0}%"></i>
      ${marks.map((m) => `<button class="${m === at ? "on" : ""}" style="left:${pct(m)}%" data-act="seek" data-k="${m}" aria-label="Play from ${m}"></button>`).join("")}
    </div>
    <div class="vr-clock"><b>${at || "00:00"}</b><span>/ 42:00</span><span class="d-spacer"></span><span>${marks.length} moments are linked from the recap</span></div>
    <div class="vr-script">
      ${
        said.length
          ? said.map(([k, text]) => `<div class="vr-said">${avatar(k, "sm")}<div><b>${PEOPLE[k].short}</b><p>${text}</p></div></div>`).join("")
          : `<p class="d-fine">The words around each moment show here, with the part the recap used marked.</p>`
      }
    </div>
  </aside>`;
}

function ownerChip(ctx, a) {
  const d = ctx.data;
  const p = PEOPLE[a.owner];
  if (!ctx.on("2.2")) return `<span class="vr-owner">${avatar(a.owner, "sm")}Owner: ${p.short}</span>`;
  const state = a.id === "quote" ? d.sam : null;
  if (state === "yes") return `<span class="d-tag ok">${IC.check} Confirmed by ${p.short}. Task created</span>`;
  if (state === "no") return `<span class="d-tag bad">${p.short} said: this is not mine</span>`;
  return `<span class="d-tag warn">${IC.clock} Waiting for ${p.short} to confirm</span>`;
}

/* ---------- screens ---------- */

function recap(ctx) {
  const d = ctx.data;
  const draft = ctx.on("2.1");
  const decided = LINES.filter((l) => l.settled);
  const raised = LINES.filter((l) => !l.settled);
  return `
  <div class="vr-app">
    ${topbar("recaps")}
    <div class="vr-head">
      <div>
        <h1 class="d-h1">${MEETING.title}</h1>
        <p class="d-sub">${MEETING.when}, ${MEETING.length}, ${INVITEES.length} invitees</p>
      </div>
      <span class="d-spacer"></span>
      ${
        draft
          ? d.sent
            ? `<span class="d-tag ok has-pin" ${ctx.flag("2.1")}>${ctx.pin("2.1")}${IC.check} Sent by you at 11:02</span>`
            : `<span class="d-tag brand has-pin" ${ctx.flag("2.1")}>${ctx.pin("2.1")}${IC.lock} Draft. Sent to you only</span>`
          : `<span class="d-tag warn">${IC.send} Sent to all ${INVITEES.length} invitees at 10:47</span>`
      }
      <button class="d-btn${draft ? "" : " ghost"}" data-go="send" data-cta="send">${draft ? `${IC.send} Review and send` : "Share recap"}</button>
    </div>
    <div class="vr-body">
      <div class="p-scroll vr-doc">
        <section>
          <h2>Summary</h2>
          <ul><li class="vr-line${d.at === SUMMARY.at && ctx.on("1.1") ? " playing" : ""}"><span class="vr-text">${SUMMARY.text}</span>${cite(ctx, SUMMARY.at)}</li></ul>
        </section>
        ${
          ctx.on("1.2")
            ? `<section class="has-pin" ${ctx.flag("1.2")}>
            ${ctx.pin("1.2")}
            <h2>Decided</h2>
            <ul>${decided.map((l) => line(ctx, l)).join("")}</ul>
            <h2 class="vr-raised">Discussed, not decided</h2>
            <ul class="soft">${raised.map((l) => line(ctx, l)).join("")}</ul>
            <p class="d-fine">A line under Discussed never becomes a task and never goes out as a decision.</p>
          </section>`
            : `<section>
            <h2>Decisions</h2>
            <ul>${LINES.map((l) => line(ctx, l)).join("")}</ul>
          </section>`
        }
        <section>
          <h2>Action items</h2>
          <ul class="vr-todo${ctx.on("2.2") ? " has-pin" : ""}" ${ctx.on("2.2") ? ctx.flag("2.2") : ""}>
            ${ctx.on("2.2") ? ctx.pin("2.2") : ""}
            ${ACTIONS.map((a) => `<li class="vr-line${d.at === a.at && ctx.on("1.1") ? " playing" : ""}"><span class="vr-box"></span><span class="vr-text">${a.text}</span>${cite(ctx, a.at)}${ownerChip(ctx, a)}</li>`).join("")}
          </ul>
          ${ctx.on("2.2") ? `<p class="d-fine">A task is created only after its owner confirms. An owner can also say it is not theirs.</p>` : ""}
        </section>
      </div>
      ${recording(ctx)}
    </div>
  </div>`;
}

function send(ctx) {
  const d = ctx.data;
  const draft = ctx.on("2.1");
  const named = ctx.on("3.1");
  const others = INVITEES.filter((k) => k !== "priya");
  const picked = others.filter((k) => d.to[k]);
  const guests = picked.filter((k) => PEOPLE[k].external);
  const count = named ? picked.length : d.scope === "all" ? others.length : d.scope === "me" ? 0 : 3;
  const decided = LINES.filter((l) => l.settled);

  const person = (k) => `
    <button class="vr-person${d.to[k] ? " on" : ""}" data-act="tick" data-k="${k}">
      <span class="d-check${d.to[k] ? " on" : ""}"><i></i></span>${avatar(k, "sm")}
      <span class="vr-who"><b>${PEOPLE[k].name}</b><small>${PEOPLE[k].role}</small></span>
      ${PEOPLE[k].external ? `<span class="d-tag ink">External</span>${d.to[k] ? '<span class="d-tag brand">Gets the trimmed recap</span>' : ""}` : ""}
    </button>`;

  const scope = (k, title, sub) => `<button class="vr-scope${d.scope === k ? " on" : ""}" data-act="scope" data-k="${k}"><span class="d-check round${d.scope === k ? " on" : ""}"><i></i></span><span><b>${title}</b><small>${sub}</small></span></button>`;

  return `
  <div class="vr-app">
    ${topbar("recaps")}
    <div class="vr-head">
      <button class="d-btn ghost sm" data-go="recap" aria-label="Back to the recap">${IC.back} Recap</button>
      <div>
        <h1 class="d-h1">${draft ? "Send recap" : "Share recap"}</h1>
        <p class="d-sub">${MEETING.title}</p>
      </div>
      <span class="d-spacer"></span>
      ${
        draft
          ? `<span class="d-tag brand has-pin" ${ctx.flag("2.1")}>${ctx.pin("2.1")}${IC.lock} ${d.sent ? "Sent at 11:02" : "Nobody else has this yet"}</span>`
          : `<span class="d-tag warn">${IC.send} Already sent to all ${INVITEES.length} invitees at 10:47</span>`
      }
    </div>
    <div class="vr-body">
      <div class="p-scroll vr-doc">
        <section class="${named ? "has-pin" : ""}" ${named ? ctx.flag("3.1") : ""}>
          ${named ? ctx.pin("3.1") : ""}
          <h2>${named ? "Who gets it" : "Choose who gets this recap"}</h2>
          ${
            named
              ? `<div class="vr-people">${others.map(person).join("")}</div>
                 <p class="d-fine">Guests are left unticked. A ticked guest gets the summary and the decisions. Internal remarks and other people's action items stay out unless you turn them on.</p>`
              : `<div class="vr-scopes">
                  ${scope("all", `All ${INVITEES.length} invitees`, "Everyone who was invited, whoever they are")}
                  ${scope("pick", "Only the people I pick", "Choose from the invite list")}
                  ${scope("me", "Just me", "Keep it to yourself")}
                </div>
                ${draft ? "" : `<p class="d-fine">The choice comes after the recap has gone. It reached all ${INVITEES.length} invitees five minutes after the meeting ended.</p>`}`
          }
        </section>
        <div class="vr-sendrow">
          <button class="d-btn" data-act="send" data-cta="do-send">${IC.send} ${draft ? (count ? `Send to ${count} ${count === 1 ? "person" : "people"}` : "Keep it to myself") : "Share again"}</button>
          <button class="d-btn quiet" data-go="owner" data-cta="owner">See it from Sam's side</button>
        </div>
      </div>
      <aside class="vr-rec vr-preview">
        <small class="vr-cap">${named && guests.length ? `What ${PEOPLE[guests[0]].short} gets` : named ? "What a guest would get" : "What goes out"}</small>
        <div class="d-card vr-mail">
          <b>Recap: ${MEETING.title}</b>
          <p>${SUMMARY.text}</p>
          <h3>${ctx.on("1.2") ? "Decided" : "Decisions"}</h3>
          <ul>${(ctx.on("1.2") ? decided : LINES).map((l) => `<li>${l.text}</li>`).join("")}</ul>
          ${
            named
              ? `<p class="vr-cut">Left out for guests: ${ctx.on("1.2") ? "2 lines under Discussed, " : ""}${ACTIONS.length} action items and internal remarks.</p>`
              : `<h3>Action items</h3><ul>${ACTIONS.map((a) => `<li>${a.text}. Owner: ${PEOPLE[a.owner].short}</li>`).join("")}</ul>`
          }
        </div>
      </aside>
    </div>
  </div>`;
}

function owner(ctx) {
  const d = ctx.data;
  const draft = ctx.on("2.1");
  const ask = ctx.on("2.2");
  const stamp = draft ? "Sent by Priya Raman at 11:02" : `Sent to all ${INVITEES.length} invitees at 10:47`;
  const mail = (from, subject, when, on) => `<div class="vr-mrow${on ? " on" : ""}"><b>${from}</b><span>${subject}</span><small>${when}</small></div>`;
  return `
  <div class="vr-app vr-inbox">
    <header class="vr-top">
      <span class="d-brand" style="--brand:#3b3b36"><i>${IC.mail}</i>Mail</span>
      <span class="d-spacer"></span>
      ${avatar("sam")}
    </header>
    <div class="vr-mailgrid">
      <div class="vr-mlist">
        ${mail("Vireo Recap", ask ? "You are named on 1 action item" : `Recap: ${MEETING.title}`, draft ? "11:02" : "10:47", true)}
        ${mail("Dana Whitlock", "Seat counts for Northgate", "09:58", false)}
        ${mail("Calendar", "Weekly sync moved to 3pm", "Wed", false)}
        <button class="d-btn ghost sm" style="margin:10px" data-go="recap">${IC.back} Back to Priya's side</button>
      </div>
      <div class="p-scroll vr-open">
        <h1 class="d-h1">${ask ? "You are named on 1 action item" : `Recap: ${MEETING.title}`}</h1>
        <p class="d-sub">From Vireo Recap, ${MEETING.when}. <span class="${draft ? "has-pin" : ""}" ${draft ? ctx.flag("2.1") : ""}>${stamp}${draft ? ctx.pin("2.1").replace('class="pin"', 'class="pin inline"') : ""}</span></p>
        ${
          ask
            ? `<div class="d-card vr-ask has-pin" ${ctx.flag("2.2")}>
              ${ctx.pin("2.2")}
              <small>${MEETING.title}</small>
              <b>${ACTIONS[0].text}</b>
              <div class="vr-said">${avatar("sam", "sm")}<div><b>Sam, at ${ACTIONS[0].at}</b><p>${MOMENTS[ACTIONS[0].at][0][1]}</p></div></div>
              ${
                d.sam === "yes"
                  ? `<span class="d-tag ok">${IC.check} Confirmed. A task was added to your list</span>`
                  : d.sam === "no"
                    ? `<span class="d-tag bad">You said this is not yours. Priya has been told</span>`
                    : `<div class="vr-sendrow"><button class="d-btn" data-act="confirm" data-cta="confirm">${IC.check} Yes, this is mine</button><button class="d-btn ghost" data-act="notmine">This is not mine</button></div>`
              }
              <p class="d-fine">Nothing is added to your task list until you confirm.</p>
            </div>`
            : `<div class="vr-plain">
              <p>${SUMMARY.text}</p>
              <h3>Action items</h3>
              <ul>${ACTIONS.map((a) => `<li>${a.text}. <b>Owner: ${PEOPLE[a.owner].short}</b></li>`).join("")}</ul>
              <p class="d-fine">There is nothing here for Sam to accept or decline. The recap says he owns it, and everyone has already read that.</p>
              <button class="d-btn ghost" data-go="recap">Open recap</button>
            </div>`
        }
      </div>
    </div>
  </div>`;
}

/* ---------- the spec ---------- */

export default {
  app: "vireo",
  frame: "desktop",
  title: "Vireo Recap · draft first, with sources",
  sub: "Six proposed changes to what happens after a meeting ends. Turn each one on to see it. The numbers match the PRD.",
  legal: "Concept for review, not a live product. Vireo is fictional, and every name, time and line of the meeting is illustrative.",
  theme: { brand: "#0e7c66", brandInk: "#ffffff", brandSoft: "#e2f3ee", bg: "#f6f7f4" },
  start: "recap",
  // The path the checker walks under every preset: read it, send it, see it from an owner's side.
  journey: ["recap", "send", "owner"],
  paths: { recap: ["recap"], send: ["recap", "send"], owner: ["owner"] },
  sections: [
    { n: 1, title: "Checking a line" },
    { n: 2, title: "Who sees it, and who owns it" },
    { n: 3, title: "Outsiders and doubt" },
  ],
  flags: [
    { id: "1.1", section: 1, label: "Every line cites its moment", screens: ["recap"], note: "Each line ends with the time it was said. Click it and the recording plays from there, with the line still in view." },
    { id: "1.2", section: 1, label: "Decided, apart from only discussed", screens: ["recap", "send"], note: "One Decisions list becomes two. A line under Discussed never becomes a task or goes out as a decision." },
    { id: "2.1", section: 2, label: "Draft first, to the host alone", screens: ["recap", "send", "owner"], note: "The host gets the recap before anyone else, reviews it, then chooses who gets it. Nothing goes out by itself." },
    { id: "2.2", section: 2, label: "Owners confirm their action items", screens: ["recap", "owner"], note: "Each item waits for its owner. A task is created only after they confirm, and they can say it is not theirs." },
    { id: "3.1", section: 3, label: "Guests named, and a trimmed recap", screens: ["send"], note: "Every invitee is listed by name. Outsiders are marked External and left unticked. A ticked guest gets a trimmed recap." },
    { id: "3.2", section: 3, label: "Doubtful lines say so", screens: ["recap"], note: "A line the model is unsure of is marked Check this, with the reason. The host edits it in place." },
  ],
  presets: [
    { id: "today", label: "Today", on: [] },
    { id: "first", label: "First release", on: ["2.1", "1.2"] },
    { id: "check", label: "With sources", on: ["2.1", "1.2", "1.1", "3.2"] },
    { id: "all", label: "Everything", on: "all" },
  ],
  tour: [
    { screen: "recap", say: "The recap as it is today. It reached all nine invitees at 10:47, before the host had read a line of it." },
    { flag: "2.1", say: "Draft first. The host gets it alone, and nothing goes out by itself." },
    { flag: "1.2", say: "Two things that were only raised no longer sit under Decisions." },
    { flag: "1.1", say: "Every line now ends with the moment it was said." },
    { tap: '[data-cite="12:04"]', set: { at: "12:04" }, say: "Click a time. The recording plays from there, with the words the recap used marked." },
    { flag: "3.2", say: "A line the model is unsure of says so, and says why." },
    { tap: '[data-cite="31:40"]', set: { at: "31:40" }, say: "One click settles it. Both dates were said in the meeting." },
    { flag: "2.2", say: "Action items wait for their owners. One was given to a guest who only said: sure, sounds good." },
    { tap: '[data-cta="send"]', screen: "send", say: "Sending is now a step the host takes." },
    { flag: "3.1", say: "Guests are named, marked External and left unticked. A ticked guest gets a trimmed recap." },
    { tap: '[data-cta="owner"]', screen: "owner", say: "Sam's side. The item becomes his task only when he says it is his." },
  ],
  state: () => ({
    at: null,
    pilotChecked: false,
    sam: null,
    sent: false,
    scope: "all",
    to: Object.fromEntries(INVITEES.map((k) => [k, !PEOPLE[k].external])),
  }),
  screens: {
    recap: { name: "The recap", who: "Priya, the host", url: "vireo.example/recap/8841", render: recap },
    send: { name: "Send", who: "Priya, the host", url: "vireo.example/recap/8841/send", render: send },
    owner: { name: "Sam's side", who: "Sam, an owner", url: "mail.example/inbox/vireo-8841", render: owner },
  },
  sheets: {
    editline(ctx) {
      const l = LINES.find((x) => x.id === "pilot");
      return `
      <div class="d-dlg">
        <div><h3>Check this line</h3><p>${l.unsure}. Play it, then keep the line or change it.</p></div>
        <div class="vr-dlgsaid">${MOMENTS[l.at].map(([k, text]) => `<div class="vr-said">${avatar(k, "sm")}<div><b>${PEOPLE[k].short}, at ${l.at}</b><p>${text}</p></div></div>`).join("")}</div>
        <div class="d-field">The line in the recap<div class="d-input"><span>${l.text}</span></div></div>
        <p class="d-fine">Edits are saved in the draft only.</p>
        <div class="d-dlg-foot">
          <button class="d-btn quiet" data-close>Cancel</button>
          <button class="d-btn" data-act="saveLine" data-cta="save-line">Keep this line</button>
        </div>
      </div>`;
    },
  },
  actions: {
    seek(ctx, k) {
      ctx.data.at = k;
    },
    saveLine(ctx) {
      ctx.data.pilotChecked = true;
      return { close: true, toast: "Marked as checked by you. The draft keeps the line." };
    },
    tick(ctx, k) {
      ctx.data.to[k] = !ctx.data.to[k];
    },
    scope(ctx, k) {
      ctx.data.scope = k;
    },
    send(ctx) {
      if (!ctx.on("2.1")) return { toast: "It already went to all nine at 10:47. Sharing again sends a second copy." };
      ctx.data.sent = true;
      return { toast: "Sent. Each owner is asked to confirm before a task is made." };
    },
    confirm(ctx) {
      ctx.data.sam = "yes";
      return { toast: "Confirmed. Priya can see it on the recap." };
    },
    notmine(ctx) {
      ctx.data.sam = "no";
      return { toast: "Priya has been told this one needs another owner." };
    },
  },
  css: `
    .vr-app { display:flex; flex-direction:column; width:100%; height:100%; background:#fff; font-size:13px; line-height:1.42; color:var(--a-ink); }
    .vr-top { display:flex; align-items:center; gap:22px; flex:none; height:48px; padding:0 20px; border-bottom:1px solid var(--a-line2); background:var(--app-bg); }
    .vr-top .d-brand { padding:0; } .vr-top .d-brand svg { width:13px; height:13px; }
    .vr-top nav { display:flex; gap:2px; }
    .vr-tab { all:unset; height:30px; padding:0 11px; border-radius:8px; color:var(--a-ink2); font-weight:500; line-height:30px; cursor:pointer; }
    .vr-tab:hover { background:rgba(12,12,11,.05); } .vr-tab.on { background:#fff; color:var(--a-ink); font-weight:600; box-shadow:0 0 0 1px var(--a-line2); }
    .vr-head { display:flex; align-items:center; gap:12px; flex:none; padding:16px 24px 14px; border-bottom:1px solid var(--a-line2); }
    .vr-head .d-h1 { font-size:21px; } .vr-head .d-tag { height:26px; padding:0 10px; font-size:12px; } .vr-head .d-tag svg, .d-tag svg { width:12px; height:12px; }
    .vr-body { display:grid; grid-template-columns:minmax(0,1fr) 352px; flex:1; min-height:0; }
    .p-scroll.vr-doc { padding:18px 24px 26px; overflow-y:auto; scrollbar-width:thin; }
    .vr-doc section { position:relative; margin-bottom:20px; }
    .vr-doc h2 { margin-bottom:6px; color:var(--a-muted); font-size:12px; font-weight:600; }
    .vr-doc h2.vr-raised { margin-top:14px; }
    .vr-doc ul { display:grid; gap:2px; margin:0; padding:0; list-style:none; }
    .vr-line { display:flex; flex-wrap:wrap; align-items:center; gap:6px 9px; padding:7px 9px; margin:0 -9px; border-radius:10px; font-size:14.500px; line-height:1.38; }
    .vr-line.playing { background:var(--brand-soft); }
    .vr-line.unsure .vr-text { background:linear-gradient(transparent 62%, #ffe08a 62%); }
    ul.soft .vr-text { color:var(--a-ink2); }
    .vr-cite { all:unset; display:inline-flex; align-items:center; gap:4px; height:22px; padding:0 8px 0 6px; border-radius:999px; background:#f1f1ec; color:var(--a-ink2); font-family:var(--a-mono); font-size:11.500px; font-weight:600; cursor:pointer; transition:background-color .15s, color .15s; }
    .vr-cite svg { width:9px; height:9px; } .vr-cite:hover, .vr-cite.on { background:var(--brand); color:#fff; }
    .vr-check { display:flex; flex-wrap:wrap; align-items:center; gap:6px 10px; flex:1 1 100%; padding:8px 10px; border-radius:10px; background:#fff6d6; font-size:12.500px; }
    .vr-check b { display:inline-flex; align-items:center; gap:5px; font-weight:650; } .vr-check b svg { width:12px; height:12px; } .vr-check > span { color:var(--a-ink2); flex:1; }
    .vr-todo { position:relative; } .vr-box { flex:none; width:15px; height:15px; border-radius:5px; box-shadow:inset 0 0 0 1.500px var(--a-faint); }
    .vr-owner { display:inline-flex; align-items:center; gap:6px; margin-left:auto; color:var(--a-ink2); font-size:12.500px; font-weight:500; }
    .vr-todo .d-tag { margin-left:auto; }
    .vr-rec { position:relative; display:flex; flex-direction:column; gap:10px; min-height:0; padding:18px 20px; border-left:1px solid var(--a-line2); background:var(--app-bg); }
    .vr-video { position:relative; flex:none; aspect-ratio:16 / 9; border-radius:12px; background:#16211e; overflow:hidden; }
    .vr-video.still { display:grid; place-items:center; background:#16211e linear-gradient(135deg, rgba(255,255,255,.06), transparent 60%); }
    .vr-video.still i { display:grid; place-items:center; width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,.16); color:#fff; } .vr-video.still svg { width:16px; height:16px; }
    .vr-len { position:absolute; right:10px; bottom:9px; padding:2px 7px; border-radius:6px; background:rgba(0,0,0,.55); color:#fff; font-size:11px; font-weight:600; }
    .vr-tiles { display:grid; grid-template-columns:1fr 1fr; gap:6px; height:100%; padding:8px; }
    .vr-tile { display:grid; place-items:center; align-content:center; gap:4px; border-radius:8px; background:#22302c; color:#cfdad6; }
    .vr-tile .d-avatar { width:34px; height:34px; font-size:12px; box-shadow:none; } .vr-tile small { font-size:10.500px; }
    .vr-tile.on { background:#2c403a; box-shadow:inset 0 0 0 2px var(--a-hi); color:#fff; }
    .vr-now { position:absolute; left:10px; bottom:9px; display:inline-flex; align-items:center; gap:5px; padding:3px 8px; border-radius:7px; background:var(--a-hi); color:var(--a-hi-ink); font-size:11px; font-weight:650; }
    .vr-now svg { width:9px; height:9px; } .vr-now.idle { background:rgba(0,0,0,.5); color:#fff; font-weight:500; }
    .vr-track { position:relative; flex:none; height:6px; margin:6px 5px 2px; border-radius:3px; background:#e2e4de; }
    .vr-track i { position:absolute; inset:0 auto 0 0; border-radius:3px; background:var(--brand); }
    .vr-track button { all:unset; position:absolute; top:50%; width:10px; height:10px; margin:-5px 0 0 -5px; border-radius:50%; background:#fff; box-shadow:0 0 0 2px var(--brand); cursor:pointer; }
    .vr-track button.on { width:14px; height:14px; margin:-7px 0 0 -7px; background:var(--a-hi); box-shadow:0 0 0 2px #0c0c0b; }
    .vr-clock { display:flex; align-items:baseline; gap:5px; color:var(--a-muted); font-size:11.500px; } .vr-clock b { color:var(--a-ink); font-family:var(--a-mono); font-size:13px; }
    .vr-script { display:grid; gap:9px; align-content:start; flex:1; min-height:0; padding-top:4px; overflow:hidden; }
    .vr-said { display:flex; gap:9px; align-items:flex-start; } .vr-said b { font-size:12px; font-weight:600; } .vr-said p { margin-top:1px; color:var(--a-ink2); font-size:13px; line-height:1.4; }
    .vr-said mark { padding:0 2px; border-radius:3px; background:var(--a-hi); color:var(--a-hi-ink); }
    .vr-rec.today { justify-content:flex-start; }
    .vr-cap { color:var(--a-muted); font-size:12px; font-weight:600; }
    .vr-mail { display:grid; gap:7px; font-size:13px; } .vr-mail b { font-size:14px; font-weight:650; } .vr-mail p { color:var(--a-ink2); }
    .vr-mail h3, .vr-plain h3 { margin-top:6px; color:var(--a-muted); font-size:11.500px; font-weight:600; }
    .vr-mail ul, .vr-plain ul { display:grid; gap:3px; margin:0; padding-left:16px; color:var(--a-ink2); }
    .vr-cut { padding:8px 10px; border-radius:9px; background:#f5f5f1; color:var(--a-ink2); font-size:12px; }
    .vr-people, .vr-scopes { display:grid; gap:2px; margin-bottom:10px; }
    .vr-people { grid-template-columns:1fr 1fr; gap:2px 12px; }
    .vr-person, .vr-scope { all:unset; box-sizing:border-box; display:flex; align-items:center; gap:9px; min-height:42px; padding:4px 8px; border-radius:10px; cursor:pointer; }
    .vr-person:hover, .vr-scope:hover { background:#f7f7f4; } .vr-person .d-check, .vr-scope .d-check { min-height:0; }
    .vr-who { display:grid; flex:1; min-width:0; } .vr-who b, .vr-scope b { font-weight:600; font-size:13px; } .vr-who small, .vr-scope small { display:block; color:var(--a-muted); font-size:11.500px; }
    .vr-person:not(.on) .vr-who b { color:var(--a-ink2); font-weight:500; }
    .vr-scope.on { background:var(--brand-soft); }
    .vr-sendrow { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:6px; }
    .vr-inbox .vr-top { background:#f1f1ec; }
    .vr-mailgrid { display:grid; grid-template-columns:270px minmax(0,1fr); flex:1; min-height:0; }
    .vr-mlist { border-right:1px solid var(--a-line2); background:#fafaf7; }
    .vr-mrow { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:1px 8px; padding:11px 14px; border-bottom:1px solid var(--a-line2); }
    .vr-mrow b { font-size:12.500px; font-weight:600; } .vr-mrow span { grid-column:1 / -1; overflow:hidden; color:var(--a-ink2); font-size:12.500px; text-overflow:ellipsis; white-space:nowrap; }
    .vr-mrow small { grid-row:1; grid-column:2; color:var(--a-muted); font-size:11.500px; } .vr-mrow.on { background:#fff; box-shadow:inset 3px 0 0 var(--brand); }
    .p-scroll.vr-open { padding:24px 28px; overflow-y:auto; }
    .vr-ask { display:grid; gap:10px; max-width:470px; margin-top:18px; padding:18px; } .vr-ask > small { color:var(--a-muted); font-size:12px; } .vr-ask > b { font-size:17px; font-weight:650; letter-spacing:-.015em; }
    .vr-plain { display:grid; gap:8px; justify-items:start; max-width:520px; margin-top:16px; font-size:14px; }
    .vr-dlgsaid { display:grid; gap:9px; padding:12px; border-radius:12px; background:#f6f7f4; }
  `,
};
