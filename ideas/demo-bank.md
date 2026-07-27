# Demo bank — Pillar 1, ranked by ROI

Companion to [ideas/idea-bank.md](./idea-bank.md), which holds writing ideas.
This file holds buildable ones: the weekly screen recording that is both the
reach engine and the proof (see [00-positioning.md](../00-positioning.md)).

Status key: `[ ]` idea · `[~]` building · `[x]` shipped (add date + URL)

---

## The scoring rubric

ROI here is not views. It is:

```
(reach x credibility with audience 1+2 x durability)
-------------------------------------------------------
          (build hours x compliance risk)
```

Four terms most people ignore:

**Durability.** A demo that produces one post is worth roughly a tenth of a demo
that produces a post every week for a quarter. Anything that accrues a track
record over time beats anything that peaks on publish day.

**Compliance risk as a divisor, not a checkbox.** A demo that could cost the job
has negative ROI no matter how good it looks. Risk does not subtract from the
score, it divides it.

**Audience 1+2 only.** A demo that lands 50K views from prompt collectors and
zero DMs from operators scores lower than one that gets 3K views and two intros.
Optimize for the DM, not the impression.

**Marginal effort.** Recording work you were doing anyway costs nearly nothing.
Those demos rank higher than their raw impact suggests.

---

## The constraint that decides everything

Every demo below is built on **public venues only**: Polymarket (Gamma + CLOB),
Kalshi's public API, Manifold, Metaculus. Personal repos. Personal time.
No employer markets, no internal data, no live trading, no P&L claims, no
anything that reads as advice.

This is not a limitation. It is the arbitrage.

The data is public, so anyone could pull it. The reading of the data is not
public, because almost nobody who can pull it has run resolution disputes at
venue scale. You are not selling access. You are selling interpretation, and
interpretation carries no compliance surface.

Verify each venue's ToS and rate limits before you build against it, and confirm
whatever your employment agreement says about outside projects and public
technical writing before the first one ships. Do that once, up front, for all
eight. Not eight times.

---

## Tier 1 — build these

### 1. [~] The Calibration Ledger

> **Built.** Code in [`scripts/ledger/`](../scripts/ledger/), rules in
> [`data/ledger/PREREGISTRATION.md`](../data/ledger/PREREGISTRATION.md),
> `npm run ledger -- --help`. What remains is running it daily against a live
> venue and committing the log.

**A public, pre-registered, permanently-scored record of an LLM forecasting
against live markets. Updated daily. Never editable after the fact.**

Highest ROI in the list, and it is not close. Everyone has posted "I asked a
model to predict X." Nobody is running a timestamped, append-only, Brier-scored
track record in public for 90 days, because it requires infrastructure
discipline and the willingness to be publicly wrong on a schedule. That is
exactly why it works.

**Build.** A cron job pulls N open markets daily. For each, an agent produces a
probability with cited sources, and writes to an append-only log: timestamp,
market ID, model version, prompt hash, sources, estimate. On resolution, compute
Brier and log loss for the model against the market's closing price as the
benchmark. Static page renders the scoreboard.

**The advanced part, and the reason this is not a toy.** Run two arms. Arm A
sees the current market price. Arm B does not. The delta between them measures
anchoring, which is the thing everybody assumes and nobody has measured in
public. If Arm A is well calibrated and Arm B is not, the model is not
forecasting, it is reading the price and adding prose. That finding is a paper,
an essay, and a year of credibility.

**Credibility mechanics.** Commit the log to git. Publish the commit hash on the
page. Pre-register the market selection rule before you start so nobody can
accuse you of cherry-picking the wins. The whole value is that the record cannot
be retro-edited, so make that visible, not just true.

**Recording.** 90 seconds. Ledger filling on the left, resolution feed on the
right. First frame is a row flipping to resolved with a red score. No intro.

**The failure to show.** Overconfidence at the tails. Models say 95% and are
right 80% of the time. Show the reliability curve bending away from the diagonal
and say the number out loud.

**Effort.** Two weekends to v1. Then about an hour a week.
**Risk.** Near zero. Public venues, no trades, forecasts not advice.
**Derives.** A weekly atom, an essay on calibration, and an evidence block with
real numbers for every AI piece you write after it. It manufactures the receipts
that `WRITING.md` demands.

**Start this first even though you will publish it second.** The asset is time
in the log. Every week you delay is a week of track record you cannot buy back.

---

### 2. [ ] The Resolution Linter

