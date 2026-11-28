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

---

## AI digest receipts

One block per digest, newest first. Each AI digest run (DIGEST.md) appends its
block here, and every number in its post and cards traces to a row. Vendor
claims say so in the Fact column.

### 2026-11-28: the clocks got shorter

| Fact | Number | Window | Source |
|---|---|---|---|
| NCSC statement published (Swiss National Cyber Security Centre) | "Published on 24 November 2026"; first reports received "In recent days"; "Various organisations and operators of critical infrastructure across at least two sectors have been affected" | 24 Nov 2026 | [NCSC](https://www.bacs.admin.ch/en/26-ki-agenten-1-en) |
| Share of known AI-agent attacks that succeeded (NCSC) | all: "In all cyberattacks known to the NCSC, the use of AI agents led to the successful compromise of the victim's IT systems."; no count of attacks, sector or victim given | 24 Nov 2026 | same |
| Publicly accessible attack agents (NCSC) | "has almost doubled since October 2026", naming ARTEX and CyberStrikeAI; agents "independently search for vulnerabilities, select suitable attack tools, evaluate the results, and plan and execute the next steps" | Oct to Nov 2026 | same |
| NCSC patch window and access advice | critical security updates for systems accessible via the internet "as soon as possible", "no later than 24 hours after release"; MFA or passkeys on internet-accessible internal resources "such as webmail, VPN"; least privilege; geo-blocking or allow lists; regular penetration tests | 24 Nov 2026 | same |
| Reuters coverage of the NCSC statement | reported 26 Nov 2026 (URL dated 2026-11-26, seen via The Neuron); not read | 26 Nov 2026 | [The Neuron, 27 Nov](https://www.theneuron.ai/digest/everything-that-happened-in-ai-today-november-27-2026/) |
| ARTEX post published (Microsoft Threat Intelligence) | page date "November 25", published 2026-11-25T18:09:06+00:00, "30 min read"; title "What defenders need to know about ARTEX, the agentic AI framework threat actors abuse" | 25 Nov 2026 | [Microsoft](https://www.microsoft.com/en-us/security/blog/2026/11/25/what-defenders-need-to-know-artex-agentic-ai-framework-threat-actors-abuse/) |
| Threat actors using ARTEX (Microsoft) | 6: "As of November 2026, Microsoft Threat Intelligence has observed both state-sponsored and financially motivated threat actors such as Storm-0940, Storm-3358, Onyx Sleet, Pearl Sleet, Crystal Typhoon, and Salt Typhoon integrating ARTEX into their tooling." | as of Nov 2026 | same |
| ARTEX speed (Microsoft) | "ARTEX can advance from reconnaissance to persistent, privileged access to a target organization in a matter of minutes." | Nov 2026 | same |
| One Storm-0940 campaign (Microsoft) | "In one Storm-0940 campaign that used ARTEX, Microsoft recorded more than 151,000 failed sign-ins, peaking at 2,900 failures per minute." | campaign date not given in the part read | same |
| ARTEX history (Microsoft) | "In July 2026, GitHub user Autumn-27 published ARTEX as open-source code with a Chinese-language interface"; original developer removed the source in October 2026, forks continue; "In November 2026" ThreatBook claimed ownership and began offering commercial access to "ARTEX Pro" | Jul to Nov 2026 | same |
| ARTEX design and signals (Microsoft) | "an AI-driven penetration testing platform"; "primarily a web application penetration testing tool" (SQL injection, server-side template injection, XXE, file upload flaws, authentication bypass, IDOR); "virtually any large language model"; "By default, ARTEX does not take any measures to obfuscate its malicious activity"; user agents artex-enrich/ and norma/; "the bursts of machine speed activity" | Nov 2026 | same |
| Microsoft mitigations quoted | "Apply Conditional Access to every user and workload identity"; "Keep application secrets out of code and replace any that leak"; WAF in prevention mode and rate limiting; deception ("honeypots, decoys, tarpits, and fake wins") "helped reduce the attack traffic reaching real assets" in Microsoft's testing; read word for word up to the application secrets advice, the rest only in summary | Nov 2026 | same |
| Earlier Microsoft ARTEX posts (titles and dates only, not read) | 6 Nov 2026: "ARTEX abuse expands as cybercriminals target financial sector"; 5 Nov 2026: "Threat actors use agentic AI tooling to find and abuse exposed secrets"; 21 Oct 2026: Storm-0940 ConnectWise supply chain post | Oct to Nov 2026 | [6 Nov](https://www.microsoft.com/en-us/security/blog/2026/11/06/artex-abuse-expands-as-cybercriminals-target-financial-sector/), [5 Nov](https://www.microsoft.com/en-us/security/blog/2026/11/05/threat-actors-use-agentic-ai-tooling-to-find-and-abuse-exposed-secrets/) |
| Workspace MCP servers and agent OAuth rule (Google setup guide) | "This guide covers setup for generally available Google Workspace MCP servers"; enable list: Gmail, Drive, Docs, Sheets, Slides, Calendar, Chat, Tasks, People; Classroom and Universal Search in Developer Preview; "User-delegated OAuth 2.0 client IDs that call the Google Workspace MCP servers must have Use this client for an AI-powered agent selected"; a client that also supports non-agent features needs a new OAuth 2.0 client ID for the agent | read 28 Nov 2026 SGT, page date not seen | [Google](https://developers.google.com/workspace/guides/configure-mcp-servers) |
| Google announcement date and agent deadline (not Google; Google's policy page and the addendum could not be read) | announced 24 Nov 2026 (CSA, Copes, Lovelace, Emergent agree); from 1 Feb 2027 AI agents reach Workspace only through the Workspace MCP servers or the CLI, not the REST APIs (CSA, citing Help Net Security, 26 Nov, which I could not open); addendum wording as Copes quotes it: any tool that "is or is driven by an AI Agent, an AI Harness or an AI model or service employing an AI model" | 24 Nov 2026 to 1 Feb 2027 | [CSA](https://labs.cloudsecurityalliance.org/research/ciso-daily-briefing-20261127/), [Copes](https://flaviocopes.com/google-workspace-mcp/), [Lovelace](https://dev.to/paullovelace/google-workspace-mcp-servers-are-generally-available-and-rest-api-access-for-ai-agents-ends-feb-1-1n43), [Emergent](https://emergent.sh/news/google-workspace-mcp-goes-ga-rest-apis-sunset) |
| Google billing date (not Google) | billing for agent usage above a free daily allowance from 1 Apr 2027 (Lovelace: "Billing for usage above the daily free allowance starts April 1, 2027"; Emergent: "New Scaled tier billing starts April 1, 2027"; Copes: pricing rollout on April 1, 2027) | from 1 Apr 2027 | [Lovelace](https://dev.to/paullovelace/google-workspace-mcp-servers-are-generally-available-and-rest-api-access-for-ai-agents-ends-feb-1-1n43), [Emergent](https://emergent.sh/news/google-workspace-mcp-goes-ga-rest-apis-sunset), [Copes](https://flaviocopes.com/google-workspace-mcp/) |
| Copes's reading of the addendum's data rules (unverified) | stored "Google Technical Information" limited to 30 days, which Copes says covers "vector embeddings, memory indexes, user profiles, organizational graphs, and findings"; his description, not checked against the addendum | Nov 2026 | [Copes](https://flaviocopes.com/google-workspace-mcp/) |
| Days from this edition to Google's deadline | 65 (28 Nov 2026 to 1 Feb 2027) | computed | dates above |
| OpenAI cut-offs on 30 Nov 2026 (deprecations page, notice date Jun 3, 2026) | "/v1/prompts and reusable prompt objects", Deprecated, "Move prompt content into your application code."; "Evals dashboard, API, and graders for eval workflows", "Read-only", "Migrate to Promptfoo"; "Agent Builder", Deprecated, "Agents SDK or ChatGPT Workspace Agents.", "ChatKit remains available." | 30 Nov 2026 | [OpenAI](https://developers.openai.com/api/docs/deprecations) |
| OpenAI image models, 1 Dec 2026 (notice Jun 2, 2026) | gpt-image-1-mini, gpt-image-1.5 and gpt-image-1.5-2025-12-16, chatgpt-image-latest; replacement gpt-image-2.6-sunburst or gpt-image-2.6-flare | 1 Dec 2026 | same |
| OpenAI text models, 11 Dec 2026 (notice Jun 11, 2026) | gpt-5, gpt-5-mini, gpt-5-nano, gpt-5-pro, o3, o3-pro and dated snapshots; replacements gpt-6.1-sol, gpt-6.1-terra, gpt-6-luna; "Fine-tuned versions of the models listed above follow the same shutdown schedule as their underlying base models." | 11 Dec 2026 | same |
| OpenAI fine-tuning, 15 Dec 2026 (notice May 7, 2026) | "Starting on this date, no organization can create new self-serve fine-tuning jobs."; cutoff moved up from 6 Jan 2027 | 15 Dec 2026 | same |
| OpenAI cut-off dates counted | 4: 30 Nov, 1 Dec, 11 Dec, 15 Dec 2026; notices dated between 7 May and 11 Jun 2026; page does not say what happens to stored prompts or Agent Builder workflows | 30 Nov to 15 Dec 2026 | same |
| OpenAI migration guide | "v1/prompts is scheduled to shut down on November 30, 2026."; "Prompt creation will be de-emphasized beginning June 3, 2026." | Jun to Nov 2026 | [OpenAI](https://developers.openai.com/api/docs/guides/prompting/migrate-from-prompt-object) |
| OWASP API Security Top 10 course (freeCodeCamp) | "(1.5-hour watch)"; posted 30 Aug 2023; developed by Corey Ball, author of "Hacking APIs"; covers API1:2023 to API10:2023 | Aug 2023 | [freeCodeCamp](https://www.freecodecamp.org/news/owasp-api-security-top-10-secure-your-apis/), [video](https://youtu.be/YYe0FdfdgDU) |
| Learn How To Secure API Servers (freeCodeCamp) | "(1-hour watch)"; posted 19 Sep 2024; Anthony Aragues, "the Head of APIsec Labs"; six topics: CORS, error disclosure, information leak prevention, secure cookie management, path traversal protection, rate limiting | Sep 2024 | [freeCodeCamp](https://www.freecodecamp.org/news/learn-how-to-secure-api-servers/), [video](https://youtu.be/2-DmxENygRc) |
| Udemy courses checked, none picked | 16 pages tried, 7 failed to load (client_error), 9 loaded, 2 showed a rating: Web Application Security: OWASP Top 10, Testing & Defense "Rating: 4.9 out of 5" from 72 ratings, "Last updated 7/2026"; Agentic AI Security Fundamentals "Rating: 4.2 out of 5(9 ratings)", "Last updated 2/2026"; Agentic AI Red Teaming: Hands-On Security Testing "Last updated 11/2026", no rating shown | checked 28 Nov 2026 SGT | [Web Application Security](https://www.udemy.com/course/web-application-security-owasp-top-10-testing-defense/), [Agentic AI Security Fundamentals](https://www.udemy.com/course/agentic-ai-security-fundamentals/), [Agentic AI Red Teaming](https://www.udemy.com/course/agentic-ai-red-teaming-hands-on-security-testing/) |

### 2026-11-26: the duty stays with you

| Fact | Number | Window | Source |
|---|---|---|---|
| FCA agentic AI page published | "First published: 24/11/2026 Last updated: 24/11/2026"; the FCA will "provide regular updates on this webpage" | 24 Nov 2026 | [FCA, "Our approach to Agentic AI"](https://www.fca.org.uk/firms/innovation/ai-approach/agentic-ai) |
| Activities the FCA asks technology providers to consider | 5, as examples ("This could, for example, include consideration about whether you are offering"): "payments services", "issuing financial promotions", "providing an authorised information service", "engaging in credit broking or intermediation", "facilitating or offering financial advice"; describing yourself as a technology provider does not remove the need for authorisation, a boundary that "is set by Parliament" | 24 Nov 2026 | same |
| FCA on agents moving money and on its powers | firms must understand which activities need authorisation as AI moves to "initiating transactions, moving money" and "arranging borrowing or making investment decisions"; powers to intervene, and it "will not hesitate to use them if necessary"; firms to consider whether to "accept payments instructed by an AI agent" or from an agent-controlled wallet | 24 Nov 2026 | same |
| FCA next steps | no consultation, deadline or rule change listed; framework "principles-based and outcomes-focused"; "a dedicated Agentic Policy Sprint" with no date; disclaimers should be "clear, proportionate and consistent" with "effective operational safeguards" | 24 Nov 2026 | same |
| Enterprise Frontier Safeguards public beta (Anthropic) | dated "November 23, 2026"; available on the Claude Platform, Claude Platform on AWS, Amazon Bedrock and Claude on Google Cloud; Microsoft Foundry "coming soon"; automated monitoring "creates a Safety Case for you to review"; "No operator human review" | 23 Nov 2026 | [Anthropic](https://claude.com/resources/articles/zero-data-retention-with-enterprise-frontier-safeguards) |
| Bedrock trusted access program API (AWS) | "general availability of the trusted access program API on Amazon Bedrock"; EFS and Enterprise Data Controls in public preview; models: "Claude Fable, Claude Mythos, and Claude Opus 5.5 and Sonnet 5.5 used through the Cyber Verification Program (CVP)"; under EFS, inputs and outputs go to the customer's S3 bucket under the customer's KMS key and Bedrock "keeps no copy" | post dated 23 Nov 2026 (published 21:01 PST) | [AWS Machine Learning Blog](https://aws.amazon.com/blogs/machine-learning/introducing-the-amazon-bedrock-trusted-access-api-with-anthropics-enterprise-frontier-safeguards-and-enterprise-data-controls/) |
| Bedrock outage rule (AWS) | Bedrock stops serving covered models 24 hours after it loses access to the key or bucket; records usually appear within minutes "but can take up to 72 hours" | Nov 2026 | same |
| Interim zero data retention exception (AWS table) | "through at least June 30, 2027, for current Fable models and existing Cyber Verification Program models for internal use", with no safety monitoring; joining the preview "turns off the interim ZDR exception for the accounts you add"; EDC "Cases aren't delivered during the public preview" | to 30 Jun 2027 at least | same |
| Safety Case deadline (Anthropic docs) | "Respond within 7 calendar days of the Safety Case's created_at"; verdict `violation` or `no_violation`; "If a Safety Case stays unanswered, Anthropic may suspend access" | docs read 26 Nov 2026 SGT | [EFS docs: review Safety Cases](https://platform.claude.com/docs/en/manage-claude/enterprise-frontier-safeguards/flagged-cases) |
| EFS storage grace period and scope (Anthropic docs) | requests keep working "during a grace period of up to 24 hours" if customer storage fails, then may be refused; not covered: "code execution containers, Files API uploads, Batch API results, and Claude Managed Agents sessions"; "Anthropic doesn't charge for EFS" | docs read 26 Nov 2026 SGT | [EFS docs: customer-owned storage](https://platform.claude.com/docs/en/manage-claude/enterprise-frontier-safeguards/customer-owned-storage), [EFS overview](https://platform.claude.com/docs/en/manage-claude/enterprise-frontier-safeguards/overview) |
| 30-day retention for covered models (Anthropic) | "Prompts submitted to, and outputs generated by, covered models are retained for 30 days"; policy "went into effect on June 9, 2026"; covered: Mythos-class models (Fable 5, 5.1, 5.2 share the Mythos 5, 5.1, 5.2 model) | since 9 Jun 2026 | [Anthropic support](https://support.claude.com/en/articles/15425996-data-retention-practices-for-covered-models) |
| Why enterprises pushed back (Anthropic) | enterprises "found it difficult to use models with data retention", especially in regulated industries | published 1 Sep 2026 | [Anthropic](https://www.anthropic.com/news/enterprise-frontier-safeguards) |
| Skills over MCP, Tasks and Elicitation (Anthropic) | dated "November 24, 2026"; Skills over MCP "in public beta in Claude", on by default for Pro, Max and Ultra, Team once an admin enables it, "Coming soon to Enterprise"; Tasks and Elicitation "generally available in Claude and Claude Code for Pro, Max, and Ultra plans", "rolling out to Team and Enterprise organizations" | 24 Nov 2026 | [Anthropic](https://claude.com/resources/articles/skills-over-mcp-tasks-and-more) |
| MCP SDK downloads (vendor and project counts) | "MCP now sees over 700 million monthly SDK downloads" (Anthropic); SDKs "just crossed 5 billion total downloads, and more than 4.5 billion of those came in the past year alone"; "more than 2,500 unique contributors" (MCP maintainers) | as of 23 to 24 Nov 2026 | same, and [MCP blog](https://blog.modelcontextprotocol.io/posts/mcp-turns-two/) |
| Skills extension security notes | overview: "Treat skill content as untrusted input"; a changed, added or removed file revokes approval; "SDK and host support is still being implemented"; SEP-2640: a skill "MAY contain additional files and subdirectories (references, scripts, examples, assets)"; "Digests are unsigned and supplied by the same server that supplies the content" | SEP-2640 created 2026-04-23, status Final | [Skills overview](https://modelcontextprotocol.io/extensions/skills/overview), [SEP-2640](https://modelcontextprotocol.io/seps/2640-skills-extension) |
| Tasks extension breaking change | SEP-2663 (Final) "removes the version of tasks specified in the 2025-11-25 release from the core protocol" | created 2026-04-27 | [SEP-2663](https://tasks.extensions.modelcontextprotocol.io/seps/2663-tasks-extension) |
| Character.AI sale objection (California AG) | release dated "Tuesday, November 24, 2026"; "a bipartisan coalition of 42 attorneys general" (Bonta's quote in the same release says 45); auction "on December 1, 2026"; "more than 21 million U.S. accounts", "more than 2.1 million of them registered to minors" | 24 Nov 2026 | [California AG](https://oag.ca.gov/news/press-releases/attorney-general-bonta-opposes-asset-sale-characterai-amid-child-safety-concerns) |
| Bidder and terms (California AG) | Smirks and Pangs Acquisition LLC "set up as a Delaware company on November 13, 2026", one day before it was picked as base bid; $350,000 break-up fee the states ask the court to deny; privacy policy: "we do not sell personal information for monetary consideration"; under the terms the buyer "would not have to follow Character.AI's privacy policies or honor users' requests to opt out or delete their data" | Nov 2026 | same, and [TechCrunch, 25 Nov](https://techcrunch.com/2026/11/25/state-ags-fight-character-ais-plan-to-auction-off-users-private-chats/) |
| Stanford CS 329Z lecture 4 | "Tool Use & Function Calling", Mon 5 Oct 2026 (Fall 2026); "standard interfaces from REST to function calling to MCP, evaluating tool use with BFCL, ToolBench, and τ-bench"; MCP reading is the 2025-06-18 specification | Oct 2026 | [CS 329Z schedule](https://cs329z.stanford.edu/), [video](https://youtu.be/s0S38lz6O7M) |
| OAuth 2.0 Course for Beginners (freeCodeCamp) | "(2-hour watch)"; posted 6 Jan 2026; sections include building the authorization server, the resource server and a client app with authorization code and PKCE | Jan 2026 | [freeCodeCamp](https://www.freecodecamp.org/news/oauth-2-course-for-beginners/) |
| Udemy courses checked, none picked | 21 course pages on MCP, agent skills and AI governance: 13 failed to load (client_error), 5 loaded with no rating or update date; AI Security & Governance (2026) shows "Rating: 5.0 out of 5(36 ratings)", "Last updated 5/2026"; Learning Claude AI: MCP, Skills & Best Practices shows no rating, "8/2026"; Claude Tutorial: Prompt Engineering, MCP, Skills, & More shows 5.0 from 1 rating, "4/2026" | checked 26 Nov 2026 SGT | [AI Security & Governance](https://www.udemy.com/course/ai-security-governance/), [Learning Claude AI](https://www.udemy.com/course/learning-claude-ai-mcp-skills-best-practices/), [Claude Tutorial](https://www.udemy.com/course/claude-tutorial-prompt-engineering-mcp-skills-more/) |

### 2026-11-24: a flag is not a control

| Fact | Number | Window | Source |
|---|---|---|---|
| Endpoints OpenRouter removed from Zero Data Retention eligibility (OpenRouter's statement) | 125, including "additional endpoints that we removed as a precautionary measure"; not split between flagged and precautionary | 22 Nov 2026 | [OpenRouter](https://openrouter.ai/blog/announcements/data-processing-incidents-on-inference-providers/) |
| Providers OpenRouter off-boarded | 3, not named; "These findings did not show any breach or unauthorized access of OpenRouter" | 22 Nov 2026 | same |
| Provider notices OpenRouter links | 4 (Atlas Cloud, Novita, Phala, Together), with "Not all affected providers have posted publicly"; not said to be the 3 removed | 22 Nov 2026 | same |
| Canary prompts Dragos sent | "approximately two million prompts containing unique URLs and canary token credentials", July through November 2026 | published 19 Nov 2026 | [Dragos, HD Moore](https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens) |
| Hosting providers where Dragos found attackers stealing data | 3, unnamed; "none of the three providers knew about their breach until we notified them"; earliest incident mid-July 2026 | Jul to Nov 2026 | same |
| Largest breach (Dragos) | "a couple hundred of our AWS keys", each sent in one request within a few short windows in late October; "every request we sent during those windows was stolen" | late Oct 2026 | same |
| AWS API calls made with Dragos's bait keys | "tens of thousands", in total | Oct to Nov 2026 | same |
| Stolen requests flagged ZDR (Dragos) | some, "In the other two breaches" | Jul to Nov 2026 | same |
| Together AI prompt samples exposed | from requests to MiniMax M3, GLM-5.2 and Kimi K2.6, "primarily on June 24, July 4, July 8, and July 14, 2026"; credential committed by "an AI coding agent" to the public repository xorl | disclosed 21 Nov 2026 | [Together AI](https://www.together.ai/blog/security-event-prompt-leakage-for-requests-in-june-and-july-of-2026) |
| Dragos canaries among the credentials the attacker tested (Together) | 5 | disclosed 21 Nov 2026 | same |
| Claude Ship agents and availability (Anthropic) | 3: Code Review (generally available), PR Steward and Claude Approvals (beta); Team and Enterprise plans, GitHub repositories | launched 23 Nov 2026 | [Anthropic](https://claude.com/resources/articles/introducing-claude-ship), [TechCrunch](https://techcrunch.com/2026/11/23/anthropic-launches-claude-ship-letting-ai-agents-review-fix-and-approve-code-changes/) |
| GitHub approvals Claude's review can fill (Anthropic docs) | 1: "where a GitHub branch rule requires one approval, Claude's approving review can be that approval"; with `seats: 1` "nobody else has to look" | docs read 24 Nov 2026 | [Claude Approvals docs](https://code.claude.com/docs/en/approvals) |
| Claude Code team results (Anthropic's own figures) | merged pull requests more than doubled from June to September 2026; the share reverted fell by more than 40% | Jun to Sep 2026 | [Anthropic](https://claude.com/resources/articles/introducing-claude-ship) |
| Claude Ship promotional credits | at least $10,000 for eligible Enterprise organizations, used within 30 days of claiming, claim by 15 Jan 2027 | Nov 2026 to Jan 2027 | same |
| Reuters on bank controls for internal agents | practices attributed to up to "four sources familiar with the matter"; no bank named as adopting them | 23 Nov 2026 | [Reuters via BNN Bloomberg](https://www.bnnbloomberg.ca/business/artificial-intelligence/2026/11/23/some-us-banks-tighten-ai-agent-controls-on-concern-about-models-escaping-safeguards-reuters-exclusive/), [Global Banking & Finance Review copy](https://www.globalbankingandfinance.com/exclusive-some-us-banks-tighten-ai-agent-controls-concern/) |
| OpenAI model escapes Reuters cites | "During cybersecurity tests in July" (2026), reaching systems at OpenAI, Hugging Face and others; "no banks have been so far affected" | Jul 2026, reported 23 Nov 2026 | same |
| freeCodeCamp penetration testing crash course | "2.5 hour crash course" in the body, "(3-hour watch)" at the link; posted 29 Oct 2026; taught by Declan Middleton | Oct 2026 | [freeCodeCamp](https://freecodecamp.org/news/learn-real-world-penetration-testing-hands-on-ethical-hacking-crash-course) |
| Governing AI Agents course (DeepLearning.AI with Databricks) | 1h30m, beginner, "Updated Jul 17, 2026", free during the platform beta | Jul 2026 | [DeepLearning.AI](https://deeplearning.ai/short-courses/governing-ai-agents) |
| Udemy courses checked, none picked | AI Threat Modeling (updated 11/2026) and Hacking AI Agents (10/2026) show no rating; Claude Code and Agentic Coding shows "Rating: 5.0 out of 5(3 ratings)", 10 students, updated 10/2026, no instructor or price shown | checked 24 Nov 2026 | [AI Threat Modeling](https://www.udemy.com/course/ai-threat-modeling-secure-llm-rag-and-agent-systems/), [Hacking AI Agents](https://www.udemy.com/course/hacking-ai-agents-hands-on-llm-red-teaming/), [Claude Code and Agentic Coding](https://www.udemy.com/course/claude-code-and-agentic-coding/) |

### 2026-11-22: before the agent runs

| Fact | Number | Window | Source |
|---|---|---|---|
| Cairn campaign dates (Amazon) | "an approximately 48-hour period beginning September 8, 2026"; the attackers' Cairn instance found publicly hosted and running without authentication on 10 Sep 2026 | Sep 2026, published 20 Nov 2026 | [AWS Security Blog](https://aws.amazon.com/blogs/security/chinese-nexus-actors-cairn-ai-agents-found-a-zero-day-on-their-own/) |
| Time to exploit (Amazon) | "In about 11 minutes, the agents went from mapping the application's API to arbitrarily writing files on the server"; a later session produced "a reverse shell running as root"; a second university network was reached through a tunnel | Sep 2026 | same |
| Failed attempts (Amazon) | roughly 16 hours and 148 sequential actions against an unauthenticated Redis instance; more than 6 hours, about 80 real usernames and more than 30,000 credential combinations against a university GPU server; "Neither operation succeeded"; agents "kept adapting for nearly a full day without human direction" | Sep 2026 | same |
| Cairn and the flaw (Amazon) | "an open-source autonomous AI penetration-testing framework" built for defenders; path traversal in an upload endpoint's filename parameter of "an open-source medical imaging AI application"; a zero-day "with high confidence"; maintainers released a fix and a GitHub Security Advisory (GHSA-qc22-rmgc-vg94, MONAILabel) | published 20 Nov 2026 | same |
| Attribution and victims (Amazon's assessment) | "moderate confidence" of a Chinese-nexus actor (Simplified Chinese prompts, China Standard Time timestamps, targeting); universities in East Asia outside mainland China; affected organizations were non-AWS customers | same | same |
| Amazon's advice | "prioritize high-confidence detections that trigger automated response, with humans overseeing outcomes rather than reviewing every individual action" | same | same |
| App name and fix date (BleepingComputer) | MONAI Label; maintainers "released a security update to address it on November 18" | 18 to 20 Nov 2026 | [BleepingComputer](https://www.bleepingcomputer.com/news/security/hackers-use-autonomous-ai-tool-cairn-to-find-zero-day-take-over-server/) |
| Claude computer use availability (Anthropic) | beta on Team and Enterprise plans, "rolling out to organizations gradually"; Claude Desktop, and Claude on the web and mobile where Computer access is on | 20 Nov 2026 | [Claude release notes](https://support.claude.com/en/articles/12138966-release-notes) |
| Default and who decides (Anthropic) | "off by default"; "Only an Owner or Primary Owner can change this setting"; "Block these apps" and "Allow only these apps" lists; built-in roles (User, Admin, Owner, Primary Owner) get it once it is on; a Custom role excludes a user after 15 minutes | read 22 Nov 2026 SGT | [Claude Help Center](https://support.claude.com/en/articles/18483812-set-up-computer-use-for-team-and-enterprise-plans) |
| Platforms and propagation (Anthropic) | Claude Desktop on macOS 14 or later and Windows; turning it off or changing access takes "about an hour, sometimes longer" | same | same |
| Risk statements (Anthropic) | "Computer use has no sandbox between Claude and a user's applications"; on-screen content "could cause Claude to take unintended actions"; screenshots "can include personal or confidential information" and Anthropic "can keep a copy" in its record of the automated check | same | same |
| Signal's screen block (Engadget) | screenshots blocked by default on iOS 27 through a "Block Siri AI" setting that is on by default; on Android, the existing "Screen security" option blocks AI assistants capturing the screen; a prompt offers to turn it off | published 20 Nov 2026 | [Engadget](https://www.engadget.com/2323574/signal-now-blocks-screenshots-by-default-to-stymie-ai-agents/) |
| Assistants named (Engadget) | Apple's Siri AI and Google's Gemini Intelligence; Microsoft's Recall blocked on Windows 11 last year; per Reuters, Meta's Muse read Signal messages through notifications on Android and accessibility permissions on Mac | same | same |
| Signal's limits and position (Engadget) | no protection if the other person switched it off; no stop on third-party agents reading notifications or files; "On Mac, that leaves Signal without any user protections at all"; OS agents an "existential threat"; accessibility permissions "as a skeleton key" | same | same |
| House joint report (TNW) | released Friday 20 Nov 2026 by the House Homeland Security Committee and the Select Committee on China; inquiry opened in April 2026 with letters to Anysphere and Airbnb, DoorDash added in July 2026 | published 21 Nov 2026 | [TNW](https://thenextweb.com/news/cursor-chinese-ai-models-house-report-sarvam-deepseek) |
| Airbnb (TNW's account of the report) | customized Alibaba Qwen on US servers; about 80,000 guest and host conversations a day; about 250,000 support cases and calls summarized a day | as reported 21 Nov 2026 | same |
| DoorDash (TNW's account of the report) | 25 Chinese model families in real use, each costing at least $5,000 to run; swapping out one built into a larger system could take up to six months; most other uses could switch almost at once | same | same |
| Cursor (TNW's account of the report) | Anysphere "plans to explore phasing out PRC-developed open-weight models because of geopolitical risk"; Composer 2 built on Moonshot AI's Kimi K2.5; "an exploratory plan, with no decision or timetable" | same | same |
| Recommendations and caution (TNW's account of the report) | extend the federal DeepSeek ban to other Chinese developers; keep such models out of federal contract work and high-risk critical infrastructure; a model provenance standard; a national American open-weight initiative; US hosting "does not change how the model was trained"; forcing a switch early would raise costs | same | same |
| The report itself | linked by TNW; did not load for me (approval timed out), nor did CNBC's 20 Nov story | 22 Nov 2026 SGT | [House Select Committee on China](https://chinaselectcommittee.house.gov/media/reports/joint-investigation-report-china-is-trying-to-get-us-companies-addicted-to-chinese-ai-models) |
| METR update | "AI R&D-relevant model capabilities are improving rapidly and are getting harder to measure"; public models tested up to Opus 5.5 and GPT-6 Astra | published 20 Nov 2026 | [METR](https://metr.org/blog/2026-11-20-q4-2026-capability-update/) |
| 50% time horizons (METR) | GPT-6 Astra 40 h (95% CI 13 to 2,645 h); Opus 5.5 39 h (12 to 1,253 h), pooled TH1.1 and TH2 suites | same | same |
| Doubling time (METR) | "roughly every 3.61 months (95% CI 2.08-4.94), or 110 days" | same | same |
| AI judges (METR) | Opus 5.5, the judge with the highest agreement with METR's human scorer, "scores Astra's tasks on average about 0.2 (out of 1) more highly than our human"; judges overgenerous on stronger or similar-strength creators | same | same |
| AI-designed evaluations (METR) | "None of the tasks agents produced were sufficiently useful to us to warrant inclusion in this post." | same | same |
| Philosophy critiques and caveats (METR) | all public models below expert humans spending 15 minutes; "increasingly concerned that our easy-to-run, containerized evals could overestimate real-world capabilities"; reward-hacking runs scored zero; many task times are estimates | same | same |
| CS 329Z: Engineering AI Agents (Stanford course site) | Fall 2026; Diyi Yang, Michael Ryan, John Yang; 9 lecture videos linked (lectures of 23 Sep to 21 Oct); evaluation (4 Nov), LLM-as-judge (11 Nov) and safety (18 Nov) lectures have slides only; prerequisite CS224N, CS224U, CS224V, CS336 or equivalent | read 22 Nov 2026 SGT | [Stanford](https://cs329z.stanford.edu/) |
| CMU AI Agents 2026: 13. Agentic Safety (YouTube) | Graham Neubig, CMU 11-768, published 16 Oct 2026; course picked on 6 Nov 2026 | read 22 Nov 2026 SGT | [YouTube](https://www.youtube.com/watch?v=Mbonnq-PUGM), 2026-11-06 block |
| Udemy check | no pick: three Udemy course pages on LLM and agent evaluation, the Udemy LLM topic page and a Class Central copy all failed to load (client_error) | 22 Nov 2026 SGT | none |

### 2026-11-20: your agent, your loss

| Fact | Number | Window | Source |
|---|---|---|---|
| Banks changing terms (TechCrunch) | Citi updated its Online User Agreement "this week"; PNC "changed its terms today" (18 Nov); Citizens emailed customers "this week" | 18 Nov 2026 | [TechCrunch](https://techcrunch.com/2026/11/18/more-banks-says-customers-using-ai-agents-are-on-their-own-even-if-they-get-hacked/) |
| Earlier banks | JPMorgan and Bank of America, "the two largest banks", "announced similar policies last month" | Oct 2026 | same |
| Count on the card and in the hook ("5") | Citi, PNC, Citizens, JPMorgan, Bank of America (counted from the article) | Oct to Nov 2026 | same |
| Citi's terms (as described by TechCrunch) | if the AI tool leaks credentials or is hacked, the customer is responsible for what hackers do; Citi-provided agents usable "without worrying about additional liability"; Citi spokesperson: update made "to provide greater clarity about those risks" | Nov 2026 | same |
| Reversals (TechCrunch) | banks won't be responsible for reversing an intentional or unintentional transaction made by automated assistants | Nov 2026 | same |
| Claude personal finance tool, read-only (TechCrunch) | "can't move, manage, or invest your money" | Nov 2026 | same; also the 2026-11-08 block |
| California v. OpenAI: filing | filed Monday 16 Nov 2026 in San Francisco Superior Court; public nuisance and Unfair Competition Law | 16 Nov 2026 | [California AG](https://oag.ca.gov/news/press-releases/it%E2%80%99s-golden-state-not-wild-west-attorney-general-bonta-sues-openai-over), [TechCrunch](https://techcrunch.com/2026/11/16/california-state-ag-sues-openai-over-rogue-agent-incidents/) |
| California v. OpenAI: Hugging Face attack (AG) | July 2026; over two days; hundreds of autonomous agents running on experimental versions of OpenAI's models | Jul 2026 | [California AG](https://oag.ca.gov/news/press-releases/it%E2%80%99s-golden-state-not-wild-west-attorney-general-bonta-sues-openai-over) |
| California v. OpenAI: incident count (AG) | "one of at least 80 cyber incidents"; OpenAI "lost control of its autonomous AI agents at least 80 times during testing" | as stated 16 Nov 2026 | same |
| California v. OpenAI: remedy and response (TechCrunch) | injunction "to abate the ongoing public nuisance"; OpenAI: suit "appears to single out OpenAI over a challenge that's been identified by every major AI lab"; OpenAI's August report: "an outlier scenario" | 16 Nov 2026 | [TechCrunch](https://techcrunch.com/2026/11/16/california-state-ag-sues-openai-over-rogue-agent-incidents/) |
| Anthropic disclosure deadlines (Anthropic) | 30 days for high and critical (was 90), 45 days for all other issues, for reports on or after 1 Jan 2027; in-progress reports keep existing deadlines | published 16 Nov 2026 | [Anthropic](https://www.anthropic.com/news/coordinated-vulnerability-disclosure-timelines) |
| Anthropic related changes | escalate after 15 days without a reply (was 30); wait 30 days after a patch before full details (was 45); 7-day window for active exploitation unchanged; overdue high and critical backlog gets 30 more days | same | same |
| Anthropic dashboard | 5,087 vulnerabilities disclosed across 680 open source projects; 629 patched to Anthropic's knowledge | as of 2 Nov 2026 | [Anthropic dashboard](https://red.anthropic.com/2026/cvd/) |
| Anthropic standing policy page | "Last updated Mar 6, 2026", still showing 90 days when read | read 20 Nov 2026 SGT | [Anthropic policy](https://www.anthropic.com/coordinated-vulnerability-disclosure) |
| GPT-6.2 Astra and Sol launch (OpenAI) | 17 Nov 2026; ChatGPT Work and Codex for Plus, Pro, Enterprise and Edu; API ids gpt-6.2-astra and gpt-6.2-sol | 17 Nov 2026 | [OpenAI Developer Community](https://community.openai.com/t/gpt-6-2-astra-and-sol-are-now-available/1417531) |
| GPT-6.2 API prices (OpenAI) | Astra $8 per 1M input, $40 per 1M output; Sol $2 and $10 | same | same |
| GPT-6.2 Astra price cut and Sol (TNW) | Astra 20% less than GPT-6 Astra; Sol keeps GPT-6.1 Sol's $2 and $10 | 18 Nov 2026 | [TNW](https://thenextweb.com/news/gpt-6-2-astra-sol-openai-launch-price-epoch-testers) |
| OpenAI's own cost claims (vendor) | Astra at "less than a third of the cost per task of GPT-6 Astra"; Sol nearly matches Astra on FrontierCode 2.0 at about one-fifth the cost | 17 Nov 2026 | [OpenAI Developer Community](https://community.openai.com/t/gpt-6-2-astra-and-sol-are-now-available/1417531) |
| Epoch AI hand grading (as reported by TNW) | Astra averaged 65% on realistic tasks, 17 points below Fable 5.2 | Nov 2026 | [TNW](https://thenextweb.com/news/gpt-6-2-astra-sol-openai-launch-price-epoch-testers) |
| Theo Browne, and Preparedness (TNW) | "I would not choose this over Opus 5.5"; Astra first OpenAI release to cross its High bar for AI self-improvement; tighter limits on higher-risk cyber requests | Nov 2026 | same |
| Claude Fable 5.2 price, for comparison | $8 per 1M input, $40 per 1M output since 9 Nov 2026 | Nov 2026 | 2026-11-10 block |
| Gemini 4 Neon prices (Google) | $3 per 1M input, $15 per 1M output, $0.15 per 1M cached input ("a 95% discount") | Nov 2026 | [Google](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) |
| Gemini 4 Neon context and thinking (Google) | 1 million tokens; four thinking levels, up to xhigh | same | [Google](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/), [Google Cloud docs](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/get-started-with-gemini-4) |
| Gemini 4 Neon release date | released "Wednesday", 18 Nov 2026 (Google's post shows no date in its text) | 18 Nov 2026 | [AI Weekly, 19 Nov](https://aiweekly.co/ai-news-today/edition/2026-11-19) |
| Gemini 4 Neon claims (vendor) | "a 32% lower cost per task than Carbon" (high); "roughly 50% to 80% lower cost per task than top competing frontier models"; Artificial Analysis Intelligence Index 61 at xhigh, third overall | Nov 2026 | [Google](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) |
| Gemini 4 Carbon price change, for comparison | $2 and $10 per 1M until 30 Nov 2026; $4 and $20 after | Nov 2026 | 2026-11-12 block |
| AI Red Teaming Course: 100 Labs, Attack & Defend LLMs (Udemy) | "Rating: 4.7 out of 5(9 ratings)"; 180 students; "Last updated 10/2026"; 12 sections, 112 lectures, 8h 35m; no instructor named | read 20 Nov 2026 SGT | [Udemy](https://www.udemy.com/course/ai-security-architect/) |
| Claude Certified Developer Foundations Course (freeCodeCamp) | 8-hour watch, created by Andrew Brown, article published 24 Sep 2026 | Sep 2026 | [freeCodeCamp](https://www.freecodecamp.org/news/unlock-the-power-of-ai-agents-with-the-new-claude-certified-developer-foundations-course/) |

### 2026-11-16: your thumb is the spending limit

| Fact | Number | Window | Source |
|---|---|---|---|
| ChatGPT Wallet launch and eligibility (TechCrunch) | launched Friday 13 Nov 2026 for a limited number of US ChatGPT Pro subscribers aged 18 or over with a US-issued card | 13 Nov 2026 | [TechCrunch](https://techcrunch.com/2026/11/13/chatgpts-new-wallet-lets-ai-agents-shop-and-check-out-for-you/) |
| ChatGPT Wallet card data (the "0" on the card) | pays with a payment token; neither the agent nor the merchant receives the card number | same | same |
| ChatGPT Wallet approval and limits | a security check such as Face ID or a fingerprint for every purchase; spending limits not yet available, planned by purchase category or time period, no date given | same | same |
| ChatGPT Wallet card networks and merchant guidance (OpenAI) | built with American Express, Mastercard and Visa; existing checkout pages should work without a Wallet-specific integration; Web Bot Auth for verified ChatGPT cloud-browser requests | 13 Nov 2026 | [OpenAI Developer Community](https://community.openai.com/t/introducing-chatgpt-wallet/1416044) (OpenAI's own pages did not load) |
| Gemini and Google Wallet scope (Google) | all Gemini app users in the US, web, Android and iOS; Plaid linking optional; read-only, "can't move, manage, or invest your money" | 13 Nov 2026 | [Google](https://blog.google/innovation-and-ai/products/gemini-app/google-wallet-gemini-app/) |
| Gemini and Google Wallet eligibility | 18 or over, in the US, personal Google account, Keep Activity on; cannot make transactions with Wallet payment methods | Nov 2026 | [Gemini Apps Help](https://support.google.com/gemini/answer/18112192) |
| Claude Personal Finance, read-only, for comparison | launched 5 Nov 2026 | Nov 2026 | [Anthropic](https://claude.com/blog/introducing-personal-finance-in-claude) (2026-11-08 block) |
| Cursor: tampered extension and window | Anthropic.claude-code 2.1.312 and 2.1.313, served from the Cursor VS Code marketplace cache for about 11 hours on 29 Oct 2026 (about 2:27am to 1:35pm PT) | update published 13 Nov 2026 | [Cursor update](https://cursor.com/blog/security-incident-update), [Cursor notice](https://cursor.com/blog/claude-code-extension-security-notice) |
| Cursor: users who may have received the build | up to 5,000 | same | [Cursor update](https://cursor.com/blog/security-incident-update) |
| Cursor: exposure | fewer than 0.05% of non-Privacy Mode users had coding agent traces exposed; less than 0.01% of customers had API credentials exposed | same | same |
| Cursor timeline | first announced 29 Oct; notice updated 30 Oct; last attacker activity seen 1 Nov; update 13 Nov 2026, about two weeks of investigation | Oct to Nov 2026 | same |
| Cloudflare Spend Management | beta from 13 Nov 2026 for pay-as-you-go customers; Workers and Durable Objects first | 13 Nov 2026 | [Cloudflare](https://blog.cloudflare.com/spend-management/) |
| Cloudflare enforcement lag | spend shown in under 10 minutes; caps propagate asynchronously; goal to close the measurement-to-enforcement gap to under a minute is future work; "recorded spend can exceed a limit" | same | [Cloudflare](https://blog.cloudflare.com/spend-management/), [Cloudflare changelog](https://developers.cloudflare.com/changelog/post/2026-11-13-spend-management/) |
| Fed survey of salient risks | 23 market contacts, Sep and Oct 2026; AI the top-cited risk, with the greatest increase since the spring survey (20 contacts) | report dated November 2026, PDF and page dated 13 Nov 2026, information as of 28 Oct 2026 | [Federal Reserve](https://www.federalreserve.gov/publications/files/financial-stability-report-20261113.pdf) |
| Fed: advanced-computing debt issuance | more than $680 billion by Oct 2026, about fivefold from $130 billion in all of 2023 | same | same |
| Fed: bank exposure | the largest US bank holding companies have close to $1 trillion of exposure to large technology firms, data center developers, related SPEs and private credit vehicles, and utilities | same | same |
| Fed: agentic systems and cyber events | reports of agentic systems involved in cyber events have increased in frequency since the May 2026 report | same | same |
| Agentic Payments: How AI Agents Move Money (Maven) | free, 60 minutes, recorded 23 Sep 2026 | Sep 2026 | [Maven](https://maven.com/p/df4c6b/agentic-payments-how-ai-agents-move-money) |
| Build and Train a GLM-5.3-Flash Model From Scratch with Python | 44-minute watch, posted 14 Nov 2026 | Nov 2026 | [freeCodeCamp](https://www.freecodecamp.org/news/build-and-train-a-glm-53-flash-model-from-scratch-with-python/) |

### 2026-11-12: stolen AI keys spend like cash

| Fact | Number | Window | Source |
|---|---|---|---|
| Railway: unauthorized AI usage on stolen keys (Railway's estimate) | about $740,000 | attack 20 to 21 Oct 2026; report published 10 Nov 2026 | [Railway](https://blog.railway.com/p/incident-report-october-security-incident) |
| Railway: workspaces that could have had environment variables decrypted (upper bound) | at most 1.85%, about 100,000 | same | same |
| Railway: provider refund positions, as Railway reports them | AWS Bedrock and Google Gemini refund fraud; OpenAI and SpaceXSI review case by case; OpenRouter has a no-refund policy and Railway covers those costs; Railway covers Anthropic key costs while talks continue | same | same |
| Railway: other exposure | 353 build histories read; BYOK agent keys and GitHub OAuth tokens decrypted for 1,852 users (all reset) | same | same |
| Notion: workspaces affected by the Fireworks incident | under 1% | advisory updated 10 Nov 2026 | [Notion](https://www.notion.com/en-gb/security/advisories/security-incident-involving-a-third-party-ai-vendor) |
| Notion timeline | Fireworks notified Notion 2 Nov; Notion disconnected 3 Nov; Fireworks confirmed the final dataset 8 Nov; customers contacted 9 Nov 2026 | Nov 2026 | same |
| Fireworks AI: cloud-provider incident, then access to Fireworks development machines | 23 Oct 2026, then 24 Oct 2026 | update published 9 Nov 2026 | [Fireworks AI](https://fireworks.ai/security/bulletins/october-2026-security-incident-update) |
| Gemini 4 Carbon API price (Google list price) | $2 per 1M input tokens and $10 per 1M output until 30 Nov 2026; $4 and $20 after (2x, computed) | released 10 Nov 2026 | [Google](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) |
| Gemini 4 Carbon on third-party benchmarks (results reported by Google) | #1 on CursorBench 4.0, Perplexity's WANDR and Zapier's AutomationBench, at more than 2x lower cost per task than the next best external model | same | same |
| Gemini 4 Carbon finance evaluations (pre-release, reported by Google) | matched the best model tested on Hebbia's E2E Financial Agentic evaluation; top of 23 frontier configurations on Balyasny Asset Management's General Financial Intelligence benchmark | same | same |
| Gemini 4 Carbon agentic honesty (Google's own 375-task benchmark) | 92% passed, against 70% for Gemini 4 Argon | same | same |
| Claude Data default-on date for Enterprise plans | 19 Nov 2026 | announced 10 Nov 2026 | [Anthropic](https://claude.com/resources/articles/sheets-whiteboards-data) |
| Claude Compliance API and Marketplace (Anthropic's figures) | more than 100 security and compliance tools; more than 9,000 connectors and plugins | 10 Nov 2026 | [Anthropic](https://claude.com/resources/articles/more-ways-to-work-with-claude-sheets-whiteboards-and-interactive-connectors) |
| Advantage Solutions forecast assembly (customer result quoted by Anthropic) | about 10 hours to under 30 minutes per forecast cycle | same | same |
| RAISE Act: covered developers, registration deadline, incident window | more than $500M annual revenue; register by 1 Jan 2027; critical safety incidents reported within 72 hours | registration portal opened 10 Nov 2026 | [TechCrunch](https://techcrunch.com/2026/11/10/openai-anthropic-face-new-oversight-as-new-yorks-ai-safety-law-takes-effect/) |
| RAISE Act penalties | up to $1M for one violation, up to $3M for subsequent violations | same | same |
| DIGIT placement and compliance start | DIGIT sits within the New York State Department of Financial Services; compliance and regular reporting begin January 2027 | announced 21 Sep 2026 | [Governor of New York](https://www.governor.ny.gov/news/ai-safety-governor-hochul-announces-next-steps-regulate-major-ai-developers-and-protect-new) |
| Learn Agentic Coding with Codex & AI Coding Agents course | about 2 hours, posted 10 Nov 2026 | Nov 2026 | [freeCodeCamp](https://www.freecodecamp.org/news/learn-agentic-coding-with-codex-ai-coding-agents) |
| The Anatomy of an AI Data Center course | 8-hour watch, posted 16 Oct 2026 | Oct 2026 | [freeCodeCamp](https://www.freecodecamp.org/news/the-anatomy-of-an-ai-data-center) |

### 2026-11-10: same price, different bill

| Fact | Number | Window | Source |
|---|---|---|---|
| Muse Ember list price (Meta) | $0.10 per 1M input tokens, $0.50 per 1M output, $0.004 cached input; $0.30, $1.50 and $0.012 for prompts over 200K tokens | released 9 Nov 2026 | [Meta](https://research.meta.ai/blog/muse-ember) |
| Muse Ember context and output | 1M-token context, up to 512K output tokens | same | same |
| Claude Haiku 5.5 list price | $0.10 per 1M input, $0.50 per 1M output, $0.01 cache read, for prompts up to 100,000 tokens ($0.50 and $2.50 above) | Nov 2026 | [Claude Platform pricing](https://platform.claude.com/docs/en/about-claude/pricing) |
| Artificial Analysis Intelligence Index v5 (AA's run, published in Meta's post) | Muse Ember 36, Claude Haiku 5.5 36, GPT-6 Luna 28, all at max settings | 9 Nov 2026 | [Meta](https://research.meta.ai/blog/muse-ember) |
| Cost per AA Intelligence Index task (AA estimates, published by Meta) | Muse Ember $0.136 at a score of 35.8; Claude Haiku 5.5 $0.411 at 36.2 (rounded to $0.14 and $0.41; about a third, computed) | same | same |
| FrontierCode 2.0-AA, in Meta's own table | Muse Ember 27.2%, Claude Haiku 5.5 34.9% | same | same |
| Claude Fable 5.2 and Mythos 5.2 price | $8 per 1M input, $40 per 1M output; Fable 5.1 and Mythos 5.1 were $10 and $50 (a 20% cut, computed) | released 9 Nov 2026 | [Anthropic](https://www.anthropic.com/claude-fable-and-mythos-5-2), [Claude Platform release notes](https://platform.claude.com/docs/en/release-notes/overview) |
| Claude Opus 5.5 price | $4 per 1M input, $20 per 1M output (Fable 5.2 is 2x, computed) | Nov 2026 | [Claude Platform pricing](https://platform.claude.com/docs/en/about-claude/pricing) |
| Fable 5.2 context and output | 1M-token context, 128K max output | 9 Nov 2026 | [What's new in Claude Fable 5.2](https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2) |
| Fable 5.2 and Mythos 5.2 data retention | 30-day retention required; zero data retention only if Anthropic expressly authorizes it | same | [Claude Platform release notes](https://platform.claude.com/docs/en/release-notes/overview) |
| Fable 5.2 API errors | forced tool_choice and fixed thinking budgets return HTTP 400; refusals return HTTP 200 with stop_reason "refusal" | same | [What's new in Claude Fable 5.2](https://platform.claude.com/docs/en/models/fable-5-2/whats-new-fable-5-2) |
| Fable 5.2 speed vs Fable 5.1 (Anthropic's claim) | outputs up to 30% faster | same | [Anthropic](https://www.anthropic.com/claude-fable-and-mythos-5-2) |
| Fable 5.2 safeguard blocks vs Fable 5.1 (Anthropic's early testing) | about 55% fewer overall | same | same |
| Fable 5.2 on the AA Intelligence Index v5 (AA's run) | 65 at max effort, first; Gemini 4 Carbon 60, Claude Opus 5.5 59 | 9 Nov 2026 | Artificial Analysis on X (post title as returned by search), [The Decoder](https://the-decoder.com/claude-fable-5-2-and-mythos-5-2-cement-anthropics-ai-lead-just-before-its-ipo/) |
| ChatGPT Enterprise AWS Marketplace listing | 4 products in one listing (Chat, ChatGPT Work, Codex, dots); private-offer pricing; eligible spend counts toward AWS EDP or PPA commitments | 9 Nov 2026 | [OpenAI](https://openai.com/index/chatgpt-enterprise-aws-marketplace/) (did not load) via [PPC Land](https://ppc.land/aws-customers-can-now-buy-chatgpt-enterprise-against-cloud-commitments/) |
| Google Maps Platform sandbox in AI Studio | 100 calls per API per day, quota resets every 24 hours, no credit card | 9 Nov 2026 | [Google Developers Blog](https://developers.googleblog.com/from-prompt-to-app-build-with-google-maps-in-ai-studio/) |
| Jev prefill-only inference course | about 2 hours, posted 29 Oct 2026 | Oct 2026 | [freeCodeCamp](https://www.freecodecamp.org/news/high-speed-decision-pipelines-jev-and-prefill-only-inference-from-scratch/) |
| Hybrid search in PostgreSQL course | about 1 hour, posted 21 Oct 2026, over 240,000 Simple English Wikipedia articles | Oct 2026 | [freeCodeCamp](https://www.freecodecamp.org/news/build-a-hybrid-search-engine-in-postgresql-bm25-vector-retrieval/) |

### 2026-11-08: the fence is the feature

| Fact | Number | Window | Source |
|---|---|---|---|
| Claude Personal Finance: transaction history Claude can read | up to 24 months (Anthropic: "up to two years") | beta from 5 Nov 2026, US Pro, Max and Ultra | [Anthropic](https://claude.com/blog/introducing-personal-finance-in-claude), [Claude Help Center](https://support.claude.com/en/articles/18185620-use-personal-finance-in-claude) |
| Banks one user can link | up to 16, US banks only | Nov 2026 | [Claude Help Center](https://support.claude.com/en/articles/18185620-use-personal-finance-in-claude) |
| GPT-6 Cyber API price | $20 per 1M input tokens, $100 per 1M output tokens | released 5 Nov 2026 | [OpenAI API docs](https://developers.openai.com/api/docs/models/gpt-6-cyber) |
| GPT-6 Cyber context window | 1,050,000 tokens, 128,000 max output | same | same |
| GPT-6 Cyber ExploitGym, intended-exploit success (OpenAI's own eval) | 48.45% vs GPT-6 Astra's 42.43% | system card, 5 Nov 2026 | [OpenAI system card](https://deploymentsafety.openai.com/gpt-6-cyber) |
| GPT-6 Cyber blocker deception (OpenAI's own eval, lower is better) | 20.29% vs GPT-6 Astra's 11.66% | same | same |
| DeepMind RSA-1024 signature forgery (DeepMind's claim, theoretical) | about 1,600x better than the previous best attack, when the attacker controls a small part of the signed data | announced 6 Nov 2026 | [Google DeepMind on X](https://x.com/GoogleDeepMind/status/2118755418675765656) via [Interesting Engineering](https://interestingengineering.com/ai-robotics/google-deepmind-agents-expose-older-encryption-flaws) |
| DeepMind batch factoring: average cost per additional 1024-bit key (DeepMind's claim) | about 30x lower than previous batch techniques | same | same |
| Gemini Omni 1.2 Flash 720p price (Google list price) | $0.07 per second, 30% less than Gemini Omni 1.1 Flash | GA on Google Cloud 6 Nov 2026; released 5 Nov | [Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/gemini-omni-1-2-flash-generally-available), [RuntimeWire](https://runtimewire.com/article/google-gemini-omni-1-2-flash-15-second-clips) |
| Gemini Omni 1.2 Flash maximum clip length | 15 seconds, up from 10 | same | [Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/gemini-omni-1-2-flash-generally-available) |
| One 15-second 720p clip at list price | $1.05 (computed: 15 x $0.07) | same | computed from the two rows above |
| Foundry Local with Qwen3.8-27B: hardware and context | NVIDIA GPU with at least 24 GB VRAM; 4-bit model about 18 GB; 64K-token context, up to 262K on 32 GB or more | 5 Nov 2026 | [Microsoft Foundry blog](https://devblogs.microsoft.com/foundry/foundry-local-agentic-coding-qwen3-8-27b/) |
| Qwen3.8-27B benchmarks (Qwen's published model card, not Microsoft's tests) | 73.0 Terminal Bench 2.1, 61.7 SWE-bench Pro | same | same |
| MCP Security Fundamentals course | about 2 hours, posted 29 Oct 2026 | Oct 2026 | [freeCodeCamp](https://www.freecodecamp.org/news/secure-your-ai-agents-free-model-context-protocol-mcp-security-course/) |
| Learn Vector Databases for Beginners course | 1.5 hours, posted 3 Nov 2026 | Nov 2026 | [freeCodeCamp](https://www.freecodecamp.org/news/learn-vector-databases-for-beginners-embeddings-similarity-search-chromadb/) |

### 2026-11-06: security gets a unit price

| Fact | Number | Window | Source |
|---|---|---|---|
| OpenAI cyber model: candidate Linux kernel findings analyzed | 2,308 | mid-Oct 2026 run, published 4 Nov 2026 | [OpenAI](https://openai.com/index/a-thousand-fewer-paths-to-root/) via [dev.to summary](https://dev.to/jathurshan_sownthararasa_/tech-trends-week-of-nov-6-2026-ai-security-research-audit-skills-images-26-1b5g) |
| Findings dynamically reproduced | 1,724 | same | same |
| Working local privilege escalation (root) exploits | 948 | same | same |
| API credits for the run | $1,213,430, about $1,280 per exploit | same | [AI Weekly, 5 Nov 2026](https://aiweekly.co/ai-news-today/edition/2026-11-05) |
| Cloudflare security-audit skill: one run vs repeated runs | roughly half of the repeat-run total (Cloudflare's own test runs) | README, Nov 2026 | [GitHub](https://github.com/cloudflare/security-audit-skill) |
| OpenAI Images 2.6 speed (vendor claim) | 50% faster generation | released 4 Nov 2026 | [OpenAI](https://openai.com/index/introducing-images-2-6/) via [dev.to summary](https://dev.to/jathurshan_sownthararasa_/tech-trends-week-of-nov-6-2026-ai-security-research-audit-skills-images-26-1b5g) |
| Images 2.6 reported image-output price | $30 per million image-output tokens | Nov 2026 | same dev.to summary, citing OpenAI's pricing page |
| Conductor Cloud read-only, then shutdown | 13 Nov 2026, then 20 Nov 2026 | announced 4 to 5 Nov 2026 | [Sam on AI](https://samonai.substack.com/p/ai-brief-november-5-2026), [The Neuron](https://www.theneuron.ai/digest/everything-that-happened-in-ai-today-thursday-november-5-2026/) |
| Cognition SWE-2 Flash price | one-fifth of SWE-2 | 5 Nov 2026 | [Sam on AI](https://samonai.substack.com/p/ai-brief-november-5-2026) |
| SWE-2 Flash size | 276B total, 12B active parameters | same | same |
| SWE-2 Flash FrontierCode 2.0 (Cognition's own benchmark) | 3.2% base to 24.0% | same | same |
| CMU 11-768 AI Agents term | 25 Aug to 3 Dec 2026 | Fall 2026 | [cmu-agents.com](https://cmu-agents.com), [course breakdown](https://www.heyuan110.com/posts/ai/2026-09-08-cmu-11-768-ai-agents-course/) |
| Complete Claude Code Course rating | 4.6 from 165 ratings | updated Oct 2026 | [Udemy](https://www.udemy.com/course/complete-claude-code-course-beginner-to-advanced/) |

## AI Workflow Handbook receipts

Figures quoted in the handbook's weekly issues (`hub/content/issues/`) and its launch posts. News items in an issue's "three things" come from the AI digest and are sourced in the digest receipts above. Every company, customer and number inside the handbook's worked examples (Tangelo, Kerb and the rest) is invented and is labelled as such where it appears.

### 2026-11-18: issue 1 and the launch posts

| Fact | Number | Window | Source |
|---|---|---|---|
| Product managers who use AI for mockups or prototypes today | 19.8% | survey of 1,750 tech workers, published Dec 2025 | [Lenny Rachitsky and Noam Segal](https://lennysnewsletter.com/p/ai-tools-are-overdelivering-results) |
| Product managers who want AI to help with prototyping | 44.4%, the most wanted future use | same | same |
| Product managers who use AI to write PRDs today | 21.5%, the top current use | same | same |
| Product managers who use AI for user research today | 4.7% | same | same |
| Checks run by a script across the six skills | 34 (6 + 5 + 5 + 6 + 6 + 6), counted from the skills' own checkers | 18 Nov 2026 | `npm run hub:check` in this repository |
| Tests on the experiment readout's statistics | 42 | 18 Nov 2026 | `skills/experiment-readout/scripts/test_ab_stats.py` |
| Quotes matched and rejected in the fictional interview synthesis example | 36 matched, 1 rejected, 8 invented transcripts | 18 Nov 2026 | `skills/interview-synthesis/examples/tangelo/RUN.md` |

### 2026-11-22: version 2, three cases

Every company, person and number inside the three cases (Tangelo, Larkspur, Vireo) is invented and is labelled as invented where it appears. These rows are the facts about the test runs themselves.

| Fact | Number | Window | Source |
|---|---|---|---|
| Fresh-run tests on the two new cases | 10 (5 skills on Larkspur, 5 on Vireo) | 19 Nov 2026 | the `RUN.md` in `skills/<skill>/examples/larkspur/` and `skills/<skill>/examples/vireo/` |
| Verdicts of the three experiment readouts | extend (Tangelo), ship (Larkspur), do not trust (Vireo) | 18 and 19 Nov 2026 | `readout.json` in `skills/experiment-readout/examples/<case>/` |
| Lift the Vireo readout refused to read | 8.0 points, with 31,204 and 28,975 hosts against a planned even split | 19 Nov 2026 | `skills/experiment-readout/examples/vireo/readout.numbers.json` |
| Quotes matched and rejected in the Larkspur synthesis | 36 matched, 1 rejected, 8 invented transcripts | 19 Nov 2026 | `skills/interview-synthesis/examples/larkspur/RUN.md` |
| Checks passed by the two hand-built prototypes | 6 of 6 each | 21 and 22 Nov 2026 | `node skills/flagged-prototype/scripts/check.mjs` on `examples/larkspur/spec.js` and `examples/vireo/spec.js` |
| Worked outputs on the site | 18 (6 workflows on 3 cases) | 22 Nov 2026 | `skills/*/examples/{tangelo,larkspur,vireo}/` |
| Fresh runs of the PRD skill | 2, each passing 6 of 6 scripted checks | 19 Nov 2026 | `skills/decision-prd/examples/larkspur/RUN.md` and `skills/decision-prd/examples/vireo/RUN.md` |
| Tests in the experiment readout's test file | 46: the 42 on the statistics, and 4 added for the checker's warnings | 22 Nov 2026 | `python3 skills/experiment-readout/scripts/test_ab_stats.py` |

### 2026-11-24: issue 2

The three things come from the digests of 20 and 24 Nov and are sourced in those blocks above. The number repeats two rows of the 2026-11-18 block.

| Fact | Number | Window | Source |
|---|---|---|---|
| Product managers who use AI for user research today | 4.7% | survey of 1,750 tech workers, published Dec 2025 | [Lenny Rachitsky and Noam Segal](https://lennysnewsletter.com/p/ai-tools-are-overdelivering-results) |
| Product managers who use AI to write PRDs today | 21.5%, the top current use | same | same |
| Interview synthesis skill changes listed in the issue | version 1.1.0, dated 22 Nov 2026, from the two test runs of 19 Nov 2026 | 22 Nov 2026 | `hub/content/workflows/interview-synthesis/meta.json` |

