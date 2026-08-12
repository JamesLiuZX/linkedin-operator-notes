# Course funnel: one expertise, four surfaces

This doc connects this repo to [jamesliuzx/udemy](https://github.com/JamesLiuZX/udemy),
the course production pipeline. Where it conflicts with the ladder in
[06-newsletter-and-products.md](./06-newsletter-and-products.md), this doc wins.
Written 2026-08-12, when the course repo had Section 0 built (4 lectures, 15.1 min)
and 96 lectures left to write.

## 1. The reconciliation

06 says "courses are last" and "validate before building." The udemy repo is
already building a course. These do not actually conflict, because they are
about two different products:

| Product | Price | Who finds it | Validation needed |
|---|---|---|---|
| Udemy course | $24.99 launch, $74.99 standard | Udemy search + Udemy Business | Udemy's own marketplace demand research (done, in `docs/00-strategy.md` there) |
| Cohort / advisory | $500+ | This audience, via DMs | The 06 rule: 20+ replies, 5+ asks, or a 50-email waitlist |

The "validate first" rule was written for a high-ticket cohort sold to the
LinkedIn audience. It still applies to that. A marketplace course is a different
animal: Udemy brings its own search traffic, its own corporate seats, and its
own ranking system. The course does not need this audience to exist. What it
needs from this audience is credibility: learners google the instructor before
buying, and what they find is this system's output.

So the funnel is:

```
LinkedIn atoms + demos        reach, daily proof of work
  -> site essays              canonical, SEO, what hiring managers read
    -> newsletter             the owned list
      -> free artifact        one course artifact, given away, gated by email
        -> Udemy course       $24.99 to $74.99, plus Udemy Business seats
          -> KDP workbook     compiled from the same source, Amazon as a search surface
            -> cohort/advisory  highest ticket, still gated by the 06 rule
```

Each layer also works alone. Udemy sells without LinkedIn. LinkedIn builds the
brand without the course. The connection is leverage, not dependency.

## 2. Positioning fit

The course's stated differentiator (in its own strategy doc) is that it teaches
judgement, not prompts: eval thresholds, unit economics, blast radius. The
generic version is commodity and its reviews say "I could have used ChatGPT."

The thing that makes the non-generic version credible is this repo's Pillar 1.
"Owns a prediction market at exchange scale" is what separates the instructor
from the 400 other AI-for-PMs courses. The pillars do not move:

1. **Prediction markets as products**: the moat. Proof a specific human expert exists.
2. **AI that ships**: the commercial lane. The course monetizes this pillar.
3. **Gen media with taste**: feeds course #2 later (AI UGC ads, per the udemy launch playbook).

The brand line stays one sentence everywhere: LinkedIn headline, site bio,
Udemy instructor bio, KDP author page:

> Builds AI agents and prediction markets at exchange scale, and shows the work.

## 3. The asset map: essays and lectures are the same inventory

The latest backlog (articles 16 to 21) is already course material wearing a
LinkedIn coat. Make the mapping explicit and stop writing anything twice:

| This repo | Course section | Direction |
|---|---|---|
| 18-five-agents-at-95-percent | 6.3 reliability math (0.95^10 = 0.60, the course's named wow slide) | essay ships first, becomes the lecture's spine |
| 16-the-benchmark-is-the-short-task | 2.6 reading model cards critically, 1.4 capability frontier | essay first |
| 17-the-middle-of-the-window | 1.2 tokens and context windows | essay first |
| 19-88-percent-use-it-25-percent-finished | 9.1 adoption, acceptance, deflection | essay first |
| 13-the-stopwatch-not-the-forecast | 9.3 A/B testing nondeterministic features | already published |
| 15-a-checklist-not-a-model | 4.4 LLM-as-judge | already published |
| 08-the-harness-is-the-edge + calibration lab | Section 4 evaluation, the section that justifies the price | essay exists, lecture next |
| 03-prototype-aggressively-productionize-suspiciously | 6.4 / 6.6 agent patterns, when not to | essay exists |
| posts/24-spec-failures-vs-coordination-failures | Section 3 specifying AI features | atom exists |
| 10-the-metric-is-the-alibi | 9.5 dashboards leadership reads | essay exists |
| Workflow ROI Lab demo | Section 7 cost and unit economics | demo exists, lecture reuses its model |
| Slop Gate demo | 4.3 rubric design | demo exists |

Course sections with no essay coverage yet. These are the pre-launch essay
slots, because each one is a strong standalone piece and doubles as course
proof:

| Gap | Course section | Essay angle |
|---|---|---|
| The margin trap | 7.5 | A feature that loses money per power user, computed live. Nobody posts this math. |
| Rubric inconsistency | 0.4 | Score the same output twice a week apart, disagree with yourself. The course's minute-12 moment. |
| RAG breaks in production | 5.5 | The six places, with receipts from public postmortems. |
| Prompt injection for PMs | 8.2 | The lethal trifecta, in PM language. |

Rule going forward: every course section gets at most one derived essay, and
every new essay names its course section in frontmatter the same way atoms name
their essay. `derives:` gains a `kind: lecture` entry. One idea, many surfaces,
now spanning both repos.

## 4. What to post: three phases keyed to course milestones

Dates assume scripts continue at Claude-assisted pace and the bottleneck is
sign-off, which it should be. If a milestone slips, the phase slips with it.
The 13-week schedule (started 2026-08-03) stays the backbone; this adds and
re-aims slots, it does not replace the plan.

**Phase A, build (now to about w8, mid-September). Milestone: Section 4 scripts verified.**

- Keep the scheduled markets cadence exactly as is. It is the moat, do not dilute it.
- Slot the four ready AI essays (16 to 19) into essay/atom slots w3 to w8. Posting
  them IS testing course material: which framings get saved and DM'd tells you
  which lectures lead.
- One build-in-public teardown in w5 or w6: the course pipeline itself.
  "I built a system that refuses to render a lecture I have not verified" is
  Pillar 3 gold and pre-frames the AI disclosure as discipline instead of a
  confession.
- Write the four gap essays (margin trap, rubric inconsistency, RAG breaks,
  prompt injection) as the course sections get written, evidence block first,
  same receipts feeding both repos.

**Phase B, runway (about w9 to w10, late September to early October). Milestone: all scripts verified, TTS rendered, QC green.**

- Newsletter issue #1 is already scheduled w9. Keep it. The list is the launch asset.
- Free artifact goes live: the spreadsheet eval harness (course artifact A03),
  renamed for the wild as "the AI feature eval harness, in a spreadsheet."
  Gate with email on the site. This replaces the Prediction Market Checklist as
  the first compound; the market checklist still ships later for Pillar 1.
- Post the margin-trap and rubric essays here. They are the two strongest
  converters because they produce the "I need this at work" feeling.
- Record the human-voice lectures (promo, 0.1, section intros, 11.2 to 11.5).
  This is the one part Claude cannot do and the one part Udemy requires.

**Phase C, launch (target w11 to w12, mid-October). Milestone: course live on Udemy.**

- Week 0: $9.99 coupon to the network and the email list for honest reviews,
  per the udemy launch playbook. Ten reviews in 30 days is the target that matters.
- One launch post, story-shaped: the problem (PMs accountable for AI they
  cannot judge), the one idea (distribution, not function), what you built, and
  how you built it honestly. Course link in the first comment, never the body.
- One post each on the three free-preview lectures across the fortnight,
  teaching the actual content, link in comment.
- Then stop selling. Cap direct course promotion at 1 in 5 posts forever after.
  The account is an operator's notebook that happens to have a course, not a
  course account with filler.

**Phase D, compound (post-launch).**

- Udemy Q&A answered within 24h (a ranking input). Every real learner question
  becomes an atom candidate: it is pre-validated demand.
- Quarterly freshness pass on sections 1.4, 2.6, 7.1, 7.4 becomes a quarterly
  "what changed in the model market" post. One task, two surfaces.
- Revisit the 06 cohort rule with real data: course Q&A plus DMs now feed the
  validation counter.

## 5. Content generation: the operating loop

Claude Max makes production free in money and cheap in time. The scarce inputs
are your numbers, your sign-off, and your voice. Both repos are built around
exactly that constraint, with the same convention wearing two names:

- This repo: `{{ }}` slots, and the gate refuses to publish.
- Udemy repo: `[INSTRUCTOR-INPUT]` markers plus `verified: false`, and `qc.py` refuses to build.

The weekly rhythm that uses both:

| Day | Repo | Work |
|---|---|---|
| Sun | here | Pick the week's slots from `content/schedule.json`, draft with the gate, fill your numbers |
| Mon to Fri | udemy | One to two lecture scripts per day with the `write-lecture` skill, verify as you go, never batch sign-off |
| Publish days | here | Ship via dashboard + BROWSER-POSTING flow, reply for an hour |
| Fri | both | Harvest: lecture ideas that surfaced while posting, post ideas that surfaced while scripting, receipts into `research/SOURCES.md` |
| Sat | off | The system runs without weekend guilt or it stops running |

Evidence stays shared: one receipt bank (`research/SOURCES.md` here) serves
essays and lectures. A number verified once is verified everywhere; a number
verified nowhere ships nowhere.

## 6. Amazon KDP: a compile target, not a project

Do not write a book. Compile one. The course source is one markdown file per
lecture, narration and slides together, already verified sentence by sentence.
That is a manuscript wearing a video coat.

- **What:** "The AI Feature Workbook", the 11 artifacts plus the narration
  prose restructured into chapters. Workbook, not memoir.
- **When:** only after the course has 10+ reviews and a stable quarterly
  update loop, realistically Q1 2027. KDP before then steals launch focus.
- **Why bother at honest expectations:** niche B2B nonfiction on KDP makes
  hundreds a month at best. The real returns are "author of" authority, Amazon
  search as another discovery surface, and a back-of-book link driving artifact
  downloads to the email list. Treat royalties as rounding.
- **How:** a `pipeline/manuscript.py` build target later, same source, same QC
  spirit. Zero new writing.

The essays here could also compile into a field-notes book one day. That is a
year-two decision, gated on the newsletter proving people want the voice.

## 7. Distribution mechanics

Already documented, so pointers not repetition:

- LinkedIn fold and link discipline: `WRITING.md` and the schedule notes. Links
  in first comment always, including the course link.
- Cross-posting X, Medium, Substack: `PUBLISHING.md` + `BROWSER-POSTING.md`.
  Course launch gets the same treatment as an essay: canonical on the site,
  excerpt everywhere else.
- Udemy-internal ranking: `docs/03-launch-playbook.md` in the udemy repo. Title
  keywords, free previews, price ladder, review velocity, Q&A speed.
- The site gets one addition: a `/course` page owning the pitch, so LinkedIn
  can point at your domain instead of Udemy's, and the email capture happens on
  the way through. Udemy takes a bigger cut of organic-landing sales than
  coupon-link sales anyway.

What is deliberately not a channel: paid ads, engagement pods, follow-for-follow,
DM automation. Same reasoning as the rest of the system. Reach you rent breaks
the operator brand you are building to own.

## 8. Money, honestly

| Surface | Realistic 90-day | Realistic year-one | What actually drives it |
|---|---|---|---|
| Udemy course | $300 to $3k | $2k to $15k | Reviews, completion rate, Q&A speed, then Udemy Business inclusion |
| KDP workbook | $0 (not launched) | Low hundreds total | Exists for authority and search, not income |
| Cohort / advisory | $0 to $2k | $5k to $30k | The LinkedIn brand plus the 06 validation gate |
| The brand itself | inbound DMs | roles, talks, intros | Everything above compounds into this |

The honest read: the course is the best near-term cash surface, advisory is the
best per-hour surface, and the LinkedIn brand is the asset that appreciates.
Every artifact in both repos serves the third thing even when the first two
underperform.

## 9. Decisions to lock now

- [ ] Adopt this doc's funnel as the ladder; 06 keeps the cohort validation rule.
- [ ] Course launch target: w11 of the schedule (mid-October), milestone-gated, not date-gated.
- [ ] Free compound #1 switches to the eval-harness spreadsheet; market checklist ships second.
- [ ] Newsletter platform locked by w8 so issue #1 lands w9 as scheduled.
- [ ] The four gap essays enter the idea bank now (margin trap, rubric inconsistency, RAG breaks, prompt injection).
- [ ] One bio sentence everywhere, this week: LinkedIn, site, Udemy instructor profile.
- [ ] Course promo cap: 1 in 5 posts, forever.
- [ ] KDP deferred until the course has 10+ reviews. No exceptions, including enthusiasm.

## Takeaway

Two repos, one inventory. The essay tests the lecture, the lecture funds the
essay, and every number in both passes through the same gate: you. Nothing here
asks for more writing. It asks for the same writing to land on more surfaces,
in an order where each launch hands its audience to the next one.
