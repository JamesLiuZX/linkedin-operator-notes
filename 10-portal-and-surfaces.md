# AI-in-PM portal, skills pack and motion clips: 2026-11-06 brief

> **Status, 2026-11-06.** This is direction from James, given in an
> interactive session. He approves the plan below item by item.
> - It does not change `content/schedule.json` (CLAUDE.md rule 4).
> - It does not outrank distribution. The supervised posting session is
>   still blocker #1 in `JamesLiuZX/command` AUTOPILOT.md.
>
> Related documents:
> - Portfolio version: `plans/2026-11-06-strategy-brief.md` in the command
>   repo.
> - Course-side motion plan: `docs/10-motion-and-katana.md` in
>   `JamesLiuZX/udemy`.

## 1. Where it fits

James wants his best practices for AI in product management compiled into a
resource portal of his own. It will be free or very low cost and promoted on
LinkedIn. The portal is the "site essays" layer of `09-course-funnel.md`
with an index on top. Two new surfaces reuse the same inventory:

```
LinkedIn atoms + demos + motion clips       reach
  -> portal (site essays + practice index)  canonical, free
    -> Substack                             the owned list
      -> skills pack + free artifact        proof you can run
        -> Udemy course                     97% on own coupon links
          -> KDP, cohort, workshops         compile targets and the high ticket
```

## 2. The portal

- **Free.** The portal is valuable for its reach, and the money comes
  further down the funnel (09 §1). A paywall would starve the layer that
  feeds every other one.
- **Not a new app.** The portal is one index page on the existing site.
  - The page lists each practice once.
  - Each practice links to its essay, demo and LinkedIn atom, and later to
    its lecture and skill once those exist.
  - The model James named is a handbook's table of contents
    (techinterviewhandbook), not a CMS. A CMS is a non-goal.
- **One entry per practice.** Each entry covers:
  - the problem
  - the practice
  - what the practice costs (WRITING.md)
  - a worked example on public or fictional data
  - the Takeaway
- **Niche.** The topic is AI product management for fintech, trading and
  regulated products.
  - Generic AI PM is crowded at the top. Maven cohorts sell at 1,495 to
    2,500 USD under established names.
  - The trading and regulated-launch angle is open, and it is James's actual
    work.
- **Owned list.** Substack is the owned list and is already a cross-post
  target. A newsletter rebuild is a non-goal.

## 3. The skills pack

Each practice can also ship as an installable `SKILL.md`, in a small public
repo linked from the portal. SKILL.md is the open Agent Skills format, and
both Claude Code and claude.ai read it. A skill is a portal entry that
readers can run.

- **Skip generic PM skills.** That market is saturated.
  - phuryn/pm-skills alone has about 22k GitHub stars and 65 PM skills.
  - One catalogue lists 218 PM skills.
- **Ship only what those packs lack:**
  - a trading UX teardown
  - a regulated launch checklist with legal and compliance
  - options and event-contract specs
  - a prediction-market resolution-risk review. `tools/resolution-risk` in
    this repo already scores resolution criteria for dispute risk.
- **Use the pack as a lead magnet, not a giveaway.** The suggestion is that
  3 of the 12 ai-for-pms artifacts become free skills and the rest stay in
  the course. James decides which three.
- **Keep every skill generic.** No skill contains details from any employer,
  current or past.

## 4. Motion clips

- **One clip per framework.** Each framework gets an animated explainer of 45
  to 90 seconds, used in three places:
  - LinkedIn native video
  - an embed on the portal
  - a course lecture

  This follows James's preferred build-in-public video demo format.
- **Tooling: HyperFrames** (HeyGen, Apache 2.0).
  - It renders HTML, CSS and GSAP to MP4 with headless Chrome and FFmpeg.
  - It ships agent skills: `npx skills add heygen-com/hyperframes`.
  - The site and demos are already HTML, so the same diagrams become clips.
  - Remotion is the React alternative: `npx skills add remotion-dev/skills`.
- **Labels and numbers come from code or data, never from a generative
  model.** This is the same rule as udemy docs/09.
  - Katana is Higgsfield's edit-recreation skill for Claude. It is
    generative and spends paid credits.
  - It is acceptable for a hook intro, not for a framework.
- **Every number in a clip traces to `research/SOURCES.md`,** like any post.

## 5. Weekly loop

1. Once a week, James writes up one practice from his week, with anything
   internal removed.
2. A session turns that write-up into:
   - a portal entry
   - a LinkedIn atom (WRITING.md, then the gate)
   - a skill draft
   - a clip storyboard
3. Once a month, four entries become a course module or a workshop session.
4. New schedule rows are added only with James's go-ahead (rule 4).

## 6. Decisions for James

1. Where does the portal live, and what is it called? It can be a path on
   this site or a subpath of jamesliuzx.com.
2. Which three artifacts become free skills, and what is the skills repo
   called?
3. Should LinkedIn clips use HyperFrames (yes or no)?
4. When do portal entries start getting schedule rows?

## Sources

- Maven AI PM cohort prices: https://www.productcompass.pm/p/best-maven-courses-discount-codes, https://aiagentrank.io/learn/course/maven-ai-pm-aakash
- PM skills market: https://agentskill.work/en/skills/phuryn/pm-skills, https://drbartpm.beehiiv.com/p/218-claude-skills-every-product-manager-needs
- HyperFrames: https://themenonlab.blog/blog/heygen-hyperframes-video-as-code
- Remotion skills: https://www.remotion.dev/docs/ai/skills
- Katana: https://higgsfield.ai/blog/higgsfield-katana
- Udemy revenue share: https://support.udemy.com/hc/articles/229605008-Instructor-revenue-share
