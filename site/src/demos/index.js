// site/src/demos/index.js
// Registry of interactive demos shown at /demos. Add a demo by pushing an
// entry here — each mount(container) call owns rendering its own subtree.
import { mount as mountRestyleLab } from "./restyle-lab.js";

export const DEMOS = [
  {
    slug: "restyle-lab",
    title: "Restyle Lab",
    tagline: "Compile a scene into a video-gen prompt, storyboard, and CLI command for Seedance, Kling, Veo, or Sora.",
    mount: mountRestyleLab,
  },
];

export function findDemo(slug) {
  return DEMOS.find((d) => d.slug === slug) || null;
}
