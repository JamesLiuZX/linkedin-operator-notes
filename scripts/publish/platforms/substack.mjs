import { substackHtmlFromMarkdown, articleCanonicalUrl } from "../../lib/transform.mjs";
import { checkPlatformConfig } from "../config.mjs";

export function checkConfig(config) {
  return checkPlatformConfig(config, "substack");
}

/**
 * Substack has no official publish API. This adapter sends an HTML email
 * to your publication's post-by-email address (Settings → Publishing → Post by email).
 */
export async function publishToSubstack(item, { config }) {
  const cfg = checkConfig(config);
  if (!cfg.ok) {
    throw new Error(`missing config: ${cfg.missing.join(", ")}`);
  }

  const { email } = config.substack;
  const html = substackHtmlFromMarkdown(item.content);
  const boundary = `boundary_${Date.now()}`;
  const canonicalUrl = articleCanonicalUrl(config.siteUrl, item);

  const mime = [
    `From: publish-bot@linkedin-operator-notes.local`,
    `To: ${email}`,
    `Subject: ${item.title}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: text/plain; charset=utf-8`,
    "",
    item.title + (canonicalUrl ? `\n\nRead on site: ${canonicalUrl}` : ""),
    "",
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    "",
    `<html><body><h1>${escapeHtml(item.title)}</h1>${html}${
      canonicalUrl
        ? `<p><em>Originally published at <a href="${canonicalUrl}">${canonicalUrl}</a></em></p>`
        : ""
    }</body></html>`,
    "",
    `--${boundary}--`,
  ].join("\r\n");

  if (process.env.SMTP_HOST) {
    return sendViaSmtp(mime, email);
  }

  if (process.env.RESEND_API_KEY) {
    return sendViaResend(item, html, canonicalUrl, email);
  }

  throw new Error(
    "Substack requires SMTP_HOST (+ SMTP_USER/SMTP_PASS) or RESEND_API_KEY to send post-by-email"
  );
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendViaResend(item, html, canonicalUrl, to) {
  const from =
    process.env.SUBSTACK_FROM_EMAIL || process.env.RESEND_FROM || "publish@resend.dev";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: item.title,
      html: `<h1>${escapeHtml(item.title)}</h1>${html}${
        canonicalUrl
          ? `<p><em>Originally published at <a href="${canonicalUrl}">${canonicalUrl}</a></em></p>`
          : ""
      }`,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Resend API error: ${JSON.stringify(data)}`);
  }

  return {
    ok: true,
    platform: "substack",
    status: "published",
    externalId: data.id,
    url: configPublicationUrl(process.env.SUBSTACK_PUBLICATION_URL),
    method: "email",
  };
}

function configPublicationUrl(url) {
  return url || "(check Substack dashboard for draft)";
}

async function sendViaSmtp(mime, to) {
  const nodemailer = await importNodemailer();
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    raw: mime,
  });

  return {
    ok: true,
    platform: "substack",
    status: "published",
    method: "email",
    url: configPublicationUrl(process.env.SUBSTACK_PUBLICATION_URL),
  };
}

async function importNodemailer() {
  try {
    return await import("nodemailer");
  } catch {
    throw new Error(
      "SMTP delivery requires nodemailer. Run: npm install nodemailer (optional dependency)"
    );
  }
}
