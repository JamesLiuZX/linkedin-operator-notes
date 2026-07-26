import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { ROOT } from "./config.mjs";

const STATE_DIR = join(ROOT, ".publish");
const STATE_FILE = join(STATE_DIR, "state.json");

function emptyState() {
  return { version: 1, posts: {} };
}

export function loadState() {
  if (!existsSync(STATE_FILE)) return emptyState();
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
}

export function isPublished(state, slug, platform) {
  const entry = state.posts[slug]?.[platform];
  if (!entry?.publishedAt) return false;
  if (entry.status === "queued-import" || entry.requiresHuman) return false;
  return true;
}

export function isQueuedImport(state, slug, platform = "medium") {
  const entry = state.posts[slug]?.[platform];
  return Boolean(entry && (entry.status === "queued-import" || entry.requiresHuman));
}

export function recordPublish(state, slug, platform, result) {
  if (!state.posts[slug]) state.posts[slug] = {};
  const human = result.requiresHuman === true || result.status === "queued-import";
  state.posts[slug][platform] = {
    ...(human
      ? { queuedAt: new Date().toISOString(), publishedAt: null }
      : { publishedAt: new Date().toISOString() }),
    ...result,
  };
  return state;
}

export function pendingPlatforms(state, item) {
  return item.platforms.filter((p) => !isPublished(state, item.slug, p));
}

export function listPendingHuman(state) {
  const out = [];
  for (const [slug, platforms] of Object.entries(state.posts || {})) {
    for (const [platform, info] of Object.entries(platforms || {})) {
      if (info?.requiresHuman || info?.status === "queued-import") {
        out.push({
          slug,
          platform,
          queuedAt: info.queuedAt || info.publishedAt || null,
          note: info.note || "",
          canonicalUrl: info.canonicalUrl || "",
        });
      }
    }
  }
  return out;
}
