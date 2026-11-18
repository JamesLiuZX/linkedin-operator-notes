// hub/lib/partials.mjs : the pieces more than one page uses.

import { SITE, STAGES, ROLES, repoSlug, repoUrl } from "../site.config.mjs";
import { esc, hl, ICON } from "./html.mjs";

export const stageOf = (id) => STAGES.find((s) => s.id === id) || STAGES[0];
export const roleTitle = (id) => ROLES.find((r) => r.id === id)?.title || id;

export const fmtDate = (iso) => {
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? String(iso)
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};

/** Every way to install the pack. One source for the home page, the skills page and each workflow. */
export function installSurfaces(skill) {
  const repo = repoSlug();
  const one = skill ? ` --skill ${skill}` : "";
  return [
    {
      id: "claude-code",
      label: "Claude Code",
      steps: [
        {
          cmd: `/plugin install ${SITE.plugin} --marketplace ${repo}`,
          note: `Installs every skill in the pack. On Claude Code older than 2.1.275, run /plugin marketplace add ${repo} first, then /plugin install ${SITE.plugin}@${SITE.marketplace}.`,
        },
      ],
      after: skill
        ? `Then ask for it in plain words, or type /${SITE.plugin}:${skill}.`
        : "Then ask for a workflow in plain words, or type / and pick one.",
    },
    {
      id: "claude-app",
      label: "Claude app",
      download: skill ? `/skills/${skill}.zip` : null,
      steps: skill ? [] : [{ cmd: repo, note: "Customize, Plugins, Add, Add marketplace, then paste this and add the pack." }],
      after: skill
        ? "Download the zip. In Claude open Customize, Skills, the plus button, Upload a skill. Works on the web, desktop and Cowork."
        : "For a single skill instead, each workflow page has a zip you can upload under Customize, Skills.",
    },
    {
      id: "any-agent",
      label: "Cursor, Codex, Gemini",
      steps: [{ cmd: `npx skills add ${repo}${one}`, note: "Copies the skill folders into the agent you pick. Add -a cursor, -a codex or -a gemini-cli to skip the prompt." }],
      after: "Works with any agent that reads the open SKILL.md format.",
    },
    {
      id: "copy",
      label: "Read it first",
      steps: [],
      link: repoUrl(skill ? `${SITE.repo.skillsDir}/${skill}` : SITE.repo.skillsDir),
      after: "A skill is a folder of plain text. Read every line before you install it, and copy only what you want.",
    },
  ];
}

export function cmd(text, { prompt = "" } = {}) {
  return `<div class="cmd">${prompt ? `<span class="prompt">${esc(prompt)}</span>` : ""}<code>${esc(text)}</code><button class="copy" type="button" data-copy="${esc(text)}">${ICON.copy}<span>Copy</span></button></div>`;
}

export function installTabs(ctx, skill, idPrefix = "install") {
  const surfaces = installSurfaces(skill);
  return `
  <div class="install" data-tabs>
    <div class="tabs" role="tablist" aria-label="Where to install">
      ${surfaces
        .map(
          (s, i) =>
            `<button type="button" role="tab" id="${idPrefix}-tab-${s.id}" aria-controls="${idPrefix}-panel-${s.id}" aria-selected="${i === 0}">${esc(s.label)}</button>`
        )
        .join("")}
    </div>
    ${surfaces
      .map(
        (s, i) => `
    <div class="install-panel" role="tabpanel" id="${idPrefix}-panel-${s.id}" aria-labelledby="${idPrefix}-tab-${s.id}"${i === 0 ? "" : " hidden"}>
      ${s.steps
        .map(
          (st, n) => `
        <div class="install-step">
          ${s.steps.length > 1 ? `<span class="install-n">${n + 1}</span>` : ""}
          <div>${cmd(st.cmd)}<p>${esc(st.note)}</p></div>
        </div>`
        )
        .join("")}
      ${s.download ? `<a class="btn" href="${ctx.url(s.download)}" download>${ICON.download}Download ${esc(skill)}.zip</a>` : ""}
      ${s.link ? `<a class="btn ghost" href="${esc(s.link)}" target="_blank" rel="noopener">${ICON.github}Open the folder on GitHub</a>` : ""}
      <p class="install-after">${esc(s.after)}</p>
    </div>`
      )
      .join("")}
  </div>`;
}

