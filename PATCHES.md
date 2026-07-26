# PATCHES.md

Applies to the repo described in your prompt. Assumptions are flagged. Where your
local code differs, the intent of each patch is stated so you can port it.

Priority: publishing correctness first, then DX, then SEO.

---

## P0-1. Kill the three-places problem

**Files:** add `scripts/lib/frontmatter.mjs` and `site/src/content.js` (both provided
as separate files). Then:

`site/src/main.js`, replace the hardcoded registry:

```diff
-const ARTICLES = [
-  { slug: 'foo', title: 'Foo', ... },
-  ...
-];
+import { ARTICLES, ALL, bySlug, bySection, SECTIONS } from './content.js';
```

`site/vite.config.js`:

```js
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  resolve: {
    alias: { '@lib': path.resolve(__dirname, '../scripts/lib') },
  },
  server: { fs: { allow: ['..'] } },
});
```

Delete the frontmatter parser inside the site and inside `scripts/publish/content.mjs`;
both import from `@lib/frontmatter.mjs` / `../lib/frontmatter.mjs`.

**Assumption:** your Vite root is `site/`. If the root is the repo root, drop the
`fs.allow` line and change the glob paths in `content.js` from `../../articles/*.md`
to `./articles/*.md`.

**Unsplash slots.** Stop maintaining `SLOTS` in `fetch-unsplash.mjs`. Read them from
frontmatter instead:

```yaml
figures:
  - query: "order book depth"
    slot: hero
```

```js
// scripts/fetch-unsplash.mjs
import { readdir, readFile } from 'node:fs/promises';
import { parseFrontmatter } from './lib/frontmatter.mjs';

const files = (await readdir('articles')).filter(f => f.endsWith('.md'));
const wanted = [];
for (const f of files) {
  const { data } = parseFrontmatter(await readFile(`articles/${f}`, 'utf8'));
  for (const fig of data.figures || []) wanted.push({ slug: data.slug, ...fig });
}
// ...existing fetch + manifest write, keyed by slug+slot
```

Adding an essay is now one file.

---

## P0-2. Queued Medium import is not published

This is the worst bug in the system because it lies to you about your own state.

`scripts/publish/platforms/medium.mjs`:

```diff
 export async function publish(item, ctx) {
   const token = process.env.MEDIUM_TOKEN;
   if (!token) {
     await queueImport(item, ctx);
-    return { ok: true, platform: 'medium', url: item.canonicalUrl, status: 'published' };
+    return {
+      ok: true,
+      platform: 'medium',
+      status: 'queued-import',
+      url: null,
+      canonicalUrl: item.canonicalUrl,
+      requiresHuman: true,
+      note: 'Queued in .publish/medium-import-queue.jsonl. Import manually at medium.com/p/import',
+    };
   }
   ...
 }
```

`scripts/publish/index.mjs`, where results roll up:

```js
const HUMAN_REQUIRED = r => r.requiresHuman === true;

function rollUp(results) {
  const ok        = results.filter(r => r.ok && !HUMAN_REQUIRED(r));
  const pending   = results.filter(r => r.ok && HUMAN_REQUIRED(r));
  const failed    = results.filter(r => !r.ok);

  if (failed.length) return 'partial';
  if (pending.length && !ok.length) return 'scheduled';   // nothing actually went out
  if (pending.length) return 'partial';
  return 'published';
}
```

Only write `status: published` back to the markdown when `rollUp` returns
`published`. `--status` must print pending human actions loudly:

```js
if (pending.length) {
  console.log(`\n  ${pending.length} item(s) waiting on a human:`);
  for (const p of pending) console.log(`    ${p.platform}  ${p.slug}  ${p.note}`);
}
```

Exit non-zero from `--status` if anything has been sitting in `queued-import` for
more than 72 hours. You want the cron to nag you.

---

## P0-3. Substack transport must be complete before it claims to be configured

`scripts/publish/platforms/substack.mjs`:

```js
export function checkConfig() {
  const missing = [];
  if (!process.env.SUBSTACK_POST_EMAIL) missing.push('SUBSTACK_POST_EMAIL');

  const hasResend = !!process.env.RESEND_API_KEY;
  const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  if (!hasResend && !hasSmtp) {
    missing.push('RESEND_API_KEY, or SMTP_HOST + SMTP_USER + SMTP_PASS');
  }
  if (!process.env.SUBSTACK_FROM_EMAIL && hasResend) {
    missing.push('SUBSTACK_FROM_EMAIL (Resend needs a verified sender)');
  }
  return { ok: missing.length === 0, missing };
}
```

