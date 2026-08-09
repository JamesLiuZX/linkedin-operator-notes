// site/src/demos/slop-gate.js
//
// Paste anything. This runs the same specificity, rhythm, hook, sourcing, and
// tell-detection checks the posting dashboard runs on every draft in this
// repo (scripts/lib/analyze.mjs), on whatever text you give it.
//
// Scoped honestly: it is not the full CI gate. scripts/content-check.mjs
// builds on the same shared function and adds 9 more checks, the evidence
// block, unfilled slots, derivedFrom provenance, and the LinkedIn fold and
// hashtag checks, all specific to this repo's own frontmatter and publishing
// conventions. None of those mean anything on a paragraph with no
// frontmatter, so they are left out here on purpose, not by accident: see
// articles/15-a-checklist-not-a-model.md for the pass where "on purpose" and
// "by accident" briefly stopped being distinguishable.

import { analyze } from "@lib/analyze.mjs";
import { statRow, esc, tableView } from "../viz/charts.js";

export const meta = {
  slug: "slop-gate",
  title: "Slop Gate",
  tagline: "Paste a draft. Run the same checklist this site runs on its own drafts.",
  section: "agents",
  pillar: "AI & agents",
  essay: "15-a-checklist-not-a-model",
  blurb:
    "The dashboard's own analyzer (scripts/lib/analyze.mjs), pointed at whatever you paste instead of this repo's drafts. 12 checks: em dashes, LLM tells, hedge words, engagement bait, hook strength, specificity density, named sourcing, and receipts.",
  buildNote:
    "No model call. It is the literal function the posting dashboard and the CI gate both import, not a reimplementation, so a score here matches what either of them would say about the same text. It runs a narrower set of checks than the full CI gate: the evidence block, unfilled-slot, provenance, and LinkedIn fold/hashtag checks are specific to this repo's frontmatter and are left out, since they mean nothing on a pasted paragraph.",
};

const EXAMPLES = [
  {
    id: "slop",
    name: "Generic AI-tools post (fails almost everything)",
    kind: "post",
    text: `In today's fast-paced world of AI tooling, prompt engineering is not just a skill, it's a superpower.

Teams that leverage the power of large language models can seamlessly transform their workflow into a well-oiled machine — the results might be a total game changer. Arguably, the biggest unlock is that AI could help you move faster, though results vary from team to team.

At the end of the day, the tools you choose will shape your ability to compete in an ever-evolving landscape. This isn't just about productivity, it's about staying relevant.

Thoughts? Let me know in the comments below, and don't forget to save this post for later!`,
  },
  {
    id: "tightened",
    name: "Same claim, tightened (mostly passes)",
    kind: "post",
    text: `Claude Code cut my PR review time from 40 minutes to 9, a 78% drop, measured with a stopwatch across 12 pull requests.

The catch: 3 of the 12 still needed a full manual rewrite, and averaging those in erases most of the gain. Track the rework rate before you announce the number, not after.

Takeaway: an AI workflow's real speedup is the average including the times it failed, not the average of the times it worked.`,
  },
  {
    id: "real",
    name: "Opening of a published essay on this site",
    kind: "post",
    text: `Cost per filled share: $0.042. Then I broke the program, and it was $0.042 again.

Farm Lab is a deterministic simulator of a liquidity rewards program, built on Polymarket's published scoring rule. Feed it a daily pool, a cohort of honest market makers, a cohort of reward farmers, and a rate at which farmers cancel before they fill, and it tells you exactly where the pool went.

Takeaway: an average cannot tell a farmed program from a healthy one when both fill the same volume. Split the metric by cohort before you trust it.`,
    attribution: "First three paragraphs of “The metric is the alibi,” /agents/10-the-metric-is-the-alibi",
  },
];

function verdictFor(r) {
  if (r.fails > 0) return { label: "Would not pass CI", tone: "critical" };
  if (r.warns > 0) return { label: "Passes, with warnings", tone: "warning" };
  return { label: "Clean pass", tone: "good" };
}

const SEV_ICON = { blocker: "!!", minor: "." };