**Rules-as-code for market questions. Paste a question, get an ambiguity score
and a rewrite.**

This is Essay 1 ("The resolution criteria are the product") turned into a thing
people can run. It is the single most defensible demo in the list because the
insight is unbuyable: you have watched criteria fail in production.

**Build.** Corpus of live and resolved public questions. Deterministic checks
plus an LLM pass flag the recurring killers: undefined terms, no named
source-of-truth, no clause for abandonment or postponement, timezone left
implicit, no measurement authority, no fallback if the source stops publishing,
tie and void conditions missing. Output a 0 to 100 ambiguity score plus a
rewritten version. Ship as a CLI and a web paste box.

**The move that makes it real.** Backtest it. Take public markets that actually
drew contested resolutions and check whether your linter scores them worse than
clean ones. If it does, you have a tool. If it does not, you have a vibe check
with a progress bar. Publish that separation number either way. It is the most
interesting thing in the demo.

**Recording.** Paste a genuinely ambiguous live question. Watch it get shredded.
Before and after side by side, held on screen long enough to screenshot. That
diff is the shareable artifact.

**Effort.** One weekend to v1.
**Risk.** Reputational, not legal, and it is manageable. Critique the craft, not
the venue or the person. Never lint your employer's markets in public, not even
favourably. Skip the "worst-written markets this week" leaderboard idea, it is
tempting and it makes enemies for a rounding error in reach.

---

### 3. [ ] Spec to PR, unedited, one take

**A real spec becoming a real merged PR, on camera, with a timer running and no
cuts.**

Ranked third on impact, first on ROI per hour, because the marginal effort is
close to zero. You are recording work you were doing anyway.

The entire credibility is in the word *unedited*. Every AI workflow video on the
internet is cut. Leave in the part where the model gets it wrong and you correct
it. Leave in the failing test. A three minute clip with one visible recovery
beats a polished ten minute clip, and it is the clip hiring managers actually
finish.

**Do this one recursively.** Record yourself building the Resolution Linter.
One session yields two demos, and the PR under review is a real project rather
than a toy repo.

**Effort.** Zero marginal. Record a session you already had scheduled.
**Risk.** Personal or open source repos only. Never employer code on screen,
including tab titles, Slack notifications, and the file tree in the sidebar.
Close everything, use a clean profile.

---

## Tier 2 — after the ledger is running

### 4. [ ] Injection through market metadata

Plant hostile instructions in a market description in your own sandbox, then
watch an agent read it and get hijacked into a recommendation it should have
refused. This is eval #5 from
[articles/03](../articles/03-prototype-aggressively-productionize-suspiciously.md),
made visible in 60 seconds.

Cheap, dramatic, and it crosses into the security audience without diluting the
positioning, because the payload is market metadata rather than a generic prompt
trick. Then show the fix: the same attack hitting a deterministic gate and
failing.

**Effort.** Half a weekend. **Risk.** Low, on your own sandbox markets only.
Never demonstrate an attack against a live third-party venue.

### 5. [ ] Cold-start liquidity sandbox

An interactive toy. Sliders for spread, inventory limit, event volatility,
incentive budget, taker mix. Watch a market die or hold. This is
[articles/06](../articles/06-dead-markets-poison.md) made playable.

Modest reach, exceptional durability. It becomes the figure in every liquidity
essay you write afterwards, and `WRITING.md` already says a diagram you made
beats an Unsplash photo. Zero compliance surface, since nothing real is touched.

**Effort.** One weekend. **Risk.** None.

### 6. [ ] Agent eval suite for market products

Ship the six evals from articles/03 as a runnable repo. Factuality, refusal,
overconfidence, tool correctness, injection, audit completeness. Run it across
four current models and publish the table.

Lowest raw reach in Tier 2, highest credibility per view. This is the standards
play: it makes you the person other people cite when they argue about agents
near money, and citation outlasts engagement.

**Effort.** One to two weekends, most of it writing the eval cases.
**Risk.** Low. Publish methodology alongside results so the table is checkable.

---

## Tier 3 — month three, once the ledger runs itself

### 7. [ ] Adverse selection radar

Public order book and trade data, scanned for informed flow: who traded into a
market right before the resolution move, how spreads behaved around the news
that mattered. Anonymize every account. Frame it as a market design problem,
never as an accusation about a specific trader.

