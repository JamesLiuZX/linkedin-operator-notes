// site/src/demos/slop-gate.js
//
// Draft Check: paste anything. This runs the same specificity, rhythm, hook,
// sourcing, and tell-detection checks the posting dashboard runs on every draft
// in this repo (scripts/lib/analyze.mjs), on whatever text you give it.
//
// Scoped honestly: it is not the full CI gate. scripts/content-check.mjs
// builds on the same shared function and adds 9 more checks, the evidence
// block, unfilled slots, derivedFrom provenance, and the LinkedIn fold and
// hashtag checks, all specific to this repo's own frontmatter and publishing
// conventions. None of those mean anything on a paragraph with no
// frontmatter, so they are left out here on purpose, not by accident: see
// articles/15-a-checklist-not-a-model.md for the pass where "on purpose" and
// "by accident" briefly stopped being distinguishable.
//
// The checks and their scoring live in analyze.mjs and are untouched. This
// file presents them: sample pills, one overall result, the 12 checks as a
// pass or flag list in plain words, and the raw scores in a disclosure.

import { analyze } from "@lib/analyze.mjs";
import { esc } from "../viz/charts.js";
import { answerCard, card, disclosure, hl, scenarioBar, status, table } from "./kit.js";
import "./slop-gate.css";

export const meta = {
  slug: "slop-gate",
  title: "Draft Check",
  tagline: "Does this draft read like a person wrote it?",
  section: "agents",
  pillar: "AI & agents",
  essay: "15-a-checklist-not-a-model",
  blurb:
    "Paste a LinkedIn post or an essay draft. Twelve checks look for the habits that give generated text away, and each flag says what to change.",
  how: [
    "The dashboard's own analyzer (scripts/lib/analyze.mjs), pointed at whatever you paste instead of this repo's drafts. 12 checks: em dashes, LLM tells, hedge words, engagement bait, hook strength, specificity density, named sourcing, and receipts.",
    "It is not the full CI gate. scripts/content-check.mjs builds on the same function and adds 9 more checks: the evidence block, unfilled slots, where a post was derived from, and the LinkedIn fold and hashtag rules. All of them are specific to this repo's own files and mean nothing on a pasted paragraph, so they are left out here on purpose, not by accident.",
    "A flag is an editing note, not proof of who wrote the text. It means the draft has a habit this site's own writing rules ban.",
  ],
  formulas: [
    { label: "Score", expr: "100 − 10 × failed checks − 4 × warnings" },
    { label: "Concrete details per 100 words", expr: "specifics ÷ words × 100" },
  ],
  buildNote:
    "No model call. It is the literal function the posting dashboard and the CI gate both import, not a reimplementation, so a score here matches what either of them would say about the same text. It runs a narrower set of checks than the full CI gate: the evidence block, unfilled-slot, provenance, and LinkedIn fold/hashtag checks are specific to this repo's frontmatter and are left out, since they mean nothing on a pasted paragraph.",
};

const EXAMPLES = [
  {
    id: "slop",
    name: "Generic AI-tools post (fails almost everything)",
    label: "A generic AI post",
    note: "A generic AI-tools post that fails almost everything.",
    kind: "post",
    text: `In today's fast-paced world of AI tooling, prompt engineering is not just a skill, it's a superpower.

Teams that leverage the power of large language models can seamlessly transform their workflow into a well-oiled machine — the results might be a total game changer. Arguably, the biggest unlock is that AI could help you move faster, though results vary from team to team.

At the end of the day, the tools you choose will shape your ability to compete in an ever-evolving landscape. This isn't just about productivity, it's about staying relevant.

Thoughts? Let me know in the comments below, and don't forget to save this post for later!`,
  },
  {
    id: "tightened",
    name: "Same claim, tightened (mostly passes)",
    label: "The same claim, tightened",
    note: "The same claim, tightened. It mostly passes.",
    kind: "post",
    text: `Claude Code cut my PR review time from 40 minutes to 9, a 78% drop, measured with a stopwatch across 12 pull requests.

The catch: 3 of the 12 still needed a full manual rewrite, and averaging those in erases most of the gain. Track the rework rate before you announce the number, not after.

Takeaway: an AI workflow's real speedup is the average including the times it failed, not the average of the times it worked.`,
  },
  {
    id: "real",
    name: "Opening of a published essay on this site",
    label: "A published essay opening",
    note: "The opening of a published essay on this site, “The metric is the alibi” (/agents/10-the-metric-is-the-alibi).",
    kind: "post",
    text: `Cost per filled share: $0.042. Then I broke the program, and it was $0.042 again.

Farm Lab is a deterministic simulator of a liquidity rewards program, built on Polymarket's published scoring rule. Feed it a daily pool, a cohort of honest market makers, a cohort of reward farmers, and a rate at which farmers cancel before they fill, and it tells you exactly where the pool went.

Takeaway: an average cannot tell a farmed program from a healthy one when both fill the same volume. Split the metric by cohort before you trust it.`,
    attribution: "First three paragraphs of “The metric is the alibi,” /agents/10-the-metric-is-the-alibi",
  },
];

