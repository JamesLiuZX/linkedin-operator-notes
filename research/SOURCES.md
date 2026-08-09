# Receipt bank

Every number used in `articles/`, `posts/`, or a demo caption traces to a row here.
Verified July 2026. Re-verify anything older than 90 days before publishing.

Rule: if a claim needs a number and there is no row for it, either find one or
cut the claim. Do not round a real number into a rounder-sounding one.

---

## Volume and scale

| Fact | Number | Window | Source |
|---|---|---|---|
| Sector taker volume | $8.6B | April 2026 | [Bitcoin.com News](https://news.bitcoin.com/prediction-market-traders-push-april-2026-volume-to-8-6b-kalshi-takes-the-lead/) |
| Kalshi taker volume | $5.4B | April 2026 | same |
| Kalshi market share | 52.6% | 30-day, March 2026 | [MetaMask](https://metamask.io/news/kalshi-vs-polymarket) |
| Polymarket 30-day volume | $9.7B | March 2026 | same |
| Polymarket monthly record | $10.8B | June 2026 (World Cup) | [CNBC](https://www.cnbc.com/2026/07/04/2026-fifa-world-cup-boosts-prediction-market-volumes.html) |
| Combined Kalshi + Polymarket | $44.8B | June 2026 | same |
| Sector open interest | $1.11B | 1 May 2026 | [Bitcoin.com News](https://news.bitcoin.com/prediction-market-traders-push-april-2026-volume-to-8-6b-kalshi-takes-the-lead/) |
| Kalshi open interest | $630.7M | 1 May 2026 | same |
| Polymarket open interest | $449.9M | 1 May 2026 | same |
| Polymarket fee revenue | $29.22M | April 2026 | same |
| Category volume trend | soared into 2026 | to May 2026 | [Pew Research](https://www.pewresearch.org/short-reads/2026/05/27/trading-volume-on-prediction-markets-has-soared-in-recent-months/) |

**The ratio worth using.** Open interest of $1.11B against April volume of $8.6B is
roughly 13% of monthly volume sitting as actual positions. Most of the number is
turnover, not conviction. Use this when someone quotes a volume headline at you.

---

## Resolution and disputes

| Fact | Detail | Source |
|---|---|---|
| Concentration of oracle votes | In most disputed Polymarket markets, more than half the UMA votes came from the ten largest wallets | WSJ investigation, May 2026, via [The Defiant](https://thedefiant.io/news/markets/usd85m-polymarket-dispute-over-strategy-s-may-bitcoin-sale-puts-uma-s-token-voting-oracle-on) |
| Voter conflict of interest | At least 60% of active UMA voters could be linked to live Polymarket accounts | same |
| Governance attack | "Will Ukraine agree to Trump's mineral deal before April?" moved 9% to 100% and resolved YES with no agreement reached, 24-25 March 2025 | [Orochi Network](https://orochi.network/blog/oracle-manipulation-in-polymarket-2025) |
| Attack size | Attacker cast 5M UMA, about 25% of votes in that resolution round | same |
| Disputed notional | $60M+ dispute over Strategy's May Bitcoin sale | [The Defiant](https://thedefiant.io/news/markets/usd85m-polymarket-dispute-over-strategy-s-may-bitcoin-sale-puts-uma-s-token-voting-oracle-on) |
| Ambiguity fallback | UMA can settle a fundamentally ambiguous market 50-50 | [Polymarket docs](https://docs.polymarket.com/concepts/resolution) |
| Escalation path | Propose, dispute, second proposal, then DVM token-holder vote | [Polymarket help](https://help.polymarket.com/en/articles/13364551-how-are-markets-disputed) |

**The line this supports.** A 50-50 settlement is the oracle telling you the
sentence was unwriteable. Nobody was wrong about the world. Someone was wrong
about the words.

---

## Liquidity rewards mechanics

Polymarket's published maker-rewards rule, used as the model for the Farm Lab demo.

| Component | Rule | Source |
|---|---|---|
| Per-order score | `S(v) = ((max_spread - order_spread) / max_spread)^2 x order_size` | [Polymarket docs](https://docs.polymarket.com/market-makers/liquidity-rewards) |
| Max spread | typically 3c from midpoint; beyond it scores zero | same |
| Two-sided requirement | `Q_min = min(Q_one, Q_two)`; single-sided liquidity penalized by a factor of 3 | same |
| Payout | daily pool split pro-rata by score across sampled epochs | same |
| Prohibited | wash trading disqualifies from all reward programs | [Start Polymarket](https://startpolymarket.com/strategies/reward-farming/) |
| Farming strategy in the wild | rest orders tight to the midpoint on both sides, earn regardless of fills | same |

**Why the quadratic matters.** The square means an order at 0.5c from mid scores
about 69% of a mid-touching order, while one at 2.5c scores about 2.8%. The rule
is designed to pay for tightness. It has no term for whether the order ever fills.
That gap is the entire farming surface, and it is the point of the demo.

---

## Forecast accuracy (Brier scores)

Lower is better. Range 0 to 1. This table is the spine of the calibration essay.

| Forecaster | Brier | Source |
|---|---|---|
| Kalshi and Polymarket market prices | ~0.09 | [Keyrock](https://keyrock.com/knowledge-hub/prediction-market-accuracy-brier-scores/) |
| Human superforecasters | 0.096 | same |
| AIA Forecaster (scaffolded LLM) | 0.075 | [arXiv 2511.07678](https://arxiv.org/pdf/2511.07678) |
| Best general LLM forecaster | 0.109 | [Hindcast, arXiv 2607.14051](https://arxiv.org/html/2607.14051) |
| General public | 0.121 | [Keyrock](https://keyrock.com/knowledge-hub/prediction-market-accuracy-brier-scores/) |
| Frontier LLMs, unaided | 0.122 to 0.136 | same |
| Brier Skill Score, most frontier models vs market | negative | [arXiv 2512.16030](https://arxiv.org/pdf/2512.16030) |
| Best BSS achieved by a single model | +0.057 | same |

**The claim this licenses.** An unaided frontier model at 0.13 is worse than the
market it is trading against at 0.09, and worse than the general public at 0.121.
Scaffolding closes the gap and can beat it: 0.075. The edge is the harness, not
the model. Say it exactly that way, because the numbers only support that version.

---

## Regulation (US)

| Event | Date | Source |
|---|---|---|
| Third Circuit rules for Kalshi, sports event contracts are swaps | 7 April 2026 | [Holland & Knight](https://www.hklaw.com/en/insights/publications/2026/02/prediction-markets-at-a-crossroads-the-continued-jurisdictional-battle) |
| CFTC sues Arizona, Connecticut, Illinois | 2 April 2026 | [Norton Rose Fulbright](https://www.nortonrosefulbright.com/en-us/knowledge/publications/ad8a494a/prediction-markets-at-a-crossroads-preemption-enforcement-and-rulemaking) |
| Tennessee TRO converted to preliminary injunction for Kalshi | 19 February 2026 | same |
| Maryland court denies Kalshi preliminary injunction | 1 August 2025 | same |
| Ninth Circuit hears Nevada appeal | 16 April 2026 | same |
| CFTC issues new proposed rule, changes to Rule 40.11 | 10 June 2026 | [Ropes & Gray](https://www.ropesgray.com/en/insights/alerts/2026/06/rewriting-the-rulebook-cftc-proposes-rule-changes-for-prediction-market-contracts) |
| Circuit split live | as of July 2026 | [Congress.gov CRS](https://www.congress.gov/crs-product/LSB11441) |

**The operator point.** Two federal appeals courts disagree, which means the same
contract is legal in one circuit and contested in another. That is not a legal
footnote. It is a product requirement: jurisdiction has to be a first-class field
in your market model, not a launch-day config flag.

---

## LinkedIn distribution mechanics

Use these to schedule, not to write. Never let them touch the voice.

| Signal | Effect | Source |
|---|---|---|
| Dwell 0 to 3 seconds | 1.2% engagement rate | [DataSlayer](https://www.dataslayer.ai/blog/linkedin-algorithm-february-2026-whats-working-now) |
| Dwell 61+ seconds | 15.6% engagement rate, about 13x | same |
| Comment weight | counts roughly 2x a like; substantive multi-sentence comments weighted far higher | [SocialBee](https://socialbee.com/blog/linkedin-algorithm/) |
| Outbound link in post body | about 60% less reach than the same post without it | [GrowLeads](https://growleads.io/blog/linkedin-algorithm-2026-text-vs-video-reach/) |
| Golden hour | engagement quality in first 60 minutes is a core reach signal | same |
| Generic comments | "Great post" style comments flagged as inauthentic | [SocialBee](https://socialbee.com/blog/linkedin-algorithm/) |

**How this changes the schedule, and nothing else.** Link goes in the first
comment, never the body. Post lands 30 to 60 minutes before a window where you
can actually reply. A demo GIF beats a screenshot because it buys dwell seconds
honestly. None of this is a reason to write worse.

---

## Gen media: video generation models

Verified August 2026, for the Restyle Lab demo and its essay. Model behavior
shifts fast; re-verify vendor claims before citing a specific number in a new
piece.

| Fact | Detail | Source |
|---|---|---|
| Four labs shipped a text-to-video API in the same season | Sora 2 (OpenAI), Veo 3.1 (Google DeepMind), Kling 3.0 (Kuaishou), Seedance 2.0 (ByteDance) | vendor product pages |
| Veo 3.1 generates audio natively | Dialogue, sound effects, and ambience generated in the same pass as the picture, lip-synced to the generated face | [Google DeepMind](https://deepmind.google/models/veo/) |
| Veo 3.1 native clip length | One generation call produces an 8-second clip with synchronized audio | same |
| Other three vendors, this generation | Sora 2, Kling 3.0, and Seedance 2.0 do not ship the audio track in the same call; audio is a separate step or absent | cross-referenced vendor comparison coverage, Aug 2026 |

**The line this supports.** "Video generation" is not one capability with four
brand names on it. Only one of the four current frontier models treats sound
as part of the same generation as the picture. A prompt compiler that does not
know which model it is targeting will write audio cues for three models that
throw them away.

---

## Short-form video and UGC: hook rate

Verified August 2026, for the Retention Curve Lab demo and its essay.

| Fact | Detail | Source |
|---|---|---|
| Hook rate, definition | Share of impressions that keep watching past the platform's early-drop-off window | [Hawky.ai](https://hawky.ai/blog/hook-rate) |
| Meta's measurement window | 3-second video plays / impressions | same |
| TikTok's measurement window | 2-second video views / impressions, one second shorter than Meta's | same |
| Meta hook rate bands | 25 to 30% solid, 30 to 40% good, 40%+ elite | same |
| TikTok hook rate bands | 30 to 35% baseline, 40%+ top quartile | same |

**The catch worth naming.** Meta and TikTok are not measuring the same thing.
A TikTok hook rate and a Meta hook rate one point apart are not a tie, because
the two platforms are integrating a different width of window before they call
a viewer "hooked." Comparing the two numbers directly is a unit error, the
video equivalent of comparing a price in dollars to a price in cents.

---

## AI workflow economics

Verified August 2026, for the Workflow ROI Lab demo and its essay.

| Fact | Detail | Source |
|---|---|---|
| Claude Sonnet 5 pricing | $2 / $10 per million input/output tokens, introductory, through 31 August 2026; $3 / $15 standard pricing after | [Anthropic](https://www.anthropic.com/news/claude-sonnet-5) |
| Claude Haiku 4.5 pricing | $1 / $5 per million input/output tokens | [Anthropic](https://www.anthropic.com/news/claude-haiku-4-5) |
| Claude Opus 4.5 pricing | $5 / $25 per million input/output tokens | [Anthropic](https://www.anthropic.com/news/claude-opus-4-5) |
| METR RCT on AI coding tools | 16 experienced open-source developers, 246 real tasks in codebases they knew well, randomized to allow or disallow AI tool use | [METR, 10 Jul 2025](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) |
| METR result | Access to AI tools increased completion time by 19%. Before starting, developers had forecast a 24% speedup. After finishing, still believing they had been faster, they estimated a 20% speedup | same |

**The line this supports.** The gap in the METR result is not 19 points, it is
39: what developers believed after the task (20% faster) minus what a stopwatch
measured (19% slower). Self-report is not a measurement instrument for whether
an AI workflow paid for itself. A before/after time log is.
