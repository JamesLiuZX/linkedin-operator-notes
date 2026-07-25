#!/usr/bin/env node
/**
 * Resolve Unsplash image URLs for articles.
 *
 * Strategy:
 * 1) Prefer curated free photo IDs (hand-picked for metaphor fit)
 * 2) Fall back to napi search with require/exclude keyword filters
 * 3) Write articles/unsplash-manifest.json (does not overwrite prose)
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SLOTS = {
  "01-three-trust-surfaces": {
    hero: {
      prefer: ["pLqfIJcN2Xk", "L1dNukudxBk", "a6hh1DdC5DM", "6RNpPq8pWBQ"],
      queries: ["empty soccer stadium red seats", "empty stadium seats blue hour"],
      requireAny: ["stadium", "seat", "arena", "grandstand"],
      excludeAny: ["crowd", "people", "player", "fans", "match", "celebrat"],
    },
    inline: {
      price: {
        prefer: ["fiXLQXAhCfk", "Wb63zqJ5gnE", "IrRbSND5EUc"],
        queries: ["stock market candlestick chart dark"],
        requireAny: ["chart", "stock", "graph", "trading", "monitor"],
        excludeAny: ["person smiling", "handshake"],
      },
      resolution: {
        prefer: ["6sl88x150Xs", "veNb0DDegzE", "nSpj-Z12lX0"],
        queries: ["wooden gavel marble"],
        requireAny: ["gavel", "mallet", "judge"],
        excludeAny: [],
      },
      surprise: {
        prefer: ["sgNc8aY6Z7E", "cDGWgZdqHWY", "0VGG7cqTwCo"],
        queries: ["person holding phone dark bokeh"],
        requireAny: ["phone", "smartphone", "iphone"],
        excludeAny: ["selfie smile"],
      },
      tuesday: {
        prefer: ["3nROCRjZiFQ", "e-jR0DlAN6k", "M97M2_9IFlE"],
        queries: ["empty office room morning"],
        requireAny: ["office", "empty", "room", "desk", "hallway"],
        excludeAny: ["crowd", "party"],
      },
    },
  },
  "02-after-the-final": {
    hero: {
      prefer: ["pLqfIJcN2Xk", "WEBC3t9RjC4", "a6hh1DdC5DM"],
      queries: ["empty football stadium lights"],
      requireAny: ["stadium", "empty", "seat"],
      excludeAny: ["crowd", "fans", "player", "celebrat"],
    },
    inline: {
      peak: {
        prefer: ["2rjjnfdlwGY", "65yjpk2HSlA"],
        queries: ["packed stadium night lights"],
        requireAny: ["stadium", "crowd", "fans", "packed"],
        excludeAny: [],
      },
      bridge: {
        prefer: ["flRm0z3MEoA", "3nROCRjZiFQ"],
        queries: ["notebook planning desk"],
        requireAny: ["notebook", "notepad", "desk", "calendar", "office"],
        excludeAny: [],
      },
    },
  },
  "03-prototype-aggressively-productionize-suspiciously": {
    hero: {
      prefer: ["JV_R_DNzIWU", "mp11_hrQXf8"],
      queries: ["laptop code editor dark mode"],
      requireAny: ["laptop", "computer", "code", "screen", "monitor"],
      excludeAny: [],
    },
    inline: {
      demo: {
        prefer: ["26MJGnSoOqmRc", "26MJGnCM0Wc"],
        queries: ["whiteboard product sketch"],
        requireAny: ["whiteboard", "sketch", "presentation", "meeting"],
        excludeAny: [],
      },
      gates: {
        prefer: [],
        queries: ["metal lock macro", "security gate"],
        requireAny: ["lock", "key", "gate", "security"],
        excludeAny: [],
      },
    },
  },
};

async function getPhoto(id) {
  const res = await fetch(`https://unsplash.com/napi/photos/${id}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "linkedin-operator-notes/1.0",
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function search(query, perPage = 15) {
  const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "linkedin-operator-notes/1.0",
    },
  });
  if (!res.ok) throw new Error(`search ${res.status}: ${query}`);
  const data = await res.json();
  return data.results ?? [];
}

function isFree(photo) {
  if (!photo || photo.premium || photo.plus) return false;
  const u = photo.urls?.regular || photo.urls?.raw || "";
  return u.includes("images.unsplash.com") && !u.includes("plus.unsplash.com");
}

function textOf(photo) {
  return `${photo.alt_description || ""} ${photo.description || ""} ${photo.slug || ""}`.toLowerCase();
}

function passesFilters(photo, cfg) {
  if (!isFree(photo)) return false;
  const t = textOf(photo);
  if (cfg.requireAny?.length && !cfg.requireAny.some((k) => t.includes(k.toLowerCase()))) {
    return false;
  }
  if (cfg.excludeAny?.some((k) => t.includes(k.toLowerCase()))) return false;
  return true;
}

function normalize(photo, role, query) {
  const raw = photo.urls.raw || photo.urls.full;
  return {
    id: photo.id,
    role,
    query,
    alt: photo.alt_description || photo.description || query,
    photographer: photo.user?.name || "Unknown",
    photographerUrl: photo.user?.links?.html || "https://unsplash.com",
    unsplashUrl: photo.links?.html || `https://unsplash.com/photos/${photo.id}`,
    url: `${raw}&w=1600&auto=format&fit=crop&q=80`,
    thumb: photo.urls.small,
    color: photo.color,
    likes: photo.likes || 0,
  };
}

async function resolveSlot(cfg, excludeIds) {
  for (const id of cfg.prefer || []) {
    if (excludeIds.has(id)) continue;
    const photo = await getPhoto(id);
    await sleep(150);
    if (photo && isFree(photo)) {
      // preferred IDs skip keyword filters — curated
      excludeIds.add(photo.id);
      return normalize(photo, "slot", `id:${id}`);
    }
  }

  let best = null;
  for (const q of cfg.queries || []) {
    const results = await search(q);
    await sleep(200);
    for (const photo of results) {
      if (excludeIds.has(photo.id)) continue;
      if (!passesFilters(photo, cfg)) continue;
      const n = normalize(photo, "slot", q);
      if (!best || n.likes > best.likes) best = n;
    }
  }
  if (!best) return null;
  excludeIds.add(best.id);
  return best;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const manifest = { generatedAt: new Date().toISOString(), source: "unsplash-napi", articles: {} };
  const excludeIds = new Set();

  for (const [slug, article] of Object.entries(SLOTS)) {
    console.log(`\n→ ${slug}`);
    const hero = await resolveSlot(article.hero, excludeIds);
    if (!hero) throw new Error(`No hero for ${slug}`);
    hero.role = "hero";
    console.log(`  hero  ${hero.id}  ${hero.alt}`);

    const inline = {};
    for (const [key, cfg] of Object.entries(article.inline || {})) {
      const img = await resolveSlot(cfg, excludeIds);
      if (!img) {
        console.warn(`  ! missing ${key}`);
        continue;
      }
      img.role = key;
      inline[key] = img;
      console.log(`  ${key.padEnd(10)} ${img.id}  ${img.alt}`);
    }
    manifest.articles[slug] = { hero, inline };
  }

  writeFileSync(join(root, "articles/unsplash-manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\nWrote articles/unsplash-manifest.json`);
  console.log("Prose is hand-edited (see WRITING.md). Re-run does not overwrite article bodies.");
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
