// scripts/lib/retention.mjs
// Shared model for the Retention Curve Lab demo. Zero dependencies, browser-safe.
//
// What is real: the platform hook-rate measurement windows and benchmark
// bands, from Hawky.ai (research/SOURCES.md, "Short-form video and UGC: hook
// rate"). What is modeled: how a hook style, captions, and pacing move the
// hook rate and the decay after it. Those deltas are calibrated so the
// defaults land inside the published bands, not measured off a real campaign,
// and are labelled that way in the demo and in the essay's Cost field.

export const PLATFORMS = [
  {
    id: "meta",
    name: "Meta (Reels / feed video)",
    window: 3,
    metric: "3-second video plays / impressions",
    basePct: 27.5,
    bands: [
      { max: 25, label: "under the solid band" },
      { max: 30, label: "solid" },
      { max: 40, label: "good" },
      { max: Infinity, label: "elite" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    window: 2,
    metric: "2-second video views / impressions",
    basePct: 32.5,
    bands: [
      { max: 30, label: "under baseline" },
      { max: 35, label: "baseline" },
      { max: 40, label: "above baseline" },
      { max: Infinity, label: "top quartile" },
    ],
  },
];

export const HOOK_STYLES = [
  {
    id: "cold-open",
    name: "Cold open on the payoff",
    blurb: "Show the result in frame 1. Explain how you got there after.",
    hookDelta: 9,
    decayDelta: -0.018,
  },
  {
    id: "onscreen-question",
    name: "On-screen question",
    blurb: "A text overlay poses the question the rest of the video answers.",
    hookDelta: 5,
    decayDelta: 0,
  },
  {
    id: "pattern-interrupt",
    name: "Pattern interrupt in frame 1",
    blurb: "A jump cut, whip pan, or jarring motion before anything is explained.",
    hookDelta: 7,
    decayDelta: -0.008,
  },
  {
    id: "slow-build",
    name: "Talking head, slow build",
    blurb: "Presenter states context and credentials before the point.",
    hookDelta: -6,
    decayDelta: 0.012,
  },
];

export const DEFAULTS = {
  platformId: "meta",
  styleId: "slow-build",
  captions: false,
  pacing: 4,
  lengthSec: 24,
};

export function findPlatform(id) {
  return PLATFORMS.find((p) => p.id === id) || PLATFORMS[0];
}

export function findStyle(id) {
  return HOOK_STYLES.find((s) => s.id === id) || HOOK_STYLES[0];
}

export function bandFor(platform, pct) {
  return platform.bands.find((b) => pct < b.max) || platform.bands[platform.bands.length - 1];
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * One retention curve, sampled every 0.5s (every 1s past 40s). Two phases:
 * a concave approach to the hook rate across the platform's window, then
 * exponential decay for the rest of the video. Both phases are closed-form,
 * so the same inputs always draw the same curve.
 */
export function simulate({ platformId, styleId, captions, pacing, lengthSec }) {
  const platform = findPlatform(platformId);
  const style = findStyle(styleId);

  const hookPct = clamp(
    platform.basePct + style.hookDelta + (captions ? 4 : 0) + (pacing - 5) * 0.6,
    3,
    92
  );

  const decayRate = clamp(
    0.035 + style.decayDelta + (captions ? -0.01 : 0) - (pacing - 5) * 0.003,
    0.006,
    0.09
  );

  const points = [];
  const step = lengthSec > 40 ? 1 : 0.5;
  for (let t = 0; t <= lengthSec; t += step) {
    const pct =
      t <= platform.window
        ? 100 - (100 - hookPct) * Math.pow(platform.window > 0 ? t / platform.window : 1, 0.6)
        : hookPct * Math.exp(-decayRate * (t - platform.window));
    points.push([t, clamp(pct, 0, 100)]);
  }
  if (points[points.length - 1][0] !== lengthSec) {
    const last = points[points.length - 1][1];
    points.push([lengthSec, last]);
  }

  const at = (sec) => {
    let best = points[0];
    for (const p of points) if (Math.abs(p[0] - sec) < Math.abs(best[0] - sec)) best = p;
    return best[1];
  };

  return {
    platform,
    style,
    hookPct,
    decayRate,
    points,
    completionPct: points[points.length - 1][1],
    midPct: at(lengthSec / 2),
    band: bandFor(platform, hookPct),
  };
}
