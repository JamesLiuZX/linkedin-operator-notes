// site/src/demos/restyle-lab.js
//
// Video Prompt Studio: a prompt compiler plus a deterministic storyboard
// preview for restyling a scene through a video-gen model. Pick a scene and a
// style once, read the compiled prompt for each of four models, one per tab.
//
// No network calls here (Vercel-safe, always renders the same way for the same
// inputs). Real generation happens via `node scripts/restyle-generate.mjs`,
// which shares the same registries from @lib/restyle.mjs.
//
// The compiler, the registries and the seeded drawing below are unchanged. The
// view is built from the demo kit: scene pills, a style picker, one tab per
// model, and the storyboard, dialect notes and CLI in disclosures.

import { SCENES, STYLES, MODELS, findScene, findStyle, findModel, compilePrompt } from "@lib/restyle.mjs";
import { esc } from "../viz/charts.js";
import { card, disclosure, scenarioBar } from "./kit.js";
import "./restyle-lab.css";

export const meta = {
  slug: "restyle-lab",
  title: "Video Prompt Studio",
  tagline: "One scene, written for Seedance, Kling, Veo and Sora.",
  section: "media",
  pillar: "Gen media",
  essay: "11-the-scene-is-not-the-prompt",
  blurb:
    "Pick a scene and a style once. Each of the four models gets its own version of the prompt, ready to copy.",
  how: [
    "A prompt compiler for four current video-gen models, not one. Pick a scene and a style once, and it writes each model's own dialect: who gets an audio cue, who gets a camera verb up front, who drops the sound cue on the floor.",
    "What changes between models is the duration and the model notes added at the end of the prompt. The scene and the style text are the same for all four.",
    "Real generation happens outside the browser. node scripts/restyle-generate.mjs reads the same registry and, with a FAL_KEY set, submits the prompt to fal.ai. Without a key it prints the compiled prompt and stops.",
  ],
  formulas: [
    {
      label: "How the prompt is assembled",
      expr: "scene beats + “Rendered as: ” + style modifiers + “Duration ~Ns.” + “Model notes: ” + model tips",
    },
  ],
  buildNote:
    "No model call and no network request. Scene, style, and per-model prompt tips are a small registry in scripts/lib/restyle.mjs; storyboard frames are seeded from a hash of the shot text, so the same inputs always draw the same frames.",
};

/* ----------------------------------------------- seeded storyboard + CLI */

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function frameSVG(shot, style, total) {
  const rand = mulberry32(hash(shot.text + style.id));
  const [c0, c1, c2, dark] = style.palette;
  const shapes = Array.from({ length: 3 }, () => {
    const cx = 20 + rand() * 280;
    const cy = 20 + rand() * 140;
    const r = 18 + rand() * 46;
    const fill = [c0, c1, c2][Math.floor(rand() * 3)];
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}" opacity="${(0.18 + rand() * 0.22).toFixed(2)}" />`;
  }).join("");

  return `
    <svg viewBox="0 0 320 180" class="vps-frame-art" role="img" aria-label="${esc(shot.label)} storyboard frame">
      <defs>
        <linearGradient id="vps-g${shot.index}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${dark}" />
          <stop offset="100%" stop-color="${c0}" stop-opacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#vps-g${shot.index})" />
      ${shapes}
      <rect x="0" y="146" width="320" height="34" fill="rgba(0,0,0,0.55)" />
      <text x="10" y="163" class="vps-frame-label">${esc(shot.label)}</text>
      <text x="10" y="176" class="vps-frame-camera">${esc(shot.camera)}</text>
      <text x="310" y="163" text-anchor="end" class="vps-frame-index">${shot.index}/${total}</text>
    </svg>
  `;
}

function cliCommand({ scene, style, model, customText }) {
  const sceneArg = customText ? `--scene "${customText.replace(/"/g, '\\"')}"` : `--scene ${scene.id}`;
  return `node scripts/restyle-generate.mjs ${sceneArg} --style ${style.id} --model ${model.id} --out out.mp4`;
}

/* ------------------------------------------------------------------- view */

const CUSTOM = "custom";

// Short pill names for the registry's scenes. The full title shows under the pills.
const SCENE_LABELS = {
  "flooded-ruin": "Flooded ruin",
  "coastal-chase": "Coastal chase",
  "windswept-reunion": "Windswept reunion",
  "storm-at-sea": "Storm at sea",
};

// The registry writes some of its notes with an em dash. Show a colon instead.
// (The compiled prompt itself is the compiler's output and is shown as it is.)
const noDash = (s) => String(s ?? "").replace(/\s+[—–]\s+/g, ": ");

const CHECK =
  '<svg class="vps-check" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="8.2"/><path d="M6.2 10.4l2.6 2.6 5-5.4"/></svg>';
const CHEVRON =
  '<svg class="kit-chevron" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5.5 7.75l4.5 4.5 4.5-4.5"/></svg>';

const modelMeta = (m) => `${m.vendor} · up to ${m.maxDurationSec} seconds · ${m.resolution}`;
const copyButton = (what) => `<button type="button" class="vps-copy" data-copy="${what}">Copy</button>`;

