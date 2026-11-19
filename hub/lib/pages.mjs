// hub/lib/pages.mjs
//
// Every page of the handbook, as functions from the build context to
// { path, title, description, body }. scripts/hub-build.mjs wraps each in the
// shell from html.mjs. Content comes from hub/content and skills/; nothing a
// reader sees is written in this file except interface copy.

import { SITE, STAGES, ROLES, repoUrl, repoSlug } from "../site.config.mjs";
import { esc, ICON } from "./html.mjs";
import {
  stage, stageOf, roleTitle, tile, sheet, caseTabs, clientData, installTabs, subscribe, exampleHref, exampleOf, fmtDate, cmd,
} from "./partials.mjs";
import { catches } from "./catches.mjs";
import * as more from "./pages-more.mjs";
import * as casePages from "./pages-cases.mjs";

const live = (ctx) => ctx.workflows.filter((w) => w.status !== "planned");
const planned = (ctx) => ctx.workflows.filter((w) => w.status === "planned");
const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
const word = (n) => WORDS[n] || String(n);
const nn = (n) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ home */

function home(ctx) {
  const u = ctx.url;
  const flows = live(ctx);
  const first = ctx.workflow(SITE.heroDemo || "flagged-prototype") || flows[0];
  const outputs = flows.reduce((n, w) => n + (w.cases || []).length, 0);
  const scripted = flows.reduce((n, w) => n + (w.checks || []).filter((c) => c.how === "script").length, 0);
  const latest = ctx.issues[0];
  const caught = catches(ctx, ctx.root);

  const body = `
  <section class="hero wrap">
    <p class="hero-kicker rise"><i></i>Free. ${word(flows.length)} skills, ${word(ctx.cases.length).toLowerCase()} worked cases, ${outputs} finished outputs you can open.</p>
    <h1 class="hero-h rise" style="--i:1">AI workflows that <span class="hl-draw" data-hl><span class="hl">show their work.</span></span></h1>
    <div class="hero-row rise" style="--i:2">
      <p class="hero-sub">${word(flows.length)} agent skills for product, research, data and strategy people. Each one runs in front of you, hands you the finished output to open, and has to pass its own checks before it calls the job done.</p>
      <div class="hero-side">
        <div class="hero-cta">
          <a class="btn" href="${u("/skills/")}">Install the skills ${ICON.arrow}</a>
          <a class="btn ghost" href="#workflows">See all ${word(flows.length).toLowerCase()}</a>
        </div>
        <p class="hero-fine">Works in Claude Code, the Claude app, Cursor, Codex and Gemini CLI.</p>
      </div>
    </div>
  </section>

  <section class="wrap xp-wrap rise" style="--i:3" aria-label="Watch a workflow run">
    <div class="xp" data-xp data-wf="${esc(first.slug)}">
      <div class="xp-top">
        ${caseTabs(ctx)}
        <div class="xp-q">
          ${ctx.cases.map((c, i) => `<p data-case-panel="${esc(c.id)}"${i ? " hidden" : ""}><b>The question</b> ${esc(c.question)}</p>`).join("")}
        </div>
      </div>
      <nav class="xp-nav" aria-label="Pick a workflow">
        ${flows
          .map(
            (w, i) =>
              `<button type="button" data-xp-wf="${esc(w.slug)}" aria-pressed="${w.slug === first.slug}"><i>${nn(i + 1)}</i><span>${esc(w.tab || w.short || w.title)}</span></button>`
          )
          .join("")}
      </nav>
      <div class="xp-stage">${stage(ctx, first, { id: "xp-stage", start: 2.6 })}</div>
      <div class="xp-foot">
        ${flows
          .map(
            (w) => `
        <div class="xp-about" data-xp-about="${esc(w.slug)}"${w.slug === first.slug ? "" : " hidden"}>
          <p>${esc(w.promise)}</p>
          <a class="xp-link" href="${u(`/workflows/${w.slug}/`)}">How it works ${ICON.arrow}</a>
        </div>`
          )
          .join("")}
      </div>
    </div>
  </section>

  <section class="section wrap" id="workflows" aria-labelledby="wf-h">
    <div class="section-head">
      <div>
        <span class="label">The handbook</span>
        <h2 id="wf-h">${word(flows.length)} workflows, in the order work happens.</h2>
        <p>Each one picks up the output of the one before. Start anywhere.</p>
      </div>
      <div class="chips filter" data-filter role="group" aria-label="Filter by role">
        <button class="chip solid" type="button" data-role="all" aria-pressed="true">All</button>
        ${ROLES.map((r) => `<button class="chip" type="button" data-role="${r.id}" aria-pressed="false">${esc(r.title)}</button>`).join("")}
      </div>
    </div>
    <div class="tiles">
      ${flows.map((w, i) => tile(ctx, w, i, { wide: i % 4 === 0 || i % 4 === 3 })).join("")}
    </div>
    ${planned(ctx).length ? `<p class="next-up"><span class="label">Next up</span> ${planned(ctx).map((w) => esc(w.title)).join(" · ")}</p>` : ""}
  </section>

  ${
    caught
      ? `<section class="section band" aria-labelledby="bar-h">
    <div class="wrap">
      <div class="section-head">
        <div>
          <span class="label">The quality bar</span>
          <h2 id="bar-h" class="hl-draw" data-hl><span class="hl">Checked</span>, not just generated.</h2>
          <p>Most AI output gets thrown away because nobody can tell if it is right. So every skill here ends with checks it has to pass, and anything that can be computed is computed by a script. These three are from the test runs on this site.</p>
        </div>
        <div class="bar-stat"><b>${scripted}</b><span>checks run by a script, across ${word(flows.length).toLowerCase()} skills</span></div>
      </div>
      <div class="catches">${caught}</div>
    </div>
  </section>`
      : ""
  }

  <section class="section wrap" aria-labelledby="case-h">
    <div class="section-head">
      <div>
        <span class="label">Worked cases</span>
        <h2 id="case-h">${word(ctx.cases.length)} cases, each run from the first question to the test result.</h2>
        <p>Pick the one closest to your work. Every company, person and number in them is invented, and every output is the real thing a skill produced.</p>
      </div>
    </div>
    <div class="casecards">
      ${ctx.cases
        .map(
          (c, i) => `
      <a class="casecard rise" style="--i:${i}" href="${u(`/cases/${c.id}/`)}">
        <span class="casecard-d">${esc(c.domain)}</span>
        <h3>${esc(c.title)}</h3>
        <p class="casecard-q">${esc(c.question)}</p>
        <span class="casecard-path" aria-hidden="true">${flows.map((w, k) => `<i data-wf="${esc(w.slug)}">${k + 1}</i>`).join("")}</span>
        <p class="casecard-o"><b>How it ended</b>${esc(c.outcome)}</p>
        <span class="arrow-link">Read the ${esc(c.company)} case ${ICON.arrow}</span>
      </a>`
        )
        .join("")}
    </div>
  </section>

  <section class="section wrap" aria-labelledby="inst-h">
    <div class="install-band">
      <div class="install-copy">
        <span class="label">Install</span>
        <h2 id="inst-h">The whole pack, in about a minute.</h2>
        <p>The skills are plain text in a public repository. Read them first if you like. Nothing phones home, and nothing needs an account here.</p>
        <a class="arrow-link" href="${u("/skills/")}">Everything about the pack ${ICON.arrow}</a>
      </div>
      ${installTabs(ctx, null, "home-install")}
    </div>
  </section>

  <section class="section wrap">
    ${latest ? more.issueTeaser(ctx, latest) : ""}
    ${subscribe(ctx)}
  </section>
  ${clientData(ctx)}`;

  return { path: "/", title: SITE.name, description: SITE.description, body, priority: "1.0", bodyClass: "home" };
}

