// scripts/lib/workflow-roi.mjs
// Shared model for the Workflow ROI Lab demo. Zero dependencies, browser-safe.
//
// What is real: the per-model token prices, published by Anthropic (see
// research/SOURCES.md, "AI workflow economics"). What is modeled: task
// volume, manual minutes, review minutes, and rework rate, which are your
// own numbers, not a benchmark. The arithmetic combining them is exact; the
// inputs are only as good as what you put in, which is the entire point of
// a calculator rather than a headline stat.

// $ per million tokens, input/output. Anthropic, verified August 2026.
export const MODELS = [
  { id: "haiku-4-5", name: "Claude Haiku 4.5", inputPrice: 1, outputPrice: 5 },
  { id: "sonnet-5-intro", name: "Claude Sonnet 5 (intro, through 31 Aug 2026)", inputPrice: 2, outputPrice: 10 },
  { id: "sonnet-5-standard", name: "Claude Sonnet 5 (standard)", inputPrice: 3, outputPrice: 15 },
  { id: "opus-4-5", name: "Claude Opus 4.5", inputPrice: 5, outputPrice: 25 },
];

export const DEFAULTS = {
  volume: 400, // tasks per month
  manualMinutes: 12, // minutes per task, done fully by hand
  hourlyCost: 45, // fully loaded $/hr for the person doing it
  modelId: "sonnet-5-intro",
  inputTokens: 3000,
  outputTokens: 600,
  aiMinutes: 4, // human minutes per task, prompting and checking the output
  reworkRate: 0.08, // share of tasks the AI output still has to be redone by hand
};

export function findModel(id) {
  return MODELS.find((m) => m.id === id) || MODELS[0];
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Full cost breakdown for one task, and the breakeven AI-minutes figure. */
export function compute(p) {
  const model = findModel(p.modelId);
  const manualCost = (p.manualMinutes / 60) * p.hourlyCost;
  const tokenCost = (p.inputTokens / 1e6) * model.inputPrice + (p.outputTokens / 1e6) * model.outputPrice;
  const reviewCost = (p.aiMinutes / 60) * p.hourlyCost;
  const reworkCost = clamp(p.reworkRate, 0, 1) * manualCost;
  const aiCost = tokenCost + reviewCost + reworkCost;
  const savingsPerTask = manualCost - aiCost;
  const monthlySavings = savingsPerTask * p.volume;

  // Solve aiCost(aiMinutes) = manualCost for aiMinutes, holding token cost and
  // rework rate fixed. Linear in aiMinutes, so this is exact, not a search.
  const breakevenAiMinutes =
    (60 * (manualCost * (1 - clamp(p.reworkRate, 0, 1)) - tokenCost)) / p.hourlyCost;

  return {
    model,
    manualCost,
    tokenCost,
    reviewCost,
    reworkCost,
    aiCost,
    savingsPerTask,
    monthlySavings,
    breakevenAiMinutes,
  };
}

/** Monthly savings as a function of AI-assisted minutes per task, for a chart. */
export function sweepAiMinutes(p, { maxMinutes = 30, steps = 40 } = {}) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const aiMinutes = (maxMinutes * i) / steps;
    const r = compute({ ...p, aiMinutes });
    pts.push([aiMinutes, r.monthlySavings]);
  }
  return pts;
}