/* ------------------------------------------------------------------- view */

// Plain-words copy for the 12 checks, by id. `ok` is what a pass says, `title`
// names the problem when a check does not pass, and `short` is the phrase used
// in the overall sentence.
const PLAIN = {
  dashes: { ok: "No em dashes", title: "Em dashes", short: "em dashes" },
  takeaway: { ok: "Ends with a takeaway line", title: "No takeaway line at the end", short: "no takeaway line" },
  tells: { ok: "No stock AI phrases", title: "Stock AI phrases", short: "stock AI phrases" },
  notjust: { ok: "No “not just X, but Y”", title: "A “not just X, but Y” construction", short: "“not just X, but Y”" },
  bait: { ok: "No engagement bait", title: "Engagement bait", short: "engagement bait" },
  hook: { ok: "The opening line lands", title: "A weak opening line", short: "a weak opening" },
  density: { ok: "Plenty of concrete details", title: "Too few concrete details", short: "too few concrete details" },
  receipts: { ok: "Something a reader can check", title: "Nothing a reader can check", short: "nothing checkable" },
  sourcing: { ok: "Sources are named", title: "Vague sourcing", short: "vague sourcing" },
  rhythm: { ok: "Sentence lengths vary", title: "Sentences are too even", short: "even sentence lengths" },
  hedges: { ok: "Little hedging", title: "Too much hedging", short: "heavy hedging" },
  length: { ok: "Length is in range", title: "Length is out of range", short: "the length" },
};

const plain = (c) => PLAIN[c.id] || { ok: c.label, title: c.label, short: c.label.toLowerCase() };

const TICK =
  '<svg class="kit-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="8.2"/><path d="M6.2 10.4l2.6 2.6 5-5.4"/></svg>';

const plural = (n, one, many = `${one}s`) => (n === 1 ? one : many);
const sentence = (s) => {
  const t = String(s).trim();
  return t ? `${t[0].toUpperCase()}${t.slice(1)}${/[.!?…]$/.test(t) ? "" : "."}` : "";
};
const thousands = (n) => Number(n).toLocaleString("en-US");
const grab = (re, s) => (re.exec(s) || [])[1] ?? null;
// The analyzer lists phrases as "a, b, c", sometimes followed by a sentence of advice.
const phrases = (s) =>
  s
    .split(/\.\s/)[0]
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/** "a, b and c" */
const joinNames = (names) =>
  names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0] || "";

/**
 * For a check that did not pass: what was found, in plain words, any phrases to
 * show as chips, and what to do. Numbers come from the analyzer's own stats and
 * detail text; the wording around them is ours.
 */
