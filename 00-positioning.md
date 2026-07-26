# Positioning & voice

## The position

James Liu builds AI agents that touch real markets, and shows the work.

Not an AI content account. Not a PM thought leadership account. The specific
intersection: someone who owns a live prediction market at exchange scale and
can also ship an agent against it over a weekend, on camera.

The moat is that the two audiences cannot cross into each other.
The AI workflow crowd has no access to order books, resolution disputes, or
regulated launch constraints. The trading crowd mostly cannot ship software.

## What people actually search for and share

Read the three X posts James saved. They teach three different lessons.

**Paul Sims, "Claude can now upgrade your entire Instagram page", 128K views, 2.2K bookmarks.**
Mechanically effective, strategically wrong for this account. It builds an audience
of prompt collectors. Steal the packaging discipline: a specific promise with a
number in it, and a save-worthy artifact at the end. Discard the topic.

**fabiano.sol, "How I Make a Living on Perp DEXs Without Being a Trader".**
This is the model. A non-obvious claim, crypto-native, insider knowledge with money
attached, and it teaches something the reader can act on. This is one notch over
from James's actual lane.

**Kshitij Dhyani, "Full step by step guide, no BS, I walk through the process realtime on video".**
The format. Generosity plus a real screen recording. The credibility comes from the
fact that you can watch it happen.

The synthesis: **fabiano's topic strategy, Kshitij's format, Paul's packaging discipline.**

## Three pillars

**Pillar 1: Prototype in public.** Weekly. A short screen recording of an AI
prototype pointed at a market. This is the reach engine and the proof.

**Pillar 2: Field notes.** Fortnightly essay. Market design, incentives, liquidity,
things that broke. This is the credibility engine and what hiring managers read.

**Pillar 3: How I build.** Monthly. Claude Code workflows, spec to PR, the content
system itself. This is top of funnel for the AI-curious.

Ratio per month: 4 demos, 2 essays, 1 build teardown, plus 6 to 8 short atoms
harvested from the above. Nothing is written twice. Atoms are derived from essays,
never composed independently.

## Audience (priority order)

1. Operators building trading, markets, or AI products who want field notes they can steal from
2. Hiring managers and founders evaluating whether James can actually ship
3. The AI-curious crowd who arrive through tooling content and stay for the market stuff

**Not** prompt collectors, growth hackers, or friend-group engagement farmers.

## Brand promise

If someone follows you for 3 months, they should get better at:

- Designing market products (liquidity, resolution, rewards, retention)
- Using AI as a shipping tool (not a party trick)
- Judging when gen media is productively useful vs noise

## Core principles (non-negotiable)

Full detail in [WRITING.md](./WRITING.md). Mechanical gate: `npm run content:check`.

1. **Never use em dashes** (`—`)
2. **Evidence block before drafting**
3. **Always open with a hook**
4. **Always end with a Takeaway**
5. **Receipts or admissions** (something at stake)
6. **One transformation per piece**

## The library

Structure by the problem the reader has, not by chronology.

```
/                     the thesis, three sections, latest pieces
/markets              Market design
/agents               Agents on rails
/shipping             Shipping inside a regulated exchange
/{section}/{slug}     the canonical piece
```

## One canonical piece, many derived atoms

The essay is the source. LinkedIn atoms, X threads, and Substack sends are derived.

```yaml
derives:
  - kind: linkedin
    angle: "the rewrite, before and after"
  - kind: x
    angle: "the one undefined word"
```

## Compliance

Never post non-public metrics, unreleased roadmaps, customer data, or confidential
Crypto.com / ByteDance details. Prefer principles, anonymized patterns, and
publicly shareable outcomes.

See [PLAN-30-DAYS.md](./PLAN-30-DAYS.md) for the first shipping milestone.
