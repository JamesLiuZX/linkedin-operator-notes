// hub/src/js/stage/player.js
//
// The chrome around a demo: play and pause, a scrubber cut into chapters,
// replay, keyboard control, and autoplay only while the stage is on screen.
// When the replay ends the stage goes "live": the output becomes something
// you click.
//
// A demo module exports mount(body, api) and returns
// { timeline, live?(), unlive?(), destroy?(), hint? }.

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const PLAY =
  '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4.5 2.8v10.4a.6.6 0 0 0 .92.5l8.1-5.2a.6.6 0 0 0 0-1L5.42 2.3a.6.6 0 0 0-.92.5Z"/></svg>';
const PAUSE =
  '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="3.5" y="2.5" width="3.2" height="11" rx="1"/><rect x="9.3" y="2.5" width="3.2" height="11" rx="1"/></svg>';

/**
 * @param stage  the [data-stage] element
 * @param demo   what the demo's mount() returned
 * @param opts   { onProgress(p, live), onEnd() }
 */
export function createPlayer(stage, demo, opts = {}) {
  const tl = demo.timeline;
  const body = stage.querySelector("[data-stage-body]");
  const ctl = stage.querySelector("[data-stage-ctl]");
  const toggle = stage.querySelector("[data-stage-toggle]");
  const replay = stage.querySelector("[data-stage-replay]");
  const scrub = stage.querySelector("[data-stage-scrub]");
  const time = stage.querySelector("[data-stage-time]");
  const now = stage.querySelector("[data-stage-now]");
  const hint = stage.querySelector("[data-stage-hint]");

  const capture = new URLSearchParams(location.search).has("capture");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const off = new AbortController();
  const on = (target, type, fn, o = {}) => target?.addEventListener(type, fn, { ...o, signal: off.signal });

  let t = 0;
  let playing = false;
  let live = false;
  let raf = 0;
  let last = 0;
  let visible = false;
  let userPaused = false;
  let dead = false;
  let watch = null;

  if (ctl) ctl.hidden = false;
  if (hint) hint.textContent = demo.hint || "";

  // The scrubber is one segment per chapter, each as wide as the chapter is long.
  const chapters = tl.chapters.length ? tl.chapters : [{ title: "", at: 0 }];
  const segs = [];
  if (scrub) {
    scrub.innerHTML = "";
    chapters.forEach((c, i) => {
      const end = i + 1 < chapters.length ? chapters[i + 1].at : tl.duration;
      const seg = document.createElement("span");
      seg.className = "stage-seg";
      seg.style.flexGrow = String(Math.max(0.2, end - c.at));
      seg.title = c.title;
      seg.innerHTML = "<i></i>";
      scrub.appendChild(seg);
      segs.push({ el: seg, fill: seg.firstChild, from: c.at, to: end });
    });
  }

  function paint() {
    const p = tl.duration ? t / tl.duration : 0;
    let cur = 0;
    chapters.forEach((c, i) => {
      if (t >= c.at) cur = i;
    });
    for (const s of segs) {
      const span = Math.max(0.001, s.to - s.from);
      s.fill.style.transform = `scaleX(${Math.max(0, Math.min(1, (t - s.from) / span)).toFixed(4)})`;
    }
    if (time) time.textContent = `${fmt(t)} / ${fmt(tl.duration)}`;
    if (now) {
      const title = live ? "Yours to try" : chapters[cur].title;
      if (now.textContent !== title) now.textContent = title;
    }
    scrub?.setAttribute("aria-valuenow", String(Math.round(p * 100)));
    stage.style.setProperty("--p", p.toFixed(4));
    opts.onProgress?.(p, live);
  }

  function setLive(next) {
    if (live === next) return;
    live = next;
    stage.classList.toggle("is-live", next);
    if (next) {
      demo.live?.();
      opts.onEnd?.();
    } else demo.unlive?.();
  }

  function seek(next) {
    const end = next >= tl.duration - 0.0005;
    // Leave live mode before the timeline re-applies its own state.
    if (!end) setLive(false);
    t = tl.seek(next);
    if (end) setLive(true);
    paint();
  }

  function frame(time) {
    if (!playing || dead) return;
    const dt = Math.min(0.1, (time - last) / 1000);
    last = time;
    seek(t + dt);
    if (t >= tl.duration) return pause(true);
    raf = requestAnimationFrame(frame);
  }

  function play() {
    if (playing || dead) return;
    if (t >= tl.duration) seek(0);
    playing = true;
    userPaused = false;
    stage.classList.add("is-playing");
    if (toggle) {
      toggle.innerHTML = PAUSE;
      toggle.setAttribute("aria-label", "Pause");
    }
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function pause(ended = false) {
    playing = false;
    cancelAnimationFrame(raf);
    stage.classList.remove("is-playing");
    if (toggle) {
      toggle.innerHTML = PLAY;
      toggle.setAttribute("aria-label", ended ? "Play again" : "Play");
    }
  }

  on(toggle, "click", () => {
    if (playing) {
      userPaused = true;
      pause();
    } else play();
  });

  on(replay, "click", () => {
    seek(0);
    play();
  });

  // Scrubbing: pointer and keyboard.
  if (scrub) {
    const at = (ev) => {
      const r = scrub.getBoundingClientRect();
      return Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
    };
    // The bar is cut by chapter, so a position on it maps through the segments.
    const timeAt = (ev) => {
      for (const s of segs) {
        const r = s.el.getBoundingClientRect();
        if (ev.clientX <= r.right || s === segs[segs.length - 1]) {
          const p = Math.max(0, Math.min(1, (ev.clientX - r.left) / Math.max(1, r.width)));
          return s.from + (s.to - s.from) * p;
        }
      }
      return at(ev) * tl.duration;
    };
    on(scrub, "pointerdown", (ev) => {
      scrub.setPointerCapture(ev.pointerId);
      userPaused = true;
      pause();
      seek(timeAt(ev));
      const move = (e) => seek(timeAt(e));
      const up = () => {
        scrub.removeEventListener("pointermove", move);
        scrub.removeEventListener("pointerup", up);
      };
      scrub.addEventListener("pointermove", move);
      scrub.addEventListener("pointerup", up);
    });
    on(scrub, "keydown", (ev) => {
      if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
        ev.preventDefault();
        userPaused = true;
        pause();
        seek(t + (ev.key === "ArrowRight" ? 1 : -1));
      }
    });
  }

  on(stage, "keydown", (ev) => {
    if (ev.target.closest("input, textarea, select, [data-stage-scrub]")) return;
    if (ev.key === " " && ev.target === stage) {
      ev.preventDefault();
      toggle?.click();
    }
  });

  // Touching the output while it is still assembling skips to the finished thing.
  on(
    body,
    "pointerdown",
    () => {
      if (!live && !capture) {
        userPaused = true;
        pause(true);
        seek(tl.duration);
      }
    },
    { capture: true }
  );

  const api = {
    get time() {
      return t;
    },
    get live() {
      return live;
    },
    play,
    pause,
    seek,
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      watch?.disconnect();
      off.abort();
      stage.classList.remove("is-playing", "is-live", "is-capture");
      demo.destroy?.();
    },
  };

  if (capture) {
    stage.classList.add("is-capture");
    seek(0);
    window.__stage = {
      duration: tl.duration,
      chapters: tl.chapters,
      seek: (x) => {
        seek(x);
        return true;
      },
    };
    document.documentElement.dataset.stageReady = "1";
    return api;
  }

  if (reduced || !stage.hasAttribute("data-autoplay")) {
    // No motion wanted: show the finished output, leave play available.
    seek(reduced ? tl.duration : 0);
    pause(reduced);
    if (!reduced) paint();
    return api;
  }

  // A stage may open part of the way in, so the first thing a visitor sees is the output arriving.
  seek(Math.min(Number(stage.dataset.start) || 0, tl.duration));
  pause();
  watch = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !playing && !userPaused && !live) play();
      else if (!visible && playing) pause();
    },
    { threshold: 0.3 }
  );
  watch.observe(stage);

  on(document, "visibilitychange", () => {
    if (document.hidden && playing) pause();
    else if (!document.hidden && visible && !userPaused && !live) play();
  });

  return api;
}
