// hub/lib/pages-more.mjs : skills, the case, the weekly, guides, about, and the machine-readable files.

import { SITE, STAGES, repoUrl, repoSlug } from "../site.config.mjs";
import { esc, hl, ICON } from "./html.mjs";
import { stageOf, roleTitle, installTabs, installSurfaces, subscribe, exampleHref, fmtDate, thumb, stage } from "./partials.mjs";
import { emailHtml, issueText } from "./email.mjs";

const live = (ctx) => ctx.workflows.filter((w) => w.status !== "planned");

/* ---------------------------------------------------------------- skills */

function skillsPage(ctx) {
  const u = ctx.url;
  const flows = live(ctx);
  const body = `
  <header class="page-head wrap">
    <span class="label">The pack</span>
    <h1>Install the skills</h1>
    <p>${flows.length} agent skills, one per workflow. A skill is a small folder of plain text: instructions, an output template, a checker script where numbers matter, and one worked example. It is free, MIT licensed, and you can read every line before you install it.</p>
  </header>

  <section class="wrap skills-install">
    ${installTabs(ctx, null, "skills-install")}
  </section>

  <section class="section wrap" aria-labelledby="pack-h">
    <div class="section-head"><div><span class="label">What is in it</span><h2 id="pack-h">${flows.length} skills, one format.</h2></div></div>
    <div class="pack">
      ${flows
        .map((w) => {
          const s = ctx.skill(w.skill);
          const st = stageOf(w.stage);
          return `
      <div class="pack-row">
        <div class="pack-name"><code>${esc(w.skill)}</code><span class="label">${st.n} ${esc(st.title)}</span></div>
        <div class="pack-what"><a href="${u(`/workflows/${w.slug}/`)}">${esc(w.title)}</a><p>${esc(w.gives || w.promise)}</p></div>
        <div class="pack-meta"><span class="label">v${esc(w.version || "1.0.0")}</span><span class="label">${(w.checks || []).length} checks</span>${s ? `<span class="label">${s.files.length} files</span>` : ""}</div>
        <div class="pack-go">
          <a class="btn sm ghost" href="${u(`/skills/${w.skill}.zip`)}" download>${ICON.download}Zip</a>
          <a class="icon-btn" href="${repoUrl(`${SITE.repo.skillsDir}/${w.skill}`)}" target="_blank" rel="noopener" aria-label="${esc(w.skill)} on GitHub">${ICON.github}</a>
        </div>
      </div>`;
        })
        .join("")}
    </div>
  </section>

  <section class="section wrap" aria-labelledby="anat-h">
    <div class="section-head"><div><span class="label">How a skill is built</span><h2 id="anat-h">Five parts, the same in every skill.</h2><p>A long prompt is not what makes output good. A strict template, rules about when to refuse, and a script for anything that has a right answer do most of the work. So that is what each folder holds.</p></div></div>
    <div class="anat">
      <div class="anat-tree" aria-hidden="true"><pre>${esc(`decision-prd/
├── SKILL.md            the procedure, under 200 lines
├── assets/
│   └── template.html   the output format
├── references/
│   ├── format.md       the data the template expects
│   └── quality-bar.md  the checks, in words
├── scripts/
│   └── check.py        the checks, in code
└── examples/
    └── tangelo/        inputs and the finished output`)}</pre></div>
      <ol class="anat-list">
        <li><b>The procedure.</b> Short and specific. It says what to ask for, what order to work in and when to stop and refuse.</li>
        <li><b>The template.</b> The output is data poured into a fixed layout, so every run looks the same and reads the same.</li>
        <li><b>The checks, in words.</b> What a good output has, written so you can disagree with it.</li>
        <li><b>The checks, in code.</b> Where there is a right answer, such as a quote that must exist or a sample ratio, a script decides.</li>
        <li><b>One worked example.</b> Real inputs and the finished output, produced by a fresh run. It is the demo you see on this site.</li>
      </ol>
    </div>
  </section>

  <section class="section wrap" aria-labelledby="trust-h">
    <div class="section-head"><div><span class="label">Before you install anything</span><h2 id="trust-h">What these skills can and cannot do.</h2></div></div>
    <div class="trust">
      <div><h3>They are plain text</h3><p>Every file is readable in the repository. Scripts are short Python with no third-party packages and no network calls.</p></div>
      <div><h3>They ask before they assume</h3><p>If an input is missing, the skill asks for it. If a check fails, it says so in the output and does not paper over it.</p></div>
      <div><h3>They do not replace your judgment</h3><p>Each workflow page lists how it fails. Plan to spend the review time it states. That is where the value is.</p></div>
      <div><h3>They work without this site</h3><p>Nothing calls home. Fork the repository, change the templates to your house style, and keep going.</p></div>
    </div>
  </section>

  <section class="section wrap">${subscribe(ctx, { compact: true })}</section>`;

  return {
    path: "/skills/",
    title: "Install the skills",
    description: `${flows.length} free agent skills for product work. Install in Claude Code, the Claude app, Cursor, Codex or Gemini CLI in about a minute.`,
    body,
    active: "/skills/",
    priority: "0.9",
  };
}

