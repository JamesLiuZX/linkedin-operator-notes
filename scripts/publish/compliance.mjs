const BLOCKED_PATTERNS = [
  { pattern: /—/g, message: "Contains em dash (use periods, commas, or hyphens instead)" },
  { pattern: /\b(leverage|delve|unlock|robust)\b/gi, message: "Corporate filler word detected" },
  { pattern: /\b(in today's landscape|in today's world)\b/gi, message: "Generic opener detected" },
];

const REQUIRED_FOR_PUBLISH = ["scheduled", "compliance-checked"];
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
      message: `Status must be "scheduled" or "compliance-checked" (current: ${item.status})`,
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
