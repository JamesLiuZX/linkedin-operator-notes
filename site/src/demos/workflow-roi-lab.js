// site/src/demos/workflow-roi-lab.js
//
// Where an AI-assisted workflow actually pays for itself. Token cost is
// almost never the number that decides it, human review time is, which is
// the same gap METR's randomized trial on experienced developers found:
// people forecast a 24% speedup, later still believed 20%, and a stopwatch
// measured 19% slower (research/SOURCES.md, "AI workflow economics"). This
// demo makes that same gap a slider instead of a headline.
//
// The kit's reference calculator: scenarios from the old "Load ..." buttons,
// three visible controls, a verdict built from compute(), and the rest a
// click away. The model itself lives in scripts/lib/workflow-roi.mjs.

import { barsH, lineChart, fmt } from "../viz/charts.js";
import { MODELS, DEFAULTS, compute, findModel, sweepAiMinutes } from "@lib/workflow-roi.mjs";
import { calculator, card, chartCard, hl, table } from "./kit.js";

export const meta = {
  slug: "workflow-roi-lab",
  title: "AI Payback Check",
  tagline: "Is AI actually saving your team money?",
  section: "growth",
  pillar: "AI workflows",
  essay: "13-the-stopwatch-not-the-forecast",
  blurb:
    "Put in how long a task takes by hand and how long review takes with AI. You get the monthly savings, and the review time where the workflow stops paying for itself.",
  how: [
    "A breakeven calculator for AI-assisted workflows, built on Anthropic's published per-token pricing. Set your own task volume, manual time, review time, and rework rate, and read off the exact review-time ceiling before the workflow stops paying for itself.",
    "Token prices are Anthropic's published rates, verified August 2026. Volume, minutes, and rework rate are your own assumptions, not a benchmark.",
  ],
  formulas: [
    { label: "Cost per task by hand", expr: "manual minutes / 60 × hourly cost" },
    { label: "Token cost per task", expr: "input tokens × input price + output tokens × output price, prices per million tokens" },
    { label: "Cost per task with AI", expr: "token cost + review minutes / 60 × hourly cost + rework rate × cost by hand" },
    { label: "Break-even review time", expr: "60 × (cost by hand × (1 − rework rate) − token cost) / hourly cost" },
  ],
  sources: [
    { label: "Anthropic: Claude Sonnet 5 pricing", href: "https://www.anthropic.com/news/claude-sonnet-5" },
    { label: "Anthropic: Claude Haiku 4.5 pricing", href: "https://www.anthropic.com/news/claude-haiku-4-5" },
    { label: "Anthropic: Claude Opus 4.5 pricing", href: "https://www.anthropic.com/news/claude-opus-4-5" },
    {
      label: "METR, 10 July 2025: AI tools and experienced open-source developers",
      href: "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/",
    },
  ],
  buildNote:
    "Closed-form: cost per task is exact arithmetic over your inputs, and the breakeven review-time is solved directly rather than searched for. The only externally sourced numbers are the four models' published token prices. Everything else, volume, minutes, rework rate, is an assumption you set and can argue with.",
};

const usd3 = (v) => {
  const abs = Math.abs(v);
  return `${v < 0 ? "-" : ""}$${abs < 1 ? abs.toFixed(3) : abs.toFixed(2)}`;
};
const usdSigned = (v) => (v < 0 ? `-$${fmt.int(Math.abs(v))}` : `$${fmt.int(v)}`);
const usdWhole = (v) => `${v < 0 ? "−" : ""}$${fmt.int(Math.abs(v))}`;
const minutes = (v) => `${+v.toFixed(1)} minutes`;

// The old "Load ..." buttons, as named scenarios. Each starts from DEFAULTS.
const SCENARIOS = [
  { id: "typical", label: "Typical team" },
  { id: "metr", label: "The METR pattern", values: { aiMinutes: 14, reworkRate: 0.08 } },
  { id: "clean", label: "Clean automation", values: { aiMinutes: 1.5, reworkRate: 0.03 } },
].map((s) => ({
  ...s,
  note: (v) => `Review takes ${minutes(v.aiMinutes)} a task, and ${fmt.pct(v.reworkRate)} of tasks are redone by hand.`,
}));

const CONTROLS = [
  {
    key: "aiMinutes",
    label: "Review time with AI",
    hint: "per task",
    help: "Minutes spent prompting and checking the AI's work.",
    min: 0,
    max: 30,
    step: 0.5,
    format: (v) => `${v.toFixed(1)} min`,
  },
  {
    key: "manualMinutes",
    label: "Time by hand",
    hint: "per task",
    help: "How long the task takes with no AI at all.",
    min: 1,
    max: 60,
    step: 1,
    format: (v) => `${fmt.int(v)} min`,
  },
  {
    key: "volume",
    label: "Tasks a month",
    help: "How often the team does this task.",
    min: 50,
    max: 5000,
    step: 50,
    format: (v) => fmt.int(v),
  },
];