/** What each model adds to the prompt, from the registry's own tips. */
function dialectHtml() {
  return `
    <p class="vps-lede">The scene and style text is the same for every model. What changes is the duration and the notes added at the end of the prompt, which come from each model's tips.</p>
    <div class="vps-models">${MODELS.map((m) =>
      card({
        title: m.name,
        body: `
          <p class="vps-meta">${esc(modelMeta(m))}</p>
          <p>${esc(noDash(m.strengths))}</p>
          <p class="vps-tips-label">What the compiler adds</p>
          <ul class="vps-tips">${m.promptTips.map((t) => `<li>${esc(noDash(t))}</li>`).join("")}</ul>`,
      })
    ).join("")}</div>`;
}

export function mount(root) {
  const state = {
    sceneId: SCENES[0].id,
    styleId: STYLES[0].id,
    modelId: MODELS[0].id,
    customText: "",
    useCustom: false,
  };
  let current = { prompt: "", negative: "", cli: "" }; // what the Copy buttons copy

  root.innerHTML = `
    <div class="vps">
      <div data-slot="bar"></div>
      <div class="vps-custom" data-role="custom-wrap" hidden>
        <label class="kit-label" for="vps-custom-text">Describe your scene</label>
        <textarea id="vps-custom-text" class="kit-textarea" rows="3" data-role="custom-text"
          placeholder="A rider crosses a burning bridge as the city collapses behind them."></textarea>
        <p class="kit-help">One or two sentences.</p>
      </div>
      <div class="kit-grid">
        <div class="kit-stage">
          <section class="kit-card vps-output" aria-labelledby="vps-title">
            <h2 class="vps-title" id="vps-title">Same scene, same style. Each model gets its own ending.</h2>
            <div class="vps-tabs" role="tablist" aria-label="Video model">${MODELS.map(
              (m) =>
                `<button type="button" role="tab" class="vps-tab" id="vps-tab-${esc(m.id)}" data-model="${esc(m.id)}" aria-controls="vps-panel" aria-selected="false" tabindex="-1">${esc(m.name)}</button>`
            ).join("")}</div>
            <div class="vps-panel" role="tabpanel" id="vps-panel" data-role="panel"></div>
          </section>
        </div>
        <aside class="kit-panel kit-panel-collapsible vps-style-panel" aria-label="Style">
          <button type="button" class="kit-panel-toggle" aria-expanded="false" aria-controls="vps-style-body">
            <span>Style: <span data-role="style-name"></span></span>${CHEVRON}
          </button>
          <div class="kit-panel-body" id="vps-style-body">
            <div class="kit-panel-head"><h2 id="vps-style-h">Style</h2></div>
            <fieldset class="vps-styles" aria-labelledby="vps-style-h">${STYLES.map(
              (s) => `
              <label class="vps-style">
                <input type="radio" name="vps-style" value="${esc(s.id)}" />
                <span class="vps-style-card">
                  <span class="vps-swatch" aria-hidden="true">${s.palette.map((c) => `<i style="background:${esc(c)}"></i>`).join("")}</span>
                  <span class="vps-style-name">${esc(s.name)}</span>
                  ${CHECK}
                </span>
              </label>`
            ).join("")}</fieldset>
            <p class="vps-style-blurb" data-role="style-blurb"></p>
          </div>
        </aside>
      </div>
      ${disclosure({ summary: "Preview the storyboard", className: "kit-breakdown vps-story" })}
      ${disclosure({ summary: "How each model reads the prompt", body: dialectHtml() })}
      ${disclosure({ summary: "Run it for real", className: "vps-cli" })}
      <p class="vps-sr" role="status" data-role="status"></p>
    </div>`;

  const $ = (sel) => root.querySelector(sel);
  const role = (name) => $(`[data-role="${name}"]`);
  const panelEl = role("panel");
  const customWrap = role("custom-wrap");
  const customText = role("custom-text");
  const styleName = role("style-name");
  const styleBlurb = role("style-blurb");
  const statusEl = role("status");
  const storyBody = $(".vps-story .kit-disclosure-body");
  const cliBody = $(".vps-cli .kit-disclosure-body");
  const tabs = [...root.querySelectorAll(".vps-tab")];
  const styleInputs = [...root.querySelectorAll('input[name="vps-style"]')];

  const bar = scenarioBar({
    items: [...SCENES.map((s) => ({ id: s.id, label: SCENE_LABELS[s.id] || s.title })), { id: CUSTOM, label: "Write your own" }],
    label: "Scene",
    onSelect: (id) => pickScene(id),
  });
  $('[data-slot="bar"]').replaceWith(bar.el);
  const noteEl = bar.el.querySelector(".kit-scenarios-note");

  function render() {
    const scene = findScene(state.sceneId) || SCENES[0];
    const style = findStyle(state.styleId) || STYLES[0];
    const model = findModel(state.modelId) || MODELS[0];
    const text = state.useCustom ? state.customText.trim() : "";

    const compiled = compilePrompt({ scene, style, model, customText: text || null });
    const cli = cliCommand({ scene, style, model, customText: text || null });
    current = { prompt: compiled.prompt, negative: compiled.negativePrompt, cli };

    // Under the pills: which scene this is, and how it is cut into shots.
    noteEl.textContent = state.useCustom
      ? text
        ? `Your own scene, used for all ${compiled.shots.length} shots: free text cannot be split into beats without a model.`
        : `Describe your scene below. Until you do, the prompts use “${scene.title}”.`
      : `${scene.title}. ${compiled.shots.length} shots: ${compiled.shots.map((s) => s.label.toLowerCase()).join(", ")}.`;

    styleName.textContent = style.name;
    styleBlurb.textContent = noDash(style.blurb);
    for (const input of styleInputs) input.checked = input.value === style.id;
    for (const tab of tabs) {
      const on = tab.dataset.model === model.id;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
    }

    // The scene and style text is shared. Mark the ending this model adds.
    const tail = `Duration ~${model.maxDurationSec}s. Model notes: ${model.promptTips.join("; ")}.`;
    const cut = compiled.prompt.endsWith(tail) ? compiled.prompt.length - tail.length : -1;
    const promptHtml =
      cut > 0 ? `${esc(compiled.prompt.slice(0, cut))}<mark>${esc(compiled.prompt.slice(cut))}</mark>` : esc(compiled.prompt);

    panelEl.setAttribute("aria-labelledby", `vps-tab-${model.id}`);
    panelEl.innerHTML = `
      <div class="vps-about">
        <p class="vps-meta">${esc(modelMeta(model))}</p>
        <p class="vps-strength">${esc(noDash(model.strengths))}</p>
      </div>
      <div class="vps-block">
        <div class="vps-block-head"><h3>Prompt</h3>${copyButton("prompt")}</div>
        <pre class="kit-code">${promptHtml}</pre>
        <p class="vps-caption">${cut > 0 ? `The shaded ending is what ${esc(model.name)} adds. The rest is the same for all four.` : "The compiled prompt for this model."}</p>
      </div>
      <div class="vps-block">
        <div class="vps-block-head"><h3>Negative prompt</h3>${copyButton("negative")}</div>
        <pre class="kit-code">${esc(compiled.negativePrompt)}</pre>
      </div>`;

    storyBody.innerHTML = `
      <div class="vps-frames">${compiled.shots
        .map(
          (shot) => `
        <figure class="vps-frame">
          ${frameSVG(shot, compiled.style, compiled.shots.length)}
          <figcaption>${esc(shot.text)}</figcaption>
        </figure>`
        )
        .join("")}</div>
      <p class="vps-caption">Placeholder frames, not generated video. Each is drawn from the shot text and the style's colours, so the same inputs always look the same.</p>`;

    cliBody.innerHTML = `
      <p class="vps-lede">Needs your own <code>FAL_KEY</code> in <code>.env</code>. Without a key, the script prints the compiled prompt and stops.</p>
      <div class="vps-block">
        <div class="vps-block-head"><h3>Command for ${esc(model.name)}</h3>${copyButton("cli")}</div>
        <pre class="kit-code">${esc(cli)}</pre>
      </div>
      <p class="vps-lede">Model reference: <a href="${esc(model.docsUrl)}" target="_blank" rel="noreferrer">${esc(model.docsUrl)}</a>. Check the fal.ai slug (<code>${esc(model.falModel)}</code>) before a real run: it changes as providers ship new versions.</p>`;
  }

  function pickScene(id) {
    bar.select(id);
    state.useCustom = id === CUSTOM;
    customWrap.hidden = !state.useCustom;
    if (state.useCustom) customText.focus();
    else state.sceneId = id;
    render();
  }

  function selectModel(id, { focus = false } = {}) {
    state.modelId = id;
    render();
    if (focus) tabs.find((t) => t.dataset.model === id)?.focus();
  }

  for (const tab of tabs) tab.addEventListener("click", () => selectModel(tab.dataset.model));
  $(".vps-tabs").addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to == null) return;
    e.preventDefault();
    selectModel(tabs[(to + tabs.length) % tabs.length].dataset.model, { focus: true });
  });

  for (const input of styleInputs) {
    input.addEventListener("change", () => {
      state.styleId = input.value;
      render();
    });
  }

  customText.addEventListener("input", () => {
    state.customText = customText.value;
    render();
  });

  root.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    const text = btn && current[btn.dataset.copy];
    if (!text) return;
    let ok = true;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      ok = false;
    }
    btn.textContent = ok ? "Copied" : "Copy blocked";
    statusEl.textContent = ok ? "Copied to the clipboard." : "The browser blocked copying.";
    setTimeout(() => {
      btn.textContent = "Copy";
      statusEl.textContent = "";
    }, 1400);
  });

  // On a phone the style picker folds into a closed disclosure, like the
  // calculators' "Adjust assumptions".
  const toggle = $(".kit-panel-toggle");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.closest(".kit-panel").classList.toggle("is-open", open);
  });

  render();
}
