import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../config.mjs";

/**
 * Medium stopped issuing new integration tokens
 * (https://help.medium.com/hc/en-us/articles/213480228-API-Importing).
 *
 * Paths:
 * 1. Legacy token in .env → try the old REST API
 * 2. No token → queue a manual import reminder (NOT published)
 */
export async function publishToMedium(item, { config, transform }) {
  const { token, userId } = config.medium;

  if (token && userId) {
    return publishViaLegacyApi(item, { config, transform });
  }

  if (token && !userId) {
    const id = await resolveMediumUserId(token);
    return publishViaLegacyApi(item, {
      config: { ...config, medium: { token, userId: id } },
      transform,
    });
  }

  return queueManualImport(item, { config, transform });
}

async function publishViaLegacyApi(item, { config, transform }) {
  const { token, userId } = config.medium;
  const url = `https://api.medium.com/v1/users/${userId}/posts`;
  const canonicalUrl = transform.articleCanonicalUrl(config.siteUrl, item);
  const content = transform.mediumContent(item.content);

  const body = {
    title: item.title,
    contentFormat: "markdown",
    content,
    tags: item.tags.slice(0, 5),
    publishStatus: "public",
  };
  if (canonicalUrl) body.canonicalUrl = canonicalUrl;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Medium API error: ${JSON.stringify(data)}. ` +
        `If you cannot create tokens in Settings, Medium has closed new API access — leave MEDIUM_* empty to use import-URL mode.`
    );
  }

  return {
    ok: true,
    method: "api",
    platform: "medium",
    status: "published",
    externalId: data.data?.id,
    url: data.data?.url,
  };
}

function queueManualImport(item, { config, transform }) {
  const canonicalUrl = transform.articleCanonicalUrl(config.siteUrl, item);
  if (!canonicalUrl || canonicalUrl.includes("your-site")) {
    throw new Error(
      "Medium has no new API tokens. Set SITE_URL to your live article URL, then import via Medium → Write → Import a story. See PUBLISHING.md."
    );
  }

  const importUrl = `https://medium.com/p/import`;
  const queueDir = join(ROOT, ".publish");
  mkdirSync(queueDir, { recursive: true });
  const line =
    JSON.stringify({
      slug: item.slug,
      title: item.title,
      canonicalUrl,
      queuedAt: new Date().toISOString(),
      steps: [
        `Open ${importUrl}`,
        `Paste: ${canonicalUrl}`,
        "Review draft on Medium and publish",
      ],
    }) + "\n";
  appendFileSync(join(queueDir, "medium-import-queue.jsonl"), line);

  console.log(`  i  Medium: no API token. Queued for manual import (NOT published).`);
  console.log(`  i  Import manually: ${importUrl}`);
  console.log(`  i  Paste URL: ${canonicalUrl}`);

  return {
    ok: true,
    method: "manual_import",
    platform: "medium",
    status: "queued-import",
    url: null,
    canonicalUrl,
    requiresHuman: true,
    note: "Queued in .publish/medium-import-queue.jsonl. Import manually at medium.com/p/import",
  };
}

export async function resolveMediumUserId(token) {
  const res = await fetch("https://api.medium.com/v1/me", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Medium /me error: ${JSON.stringify(data)}`);
  }
  return data.data?.id;
}