/* ------------------------------------------------------ workflows index */

function workflowsIndex(ctx) {
  const flows = live(ctx);
  const body = `
  <header class="page-head wrap">
    <span class="label">The handbook</span>
    <h1>${word(flows.length)} workflows.</h1>
    <p>Working AI workflows for product people, in the order work happens. Each has a demo you can scrub, worked examples from three cases and a skill you can install.</p>
    <div class="chips filter" data-filter role="group" aria-label="Filter by role">
      <button class="chip solid" type="button" data-role="all" aria-pressed="true">All roles</button>
      ${ROLES.map((r) => `<button class="chip" type="button" data-role="${r.id}" aria-pressed="false">${esc(r.title)}</button>`).join("")}
    </div>
  </header>
  <section class="wrap index">
    ${STAGES.map((s) => {
      const items = flows.filter((w) => w.stage === s.id);
      const soon = planned(ctx).filter((w) => w.stage === s.id);
      if (!items.length && !soon.length) return "";
      return `
    <div class="index-stage" id="${s.id}" data-stage-row>
      <div class="index-stage-head"><span class="index-n">${s.n}</span><h2>${esc(s.title)}</h2><p>${esc(s.blurb)}</p></div>
      <div class="tiles">
        ${items.map((w, i) => tile(ctx, w, flows.indexOf(w), { wide: items.length === 1 || i % 2 === 0 })).join("")}
        ${soon.map((w) => `<div class="tile soon"><span class="tile-copy"><span class="tile-n">Planned</span><span class="tile-t">${esc(w.title)}</span><span class="tile-p">${esc(w.promise)}</span></span></div>`).join("")}
      </div>
    </div>`;
    }).join("")}
  </section>
  <section class="section wrap">${subscribe(ctx, { compact: true })}</section>`;

  return {
    path: "/workflows/",
    title: "Workflows",
    description: `${flows.length} working AI workflows for product, research, data and strategy people. Each has a live demo, worked examples and an installable skill.`,
    body,
    active: "/workflows/",
    priority: "0.9",
  };
}

