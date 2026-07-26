// site/src/demos/index.js
// Registry. Adding a demo is: write the module, add one line here.

import * as resolutionLinter from "./resolution-linter.js";
import * as farmLab from "./farm-lab.js";
import * as liquidityLab from "./liquidity-lab.js";
import * as calibrationLab from "./calibration-lab.js";

export const DEMOS = [resolutionLinter, farmLab, liquidityLab, calibrationLab].map((m) => ({
  ...m.meta,
  mount: m.mount,
}));

export function demoBySlug(slug) {
  return DEMOS.find((d) => d.slug === slug) || null;
}