/* ------------------------------------------------------------------ case */

function casePage(ctx) {
  const u = ctx.url;
  const flows = live(ctx);
  const c = ctx.caseFile || {};
  const body = `
  <header class="page-head wrap">
    <span class="label">The running case</span>
    <h1>${esc(c.title || "Tangelo: making the weekly shop a two-minute job")}</h1>
    <p>${esc(c.intro || "")}</p>
    <p class="case-note"><span class="chip">Fictional</span> Tangelo, its competitors, its customers and every number on this page are made up so the method can be shown in full.</p>
  </header>
  <section class="wrap case-steps">
    ${flows
      .map((w, i) => {
        const st = stageOf(w.stage);
        const step = (c.steps || []).find((s) => s.workflow === w.slug) || {};
        return `
    <article class="case-step rise">
      <div class="case-step-n"><span>${String(i + 1).padStart(2, "0")}</span><i></i></div>
      <div class="case-step-body">
        <span class="label">${st.n} ${esc(st.title)} · ${esc(w.short || w.title)}</span>
        <h2>${esc(step.question || w.title)}</h2>
        <p>${esc(step.found || "")}</p>
        ${step.changed ? `<p class="case-changed"><b>What it changed next:</b> ${esc(step.changed)}</p>` : ""}
        <div class="case-links">
          <a class="btn sm" href="${u(exampleHref(w))}" target="_blank" rel="noopener">Open the ${esc(w.outputName || "output")} ${ICON.arrowUpRight}</a>
          <a class="arrow-link" href="${u(`/workflows/${w.slug}/`)}">How the workflow works ${ICON.arrow}</a>
        </div>
      </div>
      <a class="case-step-thumb" href="${u(exampleHref(w))}" target="_blank" rel="noopener" aria-hidden="true" tabindex="-1">${thumb(w.slug)}</a>
    </article>`;
      })
      .join("")}
  </section>
  <section class="section wrap">${subscribe(ctx, { compact: true })}</section>`;
  return {
    path: "/case/",
    title: "The running case",
    description: "One fictional grocery app, followed through six AI workflows: from a competitor teardown to an experiment readout. Every output is open to read.",
    body,
    active: "/case/",
    priority: "0.8",
  };
}

/* ---------------------------------------------------------------- weekly */

export function issueTeaser(ctx, issue) {
  const u = ctx.url;
  const w = ctx.workflow(issue.workflow?.slug);
  return `
  <a class="issue-teaser rise" href="${u(`/weekly/${issue.slug}/`)}">
    <div>
      <span class="label">${esc(SITE.weekly.name)} · issue ${esc(String(issue.n))} · ${esc(fmtDate(issue.date))}</span>
      <h3>${esc(issue.title)}</h3>
      <p>${esc(issue.hook)}</p>
    </div>
    <ul>
      ${w ? `<li><span class="label">The workflow</span>${esc(w.short || w.title)}</li>` : ""}
      ${(issue.things || []).slice(0, 3).map((t) => `<li><span class="label">This week</span>${esc(t.title)}</li>`).join("")}
    </ul>
    <span class="arrow-link">Read the issue ${ICON.arrow}</span>
  </a>`;
}

