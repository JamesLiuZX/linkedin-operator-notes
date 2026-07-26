import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, "..", "..");

function loadDotEnv() {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadDotEnv();

export function getConfig() {
  const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "");
  return {
    siteUrl,
    medium: {
      token: process.env.MEDIUM_INTEGRATION_TOKEN || process.env.MEDIUM_TOKEN || "",
      userId: process.env.MEDIUM_USER_ID || "",
    },
    twitter: {
      apiKey: process.env.TWITTER_API_KEY || "",
      apiSecret: process.env.TWITTER_API_SECRET || "",
      accessToken: process.env.TWITTER_ACCESS_TOKEN || "",
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
    },
    substack: {
      email: process.env.SUBSTACK_POST_EMAIL || "",
      publicationUrl: (process.env.SUBSTACK_PUBLICATION_URL || "").replace(/\/$/, ""),
      fromEmail: process.env.SUBSTACK_FROM_EMAIL || process.env.RESEND_FROM || "",
    },
  };
}

export function checkPlatformConfig(config, platform) {
  const missing = [];

  if (platform === "medium") {
    if (!config.siteUrl || config.siteUrl.includes("your-site")) {
      missing.push("SITE_URL (needed for Medium import-a-story)");
    }
  }

  if (platform === "twitter") {
    if (!config.twitter.apiKey) missing.push("TWITTER_API_KEY");
    if (!config.twitter.apiSecret) missing.push("TWITTER_API_SECRET");
    if (!config.twitter.accessToken) missing.push("TWITTER_ACCESS_TOKEN");
    if (!config.twitter.accessSecret) missing.push("TWITTER_ACCESS_TOKEN_SECRET");
  }

  if (platform === "substack") {
    if (!config.substack.email) missing.push("SUBSTACK_POST_EMAIL");
    const hasResend = !!process.env.RESEND_API_KEY;
    const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    if (!hasResend && !hasSmtp) {
      missing.push("RESEND_API_KEY, or SMTP_HOST + SMTP_USER + SMTP_PASS");
    }
    if (hasResend && !process.env.RESEND_FROM && !process.env.SUBSTACK_FROM_EMAIL) {
      missing.push("RESEND_FROM or SUBSTACK_FROM_EMAIL (Resend needs a verified sender)");
    }
  }

  return { ok: missing.length === 0, missing };
}

/** @deprecated use checkPlatformConfig */
export function requirePlatformConfig(config, platform) {
  return checkPlatformConfig(config, platform).missing;
}
