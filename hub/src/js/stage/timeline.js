// hub/src/js/stage/timeline.js
//
// A seekable timeline. Every demo is a pure function of time: seek(t) puts the
// page in exactly the state it has at t seconds, forwards or backwards. That
// one property gives the scrubber, replay, reduced-motion (jump to the end)
// and frame-by-frame rendering of clips from the same code.
//
// Nothing here uses timers or CSS transitions. A demo declares what changes
// and when; the player decides what "now" is.

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

export const ease = {
  linear: (p) => p,
  in: (p) => p * p * p,
  out: (p) => 1 - Math.pow(1 - p, 3),
  outQuint: (p) => 1 - Math.pow(1 - p, 5),
  outExpo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  inOutQuint: (p) => (p < 0.5 ? 16 * p * p * p * p * p : 1 - Math.pow(-2 * p + 2, 5) / 2),
  back: (p) => 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2),
  /** A damped spring: overshoots once, settles by the end. */
  spring: (p) => (p >= 1 ? 1 : 1 - Math.exp(-6.5 * p) * Math.cos(9.5 * p)),
};

// Properties that are folded into one transform. rx and ry tip the element in 3D.
const TRANSFORM = new Set(["x", "y", "z", "scale", "scaleX", "scaleY", "rotate", "rx", "ry"]);
const ONE = new Set(["scale", "scaleX", "scaleY", "opacity"]);