function explain(c, r, kind) {
  const d = c.detail;
  const s = r.stats;
  const format = kind === "article" ? "An essay" : "A post";
  switch (c.id) {
    case "dashes": {
      const n = Number(grab(/^(\d+) found/, d));
      return {
        found: n ? `${n} ${plural(n, "em dash", "em dashes")} in the draft.` : sentence(d),
        tip: "Replace each one with a period or a comma.",
      };
    }
    case "takeaway":
      return {
        found: "The draft does not end with a “Takeaway:” line.",
        tip: "Close with one line that starts “Takeaway:” and states the point.",
      };
    case "tells":
      return { found: "Stock phrases this site bans:", chips: phrases(d), tip: "Cut them, or say the plain thing." };
    case "notjust":
      return { found: "The draft leans on a “not just X, but Y” construction.", tip: "State the claim directly." };
    case "bait":
      return { found: "It asks for engagement:", chips: phrases(d), tip: "Cut the ask for likes, saves or comments." };
    case "hook": {
      if (/banned opener/.test(d)) {
        return { found: "The first line opens with a phrase this site bans.", tip: "Open on a claim, a number or a name." };
      }
      const n = grab(/^(\d+) words/, d);
      return {
        found: n ? `The first sentence runs ${n} words, with no number or name in it.` : sentence(d),
        tip: "Shorten it, or anchor it with a number or a name.",
      };
    }
    case "density": {
      const need = grab(/need ([\d.]+)/, d);
      return {
        found: `${s.specifics} concrete ${plural(s.specifics, "detail")} in ${s.wc} words, or ${s.density.toFixed(1)} per 100.${need ? ` ${format} needs ${need}.` : ""}`,
        tip: "Back each claim with a number, a date, a name or a product.",
      };
    }
    case "receipts":
      return {
        found: "Nothing a reader could check, and nothing you admit went wrong.",
        tip: "Add a figure with its date, a link to something that runs, or a mistake you made.",
      };
    case "sourcing":
      return { found: "Vague sourcing:", chips: phrases(d), tip: "Name the source and link it, or cut the claim." };
    case "rhythm":
      return { found: "Sentence lengths are too even.", tip: "Add a short sentence. Then a long, specific one." };
    case "hedges": {
      const list = grab(/\(([^)]*)\)/, d);
      return {
        found: `Hedge words make up ${s.hedgeRate.toFixed(1)}% of the draft.`,
        chips: list ? phrases(list) : [],
        tip: "Cut the hedges, or commit to the claim.",
      };
    }
    case "length": {
      const lo = grab(/target (\d+) to/, d);
      const hi = grab(/to (\d+)\)/, d);
      if (!lo || !hi) return { found: sentence(d), tip: "" };
      return {
        found: `${s.wc} words, and ${format.toLowerCase()} wants ${thousands(lo)} to ${thousands(hi)}.`,
        tip: s.wc < Number(lo) ? `Build it out to at least ${thousands(lo)} words.` : `Trim it to ${thousands(hi)} words or fewer.`,
      };
    }
    default:
      return { found: sentence(d), tip: "" };
  }
}

function flagHtml(c, r, kind) {
  const e = explain(c, r, kind);
  const failed = c.status === "fail";
  const chips = e.chips?.length ? `<ul class="dc-chips">${e.chips.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
  return `
    <li class="kit-card dc-flag">
      <div class="dc-flag-top">${status(failed ? "bad" : "warn", failed ? "Needs fixing" : "Worth a look")}</div>
      <h3 class="dc-flag-title">${esc(plain(c).title)}</h3>
      <p class="dc-found">${esc(e.found)}</p>
      ${chips}
      ${e.tip ? `<div class="dc-tip"><p class="dc-tip-label">Try this</p><p>${esc(e.tip)}</p></div>` : ""}
    </li>`;
}

function resultFor(r) {
  if (r.fails > 0) return { tone: "bad", label: "Would not pass the gate" };
  if (r.warns > 0) return { tone: "warn", label: "Passes, with warnings" };
  return { tone: "good", label: "Clean pass" };
}

/** The live sentence under the hero number, from which checks failed. */
function verdictFor(r, failed, warned) {
  if (!failed.length && !warned.length) {
    return `All ${hl(String(r.checks.length))} checks passed. By this site's rules, it reads like a person wrote it.`;
  }
  const names = (list) => joinNames(list.slice(0, 3).map((c) => plain(c).short));
  if (failed.length) {
    const head = `${hl(`${failed.length} ${plural(failed.length, "check")} failed`)}${
      warned.length ? ` and ${hl(`${warned.length} raised ${plural(warned.length, "a warning", "warnings")}`)}` : ""
    }.`;
    const lead = failed.length > 3 ? "The failures include" : failed.length === 1 ? "The failure is" : "The failures are";
    return `${head} ${lead} ${esc(names(failed))}.`;
  }
  return `It clears every hard check, with ${hl(`${warned.length} ${plural(warned.length, "warning")}`)}: ${esc(names(warned))}.`;
}

