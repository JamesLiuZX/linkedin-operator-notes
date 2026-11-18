// hub/src/js/stage/timeline.js
//
// A seekable timeline. Every demo is a pure function of time: seek(t) puts the
// page in exactly the state it has at t seconds, forwards or backwards. That
// one property gives the scrubber, replay, reduced-motion (jump to the end)
// and frame-by-frame rendering of clips from the same code.
//
// Nothing here uses timers or CSS transitions. A demo declares what changes
// and when; the player decides what "now" is.

export const ease = {
  linear: (p) => p,
  out: (p) => 1 - Math.pow(1 - p, 3),
  outQuint: (p) => 1 - Math.pow(1 - p, 5),
  inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  back: (p) => 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2),
};

const TRANSFORM = new Set(["x", "y", "scale", "rotate"]);
const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

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
     * props: { opacity: [0, 1], y: [12, 0], scale: [0.96, 1], "--p": [0, 1] }
     * A single number means "to this value from wherever it was".
     */
    to(el, props, { at = 0, dur = 0.5, ease: e = ease.out, unit = "" } = {}) {
      if (!el) return tl;
      if (!tweens.has(el)) tweens.set(el, new Map());
      const map = tweens.get(el);
      for (const [prop, v] of Object.entries(props)) {
        if (!map.has(prop)) map.set(prop, []);
        const list = map.get(prop);
        const prev = list.length ? list[list.length - 1].to : prop === "scale" || prop === "opacity" ? 1 : 0;
        const [from, to] = Array.isArray(v) ? v : [prev, v];
        list.push({ at, dur, from, to, ease: e, unit });
        list.sort((a, b) => a.at - b.at);
      }
      grow(at + dur);
      return tl;
    },

    /** Fade and rise in. The element starts hidden. */
    show(el, at, { dur = 0.5, y = 10, scale = 1 } = {}) {
      const props = { opacity: [0, 1] };
      if (y) props.y = [y, 0];
      if (scale !== 1) props.scale = [scale, 1];
      return tl.to(el, props, { at, dur });
    },

    hide(el, at, { dur = 0.3 } = {}) {
      return tl.to(el, { opacity: 0 }, { at, dur, ease: ease.inOut });
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

    /** Called on every seek with the time. Use for things that follow the layout, like the cursor. */
    each(fn) {
      frames.push(fn);
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
        let sc = 1;
        let rot = 0;
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
            else if (prop === "scale") sc = v;
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
          el.style.transform =
            `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0)` +
            (sc !== 1 ? ` scale(${sc.toFixed(4)})` : "") +
            (rot ? ` rotate(${rot.toFixed(2)}deg)` : "");
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

      for (const fn of frames) fn(t);

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
