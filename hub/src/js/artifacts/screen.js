// hub/src/js/artifacts/screen.js
//
// Draws a schematic phone screen from a short list of blocks. Teardown boards
// and PRD evidence strips use it when there is no screenshot to show, or when
// the point is the structure of a screen rather than its pixels.
//
//   screenSvg({ accent: "#14532d", blocks: [
//     ["bar", "Good evening, Maya"],
//     ["card", "Your usual shop", { sub: "23 items · about $61", hi: true, pin: "1.1" }],
//     ["row", "Milk 2L", { right: "$2.10" }],
//     ["cta", "Checkout"],
//   ]})
//
// Block types: bar, title, search, chips, banner, card, row, grid, slots,
// text, gap, cta, tabs, sheet. Options on any block: hi (highlight it),
// pin (a numbered marker), dim (fade it), accent (use the app colour).

const W = 180;
const H = 368;
const PAD = 10;

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const clip = (s, n) => (String(s ?? "").length > n ? String(s).slice(0, n - 1).trimEnd() + "…" : String(s ?? ""));

const HEIGHT = { bar: 30, title: 26, search: 24, chips: 20, banner: 40, card: 46, row: 24, grid: 62, slots: 26, text: 16, gap: 8, cta: 28, tabs: 30, sheet: 0 };

