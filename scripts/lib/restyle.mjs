// scripts/lib/restyle.mjs
// Shared prompt-compiler for the "Restyle Lab" demo. Zero dependencies,
// no DOM/Node-only APIs — imported by site/src/demos/restyle-lab.js (browser,
// via the @lib alias) and scripts/restyle-generate.mjs (CLI, real generation).
// Add a scene/style/model by pushing an entry into the arrays below.

export const SCENES = [
  {
    id: "flooded-ruin",
    title: "Descent into the flooded ruin",
    beats: [
      "A lone figure picks a path down a crumbling stone stairway, torchlight catching ancient carvings on the walls.",
      "Water rises around their boots as the stairway steepens; distant stone groans under unseen weight.",
      "They step into a vast flooded chamber, torch raised, revealing a horizon of submerged pillars stretching into dark water.",
    ],
  },
  {
    id: "coastal-chase",
    title: "Chase on the coastal highway",
    beats: [
      "Two cars scream out of a tunnel onto a rain-slicked coastal road, headlights slicing through fog.",
      "The lead car clips a guardrail; sparks fan across the wet asphalt as the chase closes in.",
      "Both cars crest a hill together, silhouetted against a lightning-lit horizon over the sea.",
    ],
  },
  {
    id: "windswept-reunion",
    title: "Reunion on the windswept plain",
    beats: [
      "A lone rider crosses an empty grass plain under a heavy grey sky, wind bending the grass flat.",
      "A second figure appears on the far ridge; both stop walking and watch each other across the distance.",
      "They close the last steps between them as the wind drops and light breaks through the clouds.",
    ],
  },
  {
    id: "storm-at-sea",
    title: "Storm at sea",
    beats: [
      "A small wooden ship crests a towering wave, sails torn and flapping against a black sky.",
      "Lightning splits the horizon as the crew fights to hold the wheel steady against the swell.",
      "The ship drops into the trough between waves, dwarfed by walls of water on either side.",
    ],
  },
];

export const STYLES = [
  {
    id: "gta",
    name: "Open-world crime-sim",
    blurb: "Satirical open-world game render — saturated primaries, thick outlines, HUD chatter.",
    promptModifiers: [
      "rendered in a satirical open-world video game engine",
      "saturated primary color grading (orange, purple, teal)",
      "thick specular highlights on painted surfaces",
      "exaggerated character proportions",
      "in-engine camera shake",
      "faint HUD elements and radio-chatter subtitles at the edges of frame",
    ],
    negativePrompts: ["photorealism", "muted colors", "documentary grain"],
    palette: ["#ff7a1a", "#7a3bff", "#17c4c4", "#14161c"],
  },
  {
    id: "ghibli",
    name: "Hand-painted anime",
    blurb: "Soft painterly backgrounds, warm rim light, hand-inked characters.",
    promptModifiers: [
      "hand-painted anime background art",
      "soft pastel skies",
      "warm rim lighting",
      "visible ink linework on foreground subjects",
      "gentle atmospheric haze",
    ],
    negativePrompts: ["hard cel shading", "neon colors", "photorealism"],
    palette: ["#ffd8a8", "#a8d5ff", "#7fbf7f", "#3a3a4a"],
  },
  {
    id: "noir",
    name: "Black-and-white noir",
    blurb: "High-contrast monochrome, venetian-blind shadows, cigarette haze.",
    promptModifiers: [
      "high-contrast black-and-white cinematography",
      "hard venetian-blind shadow patterns",
      "practical low-key lighting",
      "thin haze of smoke in the air",
      "35mm film grain",
    ],
    negativePrompts: ["color", "flat lighting", "digital-clean look"],
    palette: ["#f2f2f2", "#9c9c9c", "#4a4a4a", "#0a0a0a"],
  },
  {
    id: "cyberpunk",
    name: "Neon cyberpunk",
    blurb: "Rain-slick neon streets, holographic signage, volumetric fog.",
    promptModifiers: [
      "neon-drenched cyberpunk city",
      "magenta and cyan lighting",
      "rain-slicked reflective streets",
      "holographic signage",
      "thick volumetric fog",
    ],
    negativePrompts: ["daylight", "pastel colors", "rural setting"],
    palette: ["#ff2bd6", "#2bf0ff", "#1a0033", "#0a0a12"],
  },
  {
    id: "claymation",
    name: "Stop-motion claymation",
    blurb: "Matte clay textures, visible fingerprints, warm tungsten light.",
    promptModifiers: [
      "stop-motion claymation",
      "matte clay textures with visible fingerprints and tool marks",
      "warm tungsten practical lighting",
      "subtle frame-to-frame flicker",
    ],
    negativePrompts: ["smooth CGI", "photorealism", "cool lighting"],
    palette: ["#e8b98a", "#c96b4e", "#7a9e7e", "#3a2e2a"],
  },
  {
    id: "documentary",
    name: "Observational documentary",
    blurb: "Handheld, natural light, desaturated, quiet realism.",
    promptModifiers: [
      "handheld observational documentary camera",
      "natural available light only",
      "desaturated color grade",
      "subtle film grain",
      "no non-diegetic score",
    ],
    negativePrompts: ["stylized color", "steadicam smoothness", "CGI elements"],
    palette: ["#c9c3b3", "#8a8577", "#55524a", "#2a2823"],
  },
];