And in `index.mjs`, a platform whose `checkConfig()` fails is **skipped with a
failure result**, never silently treated as success:

```js
const cfg = platform.checkConfig?.() ?? { ok: true };
if (!cfg.ok) {
  results.push({ ok: false, platform: name, error: `missing config: ${cfg.missing.join(', ')}` });
  continue;
}
```

---

## P0-4. Twitter should not dump the essay

`scripts/publish/transform.mjs`:

```js
const HARD_MAX_TWEETS = 9;

export function toThread(item) {
  const url = item.canonicalUrl;

  // Articles get an excerpt plus a link. Never the body.
  if (item.kind === 'article') {
    const lead = item.frontmatter.twitterExcerpt
      || firstParagraph(item.body).slice(0, 260);
    const beats = (item.frontmatter.twitterBeats || []).slice(0, HARD_MAX_TWEETS - 2);
    return [lead, ...beats, `Full piece: ${url}`].filter(Boolean);
  }

  // Short atoms can thread, but still capped.
  const parts = splitToTweets(item.body, 275);
  if (parts.length > HARD_MAX_TWEETS) {
    return [...parts.slice(0, HARD_MAX_TWEETS - 1), `Rest here: ${url}`];
  }
  return parts;
}

function firstParagraph(body) {
  return body.replace(/^#{1,6}\s.*$/gm, '').trim().split(/\n{2,}/)[0].replace(/\s+/g, ' ');
}
```

Add to `content-check.mjs` usage: warn when an article has no `twitterExcerpt`,
since the fallback is worse than a written one.

---

## P0-5. Status sync, carefully

Use `patchFrontmatter` from the shared lib so you edit only the status line and
never reformat the author's file:

```js
import { readFile, writeFile } from 'node:fs/promises';
import { patchFrontmatter } from '../lib/frontmatter.mjs';

async function syncStatus(item, status, extra = {}) {
  const raw = await readFile(item.path, 'utf8');
  const next = patchFrontmatter(raw, {
    status,
    ...(status === 'published' ? { publishedAt: new Date().toISOString() } : {}),
    ...extra,
  });
  if (next !== raw) await writeFile(item.path, next, 'utf8');
}
```

Only call this after the platform loop resolves, and only with the value from
`rollUp`. Never optimistically.

---

## P1-1. Canonical URLs without leaving Vite

Lowest cost improvement, no SSG needed. Move from `#/slug` to `/section/slug` using
the History API, and give GitHub Pages a SPA fallback.

`site/src/router.js`:

```js
const listeners = new Set();

export function currentPath() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return window.location.pathname.replace(base, '') || '/';
}

export function navigate(to) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  window.history.pushState({}, '', base + to);
  listeners.forEach(fn => fn(currentPath()));
}

export function onRoute(fn) { listeners.add(fn); return () => listeners.delete(fn); }
window.addEventListener('popstate', () => listeners.forEach(fn => fn(currentPath())));

document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="/"]');
  if (!a || a.target || e.metaKey || e.ctrlKey) return;
  e.preventDefault();
  navigate(a.getAttribute('href'));
});
```

`site/public/404.html`: copy of `index.html`. GitHub Pages serves it for unknown
paths, and your router picks up the real path on load. That is the entire trick.

Add to `deploy-site.yml` after build:

```yaml
      - name: SPA fallback
        run: cp site/dist/index.html site/dist/404.html
```

Update canonical URL construction in `transform.mjs`:

```diff
-const canonical = `${SITE_URL}/#/${item.slug}`;
+const canonical = `${SITE_URL}/${item.section || 'notes'}/${item.slug}`;
```

Also emit `<link rel="canonical">` and OG tags per route. Medium import and X link
previews both need this, and hash URLs break both.

**Redirect the old URLs.** In `main.js` on boot:

```js
if (location.hash.startsWith('#/')) {
  const slug = location.hash.slice(2);
  const item = bySlug(slug);
  if (item) navigate(`/${item.section || 'notes'}/${item.slug}`);
}
```

If you later find you need real prerendering for OG tags, `vite-plugin-ssr` is the
wrong size for this. A 30 line post-build script that writes one static HTML file
per slug with the right meta tags is enough. Do not do it until link previews
actually look wrong.

---

## P1-2. CI

`.github/workflows/content.yml`:

```yaml
name: content
on:
  pull_request:
    paths: ['posts/**', 'articles/**', 'scripts/**', 'site/**']
  push:
    branches: [master]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: node scripts/content-check.mjs
      - run: node scripts/publish/index.mjs --dry-run --scheduled
      - run: npm ci && npm run site:build