/** The detail behind the verdict: the raw measures, and every check as the analyzer words it. */
function rawHtml(r, kind) {
  const s = r.stats;
  const measures = table(
    ["Measure", "Value"],
    [
      ["Score", `${r.score} out of 100`],
      ["Words", String(s.wc)],
      ["Concrete details found", String(s.specifics)],
      ["Concrete details per 100 words", s.density.toFixed(1)],
      ["Sentence length variation (standard deviation)", s.sd.toFixed(1)],
      ["Hedge words, share of the draft", `${s.hedgeRate.toFixed(1)}%`],
    ],
    { numeric: [1] }
  );
  const checks = table(
    ["Check", "Result", "Raw detail"],
    r.checks.map((c) => [c.label, c.status, c.detail])
  );
  return (
    card({ title: "Raw scores", body: measures }) +
    card({
      title: `All ${r.checks.length} checks, scored as ${kind === "article" ? "an essay" : "a LinkedIn post"}`,
      body: `<div class="dc-raw">${checks}</div>`,
    })
  );
}

function reportText(r, kind) {
  return [
    `Draft Check: ${r.score}/100 (${kind === "article" ? "essay" : "post"})`,
    ...r.checks.filter((c) => c.status !== "pass").map((c) => `[${c.status}] ${c.label}: ${c.detail}`),
  ].join("\n");
}