// fal.ai model slugs shift as providers ship new versions — verify the exact
// slug on the provider's docs page before a real run; override at the CLI
// with --fal-model if a registry entry has drifted out of date.
export const MODELS = [
  {
    id: "seedance-2",
    name: "Seedance 2.0",
    vendor: "ByteDance",
    falModel: "fal-ai/bytedance/seedance/v2/text-to-video",
    maxDurationSec: 15,
    resolution: "up to 1080p",
    strengths: "Multi-shot generations with natural cuts, native audio, strong motion coherence.",
    promptTips: [
      "describe the cut between beats explicitly so the model can place a natural transition",
      "include an ambient sound / dialogue-tone cue — Seedance 2.0 generates native audio",
    ],
    docsUrl: "https://fal.ai/seedance-2.0",
  },
  {
    id: "kling-3",
    name: "Kling 3.0",
    vendor: "Kuaishou",
    falModel: "fal-ai/kling-video/v3/pro/text-to-video",
    maxDurationSec: 10,
    resolution: "1080p",
    strengths: "Strong physical dynamics and camera motion; cost-efficient.",
    promptTips: ["lead with an explicit camera verb (dolly in, whip pan, handheld) — Kling responds strongly to it"],
    docsUrl: "https://modelslab.com/blog/api/veo-3-1-vs-kling-3-sora-2-ai-video-api-cost-2026",
  },
  {
    id: "veo-3",
    name: "Veo 3.1",
    vendor: "Google",
    falModel: "fal-ai/veo3.1/text-to-video",
    maxDurationSec: 8,
    resolution: "1080p",
    strengths: "Native synchronized audio and dialogue; official API via Gemini/Vertex.",
    promptTips: ["write any dialogue or sound cue inline in quotes — Veo 3.1 syncs audio to it"],
    docsUrl: "https://ai.google.dev/",
  },
  {
    id: "sora-2",
    name: "Sora 2",
    vendor: "OpenAI",
    falModel: "fal-ai/sora-2/text-to-video",
    maxDurationSec: 10,
    resolution: "1080p",
    strengths: "Strong physical realism and world consistency.",
    promptTips: ["keep cause-and-effect physically explicit — Sora 2 rewards concrete physics over vibes"],
    docsUrl: "https://openai.com/sora",
  },
];

const SHOT_LABELS = ["Setup", "Escalation", "Payoff"];
const CAMERA_MOVES = ["static wide", "slow dolly-in", "handheld push", "low-angle tracking", "whip pan", "crane rise"];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(list, seed) {
  return list[seed % list.length];
}

export function findScene(id) {
  return SCENES.find((s) => s.id === id) || null;
}

export function findStyle(id) {
  return STYLES.find((s) => s.id === id) || null;
}

export function findModel(id) {
  return MODELS.find((m) => m.id === id) || null;
}

// customText, if given, overrides the preset scene's beats (split into three
// synthetic beats since we can't semantically parse free text without a model).
export function compilePrompt({ scene, style, model, customText }) {
  const beats = customText
    ? [`Opening: ${customText}`, `Turn: ${customText}`, `Payoff: ${customText}`]
    : scene.beats;

  const styleClause = style.promptModifiers.join(", ");
  const modelClause = model.promptTips.join("; ");
  const sceneText = beats.join(" ");

  const prompt =
    `${sceneText} Rendered as: ${styleClause}. ` +
    `Duration ~${model.maxDurationSec}s. Model notes: ${modelClause}.`;

  const negativePrompt = style.negativePrompts.join(", ");

  const shots = beats.map((text, i) => ({
    index: i + 1,
    label: SHOT_LABELS[i] || `Beat ${i + 1}`,
    text,
    camera: pick(CAMERA_MOVES, hash(text + style.id)),
  }));

  return {
    prompt,
    negativePrompt,
    shots,
    scene: customText ? { id: "custom", title: "Custom scene" } : { id: scene.id, title: scene.title },
    style: { id: style.id, name: style.name, palette: style.palette },
    model: { id: model.id, name: model.name, vendor: model.vendor, falModel: model.falModel, maxDurationSec: model.maxDurationSec },
  };
}
