// hub/lib/pages-cases.mjs : the three worked cases, as pages.
//
//   /cases/        the index: each case, the change it tested and how it ended
//   /cases/<id>/   one case: a thread through six stops, one per workflow,
//                  ending in the verdict of its own readout
//   /case/         the old address of the Tangelo case. It sends readers on.
//
// The words come from hub/content/cases/<id>.json. The pictures and the
// ending are read from the real outputs in skills/*/examples/<id>/, so a
// screen, a rejected quote or a verdict is shown only while the output still
// holds it. A stop whose example is not on disk says so and links nowhere.
// It starts rendering in full on the first build after the example exists.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { SITE, repoUrl } from "../site.config.mjs";
import { screenSvg } from "../src/js/artifacts/screen.js";
import { esc, ICON } from "./html.mjs";
import { stageOf, subscribe, fmtDate } from "./partials.mjs";

/** The file that holds each workflow's output, inside an example folder. */
const OUTPUT = {
  "journey-teardown": "teardown.json",
  "interview-synthesis": "synthesis.json",
  premortem: "premortem.json",
  "decision-prd": "prd.json",
  "flagged-prototype": "spec.js",
  "experiment-readout": "readout.json",
};

/** What a readout can decide, and the words the pages use for it. */
const VERDICT = {
  ship: { word: "Ship", tone: "go" },
  extend: { word: "Extend", tone: "wait" },
  stop: { word: "Stop", tone: "halt" },
  "do-not-trust": { word: "Do not trust", tone: "halt" },
};
const GUARD = { held: "Held", unclear: "Not settled", worse: "Got worse" };

const live = (ctx) => ctx.workflows.filter((w) => w.status !== "planned");
const nn = (n) => String(n).padStart(2, "0");
const num = (n) => Number(n).toLocaleString("en-US");
const pct = (r) => `${(r * 100).toFixed(1)}%`;
const points = (d) => `${d >= 0 ? "+" : "−"}${Math.abs(d * 100).toFixed(1)}`;
const cap = (s) => String(s || "").replace(/^./, (ch) => ch.toUpperCase());
const warn = (msg) => console.warn(`cases: ${msg}`);

const exampleFile = (ctx, w, caseId) => join(ctx.root, "skills", w.skill || w.slug, "examples", caseId, OUTPUT[w.slug] || "-");
const hasExample = (ctx, w, caseId) => Boolean(OUTPUT[w.slug]) && existsSync(exampleFile(ctx, w, caseId));
const outputHref = (w, caseId) => `/examples/${caseId}/${w.skill || w.slug}.html`;
/** The workflow's own entry for this case (label, note, run), when its meta.json has one. */
const entryOf = (w, caseId) => (w.cases || []).find((x) => x.id === caseId) || null;