function weeklyIndex(ctx) {
  const u = ctx.url;
  const body = `
  <header class="page-head wrap">
    <span class="label">${esc(SITE.weekly.name)}</span>
    <h1>The weekly</h1>
    <p>${esc(SITE.weekly.promise)}</p>
  </header>
  <section class="wrap">${subscribe(ctx)}</section>
  <section class="section wrap" aria-labelledby="arch-h">
    <div class="section-head"><div><span class="label">Archive</span><h2 id="arch-h">Every issue</h2></div><a class="arrow-link" href="${u("/feed.xml")}">${ICON.rss} RSS</a></div>
    <div class="issues">
      ${
        ctx.issues.length
          ? ctx.issues
              .map(
                (i) => `
      <a class="issue-row" href="${u(`/weekly/${i.slug}/`)}">
        <span class="label">No. ${esc(String(i.n))}</span>
        <span class="issue-row-t">${esc(i.title)}</span>
        <span class="label">${esc(fmtDate(i.date))}</span>
        <span class="index-go" aria-hidden="true">${ICON.arrow}</span>
      </a>`
              )
              .join("")
          : `<p class="empty">The first issue goes out on Tuesday.</p>`
      }
    </div>
  </section>
  <section class="section wrap" aria-labelledby="fmt-h">
    <div class="section-head"><div><span class="label">What is in each issue</span><h2 id="fmt-h">The same six parts, every week.</h2></div></div>
    <ol class="fmt">
      <li><span class="label">01</span><b>The workflow</b><p>One workflow, what it is for, the steps, and a line you can paste to run it.</p></li>
      <li><span class="label">02</span><b>Try it</b><p>The live demo and the finished output, one click away.</p></li>
      <li><span class="label">03</span><b>Three things</b><p>What changed in AI this week that matters to people who ship products. Each with its source and its catch.</p></li>
      <li><span class="label">04</span><b>One tip</b><p>A small habit that makes agent output easier to trust.</p></li>
      <li><span class="label">05</span><b>One number</b><p>A single sourced figure worth knowing.</p></li>
      <li><span class="label">06</span><b>Changelog</b><p>What changed in the skills since last week.</p></li>
    </ol>
  </section>`;
  return {
    path: "/weekly/",
    title: SITE.weekly.name,
    description: SITE.weekly.promise,
    body,
    active: "/weekly/",
    priority: "0.8",
  };
}

