// hub/lib/pages.mjs
//
// Every page of the handbook, as functions from the build context to
// { path, title, description, body }. scripts/hub-build.mjs wraps each in the
// shell from html.mjs. Content comes from hub/content and skills/; nothing a
// reader sees is written in this file except interface copy.

import { SITE, STAGES, ROLES, repoUrl, repoSlug } from "../site.config.mjs";
import { esc, hl, ICON } from "./html.mjs";
import {
  stage, stageOf, roleTitle, workflowCard, installTabs, subscribe, exampleHref, fmtDate, cmd, thumb,
} from "./partials.mjs";
import * as more from "./pages-more.mjs";

const live = (ctx) => ctx.workflows.filter((w) => w.status !== "planned");
const planned = (ctx) => ctx.workflows.filter((w) => w.status === "planned");

/* ------------------------------------------------------------------ home */

function home(ctx) {
  const u = ctx.url;
  const flows = live(ctx);
  const hero = ctx.workflow(SITE.heroDemo || "flagged-prototype") || flows[0];
  const checks = flows.reduce((n, w) => n + (w.checks?.length || 0), 0);
  const latest = ctx.issues[0];

  const byStage = STAGES.map((s) => ({ ...s, items: flows.filter((w) => w.stage === s.id) })).filter((s) => s.items.length);

  const body = `
  <section class="hero wrap">
    <div class="hero-copy">
      <p class="label rise"><b>Free</b> · ${flows.length} workflows · updated ${esc(fmtDate(ctx.built))}</p>
      <h1 class="hl-draw rise" style="--i:1" data-hl>AI workflows you can <span class="hl">watch</span>, <span class="hl">open</span> and <span class="hl">install</span>.</h1>
      <p class="hero-sub rise" style="--i:2">A free handbook for product, research, data and strategy people. Every workflow is an agent skill with a live demo and a real output you can inspect before you install anything.</p>
      <div class="hero-side rise" style="--i:3">
        <div class="hero-cta">
          <a class="btn" href="${u("/workflows/")}">Browse the workflows ${ICON.arrow}</a>
          <a class="btn ghost" href="${u("/skills/")}">Install the skills</a>
        </div>
        <p class="hero-fine">Works in Claude Code, the Claude app, Cursor, Codex and Gemini CLI.</p>
      </div>
    </div>
    ${hero ? `<div class="hero-stage rise" style="--i:3">${stage(ctx, hero, { hero: true })}
      <p class="stage-caption"><span class="label">Live demo</span> ${esc(hero.title)}. <a class="arrow-link" href="${u(`/workflows/${hero.slug}/`)}">How it works ${ICON.arrow}</a></p>
    </div>` : ""}
  </section>

  <section class="section wrap" aria-labelledby="how-h">
    <div class="how">
      <div class="how-intro">
        <span class="label">How to use this handbook</span>
        <h2 id="how-h">Every workflow comes with three things.</h2>
      </div>
      <ol class="how-steps">
        <li class="rise"><span class="how-n">01</span><h3>Watch it run</h3><p>Each workflow replays a real run, step by step. Scrub it like a video, or let it play.</p></li>
        <li class="rise" style="--i:1"><span class="how-n">02</span><h3>Open the output</h3><p>The finished document is on the page. Click through it and judge the quality before you commit to anything.</p></li>
        <li class="rise" style="--i:2"><span class="how-n">03</span><h3>Install the skill</h3><p>One command adds it to your agent. Point it at your own material and get the same format back.</p></li>
      </ol>
    </div>
  </section>

  <section class="section wrap" id="workflows" aria-labelledby="wf-h">
    <div class="section-head">
      <div>
        <span class="label">The handbook</span>
        <h2 id="wf-h">${flows.length === 6 ? "Six" : flows.length} workflows, in the order work happens.</h2>
      </div>
      <div class="chips filter" data-filter role="group" aria-label="Filter by role">
        <button class="chip solid" type="button" data-role="all" aria-pressed="true">All</button>
        ${ROLES.map((r) => `<button class="chip" type="button" data-role="${r.id}" aria-pressed="false">${esc(r.title)}</button>`).join("")}
      </div>
    </div>
    <div class="spine">
      ${byStage
        .map(
          (s) => `
      <div class="spine-row" data-stage-row>
        <div class="spine-head">
          <span class="spine-n">${s.n}</span>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.blurb)}</p>
        </div>
        <div class="spine-cards">${s.items.map((w, i) => workflowCard(ctx, w, i)).join("")}</div>
      </div>`
        )
        .join("")}
    </div>
    ${planned(ctx).length ? `<p class="next-up"><span class="label">Next up</span> ${planned(ctx).map((w) => esc(w.title)).join(" · ")}</p>` : ""}
  </section>

  <section class="section wrap" aria-labelledby="case-h">
    <div class="case-band">
      <div class="case-copy">
        <span class="label">The running case</span>
        <h2 id="case-h">One case, from the first question to the test result.</h2>
        <p>Every example in this handbook comes from one fictional grocery app, Tangelo. Each workflow picks up the output of the one before, so you can follow a single piece of work all the way through.</p>
        <a class="btn ghost" href="${u("/case/")}">Read the case ${ICON.arrow}</a>
      </div>
      <ol class="case-rail">
        ${flows
          .map(
            (w, i) => `
        <li class="rise" style="--i:${i}">
          <a href="${u(`/workflows/${w.slug}/`)}">
            <span class="case-n">${String(i + 1).padStart(2, "0")}</span>
            <span class="case-t">${esc(w.short || w.title)}</span>
            <span class="case-o">${esc(w.example?.label || "")}</span>
          </a>
        </li>`
          )
          .join("")}
      </ol>
    </div>
  </section>

  <section class="section wrap" aria-labelledby="bar-h">
    <div class="section-head">
      <div>
        <span class="label">The quality bar</span>
        <h2 id="bar-h" class="hl-draw" data-hl><span class="hl">Checked</span>, not just generated.</h2>
        <p>Most AI output gets thrown away because nobody can tell if it is right. So every skill here ends with checks it has to pass, and anything that can be computed is computed by a script, not written by a model.</p>
      </div>
      ${checks ? `<div class="bar-stat"><b>${checks}</b><span>checks across ${flows.length} skills</span></div>` : ""}
    </div>
    <div class="bar-grid">
      <article class="bar-card rise">
        <span class="bar-ico">${ICON.check}</span>
        <h3>Every quote is matched</h3>
        <p>The synthesis skill will not cite a customer quote it cannot find, character for character, in a transcript.</p>
        <a class="arrow-link" href="${u("/workflows/interview-synthesis/")}">Interview synthesis ${ICON.arrow}</a>
      </article>
      <article class="bar-card rise" style="--i:1">
        <span class="bar-ico">${ICON.check}</span>
        <h3>Every number is computed</h3>
        <p>The experiment readout runs a tested script for sample ratio, intervals and power. The model reads the result. It does not do the arithmetic.</p>
        <a class="arrow-link" href="${u("/workflows/experiment-readout/")}">Experiment readout ${ICON.arrow}</a>
      </article>
      <article class="bar-card rise" style="--i:2">
        <span class="bar-ico">${ICON.check}</span>
        <h3>Every change is traceable</h3>
        <p>PRD points, prototype switches and rollout rows share one set of IDs, and a check fails when one goes missing.</p>
        <a class="arrow-link" href="${u("/workflows/decision-prd/")}">Decision-ready PRD ${ICON.arrow}</a>
      </article>
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
  </section>`;

  return { path: "/", title: SITE.name, description: SITE.description, body, priority: "1.0", bodyClass: "home" };
}

