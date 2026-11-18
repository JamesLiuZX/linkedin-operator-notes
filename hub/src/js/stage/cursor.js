// hub/src/js/stage/cursor.js
//
// A pointer the replay moves between real elements. Targets are looked up at
// seek time, not when the demo is built, so the pointer lands on the control
// even after the layout has changed underneath it.

import { ease } from "./timeline.js";

const ARROW =
  '<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M4 2.5 17.5 10l-6 1.6L9 17.5 4 2.5Z" fill="#ffffff" stroke="#0b0c0c" stroke-width="1.4" stroke-linejoin="round"/></svg>';

export function createCursor(tl, host) {
  const el = document.createElement("div");
  el.className = "cursor";
  el.innerHTML = ARROW;
  el.style.opacity = "0";
  host.appendChild(el);

  /** @type {{at:number,dur:number,get:Function,tap:boolean}[]} */
  const moves = [];
  let hideAt = Infinity;

  const point = (get) => {
    const target = typeof get === "function" ? get() : get;
    const h = host.getBoundingClientRect();
    if (!target) return { x: h.width * 0.5, y: h.height * 0.5 };
    if (typeof target.x === "number") return { x: target.x * h.width, y: target.y * h.height };
    const r = target.getBoundingClientRect();
    return { x: r.left - h.left + r.width / 2, y: r.top - h.top + r.height / 2 };
  };

  tl.each((t) => {
    if (!moves.length || t < moves[0].at || t >= hideAt + 0.4) {
      el.style.opacity = "0";
      return;
    }
    let i = 0;
    while (i + 1 < moves.length && t >= moves[i + 1].at) i++;
    const m = moves[i];
    const from = i === 0 ? { x: host.clientWidth * 0.62, y: host.clientHeight * 0.9 } : point(moves[i - 1].get);
    const to = point(m.get);
    const p = ease.inOut(Math.max(0, Math.min(1, (t - m.at) / m.dur)));
    // A slight arc reads as a hand, a straight line reads as a script.
    const lift = Math.sin(p * Math.PI) * Math.min(26, Math.hypot(to.x - from.x, to.y - from.y) * 0.12);
    const x = from.x + (to.x - from.x) * p;
    const y = from.y + (to.y - from.y) * p - lift;
    el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    const fadeIn = Math.min(1, (t - moves[0].at) / 0.25);
    const fadeOut = t > hideAt ? Math.max(0, 1 - (t - hideAt) / 0.4) : 1;
    el.style.opacity = String(Math.min(fadeIn, fadeOut).toFixed(2));
    const tapAt = m.at + m.dur;
    el.classList.toggle("tap", m.tap && t >= tapAt && t < tapAt + 0.45);
  });

  return {
    el,
    /** Glide to a target and (by default) tap it. Returns the moment of the tap. */
    to(get, at, { dur = 0.75, tap = true } = {}) {
      moves.push({ at, dur, get, tap });
      moves.sort((a, b) => a.at - b.at);
      tl.end(at + dur + 0.45);
      return at + dur;
    },
    hide(at) {
      hideAt = at;
      tl.end(at + 0.4);
    },
  };
}