The most defensible thing on this list. It sits exactly on the moat described in
00-positioning: the AI crowd has no access to order books, and the trading crowd
mostly cannot ship the tooling. It is also the heaviest build and the easiest to
get wrong in public, which is why it waits until you have shipped three demos
and the ledger is on autopilot.

**Effort.** Two to three weekends. **Risk.** Medium, entirely in the framing.

---

## AI workflow demos (Pillar 3, monthly)

Pillar 3 is top of funnel: it brings in the AI-curious crowd who stay for the
market material. The trap is that AI-workflow content is the most commoditized
category on the internet, so the only versions worth building are the ones a
generic AI creator physically cannot make, because they require a real product
job with real constraints attached.

The test for every idea in this section: **would this still be interesting if the
AI part were removed?** If the answer is no, it is a tools video and it recruits
the wrong audience.

### 8. [ ] The acceptance-criteria compiler

**Turn a PRD into failing tests. Ambiguity in the spec becomes a compile error.**

An agent reads a PRD, extracts each acceptance criterion, and emits a failing
test per criterion. Criteria too vague to test come back as errors with the
specific missing decision named ("undefined: what counts as 'active'?").

The best AI-workflow demo you can make, because it is the Resolution Linter
argument moved from markets into product specs: **most disputes are writing
failures, whether the reader is a trader or an engineer.** That coherence is
worth more than the tool. Two demos making the same argument from different
directions is a thesis; one is a gadget.

Ship it against a public spec, never an employer PRD. Show the run where your
own writing fails the check.

**Effort.** One weekend. **Risk.** Low, on public or personal specs only.

### 9. [ ] This content system, on camera

**Run `npm run content:check` against your own draft and let it fail.**

The cheapest demo in this entire document. The system already exists, the gate
already rejects things, and the rejection is the content: a machine telling you
your writing is generic, with the specific line quoted back.

It also quietly proves the thing hiring managers actually want to know, which is
that you build tools for yourself and then live inside them. Most people
describing an "AI content workflow" are describing a prompt.

**Effort.** One recording session, zero build. **Risk.** None.
**Derives.** Backlog item 8 ("I rebuilt my content pipeline as a compiler")
already wants the essay; this is its demo.

### 10. [ ] What an agent actually costs per run

**Instrument a real agent. Publish tokens, cost, and latency per completed task.**

Everyone demos capability. Almost nobody publishes unit economics, and it is the
first question any operator asks when the demo ends. Take the Calibration Ledger
(already logs per-forecast token usage), run it for a month, and publish cost per
forecast, cost per resolved market, and where the spend actually goes.

The finding people will not expect: on most agent workloads the expensive part is
not the model, it is the retries, the re-reads, and the context you resend on
every turn. That is a product problem, not a model problem, which is exactly the
frame you want to be known for.

**Effort.** Half a weekend on top of the Ledger, which already carries the data.
**Risk.** None. Public venues, your own API bill.

### 11. [ ] The analytics agent that argues back

**An agent that reads a public dataset, proposes hypotheses, and is not allowed
to claim causality.**

Backlog item: "AI for Amplitude/Mixpanel analysis, useful prompts + failure
modes." The demo version uses a public dataset and makes the gate the point: the
agent proposes, a human owns causality, and the interesting footage is the agent
confidently proposing a causal story you then refuse.

Lower ceiling than 8 to 10 because the category is crowded. Build it only if the
refusal gate is genuinely the centerpiece.

**Effort.** One weekend. **Risk.** Low, public data only.

---

## Video generation demos (Pillar 3 tertiary)

This is the pillar with the highest slop risk and the highest personal edge. The
edge is specific: multi-modal gen content for growth at ByteDance means you have
actually shipped this at scale and can judge it commercially, which almost nobody
posting gen-video content can. The risk is that gen video is the single fastest
way to look like an AI influencer, which is the one thing 00-positioning
explicitly rules out.

So the rule for this section is: **evaluate gen media, do not perform it.** Every
demo below produces a judgment, a cost curve, or a failure. None of them are
"look at this cool clip."

### 12. [ ] Cost per usable second

**Same brief through several video models, scored on a published rubric.**

The metric is the whole demo. Not cost per second, which every comparison
already reports, but **cost per second you would actually ship**: generate N
seconds, apply a fixed acceptance rubric (prompt adherence, temporal
consistency, legible on-screen text, hands and faces, motion artifacts), count
what survives, divide.

That single reframe moves the conversation from demo reel to unit economics,
which is your lane and nobody else's in this category. A model that is cheapest
per second and fails the rubric four times out of five is the most expensive
option on the board, and the table showing that is the shareable artifact.