export function createTimeline() {
  /** @type {Map<Element, Map<string, {at:number,dur:number,from:number,to:number,ease:Function,unit:string}[]>>} */
  const tweens = new Map();
  /** @type {Map<Element, Map<string, {at:number,on:boolean}[]>>} */
  const classes = new Map();
  const texts = [];
  const counters = [];
  /** @type {Map<string, {at:number,value:any}[]>} */
  const keys = new Map();
  const watchers = [];
  const frames = [];
  const flights = [];
  const chapters = [];
  let duration = 0;
  let lastState = "";

  const grow = (t) => {
    if (t > duration) duration = t;
  };

  const tl = {
    chapters,
    get duration() {
      return duration;
    },

    /**
     * Tween numeric properties of an element.
     * props: { opacity: [0, 1], y: [12, 0], scale: [0.96, 1], rx: [12, 0], "--p": [0, 1] }
     * A single number means "to this value from wherever it was".
     */
    to(el, props, { at = 0, dur = 0.5, ease: e = ease.out, unit = "" } = {}) {
      if (!el) return tl;
      if (!tweens.has(el)) tweens.set(el, new Map());
      const map = tweens.get(el);
      for (const [prop, v] of Object.entries(props)) {
        if (!map.has(prop)) map.set(prop, []);
        const list = map.get(prop);
        const prev = list.length ? list[list.length - 1].to : ONE.has(prop) ? 1 : 0;
        const [from, to] = Array.isArray(v) ? v : [prev, v];
        list.push({ at, dur, from, to, ease: e, unit });
        list.sort((a, b) => a.at - b.at);
      }
      grow(at + dur);
      return tl;
    },

    /** Fade and rise in. The element starts hidden. */
    show(el, at, { dur = 0.5, y = 10, scale = 1, ease: e = ease.out } = {}) {
      const props = { opacity: [0, 1] };
      if (y) props.y = [y, 0];
      if (scale !== 1) props.scale = [scale, 1];
      return tl.to(el, props, { at, dur, ease: e });
    },

    hide(el, at, { dur = 0.3 } = {}) {
      return tl.to(el, { opacity: 0 }, { at, dur, ease: ease.inOut });
    },

    /** Pop in with a spring: for chips, dots, badges and anything that should feel placed. */
    pop(el, at, { dur = 0.55, from = 0.4 } = {}) {
      if (!el) return tl;
      tl.to(el, { opacity: [0, 1] }, { at, dur: Math.min(0.18, dur), ease: ease.linear });
      return tl.to(el, { scale: [from, 1] }, { at, dur, ease: ease.spring });
    },

    /** An object tips in from a camera angle and settles flat. Its parent needs perspective. */
    land(el, at, { dur = 1.15, rx = 16, ry = -20, z = -240, y = 70, rotate = 0 } = {}) {
      if (!el) return tl;
      tl.to(el, { opacity: [0, 1] }, { at, dur: 0.3, ease: ease.out });
      const props = { rx: [rx, 0], ry: [ry, 0], z: [z, 0], y: [y, 0] };
      if (rotate) props.rotate = [rotate, 0];
      return tl.to(el, props, { at, dur, ease: ease.outQuint });
    },

    /** A rubber stamp: comes down fast and bounces once. CSS can style .stamped. */
    stamp(el, at, { rotate = -7, from = 2.4 } = {}) {
      if (!el) return tl;
      tl.to(el, { opacity: [0, 1] }, { at, dur: 0.09, ease: ease.linear });
      tl.to(el, { scale: [from, 0.93], rotate: [rotate - 9, rotate] }, { at, dur: 0.2, ease: ease.in });
      tl.to(el, { scale: [0.93, 1] }, { at: at + 0.2, dur: 0.34, ease: ease.back });
      return tl.cls(el, "stamped", at + 0.18);
    },

    /** Draw a stroke. Tweens --draw from 0 to 1; the CSS decides what that draws. */
    draw(el, at, { dur = 0.6, ease: e = ease.inOut } = {}) {
      return tl.to(el, { "--draw": [0, 1] }, { at, dur, ease: e });
    },

    /** Add (or with on=false, remove) a class from `at` onwards. */
    cls(el, name, at, on = true) {
      if (!el) return tl;
      if (!classes.has(el)) classes.set(el, new Map());
      const map = classes.get(el);
      if (!map.has(name)) map.set(name, []);
      map.get(name).push({ at, on });
      map.get(name).sort((a, b) => a.at - b.at);
      grow(at);
      return tl;
    },

    /** Reveal text one character at a time. */
    type(el, text, { at = 0, dur = 1, cps = 0 } = {}) {
      if (!el) return tl;
      const d = cps ? text.length / cps : dur;
      texts.push({ el, text, at, dur: d });
      grow(at + d);
      return tl;
    },

    /** Count a number from one value to another. */
    count(el, from, to, { at = 0, dur = 0.8, fmt = (n) => String(Math.round(n)) } = {}) {
      if (!el) return tl;
      counters.push({ el, from, to, at, dur, fmt });
      grow(at + dur);
      return tl;
    },

    /**
     * A shared-element flight: a block travels from one element to another, so
     * the eye can follow a thing from where it was found to where it is used.
     * The block is drawn in `layer`, an overlay that is never scaled, and both
     * ends are measured at seek time. Returns the moment it lands.
     */
    fly(layer, { from, to, at = 0, dur = 0.7, className = "", html = "", arc = 0.16, hold = 0.16 } = {}) {
      if (!layer) return at + dur;
      const el = document.createElement("div");
      el.className = `fly ${className}`.trim();
      el.innerHTML = html;
      el.style.opacity = "0";
      layer.appendChild(el);
      flights.push({ layer, el, from, to, at, dur, arc, hold });
      grow(at + dur + hold);
      return at + dur;
    },

    /** Set a named value from `at` onwards. Read by watchers registered with on(). */
    key(name, value, at = 0) {
      if (!keys.has(name)) keys.set(name, []);
      keys.get(name).push({ at, value });
      keys.get(name).sort((a, b) => a.at - b.at);
      grow(at);
      return tl;
    },

    /** Called with the keyed state whenever it changes. Use for anything that re-renders. */
    on(fn) {
      watchers.push(fn);
      return tl;
    },

    /**
     * Called on every seek with the time. Use for things that follow the layout.
     * Lower `order` runs first: scrolling (-2), then the camera (-1), then
     * anything that measures the result, like the pointer (default 0).
     */
    each(fn, order = 0) {
      frames.push({ fn, order });
      frames.sort((a, b) => a.order - b.order);
      return tl;
    },

    /** Forget the last keyed state, so the next seek re-applies it even if it has not changed. */
    invalidate() {
      lastState = "";
      return tl;
    },

    chapter(title, at) {
      chapters.push({ title, at });
      chapters.sort((a, b) => a.at - b.at);
      return tl;
    },

    /** Hold the final state for a while so the last frame can be read. */
    end(t) {
      grow(t);
      return tl;
    },

    seek(time) {
      const t = Math.max(0, Math.min(duration, time));

      for (const [el, map] of tweens) {
        let tx = 0;
        let ty = 0;
        let tz = 0;
        let sc = 1;
        let sx = 1;
        let sy = 1;
        let rot = 0;
        let rx = 0;
        let ry = 0;
        let hasT = false;
        for (const [prop, list] of map) {
          let v = list[0].from;
          for (const k of list) {
            if (t < k.at) break;
            const p = k.dur <= 0 ? 1 : clamp01((t - k.at) / k.dur);
            v = k.from + (k.to - k.from) * k.ease(p);
          }
          if (TRANSFORM.has(prop)) {
            hasT = true;
            if (prop === "x") tx = v;
            else if (prop === "y") ty = v;
            else if (prop === "z") tz = v;
            else if (prop === "scale") sc = v;
            else if (prop === "scaleX") sx = v;
            else if (prop === "scaleY") sy = v;
            else if (prop === "rx") rx = v;
            else if (prop === "ry") ry = v;
            else rot = v;
          } else if (prop.startsWith("--")) {
            el.style.setProperty(prop, v + (list[0].unit || ""));
          } else if (prop === "opacity") {
            el.style.opacity = v.toFixed(3);
            el.style.visibility = v <= 0.001 ? "hidden" : "";
          } else {
            el.style[prop] = v + (list[0].unit || "px");
          }
        }
        if (hasT) {
          const flat = !rx && !ry && !rot && sc === 1 && sx === 1 && sy === 1;
          el.style.transform =
            flat && !tx && !ty && !tz
              ? ""
              : `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,${tz.toFixed(2)}px)` +
                (rx ? ` rotateX(${rx.toFixed(3)}deg)` : "") +
                (ry ? ` rotateY(${ry.toFixed(3)}deg)` : "") +
                (rot ? ` rotate(${rot.toFixed(3)}deg)` : "") +
                (sc !== 1 || sx !== 1 || sy !== 1 ? ` scale(${(sc * sx).toFixed(4)},${(sc * sy).toFixed(4)})` : "");
        }
      }

      for (const [el, map] of classes) {
        for (const [name, list] of map) {
          // Before its first event a class is in the opposite state.
          let on = !list[0].on;
          for (const k of list) {
            if (t < k.at) break;
            on = k.on;
          }
          el.classList.toggle(name, on);
        }
      }

      for (const x of texts) {
        const p = x.dur <= 0 ? (t >= x.at ? 1 : 0) : clamp01((t - x.at) / x.dur);
        const n = Math.round(p * x.text.length);
        if (x.el.__n !== n) {
          x.el.textContent = x.text.slice(0, n);
          x.el.__n = n;
        }
        x.el.classList.toggle("typing", p > 0 && p < 1);
      }

      for (const c of counters) {
        const p = clamp01((t - c.at) / (c.dur || 1));
        const s = c.fmt(c.from + (c.to - c.from) * ease.out(p));
        if (c.el.__s !== s) {
          c.el.textContent = s;
          c.el.__s = s;
        }
      }

      if (watchers.length) {
        const state = {};
        for (const [name, list] of keys) {
          let v;
          for (const k of list) {
            if (t < k.at) break;
            v = k.value;
          }
          state[name] = v;
        }
        const sig = JSON.stringify(state);
        if (sig !== lastState) {
          lastState = sig;
          for (const fn of watchers) fn(state, t);
        }
      }

      for (const f of frames) f.fn(t);

      // Flights are measured last, after scrolling and the camera have settled.
      for (const f of flights) {
        if (t < f.at || t > f.at + f.dur + f.hold) {
          if (f.el.style.opacity !== "0") f.el.style.opacity = "0";
          continue;
        }
        const a = typeof f.from === "function" ? f.from() : f.from;
        const b = typeof f.to === "function" ? f.to() : f.to;
        if (!a || !b) {
          f.el.style.opacity = "0";
          continue;
        }
        const host = f.layer.getBoundingClientRect();
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const raw = clamp01((t - f.at) / f.dur);
        const p = ease.inOut(raw);
        const lerp = (m, n) => m + (n - m) * p;
        const dist = Math.hypot(rb.left - ra.left, rb.top - ra.top);
        const lift = Math.sin(raw * Math.PI) * Math.min(70, dist * f.arc);
        const x = lerp(ra.left, rb.left) - host.left;
        const y = lerp(ra.top, rb.top) - host.top - lift;
        f.el.style.width = `${lerp(ra.width, rb.width).toFixed(1)}px`;
        f.el.style.height = `${lerp(ra.height, rb.height).toFixed(1)}px`;
        f.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(Math.sin(raw * Math.PI) * -2.5).toFixed(2)}deg)`;
        const fadeIn = Math.min(1, raw / 0.12);
        const fadeOut = t > f.at + f.dur ? 1 - (t - f.at - f.dur) / f.hold : 1;
        f.el.style.opacity = Math.max(0, Math.min(fadeIn, fadeOut)).toFixed(3);
      }

      return t;
    },
  };

  return tl;
}

/** Schedules a run of steps one after another; returns the time after the last. */
export function sequence(start, gap, items, fn) {
  let t = start;
  items.forEach((item, i) => {
    fn(item, t, i);
    t += gap;
  });
  return t;
}
