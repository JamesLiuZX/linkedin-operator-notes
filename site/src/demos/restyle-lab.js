// site/src/demos/restyle-lab.js
// Browser view for the "Restyle Lab" demo — a prompt compiler + deterministic
// storyboard preview for restyling a scene through a video-gen model.
// No network calls here (Vercel-safe, always renders the same way for the
// same inputs). Real generation happens via `node scripts/restyle-generate.mjs`,
// which shares the same registries from @lib/restyle.mjs.
import { SCENES, STYLES, MODELS, findScene, findStyle, findModel, compilePrompt } from "@lib/restyle.mjs";

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

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
    <svg viewBox="0 0 320 180" class="restyle-frame" role="img" aria-label="${escapeHtml(shot.label)} storyboard frame">
      <defs>
        <linearGradient id="g${shot.index}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${dark}" />
          <stop offset="100%" stop-color="${c0}" stop-opacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#g${shot.index})" />
      ${shapes}
      <rect x="0" y="146" width="320" height="34" fill="rgba(0,0,0,0.55)" />
      <text x="10" y="163" class="frame-label">${escapeHtml(shot.label)}</text>
      <text x="10" y="176" class="frame-camera">${escapeHtml(shot.camera)}</text>
      <text x="310" y="163" text-anchor="end" class="frame-index">${shot.index}/${total}</text>
    </svg>
  `;
}

function optionsFor(list, selectedId) {
  return list
    .map((item) => `<option value="${item.id}" ${item.id === selectedId ? "selected" : ""}>${escapeHtml(item.name || item.title)}</option>`)
    .join("");
}

function cliCommand({ scene, style, model, customText }) {
  const sceneArg = customText ? `--scene "${customText.replace(/"/g, '\\"')}"` : `--scene ${scene.id}`;
  return `node scripts/restyle-generate.mjs ${sceneArg} --style ${style.id} --model ${model.id} --out out.mp4`;
}

export function mount(container) {
  const state = {
    sceneId: SCENES[0].id,
    styleId: STYLES[0].id,
    modelId: MODELS[0].id,
    customText: "",
    useCustom: false,
  };

  container.innerHTML = `
    <div class="restyle-lab">
      <div class="restyle-controls">
        <label class="restyle-field">
          <span>Scene</span>
          <select data-role="scene" ${state.useCustom ? "disabled" : ""}>${optionsFor(SCENES, state.sceneId)}</select>
        </label>
        <label class="restyle-field restyle-checkbox">
          <input type="checkbox" data-role="use-custom" />
          <span>Write my own scene</span>
        </label>
        <label class="restyle-field restyle-field-wide" data-role="custom-wrap" hidden>
          <span>Custom scene (one or two sentences)</span>
          <textarea data-role="custom-text" rows="2" placeholder="A rider crosses a burning bridge as the city collapses behind them."></textarea>
        </label>
        <label class="restyle-field">
          <span>Style</span>
          <select data-role="style">${optionsFor(STYLES, state.styleId)}</select>
        </label>
        <label class="restyle-field">
          <span>Model</span>
          <select data-role="model">${optionsFor(MODELS, state.modelId)}</select>
        </label>
      </div>

      <p class="restyle-style-blurb mono" data-role="style-blurb"></p>
      <p class="restyle-model-blurb mono" data-role="model-blurb"></p>

      <div class="restyle-storyboard" data-role="storyboard"></div>

      <div class="restyle-prompt-grid">
        <div class="restyle-prompt-box">
          <div class="restyle-prompt-head">
            <span>Compiled prompt</span>
            <button type="button" data-role="copy-prompt">Copy</button>
          </div>
          <textarea readonly rows="4" data-role="prompt-out"></textarea>
        </div>
        <div class="restyle-prompt-box">
          <div class="restyle-prompt-head">
            <span>Negative prompt</span>
            <button type="button" data-role="copy-negative">Copy</button>
          </div>
          <textarea readonly rows="4" data-role="negative-out"></textarea>
        </div>
      </div>

      <div class="restyle-cli">
        <div class="restyle-prompt-head">
          <span>Run it for real (needs your own <code>FAL_KEY</code> in <code>.env</code>)</span>
          <button type="button" data-role="copy-cli">Copy</button>
        </div>
        <pre class="mono" data-role="cli-out"></pre>
        <p class="note" data-role="model-docs"></p>
      </div>
    </div>
  `;

  const els = {
    scene: container.querySelector('[data-role="scene"]'),
    style: container.querySelector('[data-role="style"]'),
    model: container.querySelector('[data-role="model"]'),
    useCustom: container.querySelector('[data-role="use-custom"]'),
    customWrap: container.querySelector('[data-role="custom-wrap"]'),
    customText: container.querySelector('[data-role="custom-text"]'),
    styleBlurb: container.querySelector('[data-role="style-blurb"]'),
    modelBlurb: container.querySelector('[data-role="model-blurb"]'),
    storyboard: container.querySelector('[data-role="storyboard"]'),
    promptOut: container.querySelector('[data-role="prompt-out"]'),
    negativeOut: container.querySelector('[data-role="negative-out"]'),
    cliOut: container.querySelector('[data-role="cli-out"]'),
    modelDocs: container.querySelector('[data-role="model-docs"]'),
  };

  function copy(text, btn) {
    navigator.clipboard?.writeText(text).then(
      () => {
        const original = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = original), 1200);
      },
      () => {}
    );
  }

  function render() {
    const scene = findScene(state.sceneId) || SCENES[0];
    const style = findStyle(state.styleId) || STYLES[0];
    const model = findModel(state.modelId) || MODELS[0];
    const customText = state.useCustom ? state.customText.trim() : "";

    const compiled = compilePrompt({
      scene,
      style,
      model,
      customText: customText || null,
    });

    els.styleBlurb.textContent = `${style.name} — ${style.blurb}`;
    els.modelBlurb.textContent = `${model.name} (${model.vendor}) — ${model.strengths}`;
    els.promptOut.value = compiled.prompt;
    els.negativeOut.value = compiled.negativePrompt;
    els.cliOut.textContent = cliCommand({ scene, style, model, customText: customText || null });
    els.modelDocs.innerHTML = `Model reference: <a href="${model.docsUrl}" target="_blank" rel="noreferrer">${escapeHtml(model.docsUrl)}</a> — verify the fal.ai slug (<code>${escapeHtml(model.falModel)}</code>) before a real run; it changes as providers ship new versions.`;

    els.storyboard.innerHTML = compiled.shots
      .map((shot) => frameSVG(shot, compiled.style, compiled.shots.length))
      .join("");
  }

  els.scene.addEventListener("change", (e) => {
    state.sceneId = e.target.value;
    render();
  });
  els.style.addEventListener("change", (e) => {
    state.styleId = e.target.value;
    render();
  });
  els.model.addEventListener("change", (e) => {
    state.modelId = e.target.value;
    render();
  });
  els.useCustom.addEventListener("change", (e) => {
    state.useCustom = e.target.checked;
    els.scene.disabled = state.useCustom;
    els.customWrap.hidden = !state.useCustom;
    render();
  });
  els.customText.addEventListener("input", (e) => {
    state.customText = e.target.value;
    if (state.useCustom) render();
  });
  container.querySelector('[data-role="copy-prompt"]').addEventListener("click", (e) => copy(els.promptOut.value, e.target));
  container.querySelector('[data-role="copy-negative"]').addEventListener("click", (e) => copy(els.negativeOut.value, e.target));
  container.querySelector('[data-role="copy-cli"]').addEventListener("click", (e) => copy(els.cliOut.textContent, e.target));

  render();
}
