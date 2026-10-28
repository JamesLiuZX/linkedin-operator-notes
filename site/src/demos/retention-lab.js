// site/src/demos/retention-lab.js
//
// What a hook style, captions, and pacing do to a short-form video's
// retention curve, benchmarked against Meta's and TikTok's published hook
// rate bands (see research/SOURCES.md). The two platforms measure different
// windows (3 seconds on Meta, 2 on TikTok), which is the thing this demo
// exists to make visible: a hook rate is not comparable across platforms
// unless you already know that.
//
// The model itself lives in scripts/lib/retention.mjs; this file is the view,
// built with the kit.

import { lineChart, fmt } from "../viz/charts.js";
import { PLATFORMS, HOOK_STYLES, DEFAULTS, simulate } from "@lib/retention.mjs";
import { calculator, card, hl, table } from "./kit.js";

const signed = (n) => `${n < 0 ? "−" : n > 0 ? "+" : ""}${Math.abs(n)}`;

export const meta = {
  slug: "retention-lab",
  title: "Watch-Time Simulator",
  tagline: "Where do viewers drop off, and what keeps them?",
  section: "media",
  pillar: "Gen media",
  essay: "12-the-hook-rate-is-not-one-number",
  blurb:
    "Hook rate is the share of viewers who stay past a video's first few seconds, and Meta and TikTok measure that window differently. Pick a scenario, then change the opening, captions and pacing to see where viewers go.",
  how: [
    "A retention-curve simulator for short-form video, benchmarked against Meta's and TikTok's published hook-rate bands. The two platforms measure different windows, which is most of the reason 'our hook rate' numbers from two campaigns are rarely the same thing.",
    "The bands are Hawky.ai's published numbers. The hook-style and pacing deltas are a model, calibrated to land inside those bands at default settings, not measured off a real campaign.",
  ],
  formulas: [
    { label: "Hook rate", expr: "platform base + hook-style change + 4 with captions + 0.6 × (pacing − 5), held between 3% and 92%" },
    { label: "Decay rate", expr: "0.035 + hook-style change − 0.01 with captions − 0.003 × (pacing − 5), held between 0.006 and 0.09" },
    { label: "Curve inside the window", expr: "100 − (100 − hook rate) × (second / window)^0.6" },
    { label: "Curve after the window", expr: "hook rate × e^(−decay rate × (second − window))" },
    { label: "Platform base (modelled)", expr: PLATFORMS.map((pl) => `${pl.name.split(" ")[0]} ${pl.basePct}%`).join("; ") },
    { label: "Hook-style change to the hook rate (modelled)", expr: HOOK_STYLES.map((s) => `${s.name} ${signed(s.hookDelta)}`).join("; ") },
    { label: "Hook-style change to the decay rate (modelled)", expr: HOOK_STYLES.map((s) => `${s.name} ${signed(s.decayDelta)}`).join("; ") },
  ],
  sources: [{ label: "Hawky.ai: hook rate", href: "https://hawky.ai/blog/hook-rate" }],
  buildNote:
    "Closed-form, not Monte Carlo: a concave approach to the hook rate across the platform's window, then exponential decay after it. The benchmark bands are Hawky.ai's published numbers. The hook-style and pacing deltas are a model calibrated to land inside those bands at default settings, not measurements from a real campaign.",
};

const IMPRESSIONS = 10000; // the audience every count on this page is out of

const platformOf = (s) => PLATFORMS.find((x) => x.id === s.platformId) || PLATFORMS[0];
const styleOf = (s) => HOOK_STYLES.find((x) => x.id === s.styleId) || HOOK_STYLES[0];
const shortName = (platform) => platform.name.split(" ")[0];
const sentence = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/** A band label as a status: "solid" reads "Solid band", "top quartile" stands alone. */
const bandText = (label) => (label.includes(" ") ? sentence(label) : `${sentence(label)} band`);

// The old "Load ..." buttons, as named scenarios. Each starts from DEFAULTS.
const SCENARIOS = [
  { id: "base", label: "Base case" },
  {
    id: "weak",
    label: "A weak opener",
    values: { platformId: "meta", styleId: "slow-build", captions: false, pacing: 2, lengthSec: 34 },
  },
  {
    id: "cold",
    label: "A cold open",
    values: { platformId: "tiktok", styleId: "cold-open", captions: true, pacing: 8, lengthSec: 18 },
  },
].map((s) => ({
  ...s,
  note: (v) =>
    `${shortName(platformOf(v))} video, ${v.lengthSec} seconds long. Opening: ${styleOf(v).name.toLowerCase()}. ${
      v.captions ? "Captions on" : "No captions"
    }, ${v.pacing} cuts per 10 seconds.`,
}));

