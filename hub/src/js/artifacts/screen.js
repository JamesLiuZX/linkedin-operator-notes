// hub/src/js/artifacts/screen.js
//
// Draws a schematic screen from a short list of blocks, as a phone or as a
// desktop window. Teardown boards and PRD evidence strips use it when there is
// no screenshot to show, or when the point is the structure of a screen and
// not its pixels.
//
//   screenSvg({ accent: "#14532d", blocks: [
//     ["bar", "Good evening, Maya"],
//     ["card", "Your usual shop", { sub: "23 items · about $61", hi: true, pin: "1.1" }],
//     ["row", "Milk 2L", { right: "$2.10" }],
//     ["cta", "Checkout"],
//   ]})
//
//   screenSvg({ frame: "desktop", url: "app.larkspur.example/projects", accent: "#3157d5",
//     nav: { title: "Larkspur", items: ["Home", "Projects", "Docs", "People"], on: 1 },
//     blocks: [["bar", "Q3 roadmap", { action: "Share" }], ["table", "", { cols: [...], rows: [...] }]] })
//
// Blocks flow top to bottom. Types: bar, title, search, chips, banner, card,
// row, grid, slots, text, para, gap, cta, field, toggle, people, table, kpi,
// chat, check, media, progress, cols. Overlays: tabs, sheet, modal, toast.
// Options on any block: hi (highlight it), pin (a numbered marker), dim (fade
// it), accent (use the app colour), warn (draw it as a problem).

const FRAMES = {
  phone: { W: 180, H: 368, pad: 10, top: 26, radius: 22 },
  desktop: { W: 372, H: 248, pad: 12, top: 20, radius: 9 },
};

const INK = "#101311";
const MUTE = "#8a908b";
const LINE = "#e3e5e0";
const SOFT = "#f1f2ee";
const WARN = "#c9362b";
const HI = "#b6e000";

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const clip = (s, n) => (String(s ?? "").length > n ? String(s).slice(0, Math.max(1, n - 1)).trimEnd() + "…" : String(s ?? ""));
/** How many characters of a given size fit a width. Rough, and on the safe side. */
const fit = (w, size) => Math.max(3, Math.floor(w / (size * 0.54)));

