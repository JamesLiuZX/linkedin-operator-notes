// hub/src/js/stage/paper.js
//
// A document shown inside the stage: drawn at its real width, zoomed to fit
// the frame, scrolled and filmed by the timeline during the replay, and
// scrolled by the reader once it is live.
//
// Three layers, outside in:
//   .paper         the sheet. The timeline tips it in from a camera angle.
//   .paper-scroll  the window onto the document.
//   .paper-cam     what the camera moves: push in on a detail, pull back out.

import { ease } from "./timeline.js";

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

export function createPaper(host, { width = 1000, className = "", maxZoom = 1 } = {}) {
  host.innerHTML = `<div class="paper"><div class="paper-scroll" data-scroll><div class="paper-cam" data-cam><div class="paper-doc ${className}" data-doc style="width:${width}px"></div></div></div></div>`;
  const el = host.querySelector(".paper");
  const scroll = host.querySelector("[data-scroll]");
  const cam = host.querySelector("[data-cam]");
  const doc = host.querySelector("[data-doc]");

  const fit = () => {
    const w = scroll.clientWidth;
    if (w) doc.style.zoom = String(Math.min(maxZoom, w / width).toFixed(4));
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(scroll);

  const live = () => Boolean(host.closest(".is-live"));

  /** Top of an element inside the scroll area, in the scroll area's own pixels. Call with the camera at rest. */
  const topOf = (target) => {
    if (!target) return 0;
    const a = scroll.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    return b.top - a.top + scroll.scrollTop;
  };

  return {
    el,
    scroll,
    cam,
    doc,
    fit,
    topOf,
    destroy() {
      ro.disconnect();
    },

    /**
     * Timeline-driven scrolling. stops: [{ at, to: () => Element | number, dur, offset }]
     * Between stops the view eases from wherever the previous stop left it.
     */
    follow(tl, stops) {
      const list = [...stops].sort((a, b) => a.at - b.at);
      const resolve = (s) => {
        const target = typeof s.to === "function" ? s.to() : s.to;
        const y = typeof target === "number" ? target : topOf(target) - (s.offset ?? 16);
        return Math.max(0, Math.min(y, scroll.scrollHeight - scroll.clientHeight));
      };
      tl.each((t) => {
        if (live()) return;
        // Measure with the camera at rest, so a push-in never changes where a stop lands.
        cam.style.transform = "none";
        let i = -1;
        while (i + 1 < list.length && t >= list[i + 1].at) i++;
        if (i < 0) {
          scroll.scrollTop = 0;
          return;
        }
        const s = list[i];
        const from = i === 0 ? 0 : resolve(list[i - 1]);
        const to = resolve(s);
        const p = ease.inOut(clamp01((t - s.at) / (s.dur ?? 0.9)));
        scroll.scrollTop = from + (to - from) * p;
      }, -2);
      for (const s of list) tl.end(s.at + (s.dur ?? 0.9));
    },

    /**
     * The camera. shots: [{ at, to: () => Element | null, zoom, dur, anchor }]
     * A shot pushes in on an element; a shot with no `to` pulls back to the
     * whole page. `anchor` is where in the element to aim, 0 (top) to 1 (bottom).
     */
    camera(tl, shots) {
      const list = [...shots].sort((a, b) => a.at - b.at);
      const state = (s, view) => {
        const rest = { z: 1, cx: view.width / 2, cy: view.height / 2 };
        if (!s || !s.to) return rest;
        const target = typeof s.to === "function" ? s.to() : s.to;
        if (!target) return rest;
        const r = target.getBoundingClientRect();
        return { z: s.zoom ?? 1.4, cx: r.left - view.left + r.width / 2, cy: r.top - view.top + r.height * (s.anchor ?? 0.5) };
      };
      tl.each((t) => {
        cam.style.transform = "none";
        if (live()) return;
        let i = -1;
        while (i + 1 < list.length && t >= list[i + 1].at) i++;
        if (i < 0) return;
        const view = scroll.getBoundingClientRect();
        const a = state(list[i - 1], view);
        const b = state(list[i], view);
        const p = ease.inOutQuint(clamp01((t - list[i].at) / (list[i].dur ?? 1)));
        const z = a.z + (b.z - a.z) * p;
        if (Math.abs(z - 1) < 0.0005) return;
        const cx = a.cx + (b.cx - a.cx) * p;
        const cy = a.cy + (b.cy - a.cy) * p;
        // The more it zooms, the closer the subject is brought to the middle of the frame.
        const pull = clamp01((z - 1) / 0.3);
        const px = cx + (view.width / 2 - cx) * pull;
        const py = cy + (view.height * 0.46 - cy) * pull;
        cam.style.transform = `translate3d(${(px - cx * z).toFixed(2)}px,${(py - cy * z).toFixed(2)}px,0) scale(${z.toFixed(4)})`;
      }, -1);
      for (const s of list) tl.end(s.at + (s.dur ?? 1));
    },

    /** Keep links inside the document: anchors scroll the frame, files open the worked example. */
    wireLinks(base) {
      doc.addEventListener("click", (ev) => {
        const a = ev.target.closest("a[href]");
        if (!a) return;
        const href = a.getAttribute("href");
        if (href.startsWith("#")) {
          ev.preventDefault();
          const target = doc.querySelector(`[id="${CSS.escape(href.slice(1))}"]`);
          if (target) scroll.scrollTo({ top: topOf(target) - 16, behavior: "smooth" });
        } else if (!/^[a-z]+:/i.test(href)) {
          ev.preventDefault();
          window.open(base + href, "_blank", "noopener");
        }
      });
    },
  };
}
