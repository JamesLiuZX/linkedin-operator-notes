// scripts/lib/status.mjs
// The one list of statuses that render on the live site. site/src/content.js
// and scripts/build-seo.mjs each kept their own copy of this, named VISIBLE
// and LIVE respectively, and the copies had already drifted: the sitemap's
// copy predated the site's, so a status either one of them didn't know about
// silently disappeared from one surface but not the other. Import this
// instead of re-listing statuses.
//
// "partial" is deliberately included. scripts/publish/index.mjs sets an
// item's status to "partial" whenever cross-posting to X/Medium/Substack
// only partly succeeds, which is the normal outcome when even one platform
// lacks credentials. That is a fact about distribution to other platforms,
// not about the canonical site: "site: Canonical. Publishes first, everything
// else points here" (README.md). A cross-post hiccup should never be able to
// un-publish the page that every cross-post points back to.
//
// "queued-import" is deliberately excluded: it means nothing has actually
// gone out anywhere yet, only that a human still has to do the Medium import
// by hand (see VALID_STATUSES in frontmatter.mjs). "draft" is excluded on
// its own terms, the editorial gate this whole pipeline exists to enforce.

export const VISIBLE_STATUSES = ["published", "scheduled", "compliance-checked", "partial"];
