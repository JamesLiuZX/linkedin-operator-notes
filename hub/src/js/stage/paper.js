// hub/src/js/stage/paper.js
//
// A document shown inside the stage: drawn at its real width, zoomed to fit
// the frame, scrolled by the timeline during the replay and by the reader
// once it is live.

import { ease } from "./timeline.js";

export function createPaper(host, { width = 1000, className = "", maxZoom = 1 } = {}) {
  host.innerHTML = `<div class="paper"><div class="paper-scroll" data-scroll><div class="paper-doc ${className}" data-doc style="width:${width}px"></div></div></div>`;
  const scroll = host.querySelector("[data-scroll]");
  const doc = host.querySelector("[data-doc]");

  const fit = () => {
    const w = scroll.clientWidth;
    if (w) doc.style.zoom = String(Math.min(maxZoom, w / width).toFixed(4));
  };
  fit();
  new ResizeObserver(fit).observe(scroll);

  /** Top of an element inside the scroll area, in the scroll area's own pixels. */
  const topOf = (el) => {
    if (!el) return 0;
    const a = scroll.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    return b.top - a.top + scroll.scrollTop;
  };

  return {
    scroll,
    doc,
    fit,
    topOf,
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
        if (host.closest(".is-live")) return;
        let i = -1;
        while (i + 1 < list.length && t >= list[i + 1].at) i++;
        if (i < 0) {
          scroll.scrollTop = 0;
          return;
        }
        const s = list[i];
        const from = i === 0 ? 0 : resolve(list[i - 1]);
        const to = resolve(s);
        const p = ease.inOut(Math.max(0, Math.min(1, (t - s.at) / (s.dur ?? 0.9))));
        scroll.scrollTop = from + (to - from) * p;
      });
      for (const s of list) tl.end(s.at + (s.dur ?? 0.9));
    },
    /** Keep links inside the document: anchors scroll the frame, files open the worked example. */
    wireLinks(base) {
      doc.addEventListener("click", (ev) => {
        const a = ev.target.closest("a[href]");
        if (!a) return;
        const href = a.getAttribute("href");
        if (href.startsWith("#")) {
          ev.preventDefault();
          const el = doc.querySelector(`[id="${CSS.escape(href.slice(1))}"]`);
          if (el) scroll.scrollTo({ top: topOf(el) - 16, behavior: "smooth" });
        } else if (!/^[a-z]+:/i.test(href)) {
          ev.preventDefault();
          window.open(base + href, "_blank", "noopener");
        }
      });
    },
  };
}