function wrap(s, chars, maxLines) {
  const words = String(s ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const word of words) {
    if (!cur) cur = word;
    else if ((cur + " " + word).length <= chars) cur += " " + word;
    else {
      lines.push(cur);
      cur = word;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = clip(kept[maxLines - 1] + " " + lines[maxLines], chars);
    if (!kept[maxLines - 1].endsWith("…")) kept[maxLines - 1] = clip(kept[maxLines - 1] + "…", chars + 1);
    return kept;
  }
  return lines;
}

const initials = (name) =>
  String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

const norm = (b) => (Array.isArray(b) ? { t: b[0], l: b[1], ...(b[2] || {}) } : b || {});

const BASE_H = { bar: 30, title: 26, search: 24, chips: 20, banner: 40, card: 46, row: 24, grid: 62, slots: 26, text: 16, gap: 8, cta: 28, field: 36, toggle: 26, people: 26, kpi: 40, check: 22, media: 64, progress: 26 };

export function screenSvg(spec = {}, { idPrefix = "", onDrop = null } = {}) {
  const F = FRAMES[spec.frame === "desktop" ? "desktop" : "phone"];
  const desktop = F === FRAMES.desktop;
  const { W, H } = F;
  const accent = spec.accent || "#0b0c0c";
  const blocks = (spec.blocks || []).map(norm);
  const out = [];
  const pins = [];

  const text = (x, y, s, { size = 8, weight = 500, fill = INK, anchor = "start", max = 30 } = {}) =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(clip(s, max))}</text>`;

  const badge = (xr, y, label, { fill = SOFT, color = INK } = {}) => {
    const bw = 8 + String(label).length * 3.7;
    return {
      w: bw,
      svg: `<rect x="${xr - bw}" y="${y}" width="${bw}" height="11" rx="5.5" fill="${fill}"/>${text(xr - bw / 2, y + 7.9, label, { size: 6.2, weight: 600, fill: color, anchor: "middle", max: 14 })}`,
    };
  };

  /** Height a block will take at a given width. */
  const heightOf = (b, w) => {
    if (b.h) return b.h;
    switch (b.t) {
      case "para":
        return wrap(b.l, fit(w, b.size || 7.6), b.lines || 4).length * 10.5 + 6;
      case "chat":
        return wrap(b.l, fit(w * 0.78 - 14, 7.4), b.lines || 4).length * 10 + 16;
      case "table":
        return 16 + (b.rows || []).length * 15 + 6;
      case "cols": {
        const split = b.split || 0.5;
        const lw = w * split - 5;
        const rw = w * (1 - split) - 5;
        const sum = (list, cw) => (list || []).map(norm).reduce((n, x) => n + heightOf(x, cw), 0);
        return Math.max(sum(b.left, lw), sum(b.right, rw)) + 2;
      }
      case "card":
        return b.sub2 ? 58 : BASE_H.card;
      default:
        return BASE_H[b.t] || 20;
    }
  };

  function flow(list, x, y0, w, bottom) {
    let y = y0;
    for (const b of list) {
      if (["tabs", "sheet", "modal", "toast"].includes(b.t)) continue;
      const h = heightOf(b, w);
      if (y + h > bottom) {
        // Whatever does not fit is left out. Callers that care can be told.
        if (onDrop) onDrop(b);
        break;
      }
      const g = [];
      const onAccent = b.accent ? "#ffffff" : INK;
      const right = x + w;

      switch (b.t) {
        case "bar": {
          g.push(text(x, y + 13, b.l, { size: desktop ? 11.5 : 10.5, weight: 700, max: fit(w - (b.action ? 70 : 24), 10.5) }));
          if (b.sub) g.push(text(x, y + 24, b.sub, { size: 7, fill: MUTE, max: fit(w - 24, 7) }));
          if (b.action) {
            const aw = 16 + String(b.action).length * 4.1;
            g.push(`<rect x="${right - aw}" y="${y + 2}" width="${aw}" height="17" rx="6" fill="${accent}"/>`);
            g.push(text(right - aw / 2, y + 13.6, b.action, { size: 7.2, weight: 600, fill: "#fff", anchor: "middle", max: 16 }));
          } else if (!desktop) {
            g.push(`<circle cx="${right - 8}" cy="${y + 11}" r="8" fill="${SOFT}"/>`);
          }
          break;
        }
        case "title":
          g.push(text(x, y + 17, b.l, { size: 13, weight: 700, max: fit(w, 13) }));
          break;
        case "search":
          g.push(`<rect x="${x}" y="${y}" width="${w}" height="${h - 4}" rx="10" fill="${SOFT}"/>`);
          g.push(`<circle cx="${x + 11}" cy="${y + 10}" r="3.2" fill="none" stroke="${MUTE}" stroke-width="1.2"/>`);
          g.push(text(x + 20, y + 13, b.l || "Search", { size: 7.5, fill: MUTE, max: fit(w - 26, 7.5) }));
          break;
        case "chips": {
          const items = b.items || String(b.l || "").split("|");
          let cx = x;
          items.forEach((it, i) => {
            const cw = Math.min(84, 12 + String(it).length * 4.1);
            if (cx + cw > right) return;
            const on = i === (b.on ?? 0);
            g.push(`<rect x="${cx}" y="${y}" width="${cw}" height="15" rx="7.5" fill="${on ? INK : "#fff"}" stroke="${on ? INK : LINE}"/>`);
            g.push(text(cx + cw / 2, y + 10.4, it, { size: 6.8, fill: on ? "#fff" : INK, anchor: "middle", max: 18 }));
            cx += cw + 4;
          });
          break;
        }
        case "banner":
          g.push(`<rect x="${x}" y="${y}" width="${w}" height="${h - 6}" rx="9" fill="${b.accent ? accent : b.warn ? "#fdeae7" : SOFT}"/>`);
          g.push(text(x + 9, y + 15, b.l, { size: 8.5, weight: 700, fill: b.accent ? "#fff" : b.warn ? WARN : INK, max: fit(w - 18, 8.5) }));
          if (b.sub) g.push(text(x + 9, y + 26, b.sub, { size: 7, fill: b.accent ? "rgba(255,255,255,.8)" : MUTE, max: fit(w - 18, 7) }));
          break;
        case "card": {
          g.push(`<rect x="${x}" y="${y}" width="${w}" height="${h - 6}" rx="9" fill="${b.accent ? accent : "#ffffff"}" stroke="${b.accent ? accent : b.warn ? "#f0a9a2" : LINE}"/>`);
          const aw = b.action ? 14 + String(b.action).length * 3.9 : 0;
          const room = w - 18 - (aw ? aw + 8 : 0);
          g.push(text(x + 9, y + 15, b.l, { size: 8.6, weight: 700, fill: onAccent, max: fit(room, 8.6) }));
          if (b.sub) g.push(text(x + 9, y + 27, b.sub, { size: 7, fill: b.accent ? "rgba(255,255,255,.82)" : MUTE, max: fit(room, 7) }));
          if (b.sub2) g.push(text(x + 9, y + 38, b.sub2, { size: 7, fill: b.accent ? "rgba(255,255,255,.82)" : MUTE, max: fit(room, 7) }));
          if (b.action) {
            g.push(`<rect x="${right - aw - 7}" y="${y + 11}" width="${aw}" height="16" rx="8" fill="${b.accent ? "#fff" : INK}"/>`);
            g.push(text(right - aw / 2 - 7, y + 22, b.action, { size: 6.8, weight: 600, fill: b.accent ? accent : "#fff", anchor: "middle", max: 14 }));
          } else if (b.badge) {
            g.push(badge(right - 8, y + 8, b.badge, b.accent ? { fill: "rgba(255,255,255,.22)", color: "#fff" } : {}).svg);
          }
          break;
        }
        case "row": {
          const lead = b.avatar ? 18 : 20;
          if (b.avatar) {
            g.push(`<circle cx="${x + 7}" cy="${y + 10}" r="7" fill="${SOFT}" stroke="${LINE}"/>`);
            g.push(text(x + 7, y + 12.4, initials(b.avatar), { size: 5.6, weight: 700, fill: MUTE, anchor: "middle", max: 2 }));
          } else {
            g.push(`<rect x="${x}" y="${y + 3}" width="14" height="14" rx="4" fill="${SOFT}"/>`);
          }
          let rr = right;
          if (b.badge) {
            const bd = badge(rr, y + 4.5, b.badge);
            g.push(bd.svg);
            rr -= bd.w + 5;
          }
          if (b.right) {
            g.push(text(rr, y + 13.5, b.right, { size: 7.6, fill: b.warn ? WARN : MUTE, anchor: "end", max: 22 }));
            rr -= String(b.right).length * 4.2 + 6;
          }
          g.push(text(x + lead, y + (b.sub ? 11.5 : 13.5), b.l, { size: 8, max: fit(rr - x - lead, 8), fill: b.warn ? WARN : INK }));
          if (b.sub) g.push(text(x + lead, y + 20.5, b.sub, { size: 6.2, fill: MUTE, max: fit(rr - x - lead, 6.2) }));
          g.push(`<path d="M${x} ${y + h - 1}H${right}" stroke="${LINE}" stroke-width=".7"/>`);
          break;
        }
        case "grid": {
          const n = b.n || 3;
          const gw = (w - (n - 1) * 6) / n;
          for (let i = 0; i < n; i++) {
            const gx = x + i * (gw + 6);
            g.push(`<rect x="${gx}" y="${y}" width="${gw}" height="${h - 20}" rx="8" fill="${SOFT}"/>`);
            g.push(`<rect x="${gx}" y="${y + h - 16}" width="${gw * 0.75}" height="4" rx="2" fill="${LINE}"/>`);
            g.push(`<rect x="${gx}" y="${y + h - 9}" width="${gw * 0.4}" height="4" rx="2" fill="${LINE}"/>`);
          }
          break;
        }
        case "slots": {
          const items = b.items || String(b.l || "").split("|");
          const sw = (w - (items.length - 1) * 5) / items.length;
          items.forEach((it, i) => {
            const sx = x + i * (sw + 5);
            const on = i === (b.on ?? -1);
            g.push(`<rect x="${sx}" y="${y}" width="${sw}" height="${h - 6}" rx="7" fill="${on ? accent : "#fff"}" stroke="${on ? accent : LINE}"/>`);
            g.push(text(sx + sw / 2, y + 13, it, { size: 6.6, weight: 600, fill: on ? "#fff" : INK, anchor: "middle", max: fit(sw - 4, 6.6) }));
          });
          break;
        }
        case "text":
          g.push(text(x, y + 10, b.l, { size: b.size || 7.4, fill: b.warn ? WARN : b.ink ? INK : MUTE, weight: b.bold ? 700 : 500, max: fit(w, b.size || 7.4) }));
          break;
        case "para": {
          const size = b.size || 7.6;
          const lines = wrap(b.l, fit(w, size), b.lines || 4);
          lines.forEach((ln, i) => g.push(text(x, y + 9 + i * 10.5, ln, { size, fill: b.warn ? WARN : INK, max: 200 })));
          if (b.cite) {
            const last = lines[lines.length - 1] || "";
            const cx = Math.min(right - 30, x + last.length * size * 0.5 + 5);
            const cy = y + 2 + (lines.length - 1) * 10.5;
            g.push(`<rect x="${cx}" y="${cy}" width="${10 + String(b.cite).length * 3.6}" height="10" rx="5" fill="${accent}" opacity=".14"/>`);
            g.push(text(cx + 5, cy + 7.3, b.cite, { size: 6, weight: 600, fill: accent, max: 10 }));
          }
          break;
        }
        case "cta": {
          const cw = desktop && !b.wide ? Math.min(w, 26 + String(b.l).length * 4.6) : w;
          const cx = desktop && b.align === "right" ? right - cw : x;
          g.push(`<rect x="${cx}" y="${y}" width="${cw}" height="${h - 6}" rx="${desktop ? 7 : 11}" fill="${b.ghost ? "#fff" : accent}" stroke="${accent}"/>`);
          g.push(text(cx + cw / 2, y + 14.5, b.l, { size: 8.4, weight: 700, fill: b.ghost ? accent : "#fff", anchor: "middle", max: fit(cw - 8, 8.4) }));
          break;
        }
        case "field":
          g.push(text(x, y + 8, b.l, { size: 6.8, weight: 600, fill: MUTE, max: fit(w, 6.8) }));
          g.push(`<rect x="${x}" y="${y + 12}" width="${w}" height="18" rx="6" fill="#fff" stroke="${b.warn ? WARN : LINE}"/>`);
          g.push(text(x + 7, y + 24, b.value || b.hint || "", { size: 7.4, fill: b.value ? INK : MUTE, max: fit(w - 14, 7.4) }));
          break;
        case "toggle": {
          g.push(text(x, y + (b.sub ? 10 : 13), b.l, { size: 8, max: fit(w - 34, 8) }));
          if (b.sub) g.push(text(x, y + 19, b.sub, { size: 6.2, fill: MUTE, max: fit(w - 34, 6.2) }));
          g.push(`<rect x="${right - 24}" y="${y + 4}" width="24" height="13" rx="6.5" fill="${b.on ? accent : LINE}"/>`);
          g.push(`<circle cx="${b.on ? right - 6.5 : right - 17.5}" cy="${y + 10.5}" r="4.8" fill="#fff"/>`);
          g.push(`<path d="M${x} ${y + h - 1}H${right}" stroke="${LINE}" stroke-width=".7"/>`);
          break;
        }
        case "people": {
          const items = b.items || [];
          items.slice(0, 6).forEach((p, i) => {
            const cx = x + 8 + i * 13;
            g.push(`<circle cx="${cx}" cy="${y + 10}" r="8" fill="${i === 0 ? accent : SOFT}" stroke="#fff" stroke-width="1.4"/>`);
            g.push(text(cx, y + 12.4, String(p).startsWith("+") ? p : initials(p), { size: 5.6, weight: 700, fill: i === 0 ? "#fff" : MUTE, anchor: "middle", max: 3 }));
          });
          const lx = x + 8 + Math.min(items.length, 6) * 13 + 4;
          if (b.l) g.push(text(lx, y + 13, b.l, { size: 7.4, fill: MUTE, max: fit(right - lx, 7.4) }));
          break;
        }
        case "table": {
          const cols = b.cols || [];
          const n = Math.max(1, cols.length);
          const cw = w / n;
          g.push(`<rect x="${x}" y="${y}" width="${w}" height="14" rx="4" fill="${SOFT}"/>`);
          cols.forEach((c, i) => g.push(text(x + 6 + i * cw, y + 9.6, c, { size: 6.4, weight: 600, fill: MUTE, max: fit(cw - 8, 6.4) })));
          (b.rows || []).forEach((row, r) => {
            const ry = y + 16 + r * 15;
            if (r === b.on) g.push(`<rect x="${x}" y="${ry}" width="${w}" height="14" rx="4" fill="${accent}" opacity=".1"/>`);
            row.forEach((cell, i) => g.push(text(x + 6 + i * cw, ry + 9.8, cell, { size: 7.2, weight: i === 0 ? 600 : 500, fill: i === 0 ? INK : MUTE, max: fit(cw - 8, 7.2) })));
            g.push(`<path d="M${x} ${ry + 14.5}H${right}" stroke="${LINE}" stroke-width=".6"/>`);
          });
          break;
        }
        case "kpi": {
          const items = b.items || [];
          const kw = w / Math.max(1, items.length);
          items.forEach(([value, label], i) => {
            g.push(text(x + i * kw, y + 17, value, { size: 15, weight: 700, max: fit(kw - 4, 15) }));
            g.push(text(x + i * kw, y + 29, label, { size: 6.6, fill: MUTE, max: fit(kw - 4, 6.6) }));
          });
          break;
        }
        case "chat": {
          const mine = b.from === "me";
          const bw = w * 0.78;
          const lines = wrap(b.l, fit(bw - 14, 7.4), b.lines || 4);
          const bh = lines.length * 10 + 10;
          const bx = mine ? right - bw : x;
          g.push(`<rect x="${bx}" y="${y}" width="${bw}" height="${bh}" rx="9" fill="${mine ? accent : SOFT}"/>`);
          lines.forEach((ln, i) => g.push(text(bx + 7, y + 11.5 + i * 10, ln, { size: 7.4, fill: mine ? "#fff" : INK, max: 200 })));
          if (b.cite) g.push(badge(bx + bw - 6, y + bh - 14, b.cite, { fill: "#fff", color: accent }).svg);
          break;
        }
        case "check": {
          g.push(`<rect x="${x}" y="${y + 3}" width="12" height="12" rx="3.5" fill="${b.done ? accent : "#fff"}" stroke="${b.done ? accent : b.warn ? WARN : MUTE}" stroke-width="1"/>`);
          if (b.done) g.push(`<path d="M${x + 3} ${y + 9.2}l2.2 2.2 4-4.4" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`);
          let rr = right;
          if (b.badge) {
            const bd = badge(rr, y + 3.5, b.badge, b.warn ? { fill: "#fdeae7", color: WARN } : {});
            g.push(bd.svg);
            rr -= bd.w + 5;
          }
          g.push(text(x + 18, y + (b.sub ? 9.5 : 12.5), b.l, { size: 7.8, fill: b.warn ? WARN : INK, max: fit(rr - x - 18, 7.8) }));
          if (b.sub) g.push(text(x + 18, y + 18.5, b.sub, { size: 6.2, fill: MUTE, max: fit(rr - x - 18, 6.2) }));
          break;
        }
        case "media":
          g.push(`<rect x="${x}" y="${y}" width="${w}" height="${h - 6}" rx="8" fill="#1d211f"/>`);
          g.push(`<circle cx="${x + w / 2}" cy="${y + (h - 6) / 2}" r="10" fill="rgba(255,255,255,.16)"/>`);
          g.push(`<path d="M${x + w / 2 - 3} ${y + (h - 6) / 2 - 5}l8 5-8 5z" fill="#fff"/>`);
          if (b.l) g.push(text(x + 7, y + h - 12, b.l, { size: 6.8, fill: "rgba(255,255,255,.85)", max: fit(w - 14, 6.8) }));
          break;
        case "progress": {
          const total = b.total || 1;
          const value = Math.min(total, b.value || 0);
          g.push(text(x, y + 9, b.l, { size: 7.4, weight: 600, max: fit(w - 30, 7.4) }));
          g.push(text(right, y + 9, `${value} of ${total}`, { size: 6.8, fill: MUTE, anchor: "end", max: 10 }));
          g.push(`<rect x="${x}" y="${y + 14}" width="${w}" height="5" rx="2.5" fill="${LINE}"/>`);
          g.push(`<rect x="${x}" y="${y + 14}" width="${(w * value) / total}" height="5" rx="2.5" fill="${accent}"/>`);
          break;
        }
        case "cols": {
          const split = b.split || 0.5;
          const lw = w * split - 5;
          const rw = w * (1 - split) - 5;
          flow((b.left || []).map(norm), x, y, lw, bottom);
          flow((b.right || []).map(norm), x + lw + 10, y, rw, bottom);
          if (b.rule) g.push(`<path d="M${x + lw + 5} ${y}V${y + h - 4}" stroke="${LINE}" stroke-width=".8"/>`);
          break;
        }
        default:
          break;
      }

      const body = g.join("");
      out.push(b.dim ? `<g opacity=".35">${body}</g>` : body);
      if (b.hi) out.push(`<rect x="${x - 3.5}" y="${y - 3.5}" width="${w + 7}" height="${h + 1}" rx="${desktop ? 8 : 11}" fill="none" stroke="${HI}" stroke-width="2"/>`);
      if (b.pin) pins.push({ id: b.pin, x: x + w - 2, y: y - 1 });
      y += h;
    }
    return y;
  }

  // Frame furniture first, so the content area is known.
  let x0 = F.pad;
  let top = F.top;
  let width = W - F.pad * 2;
  const chrome = [];

  if (desktop) {
    chrome.push(`<rect width="${W}" height="16" fill="#eceee9"/>`);
    chrome.push(`<circle cx="9" cy="8" r="2.4" fill="#d5d8d1"/><circle cx="17" cy="8" r="2.4" fill="#d5d8d1"/><circle cx="25" cy="8" r="2.4" fill="#d5d8d1"/>`);
    chrome.push(`<rect x="${W / 2 - 70}" y="3.5" width="140" height="9" rx="4.5" fill="#fbfbf9"/>`);
    chrome.push(text(W / 2, 10.4, spec.url || "", { size: 5.8, fill: MUTE, anchor: "middle", max: 40 }));
    top = 16 + 10;
    if (spec.nav) {
      const nw = 76;
      const nav = spec.nav;
      chrome.push(`<rect x="0" y="16" width="${nw}" height="${H - 16}" fill="#f4f5f1"/><path d="M${nw} 16V${H}" stroke="${LINE}" stroke-width=".8"/>`);
      chrome.push(`<rect x="9" y="24" width="11" height="11" rx="3" fill="${accent}"/>`);
      chrome.push(text(25, 33, nav.title || "", { size: 8, weight: 700, max: 11 }));
      (nav.items || []).forEach((it, i) => {
        const iy = 44 + i * 16;
        const on = i === (nav.on ?? 0);
        if (on) chrome.push(`<rect x="5" y="${iy - 2}" width="${nw - 10}" height="14" rx="5" fill="#fff" stroke="${LINE}"/>`);
        chrome.push(`<rect x="10" y="${iy + 2}" width="6" height="6" rx="2" fill="${on ? accent : "#cfd3cb"}"/>`);
        chrome.push(text(21, iy + 8, it, { size: 7, weight: on ? 600 : 500, fill: on ? INK : MUTE, max: 12 }));
      });
      x0 = nw + F.pad;
      width = W - nw - F.pad * 2;
    }
  }

  const tabs = blocks.find((b) => b.t === "tabs");
  const bottom = H - (tabs ? 34 : 6);
  flow(blocks, x0, top, width, bottom);

  if (tabs && !desktop) {
    const items = tabs.items || ["Home", "Search", "Orders", "You"];
    const tw = W / items.length;
    out.push(`<rect x="0" y="${H - 32}" width="${W}" height="32" fill="#fff"/><path d="M0 ${H - 32}H${W}" stroke="${LINE}"/>`);
    items.forEach((it, i) => {
      const on = i === (tabs.on ?? 0);
      out.push(`<circle cx="${tw * i + tw / 2}" cy="${H - 21}" r="4" fill="${on ? accent : LINE}"/>`);
      out.push(text(tw * i + tw / 2, H - 8, it, { size: 6.2, fill: on ? INK : MUTE, anchor: "middle", max: 10 }));
    });
  }

  const sheet = blocks.find((b) => b.t === "sheet");
  if (sheet) {
    const sh = sheet.h || 150;
    out.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="rgba(16,19,17,.38)"/>`);
    out.push(`<rect x="0" y="${H - sh}" width="${W}" height="${sh + 20}" rx="16" fill="#fff"/>`);
    out.push(`<rect x="${W / 2 - 14}" y="${H - sh + 7}" width="28" height="3.5" rx="2" fill="${LINE}"/>`);
    out.push(text(F.pad + 2, H - sh + 28, sheet.l, { size: 10, weight: 700, max: fit(W - 24, 10) }));
    (sheet.items || []).forEach((it, i) => {
      const iy = H - sh + 40 + i * 26;
      const on = i === (sheet.on ?? 0);
      out.push(`<rect x="${F.pad}" y="${iy}" width="${W - F.pad * 2}" height="21" rx="8" fill="${on ? "#f3ffc9" : "#fff"}" stroke="${on ? HI : LINE}"/>`);
      out.push(text(F.pad + 9, iy + 13.5, it, { size: 7.6, max: fit(W - 40, 7.6) }));
    });
    if (sheet.pin) pins.push({ id: sheet.pin, x: W - F.pad - 2, y: H - sh + 14 });
  }

  const modal = blocks.find((b) => b.t === "modal");
  if (modal) {
    const items = modal.items || [];
    const mw = Math.min(W - 24, desktop ? 210 : 156);
    const mh = modal.h || 44 + (modal.sub ? 12 : 0) + (modal.field ? 26 : 0) + items.length * 18 + (modal.cta ? 26 : 0);
    const mx = (W - mw) / 2;
    const my = Math.max(20, (H - mh) / 2);
    out.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="rgba(16,19,17,.38)"/>`);
    out.push(`<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="11" fill="#fff"/>`);
    let cy = my + 20;
    out.push(text(mx + 12, cy, modal.l, { size: 10, weight: 700, max: fit(mw - 24, 10) }));
    if (modal.sub) {
      cy += 12;
      out.push(text(mx + 12, cy, modal.sub, { size: 6.8, fill: MUTE, max: fit(mw - 24, 6.8) }));
    }
    cy += 10;
    if (modal.field) {
      out.push(`<rect x="${mx + 12}" y="${cy}" width="${mw - 24}" height="18" rx="6" fill="#fff" stroke="${LINE}"/>`);
      out.push(text(mx + 19, cy + 12, modal.field, { size: 7.2, fill: MUTE, max: fit(mw - 38, 7.2) }));
      cy += 26;
    }
    items.forEach((it, i) => {
      const on = i === modal.on;
      out.push(`<rect x="${mx + 12}" y="${cy}" width="${mw - 24}" height="15" rx="5" fill="${on ? "#f3ffc9" : SOFT}" stroke="${on ? HI : "none"}"/>`);
      out.push(text(mx + 19, cy + 10.4, it, { size: 7.2, max: fit(mw - 38, 7.2) }));
      cy += 18;
    });
    if (modal.cta) {
      const cw = 22 + String(modal.cta).length * 4.4;
      out.push(`<rect x="${mx + mw - 12 - cw}" y="${cy + 2}" width="${cw}" height="18" rx="6" fill="${accent}"/>`);
      out.push(text(mx + mw - 12 - cw / 2, cy + 14, modal.cta, { size: 7.6, weight: 700, fill: "#fff", anchor: "middle", max: 20 }));
    }
    if (modal.pin) pins.push({ id: modal.pin, x: mx + mw - 4, y: my + 2 });
  }

  const toast = blocks.find((b) => b.t === "toast");
  if (toast) {
    const tw = Math.min(W - 24, 24 + String(toast.l).length * 4.2);
    out.push(`<rect x="${(W - tw) / 2}" y="${H - (tabs ? 58 : 30)}" width="${tw}" height="20" rx="10" fill="${INK}"/>`);
    out.push(text(W / 2, H - (tabs ? 58 : 30) + 13, toast.l, { size: 7.4, weight: 600, fill: "#fff", anchor: "middle", max: fit(tw - 12, 7.4) }));
  }

  const pinSvg = pins
    .map((p) => {
      const pw = 9 + String(p.id).length * 4.6;
      return `<g><rect x="${p.x - pw}" y="${p.y - 7}" width="${pw}" height="14" rx="7" fill="#dcff4a" stroke="#0b0c0c" stroke-width="1"/><text x="${p.x - pw / 2}" y="${p.y + 3.1}" font-size="7.4" font-weight="700" text-anchor="middle" fill="#0b0c0c" font-family="ui-monospace,Menlo,monospace">${esc(p.id)}</text></g>`;
    })
    .join("");

  const cid = `${idPrefix}sc${Math.abs(hash(JSON.stringify(spec)))}`;
  const statusBar = desktop
    ? ""
    : `<text x="14" y="16" font-size="7.4" font-weight="700" fill="${INK}">9:41</text>
<rect x="${W - 34}" y="9" width="20" height="8" rx="2.5" fill="none" stroke="${INK}" stroke-width=".9"/><rect x="${W - 32.4}" y="10.6" width="13" height="4.8" rx="1.2" fill="${INK}"/>`;

  return `<svg class="scr scr-${desktop ? "desktop" : "phone"}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Geist,Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif" role="img" aria-label="${esc(spec.alt || "Schematic screen")}">
<defs><clipPath id="${cid}"><rect width="${W}" height="${H}" rx="${F.radius}"/></clipPath></defs>
<g clip-path="url(#${cid})">
<rect width="${W}" height="${H}" fill="${spec.bg || "#fbfbf9"}"/>
${chrome.join("\n")}
${statusBar}
${out.join("\n")}
</g>
<rect x=".6" y=".6" width="${W - 1.2}" height="${H - 1.2}" rx="${F.radius - 0.6}" fill="none" stroke="rgba(16,19,17,.16)" stroke-width="1.2"/>
${pinSvg}
</svg>`;
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

export const SCREEN = { W: FRAMES.phone.W, H: FRAMES.phone.H, FRAMES };