export function mount(root) {
  root.innerHTML = `
    <div class="dc">
      <div data-slot="bar"></div>
      <div class="kit-grid kit-grid-split">
        <section class="kit-panel dc-input" aria-label="Your draft">
          <div class="dc-field">
            <label class="kit-label" for="dc-src">Your draft</label>
            <textarea id="dc-src" class="kit-textarea dc-textarea" spellcheck="false" aria-describedby="dc-count"
              placeholder="Paste a LinkedIn post, an essay draft, or any AI-flavored paragraph."></textarea>
            <p class="kit-help dc-count" id="dc-count"></p>
          </div>
          <div class="kit-field">
            <label class="kit-toggle" for="dc-essay">
              <input type="checkbox" role="switch" id="dc-essay" aria-describedby="dc-essay-help" />
              <span class="kit-toggle-track" aria-hidden="true"></span>
              <span class="kit-label">Judge it as an essay</span>
            </label>
            <p class="kit-help" id="dc-essay-help">Off, it is judged as a LinkedIn post (150 to 350 words). On, as an essay (900 to 2,200 words).</p>
          </div>
          <div class="kit-actions">
            <button type="button" class="kit-text-btn" data-act="copy">Copy report</button>
            <button type="button" class="kit-text-btn" data-act="clear">Clear</button>
          </div>
        </section>
        <div class="kit-stage">
          <div data-slot="answer"></div>
          <div data-slot="empty" hidden>${card({ title: "Nothing to check yet", body: "<p>Paste a draft, or pick a sample above.</p>" })}</div>
          <div class="dc-results" data-slot="results"></div>
        </div>
      </div>
      ${disclosure({ summary: "See the raw scores", className: "kit-breakdown" })}
      <p class="dc-sr" role="status" data-slot="status"></p>
    </div>`;

  const $ = (sel) => root.querySelector(sel);
  const src = $("#dc-src");
  const essayBox = $("#dc-essay");
  const countEl = $("#dc-count");
  const emptyEl = $('[data-slot="empty"]');
  const resultsEl = $('[data-slot="results"]');
  const statusEl = $('[data-slot="status"]');
  const breakdown = $(".kit-breakdown");
  const breakdownBody = breakdown.querySelector(".kit-disclosure-body");
  const kindOf = () => (essayBox.checked ? "article" : "post");

  const answer = answerCard();
  $('[data-slot="answer"]').replaceWith(answer.el);

  const bar = scenarioBar({
    items: EXAMPLES.map((e) => ({ id: e.id, label: e.label, note: e.note })),
    label: "Sample draft",
    onSelect: (id) => load(id),
  });
  $('[data-slot="bar"]').replaceWith(bar.el);
  const noteEl = bar.el.querySelector(".kit-scenarios-note");

  let edited = false; // the reader has changed the text

  function render({ animate = false } = {}) {
    const empty = !src.value.trim();
    answer.el.hidden = empty;
    resultsEl.hidden = empty;
    emptyEl.hidden = !empty;
    breakdown.hidden = empty;
    countEl.textContent = "";
    if (empty) return;

    const kind = kindOf();
    const r = analyze(src.value, kind);
    const failed = r.checks.filter((c) => c.status === "fail");
    const warned = r.checks.filter((c) => c.status === "warn");
    const passed = r.checks.filter((c) => c.status === "pass");
    const flagged = failed.length + warned.length;
    const result = resultFor(r);
    countEl.textContent = `${r.stats.wc} ${plural(r.stats.wc, "word")}`;

    answer.update(
      {
        label: "Overall result",
        value: flagged,
        format: (v) => String(Math.round(v)),
        unit: `of ${r.checks.length} checks flagged`,
        tone: result.tone,
        status: result.label,
        verdict: verdictFor(r, failed, warned),
        stats: [
          { label: "Failed", value: String(failed.length), sub: "Fix these first" },
          { label: "Warnings", value: String(warned.length), sub: "Worth a look" },
          { label: "Passed", value: String(passed.length), sub: `of ${r.checks.length}` },
        ],
      },
      { animate }
    );

    resultsEl.innerHTML = `
      ${
        flagged
          ? `<section class="dc-flags" aria-labelledby="dc-flags-h">
               <div class="kit-section-head"><h2 id="dc-flags-h">What to change</h2><p>Failures first, each with a way to fix it.</p></div>
               <ol class="dc-list">${[...failed, ...warned].map((c) => flagHtml(c, r, kind)).join("")}</ol>
             </section>`
          : ""
      }
      ${
        passed.length
          ? `<section class="kit-card kit-block dc-pass" aria-labelledby="dc-pass-h">
               <h2 class="kit-block-title" id="dc-pass-h">What already works</h2>
               <ul class="dc-pass-list">${passed.map((c) => `<li>${TICK}<span>${esc(plain(c).ok)}</span></li>`).join("")}</ul>
             </section>`
          : ""
      }`;

    breakdownBody.innerHTML = rawHtml(r, kind);
  }

  function load(id) {
    const ex = EXAMPLES.find((x) => x.id === id);
    if (!ex) return;
    edited = false;
    src.value = ex.text;
    essayBox.checked = ex.kind === "article";
    bar.select(ex.id);
    render({ animate: true });
  }

  $('[data-act="clear"]').addEventListener("click", () => {
    src.value = "";
    edited = true;
    bar.select(null);
    noteEl.textContent = "Paste a draft, or pick a sample above.";
    render();
    src.focus();
  });

  const copyBtn = $('[data-act="copy"]');
  copyBtn.addEventListener("click", async () => {
    let message = "Copied";
    try {
      await navigator.clipboard.writeText(reportText(analyze(src.value, kindOf()), kindOf()));
    } catch {
      message = "Copy blocked";
    }
    copyBtn.textContent = message;
    statusEl.textContent = message === "Copied" ? "Report copied to the clipboard." : "The browser blocked copying.";
    setTimeout(() => {
      copyBtn.textContent = "Copy report";
      statusEl.textContent = "";
    }, 1400);
  });

  src.addEventListener("input", () => {
    if (!edited) {
      edited = true;
      bar.select(null);
      noteEl.textContent = "Your own draft. Pick a sample above to start over.";
    }
    render();
  });

  essayBox.addEventListener("change", () => render());

  load(EXAMPLES[0].id);
}
