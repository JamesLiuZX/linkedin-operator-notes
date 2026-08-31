# Deploying

The site is a static Vite build. Everything it renders (essays, demos, dashboard)
is produced at build time from files in this repo. There is no backend, no
database, no API keys, and no model calls at runtime.

That is a deliberate constraint. It means the demos cannot break in production
for a reason that does not also break locally.

---

## Vercel (recommended)

`vercel.json` is committed and complete, so this is a connect-and-go.

1. Go to [vercel.com/new](https://vercel.com/new) and import
   `JamesLiuZX/linkedin-operator-notes`.
2. **Leave every build setting empty.** Vercel reads `vercel.json`:
   - build command `npm run vercel:build`
   - output directory `site/dist`
3. Add one environment variable, scoped to **Production**:

   | Key | Value |
   |---|---|
   | `SITE_URL` | `https://your-project.vercel.app` (or your custom domain) |

   This only feeds `sitemap.xml` and `robots.txt`. The site renders fine without
   it; the sitemap just uses relative URLs, which is valid but weaker for SEO.
4. Deploy.

Routing is client side (`/markets/{slug}`, `/demos/{slug}`, `/dashboard`), so
`vercel.json` rewrites unmatched paths to `index.html`. Vercel resolves real
files first, so this never shadows `/assets/*`, `/sitemap.xml`, or `/robots.txt`.

### Deploying from the CLI instead

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Seeing the drafts on a preview deploy

Nine essays are written and pass the gate, but all of them are `status: draft`,
so **production renders none of them**. That is the editorial gate working, not a
bug.

To read the whole library on a preview URL without publishing anything, add this
env var scoped to **Preview only**:

| Key | Value | Scope |
|---|---|---|
| `VITE_SHOW_DRAFTS` | `1` | Preview |

Preview builds also emit a `Disallow: /` robots.txt, so they cannot be indexed.

**Never set `VITE_SHOW_DRAFTS` on Production.** It would publish unedited drafts
under your name.

### Publishing an essay for real

Edit the file, then change its frontmatter:

```yaml
status: draft   ->   status: compliance-checked
```

`compliance-checked`, `scheduled`, and `published` all render publicly. The
difference matters to `scripts/publish`, not to the site:

- `compliance-checked` and `scheduled` with a past `publishAt` are eligible for
  cross-posting to X, Medium, and Substack.
- `partial` (some platforms done, some not) is retried; `.publish/state.json`
  tracks which platforms are done, so retries never double-post.
- `published` is terminal. The publisher skips it.

So if you want a page live on the site but **not** auto-cross-posted, use
`published`.

---

## GitHub Pages (also wired)

`.github/workflows/deploy-site.yml` builds with `BASE_PATH=/linkedin-operator-notes/`
and copies `index.html` to `404.html` for SPA fallback. Enable it in
Settings, Pages, Source: GitHub Actions.

CI builds **both** layouts on every push, so switching hosts never surprises you.

---

## Local

```bash
npm run site:install
npm run site           # http://localhost:5173, drafts visible
npm run site:build     # production build + sitemap
npm run site:preview   # serve the build
```

`npm run site` shows drafts because `import.meta.env.DEV` is true. Production
does not.

---

## The gates

```bash
npm run check           # both of the below
npm run content:check   # voice + specificity gate on posts/ and articles/
npm run schedule:check  # content/schedule.json integrity
```

`content:check` only **blocks** on non-draft content. A draft scoring 58 is a
warning; a `scheduled` piece scoring 58 fails CI. That asymmetry is intentional:
drafts are allowed to be bad, published things are not.

`schedule:check` verifies that every row in the posting schedule points at a file
that exists, that demo slugs resolve against the registry, that no derived post
ships before its source essay, and that the format mix matches the declared
target.

Both run in CI on every PR touching content, scripts, or the site.

---

## What is NOT deployed

- `posts/` are LinkedIn and X drafts. They are working copy for the dashboard and
  never render as web pages, in any environment.
- `/dashboard` is excluded from `sitemap.xml` and disallowed in `robots.txt`. It
  is a working surface, not a landing page. It is not secret, just not indexed.
- `tools/content-desk/` is local only. Run it with `npm run desk`.

---

## Cross-posting

Separate from deployment. See [PUBLISHING.md](./PUBLISHING.md). It needs a `.env`
with platform credentials and is driven by
`.github/workflows/publish-schedule.yml`. Deploy the site first, because every
cross-post points at the canonical URL.

Dry run any time, no credentials needed:

```bash
npm run publish:dry
```
