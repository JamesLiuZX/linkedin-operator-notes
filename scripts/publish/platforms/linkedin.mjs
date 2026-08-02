import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../config.mjs";
import { analyzeLinkedIn, MAX } from "../../lib/linkedin.mjs";

/**
 * LinkedIn is the primary surface and the only one that stays human.
 *
 * Personal-profile posting through the LinkedIn API requires an approved app
 * with w_member_social, which is not something a personal content system should
 * be waiting on. So this platform does the honest thing: it prepares the exact
 * paste, validates it against the composer's real constraints, writes it where a
 * human can grab it, and reports queued-import rather than pretending to publish.
 *
 * Same contract Medium uses when it has no token: ok, requiresHuman, and a
 * status the roll-up will not mistake for published.
 */
export async function publishToLinkedIn(item, { config, transform }) {
  const li = analyzeLinkedIn(item.body ?? item.content ?? "");
  const canonicalUrl = transform.articleCanonicalUrl(config.siteUrl, item);

  if (!li.plain.trim()) {
    throw new Error(`LinkedIn: ${item.slug} has no "## Draft" section to publish.`);
  }
  if (li.chars > MAX) {
    throw new Error(
      `LinkedIn: ${item.slug} is ${li.chars} characters, over the ${MAX} composer limit. Cut it before scheduling.`
    );
  }
  if (li.unrenderable.length) {
    throw new Error(
      `LinkedIn: ${item.slug} still contains markdown that pastes literally (` +
        li.unrenderable.map((u) => `${u.label} x${u.count}`).join(", ") +
        `). Run npm run linkedin -- ${item.path} to see it.`
    );
  }

  const queueDir = join(ROOT, ".publish");
  mkdirSync(join(queueDir, "linkedin"), { recursive: true });

  // The paste itself, as a plain file, so it can be opened and copied whole.
  const pastePath = join(queueDir, "linkedin", `${item.slug}.txt`);
  const firstComment = li.firstComment
    ? `\n\n--- FIRST COMMENT (post immediately after) ---\n${li.firstComment}`
    : "";
  writeFileSync(pastePath, li.plain + firstComment + "\n", "utf8");

  appendFileSync(
    join(queueDir, "linkedin-queue.jsonl"),
    JSON.stringify({
      slug: item.slug,
      title: item.title,
      chars: li.chars,
      fold: li.fold.visible,
      hasFirstComment: Boolean(li.firstComment),
      canonicalUrl: canonicalUrl || null,
      queuedAt: new Date().toISOString(),
      paste: `.publish/linkedin/${item.slug}.txt`,
    }) + "\n",
    "utf8"
  );

  console.log(`  i  LinkedIn: prepared ${li.chars} chars. NOT posted.`);
  console.log(`  i  Paste file: .publish/linkedin/${item.slug}.txt`);
  console.log(`  i  Fold: ${li.fold.visible.replace(/\n+/g, " ").slice(0, 80)}...`);
  if (li.firstComment) console.log(`  i  First comment prepared. Post it right after the main post.`);

  return {
    ok: true,
    method: "manual_paste",
    platform: "linkedin",
    status: "queued-import",
    url: null,
    canonicalUrl: canonicalUrl || null,
    requiresHuman: true,
    note: `Paste ready at .publish/linkedin/${item.slug}.txt (${li.chars}/${MAX} chars).`,
  };
}