/* -------------------------------------------------------- workflow page */

const HOW_LABEL = { script: "Script", rule: "Rule", review: "Your review" };

function workflowPage(ctx, w) {
  const u = ctx.url;
  const st = stageOf(w.stage);
  const flows = live(ctx);
  const at = flows.findIndex((x) => x.slug === w.slug);
  const next = flows[at + 1] || null;
  const skill = ctx.skill(w.skill);
  const first = exampleOf(w);
  const link = (slug) => {
    const x = ctx.workflow(slug);
    return x ? `<a href="${u(`/workflows/${x.slug}/`)}">${esc(x.short || x.title)}</a>` : esc(slug);
  };
  const prose = (id) => {
    const s = w.sections.find((x) => x.id === id);
    return s ? ctx.md(s.body) : "";
  };
  const domain = (id) => ctx.cases.find((c) => c.id === id);

  const toc = [
    ["when", "When to use it"],
    ["io", "What goes in and comes out"],
    ["steps", "How it runs"],
    ["bar", "The quality bar"],
    ["fails", "Where it fails"],
    ["example", "The worked examples"],
    ["install", "Install"],
  ];

  const exampleCard = (c) => {
    const d = domain(c.id);
    const run = c.run;
    return `
          <article class="ex" data-case-panel="${esc(c.id)}"${c.id === first?.id ? "" : " hidden"}>
            <a class="ex-art" href="${u(exampleHref(w, c.id))}" target="_blank" rel="noopener" aria-label="Open the output">${sheet(ctx, w, c.id)}</a>
            <div class="ex-copy">
              <span class="label">${esc(d?.domain || "")} · ${esc(d?.company || "")}</span>
              <h3>${esc(c.label || "Worked example")}</h3>
              <p>${esc(c.note || "The finished output, exactly as the skill produced it.")}</p>
              <a class="btn sm" href="${u(exampleHref(w, c.id))}" target="_blank" rel="noopener">Open the output ${ICON.arrowUpRight}</a>
              ${
                run
                  ? `<dl class="runlog">
                <div><dt>${c.kind === "reference" ? "Checked" : "Test run"}</dt><dd>${esc(fmtDate(run.date))}</dd></div>
                <div><dt>How</dt><dd>${esc(run.by)}</dd></div>
                <div><dt>Checks</dt><dd>${esc(String(run.passed))} of ${esc(String(run.total))} passed</dd></div>
                ${run.note ? `<div><dt>Note</dt><dd>${ctx.mdInline(run.note)}</dd></div>` : ""}
                ${run.log ? `<div><dt>Record</dt><dd><a href="${repoUrl(`${SITE.repo.skillsDir}/${w.skill}/${run.log}`)}" target="_blank" rel="noopener">The run notes</a></dd></div>` : ""}
              </dl>`
                  : ""
              }
              ${
                (c.inputs || []).length
                  ? `<p class="ex-inputs"><span class="label">It started from</span> ${c.inputs
                      .map((f) => `<a href="${repoUrl(`${SITE.repo.skillsDir}/${w.skill}/examples/${c.id}/${f}`)}" target="_blank" rel="noopener">${esc(f)}</a>`)
                      .join(" · ")}</p>`
                  : ""
              }
            </div>
          </article>`;
  };

  const body = `
  <article class="wf" data-wf="${esc(w.slug)}">
    <header class="wf-hero">
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="${u("/workflows/")}">Workflows</a><span>/</span><a href="${u(`/workflows/#${st.id}`)}">${st.n} ${esc(st.title)}</a></nav>
        <div class="wf-hero-grid">
          <div>
            <span class="wf-num" aria-hidden="true">${nn(at + 1)}</span>
            <h1>${esc(w.title)}</h1>
            <p class="wf-promise">${esc(w.promise)}</p>
            <div class="wf-cta">
              <a class="btn on-c" href="#install">Install this skill ${ICON.arrow}</a>
              <a class="btn on-c ghost" href="#example">See it on ${word((w.cases || []).length).toLowerCase()} ${(w.cases || []).length === 1 ? "case" : "cases"}</a>
            </div>
          </div>
          <dl class="wf-facts">
            <div><dt>For</dt><dd>${(w.roles || []).map(roleTitle).map(esc).join(", ")}</dd></div>
            <div><dt>Agent run</dt><dd>${esc(w.runtime || "")}</dd></div>
            <div><dt>Your review</dt><dd>${esc(w.review || "")}</dd></div>
            <div><dt>Needs</dt><dd>${esc(w.needs || "Nothing extra")}</dd></div>
            <div><dt>Version</dt><dd>${esc(w.version || "1.0.0")}, checked ${esc(fmtDate(w.verified || ctx.built))}</dd></div>
          </dl>
        </div>
      </div>
    </header>

    <div class="wrap wf-stage">
      <div class="wf-stage-head">
        ${(w.cases || []).length > 1 ? caseTabs(ctx) : ""}
        <div class="wf-watch">
          ${(w.cases || [])
            .map((c) => `<p data-case-panel="${esc(c.id)}"${c.id === first?.id ? "" : " hidden"}><b>What you are watching</b> ${esc(c.demoNote || "A replay of the worked example. When it finishes, the output is yours to click.")}</p>`)
            .join("")}
        </div>
      </div>
      ${stage(ctx, w)}
    </div>

    <div class="wrap wf-body">
      <div class="wf-main">
        <section id="when" class="wf-sec">
          <h2><span class="wf-n">01</span>When to use it</h2>
          ${prose("why") ? `<div class="prose">${prose("why")}</div>` : ""}
          <div class="when-grid">
            <div class="when use"><h3>Use it when</h3><ul>${(w.when || []).map((x) => `<li>${ctx.mdInline(x)}</li>`).join("")}</ul></div>
            <div class="when skip"><h3>Skip it when</h3><ul>${(w.skip || []).map((x) => `<li>${ctx.mdInline(x)}</li>`).join("")}</ul></div>
          </div>
        </section>

        <section id="io" class="wf-sec">
          <h2><span class="wf-n">02</span>What goes in and comes out</h2>
          <div class="io">
            <div class="io-col">
              <h3>You give it</h3>
              <ul>${(w.inputs || []).map((x) => `<li><b>${esc(x.name)}</b><span>${ctx.mdInline(x.note || "")}</span></li>`).join("")}</ul>
            </div>
            <div class="io-arrow" aria-hidden="true">${ICON.arrow}</div>
            <div class="io-col out">
              <h3>You get</h3>
              <ul>${(w.outputs || []).map((x) => `<li><b>${esc(x.name)}</b><span>${ctx.mdInline(x.note || "")}</span></li>`).join("")}</ul>
            </div>
          </div>
          ${
            w.chain?.before?.length || w.chain?.after?.length
              ? `<p class="chain">${w.chain?.before?.length ? `Takes the output of ${w.chain.before.map(link).join(" and ")}. ` : ""}${w.chain?.after?.length ? `Feeds ${w.chain.after.map(link).join(" and ")}.` : ""}</p>`
              : ""
          }
        </section>

        <section id="steps" class="wf-sec">
          <h2><span class="wf-n">03</span>How it runs</h2>
          <ol class="steps">
            ${(w.steps || []).map((s, i) => `<li><span class="step-n">${i + 1}</span><div><h3>${esc(s.title)}</h3><p>${ctx.mdInline(s.body)}</p></div></li>`).join("")}
          </ol>
        </section>

        <section id="bar" class="wf-sec">
          <h2><span class="wf-n">04</span>The quality bar</h2>
          <p class="wf-lead">The skill does not hand anything over until these pass. The tag on the right says who does the checking.</p>
          <div class="checks">
            ${(w.checks || [])
              .map(
                (c) => `
            <div class="check">
              <span class="check-ico">${ICON.check}</span>
              <div><b>${esc(c.name)}</b><p>${ctx.mdInline(c.note || "")}</p></div>
              <span class="chip ${c.how === "script" ? "hi" : ""}">${esc(HOW_LABEL[c.how] || c.how)}</span>
            </div>`
              )
              .join("")}
          </div>
        </section>

        <section id="fails" class="wf-sec">
          <h2><span class="wf-n">05</span>Where it fails</h2>
          <p class="wf-lead">No workflow is safe to run blind. These are the ways this one goes wrong, and how to catch each.</p>
          <div class="fails">
            ${(w.failures || []).map((f) => `<div class="fail"><h3>${esc(f.title)}</h3><p>${ctx.mdInline(f.body)}</p><p class="fail-catch"><b>Catch it</b>${ctx.mdInline(f.catch || "")}</p></div>`).join("")}
          </div>
        </section>

        <section id="example" class="wf-sec">
          <h2><span class="wf-n">06</span>The worked examples</h2>
          <p class="wf-lead">The same skill, run on ${word((w.cases || []).length).toLowerCase()} different ${(w.cases || []).length === 1 ? "case" : "cases"}. Each output is on this site, unedited, with the record of the run that made it.</p>
          ${(w.cases || []).length > 1 ? caseTabs(ctx, { small: true }) : ""}
          <div class="exs">${(w.cases || []).map(exampleCard).join("")}</div>
        </section>

        <section id="install" class="wf-sec">
          <h2><span class="wf-n">07</span>Install</h2>
          ${installTabs(ctx, w.skill, "wf-install")}
          ${
            skill
              ? `<details class="skill-src">
            <summary><span>Read the skill before you install it</span><span class="skill-src-n">${skill.files.length} files. SKILL.md is ${skill.body.split(/\s+/).length} words.</span></summary>
            <div class="skill-files"><ul>${skill.files.map((f) => `<li><a href="${repoUrl(`${SITE.repo.skillsDir}/${skill.name}`)}/${esc(f.path)}" target="_blank" rel="noopener">${esc(f.path)}</a></li>`).join("")}</ul></div>
            <pre class="skill-md"><code>${esc(skill.raw)}</code></pre>
          </details>`
              : ""
          }
        </section>

        ${
          (w.changelog || []).length
            ? `<section class="wf-sec wf-changelog"><h2><span class="wf-n">08</span>Changelog</h2><ul>${w.changelog
                .map((c) => `<li><span class="label">${esc(c.version)} · ${esc(fmtDate(c.date))}</span><span>${ctx.mdInline(c.note)}</span></li>`)
                .join("")}</ul></section>`
            : ""
        }

        ${
          next
            ? `<a class="wf-next" data-wf="${esc(next.slug)}" href="${u(`/workflows/${next.slug}/`)}"><span class="wf-next-l">Next in the handbook</span><span class="wf-next-t">${esc(next.title)} ${ICON.arrow}</span><span class="wf-next-p">${esc(next.promise)}</span></a>`
            : `<a class="wf-next" href="${u("/cases/")}"><span class="wf-next-l">You have reached the end</span><span class="wf-next-t">See all ${word(flows.length).toLowerCase()} on one case ${ICON.arrow}</span><span class="wf-next-p">How the outputs feed each other, from the first question to the test result.</span></a>`
        }
      </div>

      <aside class="wf-rail">
        <div class="rail-card">
          <span class="label">Run it</span>
          ${cmd(`/${SITE.plugin}:${w.skill}`)}
          ${(w.cases || []).map((c) => `<p data-case-panel="${esc(c.id)}"${c.id === first?.id ? "" : " hidden"}>Or just ask: <q>${esc(c.ask || "")}</q></p>`).join("")}
          <a class="btn sm" href="#install">Install ${ICON.arrow}</a>
        </div>
        <nav class="rail-toc" aria-label="On this page">
          <span class="label">On this page</span>
          <ol>${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ol>
        </nav>
      </aside>
    </div>
  </article>
  <section class="section wrap">${subscribe(ctx, { compact: true })}</section>
  ${clientData(ctx)}`;

  return {
    path: `/workflows/${w.slug}/`,
    title: w.title,
    description: w.promise,
    body,
    active: "/workflows/",
    type: "article",
    ogImage: `/hub/og/${w.slug}.png`,
    lastmod: w.verified,
    priority: "0.9",
    wf: w.slug,
  };
}

/* ------------------------------------------------------------- registry */

export async function all(ctx) {
  const out = [home(ctx), workflowsIndex(ctx)];
  for (const w of live(ctx)) out.push(workflowPage(ctx, w));
  out.push(...(await casePages.all(ctx)));
  out.push(...(await more.all(ctx)));
  return out;
}

export async function files(ctx) {
  return more.files(ctx);
}

export { repoSlug };
