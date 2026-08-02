// scripts/lib/frontmatter.mjs
// ONE parser. Imported by scripts/publish/content.mjs, scripts/content-check.mjs,
// and site/src/content.js. Deleting the duplicates is the point of this file.
// Zero dependencies. Handles the subset of YAML this repo actually uses.

const LIST_KEYS = new Set(["platforms", "tags", "authors", "twitterBeats"]);
const CSV_OBJECT_KEYS = new Set([
  "prefer",
  "queries",
  "requireAny",
  "excludeAny",
]);

function coerceScalar(key, value) {
  const v = value.trim();
  if (v === "") return "";
  if (LIST_KEYS.has(key) || CSV_OBJECT_KEYS.has(key)) {
    return v
      .replace(/^\[|\]$/g, "")
      .split(/\s*\|\s*|,\s*/)
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null" || v === "~") return null;
  const unquoted = v.replace(/^["']|["']$/g, "");
  if (/^-?\d+(\.\d+)?$/.test(unquoted) && key !== "slug") return Number(unquoted);
  return unquoted;
}

/**
 * @param {string} raw full file contents
 * @returns {{ data: Record<string, any>, body: string, hasFrontmatter: boolean }}
 */
export function parseFrontmatter(raw) {
  const text = String(raw).replace(/^\uFEFF/, "");
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return { data: {}, body: text, hasFrontmatter: false };

  const data = {};
  let currentListKey = null;
  let currentObject = null;

  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    // Nested object field under a list item: "    prefer: a, b"
    const nested = /^(\s{2,})([A-Za-z0-9_.-]+)\s*:\s*(.*)$/.exec(line);
    if (nested && currentObject && !line.trimStart().startsWith("-")) {
      const [, , key, rest] = nested;
      currentObject[key] = coerceScalar(key, rest);
      continue;
    }

    // Block list item: "  - twitter" OR "  - slot: hero"
    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && currentListKey) {
      if (!Array.isArray(data[currentListKey])) data[currentListKey] = [];
      const rest = item[1].trim();
      const kv = /^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/.exec(rest);
      if (kv) {
        currentObject = { [kv[1]]: coerceScalar(kv[1], kv[2]) };
        data[currentListKey].push(currentObject);
      } else {
        currentObject = null;
        data[currentListKey].push(rest.replace(/^["']|["']$/g, ""));
      }
      continue;
    }

    const kv = /^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    const [, key, rest] = kv;
    if (rest.trim() === "") {
      currentListKey = key;
      currentObject = null;
      data[key] = [];
      continue;
    }
    currentListKey = null;
    currentObject = null;
    data[key] = coerceScalar(key, rest);
  }

  return { data, body: text.slice(m[0].length), hasFrontmatter: true };
}

/** Serialize back. Used when the publisher syncs status. */
export function stringifyFrontmatter(data, body) {
  const lines = Object.entries(data).map(([k, v]) => {
    if (Array.isArray(v)) {
      if (v.length && typeof v[0] === "object" && v[0] !== null) {
        const block = v
          .map((obj) => {
            const keys = Object.keys(obj);
            const first = keys[0];
            const rest = keys.slice(1);
            const head = `  - ${first}: ${formatValue(obj[first])}`;
            const more = rest.map((rk) => `    ${rk}: ${formatValue(obj[rk])}`);
            return [head, ...more].join("\n");
          })
          .join("\n");
        return `${k}:\n${block}`;
      }
      return `${k}: ${v.join(", ")}`;
    }
    if (typeof v === "string" && (v.includes(":") || v.includes("#"))) {
      return `${k}: "${v}"`;
    }
    return `${k}: ${v}`;
  });
  return `---\n${lines.join("\n")}\n---\n\n${body.replace(/^\n+/, "")}`;
}

function formatValue(v) {
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "string" && (v.includes(":") || v.includes("#"))) return `"${v}"`;
  return String(v);
}

/**
 * Update one or more frontmatter fields in a raw file string without
 * reformatting the rest of the file. Safer than round-tripping.
 */
export function patchFrontmatter(raw, patch) {
  const { hasFrontmatter } = parseFrontmatter(raw);
  if (!hasFrontmatter) return stringifyFrontmatter(patch, raw);
  let head = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)[1];
  for (const [k, v] of Object.entries(patch)) {
    const val = Array.isArray(v) ? v.join(", ") : String(v);
    const re = new RegExp(`^${k}\\s*:.*$`, "m");
    head = re.test(head) ? head.replace(re, `${k}: ${val}`) : `${head}\n${k}: ${val}`;
  }
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---/, `---\n${head}\n---`);
}

export const VALID_STATUSES = [
  "draft",
  "ready", // passes npm run content:check, awaiting human compliance sign-off
  "compliance-checked",
  "scheduled",
  "published",
  "queued-import", // Medium manual-import only. NOT published.
  "partial", // some platforms succeeded, some did not
];