/* ------------------------------------------------------ workflows index */

function workflowsIndex(ctx) {
  const u = ctx.url;
  const flows = live(ctx);
  const body = `
  <header class="page-head wrap">
    <span class="label">The handbook</span>
    <h1>Workflows</h1>
    <p>${flows.length} working AI workflows for product people, ordered by the stage of work they belong to. Each has a demo, a worked example and a skill you can install.</p>
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
      <div class="index-stage-head"><span class="spine-n">${s.n}</span><h2>${esc(s.title)}</h2><p>${esc(s.blurb)}</p></div>
      <div class="index-list">
        ${items
          .map(
            (w) => `
        <a class="index-row" href="${u(`/workflows/${w.slug}/`)}" data-roles="${esc((w.roles || []).join(" "))}">
          <div class="index-thumb" aria-hidden="true">${thumb(w.slug)}</div>
          <div class="index-main">
            <h3>${esc(w.title)}</h3>
            <p>${esc(w.promise)}</p>
          </div>
          <dl class="index-meta">
            <div><dt>For</dt><dd>${(w.roles || []).map(roleTitle).map(esc).join(", ")}</dd></div>
            <div><dt>Run</dt><dd>${esc(w.runtime || "")}</dd></div>
            <div><dt>Gives you</dt><dd>${esc(w.gives || "")}</dd></div>
          </dl>
          <span class="index-go" aria-hidden="true">${ICON.arrow}</span>
        </a>`
          )
          .join("")}
        ${soon
          .map(
            (w) => `
        <div class="index-row soon">
          <div class="index-main"><h3>${esc(w.title)}</h3><p>${esc(w.promise)}</p></div>
          <span class="chip">Planned</span>
        </div>`
          )
          .join("")}
      </div>
    </div>`;
    }).join("")}
  </section>
  <section class="section wrap">${subscribe(ctx, { compact: true })}</section>`;

  return {
    path: "/workflows/",
    title: "Workflows",
    description: `${flows.length} working AI workflows for product, research, data and strategy people. Each has a live demo, a worked example and an installable skill.`,
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
  const link = (slug) => {
    const x = ctx.workflow(slug);
    return x ? `<a href="${u(`/workflows/${x.slug}/`)}">${esc(x.short || x.title)}</a>` : esc(slug);
  };
  const prose = (id) => {
    const s = w.sections.find((x) => x.id === id);
    return s ? ctx.md(s.body) : "";
  };

  const toc = [
    ["when", "When to use it"],
    ["io", "What goes in and comes out"],
    ["steps", "How it runs"],
    ["bar", "The quality bar"],
    ["fails", "Where it fails"],
    ["example", "The worked example"],
    ["install", "Install"],
  ];

  const body = `
  <article class="wf">
    <header class="wf-head wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="${u("/workflows/")}">Workflows</a><span>/</span><a href="${u(`/workflows/#${st.id}`)}">${st.n} ${esc(st.title)}</a></nav>
      <h1>${esc(w.title)}</h1>
      <p class="wf-promise">${esc(w.promise)}</p>
      <dl class="wf-facts">
        <div><dt>For</dt><dd>${(w.roles || []).map(roleTitle).map(esc).join(", ")}</dd></div>
        <div><dt>Agent run</dt><dd>${esc(w.runtime || "")}</dd></div>
        <div><dt>Your review</dt><dd>${esc(w.review || "")}</dd></div>
        <div><dt>Needs</dt><dd>${esc(w.needs || "Nothing extra")}</dd></div>
        <div><dt>Version</dt><dd>${esc(w.version || "1.0.0")} · checked ${esc(fmtDate(w.verified || ctx.built))}</dd></div>
      </dl>
    </header>

    <div class="wrap wf-stage">${stage(ctx, w)}
      <div class="stage-under">
        <p><span class="label">What you are watching</span> ${esc(w.demoNote || "A replay of the worked example. When it finishes, the output is yours to click.")}</p>
        <a class="btn sm" href="${u(exampleHref(w))}" target="_blank" rel="noopener">Open the full output ${ICON.arrowUpRight}</a>
      </div>
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
          <p class="wf-lead">The skill does not hand anything over until these pass. The column on the right says who does the checking.</p>
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
            ${(w.failures || []).map((f) => `<div class="fail"><h3>${esc(f.title)}</h3><p>${ctx.mdInline(f.body)}</p><p class="fail-catch"><b>Catch it:</b> ${ctx.mdInline(f.catch || "")}</p></div>`).join("")}
          </div>
        </section>

        <section id="example" class="wf-sec">
          <h2><span class="wf-n">06</span>The worked example</h2>
          <div class="example">
            <a class="example-open" href="${u(exampleHref(w))}" target="_blank" rel="noopener">
              <div class="example-thumb" aria-hidden="true">${thumb(w.slug)}</div>
              <div>
                <span class="label">Output</span>
                <h3>${esc(w.example?.label || "Worked example")}</h3>
                <p>${esc(w.example?.note || "The finished output, exactly as the skill produced it.")}</p>
                <span class="arrow-link">Open it ${ICON.arrowUpRight}</span>
              </div>
            </a>
            ${
              w.run
                ? `<dl class="runlog">
              <div><dt>Run</dt><dd>${esc(fmtDate(w.run.date))}</dd></div>
              <div><dt>How</dt><dd>${esc(w.run.by)}</dd></div>
              <div><dt>Checks</dt><dd>${esc(String(w.run.passed))} of ${esc(String(w.run.total))} passed</dd></div>
              ${w.run.note ? `<div><dt>Note</dt><dd>${ctx.mdInline(w.run.note)}</dd></div>` : ""}
            </dl>`
                : ""
            }
            ${
              (w.example?.inputs || []).length
                ? `<p class="example-inputs"><span class="label">Inputs it started from</span> ${w.example.inputs
                    .map((f) => `<a href="${repoUrl(`${SITE.repo.skillsDir}/${w.skill}/examples/${w.example.case}/${f}`)}" target="_blank" rel="noopener">${esc(f)}</a>`)
                    .join(" · ")}</p>`
                : ""
            }
          </div>
        </section>

        <section id="install" class="wf-sec">
          <h2><span class="wf-n">07</span>Install</h2>
          ${installTabs(ctx, w.skill, "wf-install")}
          ${
            skill
              ? `<details class="skill-src">
            <summary><span>Read the skill before you install it</span><span class="label">${skill.files.length} files · SKILL.md is ${skill.body.split(/\s+/).length} words</span></summary>
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
            ? `<a class="wf-next" href="${u(`/workflows/${next.slug}/`)}"><span class="label">Next in the handbook</span><span class="wf-next-t">${esc(next.title)} ${ICON.arrow}</span><span class="wf-next-p">${esc(next.promise)}</span></a>`
            : `<a class="wf-next" href="${u("/case/")}"><span class="label">You have reached the end</span><span class="wf-next-t">See all six on one case ${ICON.arrow}</span><span class="wf-next-p">How the outputs feed each other, from the first question to the test result.</span></a>`
        }
      </div>

      <aside class="wf-rail">
        <div class="rail-card">
          <span class="label">Run it</span>
          ${cmd(`/${SITE.plugin}:${w.skill}`)}
          <p>Or just ask: <q>${esc(w.ask || "")}</q></p>
          <a class="btn sm" href="#install">Install ${ICON.arrow}</a>
        </div>
        <nav class="rail-toc" aria-label="On this page">
          <span class="label">On this page</span>
          <ol>${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ol>
        </nav>
      </aside>
    </div>
  </article>
  <section class="section wrap">${subscribe(ctx, { compact: true })}</section>`;

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
  };
}

/* ------------------------------------------------------------- registry */

export async function all(ctx) {
  const out = [home(ctx), workflowsIndex(ctx)];
  for (const w of live(ctx)) out.push(workflowPage(ctx, w));
  out.push(...(await more.all(ctx)));
  return out;
}

export async function files(ctx) {
  return more.files(ctx);
}

export { repoSlug };
