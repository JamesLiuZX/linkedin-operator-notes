#!/usr/bin/env node
/**
 * Cross-post publisher: website → Twitter, Medium, Substack
 *
 * Usage:
 *   node scripts/publish/index.mjs --scheduled     # publish due posts (for cron)
 *   node scripts/publish/index.mjs --dry-run       # preview without posting
 *   node scripts/publish/index.mjs --now <slug>    # publish one item immediately
 *   node scripts/publish/index.mjs --status        # show publish state
 *   node scripts/publish/index.mjs --list          # list all content + schedule
 */
import { readFileSync, writeFileSync } from "node:fs";
import { getConfig, checkPlatformConfig } from "./config.mjs";
import { loadContent, findDueItems, findBySlug } from "./content.mjs";
import {
  loadState,
  saveState,
  recordPublish,
  pendingPlatforms,
  isPublished,
  isQueuedImport,
  listPendingHuman,
} from "./state.mjs";
import { runComplianceChecks, hasBlockingIssues } from "./compliance.mjs";
import * as transform from "../lib/transform.mjs";
import { patchFrontmatter } from "../lib/frontmatter.mjs";
import { publishToTwitter } from "./platforms/twitter.mjs";
import { publishToMedium } from "./platforms/medium.mjs";
import { publishToSubstack } from "./platforms/substack.mjs";
import { publishToLinkedIn } from "./platforms/linkedin.mjs";

const PLATFORMS = {
  twitter: publishToTwitter,
  medium: publishToMedium,
  substack: publishToSubstack,
  linkedin: publishToLinkedIn,
};

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const scheduled = args.includes("--scheduled");
const showStatus = args.includes("--status");
const listAll = args.includes("--list");
const nowIdx = args.indexOf("--now");
const nowSlug = nowIdx !== -1 ? args[nowIdx + 1] : null;

function log(msg) {
  console.log(msg);
}

function logError(msg) {
  console.error(msg);
}

const HUMAN_REQUIRED = (r) => r?.requiresHuman === true || r?.status === "queued-import";

function rollUp(results) {
  const ok = results.filter((r) => r.ok && !HUMAN_REQUIRED(r));
  const pending = results.filter((r) => r.ok && HUMAN_REQUIRED(r));
  const failed = results.filter((r) => !r.ok);

  if (failed.length) return "partial";
  if (pending.length && !ok.length) return "queued-import";
  if (pending.length) return "partial";
  return "published";
}

async function syncStatus(item, status) {
  if (dryRun) return;
  const raw = readFileSync(item.absPath, "utf8");
  const next = patchFrontmatter(raw, {
    status,
    ...(status === "published" ? { publishedAt: new Date().toISOString() } : {}),
  });
  if (next !== raw) writeFileSync(item.absPath, next, "utf8");
}

async function publishItem(item, state, config) {
  const pending = pendingPlatforms(state, item);
  if (!pending.length) {
    log(`  skip  ${item.slug}: already published to all platforms`);
    return { state, results: [] };
  }

  const issues = runComplianceChecks(item);
  for (const issue of issues) {
    const icon = issue.level === "error" ? "x" : "!";
    log(`  ${icon}  ${issue.message}`);
  }
  if (hasBlockingIssues(issues)) {
    log(`  x  ${item.slug}: blocked by compliance checks`);
    return { state, results: [{ ok: false, platform: "compliance", error: "blocked" }] };
  }

  const results = [];

  for (const platform of pending) {
    if (!dryRun && isQueuedImport(state, item.slug, platform)) {
      log(`  ~  ${platform}: already queued for human import; skipping`);
      results.push({ ok: true, platform, status: "queued-import", requiresHuman: true, skipped: true });
      continue;
    }

    const cfg = checkPlatformConfig(config, platform);
    if (!cfg.ok) {
      log(`  x  ${platform}: missing config: ${cfg.missing.join(", ")}`);
      results.push({
        ok: false,
        platform,
        error: `missing config: ${cfg.missing.join(", ")}`,
        skipped: true,
      });
      continue;
    }

    if (dryRun) {
      if (platform === "twitter") {
        const thread = transform.toThread(item, config.siteUrl);
        log(`  -> [dry-run] twitter thread (${thread.length} tweets):`);
        thread.forEach((t, i) => log(`       ${i + 1}. ${t.slice(0, 120)}${t.length > 120 ? "..." : ""}`));
      } else if (platform === "medium" && !config.medium.token) {
        log(
          `  -> [dry-run] medium queued-import (NOT published): ${transform.articleCanonicalUrl(config.siteUrl, item)}`
        );
        results.push({
          ok: true,
          platform: "medium",
          status: "queued-import",
          requiresHuman: true,
          note: "dry-run queue",
        });
      } else {
        log(`  -> [dry-run] would publish ${item.slug} to ${platform}`);
      }
      continue;
    }

    try {
      log(`  -> publishing ${item.slug} to ${platform}...`);
      const fn = PLATFORMS[platform];
      const result = await fn(item, { config, transform });
      const normalized = { ok: true, platform, ...result };
      results.push(normalized);
      state = recordPublish(state, item.slug, platform, normalized);
      saveState(state);
      if (HUMAN_REQUIRED(normalized)) {
        log(`  ~  ${platform}: ${normalized.note || "queued for human"}`);
      } else {
        log(`  ok ${platform}: ${normalized.url || JSON.stringify(normalized)}`);
      }
    } catch (err) {
      logError(`  x  ${platform} failed: ${err.message}`);
      results.push({ ok: false, platform, error: err.message });
    }
  }

  // Only rewrite frontmatter when something was actually attempted this run.
  // A run where every platform was skipped (missing config, or already queued
  // for a human) must leave the item untouched, or one credential-less cron
  // run silently burns the whole queue to `partial`.
  const attempted = results.filter((r) => !r.skipped);
  if (!dryRun && attempted.length) {
    const status = rollUp(results);
    if (status === "published" || status === "partial" || status === "queued-import") {
      await syncStatus(item, status === "queued-import" ? "queued-import" : status);
      log(`  status -> ${status}`);
    }
  }

  return { state, results };
}