const CONTROLS = [
  {
    key: "platformId",
    type: "select",
    label: "Platform",
    hint: "sets the window",
    options: PLATFORMS.map((pl) => ({ value: pl.id, label: pl.name })),
    help: (s) => {
      const pl = platformOf(s);
      return `${shortName(pl)} counts the first ${pl.window} seconds: ${pl.metric}.`;
    },
  },
  {
    key: "styleId",
    type: "select",
    label: "Opening",
    hint: "hook style",
    options: HOOK_STYLES.map((st) => ({ value: st.id, label: st.name })),
    help: (s) => styleOf(s).blurb,
  },
  {
    key: "captions",
    type: "toggle",
    label: "Captions and on-screen text",
    help: "Burned in throughout the video.",
  },
];

const MORE = [
  {
    key: "pacing",
    label: "Pacing",
    hint: "cuts per 10 seconds",
    help: "More cuts slow the drop-off after the opening, in this model.",
    min: 1,
    max: 10,
    step: 1,
    format: (v) => `${fmt.int(v)} cuts`,
  },
  {
    key: "lengthSec",
    label: "Video length",
    help: "Changes the completion rate, not the hook rate.",
    min: 6,
    max: 90,
    step: 1,
    format: (v) => `${fmt.int(v)}s`,
  },
];

function view(p) {
  const r = simulate(p);
  const name = shortName(r.platform);
  const w = r.platform.window;
  const L = p.lengthSec;

  const atHook = Math.round((IMPRESSIONS * r.hookPct) / 100);
  const lostByHook = IMPRESSIONS - atHook;
  const atMid = Math.round((IMPRESSIONS * r.midPct) / 100);

  // Position among the platform's four bands: under the floor, then up.
  const bandIndex = r.platform.bands.indexOf(r.band);
  const tone = bandIndex <= 0 ? "bad" : bandIndex === 1 ? "warn" : "good";

  const whole = (x) => `${Math.round(x)}%`;
  const floorBand = r.platform.bands[1].label; // "solid" on Meta, "baseline" on TikTok

  // Space the time axis in whole seconds where the length allows it (every 4s
  // for 24s) instead of 4.8s, 9.6s, ...; other lengths keep five even steps.
  const xTicks = [6, 5, 4, 3, 2].find((n) => L % n === 0) ?? 5;

  return {
    hero: {
      label: `Still watching after ${w} seconds`,
      value: r.hookPct,
      format: (v) => `${v.toFixed(1)}%`,
      unit: `hook rate on ${name}`,
      tone,
      status: bandText(r.band.label),
      verdict: `Of every ${fmt.int(IMPRESSIONS)} impressions, ${hl(fmt.int(lostByHook))} viewers are gone before second ${w}. A call to action after the midpoint reaches ${hl(fmt.int(atMid))} people, not ${fmt.int(IMPRESSIONS)}.`,
      stats: [
        { label: "Still watching at the midpoint", value: fmt.pct(r.midPct / 100, 1), sub: `${+(L / 2).toFixed(1)} seconds in` },
        { label: "Still watching at the end", value: fmt.pct(r.completionPct / 100, 1), sub: `${fmt.int(L)} seconds in` },
        { label: `How ${name} measures it`, value: `${w} seconds`, sub: r.platform.metric },
      ],
    },
    chart: {
      title: `The first ${w} seconds lose ${whole(100 - r.hookPct)} of viewers. The next ${L - w} seconds lose another ${whole(r.hookPct - r.completionPct)}.`,
      body: lineChart([{ label: `${r.platform.name}, ${r.style.name}`, points: r.points }], {
        xLabel: "Seconds into the video",
        yLabel: "Viewers still watching",
        xTicks,
        xFormat: (v) => `${+v.toFixed(1)}s`,
        yFormat: (v) => `${v.toFixed(0)}%`,
        yDomain: [0, 100],
        guide: { y: r.platform.bands[0].max, label: `${name} ${floorBand} band starts` },
      }),
      note: `The hook window ends at second ${w} on ${name}. Everything before it is the hook. Everything after it is pacing's job, not the hook's. The dashed line is where ${name}'s ${floorBand} band starts, and only the curve's height at second ${w} counts toward the band.`,
    },
    breakdown: card({
      title: `${PLATFORMS.map((pl) => `${shortName(pl)} counts ${pl.window} seconds`).join(" and ")}, so their bands do not line up.`,
      body:
        `<p>${PLATFORMS.map((pl) => `${shortName(pl)} counts ${pl.metric}.`).join(" ")} The same video can land in a different band on each.</p>` +
        table(
          ["Platform", "Window", "Under the floor", "Solid or baseline", "Good or above baseline", "Top tier"],
          PLATFORMS.map((pl) => [
            pl.name,
            `${pl.window} seconds`,
            `under ${pl.bands[0].max}%`,
            `${pl.bands[0].max} to ${pl.bands[1].max}%`,
            `${pl.bands[1].max} to ${pl.bands[2].max}%`,
            `${pl.bands[2].max}% and up`,
          ])
        ),
    }),
  };
}

export function mount(root) {
  calculator(root, { defaults: DEFAULTS, scenarios: SCENARIOS, controls: CONTROLS, more: MORE, view });
}
