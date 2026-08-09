// scripts/lib/transform.mjs
// Platform text transforms: X threads, Medium body cleanup, Substack HTML.
// Zero dependencies, browser-safe, so the dashboard can render the exact same
// ready-to-paste text the API-based publisher would send, not a second
// reimplementation of the same formatting rules.

const MAX_TWEET = 280;
const HARD_MAX_TWEETS = 9;

export function stripMarkdownForTwitter(text) {
  return text
    .replace(/<figure>[\s\S]*?<\/figure>/gi, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function firstParagraph(body) {
  return body
    .replace(/^#{1,6}\s.*$/gm, "")
    .replace(/<figure>[\s\S]*?<\/figure>/gi, "")
    .trim()
    .split(/\n{2,}/)[0]
    .replace(/\s+/g, " ");
}

export function splitToTweets(text, maxLen = 275) {
  const clean = stripMarkdownForTwitter(text);
  const paragraphs = clean.split(/\n\n+/).filter(Boolean);
  const tweets = [];
  let current = "";

  for (const para of paragraphs) {
    const candidate = current ? `${current}\n\n${para}` : para;
    if (candidate.length <= maxLen) {
      current = candidate;
      continue;
    }
    if (current) tweets.push(current);
    if (para.length <= maxLen) {
      current = para;
      continue;
    }
    const words = para.split(/\s+/);
    current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length <= maxLen) {
        current = next;
      } else {
        if (current) tweets.push(current);
        current = word.slice(0, maxLen);
      }
    }
  }
  if (current) tweets.push(current);
  return tweets;
}

/** @deprecated use toThread */
export function splitTwitterThread(text, { maxLen = MAX_TWEET, link = "" } = {}) {
  const tweets = splitToTweets(text, maxLen - 5);
  if (link && tweets.length) {
    const last = tweets[tweets.length - 1];
    const suffix = `\n\n${link}`;
    if (last.length + suffix.length <= maxLen) {
      tweets[tweets.length - 1] = last + suffix;
    } else {
      tweets.push(link);
    }
  }
  return tweets;
}

export function toThread(item, siteUrl) {
  const url = articleCanonicalUrl(siteUrl, item);
  const kind = item.kind || item.type;

  if (kind === "article") {
    const lead = (
      item.twitterExcerpt ||
      item.frontmatter?.twitterExcerpt ||
      firstParagraph(item.content || item.body || "").slice(0, 260)
    ).trim();
    const beats = (item.twitterBeats || item.frontmatter?.twitterBeats || []).slice(
      0,
      HARD_MAX_TWEETS - 2
    );
    return [lead, ...beats, url ? `Full piece: ${url}` : ""].filter(Boolean);
  }

  const body = item.twitterExcerpt || item.content || item.body || "";
  const parts = splitToTweets(body, 275);
  if (parts.length > HARD_MAX_TWEETS) {
    return [...parts.slice(0, HARD_MAX_TWEETS - 1), url ? `Rest here: ${url}` : parts[HARD_MAX_TWEETS - 1]].filter(
      Boolean
    );
  }
  if (url && parts.length) {
    const last = parts[parts.length - 1];
    const suffix = `\n\n${url}`;
    if (last.length + suffix.length <= MAX_TWEET) parts[parts.length - 1] = last + suffix;
    else parts.push(url);
  }
  return parts;
}

export function articleCanonicalUrl(siteUrl, itemOrSlug, section) {
  if (!siteUrl) return "";
  const base = String(siteUrl).replace(/\/$/, "");
  if (typeof itemOrSlug === "string") {
    const sec = section || "notes";
    return `${base}/${sec}/${itemOrSlug}`;
  }
  const item = itemOrSlug || {};
  const slug = item.slug;
  const sec = item.section || "notes";
  return `${base}/${sec}/${slug}`;
}

export function mediumContent(markdown) {
  return markdown
    .replace(/<figure>[\s\S]*?<\/figure>/gi, "")
    .replace(/^#\s+.+\n+/m, "")
    .trim();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Lightweight markdown → HTML for Substack email. Handles links + images. */
export function substackHtmlFromMarkdown(markdown) {
  let body = markdown.replace(/^#\s+.+\n+/m, "").replace(/<figure>[\s\S]*?<\/figure>/gi, "");

  body = body
    .replace(/!\[[^\]]*\]\(([^)]+)\)/g, '<img src="$1" alt="" style="max-width:100%" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^\s*[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .split(/\n{2,}/)
    .map((block) => {
      const t = block.trim();
      if (!t) return "";
      if (/^<(h\d|ul|li|img|p)/i.test(t)) return t;
      return `<p>${t.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  return body;
}

export function linkedinPlainText(content) {
  return stripMarkdownForTwitter(content);
}

export { escapeHtml, HARD_MAX_TWEETS };