function issuePage(ctx, issue) {
  const u = ctx.url;
  const w = ctx.workflow(issue.workflow?.slug);
  const at = ctx.issues.indexOf(issue);
  const newer = ctx.issues[at - 1];
  const older = ctx.issues[at + 1];
  const src = (s) => (s?.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label || "Source")}</a>` : "");
  const body = `
  <article class="issue wrap">
    <header class="issue-head">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="${u("/weekly/")}">${esc(SITE.weekly.name)}</a><span>/</span><span>Issue ${esc(String(issue.n))}</span></nav>
      <h1>${esc(issue.title)}</h1>
      <p class="issue-meta"><span class="label">${esc(fmtDate(issue.date))} · ${esc(String(issue.minutes || 4))} minute read</span></p>
      <p class="issue-hook">${esc(issue.hook)}</p>
    </header>

    ${
      w
        ? `<section class="issue-sec">
      <h2><span class="label">01</span>The workflow</h2>
      <h3>${esc(w.title)}</h3>
      <p>${esc(issue.workflow.why || w.promise)}</p>
      <ol>${(issue.workflow.steps || []).map((s) => `<li>${ctx.mdInline(s)}</li>`).join("")}</ol>
      ${issue.workflow.prompt ? `<div class="cmd"><code>${esc(issue.workflow.prompt)}</code><button class="copy" type="button" data-copy="${esc(issue.workflow.prompt)}">${ICON.copy}<span>Copy</span></button></div>` : ""}
      ${issue.workflow.matters ? `<p><b>Why it matters:</b> ${esc(issue.workflow.matters)}</p>` : ""}
    </section>
    <section class="issue-sec">
      <h2><span class="label">02</span>Try it</h2>
      <a class="issue-demo" href="${u(`/workflows/${w.slug}/`)}">
        <div class="issue-demo-thumb" aria-hidden="true">${thumb(w.slug)}</div>
        <div><b>Watch the run and open the output</b><p>${esc(issue.demo?.line || "The demo plays in the page. No install, no sign-up.")}</p><span class="arrow-link">Open the demo ${ICON.arrow}</span></div>
      </a>
    </section>`
        : ""
    }

    ${
      (issue.things || []).length
        ? `<section class="issue-sec">
      <h2><span class="label">03</span>Three things that matter this week</h2>
      ${issue.things
        .map(
          (t) => `
      <div class="thing">
        <h3>${esc(t.title)}</h3>
        <p><b>What happened:</b> ${esc(t.what)}</p>
        <p><b>Why it matters:</b> ${esc(t.why)}</p>
        ${t.catch ? `<p><b>The catch:</b> ${esc(t.catch)}</p>` : ""}
        <p class="thing-src">${src(t.source)}</p>
      </div>`
        )
        .join("")}
    </section>`
        : ""
    }

    ${issue.tip ? `<section class="issue-sec"><h2><span class="label">04</span>One tip</h2><h3>${esc(issue.tip.title)}</h3><p>${esc(issue.tip.body)}</p></section>` : ""}

    ${
      issue.number
        ? `<section class="issue-sec issue-number"><h2><span class="label">05</span>One number</h2><p class="num"><b>${esc(issue.number.value)}</b><span>${esc(issue.number.label)}</span></p><p class="thing-src">${src(issue.number.source)}</p></section>`
        : ""
    }

    ${
      (issue.changelog || []).length
        ? `<section class="issue-sec"><h2><span class="label">06</span>Changelog</h2><ul class="issue-log">${issue.changelog
            .map((c) => `<li><code>${esc(c.skill)}</code> <span class="label">${esc(c.version || "")}</span> ${esc(c.note)}</li>`)
            .join("")}</ul></section>`
        : ""
    }

    <nav class="issue-more">
      ${newer ? `<a href="${u(`/weekly/${newer.slug}/`)}">${ICON.arrow} Newer</a>` : "<span></span>"}
      <a href="${u("/weekly/")}">Every issue</a>
      ${older ? `<a href="${u(`/weekly/${older.slug}/`)}">Older ${ICON.arrow}</a>` : "<span></span>"}
    </nav>
  </article>
  <section class="section wrap">${subscribe(ctx, { compact: true })}</section>`;
  return {
    path: `/weekly/${issue.slug}/`,
    title: `${issue.title} · issue ${issue.n}`,
    description: issue.hook,
    body,
    active: "/weekly/",
    type: "article",
    lastmod: issue.date,
    priority: "0.6",
  };
}

/* ------------------------------------------------------- guides + about */

function guidePage(ctx, g) {
  const u = ctx.url;
  const others = ctx.guides.filter((x) => x.slug !== g.slug);
  const html = ctx
    .md(g.body)
    .replaceAll("{{repo}}", repoSlug())
    .replaceAll("{{plugin}}", SITE.plugin)
    .replaceAll("{{marketplace}}", SITE.marketplace)
    .replace(/href="\/(?!\/)/g, `href="${u("/")}`);
  const body = `
  <article class="guide wrap">
    <header class="page-head">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="${u("/guides/start/")}">Guides</a><span>/</span><span>${esc(g.title)}</span></nav>
      <h1>${esc(g.title)}</h1>
      <p>${esc(g.summary || "")}</p>
      <p class="label">${esc(g.minutes || 3)} minute read · checked ${esc(fmtDate(g.verified || ctx.built))}</p>
    </header>
    <div class="prose">${html}</div>
    <nav class="guide-more">
      <span class="label">More guides</span>
      ${others.map((x) => `<a class="arrow-link" href="${u(`/guides/${x.slug}/`)}">${esc(x.title)} ${ICON.arrow}</a>`).join("")}
      <a class="arrow-link" href="${u("/workflows/")}">All workflows ${ICON.arrow}</a>
    </nav>
  </article>`;
  return {
    path: `/guides/${g.slug}/`,
    title: g.title,
    description: g.summary,
    body,
    type: "article",
    lastmod: g.verified,
    priority: "0.6",
  };
}

