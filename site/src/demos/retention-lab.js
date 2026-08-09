// site/src/demos/retention-lab.js
//
// What a hook style, captions, and pacing do to a short-form video's
// retention curve, benchmarked against Meta's and TikTok's published hook
// rate bands (see research/SOURCES.md). The two platforms measure different
// windows (3 seconds on Meta, 2 on TikTok), which is the thing this demo
// exists to make visible: a hook rate is not comparable across platforms
// unless you already know that.

import { statRow, lineChart, meter, fmt, esc, tableView } from "../viz/charts.js";
import { PLATFORMS, HOOK_STYLES, DEFAULTS, simulate } from "@lib/retention.mjs";

export const meta = {
  slug: "retention-lab",
  title: "Retention Curve Lab",
  tagline: "Set a hook style, captions, and pacing. Watch where the viewers actually go.",
  section: "media",
  pillar: "Gen media",
  essay: "12-the-hook-rate-is-not-one-number",
  blurb:
    "A retention-curve simulator for short-form video, benchmarked against Meta's and TikTok's published hook-rate bands. The two platforms measure different windows, which is most of the reason 'our hook rate' numbers from two campaigns are rarely the same thing.",
  buildNote:
    "Closed-form, not Monte Carlo: a concave approach to the hook rate across the platform's window, then exponential decay after it. The benchmark bands are Hawky.ai's published numbers. The hook-style and pacing deltas are a model calibrated to land inside those bands at default settings, not measurements from a real campaign.",
};

function bandTone(label) {
  if (/^under|^below/.test(label)) return "critical";
  if (/elite|top quartile/.test(label)) return "good";
  return "warning";
}

