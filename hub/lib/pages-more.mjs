// hub/lib/pages-more.mjs : skills, the weekly, guides, about, the changelog, and the machine-readable files.

import { SITE, repoUrl, repoSlug } from "../site.config.mjs";
import { esc, hl, ICON, MARK } from "./html.mjs";
import { stageOf, roleTitle, installTabs, installSurfaces, subscribe, exampleHref, exampleOf, fmtDate, sheet, cmd, stage } from "./partials.mjs";
import { emailHtml, issueText } from "./email.mjs";

const live = (ctx) => ctx.workflows.filter((w) => w.status !== "planned");
const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
const word = (n) => WORDS[n] || String(n);
const nn = (n) => String(n).padStart(2, "0");
const count = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const listAnd = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const scripted = (w) => (w.checks || []).filter((c) => c.how === "script").length;
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/&[a-z#0-9]+;/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* ---------------------------------------------------------------- skills */

/** What a skill folder holds, read from the folder itself. */
function skillFacts(ctx, w) {
  const s = ctx.skill(w.skill);
  // Compiled Python is not part of a skill, even when a local test run leaves some behind.
  const paths = s ? s.files.map((f) => f.path).filter((p) => !p.includes("__pycache__")) : [];
  const checker = paths.find((p) => /^scripts\/(check|verify)[^/]*\.(py|mjs|js)$/.test(p)) || "";
  return { files: paths.length, checker: checker.split("/").pop(), scripted: scripted(w) };
}

/** One skill as a folder in its workflow's colour, with a page of its real output sticking out. */
function folder(ctx, w, i) {
  const u = ctx.url;
  const st = stageOf(w.stage);
  const f = skillFacts(ctx, w);
  return `
      <article class="folder rise" style="--i:${i % 3}" id="skill-${esc(w.skill)}" data-wf="${esc(w.slug)}">
        <span class="folder-tab"><code>${esc(w.skill)}</code></span>
        ${exampleOf(w) ? `<a class="folder-page" href="${u(exampleHref(w))}" target="_blank" rel="noopener" aria-label="Open the finished ${esc(w.outputName || "output")}">${sheet(ctx, w)}</a>` : ""}
        <div class="folder-front">
          <p class="folder-n"><b>${nn(w.order || i + 1)}</b><span>${esc(st.title)}</span><code>v${esc(w.version || "1.0.0")}</code></p>
          <h3><a href="${u(`/workflows/${w.slug}/`)}">${esc(w.short || w.title)}</a></h3>
          <p class="folder-p">${esc(w.gives || w.promise)}</p>
          <ul class="folder-meta">
            <li>${count(f.scripted, "scripted check")}</li>
            ${f.files ? `<li>${count(f.files, "file")}</li>` : ""}
            ${f.checker ? `<li><code>${esc(f.checker)}</code></li>` : ""}
          </ul>
          <div class="folder-go">
            <a class="btn sm on-c" href="${u(`/skills/${w.skill}.zip`)}" download aria-label="Download ${esc(w.skill)}.zip">${ICON.download}Zip</a>
            <a class="folder-gh" href="${repoUrl(`${SITE.repo.skillsDir}/${w.skill}`)}" target="_blank" rel="noopener" aria-label="${esc(w.skill)} on GitHub">${ICON.github}</a>
            <a class="folder-how" href="${u(`/workflows/${w.slug}/`)}">How it works ${ICON.arrow}</a>
          </div>
        </div>
      </article>`;
}

/** One skill folder, opened. The numbers tie each file to the part it plays. */
const ANATOMY = [
  [1, "", "SKILL.md", "the procedure, under 200 lines"],
  [2, "assets/", "template.html", "the output format"],
  [2, "references/", "format.md", "the data the template expects"],
  [3, "references/", "quality-bar.md", "the checks, in words"],
  [4, "scripts/", "check.py", "the checks, in code"],
  [5, "examples/", "tangelo/", "inputs and the finished output"],
];

const PARTS = [
  ["The procedure", "Short and specific. It says what to ask for, what order to work in and when to stop and refuse."],
  ["The template", "The output is data poured into a fixed layout, so every run looks the same and reads the same."],
  ["The checks, in words", "What a good output has, written so you can disagree with it."],
  ["The checks, in code", "Where there is a right answer, such as a quote that must exist or a sample ratio, a script decides."],
  ["One worked example", "Real inputs and the finished output, produced by a fresh run. It is the demo you see on this site."],
];

const TRUST = [
  ["They are plain text", "Every file is readable in the repository. The scripts are short Python, and JavaScript for the prototype, with no third-party packages and no network calls."],
  ["They ask before they assume", "If an input is missing, the skill asks for it. If a check fails, it says so in the output and does not paper over it."],
  ["They do not replace your judgment", "Each workflow page lists how it fails. Plan to spend the review time it states. That is where the value is."],
  ["They work without this site", "Nothing calls home. Fork the repository, change the templates to your house style, and keep going."],
];

function skillsPage(ctx) {
  const flows = live(ctx);
  const n = word(flows.length);
  const body = `
  <header class="sk-hero wrap">
    <span class="label">The pack</span>
    <h1 class="hl-draw" data-hl><span>Install the skills</span> <span><span class="hl">in about a minute.</span></span></h1>
    <div class="sk-hero-row">
      <div class="sk-hero-copy">
        <p class="sk-lede">${n} agent skills, one per workflow. A skill is a small folder of plain text: instructions, an output template, a checker script where numbers matter, and one worked example. It is free, MIT licensed, and you can read every line before you install it.</p>
        <div class="sk-jump">
          <span class="label">Jump to a skill</span>
          <ul>
            ${flows.map((w, i) => `<li><a data-wf="${esc(w.slug)}" href="#skill-${esc(w.skill)}" title="${esc(w.short || w.title)}"><span class="sr">${esc(w.short || w.title)}</span><span aria-hidden="true">${i + 1}</span></a></li>`).join("")}
          </ul>
        </div>
      </div>
      <div class="sk-installer">
        <span class="label">The whole pack</span>
        ${installTabs(ctx, null, "skills-install")}
      </div>
    </div>
  </header>

  <section class="section wrap" aria-labelledby="pack-h">
    <div class="section-head"><div><span class="label">What is in it</span><h2 id="pack-h">${n} skills, one format.</h2><p>Each folder holds the same five parts. The page sticking out of it is a real output: click it to open. The zip adds one skill on its own.</p></div></div>
    <div class="shelf">
      ${flows.map((w, i) => folder(ctx, w, i)).join("")}
    </div>
  </section>

  <section class="section wrap sk-anat" aria-labelledby="anat-h" data-wf="decision-prd">
    <div class="section-head"><div><span class="label">How a skill is built</span><h2 id="anat-h">Five parts, the same in every skill.</h2><p>A long prompt is not what makes output good. A strict template, rules about when to refuse, and a script for anything that has a right answer do most of the work. So that is what each folder holds.</p></div></div>
    <div class="anat">
      <div class="anat-art">
        <div class="anat-win">
          <p class="anat-top"><i></i><code>decision-prd/</code><span>One folder, opened</span></p>
          <ul class="anat-tree">
            ${ANATOMY.map(([k, dir, file, note]) => `<li><b>${k}</b><code>${dir ? `<i>${dir}</i>` : ""}${file}</code><span>${note}</span></li>`).join("")}
          </ul>
        </div>
      </div>
      <ol class="anat-list">
        ${PARTS.map(([t, p], i) => `<li><span class="anat-n">${i + 1}</span><div><h3>${t}</h3><p>${p}</p></div></li>`).join("")}
      </ol>
    </div>
  </section>

  <section class="section wrap sk-trust" aria-labelledby="trust-h">
    <div class="sk-trust-head">
      <span class="label">Before you install anything</span>
      <h2 id="trust-h">What these skills can and cannot do.</h2>
    </div>
    <ul class="sk-trust-list">
      ${TRUST.map(([t, p]) => `<li><h3>${t}</h3><p>${p}</p></li>`).join("")}
    </ul>
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

/* ---------------------------------------------------------------- weekly */

/** The newsletter's name, with the highlighter on its last word. */
const wordmark = () => {
  const words = SITE.weekly.name.split(" ");
  const last = words.pop();
  return `${esc(words.join(" "))} <span class="hl">${esc(last)}</span>`;
};

/**
 * The latest issue as a front-page lead: headline, what is in it, and the
 * output of that week's workflow on the workflow's colour. The home page shows
 * it under a small nameplate. The weekly page has its own, so it passes lead.
 */
export function issueTeaser(ctx, issue, { lead = false } = {}) {
  const u = ctx.url;
  const w = ctx.workflow(issue.workflow?.slug);
  const H = lead ? "h2" : "h3";
  const edition = `No. ${esc(String(issue.n))} · ${esc(fmtDate(issue.date))}`;
  const items = [...(w ? [["The workflow", w.short || w.title]] : []), ...(issue.things || []).slice(0, 3).map((t) => ["This week", t.title])];
  return `
  <a class="issue-teaser${lead ? " lead" : ""} rise"${w ? ` data-wf="${esc(w.slug)}"` : ""} href="${u(`/weekly/${issue.slug}/`)}">
    ${lead ? "" : `<div class="wk-bar"><b class="wk-bar-word">${wordmark()}</b><span class="wk-bar-ed">${edition}</span></div>`}
    <div class="it-body${w ? "" : " solo"}">
      <div class="it-copy">
        <span class="label"><b>The latest issue</b>${lead ? ` ${edition}` : ""}</span>
        <${H} class="it-t">${esc(issue.title)}</${H}>
        <p class="it-hook">${esc(issue.hook)}</p>
        <ol class="it-list">
          ${items.map(([k, t], i) => `<li><span class="it-n">${i + 1}</span><span><small>${esc(k)}</small>${esc(t)}</span></li>`).join("")}
        </ol>
        <span class="arrow-link">Read the issue ${ICON.arrow}</span>
      </div>
      ${w ? `<div class="it-art" aria-hidden="true"><span class="it-no">No. ${esc(String(issue.n))}</span>${sheet(ctx, w)}</div>` : ""}
    </div>
  </a>`;
}

const ISSUE_PARTS = [
  ["The workflow", "One workflow, what it is for, the steps, and a line you can paste to run it."],
  ["Try it", "The live demo and the finished output, one click away."],
  ["Three things", "What changed in AI this week that matters to people who ship products. Each with its source and its catch."],
  ["One tip", "A small habit that makes agent output easier to trust."],
  ["One number", "A single sourced figure worth knowing."],
  ["Changelog", "What changed in the skills since last week."],
];

function weeklyIndex(ctx) {
  const u = ctx.url;
  const latest = ctx.issues[0];
  const body = `
  <header class="wk-mast wrap">
    <div class="wk-plate">
      <h1 class="wk-word hl-draw" data-hl>${wordmark()}</h1>
      <p class="wk-date"><i></i><span>Every Tuesday</span><span>About four minutes</span><a href="${u("/feed.xml")}">${ICON.rss}RSS</a></p>
    </div>
  </header>
  ${latest ? `<section class="wrap wk-lead" aria-label="The latest issue">${issueTeaser(ctx, latest, { lead: true })}</section>` : `<p class="wrap wk-empty">The first issue goes out on Tuesday.</p>`}
  <section class="section wrap" aria-labelledby="fmt-h">
    <div class="section-head"><div><span class="label">What is in each issue</span><h2 id="fmt-h">The same six parts, every week.</h2></div></div>
    <ol class="wk-parts">
      ${ISSUE_PARTS.map(([t, p], i) => `<li><span class="wk-part-n">${i + 1}</span><div><h3>${t}</h3><p>${p}</p></div></li>`).join("")}
    </ol>
  </section>
  <section class="wrap">${subscribe(ctx)}</section>
  ${
    ctx.issues.length
      ? `<section class="section wrap" aria-labelledby="arch-h">
    <div class="section-head"><div><span class="label">Archive</span><h2 id="arch-h">Every issue</h2></div><a class="arrow-link" href="${u("/feed.xml")}">${ICON.rss} RSS</a></div>
    <ol class="wk-issues">
      ${ctx.issues
        .map((i) => {
          const w = ctx.workflow(i.workflow?.slug);
          return `
      <li><a class="wk-row" href="${u(`/weekly/${i.slug}/`)}"${w ? ` data-wf="${esc(w.slug)}"` : ""}>
        <span class="wk-row-n"><span class="sr">Issue </span>${esc(String(i.n))}</span>
        <span class="wk-row-t">${esc(i.title)}</span>
        ${w ? `<span class="wk-row-w"><i></i>${esc(w.short || w.title)}</span>` : ""}
        <time class="wk-row-d" datetime="${esc(i.date)}">${esc(fmtDate(i.date))}</time>
        <span class="wk-row-go" aria-hidden="true">${ICON.arrow}</span>
      </a></li>`;
        })
        .join("")}
    </ol>
  </section>`
      : ""
  }`;
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
  const minutes = issue.minutes || 4;
  const src = (s) =>
    s?.url ? `<p class="iss-src">Source: <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label || "Source")}${ICON.arrowUpRight}</a></p>` : "";
  const toc = [
    w && ["workflow", "The workflow"],
    w && ["try", "Try it"],
    (issue.things || []).length > 0 && ["things", "Three things"],
    issue.tip && ["tip", "One tip"],
    issue.number && ["number", "One number"],
    (issue.changelog || []).length > 0 && ["changelog", "Changelog"],
  ].filter(Boolean);

  const body = `
  <article class="iss"${w ? ` data-wf="${esc(w.slug)}"` : ""}>
    <header class="iss-head wrap">
      <div class="wk-bar">
        <a class="wk-bar-word" href="${u("/weekly/")}">${wordmark()}</a>
        <a class="wk-bar-ed" href="${u("/weekly/")}">Every issue ${ICON.arrow}</a>
      </div>
      <div class="iss-top">
        <p class="iss-badge"><span>No.</span><b>${esc(String(issue.n))}</b><span>${esc(fmtDate(issue.date))}</span><span>${esc(String(minutes))} minute read</span></p>
        <h1>${esc(issue.title)}</h1>
        <p class="iss-hook">${esc(issue.hook)}</p>
      </div>
    </header>

    <div class="wrap iss-body">
      <div class="iss-main">
        ${
          w
            ? `<section id="workflow" class="iss-sec">
          <p class="label iss-k"><i>${nn(w.order || 1)}</i>The workflow</p>
          <h2><a href="${u(`/workflows/${w.slug}/`)}">${esc(w.title)}</a></h2>
          <p class="iss-p">${esc(issue.workflow.why || w.promise)}</p>
          <ol class="iss-steps">${(issue.workflow.steps || []).map((s, i) => `<li><span class="iss-step-n">${i + 1}</span><span>${ctx.mdInline(s)}</span></li>`).join("")}</ol>
          ${issue.workflow.prompt ? `<div class="iss-run"><span class="label">Paste this to run it</span>${cmd(issue.workflow.prompt)}</div>` : ""}
          ${issue.workflow.matters ? `<p class="iss-matters"><b>Why it matters</b>${esc(issue.workflow.matters)}</p>` : ""}
        </section>

        <section id="try" class="iss-try">
          <div class="iss-try-copy">
            <span class="label">Try it</span>
            <h2>Watch the run and open the output</h2>
            <p>${esc(issue.demo?.line || "The demo plays in the page. No install, no sign-up.")}</p>
            <div class="iss-try-go">
              <a class="btn on-c" href="${u(`/workflows/${w.slug}/`)}">Open the demo ${ICON.arrow}</a>
              ${exampleOf(w) ? `<a class="btn on-c ghost" href="${u(exampleHref(w))}" target="_blank" rel="noopener">Open the ${esc(w.outputName || "output")} ${ICON.arrowUpRight}</a>` : ""}
            </div>
          </div>
          <a class="iss-try-art" href="${u(`/workflows/${w.slug}/`)}" aria-hidden="true" tabindex="-1">${sheet(ctx, w)}</a>
        </section>`
            : ""
        }

        ${
          (issue.things || []).length
            ? `<section id="things" class="iss-sec">
          <p class="label">This week</p>
          <h2>Three things that matter this week</h2>
          <ol class="iss-things">
            ${issue.things
              .map(
                (t, i) => `
            <li class="iss-thing">
              <span class="iss-thing-n">${i + 1}</span>
              <div>
                <h3>${esc(t.title)}</h3>
                <p><b>What happened:</b> ${esc(t.what)}</p>
                <p><b>Why it matters:</b> ${esc(t.why)}</p>
                ${t.catch ? `<p class="iss-catch"><b>The catch:</b> ${esc(t.catch)}</p>` : ""}
                ${src(t.source)}
              </div>
            </li>`
              )
              .join("")}
          </ol>
        </section>`
            : ""
        }

        ${
          issue.tip
            ? `<section id="tip" class="iss-sec">
          <div class="iss-tip">
            <p class="label">One tip</p>
            <h2>${esc(issue.tip.title)}</h2>
            <p>${esc(issue.tip.body)}</p>
          </div>
        </section>`
            : ""
        }

        ${
          issue.number
            ? `<section id="number" class="iss-sec">
          <p class="label">One number</p>
          <div class="iss-num hl-draw" data-hl>
            <b><span class="hl">${esc(issue.number.value)}</span></b>
            <p>${esc(issue.number.label)}</p>
          </div>
          ${src(issue.number.source)}
        </section>`
            : ""
        }

        ${
          (issue.changelog || []).length
            ? `<section id="changelog" class="iss-sec">
          <p class="label">Changelog</p>
          <ul class="iss-log">${issue.changelog
            .map((c) => `<li><code>${esc(c.skill)}</code>${c.version ? `<span class="chip">${esc(c.version)}</span>` : "<span></span>"}<p>${esc(c.note)}</p></li>`)
            .join("")}</ul>
          <a class="arrow-link" href="${u("/changelog/")}">The full changelog ${ICON.arrow}</a>
        </section>`
            : ""
        }

        <nav class="iss-more" aria-label="More issues">
          ${newer ? `<a href="${u(`/weekly/${newer.slug}/`)}">${ICON.arrow} Newer</a>` : "<span></span>"}
          <a href="${u("/weekly/")}">Every issue</a>
          ${older ? `<a href="${u(`/weekly/${older.slug}/`)}">Older ${ICON.arrow}</a>` : "<span></span>"}
        </nav>
      </div>

      <aside class="iss-rail">
        <nav class="rail-toc" aria-label="In this issue">
          <span class="label">In this issue</span>
          <ol>${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ol>
        </nav>
        <div class="rail-card">
          <span class="label">${esc(SITE.weekly.name)}</span>
          <p>Every Tuesday, about four minutes.</p>
          <a class="btn sm" href="#subscribe">Subscribe ${ICON.arrow}</a>
        </div>
      </aside>
    </div>
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
  const at = ctx.guides.indexOf(g);
  const next = ctx.guides[at + 1] || null;
  const others = ctx.guides.filter((x) => x.slug !== g.slug && x !== next);
  const toc = [];
  const seen = new Set(["main", "subscribe"]);
  const html = ctx
    .md(g.body)
    .replaceAll("{{repo}}", repoSlug())
    .replaceAll("{{plugin}}", SITE.plugin)
    .replaceAll("{{marketplace}}", SITE.marketplace)
    .replace(/href="\/(?!\/)/g, `href="${u("/")}`)
    // Give every section heading an anchor, and lift a leading "1." into a badge.
    .replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner) => {
      const m = /^(\d+)\.\s+([\s\S]+)$/.exec(inner);
      const text = m ? m[2] : inner;
      const plain = text.replace(/<[^>]+>/g, "");
      let id = slugify(plain) || "section";
      while (seen.has(id)) id += "-2";
      seen.add(id);
      toc.push([id, plain]);
      return `<h2 id="${id}">${m ? `<span class="gd-n">${m[1]}</span>` : ""}<span>${text}</span></h2>`;
    });
  const nextHref = next ? u(`/guides/${next.slug}/`) : u("/workflows/");
  const nextTitle = next ? next.title : "All workflows";
  const body = `
  <article class="gd">
    <header class="gd-hero">
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="${u("/guides/start/")}">Guides</a><span>/</span><span>${esc(g.title)}</span></nav>
        <div class="gd-hero-grid">
          <div>
            <span class="gd-part">Guide ${at + 1} of ${ctx.guides.length}</span>
            <h1>${esc(g.title)}</h1>
            <p class="gd-sum">${esc(g.summary || "")}</p>
          </div>
          <dl class="gd-facts">
            <div><dt>Reading time</dt><dd>${esc(g.minutes || 3)} minutes</dd></div>
            <div><dt>Checked</dt><dd>${esc(fmtDate(g.verified || ctx.built))}</dd></div>
            <div><dt>Next</dt><dd><a href="${nextHref}">${esc(nextTitle)}</a></dd></div>
          </dl>
        </div>
      </div>
    </header>

    <div class="wrap gd-body">
      <div class="gd-main">
        <div class="prose">${html}</div>
        <a class="gd-next" href="${nextHref}">
          <span class="gd-next-l">${next ? "Next guide" : "Next"}</span>
          <span class="gd-next-t">${esc(nextTitle)} ${ICON.arrow}</span>
          <span class="gd-next-p">${esc(next ? next.summary || "" : `${word(live(ctx).length)} workflows, in the order work happens.`)}</span>
        </a>
        <nav class="gd-more" aria-label="More guides">
          <span class="label">More guides</span>
          ${others.map((x) => `<a class="arrow-link" href="${u(`/guides/${x.slug}/`)}">${esc(x.title)} ${ICON.arrow}</a>`).join("")}
          ${next ? `<a class="arrow-link" href="${u("/workflows/")}">All workflows ${ICON.arrow}</a>` : ""}
        </nav>
      </div>
      ${
        toc.length
          ? `<aside class="gd-rail">
        <nav class="rail-toc" aria-label="On this page">
          <span class="label">On this page</span>
          <ol>${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ol>
        </nav>
      </aside>`
          : ""
      }
    </div>
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

const RULES = [
  ["Show the output.", "Every workflow has a finished example you can open. If the output is not worth opening, the workflow is not worth publishing."],
  ["Check, then hand over.", "Each skill ends with checks. Anything with a right answer is checked by a script."],
  ["Say how it fails.", "Every page lists the ways the workflow goes wrong and how to catch them."],
  ["Few and finished.", "A small number of workflows done properly beats a long list of prompts."],
  ["Free and readable.", "No sign-up, no paywall, MIT licence. Read every line before you run it."],
];

function aboutPage(ctx) {
  const u = ctx.url;
  const a = SITE.author;
  const flows = live(ctx);
  const names = a.name.split(/\s+/);
  const initials = names.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const site = a.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const companies = ctx.cases.map((c) => c.company);
  const body = `
  <article class="ab">
    <header class="ab-hero wrap">
      <div class="ab-say">
        <span class="label">About</span>
        <p class="ab-kick">Most writing about AI at work is a list of prompts.</p>
        <h1 class="hl-draw" data-hl>You cannot tell from a prompt whether the result is any good. This handbook <span class="hl">shows the result first.</span></h1>
      </div>
      <aside class="ab-card" aria-label="Who makes it">
        <span class="ab-face" aria-hidden="true">${esc(initials)}</span>
        <p class="ab-name">I am ${esc(a.name)}.</p>
        <p class="ab-role">A product owner who works with AI agents every working day. I make this handbook.</p>
        <p class="ab-links">
          <a class="btn sm" href="${esc(a.linkedin)}" target="_blank" rel="noopener">${ICON.linkedin}LinkedIn</a>
          <a class="ab-site" href="${esc(a.url)}" target="_blank" rel="noopener">${esc(site)} ${ICON.arrowUpRight}</a>
        </p>
      </aside>
    </header>

    <section class="ab-row wrap" aria-labelledby="ab-what">
      <h2 id="ab-what">What it is</h2>
      <div class="prose">
        <p>The ${esc(SITE.name)} is a free, growing set of AI workflows for people who build products: product managers first, and the researchers, analysts and strategy people who work beside them.</p>
        <p>Each workflow is three things at once. It is a page that explains when to use it and how it fails. It is a demo that builds the real output step by step. And it is a skill, a small folder of plain text you can install into an AI agent so it does the same job on your material.</p>
      </div>
    </section>

    <section class="wrap" aria-label="In numbers">
      <dl class="ab-nums">
        <div><dt>${flows.length}</dt><dd>workflows<span class="ab-six" aria-hidden="true">${flows.map((w, i) => `<i data-wf="${esc(w.slug)}">${i + 1}</i>`).join("")}</span></dd></div>
        <div><dt>${flows.reduce((n, w) => n + scripted(w), 0)}</dt><dd>scripted checks</dd></div>
        <div><dt>${ctx.issues.length}</dt><dd>${ctx.issues.length === 1 ? "issue" : "issues"} of ${esc(SITE.weekly.name)}</dd></div>
      </dl>
    </section>

    <section class="ab-rules-sec wrap" aria-labelledby="ab-rules">
      <div class="section-head"><div><span class="label">${word(RULES.length)} rules</span><h2 id="ab-rules">The rules it is built on</h2></div></div>
      <ol class="ab-rules">
        ${RULES.map(([t, p], i) => `<li class="ab-rule hl-draw" data-hl><span class="ab-rule-n">${i + 1}</span><h3><span class="hl">${t}</span></h3><p>${p}</p></li>`).join("")}
      </ol>
    </section>

    <section class="ab-row wrap" aria-labelledby="ab-made">
      <h2 id="ab-made">How the examples are made</h2>
      <div class="prose">
        <p>The examples follow ${word(companies.length).toLowerCase()} fictional companies, <a href="${u("/cases/")}">${esc(listAnd(companies))}</a>. Each case stays with one company from the first question to the test result, so its outputs connect.</p>
        <p>For ${esc(companies[0])}, four of the six outputs were produced by a fresh agent session that was given only the skill folder and the input, with nobody to answer its questions. The PRD and the Tangelo prototype were written alongside their skills as reference examples, and the prototype skill was then tested on a different brief. Each workflow page says which is which, with the date, the checker's result, and a record of what the run found wrong with the skill.</p>
      </div>
    </section>

    <section class="ab-row wrap" aria-labelledby="ab-who">
      <h2 id="ab-who">Who makes it</h2>
      <div class="prose">
        <p>I am ${esc(a.name)}, a product owner who works with AI agents every working day. The formats here are the ones I use: a teardown laid out by journey stage, a PRD where every point is numbered and tied to evidence, a prototype where each point can be switched on and off. Nothing on this site comes from an employer, past or present. Every company, customer and number in the examples is invented.</p>
        <p><a class="arrow-link" href="${esc(a.linkedin)}" target="_blank" rel="noopener">${ICON.linkedin} Follow on LinkedIn</a></p>
      </div>
    </section>

    <section class="ab-row wrap" aria-labelledby="ab-wrong">
      <h2 id="ab-wrong">Tell me what is wrong</h2>
      <div class="ab-ask">
        <p>If a workflow gave you a bad result, that is the most useful thing you can tell me. Open an issue with what you gave it and what came back.</p>
        <a class="btn" href="${repoUrl()}/issues" target="_blank" rel="noopener">${ICON.github}Open an issue</a>
        <p class="ab-sign hl-draw" data-hl><span class="hl">${esc(names[0])}</span></p>
      </div>
    </section>

    <nav class="ab-start wrap" aria-label="Start here">
      <span class="label">Start here</span>
      <a href="${u("/guides/start/")}"><span>Set up in ten minutes</span>${ICON.arrow}</a>
      <a href="${u("/workflows/")}"><span>Browse the workflows</span>${ICON.arrow}</a>
      <a href="${u("/cases/")}"><span>Read the ${word(companies.length).toLowerCase()} cases</span>${ICON.arrow}</a>
    </nav>
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
  const flows = live(ctx);
  const newest = (a, b) => String(b.date).localeCompare(String(a.date));
  const rows = [];
  for (const c of ctx.siteLog || []) rows.push({ ...c, w: null });
  for (const w of flows) for (const c of w.changelog || []) rows.push({ ...c, w });
  rows.sort(newest);
  const days = [];
  for (const r of rows) {
    const date = String(r.date);
    if (!days.length || days[days.length - 1].date !== date) days.push({ date, rows: [] });
    days[days.length - 1].rows.push(r);
  }
  const pack = (ctx.siteLog || []).filter((e) => e.version).sort(newest)[0];
  const body = `
  <article class="chg wrap">
    <header class="chg-head">
      <span class="label">Changelog</span>
      <h1>What changed, and when</h1>
      <p>Every change to a skill or a workflow page. Skills use version numbers so you can tell whether your copy is current.</p>
    </header>

    <section class="chg-now">
      <p class="label" id="chg-now">Current versions</p>
      <ul class="chg-tags" aria-labelledby="chg-now">
        ${pack ? `<li><span class="chg-tag pack"><code>${esc(SITE.plugin)}</code><b>v${esc(pack.version)}</b><small>The whole pack</small></span></li>` : ""}
        ${flows.map((w) => `<li><a class="chg-tag" data-wf="${esc(w.slug)}" href="${u(`/workflows/${w.slug}/`)}"><code>${esc(w.skill)}</code><b>v${esc(w.version || "1.0.0")}</b><small>${esc(w.tab || w.short || w.title)}</small></a></li>`).join("")}
      </ul>
    </section>

    <ol class="chg-log">
      ${days
        .map(
          (d) => `
      <li class="chg-day">
        <h2><time datetime="${esc(d.date)}">${esc(fmtDate(d.date))}</time></h2>
        <ul>
          ${d.rows
            .map(
              (r) => `
          <li class="chg-row"${r.w ? ` data-wf="${esc(r.w.slug)}"` : ""}>
            <span class="chg-what"><i></i>${r.w ? `<a href="${u(`/workflows/${r.w.slug}/`)}"><code>${esc(r.w.skill)}</code></a>` : `<b>Handbook</b>`}</span>
            <span class="chg-v">${r.version ? `v${esc(r.version)}` : ""}</span>
            <p>${ctx.mdInline(r.note)}</p>
          </li>`
            )
            .join("")}
        </ul>
      </li>`
        )
        .join("")}
    </ol>
  </article>`;
  return { path: "/changelog/", title: "Changelog", description: "Every change to the skills and workflow pages.", body, priority: "0.4" };
}

/** A bare page holding one stage, sized for rendering clips and carousels. Not indexed. */
function clipPage(ctx, w) {
  const body = `
  <div class="clip" data-clip data-wf="${esc(w.slug)}">
    <header class="clip-head">
      <span class="clip-brand">${MARK}<span>${esc(SITE.name)}</span></span>
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

const bareUrl = () => SITE.clipUrl || SITE.defaultOrigin.replace(/^https?:\/\//, "");

/** First slide of a carousel: the claim, and a still of the finished output. */
function clipCover(ctx, w) {
  const body = `
  <div class="clip clip-cover" data-clip data-wf="${esc(w.slug)}">
    <header class="clip-head">
      <span class="clip-brand">${MARK}<span>${esc(SITE.name)}</span></span>
      <h1>${hl(w.clipTitle || w.title)}</h1>
      <p class="clip-sub">${esc(w.clipLine || w.promise)}</p>
    </header>
    <div class="clip-shot"><img src="${ctx.url(`/hub/posters/${w.slug}-tall.png`)}" alt=""></div>
    <footer class="clip-foot"><span>${esc(SITE.author.name)}</span><b>Free skill. Swipe to watch it work &rarr;</b></footer>
  </div>`;
  return { path: `/clip/${w.slug}/cover/`, title: w.title, description: w.promise, body, noindex: true, bodyClass: "clip-page" };
}

/** Last slide: where to open the output and how to install the skill. */
function clipEnd(ctx, w) {
  const body = `
  <div class="clip clip-end" data-clip data-wf="${esc(w.slug)}">
    <header class="clip-head">
      <span class="clip-brand">${MARK}<span>${esc(SITE.name)}</span></span>
      <h1>${hl("Open the output. Then *install the skill*.")}</h1>
    </header>
    <div class="clip-steps">
      <div><small>1. Open a worked example</small><b>${esc(bareUrl())}/workflows/${esc(w.slug)}</b></div>
      <div><small>2. Install in Claude Code</small><code>/plugin install ${esc(SITE.plugin)} --marketplace ${esc(repoSlug())}</code></div>
      <div><small>3. Or in Cursor, Codex, Gemini CLI</small><code>npx skills add ${esc(repoSlug())}</code></div>
    </div>
    <footer class="clip-foot"><span>Free, MIT licensed, and plain text you can read first.</span><b>Follow ${esc(SITE.author.name)}</b></footer>
  </div>`;
  return { path: `/clip/${w.slug}/end/`, title: w.title, description: w.promise, body, noindex: true, bodyClass: "clip-page" };
}

/** The 1200 by 630 card a link preview shows. w is a workflow, or null for the site's own card. */
function ogCard(ctx, w) {
  const title = w ? w.clipTitle || w.title : "AI workflows that *show their work*";
  const line = w ? w.clipLine || w.promise : "Six free agent skills for product, research, data and strategy people. Watch each one run, open its output, then install it.";
  const shown = w || ctx.workflow(SITE.heroDemo || "flagged-prototype");
  const body = `
  <div class="og" data-clip>
    <div class="og-copy">
      <span class="og-brand">${MARK}<span>${esc(SITE.name)}</span></span>
      <h1>${hl(title)}</h1>
      <p>${esc(line)}</p>
    </div>
    <div class="og-side" data-wf="${esc(shown.slug)}">${sheet(ctx, shown, null, { eager: true })}</div>
  </div>`;
  return { path: w ? `/clip/${w.slug}/og/` : "/clip/og/", title: w ? w.title : SITE.name, description: line, body, noindex: true, bodyClass: "clip-page" };
}

/* ---------------------------------------------------------------- output */

export async function all(ctx) {
  ctx.siteLog = ctx.exists("hub/content/changelog.json") ? JSON.parse(await ctx.read("hub/content/changelog.json")) : [];
  const out = [skillsPage(ctx), weeklyIndex(ctx), aboutPage(ctx), changelogPage(ctx)];
  for (const i of ctx.issues) out.push(issuePage(ctx, i));
  for (const g of ctx.guides) out.push(guidePage(ctx, g));
  for (const w of live(ctx)) out.push(clipPage(ctx, w), clipCover(ctx, w), clipEnd(ctx, w), ogCard(ctx, w));
  out.push(ogCard(ctx, null));
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
