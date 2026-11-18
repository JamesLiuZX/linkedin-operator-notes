// hub/src/js/stage/player.js
//
// The chrome around a demo: play and pause, a scrubber with chapters, replay,
// keyboard control, and autoplay only while the stage is on screen. When the
// replay ends the stage goes "live": the output becomes something you click.
//
// A demo module exports mount(body, api) and returns { timeline, live?() }.

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const PLAY =
  '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4.5 2.8v10.4a.6.6 0 0 0 .92.5l8.1-5.2a.6.6 0 0 0 0-1L5.42 2.3a.6.6 0 0 0-.92.5Z"/></svg>';
const PAUSE =
  '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="3.5" y="2.5" width="3.2" height="11" rx="1"/><rect x="9.3" y="2.5" width="3.2" height="11" rx="1"/></svg>';

export function createPlayer(stage, demo) {
  const tl = demo.timeline;
  const body = stage.querySelector("[data-stage-body]");
  const ctl = stage.querySelector("[data-stage-ctl]");
  const toggle = stage.querySelector("[data-stage-toggle]");
  const replay = stage.querySelector("[data-stage-replay]");
  const scrub = stage.querySelector("[data-stage-scrub]");
  const fill = stage.querySelector("[data-stage-fill]");
  const time = stage.querySelector("[data-stage-time]");
  const chapWrap = stage.querySelector("[data-stage-chapters]");

  const capture = new URLSearchParams(location.search).has("capture");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let t = 0;
  let playing = false;
  let live = false;
  let raf = 0;
  let last = 0;
  let visible = false;
  let userPaused = false;

  if (ctl) ctl.hidden = false;

  const chapButtons = tl.chapters.map((c, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = c.title;
    b.addEventListener("click", () => {
      seek(c.at + 0.001);
      play();
    });
    chapWrap?.appendChild(b);
    // A tick on the scrubber for each chapter after the first.
    if (i > 0 && scrub) {
      const tick = document.createElement("span");
      tick.className = "stage-tick";
      tick.style.left = `${(c.at / tl.duration) * 100}%`;
      scrub.appendChild(tick);
    }
    return b;
  });

  function paint() {
    const p = tl.duration ? t / tl.duration : 0;
    if (fill) fill.style.width = `${(p * 100).toFixed(2)}%`;
    if (time) time.textContent = `${fmt(t)} / ${fmt(tl.duration)}`;
    scrub?.setAttribute("aria-valuenow", String(Math.round(p * 100)));
    let cur = 0;
    tl.chapters.forEach((c, i) => {
      if (t >= c.at) cur = i;
    });
    chapButtons.forEach((b, i) => b.classList.toggle("on", i === cur));
  }

  function setLive(on) {
    if (live === on) return;
    live = on;
    stage.classList.toggle("is-live", on);
    if (on) demo.live?.();
    else demo.unlive?.();
  }

  function seek(next) {
    const end = next >= tl.duration - 0.0005;
    // Leave live mode before the timeline re-applies its own state.
    if (!end) setLive(false);
    t = tl.seek(next);
    if (end) setLive(true);
    paint();
  }

  function frame(now) {
    if (!playing) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    seek(t + dt);
    if (t >= tl.duration) return pause(true);
    raf = requestAnimationFrame(frame);
  }

  function play() {
    if (playing) return;
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

  toggle?.addEventListener("click", () => {
    if (playing) {
      userPaused = true;
      pause();
    } else play();
  });

  replay?.addEventListener("click", () => {
    seek(0);
    play();
  });

  // Scrubbing: pointer and keyboard.
  if (scrub) {
    const at = (ev) => {
      const r = scrub.getBoundingClientRect();
      return Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)) * tl.duration;
    };
    scrub.addEventListener("pointerdown", (ev) => {
      scrub.setPointerCapture(ev.pointerId);
      userPaused = true;
      pause();
      seek(at(ev));
      const move = (e) => seek(at(e));
      const up = () => {
        scrub.removeEventListener("pointermove", move);
        scrub.removeEventListener("pointerup", up);
      };
      scrub.addEventListener("pointermove", move);
      scrub.addEventListener("pointerup", up);
    });
    scrub.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
        ev.preventDefault();
        userPaused = true;
        pause();
        seek(t + (ev.key === "ArrowRight" ? 1 : -1));
      }
    });
  }

  stage.addEventListener("keydown", (ev) => {
    if (ev.target.closest("input, textarea, select, [data-stage-scrub]")) return;
    if (ev.key === " " && ev.target === stage) {
      ev.preventDefault();
      toggle?.click();
    }
  });

  // Touching the output while it is still assembling skips to the finished thing.
  body.addEventListener(
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
    return;
  }

  if (reduced || !stage.hasAttribute("data-autoplay")) {
    // No motion wanted: show the finished output, leave play available.
    seek(reduced ? tl.duration : 0);
    pause(reduced);
    if (!reduced) paint();
    return;
  }

  seek(0);
  pause();
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !playing && !userPaused && !live) play();
      else if (!visible && playing) pause();
    },
    { threshold: 0.35 }
  ).observe(stage);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && playing) pause();
    else if (!document.hidden && visible && !userPaused && !live) play();
  });
}