export function screenSvg(spec = {}, { idPrefix = "" } = {}) {
  const accent = spec.accent || "#0b0c0c";
  const blocks = (spec.blocks || []).map((b) => (Array.isArray(b) ? { t: b[0], l: b[1], ...(b[2] || {}) } : b));
  const ink = "#101311";
  const mute = "#8a908b";
  const line = "#e3e5e0";
  const soft = "#f1f2ee";

  let y = 26; // below the status bar
  const out = [];
  const pins = [];
  const tabs = blocks.find((b) => b.t === "tabs");
  const cta = [...blocks].reverse().find((b) => b.t === "cta" && b.fixed !== false);
  const bottomLimit = H - (tabs ? 34 : 6) - (cta ? 0 : 0);

  const text = (x, ty, s, { size = 8, weight = 500, fill = ink, anchor = "start", max = 30 } = {}) =>
    `<text x="${x}" y="${ty}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(clip(s, max))}</text>`;

  for (const b of blocks) {
    if (b.t === "tabs" || b.t === "sheet") continue;
    const h = b.h || HEIGHT[b.t] || 20;
    if (y + h > bottomLimit) break;
    const x = PAD;
    const w = W - PAD * 2;
    const fillCard = b.accent ? accent : "#ffffff";
    const onAccent = b.accent ? "#ffffff" : ink;
    const g = [];

    switch (b.t) {
      case "bar":
        g.push(text(x, y + 13, b.l, { size: 10.5, weight: 700, max: 24 }));
        if (b.sub) g.push(text(x, y + 24, b.sub, { size: 7, fill: mute, max: 34 }));
        g.push(`<circle cx="${W - PAD - 8}" cy="${y + 11}" r="8" fill="${soft}"/>`);
        break;
      case "title":
        g.push(text(x, y + 17, b.l, { size: 13, weight: 700, max: 22 }));
        break;
      case "search":
        g.push(`<rect x="${x}" y="${y}" width="${w}" height="${h - 4}" rx="10" fill="${soft}"/>`);
        g.push(`<circle cx="${x + 11}" cy="${y + 10}" r="3.2" fill="none" stroke="${mute}" stroke-width="1.2"/>`);
        g.push(text(x + 20, y + 13, b.l || "Search", { size: 7.5, fill: mute }));
        break;
      case "chips": {
        const items = b.items || String(b.l || "").split("|");
        let cx = x;
        items.forEach((it, i) => {
          const cw = Math.min(64, 12 + String(it).length * 4.1);
          if (cx + cw > W - PAD) return;
          const on = i === (b.on ?? 0);
          g.push(`<rect x="${cx}" y="${y}" width="${cw}" height="15" rx="7.5" fill="${on ? ink : "#fff"}" stroke="${on ? ink : line}"/>`);
          g.push(text(cx + cw / 2, y + 10.4, it, { size: 6.8, fill: on ? "#fff" : ink, anchor: "middle", max: 14 }));
          cx += cw + 4;
        });
        break;
      }
      case "banner":
        g.push(`<rect x="${x}" y="${y}" width="${w}" height="${h - 6}" rx="9" fill="${b.accent ? accent : soft}"/>`);
        g.push(text(x + 9, y + 15, b.l, { size: 8.5, weight: 700, fill: b.accent ? "#fff" : ink, max: 30 }));
        if (b.sub) g.push(text(x + 9, y + 26, b.sub, { size: 7, fill: b.accent ? "rgba(255,255,255,.8)" : mute, max: 36 }));
        break;
      case "card":
        g.push(`<rect x="${x}" y="${y}" width="${w}" height="${h - 6}" rx="9" fill="${fillCard}" stroke="${b.accent ? accent : line}"/>`);
        g.push(text(x + 9, y + 15, b.l, { size: 8.6, weight: 700, fill: onAccent, max: b.action ? 22 : 30 }));
        if (b.sub) g.push(text(x + 9, y + 27, b.sub, { size: 7, fill: b.accent ? "rgba(255,255,255,.82)" : mute, max: b.action ? 26 : 36 }));
        if (b.action) {
          const aw = 14 + String(b.action).length * 3.9;
          g.push(`<rect x="${x + w - aw - 7}" y="${y + 11}" width="${aw}" height="16" rx="8" fill="${b.accent ? "#fff" : ink}"/>`);
          g.push(text(x + w - aw / 2 - 7, y + 22, b.action, { size: 6.8, weight: 600, fill: b.accent ? accent : "#fff", anchor: "middle", max: 12 }));
        }
        break;
      case "row":
        g.push(`<rect x="${x}" y="${y + 3}" width="14" height="14" rx="4" fill="${soft}"/>`);
        g.push(text(x + 20, y + 13.5, b.l, { size: 8, max: b.right ? 22 : 30, fill: b.warn ? "#c9362b" : ink }));
        if (b.sub) g.push(text(x + 20, y + 21, b.sub, { size: 6.2, fill: mute, max: 34 }));
        if (b.right) g.push(text(W - PAD, y + 13.5, b.right, { size: 7.6, fill: b.warn ? "#c9362b" : mute, anchor: "end", max: 16 }));
        g.push(`<path d="M${x} ${y + h - 1}H${W - PAD}" stroke="${line}" stroke-width=".7"/>`);
        break;
      case "grid": {
        const n = b.n || 3;
        const gw = (w - (n - 1) * 6) / n;
        for (let i = 0; i < n; i++) {
          const gx = x + i * (gw + 6);
          g.push(`<rect x="${gx}" y="${y}" width="${gw}" height="${h - 20}" rx="8" fill="${soft}"/>`);
          g.push(`<rect x="${gx}" y="${y + h - 16}" width="${gw * 0.75}" height="4" rx="2" fill="${line}"/>`);
          g.push(`<rect x="${gx}" y="${y + h - 9}" width="${gw * 0.4}" height="4" rx="2" fill="${line}"/>`);
        }
        break;
      }
      case "slots": {
        const items = b.items || String(b.l || "").split("|");
        const sw = (w - (items.length - 1) * 5) / items.length;
        items.forEach((it, i) => {
          const sx = x + i * (sw + 5);
          const on = i === (b.on ?? -1);
          g.push(`<rect x="${sx}" y="${y}" width="${sw}" height="${h - 6}" rx="7" fill="${on ? accent : "#fff"}" stroke="${on ? accent : line}"/>`);
          g.push(text(sx + sw / 2, y + 13, it, { size: 6.6, weight: 600, fill: on ? "#fff" : ink, anchor: "middle", max: 12 }));
        });
        break;
      }
      case "text":
        g.push(text(x, y + 10, b.l, { size: b.size || 7.4, fill: b.warn ? "#c9362b" : mute, weight: b.bold ? 700 : 500, max: 42 }));
        break;
      case "cta":
        g.push(`<rect x="${x}" y="${y}" width="${w}" height="${h - 6}" rx="11" fill="${b.ghost ? "#fff" : accent}" stroke="${accent}"/>`);
        g.push(text(W / 2, y + 14.5, b.l, { size: 8.4, weight: 700, fill: b.ghost ? accent : "#fff", anchor: "middle", max: 28 }));
        break;
      default:
        break;
    }

    const body = g.join("");
    out.push(b.dim ? `<g opacity=".35">${body}</g>` : body);
    if (b.hi) out.push(`<rect x="${x - 3.5}" y="${y - 3.5}" width="${w + 7}" height="${h + 1}" rx="11" fill="none" stroke="#b6e000" stroke-width="2"/>`);
    if (b.pin) pins.push({ id: b.pin, x: W - PAD - 2, y: y - 1 });
    y += h;
  }

  if (tabs) {
    const items = tabs.items || ["Home", "Search", "Orders", "You"];
    const tw = W / items.length;
    out.push(`<rect x="0" y="${H - 32}" width="${W}" height="32" fill="#fff"/><path d="M0 ${H - 32}H${W}" stroke="${line}"/>`);
    items.forEach((it, i) => {
      const on = i === (tabs.on ?? 0);
      out.push(`<circle cx="${tw * i + tw / 2}" cy="${H - 21}" r="4" fill="${on ? accent : line}"/>`);
      out.push(text(tw * i + tw / 2, H - 8, it, { size: 6.2, fill: on ? ink : mute, anchor: "middle", max: 10 }));
    });
  }

  const sheet = blocks.find((b) => b.t === "sheet");
  if (sheet) {
    const sh = sheet.h || 150;
    out.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="rgba(16,19,17,.38)"/>`);
    out.push(`<rect x="0" y="${H - sh}" width="${W}" height="${sh + 20}" rx="16" fill="#fff"/>`);
    out.push(`<rect x="${W / 2 - 14}" y="${H - sh + 7}" width="28" height="3.5" rx="2" fill="${line}"/>`);
    out.push(text(PAD + 2, H - sh + 28, sheet.l, { size: 10, weight: 700, max: 26 }));
    (sheet.items || []).forEach((it, i) => {
      const iy = H - sh + 40 + i * 26;
      const on = i === (sheet.on ?? 0);
      out.push(`<rect x="${PAD}" y="${iy}" width="${W - PAD * 2}" height="21" rx="8" fill="${on ? "#f3ffc9" : "#fff"}" stroke="${on ? "#b6e000" : line}"/>`);
      out.push(text(PAD + 9, iy + 13.5, it, { size: 7.6, max: 34 }));
    });
    if (sheet.pin) pins.push({ id: sheet.pin, x: W - PAD - 2, y: H - sh + 14 });
  }

  const pinSvg = pins
    .map((p) => {
      const pw = 9 + String(p.id).length * 4.6;
      return `<g><rect x="${p.x - pw}" y="${p.y - 7}" width="${pw}" height="14" rx="7" fill="#dcff4a" stroke="#0b0c0c" stroke-width="1"/><text x="${p.x - pw / 2}" y="${p.y + 3.1}" font-size="7.4" font-weight="700" text-anchor="middle" fill="#0b0c0c" font-family="ui-monospace,Menlo,monospace">${esc(p.id)}</text></g>`;
    })
    .join("");

  const cid = `${idPrefix}sc${Math.abs(hash(JSON.stringify(spec)))}`;
  return `<svg class="scr" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Geist,Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif" role="img" aria-label="${esc(spec.alt || "Schematic screen")}">
<defs><clipPath id="${cid}"><rect width="${W}" height="${H}" rx="22"/></clipPath></defs>
<g clip-path="url(#${cid})">
<rect width="${W}" height="${H}" fill="${spec.bg || "#fbfbf9"}"/>
<text x="14" y="16" font-size="7.4" font-weight="700" fill="${ink}">9:41</text>
<rect x="${W - 34}" y="9" width="20" height="8" rx="2.5" fill="none" stroke="${ink}" stroke-width=".9"/><rect x="${W - 32.4}" y="10.6" width="13" height="4.8" rx="1.2" fill="${ink}"/>
${out.join("\n")}
</g>
<rect x=".6" y=".6" width="${W - 1.2}" height="${H - 1.2}" rx="21.4" fill="none" stroke="rgba(16,19,17,.16)" stroke-width="1.2"/>
${pinSvg}
</svg>`;
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

export const SCREEN = { W, H };