/** The dark viewport a workflow runs in. app.js mounts the demo module named in data-demo. */
export function stage(ctx, w, { autoplay = true, hero = false, layout = "" } = {}) {
  const poster = `/hub/posters/${w.slug}.png`;
  return `
  <div class="stage${hero ? " stage-hero" : ""}" data-stage data-demo="${esc(w.demo || w.slug)}"${autoplay ? " data-autoplay" : ""}${hero ? ` data-start="${Number(w.heroStart ?? 3)}"` : ""}${layout ? ` data-layout="${layout}"` : ""} aria-label="Demo: ${esc(w.title)}">
    <div class="stage-bar">
      <span class="stage-dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="stage-title"><b>${esc(w.skill || w.slug)}</b><span>${esc(w.example?.label || "")}</span></span>
      <span class="stage-chapters" data-stage-chapters></span>
    </div>
    <div class="stage-body" data-stage-body>
      <noscript><a href="${ctx.url(exampleHref(w))}"><img src="${ctx.url(poster)}" alt="The output of ${esc(w.title)}" loading="lazy"></a></noscript>
    </div>
    <div class="stage-ctl" data-stage-ctl hidden>
      <button type="button" class="stage-btn" data-stage-toggle aria-label="Pause">${ICON.pause}</button>
      <div class="stage-scrub" data-stage-scrub role="slider" tabindex="0" aria-label="Demo position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i data-stage-fill></i></div>
      <span class="stage-time" data-stage-time></span>
      <button type="button" class="stage-btn" data-stage-replay aria-label="Replay">${ICON.replay}</button>
    </div>
  </div>`;
}

export const exampleHref = (w) => (w.example ? `/examples/${w.example.case}/${w.example.file}` : "#");

export function workflowCard(ctx, w, i = 0) {
  const st = stageOf(w.stage);
  return `
  <a class="wf-card rise" style="--i:${i}" href="${ctx.url(`/workflows/${w.slug}/`)}" data-roles="${esc((w.roles || []).join(" "))}">
    <div class="wf-thumb" data-thumb="${esc(w.slug)}" aria-hidden="true">${thumb(w.slug)}</div>
    <div class="wf-copy">
      <div class="wf-meta"><span class="label">${st.n} ${esc(st.title)}</span><span class="label">${esc(w.runtime || "")} run</span></div>
      <h3>${esc(w.title)}</h3>
      <p>${esc(w.promise)}</p>
      <div class="chips">${(w.roles || []).map((r) => `<span class="chip">${esc(roleTitle(r))}</span>`).join("")}</div>
    </div>
  </a>`;
}

/**
 * A small drawing of each workflow's output, used on cards. Pure SVG in the
 * site's own vocabulary, so the grid reads as one family and loads instantly.
 */
