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

## The fun lane (Pillar 3)

Everything above points at markets. This section deliberately does not.

The reasoning is not that fun is off-brand. It is that Pillar 3 exists to bring
in the AI-curious crowd, and the way to do that badly is to make market content
with an AI wrapper. The way to do it well is to build something genuinely hard
and genuinely beautiful, ship it, and let the craft speak. Nobody who lands on a
real-time GPU simulation asks what it has to do with prediction markets. They ask
how it was built, and then they look at what else you have made.

The bar for this lane is different from the bar above. Tier 1 demos have to be
defensible and compliance-safe. These have to be **impressive on sight and
shipped at a real URL.** No slides, no screen recording of someone else's tool.
A link that runs.

Two of them are done.

### 8. [x] Emergence

**A million agents running the physarum slime-mould rule on the GPU, with real
video export.**

Live: <https://claude.ai/code/artifact/d0058451-76ca-4f9d-84d1-c48782728cb7>
Source: [`apps/emergence.html`](../apps/emergence.html)

Each agent has three sensors, steers toward the strongest trail, and deposits as
it moves. That is the entire rule. Run it a million times per frame and it builds
transport networks that look designed. Real slime mould solves mazes and
reproduces the Tokyo rail network with the same logic, which is the hook: this is
not a screensaver, it is biological computation you can watch.

Everything runs in WebGL2 with agent state in a floating point texture, so it
holds 60fps on ordinary hardware. Drag on the canvas to lay down a nutrient trail
and the colony finds it. Record button writes a real WebM.

**Why it is worth having built.** It is the rare piece that reads as art to one
audience and as GPU engineering to another, and the recording button means every
run is publishable content rather than a thing you had to be there for.

### 9. [x] Latent Fields

**A neural network with random weights, evaluated once per pixel, animated
through latent space.**

Live: <https://claude.ai/code/artifact/9940cbcc-a76b-4564-905f-2edf2e846cae>
Source: [`apps/latent-fields.html`](../apps/latent-fields.html)

A SIREN (Sitzmann et al., 2020) implemented directly in a fragment shader:
coordinates go in, colour comes out, and the image *is* the function rather than
a thing sampled onto a grid. Same family of architecture as NeRF and every other
implicit neural representation. Nothing is trained, which is the point. All of
this structure is sitting in the initialisation.

The control worth looking at is **weight gain**. At 1.00x you get the published
initialisation, which is deliberately smooth. Push it up and each layer starts
beating against the one below until the field breaks into interference and then
into noise. That is the exact failure mode SIREN's ω₀-scaled initialisation
exists to prevent, made into a slider you can drag.

**Why it is worth having built.** Most "AI art" demos call someone else's model.
This is the network, in your browser, at 60fps, with every weight visible in the
seed. It is also a genuinely good explanation of a paper.

---

The rest of this lane, unbuilt, roughly in order of how much I want to see them.

### 10. [ ] Neural cellular automata that heals when you cut it

Train a tiny convolutional rule (Mordvintsev et al., Distill 2020) so a pattern
grows from a single cell and, crucially, regrows when you delete half of it. The
demo moment is the mouse: drag across the organism, tear a hole in it, and watch
it reconstruct.

The regeneration is not scripted anywhere. It falls out of a rule trained only to
grow, which is the whole reason the paper landed. Ship the training in-browser on
WebGPU compute shaders if it fits the frame budget; otherwise train offline and
ship the weights, and say which you did.

**Effort.** Two weekends, most of it getting backprop through time to run on the
GPU. **Risk.** None.

### 11. [ ] A Gaussian splatting renderer

Real-time radiance fields, the technique that displaced NeRF for actual
production use. Millions of oriented 3D gaussians, depth sorted every frame,
alpha blended front to back.

The hard parts are honest engineering: the sort is the bottleneck, and a naive
one drops you to single digit frames. Ship with a procedurally generated scene so
there is no asset to download, and let people fly through it.

**Effort.** Two to three weekends. **Risk.** None, and it is the most
current-feeling graphics technique on this list.

### 12. [ ] Optical flow slow motion, entirely client side

Take a short clip, compute dense optical flow on the GPU, and synthesise
in-between frames to turn 30fps into 240fps. Then export the result.

This is real video generation in the sense that matters: frames that did not
exist now do, and they were computed rather than sampled. It is also the honest
version of "AI video" for a browser with no model weights, and the artefacts are
half the fun. Show where the flow field fails, on occlusion edges and fast
rotation, because that is where you learn what these methods actually do.

**Effort.** Two weekends. **Risk.** None.

### 13. [ ] Live visuals driven by the microphone

FFT the mic input, feed the bands into a ray-marched scene, record the result.
The oldest idea in demoscene graphics and still the most immediately fun thing
you can put in front of someone, because the feedback loop is their own voice.

Cheap to build on top of the shader work already done for Emergence and Latent
Fields, and it is the one demo on this list that works at a party.

**Effort.** One weekend, less if it reuses the existing render pipeline.
**Risk.** Ask before recording anyone.

### 14. [ ] A WebGPU path tracer

Progressive path tracing with temporal accumulation, converging to a clean image
over a couple of seconds while you orbit the camera. Add a denoiser and it
converges in one.

The least novel idea here and the most technically satisfying to get right, which
is a reasonable trade. WebGPU compute is the current frontier for browser
graphics and very few people have shipped anything real on it.

**Effort.** Three weekends, honestly. **Risk.** WebGPU is not everywhere yet, so
it needs a graceful message on unsupported browsers.

---

## How these get deployed

Both shipped apps are authored once and deployed twice, which is worth copying
for the rest of the lane.

`apps/*.html` holds the source as an Artifact body: no `<html>`, `<head>` or
`<body>`, because the Artifact runtime supplies that wrapper. `npm run apps`
wraps the same source into standalone pages under `site/public/apps/`, which
GitHub Pages serves on merge to master. One source, two live URLs, and a build
that fails loudly if a document tag sneaks into the source.

The deployment constraint worth knowing before designing anything for this lane:
**a published page has no network access and cannot call a model at runtime.**
Available capabilities are file downloads and the viewer's own connectors,
nothing else. That rules out "type a prompt, get a generated result" as a live
artifact, and it is why both shipped apps compute everything on the GPU in the
page. Design around it from the start rather than discovering it at publish time.

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
become the thing 00-positioning rules out, and it spends the credibility the fun
lane is meant to build: you cannot be the person with taste about generated media
and the person with a synthetic talking head.

**A "best AI video tool" roundup.** Pure prompt-collector bait, obsolete within
a month, and it says nothing only you could say. Building the thing yourself is
the version of that idea worth your name on it.

---

## Sequencing

| When | Do | Publish |
|------|----|---------|
| Weekend 1 | Demo 1 infra. Log writing, cron, both arms. | Nothing. Start the clock. |
| Weekend 2 | Demo 2, recorded start to finish. | Demo 2 as the first public demo. |
| Week 3 | Cut the recording from weekend 2. | Demo 3, unedited spec to PR. |
| Week 4 | Demo 4, half a weekend. | Demo 4. Ledger is 30 days deep by now. |
| Week 5-6 | Nothing new. Write. | Demo 1, first results, with real calibration numbers. |
| Week 7+ | Demo 10 or 12. | Weekly ledger atoms carry the cadence. |

**Demo 3** is effectively free and can slot into any week where a build slips: it
is a recording of work already scheduled. Keep it in reserve rather than spending
a week on it. Demos 8 and 9 are already live, so the fun lane has a standing
answer whenever the markets lane needs more time.

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
