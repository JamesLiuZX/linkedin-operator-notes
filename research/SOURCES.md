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

---

## Computer-use agents: OSWorld

Verified August 2026.

| Fact | Detail | Source |
|---|---|---|
| OSWorld, definition | Benchmark that scores agents on real desktop and web tasks in a live OS, not a scripted sandbox | [OSUniverse paper](https://arxiv.org/pdf/2505.03570) |
| Early baseline | Computer-use agents scored around 12% on OSWorld in April 2024 | [AgentAtlas](https://arxiv.org/html/2605.20530v1) |
| Human baseline | About 72% on standard OSWorld tasks | same |
| 2026 standard-task state | Multiple frontier systems now reach or pass the human baseline on standard OSWorld tasks | same |
| OSWorld 2.0 | A longer-horizon extension where the median task takes a human 1.6 hours to complete | same |
| OSWorld 2.0 result | The best frontier system completes only 20.6% of OSWorld 2.0 tasks | same |
| Benchmark-wide trend | Best verified success rates across OSWorld, WebArena, GAIA, and WebVoyager rose roughly 5 to 7 times between 2023 and early 2026 | same |

**The line this supports.** Two numbers describe two different jobs. Near or
above 72% is the standard OSWorld task: open an app, click through a few
screens, done in minutes. 20.6% is OSWorld 2.0: a task that takes a human
1.6 hours. An agent that clears the first bar has not demonstrated anything
about the second one.

---

## Long-context and retrieval: lost in the middle

Verified August 2026.

| Fact | Detail | Source |
|---|---|---|
| "Lost in the Middle" finding | LLM accuracy on multi-document QA and key-value retrieval follows a U-shaped curve by position: highest when the answer sits at the start or end of the context, and degrades by more than 30% when it sits in the middle | [summary of Liu et al., via getmaxim.ai](https://www.getmaxim.ai/articles/solving-the-lost-in-the-middle-problem-advanced-rag-techniques-for-long-context-llms/) |
| Replication | The U-shaped pattern replicated across six model families: GPT-3.5-Turbo, GPT-4, Claude 1.3, LongChat-13B, MPT-30B, Cohere Command | same |
| Retrieval accuracy at scale | A retriever reporting 90% accuracy at 1M tokens of indexed context still returns a wrong result on roughly 1 in 10 queries | same |

**The line this supports.** A bigger context window is not the same claim as
a more accurate answer. The U-curve means the model's blind spot is the
middle of whatever you hand it, so the fix is what you put at the start and
end, or what you retrieve instead of pasting in whole, not how many tokens
the window technically holds.

---

## Multi-agent chains: the compounding math

Verified August 2026.

| Fact | Detail | Source |
|---|---|---|
| Five-step chain at 95% | Five agents chained together, each independently 95% reliable, produce an end-to-end success rate of 0.95^5, about 77% | [MindStudio](https://www.mindstudio.ai/blog/multi-agent-reliability-compounding-problem-77-percent) |
| Ten-step chain at 85% | Ten steps at 85% per-step reliability compound to 0.85^10, about 20% | [Cloud AI](https://cloudai.pt/multi-agent-reliability-85-per-step-20-at-step-10/) |
| Token overhead | Multi-agent architectures use 1.6x to 6.2x more tokens than a comparable single-agent workflow for the same task | [Zartis](https://www.zartis.com/the-compounding-errors-problem-why-multi-agent-systems-fail-and-the-architecture-that-fixes-it/) |
| Failure-mode split | Specification failures account for roughly 42% of documented multi-agent failures, coordination failures roughly 37% | [Galileo](https://galileo.ai/blog/multi-agent-ai-failures-prevention) |
| Metric gap | Pass@1 evaluation, whether an agent succeeds once under ideal conditions, overestimates real production reliability by 20 to 40 percentage points | [Towards a Science of AI Agent Reliability](https://arxiv.org/pdf/2602.16666) |

**The line this supports.** This is not a study finding, it is arithmetic:
0.95 multiplied by itself five times is 0.7738. Every additional independent
step in a chain is a multiplication by a number under 1, and the count of
steps, not any single step's quality, is what decides whether the chain is
still reliable by the end of it.

---

## Voice AI in customer service

Verified August 2026.

| Fact | Detail | Source |
|---|---|---|
| Contact-center adoption | 88% of contact centers use AI in some form | [Digital Applied](https://www.digitalapplied.com/blog/customer-service-ai-agent-statistics-2026-data) |
| Full integration | Of those, only 25% have fully integrated it into their workflow | same |
| Enterprise production use | 67% of Fortune 500 companies run production voice AI systems | [CloudTalk](https://www.cloudtalk.io/blog/ai-voice-agent-statistics/) |
| Banking sector | 78% of the top 50 banks have deployed a production voice agent for at least one customer-facing use case, up from 34% in 2024 | [Ringly.io](https://www.ringly.io/blog/voice-ai-statistics-2026) |
| Satisfaction trend | Customer satisfaction with AI voice interactions rose from 53% in 2022 to 72% in 2025 | same |

**The line this supports.** 88% and 25% describe the same population. Almost
every contact center has AI turned on somewhere. Barely a quarter have
finished the harder work of making it the actual workflow instead of a
pilot running next to the real one.

---

## AI avatars and synthetic UGC

Verified August 2026.

| Fact | Detail | Source |
|---|---|---|
| Arcads | AI UGC-ad startup founded 2024, raised a $16M seed round in December 2025, crosses 6,000 clients producing roughly 100,000 ad assets a month | [Lovino.ai](https://lovino.ai/blog/seedance-2-vs-arcads-creatify-heygen-best-ai-ugc-ads) |
| Avatar library scale | Arcads offers a 300+ AI-actor library built for direct-response ad performance | same |
| Language coverage | HeyGen supports 175+ languages with voice cloning and lip-sync; Synthesia covers 140+ | [HeyGen](https://www.heygen.com/blog/best-ai-video-generator-for-ads), [DesignRevision](https://designrevision.com/blog/best-ai-ugc-tools) |
| Ad-readiness comparison | In one hands-on comparison, roughly 70% of HeyGen outputs needed re-rendering or script fixes before they were ad-ready, against about 40% for MakeUGC and 35% for Arcads | [AdGenerate](https://adgenerate.ai/blog/makeugc-vs-arcads-vs-heygen) |
| The polish problem | The same comparison found that highly polished avatar output is increasingly recognized by TikTok and Instagram audiences as the "professional AI video" look, and scrolled past, while rougher, more direct-response-style avatars performed closer to real UGC | same |

**The line this supports.** UGC's entire value proposition was that it does
not look produced. An avatar tool optimized for visual polish is optimizing
against the one property that made the format work in the first place.

---

## AI-generated ad creative performance

Verified August 2026.

| Fact | Detail | Source |
|---|---|---|
| CTR study | A study by researchers at Columbia, Harvard, and Carnegie Mellon analyzing 500M+ ad impressions found AI-generated ads achieved a 0.76% CTR against 0.65% for human-created ads | [Digital Applied](https://www.digitalapplied.com/blog/ai-ad-creative-benchmark-2026-ctr-roas-data) |
| Conversion gap | Conversion rates for AI-generated ads dropped 8% on high-consideration purchases, widening to 14% on purchases over $500 | same |
| Low-price parity | On lower-priced consumer products, AI-generated creative reached full conversion parity with human-produced ads | same |
| Meta Advantage+ | Advantage+ Shopping campaigns, which test 150+ creative combinations per campaign, delivered 32% lower cost per acquisition than manually configured campaigns, and boosted CTR 15 to 20% | [community discussion citing Meta](https://community.shopify.com/t/meta-advantage/579987) |
| Creative fatigue | Smartly.io's analysis of 6.7M ad placements across Instagram and TikTok found AI-driven creative rotation cut frequency-related performance decay by 38.4%, keeping ads above baseline CTR for an average of 19.3 days versus 7.1 days for a static single-creative campaign | [Digital Applied](https://www.digitalapplied.com/blog/ai-ad-creative-benchmark-2026-ctr-roas-data) |

**The line this supports.** The click and the sale are not the same
customer decision. AI creative wins the higher-volume, lower-stakes one and
loses ground on the slower, higher-consideration one, and a single CTR
number averages the two into a result that overstates the part that is
actually working.
