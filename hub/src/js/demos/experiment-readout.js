// hub/src/js/demos/experiment-readout.js : placeholder until this demo is built.
import { createTimeline } from "../stage/timeline.js";

export function mount(body) {
  body.innerHTML = '<div class="demo"><div class="run"></div><div class="art"></div></div>';
  const tl = createTimeline();
  tl.chapter("Soon", 0);
  tl.end(1);
  return { timeline: tl };
}