async function main() {
  const config = getConfig();
  let state = loadState();
  const items = loadContent();
  let exitCode = 0;

  if (showStatus) {
    log("\nPublish state:\n");
    if (!Object.keys(state.posts).length) {
      log("  (empty — nothing published yet)");
    } else {
      for (const [slug, platforms] of Object.entries(state.posts)) {
        log(`  ${slug}:`);
        for (const [platform, info] of Object.entries(platforms)) {
          const label = info.status || (info.publishedAt ? "published" : "unknown");
          log(
            `    ${platform}: ${label} ${info.publishedAt || info.queuedAt || ""} → ${info.url || info.canonicalUrl || info.externalId || "ok"}`
          );
        }
      }
    }

    const pending = listPendingHuman(state);
    if (pending.length) {
      log(`\n  ${pending.length} item(s) waiting on a human:`);
      const staleMs = 72 * 60 * 60 * 1000;
      for (const p of pending) {
        log(`    ${p.platform}  ${p.slug}  ${p.note || p.canonicalUrl}`);
        if (p.queuedAt && Date.now() - new Date(p.queuedAt).getTime() > staleMs) {
          log(`      STALE (>72h): ${p.queuedAt}`);
          exitCode = 1;
        }
      }
    }
    process.exit(exitCode);
  }

  if (listAll) {
    log("\nContent inventory:\n");
    for (const item of items) {
      const due = item.publishAt ? new Date(item.publishAt).toISOString() : "-";
      const platforms = item.platforms.join(", ") || "-";
      // Was rendered as "published: twitter, medium, substack" for items that
      // had never been published, which reads as the opposite of the truth.
      const done = item.platforms.filter((p) => isPublished(state, item.slug, p));
      log(`  [${item.type}] ${item.slug}`);
      log(`    status: ${item.status} | section: ${item.section} | publishAt: ${due}`);
      log(`    platforms: ${platforms} | published: ${done.join(", ") || "none"}`);
      log(`    canonical: ${transform.articleCanonicalUrl(config.siteUrl, item) || "(set SITE_URL)"}`);
    }
    return;
  }

  let queue = [];

  if (nowSlug) {
    const item = findBySlug(items, nowSlug);
    if (!item) {
      logError(`Slug not found: ${nowSlug}`);
      process.exit(1);
    }
    queue = [item];
    log(`\nPublishing immediately: ${nowSlug}${dryRun ? " (dry-run)" : ""}\n`);
  } else if (scheduled) {
    queue = findDueItems(items);
    log(`\nScheduled publish run${dryRun ? " (dry-run)" : ""}: ${queue.length} item(s) due\n`);
  } else {
    log(`
Cross-post publisher

Commands:
  npm run publish -- --scheduled       Publish all due posts (use in cron)
  npm run publish -- --dry-run --scheduled
  npm run publish -- --now <slug>      Publish one post now
  npm run publish -- --list            Show content inventory
  npm run publish -- --status          Show publish history

Setup: copy .env.example → .env and fill in API keys.
Docs:  PUBLISHING.md
`);
    return;
  }

  if (!queue.length) {
    log("Nothing to publish.");
    return;
  }

  for (const item of queue) {
    log(`\n## ${item.title} (${item.slug})`);
    const out = await publishItem(item, state, config);
    state = out.state;
  }

  log("\nDone.");
}

main().catch((err) => {
  logError(err.stack || err.message);
  process.exit(1);
});
