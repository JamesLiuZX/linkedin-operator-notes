# Idea bank (60+)

Writing ideas. Buildable demos live in [demo-bank.md](./demo-bank.md).

Status key: `[ ]` idea · `[~]` outlined · `[x]` published

Mark published with date when you ship.

---

## Markets as products

- [~] Post-event retention framework (drafted: posts/01; article: articles/02)
- [~] Rewards vs farming tests (drafted: posts/03; article: articles/04)
- [~] Compliance as product input (drafted: posts/05; article: articles/05)
- [~] Three trust surfaces (drafted: posts/08; article: articles/01)
- [ ] What "good market listing" means operationally
- [ ] Resolution rules that prevent disputes
- [~] Why dead markets poison the whole venue (article: articles/06)
- [ ] Sports vs politics vs crypto event markets — different product problems
- [ ] Options / derivatives intuition for event-market PMs
- [ ] Onboarding: KYC friction vs first-trade conversion (principles only)
- [ ] Referral programs that grow traders vs grow farmers
- [ ] Lifecycle messaging around events (pre / live / post)
- [ ] Market ops as a product surface (not just backend)
- [ ] When to sunset a market category
- [ ] Making fees feel fair without a lecture
- [ ] Mobile trading UX: one thing to remove, not add
- [ ] "All markets" pages that create overwhelm
- [ ] How I prioritize roadmap when compliance, growth, and trading disagree
- [ ] What executives misunderstand about prediction market retention
- [ ] Parlay / multi-outcome complexity vs clarity
- [ ] Localization & jurisdiction: product inconsistency users feel
- [ ] Building for power users without alienating first-timers
- [ ] Metrics: vanity spikes vs cohort health
- [ ] Designing notifications that aren't spam after resolve
- [ ] Why order book / matching metaphors confuse mainstream users
- [ ] Tokenized assets adjacent thinking for market PMs
- [ ] The "screenshot economy" problem in markets products
- [ ] Partner markets / listings: quality control checklist
- [ ] What I'd ask in a prediction market PM interview
- [ ] Case pattern: growth win that hurt trust (anonymized)

## AI that ships

- [ ] PM who opens PRs (drafted: posts/02)
- [ ] AI partnership lessons (drafted: posts/04)
- [~] AI trading agent prototype boundaries (drafted: posts/07; article: articles/03)
- [ ] PRDs that include a prototype link by default
- [ ] How I use Cursor day-to-day as a PM (concrete workflow)
- [ ] Claude Code: when it helps vs creates review debt
- [ ] AI for Amplitude/Mixpanel analysis — useful prompts + failure modes
- [ ] Speccing AI features: evals before UI polish
- [ ] Human checkpoints near money
- [ ] Internal AI tools that actually save PM time
- [ ] "AI feature" requests from stakeholders — how I triage
- [ ] Building agents for support / ops vs customer-facing
- [ ] Documentation AI that doesn't hallucinate process
- [ ] What ByteDance taught me about AI product distribution (high-level)
- [ ] Shipping AI inside large orgs: politics > models
- [ ] Prototype → production checklist for LLM features
- [ ] Why demos destroy roadmaps
- [ ] SQL + LLM: useful, dangerous, how I verify
- [ ] AI-assisted A/B test analysis — keep humans on causality
- [ ] Hiring signal: PMs who can read diffs

## Gen media with taste

- [ ] Gen media product lens (drafted: posts/06)
- [ ] SEO + multi-modal gen: what "quality" means to a ranker
- [ ] Human edit loops that scale
- [ ] Brand risk from AI imagery
- [ ] When to use real photography instead
- [ ] Content systems vs one-off generations
- [ ] Evaluating gen video tools as a PM (criteria sheet)
- [ ] UGC vs gen content for trust-heavy products
- [ ] Cost curves: when gen becomes obvious economically
- [ ] Failure gallery: thin content at scale (anonymized patterns)

## Meta / personal brand (use sparingly ≤10%)

- [ ] Why I'm writing operator notes publicly (anti-cringe framing)
- [ ] What I learned founding AskShop.ai that transfers to big-co PM
- [ ] NUS → NOC SV → Stanford coursework → BigCo: what actually transferred
- [ ] How I take product notes weekly (system share)
- [ ] Books/papers on market design worth reading (curation)

---

## Build projects (demo pillar, spec'd)

Ranked by expected value. Each one is a Pillar 1 demo, a Pillar 2 essay, or both.
The filter used: can only James build it, and does it produce a number nobody
else has.

### 1. Resolution risk scanner `[~]` scaffolded: `tools/resolution-risk/`

Score open markets by dispute likelihood, by reading the criteria text rather
than modelling the outcome. Fifteen rules, each a historically dispute-causing
hole (undefined thresholds, no tie clause, revisable data, no null case).

- **Why this one first**: it is the evidence generator for Essay 1, which is
  already committed in PLAN-30-DAYS. The essay needs a frequency table and a
  before/after rewrite; `--evidence` emits both scaffolds.
- **Ships as**: essay (markets) + demo (agents).
- **Next**: point it at live Polymarket / Kalshi, then backtest against onchain
  UMA dispute history for real ground truth. The backtest is the version with
  teeth. A null result is still publishable.

### 2. Cross-venue contract matcher `[ ]`

Same event trades on Polymarket, Kalshi, Betfair, sportsbooks. Prices diverge.
The unsolved part is not the arb, it is deciding whether two listings are the
same contract once you diff the resolution rulebooks. That is an LLM job.

- **Ship the matcher alone first**: paste two markets, get a structured diff and
  a fungibility verdict. Trading layer optional and probably skippable.
- **Compliance**: paper-trade only. Live capital on a competitor venue likely
  trips the personal-trading policy, and the disagreement log is the better
  content anyway.
- **Ships as**: demo (agents) + essay on why venues disagree.

### 3. News-to-price latency instrument `[ ]`

News firehose to LLM tagging affected markets to timestamped price moves.
Output is a finding, not a bot: how many minutes does an event market take to
price a headline, and what share of the move happens before it.

- Zero capital, zero compliance surface, and it answers a question the industry
  currently answers with vibes.
- **Ships as**: essay (markets) with a real chart.

### 4. Agent market simulator `[ ]`

Toy LMSR or CLOB venue, LLM agents trading on asymmetric information sets. Run
reward schemes against it and watch agents find the farming exploits offline.

- Turns the existing "rewards vs farming tests" idea from an opinion into a lab.
- **Ships as**: teardown + essay (markets).

### 5. Farming detector on public onchain data `[ ]`

Wash trading and reward-cycling patterns in public Polymarket data. Graph
analysis plus anomaly detection. Anonymised patterns only.

- **Ships as**: essay (markets). Pairs with #4.

### Also worth a weekend

- **Agentic video pipeline** `[ ]`: script to shotlist to per-shot generation to
  VLM continuity check to ffmpeg assembly. The unsolved part is continuity and
  eval, not the model. Feeds the gen-media pillar. Building a Runway competitor
  is not a weekend project; building the orchestration and eval layer is.
- **Auto-generated market recap videos** `[ ]`: every resolved market gets a
  20-second explainer. Ties gen media to markets, plausible real feature.
- **Computer-use agent as QA for a trading UI** `[ ]`: point it at a testnet
  flow, hunt broken states. Unsexy, immediately useful, strong "PM who opens
  PRs" story.
- **A narrow eval harness** `[ ]`: least glamorous, most transferable.

---

## Capture inbox (dump raw here)

<!-- paste messy thoughts below during the week -->
