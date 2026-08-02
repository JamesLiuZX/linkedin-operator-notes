// scripts/lib/linkedin.mjs
//
// LinkedIn is the primary surface, so its mechanics belong in code, not in a
// human's head. Two numbers drive everything here:
//
//   FOLD  the feed collapses the post around 210 characters and appends
//         "see more". Everything before the cut is the entire advertisement
//         for everything after it.
//   MAX   the composer hard-stops at 3000 characters.
//
// Imported by scripts/content-check.mjs and scripts/linkedin.mjs.
// Zero dependencies.

export const FOLD = 210;
export const MAX = 3000;

/** Markdown LinkedIn will render as literal characters. */
export const UNRENDERABLE = [
  [/\*\*[^*\n]+\*\*/g, 'bold (**)'],
  [/(^|\s)_[^_\n]+_(\s|$)/g, 'italic (_)'],
  [/^#{1,6}\s+/gm, 'heading (#)'],
  [/^\s*[-*]\s+/gm, 'markdown bullet (- or *)'],
  [/^\s*>\s+/gm, 'blockquote (>)'],
  [/\[[^\]]+\]\([^)]+\)/g, 'markdown link'],
  [/`[^`\n]+`/g, 'backtick code'],
  [/ {2,}$/gm, 'trailing double-space line break'],
];

/**
 * Split a markdown body into `##` sections. Regex lookahead for "next heading
 * or end of string" is fiddly enough to get wrong quietly, so do it by hand.
 * @returns {Map<string, string>} lowercased heading text -> section body
 */
export function sections(body) {
  const out = new Map();
  const lines = String(body).split('\n');
  let key = '';
  let buf = [];
  const flush = () => {
    if (key) out.set(key, buf.join('\n').trim());
    buf = [];
  };
  for (const line of lines) {
    const h = /^##\s+(.+?)\s*$/.exec(line);
    if (h) {
      flush();
      key = h[1].toLowerCase();
    } else if (key) {
      buf.push(line);
    }
  }
  flush();
  return out;
}

function clean(text) {
  return String(text)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^---\s*$/gm, '')
    .trim();
}

/**
 * Pull the publishable body out of a post file.
 * Everything above the Draft heading is editorial metadata for the operator.
 */
export function draftBody(body) {
  const secs = sections(body);
  for (const [k, v] of secs) if (k.startsWith('draft')) return clean(v);
  return clean(body);
}

/** The block that goes in the first comment: links, kept out of the body. */
export function firstCommentBlock(body) {
  const secs = sections(body);
  for (const [k, v] of secs) if (k.startsWith('first comment')) return clean(v);
  return '';
}

/** Trailing hashtags, which LinkedIn reads but readers mostly do not. */
export function hashtags(text) {
  return [...text.matchAll(/(?:^|\s)(#[A-Za-z][A-Za-z0-9]{1,39})/g)].map((m) => m[1]);
}

export function bareUrls(text) {
  return [...text.matchAll(/https?:\/\/\S+/g)].map((m) => m[0]);
}

/**
 * Defensive markdown -> LinkedIn plain text. Posts should be authored plain,
 * but a stray asterisk should never reach the clipboard.
 */
export function toPlainText(text) {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$)/g, '$1$2')
    .replace(/(^|\s)_([^_\n]+)_(?=\s|$)/g, '$1$2')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/^\s*[-*]\s+/gm, '· ')
    .replace(/^\s*>\s+/gm, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * What the feed shows before "see more".
 * Newlines count against the budget, which is why dense openers lose.
 */
export function fold(text, limit = FOLD) {
  const plain = toPlainText(text);
  if (plain.length <= limit) return { visible: plain, hidden: '', truncated: false };
  const cut = plain.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');
  return {
    visible: cut,
    hidden: plain.slice(limit),
    truncated: true,
    // A fold that ends mid-word wastes its last few characters.
    cleanBreak: /[.!?\n]\s*$/.test(cut) || lastSpace > limit - 12,
  };
}

/** Everything the checker and the renderer both need, computed once. */
export function analyzeLinkedIn(body) {
  const draft = draftBody(body);
  const plain = toPlainText(draft);
  return {
    draft,
    plain,
    chars: plain.length,
    fold: fold(draft),
    hashtags: hashtags(draft),
    urls: bareUrls(draft),
    firstComment: firstCommentBlock(body),
    unrenderable: UNRENDERABLE.flatMap(([re, label]) => {
      const hits = draft.match(re) || [];
      return hits.length ? [{ label, count: hits.length, sample: hits[0].trim().slice(0, 40) }] : [];
    }),
  };
}
