const BLOCKED_PATTERNS = [
  { pattern: /—/g, message: "Contains em dash (use periods, commas, or hyphens instead)" },
  // "leverage" was previously banned outright as filler. In a derivatives and
  // prediction markets corpus it is domain vocabulary (leveraged positions,
  // liquidation), so only the verb-phrase form is filler. Same for the others.
  { pattern: /\bleverage (the|our|your|this|these|their)\b/gi, message: "Corporate filler: 'leverage the ...'" },
  { pattern: /\bunlock (the|our|your|new|hidden)\b/gi, message: "Corporate filler: 'unlock the ...'" },
  { pattern: /\b(delve into|robust solution|holistic approach)\b/gi, message: "Corporate filler phrase" },
  { pattern: /\b(in today's landscape|in today's world)\b/gi, message: "Generic opener detected" },
];

/**
 * The things README.md actually warns about. The style checks above are style;
 * these are the ones that cost a job. Flagged for human review rather than
 * auto-blocked, because only the author knows what is already public.
 */
const DISCLOSURE_PATTERNS = [
  {
    pattern: /\b(our|internal|company)\s+(dau|mau|arr|gmv|revenue|volume|retention|conversion)\b/gi,
    message: "Possible non-public metric. Confirm this figure is publicly disclosed.",
  },
  {
    pattern: /\b(unreleased|unannounced|upcoming|next quarter'?s?)\s+(feature|launch|product|roadmap|integration)\b/gi,
    message: "Possible unreleased roadmap detail. Confirm this is public.",
  },
  {
    pattern: /\b(crypto\.com|bytedance|tiktok)\b[^.]{0,80}\b(\d[\d,.]*\s?(%|k|m|bn|users|traders))/gi,
    message: "Named employer next to a figure. Confirm the figure is from a public source.",
  },
  {
    pattern: /\b(a customer|a client|one user|a partner) (told|asked|complained|reported)\b/gi,
    message: "Possible customer anecdote. Confirm it is anonymized and shareable.",
  },
];

const REQUIRED_FOR_PUBLISH = ["scheduled", "compliance-checked", "partial"];
// Align with WRITING.md / content-check.mjs essay band
const ARTICLE_MIN_WORDS = 900;
const ARTICLE_TARGET_MIN = 900;
const ARTICLE_TARGET_MAX = 2200;

function wordCount(text) {
  const stripped = text
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!stripped) return 0;
  return stripped.split(" ").length;
}

export function runComplianceChecks(item) {
  const issues = [];
  const text = item.content;

  for (const { pattern, message } of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      issues.push({ level: "error", message });
      pattern.lastIndex = 0;
    }
  }

  for (const { pattern, message } of DISCLOSURE_PATTERNS) {
    const hits = text.match(pattern);
    pattern.lastIndex = 0;
    if (hits) issues.push({ level: "warn", message: `${message} (${hits[0].trim().slice(0, 60)})` });
  }

  // An unfilled slot must never reach a platform. The generator leaves these
  // deliberately rather than inventing a number the author has not confirmed.
  const holes = text.match(/\{\{[\s\S]*?\}\}/g);
  if (holes) {
    issues.push({
      level: "error",
      message: `${holes.length} unfilled {{ }} slot(s). Fill them or unschedule this piece.`,
    });
  }

  if (item.type === "article") {
    const words = wordCount(text);
    if (words < ARTICLE_MIN_WORDS) {
      issues.push({
        level: "error",
        message: `Article is ${words} words; essays need ≥ ${ARTICLE_MIN_WORDS} (target ${ARTICLE_TARGET_MIN}–${ARTICLE_TARGET_MAX}). See WRITING.md`,
      });
    } else if (words > ARTICLE_TARGET_MAX) {
      issues.push({
        level: "warn",
        message: `Article is ${words} words; above target band ${ARTICLE_TARGET_MIN}–${ARTICLE_TARGET_MAX}`,
      });
    }

    if (
      !/##?\s*Takeaway/i.test(text) &&
      !/^\s*\*{0,2}takeaway\*{0,2}\s*:/im.test(text)
    ) {
      issues.push({ level: "warn", message: "Missing Takeaway section (recommended per WRITING.md)" });
    }

    if (!(item.twitterExcerpt || item.frontmatter?.twitterExcerpt)) {
      issues.push({
        level: "warn",
        message: "No twitterExcerpt; X will fall back to the first paragraph",
      });
    }
  }

  if (!REQUIRED_FOR_PUBLISH.includes(item.status)) {
    issues.push({
      level: "error",
      message: `Status must be one of ${REQUIRED_FOR_PUBLISH.map((s) => `"${s}"`).join(", ")} (current: ${item.status})`,
    });
  }

  if (!item.platforms.length) {
    issues.push({ level: "error", message: "No platforms configured in frontmatter" });
  }

  if (!item.publishAt) {
    issues.push({ level: "error", message: "Missing publishAt in frontmatter" });
  }

  return issues;
}

export function hasBlockingIssues(issues) {
  return issues.some((i) => i.level === "error");
}