/** A workflow's output for a case, parsed. Null when it is missing or is not JSON. */
function readOutput(ctx, w, caseId) {
  const file = w ? exampleFile(ctx, w, caseId) : "";
  if (!file.endsWith(".json") || !existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/**
 * A sheet of this case's own output. partials.sheet() falls back to the
 * first case when a workflow has no entry for the one asked for, which would
 * put another company's picture on the page. This one draws blank paper.
 */
function picture(ctx, w, caseId) {
  const src = `/hub/art/${caseId}/${w.slug}.webp`;
  if (!existsSync(join(ctx.root, "hub", "static", src))) return `<span class="sheet cp-paper" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>`;
  return `<span class="sheet"><img src="${ctx.url(src)}" alt="" width="1200" height="900" loading="lazy" decoding="async"></span>`;
}

/** Every string inside a schematic screen, in reading order. */
function strings(node, out = []) {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((x) => strings(x, out));
  else if (node && typeof node === "object") Object.values(node).forEach((x) => strings(x, out));
  return out;
}

/** The first screen of our own product, in any stage, that shows this text. */
function findScreen(teardown, text) {
  if (!text) return null;
  for (const st of teardown.stages || []) {
    const lane = (st.lanes || []).find((l) => l.app === teardown.us);
    for (const screen of lane?.screens || []) if (strings(screen.blocks).some((s) => s.includes(text))) return screen;
  }
  return null;
}

function draw(screen, accent, id) {
  try {
    return screenSvg({ ...screen, accent: accent || screen.accent }, { idPrefix: id });
  } catch {
    return "";
  }
}

const has = (hay, needle) => Boolean(needle) && String(hay || "").toLowerCase().includes(String(needle).toLowerCase());

/* --------------------------------------------------------------- moments */

// One staged moment per stop, at most. Each returns its markup, or null when
// the output no longer holds what the case file says it shows.
const MOMENT = {
  /** Two screens of our own product that say opposite things. */
  clash(ctx, c, w, m) {
    const d = readOutput(ctx, w, c.id);
    const a = d && findScreen(d, m.a?.find || m.a?.says);
    const b = d && findScreen(d, m.b?.find || m.b?.says);
    if (!a || !b) return null;
    const accent = (d.apps || []).find((x) => x.id === d.us)?.accent;
    const shot = (side, screen, id) => `
          <div class="cp-shot${screen.frame === "desktop" ? "" : " is-phone"}">
            <div class="cp-shot-pic" aria-hidden="true">${draw(screen, accent, `${c.id}-${id}`)}</div>
            <p><span>${esc(side.where)}</span><q>${esc(side.says)}</q></p>
          </div>`;
    return `
        <div class="cp-clash">${shot(m.a, a, "a")}
          <b class="cp-ne" role="img" aria-label="does not match">≠</b>${shot(m.b, b, "b")}
        </div>
        ${m.note ? `<p class="cp-moment-note">${esc(m.note)}</p>` : ""}`;
  },

  /** The quote the request asked for, which the script could not find. */
  struck(ctx, c, w, m) {
    const d = readOutput(ctx, w, c.id);
    const hit = (d?.rejected || []).find((r) => r.text === m.quote);
    if (!hit) return null;
    return `
        <div class="cp-struck">
          <div class="cp-quote">
            <small>The request asked for this quote</small>
            <blockquote><span>${esc(hit.text)}</span></blockquote>
            <b class="cp-stamp">${esc(cap(hit.reason || "not found in any transcript"))}</b>
          </div>
          <div class="cp-struck-side">
            <p class="cp-tally"><code>verify_quotes.py</code><span><b>${num(d.checked?.found || 0)}</b> found</span><span class="is-bad"><b>${num(d.checked?.rejected || 0)}</b> removed</span></p>
            ${m.note ? `<p class="cp-moment-note">${esc(m.note)}</p>` : ""}
          </div>
        </div>`;
  },

  /** The plan the pre-mortem was given, and the plan the PRD was written for. */
  swap(ctx, c, w, m) {
    const plan = readOutput(ctx, w, c.id)?.plan;
    const prd = readOutput(ctx, ctx.workflow("decision-prd"), c.id);
    if (!plan || !prd || !has(plan.name, m.before?.name) || !has(JSON.stringify(prd), m.after?.name)) return null;
    return `
        <div class="cp-swap">
          <div class="cp-plan is-before"><small>The plan that went in</small><b><span>${esc(m.before.name)}</span></b><p>${esc(m.before.text)}</p></div>
          <span class="cp-swap-to" aria-hidden="true">${ICON.arrow}</span>
          <div class="cp-plan is-after"><small>The plan the PRD was written for</small><b><span>${esc(m.after.name)}</span></b><p>${esc(m.after.text)}</p></div>
        </div>
        ${m.note ? `<p class="cp-moment-note">${esc(m.note)}</p>` : ""}`;
  },

  /** The PRD's rollout, step by step, with the name each point has in its priority table. */
  rollout(ctx, c, w, m) {
    const d = readOutput(ctx, w, c.id);
    if (!d?.rollout?.length) return null;
    const name = Object.fromEntries((d.priority || []).map((p) => [p.id, p.change]));
    return `
        <ol class="cp-rollout">
          ${d.rollout
            .map(
              (r, i) => `
          <li>
            <span class="cp-roll-n">${i + 1}</span>
            <b>${esc(r.when)}</b>
            <ul>${(r.points || []).map((id) => `<li><i>${esc(id)}</i><span>${esc(name[id] || "")}</span></li>`).join("")}</ul>
          </li>`
            )
            .join("")}
        </ol>
        ${m.note ? `<p class="cp-moment-note">${esc(m.note)}</p>` : ""}`;
  },
};

function moment(ctx, c, w, m) {
  if (!m || !MOMENT[m.kind]) return "";
  const inner = MOMENT[m.kind](ctx, c, w, m);
  if (inner == null) {
    warn(`${c.id}, ${w.slug}: the "${m.kind}" moment was left out, because the output does not hold what the case file says it shows`);
    return "";
  }
  return `
      <figure class="cp-moment is-${esc(m.kind)} rise">
        ${m.label ? `<figcaption>${esc(m.label)}</figcaption>` : ""}${inner}
      </figure>`;
}

/* ------------------------------------------------------------------ stops */

function stop(ctx, c, kase, w, i) {
  const u = ctx.url;
  const st = stageOf(w.stage);
  const step = (kase.steps || []).find((s) => s.workflow === w.slug) || {};
  const findings = (step.findings || []).filter((f) => f && f.text);
  const thing = w.outputName || "output";
  const head = `
        <header class="cp-block-head">
          <span class="cp-num">${nn(i + 1)}</span>
          <p class="cp-wf"><b>${esc(w.short || w.title)}</b><span>${esc(st.title)}</span></p>
        </header>`;

  // The example is not on disk yet: say so, and link nowhere.
  if (!hasExample(ctx, w, c.id)) {
    return `
    <li class="cp-stop is-soon" id="${esc(w.slug)}" data-wf="${esc(w.slug)}">
      <article class="cp-block rise">${head}
        <div class="cp-copy">
          <h2 class="cp-ask">${esc(step.question || w.title)}</h2>
          <p class="cp-soon">The ${esc(thing)} for this case is being built.</p>
        </div>
      </article>
    </li>`;
  }

  const entry = entryOf(w, c.id);
  const href = u(outputHref(w, c.id));
  const label = entry?.label || `The ${thing}`;
  // A run record belongs here only when it is the run that made this output.
  const run = entry?.run && (!entry.run.log || entry.run.log.startsWith(`examples/${c.id}/`)) ? entry.run : null;

  return `
    <li class="cp-stop${i % 2 ? " is-flip" : ""}" id="${esc(w.slug)}" data-wf="${esc(w.slug)}">
      <article class="cp-block rise">${head}
        <div class="cp-copy">
          <h2 class="cp-ask">${esc(step.question || w.title)}</h2>
          ${
            findings.length
              ? `<h3 class="cp-sub">What came back</h3>
          <ul class="cp-finds">
            ${findings.map((f) => `<li><b>${esc(f.n || "")}</b><p>${esc(f.text)}</p></li>`).join("\n            ")}
          </ul>`
              : `<p class="cp-plain">${esc(entry?.note || `The ${thing} for this case is finished and open to read.`)}</p>`
          }
          <p class="cp-links">
            <a class="btn sm on-c" href="${href}" target="_blank" rel="noopener">Open the ${esc(thing)} ${ICON.arrowUpRight}</a>
            <a class="cp-how" href="${u(`/workflows/${w.slug}/`)}?case=${esc(c.id)}">How the workflow works ${ICON.arrow}</a>
          </p>
          ${
            run
              ? `<p class="cp-receipt"><i>${ICON.check}</i><span>${esc(String(run.passed))} of ${esc(String(run.total))} scripted checks passed. ${entry.kind === "reference" ? "Checked" : "Test run"} ${esc(fmtDate(run.date))}.${
                  run.log ? ` <a href="${repoUrl(`${SITE.repo.skillsDir}/${w.skill}/${run.log}`)}" target="_blank" rel="noopener">The run notes</a>` : ""
                }</span></p>`
              : ""
          }
        </div>
        <a class="cp-art" href="${href}" target="_blank" rel="noopener" aria-label="Open the ${esc(thing)}: ${esc(label)}">
          ${picture(ctx, w, c.id)}
          <span class="cp-art-cap">${esc(label)}</span>
        </a>${moment(ctx, c, w, step.moment)}
      </article>
      ${step.changed ? `<div class="cp-tag rise"><div class="cp-tag-card"><span>What it changed</span><p>${esc(step.changed)}</p></div></div>` : ""}
    </li>`;
}

/* ----------------------------------------------------------------- ending */

/** The readout of a case and what it decided. Null until the readout exists. */
function verdictOf(ctx, caseId) {
  const w = ctx.workflow("experiment-readout");
  const r = w && readOutput(ctx, w, caseId);
  const decision = r?.numbers?.verdict?.decision;
  if (!decision) return null;
  return { w, r, n: r.numbers, decision, ...(VERDICT[decision] || { word: cap(decision), tone: "wait" }) };
}

function ending(ctx, c, kase) {
  const v = verdictOf(ctx, c.id);
  if (!v) return "";
  const { w, r, n } = v;
  const [a, b] = n.input.arms;
  const p = n.primary;
  const top = Math.max(...p.rates) || 1;
  const mde = +(n.input.test.mde_set * 100).toFixed(1);
  const days = n.checks.duration;
  const even = n.checks.srm.pass;
  const headline = String(r.headline || "").replace(new RegExp(`^${v.word}\\.\\s*`, "i"), "");
  const href = ctx.url(outputHref(w, c.id));

  const split = even
    ? `<p class="cp-okline"><i>${ICON.check}</i><span>The split came out as planned: ${num(a.users)} and ${num(b.users)} ${esc(n.input.test.unit || "users")}. It ran ${esc(String(days.ran_days))} of ${esc(String(days.planned_days))} planned days.</span></p>`
    : `<div class="cp-split">
            <p class="cp-fig-h">The split was planned even. It did not come out even.</p>
            <div class="cp-split-bar" aria-hidden="true">
              <span style="flex-grow:${a.users}"></span><span style="flex-grow:${b.users}"></span>
              <i style="left:${((n.checks.srm.expected[0] / (a.users + b.users)) * 100).toFixed(2)}%"><em>the planned split</em></i>
            </div>
            <p class="cp-split-key"><span><b>${num(a.users)}</b>${esc(a.name)}</span><span><b>${num(b.users)}</b>${esc(b.name)}</span></p>
          </div>`;

  const result = `
          <div class="cp-result${even ? "" : " is-void"}">
            <p class="cp-fig-h">${esc(p.name)}</p>
            <p class="cp-diff"><b>${points(p.diff)}</b><span>points</span>${even ? "" : `<em class="cp-stamp">Cannot be read</em>`}</p>
            <div class="cp-bars">
              ${[a, b].map((arm, k) => `<p><span style="--w:${((p.rates[k] / top) * 100).toFixed(1)}%"></span><b>${pct(p.rates[k])}</b><small>${esc(arm.name)}</small></p>`).join("")}
            </div>
            <p class="cp-ci">${
              even
                ? `The interval runs from ${(p.ci[0] * 100).toFixed(1)} to ${(p.ci[1] * 100).toFixed(1)} points. The team had set ${mde} ${mde === 1 ? "point" : "points"} as the smallest lift worth shipping.`
                : esc(n.verdict.reasons?.[1] || "")
            }</p>
          </div>`;

  const guards =
    even && (n.guardrails || []).length
      ? `<ul class="cp-guards">
            ${n.guardrails.map((g) => `<li class="is-${esc(g.verdict)}"><span>${esc(g.name)}</span><b>${esc(GUARD[g.verdict] || g.verdict)}</b></li>`).join("")}
          </ul>`
      : "";

  return `
  <section class="cp-end wrap" id="ending" aria-labelledby="end-h">
    <div class="cp-verdict is-${v.tone} rise">
      <div class="cp-verdict-say">
        <h2 class="cp-end-l" id="end-h">How it ended</h2>
        <p class="cp-word${v.word.length > 7 ? " is-long" : ""}">${esc(v.word)}.</p>
        <p class="cp-headline">${esc(headline)}</p>
        <p class="cp-rule">${esc(n.verdict.rule)}</p>
      </div>
      <div class="cp-verdict-fig">
          ${split}${result}
          ${guards}
      </div>
      <div class="cp-verdict-foot">
        <div class="cp-after">
          ${kase.ending?.body ? `<p>${esc(kase.ending.body)}</p>` : ""}
          <a class="btn" href="${href}" target="_blank" rel="noopener">Open the readout ${ICON.arrowUpRight}</a>
        </div>
        ${
          (r.next || []).length
            ? `<div class="cp-next"><h3>What the readout says to do next</h3><ol>${r.next.map((x) => `<li>${esc(x)}</li>`).join("")}</ol></div>`
            : ""
        }
      </div>
    </div>
  </section>`;
}

/* -------------------------------------------------------------- one case */

/** The title, with the words the case file marks drawn over in highlighter. */
function marked(title, mark) {
  const t = esc(title);
  const m = esc(mark || "");
  const at = m ? t.indexOf(m) : -1;
  return at === -1 ? t : `${t.slice(0, at)}<span class="hl">${m}</span>${t.slice(at + m.length)}`;
}

function caseSwitch(ctx, current) {
  return `
      <nav class="cases cp-switch" aria-label="The three cases">
        ${ctx.cases.map((x) => `<a href="${ctx.url(`/cases/${x.id}/`)}"${x.id === current ? ' aria-current="page"' : ""}><b>${esc(x.domain)}</b><span>${esc(x.company)}, ${esc(x.what)}</span></a>`).join("")}
      </nav>`;
}

function casePage(ctx, { c, kase }, all) {
  const u = ctx.url;
  const flows = live(ctx);
  const v = verdictOf(ctx, c.id);
  const open = flows.filter((w) => hasExample(ctx, w, c.id));
  const missing = flows.filter((w) => !hasExample(ctx, w, c.id));
  const others = all.filter((x) => x.c.id !== c.id);
  const dates = flows.map((w) => entryOf(w, c.id)?.run?.date).filter(Boolean).sort();
  const co = kase.company || {};

  const body = `
  <article class="cp" data-case="${esc(c.id)}">
    <header class="cp-top wrap">
      <div class="cp-bar">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="${u("/cases/")}">Cases</a><span>/</span><b>${esc(c.domain)}</b></nav>${caseSwitch(ctx, c.id)}
      </div>
      <h1 class="cp-h rise"><span class="hl-draw" data-hl>${marked(c.title, kase.mark)}</span></h1>
      <div class="cp-lede rise" style="--i:1">
        <p class="cp-intro">${esc(kase.intro || "")}</p>
        <p class="cp-fict"><span class="chip">Invented</span>${esc(c.company)}, the people in it and every number on this page are made up, so the method can be shown in full. Each output is the real thing a skill produced.</p>
      </div>
      <nav class="cp-route rise" style="--i:2" aria-label="The stops on this page">
        ${flows.map((w, i) => `<a href="#${esc(w.slug)}" data-wf="${esc(w.slug)}"${hasExample(ctx, w, c.id) ? "" : ' class="is-soon"'}><i>${i + 1}</i><span>${esc(w.tab || w.short || w.title)}</span></a>`).join("")}
        ${v ? `<a href="#ending" class="cp-route-end is-${v.tone}"><i>${ICON.arrow}</i><span>${esc(v.word)}</span></a>` : ""}
      </nav>
    </header>

    <section class="cp-brief wrap" aria-label="The case in brief">
      <div class="cp-q rise">
        <h2>The question</h2>
        <p>${esc(c.question)}</p>
      </div>
      <dl class="cp-facts rise" style="--i:1">
        <div><dt>Company</dt><dd>${esc(c.company)}, ${esc(c.what)}</dd></div>
        ${co.customer ? `<div><dt>The customer</dt><dd>${esc(co.customer)}</dd></div>` : ""}
        ${(co.competitors || []).length ? `<div><dt>Compared with</dt><dd>${co.competitors.map(esc).join(", ")}</dd></div>` : ""}
        <div><dt>On this page</dt><dd>${
          missing.length
            ? `${open.length} of ${flows.length} outputs, open to read. The ${missing.map((w) => esc(w.outputName || w.short || w.title)).join(" and the ")} is being built.`
            : `All ${flows.length} outputs, open to read.`
        }</dd></div>
      </dl>
    </section>

    <ol class="cp-thread wrap">
      ${flows.map((w, i) => stop(ctx, c, kase, w, i)).join("")}
    </ol>
    ${ending(ctx, c, kase)}

    <nav class="cp-others wrap" aria-label="The other cases">
      <h2>The same six workflows, somewhere else</h2>
      <div>
        ${others
          .map((x) => {
            const xv = verdictOf(ctx, x.c.id);
            return `<a class="rise" href="${u(`/cases/${x.c.id}/`)}"><span class="cp-other-d">${esc(x.c.domain)}</span><b>${esc(x.c.title)}</b><span class="cp-other-o">${esc(x.c.company)}, ${esc(x.c.what)}.${xv ? ` The readout said ${esc(xv.word.toLowerCase())}.` : ""}</span><i>${ICON.arrow}</i></a>`;
          })
          .join("")}
      </div>
    </nav>
  </article>
  <section class="section wrap">${subscribe(ctx, { compact: true })}</section>`;

  return {
    path: `/cases/${c.id}/`,
    title: `${c.title}: the ${c.company} case`,
    description: `Worked case, ${c.domain}: six AI workflows run in order on ${c.company}, an invented company (${c.what}), from a competitor teardown to an experiment readout. ${c.outcome}`,
    body,
    active: "/cases/",
    type: "article",
    lastmod: dates.pop(),
    priority: "0.8",
    search: searchEntry(c),
  };
}

/* ----------------------------------------------------------------- index */

/** The change a case took to test, drawn from the PRD's own proposed screen. */
function tested(ctx, c, kase) {
  const prd = readOutput(ctx, ctx.workflow("decision-prd"), c.id);
  const point = (prd?.sections || []).flatMap((s) => s.points || []).find((p) => p.id === kase.tested?.point);
  const ev = (point?.evidence || []).find((e) => e.tag === "proposed" && e.screen);
  const svg = ev ? draw(ev.screen, ev.screen.accent, `${c.id}-t`) : "";
  if (!svg) return "";
  return `
      <span class="cx-emblem${ev.screen.frame === "desktop" ? "" : " is-phone"}">
        <span class="cx-emblem-pic" aria-hidden="true">${svg}</span>
        <span class="cx-emblem-cap"><b>What went to test</b>${esc(ev.caption || "")}</span>
      </span>`;
}

function world(ctx, { c, kase }, i) {
  const flows = live(ctx);
  const v = verdictOf(ctx, c.id);
  return `
    <a class="cx-world is-${v ? v.tone : "wait"}${i % 2 ? " is-flip" : ""} rise" href="${ctx.url(`/cases/${c.id}/`)}">
      <span class="cx-copy">
        <span class="cx-where"><b>${esc(c.domain)}</b><span>${esc(c.company)}, ${esc(c.what)}</span></span>
        <h2>${esc(c.title)}</h2>
        <span class="cx-q">${esc(c.question)}</span>
        <span class="cx-path" aria-hidden="true">${flows.map((w, k) => `<i data-wf="${esc(w.slug)}"${hasExample(ctx, w, c.id) ? "" : ' class="is-soon"'}>${k + 1}</i>`).join("")}</span>
        <span class="cx-o"><small>How it ended</small>${v ? `<b>${esc(v.word)}.</b>` : ""}<span>${esc(c.outcome)}</span></span>
        <span class="cx-go">Read the ${esc(c.company)} case ${ICON.arrow}</span>
      </span>${tested(ctx, c, kase)}
    </a>`;
}

/** Every output on the site, workflow by workflow and case by case. */
function matrix(ctx, cases) {
  const flows = live(ctx);
  return `
    <div class="cx-grid" role="table" aria-label="Every output, by workflow and case">
      <div class="cx-row is-head" role="row"><span role="columnheader">Workflow</span>${cases.map(({ c }) => `<span role="columnheader"><b>${esc(c.company)}</b>${esc(c.domain)}</span>`).join("")}</div>
      ${flows
        .map(
          (w, i) => `
      <div class="cx-row" role="row" data-wf="${esc(w.slug)}">
        <a class="cx-wf" role="rowheader" href="${ctx.url(`/workflows/${w.slug}/`)}"><i>${nn(i + 1)}</i><span>${esc(w.short || w.title)}</span></a>
        ${cases
          .map(({ c }) =>
            hasExample(ctx, w, c.id)
              ? `<a class="cx-cell" role="cell" href="${ctx.url(outputHref(w, c.id))}" target="_blank" rel="noopener"><small>${esc(c.company)}</small><span>${esc(entryOf(w, c.id)?.label || `The ${w.outputName || "output"}`)}</span>${ICON.arrowUpRight}</a>`
              : `<span class="cx-cell is-soon" role="cell"><small>${esc(c.company)}</small><span>Being built</span></span>`
          )
          .join("")}
      </div>`
        )
        .join("")}
    </div>`;
}

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const word = (n) => WORDS[n] || String(n);

function indexPage(ctx, cases) {
  const flows = live(ctx);
  const outputs = cases.reduce((n, { c }) => n + flows.filter((w) => hasExample(ctx, w, c.id)).length, 0);
  const endings = cases.map(({ c }) => verdictOf(ctx, c.id)?.word.toLowerCase()).filter(Boolean);
  const said = endings.length === cases.length && endings.length > 1 ? `One readout said ${endings.slice(0, -1).join(", one said ")} and one said ${endings[endings.length - 1]}. ` : "";
  const body = `
  <header class="cx-head wrap">
    <span class="label">Worked cases</span>
    <h1 class="rise"><span class="hl-draw" data-hl>${word(cases.length)} cases. ${word(cases.length)} <span class="hl">different endings.</span></span></h1>
    <p class="rise" style="--i:1">Each case runs all ${word(flows.length).toLowerCase()} workflows in order, and each workflow picks up the output of the one before. ${said}Every company, person and number is invented. Every output is the real thing a skill produced.</p>
  </header>

  <section class="cx-worlds wrap" aria-label="The cases">
    ${cases.map((x, i) => world(ctx, x, i)).join("")}
  </section>

  <section class="section wrap" aria-labelledby="all-h">
    <div class="section-head">
      <div>
        <span class="label">Everything, side by side</span>
        <h2 id="all-h">${outputs} finished outputs. Open any of them.</h2>
        <p>The same workflow gives a different document in each domain. Read across a row to see how.</p>
      </div>
    </div>
    ${matrix(ctx, cases)}
  </section>

  <section class="section wrap">${subscribe(ctx, { compact: true })}</section>`;

  return {
    path: "/cases/",
    title: "Worked cases",
    description: `${word(cases.length)} invented companies, each followed through ${word(flows.length).toLowerCase()} AI workflows from the first question to the test result. ${outputs} finished outputs, all open to read.`,
    body,
    active: "/cases/",
    priority: "0.9",
    search: { t: "Worked cases", p: "/cases/", k: "Page", d: `${word(cases.length)} cases, each run through all ${word(flows.length).toLowerCase()} workflows.` },
  };
}

/* ------------------------------------------------- the old /case/ address */

function movedPage(ctx, c) {
  const to = ctx.url(`/cases/${c.id}/`);
  return {
    path: "/case/",
    title: "This page has moved",
    description: `The ${c.company} case has moved to /cases/${c.id}/.`,
    head: `<meta http-equiv="refresh" content="0; url=${esc(to)}">`,
    body: `
  <section class="cx-moved wrap">
    <h1>This page has moved</h1>
    <p><a href="${esc(to)}">Go to the ${esc(c.company)} case</a></p>
  </section>`,
    active: "/cases/",
    noindex: true,
  };
}

/* ------------------------------------------------------------- registry */

const searchEntry = (c) => ({ t: c.title, p: `/cases/${c.id}/`, k: "Case", d: c.question, x: [c.company, c.domain, c.what].join(" ") });

/**
 * The case pages as search entries, in the shape hub/search.json already
 * uses. Whatever builds that file can spread these in.
 */
export function searchEntries(ctx) {
  return [{ t: "Worked cases", p: "/cases/", k: "Page", d: "Three cases, each run through all six workflows." }, ...ctx.cases.map(searchEntry)];
}

export async function all(ctx) {
  const cases = [];
  for (const c of ctx.cases) {
    const rel = `hub/content/cases/${c.id}.json`;
    if (!ctx.exists(rel)) {
      warn(`${rel} is missing, so /cases/${c.id}/ was not built`);
      continue;
    }
    cases.push({ c, kase: JSON.parse(await ctx.read(rel)) });
  }
  if (!cases.length) return [];
  const old = (cases.find((x) => x.c.id === "tangelo") || cases[0]).c;
  return [indexPage(ctx, cases), ...cases.map((x) => casePage(ctx, x, cases)), movedPage(ctx, old)];
}