function aboutPage(ctx) {
  const u = ctx.url;
  const a = SITE.author;
  const body = `
  <article class="about wrap">
    <header class="page-head">
      <span class="label">About</span>
      <h1>Why this exists</h1>
      <p>Most writing about AI at work is a list of prompts. You cannot tell from a prompt whether the result is any good. This handbook shows the result first.</p>
    </header>
    <div class="about-grid">
      <div class="prose">
        <h2>What it is</h2>
        <p>The ${esc(SITE.name)} is a free, growing set of AI workflows for people who build products: product managers first, and the researchers, analysts and strategy people who work beside them.</p>
        <p>Each workflow is three things at once. It is a page that explains when to use it and how it fails. It is a demo that replays a real run. And it is a skill, a small folder of plain text you can install into an AI agent so it does the same job on your material.</p>
        <h2>The rules it is built on</h2>
        <ol>
          <li><b>Show the output.</b> Every workflow has a finished example you can open. If the output is not worth opening, the workflow is not worth publishing.</li>
          <li><b>Check, then hand over.</b> Each skill ends with checks. Anything with a right answer is checked by a script.</li>
          <li><b>Say how it fails.</b> Every page lists the ways the workflow goes wrong and how to catch them.</li>
          <li><b>Few and finished.</b> A small number of workflows done properly beats a long list of prompts.</li>
          <li><b>Free and readable.</b> No sign-up, no paywall, MIT licence. Read every line before you run it.</li>
        </ol>
        <h2>How the examples are made</h2>
        <p>The examples follow one fictional company, <a href="${u("/case/")}">Tangelo</a>, so the outputs connect. Each output was produced by a fresh agent session that was given only the skill and the input files, then run through the skill's own checks. The date and the result of that run are on each workflow page.</p>
        <h2>Who makes it</h2>
        <p>${esc(a.name)} is a product owner who works with AI agents every working day. The formats here are the ones he uses: a teardown laid out by journey stage, a PRD where every point is numbered and tied to evidence, a prototype where each point can be switched on and off. Nothing on this site comes from an employer, past or present.</p>
        <p><a class="arrow-link" href="${esc(a.linkedin)}" target="_blank" rel="noopener">${ICON.linkedin} Follow on LinkedIn</a></p>
        <h2>Tell me what is wrong</h2>
        <p>If a workflow gave you a bad result, that is the most useful thing you can tell me. <a href="${repoUrl()}/issues" target="_blank" rel="noopener">Open an issue</a> with what you gave it and what came back.</p>
      </div>
      <aside class="about-side">
        <div class="rail-card">
          <span class="label">In numbers</span>
          <dl class="about-nums">
            <div><dt>${live(ctx).length}</dt><dd>workflows</dd></div>
            <div><dt>${live(ctx).reduce((n, w) => n + (w.checks?.length || 0), 0)}</dt><dd>checks</dd></div>
            <div><dt>${ctx.issues.length}</dt><dd>issues</dd></div>
          </dl>
        </div>
        <div class="rail-card">
          <span class="label">Start here</span>
          <a class="arrow-link" href="${u("/guides/start/")}">Set up in ten minutes ${ICON.arrow}</a>
          <a class="arrow-link" href="${u("/workflows/")}">Browse the workflows ${ICON.arrow}</a>
          <a class="arrow-link" href="${u("/case/")}">Read the case ${ICON.arrow}</a>
        </div>
      </aside>
    </div>
  </article>
  <section class="section wrap">${subscribe(ctx, { compact: true })}</section>`;
  return {
    path: "/about/",
    title: "About",
    description: "Why the AI Workflow Handbook exists, the rules it is built on, and who makes it.",
    body,
    active: "/about/",
    priority: "0.5",
  };
}

