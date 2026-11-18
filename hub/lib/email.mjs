// hub/lib/email.mjs
//
// One newsletter issue as email HTML (tables and inline styles, because mail
// clients ignore most CSS) and as plain text. The site's issue page, the feed
// and the sending script all read the same issue JSON, so they cannot drift.

import { SITE } from "../site.config.mjs";
import { esc } from "./html.mjs";

const INK = "#0b0c0c";
const MUTED = "#6c716e";
const LINE = "#e4e4de";
const HI = "#dcff4a";
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-11-18" as "18 Nov 2026". */
const day = (issue) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(issue.date || "");
  return issue.dateLabel || (m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : issue.date || "");
};

const label = (n, text) =>
  `<p style="margin:0 0 10px;font:600 11px/1.4 ${MONO};letter-spacing:.08em;text-transform:uppercase;color:${MUTED}"><span style="background:${HI};color:${INK};padding:2px 6px;border-radius:4px">${n}</span>&nbsp;&nbsp;${esc(text)}</p>`;
const h = (text) => `<h2 style="margin:0 0 10px;font:600 22px/1.25 ${FONT};letter-spacing:-.02em;color:${INK}">${esc(text)}</h2>`;
const p = (html, extra = "") => `<p style="margin:0 0 12px;font:400 16px/1.6 ${FONT};color:#262927;${extra}">${html}</p>`;
const a = (href, text) => `<a href="${esc(href)}" style="color:${INK};text-decoration:underline">${esc(text)}</a>`;
const rule = `<tr><td style="padding:0 28px"><div style="border-top:1px solid ${LINE};font-size:0;line-height:0">&nbsp;</div></td></tr>`;
const block = (inner) => `<tr><td style="padding:26px 28px">${inner}</td></tr>`;
const button = (href, text) =>
  `<a href="${esc(href)}" style="display:inline-block;background:${INK};color:#fbfbf9;font:600 15px/1 ${FONT};text-decoration:none;padding:13px 20px;border-radius:999px">${esc(text)}</a>`;

export function emailHtml(ctx, issue, { fragment = false } = {}) {
  const w = ctx.workflow(issue.workflow?.slug);
  const link = (path) => ctx.abs(path);
  const contents = [
    w ? `The workflow: ${w.short || w.title}` : null,
    ...(issue.things || []).map((t) => t.title),
    issue.tip ? `One tip: ${issue.tip.title}` : null,
  ].filter(Boolean);

  const rows = [];

  rows.push(
    block(`
      <p style="margin:0 0 14px;font:600 11px/1.4 ${MONO};letter-spacing:.08em;text-transform:uppercase;color:${MUTED}">${esc(SITE.weekly.name)} · Issue ${esc(String(issue.n))} · ${esc(day(issue))}</p>
      <h1 style="margin:0 0 14px;font:600 30px/1.15 ${FONT};letter-spacing:-.03em;color:${INK}">${esc(issue.title)}</h1>
      ${p(esc(issue.hook))}
      <p style="margin:14px 0 6px;font:600 13px/1.4 ${FONT};color:${INK}">In this issue</p>
      <ul style="margin:0;padding:0 0 0 18px;font:400 15px/1.6 ${FONT};color:#262927">${contents.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`)
  );

  if (w) {
    rows.push(rule);
    rows.push(
      block(`
      ${label("01", "The workflow")}
      ${h(w.title)}
      ${p(esc(issue.workflow.why || w.promise))}
      <ol style="margin:0 0 14px;padding:0 0 0 20px;font:400 16px/1.6 ${FONT};color:#262927">${(issue.workflow.steps || []).map((s) => `<li style="margin:0 0 4px">${ctx.mdInline(s)}</li>`).join("")}</ol>
      ${issue.workflow.prompt ? `<p style="margin:0 0 14px;padding:12px 14px;background:${INK};color:#eef1ea;border-radius:10px;font:400 13.5px/1.5 ${MONO}">${esc(issue.workflow.prompt)}</p>` : ""}
      ${issue.workflow.matters ? p(`<b>Why it matters:</b> ${esc(issue.workflow.matters)}`) : ""}`)
    );
    rows.push(rule);
    rows.push(
      block(`
      ${label("02", "Try it")}
      ${p(esc(issue.demo?.line || "The demo plays in the page. No install and no sign-up."))}
      ${
        ctx.exists && ctx.exists(`hub/static/hub/posters/${w.slug}.png`)
          ? `<a href="${esc(link(`/workflows/${w.slug}/`))}" style="display:block;margin:4px 0 16px"><img src="${esc(link(`/hub/posters/${w.slug}.png`))}" width="562" alt="The finished output of ${esc(w.title)}" style="display:block;width:100%;max-width:562px;height:auto;border:0;border-radius:12px"></a>`
          : ""
      }
      <p style="margin:6px 0 0">${button(link(`/workflows/${w.slug}/`), "Watch the run and open the output")}</p>`)
    );
  }

  if ((issue.things || []).length) {
    rows.push(rule);
    rows.push(
      block(`
      ${label("03", "Three things that matter this week")}
      ${issue.things
        .map(
          (t) => `
        <h3 style="margin:16px 0 6px;font:600 17px/1.3 ${FONT};color:${INK}">${esc(t.title)}</h3>
        ${p(`<b>What happened:</b> ${esc(t.what)}`, "margin-bottom:6px;")}
        ${p(`<b>Why it matters:</b> ${esc(t.why)}`, "margin-bottom:6px;")}
        ${t.catch ? p(`<b>The catch:</b> ${esc(t.catch)}`, "margin-bottom:6px;") : ""}
        ${t.source?.url ? `<p style="margin:0 0 4px;font:400 13px/1.5 ${FONT};color:${MUTED}">Source: ${a(t.source.url, t.source.label || "link")}</p>` : ""}`
        )
        .join("")}`)
    );
  }

  if (issue.tip) {
    rows.push(rule);
    rows.push(block(`${label("04", "One tip")}${h(issue.tip.title)}${p(esc(issue.tip.body))}`));
  }

  if (issue.number) {
    rows.push(rule);
    rows.push(
      block(`
      ${label("05", "One number")}
      <p style="margin:0 0 6px;font:600 44px/1 ${FONT};letter-spacing:-.04em;color:${INK}">${esc(issue.number.value)}</p>
      ${p(esc(issue.number.label))}
      ${issue.number.source?.url ? `<p style="margin:0;font:400 13px/1.5 ${FONT};color:${MUTED}">Source: ${a(issue.number.source.url, issue.number.source.label || "link")}</p>` : ""}`)
    );
  }

  if ((issue.changelog || []).length) {
    rows.push(rule);
    rows.push(
      block(`
      ${label("06", "Changelog")}
      <ul style="margin:0;padding:0 0 0 18px;font:400 15px/1.6 ${FONT};color:#262927">${issue.changelog
        .map((c) => `<li><span style="font-family:${MONO};font-size:13.5px">${esc(c.skill)}</span> ${esc(c.version || "")}: ${esc(c.note)}</li>`)
        .join("")}</ul>`)
    );
  }

  rows.push(rule);
  rows.push(
    block(`
      ${p(`Got a bad result from one of these workflows? Reply and tell me what you gave it. That is the most useful email I get.`)}
      ${p(`${a(link(`/weekly/${issue.slug}/`), "Read this issue on the web")} · ${a(link("/workflows/"), "All workflows")} · ${a(link("/skills/"), "Install the skills")}`, `font-size:14px;color:${MUTED};`)}
      <p style="margin:14px 0 0;font:400 13px/1.5 ${FONT};color:${MUTED}">${esc(SITE.name)}, by ${esc(SITE.author.name)}. Examples use a fictional company and fictional data.</p>`)
  );

  const table = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid ${LINE};border-radius:14px">${rows.join("")}</table>`;
  if (fragment) return table;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(issue.title)}</title></head>
