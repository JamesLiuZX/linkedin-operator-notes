#!/usr/bin/env node
// scripts/weekly-send.mjs
//
// Hands one issue of the weekly to Kit (kit.com), the email service, as a
// broadcast. The issue is the same JSON the site and the feed are built from
// (hub/content/issues/<date>-<slug>.json), so the email cannot say something
// the web page does not.
//
//   node scripts/weekly-send.mjs                 the newest issue, as a DRAFT in Kit
//   node scripts/weekly-send.mjs --send          the newest issue, scheduled to send in 10 minutes
//   node scripts/weekly-send.mjs --issue <slug>  a named issue
//   node scripts/weekly-send.mjs --print         write the email to stdout and stop
//
// Environment:
//   KIT_API_KEY       a Kit v4 API key. Without it the script prints what it
//                     would do and exits 0, so a schedule can run before the
//                     account exists.
//   KIT_SEGMENT_ID    optional. Send to this segment. Default: every subscriber.
//   KIT_TEMPLATE_ID   optional. A Kit email template to wrap the content in.
//   SITE_URL          optional. The public root, for links in the email.
//
// Safe to run twice: before it creates anything it lists the broadcasts in the
// account and stops if one already has this issue's subject. --send refuses
// an issue dated more than six days ago, so an old issue is never mailed by a
// schedule that woke up late.

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { SITE } from "../hub/site.config.mjs";
import { loadWorkflows } from "../hub/lib/content.mjs";
import { emailHtml, issueText } from "../hub/lib/email.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.kit.com/v4";
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const value = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : null);

const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
/** The little markdown an issue uses: links, bold, emphasis and code. */
const mdInline = (s) =>
  esc(s || "")
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.+?)\*/g, "<i>$1</i>")
    .replace(/`(.+?)`/g, "<code>$1</code>");

async function loadIssue() {
  const dir = join(ROOT, "hub", "content", "issues");
  const names = (await readdir(dir)).filter((n) => n.endsWith(".json")).sort();
  if (!names.length) throw new Error("there are no issues in hub/content/issues");
  const want = value("--issue");
  const name = want ? names.find((n) => n === `${want}.json`) : names[names.length - 1];
  if (!name) throw new Error(`no issue called ${want}`);
  return { slug: name.replace(/\.json$/, ""), ...JSON.parse(await readFile(join(dir, name), "utf8")) };
}

async function kit(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "X-Kit-Api-Key": process.env.KIT_API_KEY, "Content-Type": "application/json", Accept: "application/json", ...(init.headers || {}) },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) throw new Error(`Kit answered ${res.status} to ${init.method || "GET"} ${path}: ${typeof body === "string" ? body.slice(0, 400) : JSON.stringify(body).slice(0, 400)}`);
  return body;
}

async function main() {
  const issue = await loadIssue();
  const workflows = await loadWorkflows(ROOT);
  const origin = (process.env.SITE_URL || SITE.defaultOrigin).replace(/\/+$/, "");
  const ctx = {
    workflow: (slug) => workflows.find((w) => w.slug === slug),
    abs: (path) => origin + (path.startsWith("/") ? path : `/${path}`),
    exists: (rel) => existsSync(join(ROOT, rel)),
    mdInline,
  };
  const html = emailHtml(ctx, issue, { fragment: true });
  const text = issueText(ctx, issue);
  const send = flag("--send");

  if (flag("--print")) {
    process.stdout.write(emailHtml(ctx, issue));
    return;
  }

  console.log(`weekly-send: issue ${issue.n}, "${issue.title}" (${issue.date}), ${(html.length / 1024).toFixed(1)} KB of HTML, ${text.split("\n").length} lines of text`);

  if (!process.env.KIT_API_KEY) {
    console.log("weekly-send: KIT_API_KEY is not set, so nothing was sent. The issue is on the site and in the feed. See NEWSLETTER.md for the one-time setup.");
    return;
  }

  if (send) {
    const age = (Date.now() - Date.parse(`${issue.date}T00:00:00Z`)) / 86400000;
    if (!(age >= -1 && age <= 6) && !flag("--force")) {
      throw new Error(`issue ${issue.n} is dated ${issue.date}, which is not this week. Nothing was sent. Pass --force to send it anyway.`);
    }
  }

  const existing = await kit("/broadcasts?per_page=100");
  const twin = (existing?.broadcasts || []).find((b) => b.subject === issue.title);
  if (twin && !flag("--force")) {
    console.log(`weekly-send: Kit already has a broadcast with this subject (id ${twin.id}). Nothing was created.`);
    return;
  }

  const now = new Date();
  const when = new Date(now.getTime() + 10 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
  const segment = Number(process.env.KIT_SEGMENT_ID || 0);
  const payload = {
    subject: issue.title,
    preview_text: issue.preheader || "",
    description: `${SITE.weekly.name}, issue ${issue.n}`,
    content: html,
    public: true,
    published_at: send ? when : now.toISOString().replace(/\.\d{3}Z$/, "Z"),
    // null saves a draft. A time schedules the send.
    send_at: send ? when : null,
    // Kit sends to every subscriber when no filter is given.
    subscriber_filter: segment ? [{ all: [{ type: "segment", ids: [segment] }], any: null, none: null }] : [],
  };
  if (process.env.KIT_TEMPLATE_ID) payload.email_template_id = Number(process.env.KIT_TEMPLATE_ID);

  const made = await kit("/broadcasts", { method: "POST", body: JSON.stringify(payload) });
  const b = made?.broadcast || {};
  console.log(`weekly-send: Kit broadcast ${b.id} created, status ${b.status || "unknown"}${send ? `, scheduled for ${when}` : ". It is a draft: open Kit to check it, then send it there or run again with --send"}.`);
  if (send && b.status === "draft") {
    throw new Error("the broadcast was created as a draft although a send time was given. Open Kit and send it by hand, then check the plan allows scheduled sends through the API.");
  }
}

main().catch((err) => {
  console.error(`weekly-send: ${err.message}`);
  process.exit(1);
});