function changelogPage(ctx) {
  const u = ctx.url;
  const rows = [];
  for (const w of live(ctx)) for (const c of w.changelog || []) rows.push({ ...c, w });
  for (const c of ctx.siteLog || []) rows.push({ ...c, w: null });
  rows.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const body = `
  <article class="wrap">
    <header class="page-head">
      <span class="label">Changelog</span>
      <h1>What changed, and when</h1>
      <p>Every change to a skill or a workflow page. Skills use version numbers so you can tell whether your copy is current.</p>
    </header>
    <div class="log">
      ${rows
        .map(
          (r) => `
      <div class="log-row">
        <span class="label">${esc(fmtDate(r.date))}</span>
        <div>${r.w ? `<a href="${u(`/workflows/${r.w.slug}/`)}"><code>${esc(r.w.skill)}</code></a> <span class="label">v${esc(r.version)}</span>` : `<b>Handbook</b>`}<p>${ctx.mdInline(r.note)}</p></div>
      </div>`
        )
        .join("")}
    </div>
  </article>`;
  return { path: "/changelog/", title: "Changelog", description: "Every change to the skills and workflow pages.", body, priority: "0.4" };
}

/** A bare page holding one stage, sized for rendering clips and carousels. Not indexed. */
function clipPage(ctx, w) {
  const body = `
  <div class="clip" data-clip>
    <header class="clip-head">
      <span class="label">${esc(SITE.name)}</span>
      <h1>${hl(w.clipTitle || w.title)}</h1>
    </header>
    ${stage(ctx, w, { autoplay: false, layout: "strip" })}
    <footer class="clip-foot">
      <span>${esc(w.clipLine || w.promise)}</span>
      <b>${esc(SITE.clipUrl || SITE.defaultOrigin.replace(/^https?:\/\//, ""))}</b>
    </footer>
  </div>`;
  return { path: `/clip/${w.slug}/`, title: w.title, description: w.promise, body, noindex: true, bodyClass: "clip-page" };
}

/* ---------------------------------------------------------------- output */

export async function all(ctx) {
  ctx.caseFile = ctx.exists("hub/content/case.json") ? JSON.parse(await ctx.read("hub/content/case.json")) : {};
  ctx.siteLog = ctx.exists("hub/content/changelog.json") ? JSON.parse(await ctx.read("hub/content/changelog.json")) : [];
  const out = [skillsPage(ctx), casePage(ctx), weeklyIndex(ctx), aboutPage(ctx), changelogPage(ctx)];
  for (const i of ctx.issues) out.push(issuePage(ctx, i));
  for (const g of ctx.guides) out.push(guidePage(ctx, g));
  for (const w of live(ctx)) out.push(clipPage(ctx, w));
  return out;
}

/** A markdown twin of a workflow page, for agents and for people who prefer text. */
function workflowMd(ctx, w) {
  const st = stageOf(w.stage);
  const surfaces = installSurfaces(w.skill);
  const list = (xs, f) => (xs || []).map(f).join("\n");
  return `# ${w.title}

${w.promise}

- Stage: ${st.n} ${st.title}
- For: ${(w.roles || []).map(roleTitle).join(", ")}
- Agent run: ${w.runtime || ""} · Your review: ${w.review || ""}
- Version: ${w.version || "1.0.0"} · Checked: ${w.verified || ctx.built}
- Page: ${ctx.abs(`/workflows/${w.slug}/`)}
- Skill source: ${repoUrl(`${SITE.repo.skillsDir}/${w.skill}`)}
- Worked example: ${ctx.abs(exampleHref(w))}

## Use it when
${list(w.when, (x) => `- ${x}`)}

## Skip it when
${list(w.skip, (x) => `- ${x}`)}

## You give it
${list(w.inputs, (x) => `- ${x.name}: ${x.note || ""}`)}

## You get
${list(w.outputs, (x) => `- ${x.name}: ${x.note || ""}`)}

## How it runs
${list(w.steps, (s, i) => `${i + 1}. ${s.title}. ${s.body}`)}

## The quality bar
${list(w.checks, (c) => `- ${c.name} (${c.how}): ${c.note || ""}`)}

## Where it fails
${list(w.failures, (f) => `- ${f.title}. ${f.body} Catch it: ${f.catch || ""}`)}

## Install
${surfaces
  .filter((s) => s.steps.length)
  .map((s) => `${s.label}:\n${s.steps.map((x) => `    ${x.cmd}`).join("\n")}`)
  .join("\n\n")}
`;
}