export function mount(root) {
  const p = { ...DEFAULTS };

  root.innerHTML = `
    <div class="demo-grid lab">
      <section class="demo-input">
        <label class="restyle-field">
          <span>Platform</span>
          <select id="rl-platform">${PLATFORMS.map(
            (pl) => `<option value="${pl.id}" ${pl.id === p.platformId ? "selected" : ""}>${esc(pl.name)}</option>`
          ).join("")}</select>
        </label>

        <label class="restyle-field">
          <span>Hook style</span>
          <select id="rl-style">${HOOK_STYLES.map(
            (s) => `<option value="${s.id}" ${s.id === p.styleId ? "selected" : ""}>${esc(s.name)}</option>`
          ).join("")}</select>
        </label>
        <p class="restyle-style-blurb mono" id="rl-style-blurb"></p>

        <div class="controls">
          <label class="control" for="rl-pacing">
            <span class="control-label">Pacing (cuts per 10s)<b class="mono" id="rl-pacing-v"></b></span>
            <input type="range" id="rl-pacing" min="1" max="10" step="1" value="${p.pacing}" />
          </label>
          <label class="control" for="rl-length">
            <span class="control-label">Video length<b class="mono" id="rl-length-v"></b></span>
            <input type="range" id="rl-length" min="6" max="90" step="1" value="${p.lengthSec}" />
          </label>
          <label class="control check">
            <input type="checkbox" id="rl-captions" ${p.captions ? "checked" : ""} />
            <span>Burned-in captions / on-screen text throughout</span>
          </label>
        </div>

        <div class="row-actions">
          <button id="rl-reset" class="btn-ghost">Reset</button>
          <button id="rl-weak" class="btn-ghost">Load a weak opener</button>
          <button id="rl-strong" class="btn-ghost">Load a cold open</button>
        </div>
        <p class="model-note">The bands are Hawky.ai's published numbers. The hook-style and pacing deltas are a model, calibrated to land inside those bands at default settings, not measured off a real campaign.</p>
      </section>
      <section class="demo-output" id="rl-out"></section>
    </div>`;

  const out = root.querySelector("#rl-out");
  const styleBlurb = root.querySelector("#rl-style-blurb");
  const els = {
    platform: root.querySelector("#rl-platform"),
    style: root.querySelector("#rl-style"),
    pacing: root.querySelector("#rl-pacing"),
    length: root.querySelector("#rl-length"),
    captions: root.querySelector("#rl-captions"),
  };

  const render = () => {
    const r = simulate(p);
    const tone = bandTone(r.band.label);
    const impressions = 10000;
    const atHook = Math.round((impressions * r.hookPct) / 100);
    const lostByHook = impressions - atHook;
    const atEnd = Math.round((impressions * r.completionPct) / 100);

    styleBlurb.textContent = `${r.style.name} — ${r.style.blurb}`;

    out.innerHTML = `
      ${statRow([
        { label: `Hook rate at ${r.platform.window}s`, value: fmt.pct(r.hookPct / 100, 1), sub: r.platform.metric, tone },
        { label: "Band", value: r.band.label, sub: `${r.platform.name} benchmark`, tone },
        { label: "Retention at midpoint", value: fmt.pct(r.midPct / 100, 1), sub: `of ${fmt.int(p.lengthSec / 2)}s` },
        { label: "Completion rate", value: fmt.pct(r.completionPct / 100, 1), sub: `at ${fmt.int(p.lengthSec)}s` },
      ])}

      ${meter({
        label: "Viewers who never cross the hook window",
        value: lostByHook,
        max: impressions,
        display: `${fmt.int(lostByHook)} of ${fmt.int(impressions)}`,
        tone: lostByHook > impressions * 0.75 ? "critical" : lostByHook > impressions * 0.65 ? "warning" : "",
      })}

      <div class="chart-block">
        <h4>Retention curve</h4>
        ${lineChart([{ label: `${r.platform.name}, ${r.style.name}`, points: r.points }], {
          xLabel: "seconds",
          xFormat: (v) => `${v.toFixed(0)}s`,
          yFormat: (v) => `${v.toFixed(0)}%`,
          yDomain: [0, 100],
          guide: { y: r.platform.bands.find((b) => b.label === "solid" || b.label === "baseline")?.max ?? 30, label: `${r.platform.name.split(" ")[0]} solid/baseline floor` },
        })}
        <p class="chart-note">The window ends at ${r.platform.window}s on ${r.platform.name.split(" ")[0]}. Everything left of it is the hook. Everything right of it is pacing's job, not the hook's.</p>
      </div>

      <div class="takeaway-box">
        <strong>Per 10,000 impressions, at these settings:</strong>
        <p><b class="mono">${fmt.int(lostByHook)}</b> viewers are gone before the hook window closes. <b class="mono">${fmt.int(atHook)}</b> make it past. By <b class="mono">${fmt.int(p.lengthSec)}s</b>, <b class="mono">${fmt.int(atEnd)}</b> are still watching, which is <b class="mono">${fmt.pct(r.completionPct / 100, 1)}</b> of the original impressions.</p>
        <p>If the call to action sits after the midpoint, it reaches <b class="mono">${fmt.int((impressions * r.midPct) / 100)}</b> people, not the ${fmt.int(impressions)} the impression count advertises.</p>
      </div>

      ${tableView(
        ["Platform", "Window", "Below floor", "Solid / baseline", "Rising", "Top tier"],
        PLATFORMS.map((pl) => [
          pl.name,
          `${pl.window}s`,
          `< ${pl.bands[0].max}%`,
          `${pl.bands[0].max}-${pl.bands[1].max}%`,
          `${pl.bands[1].max}-${pl.bands[2].max}%`,
          `${pl.bands[2].max}%+`,
        ]),
        { caption: "Published hook-rate bands by platform (Hawky.ai)" }
      )}`;
  };

  const syncLabels = () => {
    els.platform.value = p.platformId;
    els.style.value = p.styleId;
    els.captions.checked = p.captions;
    els.pacing.value = p.pacing;
    els.length.value = p.lengthSec;
    root.querySelector("#rl-pacing-v").textContent = String(p.pacing);
    root.querySelector("#rl-length-v").textContent = `${p.lengthSec}s`;
  };

  els.platform.addEventListener("change", (e) => {
    p.platformId = e.target.value;
    render();
  });
  els.style.addEventListener("change", (e) => {
    p.styleId = e.target.value;
    render();
  });
  els.pacing.addEventListener("input", (e) => {
    p.pacing = Number(e.target.value);
    syncLabels();
    render();
  });
  els.length.addEventListener("input", (e) => {
    p.lengthSec = Number(e.target.value);
    syncLabels();
    render();
  });
  els.captions.addEventListener("change", (e) => {
    p.captions = e.target.checked;
    render();
  });
  root.querySelector("#rl-reset").addEventListener("click", () => {
    Object.assign(p, DEFAULTS);
    syncLabels();
    render();
  });
  root.querySelector("#rl-weak").addEventListener("click", () => {
    Object.assign(p, DEFAULTS, { platformId: "meta", styleId: "slow-build", captions: false, pacing: 2, lengthSec: 34 });
    syncLabels();
    render();
  });
  root.querySelector("#rl-strong").addEventListener("click", () => {
    Object.assign(p, DEFAULTS, { platformId: "tiktok", styleId: "cold-open", captions: true, pacing: 8, lengthSec: 18 });
    syncLabels();
    render();
  });

  syncLabels();
  render();
}