export function thumb(slug) {
  const frame = (inner) =>
    `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  const P = "var(--thumb-paper)";
  const L = "var(--thumb-line)";
  const I = "var(--thumb-ink)";
  const H = "var(--hi)";
  switch (slug) {
    case "journey-teardown": {
      let cells = "";
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 5; c++) {
          const x = 46 + c * 52;
          const y = 26 + r * 52;
          const own = r === 2;
          cells += `<rect x="${x}" y="${y}" width="26" height="42" rx="4" fill="${own ? "var(--thumb-own)" : P}" stroke="${L}"/>`;
          if ((r * 5 + c) % 3 === 0) cells += `<rect x="${x + 30}" y="${y + 4}" width="16" height="9" rx="2" fill="${H}"/>`;
          if ((r * 5 + c) % 4 === 1) cells += `<rect x="${x + 30}" y="${y + 17}" width="16" height="9" rx="2" fill="var(--thumb-bad)"/>`;
        }
      return frame(`<rect x="16" y="26" width="22" height="146" rx="4" fill="${L}"/>${cells}`);
    }
    case "interview-synthesis":
      return frame(`
        <rect x="24" y="28" width="118" height="144" rx="8" fill="${P}" stroke="${L}"/>
        ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="36" y="${44 + i * 17}" width="${[88, 70, 94, 60, 82, 74, 50][i]}" height="5" rx="2.5" fill="${i === 2 || i === 5 ? H : L}"/>`).join("")}
        <path d="M142 81 C170 81 162 62 190 62" fill="none" stroke="${I}" stroke-width="1.2" stroke-dasharray="3 3"/>
        <path d="M142 132 C170 132 162 124 190 124" fill="none" stroke="${I}" stroke-width="1.2" stroke-dasharray="3 3"/>
        <rect x="190" y="40" width="106" height="46" rx="8" fill="${P}" stroke="${L}"/>
        <rect x="202" y="52" width="60" height="6" rx="3" fill="${I}"/><rect x="202" y="66" width="34" height="9" rx="4.5" fill="${H}"/>
        <rect x="190" y="102" width="106" height="46" rx="8" fill="${P}" stroke="${L}"/>
        <rect x="202" y="114" width="72" height="6" rx="3" fill="${I}"/><rect x="202" y="128" width="34" height="9" rx="4.5" fill="${H}"/>`);
    case "premortem": {
      let dots = "";
      [[86, 62, 9, 1], [130, 96, 6, 0], [184, 70, 12, 1], [218, 128, 7, 0], [108, 138, 5, 0], [246, 54, 8, 1]].forEach(([x, y, r, hot]) => {
        dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${hot ? H : P}" stroke="${hot ? "none" : I}" stroke-width="1.2"/>`;
      });
      return frame(`
        <rect x="48" y="26" width="232" height="140" rx="8" fill="${P}" stroke="${L}"/>
        <path d="M164 26v140M48 96h232" stroke="${L}"/>
        <rect x="164" y="26" width="116" height="70" fill="var(--thumb-hot)" opacity=".55"/>
        ${dots}
        <path d="M36 160V34M36 34l-4 7M36 34l4 7M54 178h220M274 178l-7-4M274 178l-7 4" fill="none" stroke="${I}" stroke-width="1.2"/>`);
    }
    case "decision-prd":
      return frame(`
        <rect x="64" y="16" width="192" height="184" rx="10" fill="${P}" stroke="${L}"/>
        <rect x="80" y="32" width="96" height="9" rx="4.5" fill="${I}"/>
        ${[0, 1, 2].map((i) => `
          <rect x="80" y="${58 + i * 46}" width="160" height="36" rx="7" fill="none" stroke="${L}"/>
          <rect x="88" y="${66 + i * 46}" width="24" height="12" rx="4" fill="${H}"/>
          <rect x="120" y="${68 + i * 46}" width="${[84, 66, 96][i]}" height="5" rx="2.5" fill="${I}"/>
          <rect x="120" y="${79 + i * 46}" width="${[104, 110, 72][i]}" height="4" rx="2" fill="${L}"/>`).join("")}`);
    case "flagged-prototype":
      return frame(`
        <rect x="52" y="14" width="96" height="190" rx="18" fill="${I}"/>
        <rect x="58" y="20" width="84" height="178" rx="13" fill="${P}"/>
        <rect x="68" y="36" width="44" height="7" rx="3.5" fill="${I}"/>
        <rect x="68" y="54" width="64" height="34" rx="7" fill="${H}"/>
        <rect x="68" y="96" width="64" height="20" rx="6" fill="none" stroke="${L}"/>
        <rect x="68" y="122" width="64" height="20" rx="6" fill="none" stroke="${L}"/>
        <circle cx="134" cy="54" r="8" fill="${I}"/><text x="134" y="57" font-size="8" font-family="monospace" text-anchor="middle" fill="${H}">1.1</text>
        ${[0, 1, 2].map((i) => `
          <rect x="176" y="${48 + i * 38}" width="96" height="26" rx="8" fill="${P}" stroke="${L}"/>
          <rect x="186" y="${58 + i * 38}" width="40" height="5" rx="2.5" fill="${I}"/>
          <rect x="238" y="${54 + i * 38}" width="26" height="14" rx="7" fill="${i === 1 ? L : I}"/>
          <circle cx="${i === 1 ? 245 : 257}" cy="${61 + i * 38}" r="5" fill="${i === 1 ? P : H}"/>`).join("")}`);
    case "experiment-readout":
      return frame(`
        <rect x="28" y="26" width="264" height="148" rx="10" fill="${P}" stroke="${L}"/>
        <path d="M60 60v88M60 148h204" stroke="${L}"/>
        <path d="M160 52v104" stroke="${I}" stroke-width="1.2" stroke-dasharray="3 3"/>
        <rect x="176" y="78" width="74" height="10" rx="5" fill="${H}"/><circle cx="212" cy="83" r="6" fill="${I}"/>
        <rect x="138" y="106" width="58" height="10" rx="5" fill="${L}"/><circle cx="168" cy="111" r="6" fill="${I}"/>
        <rect x="118" y="134" width="36" height="10" rx="5" fill="var(--thumb-bad)"/><circle cx="136" cy="139" r="6" fill="${I}"/>
        <rect x="44" y="36" width="54" height="12" rx="6" fill="${I}"/>`);
    default:
      return frame(`<rect x="40" y="30" width="240" height="140" rx="10" fill="${P}" stroke="${L}"/>`);
  }
}

export function subscribe(ctx, { compact = false } = {}) {
  const w = SITE.weekly;
  const form = w.formAction
    ? `<form class="sub-form" action="${esc(w.formAction)}" method="post" target="_blank">
         <label class="sr" for="sub-email">Email address</label>
         <input id="sub-email" type="email" name="${esc(w.formEmailField)}" placeholder="you@work.com" autocomplete="email" required>
         <button class="btn hi" type="submit">Subscribe</button>
       </form>
       <p class="sub-fine">One email a week. Unsubscribe in one click.</p>`
    : w.subscribeUrl
      ? `<a class="btn hi" href="${esc(w.subscribeUrl)}" target="_blank" rel="noopener">Subscribe by email</a>`
      : `<div class="sub-alt">
           <a class="btn hi" href="${ctx.url("/feed.xml")}">${ICON.rss}Follow the feed</a>
           <a class="btn ghost" href="${esc(SITE.author.linkedin)}" target="_blank" rel="noopener">${ICON.linkedin}Follow on LinkedIn</a>
         </div>
         <p class="sub-fine">Email delivery opens soon. Until then each issue is published here, in the feed and on LinkedIn.</p>`;
  return `
  <section class="sub${compact ? " compact" : ""}" id="subscribe" aria-labelledby="sub-h">
    <div class="sub-copy">
      <span class="label">${esc(w.name)}</span>
      <h2 id="sub-h">${hl("One working workflow, *every Tuesday*.")}</h2>
      <p>${esc(w.promise)}</p>
    </div>
    <div class="sub-action">${form}</div>
  </section>`;
}

export { esc, hl, ICON };