export async function files(ctx) {
  const flows = live(ctx);
  const out = [];

  for (const w of flows) out.push({ path: `/workflows/${w.slug}.md`, contents: workflowMd(ctx, w) });

  out.push({
    path: "/llms.txt",
    contents: `# ${SITE.name}

> ${SITE.description}

Each workflow below has a page for people, a markdown twin for agents, and an installable skill in the open SKILL.md format.

## Workflows
${flows.map((w) => `- [${w.title}](${ctx.abs(`/workflows/${w.slug}.md`)}): ${w.promise}`).join("\n")}

## Install
- Claude Code: \`/plugin marketplace add ${repoSlug()}\` then \`/plugin install ${SITE.plugin}@${SITE.marketplace}\`
- Other agents: \`npx skills add ${repoSlug()}\`
- Source: ${repoUrl(SITE.repo.skillsDir)}

## More
- [The running case](${ctx.abs("/case/")}): one fictional company followed through every workflow.
- [${SITE.weekly.name}](${ctx.abs("/weekly/")}): the weekly issue. Feed: ${ctx.abs("/feed.xml")}
`,
  });

  const search = [
    ...flows.map((w) => ({ t: w.title, p: `/workflows/${w.slug}/`, k: "Workflow", d: w.promise, x: [w.skill, ...(w.roles || []), stageOf(w.stage).title].join(" ") })),
    ...ctx.guides.map((g) => ({ t: g.title, p: `/guides/${g.slug}/`, k: "Guide", d: g.summary || "" })),
    ...ctx.issues.map((i) => ({ t: i.title, p: `/weekly/${i.slug}/`, k: `Issue ${i.n}`, d: i.hook || "" })),
    { t: "Install the skills", p: "/skills/", k: "Page", d: "Every way to install the pack." },
    { t: "The running case", p: "/case/", k: "Page", d: "One fictional company, six workflows." },
    { t: SITE.weekly.name, p: "/weekly/", k: "Page", d: SITE.weekly.promise },
    { t: "About", p: "/about/", k: "Page", d: "Why this exists and who makes it." },
    { t: "Changelog", p: "/changelog/", k: "Page", d: "What changed, and when." },
  ];
  out.push({ path: "/hub/search.json", contents: JSON.stringify(search) });

  const items = ctx.issues
    .map(
      (i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${ctx.abs(`/weekly/${i.slug}/`)}</link>
      <guid isPermaLink="true">${ctx.abs(`/weekly/${i.slug}/`)}</guid>
      <pubDate>${new Date(`${i.date}T01:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(i.hook || "")}</description>
      <content:encoded><![CDATA[${emailHtml(ctx, i, { fragment: true })}]]></content:encoded>
    </item>`
    )
    .join("\n");
  out.push({
    path: "/feed.xml",
    contents: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.weekly.name)} · ${esc(SITE.name)}</title>
    <link>${ctx.abs("/weekly/")}</link>
    <atom:link href="${ctx.abs("/feed.xml")}" rel="self" type="application/rss+xml"/>
    <description>${esc(SITE.weekly.promise)}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`,
  });

  for (const i of ctx.issues) {
    out.push({ path: `/weekly/${i.slug}/email.html`, contents: emailHtml(ctx, i) });
    out.push({ path: `/weekly/${i.slug}/email.txt`, contents: issueText(ctx, i) });
  }
  return out;
}
