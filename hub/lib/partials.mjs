// hub/lib/partials.mjs : the pieces more than one page uses.

import { SITE, STAGES, ROLES, CASES, repoSlug, repoUrl } from "../site.config.mjs";
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

export const caseOf = (id) => CASES.find((c) => c.id === id) || CASES[0];

/** The example a workflow has for a case, or its first one. */
export const exampleOf = (w, caseId) => (w.cases || []).find((c) => c.id === caseId) || (w.cases || [])[0] || null;

export const exampleHref = (w, caseId) => {
  const c = exampleOf(w, caseId);
  return c ? `/examples/${c.id}/${c.file}` : "#";
};

/** The picture of a finished output, rendered by scripts/hub-media.mjs. */
export const artSrc = (w, caseId) => {
  const c = exampleOf(w, caseId);
  return `/hub/art/${c ? c.id : "tangelo"}/${w.slug}.webp`;
};

/**
 * The white window a workflow runs in. app.js mounts the demo named in
 * data-demo with the example named in data-case, and swaps both when a
 * reader picks another case or another workflow.
 */
export function stage(ctx, w, { autoplay = true, caseId = "", start = null, layout = "", id = "" } = {}) {
  const c = exampleOf(w, caseId);
  return `
  <div class="stage"${id ? ` id="${esc(id)}"` : ""} data-stage data-wf="${esc(w.slug)}" data-demo="${esc(w.demo || w.slug)}" data-case="${esc(c?.id || "")}"${autoplay ? " data-autoplay" : ""}${start != null ? ` data-start="${Number(start)}"` : ""}${layout ? ` data-layout="${layout}"` : ""} aria-label="Demo: ${esc(w.title)}">
    <div class="stage-top">
      <span class="stage-id"><i></i><b data-stage-skill>${esc(w.skill || w.slug)}</b></span>
      <span class="stage-case" data-stage-label>${esc(c?.label || "")}</span>
      <span class="stage-end">
        <span class="stage-live" data-stage-hint>Yours to try</span>
        <a class="stage-open" data-stage-open href="${ctx.url(exampleHref(w, c?.id))}" target="_blank" rel="noopener"><span>Open the output</span>${ICON.arrowUpRight}</a>
      </span>
    </div>
    <div class="stage-body" data-stage-body>
      <noscript><a href="${ctx.url(exampleHref(w, c?.id))}"><img src="${ctx.url(artSrc(w, c?.id))}" alt="The output of ${esc(w.title)}" loading="lazy"></a></noscript>
    </div>
    <div class="stage-ctl" data-stage-ctl hidden>
      <button type="button" class="stage-btn" data-stage-toggle aria-label="Pause">${ICON.pause}</button>
      <span class="stage-now" data-stage-now></span>
      <div class="stage-scrub" data-stage-scrub role="slider" tabindex="0" aria-label="Demo position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
      <span class="stage-time" data-stage-time></span>
      <button type="button" class="stage-btn quiet" data-stage-replay aria-label="Replay">${ICON.replay}</button>
    </div>
  </div>`;
}

/** The three cases as a tab control. app.js keeps every control on the page in step. */
export function caseTabs(ctx, { label = "Pick the case closest to your work", small = false } = {}) {
  return `
  <div class="cases${small ? " sm" : ""}" data-cases role="group" aria-label="${esc(label)}">
    ${ctx.cases
      .map((c, i) => `<button type="button" data-case="${esc(c.id)}" aria-pressed="${i === 0}"><b>${esc(c.domain)}</b><span>${esc(c.company)}, ${esc(c.what)}</span></button>`)
      .join("")}
  </div>`;
}

/**
 * What the page's scripts need to know about the workflows and their
 * examples: enough to swap a stage to another case without a page load.
 */
export function clientData(ctx) {
  const workflows = {};
  for (const w of ctx.workflows.filter((x) => x.status !== "planned")) {
    workflows[w.slug] = {
      title: w.title,
      short: w.short || w.title,
      skill: w.skill,
      demo: w.demo || w.slug,
      cases: Object.fromEntries(
        (w.cases || []).map((c) => [c.id, { label: c.label, ask: c.ask || "", href: ctx.url(exampleHref(w, c.id)) }])
      ),
    };
  }
  const json = JSON.stringify({ workflows, cases: ctx.cases.map((c) => ({ id: c.id, domain: c.domain, company: c.company })) }).replaceAll("<", "\\u003c");
  return `<script type="application/json" id="hub-data">${json}</script>`;
}

/** A sheet of real output, tipped back: the picture on tiles and example cards. */
export function sheet(ctx, w, caseId, { alt = "", eager = false } = {}) {
  return `<span class="sheet"><img src="${ctx.url(artSrc(w, caseId))}" alt="${esc(alt)}" width="1200" height="900" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></span>`;
}

/** One workflow as a block of its own colour. */
export function tile(ctx, w, i = 0, { wide = false } = {}) {
  const st = stageOf(w.stage);
  const scripted = (w.checks || []).filter((c) => c.how === "script").length;
  return `
  <a class="tile${wide ? " wide" : ""} rise" style="--i:${i % 3}" data-wf="${esc(w.slug)}" href="${ctx.url(`/workflows/${w.slug}/`)}" data-roles="${esc((w.roles || []).join(" "))}">
    <span class="tile-copy">
      <span class="tile-n">${String(w.order || i + 1).padStart(2, "0")}<small>${esc(st.title)}</small></span>
      <span class="tile-t">${esc(w.title)}</span>
      <span class="tile-p">${esc(w.promise)}</span>
      <span class="tile-meta"><span>${esc(w.runtime || "")} run</span><span>${scripted} scripted ${scripted === 1 ? "check" : "checks"}</span><span>${(w.cases || []).length} worked ${(w.cases || []).length === 1 ? "example" : "examples"}</span></span>
    </span>
    <span class="tile-art" aria-hidden="true">${sheet(ctx, w)}</span>
    <span class="tile-go" aria-hidden="true">${ICON.arrow}</span>
  </a>`;
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

/** Kept so older templates build. New templates use sheet(). */
export const thumb = () => "";

export { esc, hl, ICON };
