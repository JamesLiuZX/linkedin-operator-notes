// site/src/demos/index.js
// Registry. Adding a demo is: write the module, add one line here.

import * as resolutionLinter from "./resolution-linter.js";
import * as farmLab from "./farm-lab.js";
import * as liquidityLab from "./liquidity-lab.js";
import * as calibrationLab from "./calibration-lab.js";
import * as restyleLab from "./restyle-lab.js";
import * as retentionLab from "./retention-lab.js";
import * as workflowRoiLab from "./workflow-roi-lab.js";
import * as slopGate from "./slop-gate.js";

export const DEMOS = [
  resolutionLinter,
  farmLab,
  liquidityLab,
  calibrationLab,
  restyleLab,
  retentionLab,
  workflowRoiLab,
  slopGate,
].map((m) => ({ ...m.meta, mount: m.mount }));

export function demoBySlug(slug) {
  return DEMOS.find((d) => d.slug === slug) || null;
}