<body style="margin:0;padding:24px 12px;background:#f3f3ef">
<div style="display:none;max-height:0;overflow:hidden">${esc(issue.preheader || "")}</div>
${table}
</body></html>
`;
}

/** The same issue as plain text, for the text part of the email. */
export function issueText(ctx, issue) {
  const w = ctx.workflow(issue.workflow?.slug);
  const L = [];
  L.push(`${SITE.weekly.name} · Issue ${issue.n} · ${day(issue)}`, "", issue.title.toUpperCase(), "", issue.hook, "");
  if (w) {
    L.push("01 THE WORKFLOW", w.title, issue.workflow.why || w.promise, "");
    (issue.workflow.steps || []).forEach((s, i) => L.push(`${i + 1}. ${String(s).replace(/[*`]/g, "")}`));
    if (issue.workflow.prompt) L.push("", `  ${issue.workflow.prompt}`);
    if (issue.workflow.matters) L.push("", `Why it matters: ${issue.workflow.matters}`);
    L.push("", "02 TRY IT", ctx.abs(`/workflows/${w.slug}/`), "");
  }
  if ((issue.things || []).length) {
    L.push("03 THREE THINGS THAT MATTER THIS WEEK", "");
    for (const t of issue.things) {
      L.push(t.title, `What happened: ${t.what}`, `Why it matters: ${t.why}`);
      if (t.catch) L.push(`The catch: ${t.catch}`);
      if (t.source?.url) L.push(`Source: ${t.source.url}`);
      L.push("");
    }
  }
  if (issue.tip) L.push("04 ONE TIP", issue.tip.title, issue.tip.body, "");
  if (issue.number) L.push("05 ONE NUMBER", `${issue.number.value}: ${issue.number.label}`, issue.number.source?.url ? `Source: ${issue.number.source.url}` : "", "");
  if ((issue.changelog || []).length) {
    L.push("06 CHANGELOG");
    for (const c of issue.changelog) L.push(`- ${c.skill} ${c.version || ""}: ${c.note}`);
    L.push("");
  }
  L.push(`Read on the web: ${ctx.abs(`/weekly/${issue.slug}/`)}`);
  return L.join("\n");
}