```

`package.json`:

```json
{
  "scripts": {
    "content:check": "node scripts/content-check.mjs",
    "content:check:json": "node scripts/content-check.mjs --json",
    "unsplash": "node scripts/fetch-unsplash.mjs",
    "site": "vite --config site/vite.config.js",
    "site:build": "vite build --config site/vite.config.js",
    "publish": "node scripts/publish/index.mjs",
    "publish:dry": "node scripts/publish/index.mjs --dry-run",
    "publish:list": "node scripts/publish/index.mjs --list",
    "publish:status": "node scripts/publish/index.mjs --status"
  }
}
```

---

## P1-3. Cron must commit everything it changed

`.github/workflows/publish-schedule.yml`:

```diff
-      - run: git add .publish/state.json
+      - run: git add .publish/ articles/ posts/
       - run: |
           git config user.name  "publish-bot"
           git config user.email "bot@users.noreply.github.com"
           git diff --staged --quiet || git commit -m "publish: sync state $(date -u +%F)"
           git push
```

`articles/` and `posts/` are in there because P0-5 writes status back into the
markdown. If the cron does not commit that, status drifts on the very next run.

---

## P2. Housekeeping

`.gitignore`:

```gitignore
# env
.env
.env.*
!.env.example

# vite
site/.vite/
site/dist/
node_modules/

# publish state is committed on purpose; the queue is too
!.publish/state.json
!.publish/medium-import-queue.jsonl
```

The `!.env.example` negation is the fix for your gitignore bug. Verify with
`git check-ignore -v .env.example`, which should print nothing.

Substack markdown to HTML: your naive converter is fine for now. The one thing
worth fixing is links and images, because those are what break visibly in email.
Do not build a full markdown engine. If it gets painful, `marked` is 40KB and one
dependency, which is within your budget.

---

## Verification checklist

Run in order. Each line has a definition of done.

```bash
# 1. shared parser is actually shared
grep -rn "matter(" scripts/ site/src/ | grep -v "lib/frontmatter"
#    done: no output

# 2. quality gate runs and blocks
node scripts/content-check.mjs
#    done: exits 0 with zero blocking failures on non-draft files
node scripts/content-check.mjs articles/your-worst-old-post.md
#    done: it fails, and the reasons are ones you agree with

# 3. registry is frontmatter driven
#    add articles/test-piece.md with status: published, run npm run site
#    done: it appears with no edit to main.js or fetch-unsplash.mjs

# 4. medium honesty
MEDIUM_TOKEN= node scripts/publish/index.mjs --dry-run --scheduled
#    done: prints queued-import, NOT published; markdown status unchanged
cat .publish/medium-import-queue.jsonl
#    done: one line per queued item with a canonical URL

# 5. substack refuses to half-configure
SUBSTACK_POST_EMAIL=x RESEND_API_KEY= SMTP_HOST= node scripts/publish/index.mjs --dry-run
#    done: substack reports missing config as a failure, does not report success

# 6. twitter does not dump the body
node scripts/publish/index.mjs --dry-run --scheduled | grep -A20 twitter
#    done: <= 9 tweets, first is twitterExcerpt, last is the canonical link

# 7. canonical URLs
npm run site:build && npx serve site/dist
#    done: /markets/your-slug loads directly on refresh (404.html fallback works)
#    done: old #/your-slug redirects to the new path
#    done: view-source shows <link rel="canonical"> and og:title

# 8. gitignore
git check-ignore -v .env.example
#    done: no output
git status --porcelain site/.vite
#    done: no output

# 9. cron round trip
node scripts/publish/index.mjs --status
#    done: lists anything awaiting manual Medium import, exits non-zero if stale
```

**Overall done:** you can add an essay by creating one markdown file, the gate
blocks it if it is thin, the site picks it up on deploy, X gets an excerpt and a
link, Medium tells you the truth about needing a human, and nothing is marked
published that is not.