const MORE = [
  {
    key: "reworkRate",
    label: "Tasks redone by hand",
    hint: "rework rate",
    help: "Share of tasks where the AI's output gets thrown away.",
    min: 0,
    max: 0.5,
    step: 0.01,
    format: (v) => fmt.pct(v),
  },
  {
    key: "hourlyCost",
    label: "Hourly cost of the person",
    hint: "fully loaded",
    help: "Pay plus overhead, for one hour of their time.",
    min: 15,
    max: 150,
    step: 5,
    format: (v) => `$${fmt.int(v)}/hr`,
  },
  {
    key: "modelId",
    type: "select",
    label: "Model",
    hint: "sets token prices",
    options: MODELS.map((m) => ({ value: m.id, label: m.name })),
    help: (p) => {
      const m = findModel(p.modelId);
      return `$${m.inputPrice} per million input tokens, $${m.outputPrice} per million output.`;
    },
  },
  {
    key: "inputTokens",
    label: "Prompt size",
    hint: "input tokens a call",
    min: 200,
    max: 50000,
    step: 200,
    format: (v) => fmt.int(v),
  },
  {
    key: "outputTokens",
    label: "Response size",
    hint: "output tokens a call",
    min: 50,
    max: 8000,
    step: 50,
    format: (v) => fmt.int(v),
  },
];

function view(p) {
  const r = compute(p);
  const sweep = sweepAiMinutes(p);
  const saves = r.monthlySavings >= 0;
  const be = r.breakevenAiMinutes;

  let verdict;
  if (saves) {
    verdict = `This workflow saves ${hl(`${usdWhole(r.monthlySavings)} a month`)}. It stops paying once review takes longer than ${hl(minutes(be))} a task.`;
  } else if (be > 0) {
    verdict = `This workflow costs ${hl(`${usdWhole(-r.monthlySavings)} a month`)} more than doing the work by hand. It only pays once review drops under ${hl(minutes(be))} a task.`;
  } else {
    verdict = `This workflow costs ${hl(`${usdWhole(-r.monthlySavings)} a month`)} more than doing the work by hand, at any review time: tokens and rework alone cost more than the task.`;
  }

  // The chart title says which AI line item dominates, from the numbers.
  const parts = [
    ["Review time", r.reviewCost],
    ["Rework", r.reworkCost],
    ["Tokens", r.tokenCost],
  ];
  const [top] = parts.reduce((a, b) => (b[1] > a[1] ? b : a));
  const tokensTiny = r.tokenCost < 0.05 * r.aiCost;
  const chartTitle =
    top === "Tokens"
      ? "Tokens are the biggest AI cost at these settings."
      : `${top} is the real cost.${tokensTiny ? " Tokens barely register." : ""}`;

  const sweepTitle =
    be <= 0
      ? "This workflow loses money at every review time."
      : be > 30
        ? "Savings stay above zero across the whole 0 to 30 minute range."
        : `Savings fall to zero at ${minutes(be)} of review a task.`;

  const modelRows = MODELS.map((m) => [
    m.name,
    `$${m.inputPrice}`,
    `$${m.outputPrice}`,
    usd3((p.inputTokens / 1e6) * m.inputPrice + (p.outputTokens / 1e6) * m.outputPrice),
  ]);

  return {
    hero: {
      label: "Monthly savings",
      value: r.monthlySavings,
      format: usdWhole,
      tone: saves ? "good" : "bad",
      status: saves ? "Pays for itself" : "Loses money",
      verdict,
      stats: [
        { label: "Cost per task by hand", value: usd3(r.manualCost) },
        { label: "Cost per task with AI", value: usd3(r.aiCost), sub: `${usd3(r.reviewCost)} of it is review time` },
        { label: "Token cost per task", value: usd3(r.tokenCost), sub: `${fmt.pct(r.tokenCost / r.aiCost, 1)} of the AI cost` },
      ],
    },
    chart: {
      title: chartTitle,
      body: barsH(
        [
          { label: "By hand, today", value: r.manualCost },
          { label: "With AI: tokens", value: r.tokenCost },
          { label: "With AI: review", value: r.reviewCost },
          { label: "With AI: rework", value: r.reworkCost },
        ],
        { format: usd3 }
      ),
      note: "Time the review step for real before you claim the savings. When METR timed experienced developers, they forecast a 24% speedup, still believed 20% afterward, and a stopwatch measured 19% slower.",
    },
    breakdown:
      chartCard({
        title: sweepTitle,
        body: lineChart([{ label: "Monthly savings", points: sweep }], {
          xLabel: "Review time with AI, minutes a task",
          xFormat: (v) => `${+v.toFixed(1)} min`,
          yFormat: usdSigned,
          guide: { y: 0, label: "break-even" },
        }),
        note:
          be > 0 && be <= 30
            ? `Past ${hl(minutes(be))}, the workflow costs more than doing it by hand, no matter how fast it feels.`
            : "",
      }) +
      card({
        title: "Token cost per task on each model",
        body: `<p>At ${hl(fmt.int(p.inputTokens))} input and ${hl(fmt.int(p.outputTokens))} output tokens a call. Prices are per million tokens.</p>
          ${table(["Model", "Input price", "Output price", "Per task"], modelRows, { numeric: [1, 2, 3] })}`,
      }),
  };
}

export function mount(root) {
  calculator(root, { defaults: DEFAULTS, scenarios: SCENARIOS, controls: CONTROLS, more: MORE, view });
}
