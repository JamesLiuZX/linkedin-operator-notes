// hub/lib/catches.mjs
//
// "What the checks caught": three things the skills' own checks stopped
// during the test runs on this site. Every word and number here is read from
// the example files, so the section stays true when an example is re-run.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { screenSvg } from "../src/js/artifacts/screen.js";
import { esc, ICON } from "./html.mjs";

const read = (root, ...parts) => {
  const file = join(root, "skills", ...parts);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
};

const num = (n) => Number(n).toLocaleString("en-US");

/** Every string inside a schematic screen, in reading order. */
function strings(node, out = []) {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((x) => strings(x, out));
  else if (node && typeof node === "object") Object.values(node).forEach((x) => strings(x, out));
  return out;
}

function quoteCatch(ctx, root) {
  const d = read(root, "interview-synthesis", "examples", "larkspur", "synthesis.json");
  const hit = d?.rejected?.[0];
  if (!hit) return "";
  return `
  <article class="catch rise" data-wf="interview-synthesis">
    <figure class="catch-fig cq" aria-hidden="true">
      <div class="cq-card">
        <small>The request asked for this quote</small>
        <blockquote><span>${esc(hit.text)}</span></blockquote>
        <b class="stampmark bad">Not in any transcript</b>
      </div>
      <div class="cq-log"><code>verify_quotes.py</code><span><b>${num(d.checked.found)}</b> found</span><span class="is-bad"><b>${num(d.checked.rejected)}</b> removed</span></div>
    </figure>
    <div class="catch-copy">
      <span class="label">Interview synthesis · B2B SaaS case</span>
      <h3>The quote nobody said</h3>
      <p>The team remembered a line from the calls and asked for it. A script searched all ${num(d.checked.participants)} transcripts, found it in none of them, and took it out.</p>
      <a class="arrow-link" href="${ctx.url("/examples/larkspur/interview-synthesis.html")}" target="_blank" rel="noopener">Open the synthesis ${ICON.arrowUpRight}</a>
    </div>
  </article>`;
}

function splitCatch(ctx, root) {
  const d = read(root, "experiment-readout", "examples", "vireo", "readout.numbers.json");
  if (!d || d.verdict?.decision !== "do-not-trust") return "";
  const [a, b] = d.input.arms;
  const points = (d.primary.diff * 100).toFixed(1);
  // One significant figure is all the claim needs: "about 1 in 10,000,...".
  const odds = d.checks.srm.p > 0 ? Number((1 / d.checks.srm.p).toPrecision(1)) : 0;
  const oddsText = odds ? BigInt(Math.round(odds)).toLocaleString("en-US") : "";
  const total = a.users + b.users;
  return `
  <article class="catch rise" style="--i:1" data-wf="experiment-readout">
    <figure class="catch-fig cs" aria-hidden="true">
      <div class="cs-big"><b>${d.primary.diff >= 0 ? "+" : "−"}${esc(points.replace("-", ""))}</b><span>points on the main metric</span><b class="stampmark bad">Do not trust</b></div>
      <div class="cs-split">
        <span style="flex-grow:${a.users}"><b>${num(a.users)}</b><small>${esc(a.name.replace(/\s*\(.*\)$/, ""))}</small></span>
        <span style="flex-grow:${b.users}"><b>${num(b.users)}</b><small>${esc(b.name)}</small></span>
        <i style="left:${((d.checks.srm.expected[0] / total) * 100).toFixed(2)}%"><em>the planned split</em></i>
      </div>
    </figure>
    <div class="catch-copy">
      <span class="label">Experiment readout · AI product case</span>
      <h3>The win that could not be read</h3>
      <p>The result looked like a clear win. The script checks the split before it reads the result, and this one was planned even.${oddsText ? ` The odds of a gap this size by chance are about 1 in ${oddsText}.` : ""} It stopped there.</p>
      <a class="arrow-link" href="${ctx.url("/examples/vireo/experiment-readout.html")}" target="_blank" rel="noopener">Open the readout ${ICON.arrowUpRight}</a>
    </div>
  </article>`;
}

function clashCatch(ctx, root) {
  const d = read(root, "journey-teardown", "examples", "larkspur", "teardown.json");
  if (!d) return "";
  const lanes = d.stages.map((s) => s.lanes.find((l) => l.app === d.us)).filter(Boolean);
  const accent = d.apps.find((x) => x.id === d.us)?.accent;
  const find = (re) => {
    for (const lane of lanes)
      for (const screen of lane.screens || []) {
        const text = strings(screen.blocks).find((s) => re.test(s));
        if (text) return { screen, text };
      }
    return null;
  };
  const a = find(/no card/i);
  const b = find(/billing today/i);
  if (!a || !b) return "";
  const draw = (hit, id) => screenSvg({ ...hit.screen, accent }, { idPrefix: id });
  return `
  <article class="catch rise" style="--i:2" data-wf="journey-teardown">
    <figure class="catch-fig cc" aria-hidden="true">
      <div class="cc-shot"><div class="cc-pic">${draw(a, "cc-a")}</div><p>${esc(a.text)}</p></div>
      <b class="cc-ne">≠</b>
      <div class="cc-shot"><div class="cc-pic">${draw(b, "cc-b")}</div><p>${esc(b.text)}</p></div>
    </figure>
    <div class="catch-copy">
      <span class="label">Journey teardown · B2B SaaS case</span>
      <h3>Two screens that disagree</h3>
      <p>The teardown reads every screen of your own product by the same rubric as the competitors. Here the sign-up page and the invite dialog make opposite promises about when billing starts.</p>
      <a class="arrow-link" href="${ctx.url("/examples/larkspur/journey-teardown.html")}" target="_blank" rel="noopener">Open the teardown ${ICON.arrowUpRight}</a>
    </div>
  </article>`;
}

export function catches(ctx, root) {
  return [clashCatch(ctx, root), quoteCatch(ctx, root), splitCatch(ctx, root)].filter(Boolean).join("");
}