export function mount(root) {
  root.innerHTML = `
    <div class="demo-grid linter">
      <section class="demo-input">
        <div class="field-head">
          <label for="sg-src">Text to check</label>
          <select id="sg-example" class="mono">
            <option value="">Load an example...</option>
            ${EXAMPLES.map((e) => `<option value="${e.id}">${esc(e.name)}</option>`).join("")}
          </select>
        </div>
        <textarea id="sg-src" spellcheck="false" placeholder="Paste a LinkedIn post, an essay draft, or any AI-flavored paragraph."></textarea>
        <div id="sg-attr" class="receipt" hidden></div>
        <label class="control check">
          <input type="checkbox" id="sg-kind" />
          <span>Score as an essay (900-2200 words) instead of a post (150-350)</span>
        </label>
        <div class="row-actions">
          <button id="sg-clear" class="btn-ghost">Clear</button>
          <button id="sg-copy" class="btn-ghost">Copy report</button>
        </div>
      </section>
      <section class="demo-output" id="sg-out"></section>
    </div>`;

  const src = root.querySelector("#sg-src");
  const out = root.querySelector("#sg-out");
  const attr = root.querySelector("#sg-attr");
  const kindBox = root.querySelector("#sg-kind");

  const render = () => {
    const kind = kindBox.checked ? "article" : "post";
    const text = src.value;
    if (!text.trim()) {
      out.innerHTML = `<p class="note">Paste something on the left, or load one of the three examples.</p>`;
      return;
    }
    const r = analyze(text, kind);
    const verdict = verdictFor(r);
    const notPass = r.checks.filter((c) => c.status !== "pass");

    out.innerHTML = `
      <div class="verdict tone-${verdict.tone}">
        <span class="verdict-badge">${esc(verdict.label)}</span>
        <span class="verdict-score mono">${r.score}<small>/100</small></span>
      </div>
      ${statRow([
        { label: "Specificity density", value: r.stats.density.toFixed(1), sub: "per 100 words, want 5.0+ (post) / 6.0+ (essay)", tone: r.stats.density >= (kind === "article" ? 6 : 5) ? "good" : "critical" },
        { label: "Word count", value: String(r.stats.wc), sub: kind === "article" ? "target 900-2200" : "target 150-350" },
        { label: "Specifics found", value: String(r.stats.specifics), sub: "numbers, dates, named things" },
        { label: "Sentence variance", value: r.stats.sd.toFixed(1), sub: "stdev, want 5.5+" },
      ])}
      ${
        notPass.length
          ? `<ol class="findings">${notPass
              .map((c) => {
                const sev = c.status === "fail" ? "blocker" : "minor";
                return `
          <li class="finding sev-${sev}">
            <div class="finding-head">
              <span class="sev-tag mono" aria-label="${sev}">${SEV_ICON[sev]}</span>
              <strong>${esc(c.label)}</strong>
              <span class="sev-word mono">${esc(c.status)}</span>
            </div>
            <p class="finding-why">${esc(c.detail)}</p>
          </li>`;
              })
              .join("")}</ol>`
          : `<p class="clean-note">No findings. Every check that runs on this site's own drafts passes on this text too.</p>`
      }
      ${tableView(
        ["Check", "Status", "Detail"],
        r.checks.map((c) => [c.label, c.status, c.detail]),
        { caption: `All ${r.checks.length} checks, scored as ${kind === "article" ? "an essay" : "a LinkedIn post"}` }
      )}`;
  };

  root.querySelector("#sg-example").addEventListener("change", (e) => {
    const ex = EXAMPLES.find((x) => x.id === e.target.value);
    if (ex) {
      src.value = ex.text;
      kindBox.checked = ex.kind === "article";
      if (ex.attribution) {
        attr.textContent = ex.attribution;
        attr.hidden = false;
      } else {
        attr.hidden = true;
      }
    } else {
      attr.hidden = true;
    }
    render();
  });

  root.querySelector("#sg-clear").addEventListener("click", () => {
    src.value = "";
    attr.hidden = true;
    root.querySelector("#sg-example").value = "";
    render();
  });

  root.querySelector("#sg-copy").addEventListener("click", async (e) => {
    const kind = kindBox.checked ? "article" : "post";
    const r = analyze(src.value, kind);
    const lines = [
      `Slop Gate: ${r.score}/100 (${kind})`,
      ...r.checks.filter((c) => c.status !== "pass").map((c) => `[${c.status}] ${c.label}: ${c.detail}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      e.target.textContent = "Copied";
      setTimeout(() => (e.target.textContent = "Copy report"), 1400);
    } catch {
      e.target.textContent = "Copy blocked";
      setTimeout(() => (e.target.textContent = "Copy report"), 1400);
    }
  });

  kindBox.addEventListener("change", render);
  src.addEventListener("input", render);
  render();
}