Publish the rubric before the results, same discipline as the Ledger.

**Effort.** One weekend plus generation credits. **Risk.** Low. Keep it to
capability comparison; do not editorialize about vendors.

### 13. [ ] Essay to 60-second explainer, as a pipeline

**A repeatable pipeline that turns one of your own essays into a narrated
explainer. Ship the pipeline and the video together.**

The marginal cost is close to negative: you need distribution for the essays
anyway, so the artifact is something you would have made regardless, and the
pipeline is reusable every fortnight. Market mechanics are genuinely better
explained in motion than in prose, so this is one of the rare cases where gen
media is a real lever rather than decoration.

Point it at your own published essay. Show the script step, the storyboard step,
and the part where you throw out the model's first structure because it buried
the mechanism.

**Effort.** One weekend to build, then roughly an hour per essay.
**Risk.** Low. Your own content, your own voice, no likeness of anyone else.

### 14. [ ] The gen media failure gallery

**Deliberately produce the artifacts that make gen video unusable in a regulated
financial product, then publish the checklist.**

Generate the disasters on purpose: wrong tickers rendered on screen, invented
numbers in a chart, a "spokesperson" who resembles a real person, a confident
claim no compliance team would ever clear. Then ship the pre-flight checklist
that catches each one.

The most defensible thing in this section and the one nobody else can write,
because it sits exactly on top of your compliance-as-product essay. It is also
the "receipts or admissions" content the writing contract keeps asking for: the
failures are real, generated by you, and shown rather than described.

**Effort.** Half a weekend. **Risk.** Low, and it lowers risk elsewhere by
making your position on gen media explicit and conservative. Never use a real
person's likeness, including your own colleagues, even to demonstrate the
failure. Synthesize an obviously fictional subject.

---

## Do not build these

**A chatbot that explains prediction markets.** Generic, already exists, and
your positioning explicitly bans explaining what a prediction market is.

**Multi-agent debate for probability estimates.** Reads as slop, does not beat a
single well-prompted call at this task, and you would be shipping the exact
"fluent demo with no gate" failure mode you wrote a whole essay against.

**Auto-listing markets from news headlines.** Fun to build, pulls the wrong
audience, and the interesting problem is resolution wording, which demo 2
already owns.

**Anything with a P&L number in the thumbnail.** It converts the account into a
trading account, attracts audience 3 at the expense of 1 and 2, and takes on
compliance risk for the privilege.

**An AI avatar of yourself delivering market recaps.** The single fastest way to
become the thing 00-positioning rules out. It also spends the credibility that
demos 12 to 14 are trying to build: you cannot be the person with taste about
gen media and the person with a synthetic talking head.

**A "best AI video tool" roundup.** Pure prompt-collector bait, obsolete within
a month, and it says nothing only you could say. Demo 12 is the version of this
idea that is worth your name on it.

---

## Sequencing

| When | Do | Publish |
|------|----|---------|
| Weekend 1 | Demo 1 infra. Log writing, cron, both arms. | Nothing. Start the clock. |
| Weekend 2 | Demo 2, recorded start to finish. | Demo 2 as the first public demo. |
| Week 3 | Cut the recording from weekend 2. | Demo 3, unedited spec to PR. |
| Week 4 | Demo 4, half a weekend. | Demo 4. Ledger is 30 days deep by now. |
| Week 5-6 | Nothing new. Write. | Demo 1, first results, with real calibration numbers. |
| Week 7+ | Demo 8 or 12. | Weekly ledger atoms carry the cadence. |

Two of these are effectively free and can slot into any week where a build slips:
**demo 9** (the content gate rejecting your own draft) needs a recording session
and no build at all, and **demo 3** is a recording of work already scheduled.
Keep them in reserve rather than spending a week on them.

The shape to notice: one build in weekend 1 that publishes in week 5, because
its value is elapsed time rather than effort. Start the slow compounding thing
before the fast shippable thing, then let the fast one carry the feed while the
slow one accumulates.

---

## Definition of shipped

A demo is not shipped until all four exist:

1. Running code in a public repo
2. A 60 to 120 second recording, screen only, starting mid-action
3. A 200 word writeup on the library at `/agents/{slug}`
4. One derived LinkedIn atom through `npm run content:check`

Takeaway: build one demo that scores itself in public for 90 days, and ship
three fast ones while it accumulates.
