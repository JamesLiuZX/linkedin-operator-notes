---
title: "After the final: designing for the Tuesday nobody watches"
slug: 02-after-the-final
author: James Liu
series: Market Ops Notes
section: shipping
summary: "Marquee spikes aren't product-market fit. Week-two is."
status: draft
publishAt: 2026-08-12T01:00:00Z
platforms: twitter, medium, substack
tags: markets, retention, lifecycle
hero: "https://images.unsplash.com/photo-1764703666646-acc2f7d48857?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTY5MDUxfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80"
heroAlt: "Empty football stadium with bright lights on pitch"
twitterExcerpt: "Marquee spikes are not product-market fit. Week-two retention is."
figures:
  - slot: hero
    prefer: pLqfIJcN2Xk, WEBC3t9RjC4, a6hh1DdC5DM
    queries: empty football stadium lights
    requireAny: stadium, empty, seat
    excludeAny: crowd, fans, player, celebrat
  - slot: peak
    prefer: 2rjjnfdlwGY, 65yjpk2HSlA
    queries: packed stadium night lights
    requireAny: stadium, crowd, fans, packed
  - slot: bridge
    prefer: flRm0z3MEoA, 3nROCRjZiFQ
    queries: notebook planning desk
    requireAny: notebook, notepad, desk, calendar, office
---

<!-- EVIDENCE
Claim: Marquee event spikes measure distribution rather than product-market fit, and the bridge into week two has to be designed before the spike is bought.
Moment: {{MOMENT: the specific event whose Tuesday made this obvious. Sport or category, rough week, and what the team believed on peak day.}}
Numbers: {{NUMBERS: peak-day actives over second-Tuesday actives as a ratio, and event-acquired D14 into non-event markets. Ratios travel and leak nothing.}}
Names: the bridge, identity-continuous markets, D14, event microsite, articles/01-three-trust-surfaces.md.
Cost: {{COST: what got funded off a spike and did not survive the quiet week.}}
Counterexample: Some venues are legitimately seasonal. An elections market has no Tuesday problem in November and nothing else in March, and forcing a flat weekly curve onto it kills a product that works.
Reader action: Compute peak-day actives over second-Tuesday actives for your last big event before planning the next one.
-->

# After the final: designing for the Tuesday nobody watches

<figure>
<img src="https://images.unsplash.com/photo-1764703666646-acc2f7d48857?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTY5MDUxfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="Empty football stadium with bright lights on pitch" />
<figcaption>The lights are still on. The crowd is gone. This is the product you actually built.</figcaption>
</figure>

Marquee events create the illusion of product-market fit.

A World Cup final, a huge sports series, a once-in-a-cycle election night. Volume spikes. Screenshots look like destiny. Leadership asks why we can't "keep this energy." Then the calendar goes quiet, and the dashboard tells a colder story.

I am not going to hand you a chart I cannot source. Every venue publishes some volume history, and anyone can pull the weekly series either side of a final and look at the shape themselves. Do that rather than trusting my summary of it. The shape is the argument: attention arrives in a parade, then leaves when the parade ends.

The product question is not "how do we make the final bigger?"

It is what Tuesday looks like after the final.

---

### The spike is not the product

<figure>
<img src="https://images.unsplash.com/photo-1569863959165-56dae551d4fc?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTY5MDUyfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="a large stadium filled with lots of people" />
<figcaption>What is: a full stadium and a chart that looks like PMF. What could be: a reason to open the app when nothing historic is happening.</figcaption>
</figure>

During a mega-event, almost everything gets easier.

Distribution is free. Everyone is already talking about the same thing. The question is culturally obvious, so comprehension is cheap. Emotional urgency does the onboarding for you. Friends, feeds, and group chats supply social proof you did not earn in the product.

When the event ends, you lose the free marketing engine. What's left is your actual product.

| What the spike proved | What it did not prove |
|----------------------|------------------------|
| People will trade when the world is watching | People will form a habit |
| Your funnel can convert attention | Your loop survives boredom |
| Liquidity can congregate on one narrative | Your venue has a year-round reason to exist |

Category-level volume on Kalshi and Polymarket has been climbing, and that is the number people quote. Per-event tears say something sharper and less flattering: attention is rented, habit is owned, and only one of those shows up in a category chart.

Secondary analyses of the World Cup window also argue a structural point worth sitting with. Sports markets are often pure speculation ecosystems. Few natural hedgers. Volume can look institutional while remaining emotionally retail. That is not a moral judgment. It is a product constraint. Your retention design cannot assume "utility hedging" will keep people around when the trophy is awarded.

**What leadership celebrates:** peak day volume, app-store ranks, the screenshot of the final.

**What Tuesday reveals:** whether you built a venue or a pop-up.

---

### Five stages, one job each

Most teams treat an event as a launch. Treat it as a lifecycle instead.

**Pre → Peak → Resolve → Week-two → Steady.**

Miss any stage and the spike becomes a tax you pay again next season.

#### 1. Pre-event: competence without farmers

**Job:** Convert curiosity into competent first trades without training mercenaries.

Ship a two-minute "how this market works" for first-timers. Ship resolution explainers before money is in. Ship a curated set of liquid markets, not eighty thin ones that exist to fill a slide. Set expectations on fees, exits, and what happens if settlement is delayed.

Kill rewards that only pay for "trade once during the event." Kill ambiguous viral questions that screenshot well and settle badly.

**Operator test:** Would a smart first-timer know how they win, how they exit, and how the market resolves before they tap? If not, you are acquiring confusion at scale.

#### 2. Peak: don't break trust while the stadium is full

**Job:** Survive contact with the crowd.

Performance budgets matter. Order path, app stability, real-time status honesty. "Delayed," "halted," and "thin" are product copy, not eng jargon. Support macros for the three trust surfaces (price, resolution, surprise) should already exist. Risk and compliance monitoring should not surprise-ban without a story the user can understand.

Kill silent failures. Kill mid-event rule changes without communication. The peak is when your brand is most visible and most fragile at once.

**Operator test:** If the app flakes for five minutes during the only window anyone cared about, would a fair loser say "glitch" or "hustle"? Design so the first answer is the only answer.

#### 3. Resolution: make fairness legible

**Job:** Close the emotional loop.

Fast settlement when the source of truth is clear. Push plus in-app: "Resolved. Here's why." Clear balance and position truth after settle. A one-tap path to a next market that was designed, not random.

Kill resolve-with-no-explanation. Kill dumping users on a dead home feed the morning after.

People forgive a quiet week. They do not forgive feeling unclear on how a market settled. Resolution is not ops theater. It is the last mile of the trade.

**Operator test:** After settle, can the user answer three questions without opening support: what happened, why, and what should I do next?

#### 4. Week-two: the real product

<figure>
<img src="https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTY5MDUzfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="person holding notepad and pen flat lay photography" />
<figcaption>Week-two is planning, not parade. Bridge markets, rituals, and a loop that does not need a historic night.</figcaption>
</figure>

**Job:** Replace the marquee with a ritual.

This is where most teams under-invest, because dashboards still glow from Peak. That glow is a lie with a lag.

After a position resolves, the user either has a next natural bet or the account goes cold. Cold accounts become a re-acquisition tax later. Warm accounts become the cohort you actually own.

Bridge design principles that hold up:

1. **Same identity, smaller stakes.** "You followed Team X / Theme Y. Here are ongoing markets." Continuity of identity beats a random carousel.
2. **Higher frequency, lower majesty.** Leagues, weekly politics, macro prints, culture markets. Category mix stabilizes a venue that would otherwise live and die by one tournament.
3. **Teach a loop, not a lottery.** Watch → decide → position → resolve → review → return. Break any step and the spike was rented attention.
4. **Rewards price sequences, not screenshots.** Return after resolve. Multi-day activity. Non-wash patterns. If incentives only paid for showing up during the big game, you bought a crowd.

**Operator test:** Fourteen days after the final, what percentage of event-acquired users traded a non-event market? If you do not know, you are managing a parade, not a product.

#### 5. Steady state: be a venue

**Job:** Exist when nothing is "historic."

Metrics that matter more than Peak Day Volume:

- D7 / D30 retention of event-acquired cohorts, separated from organic
- Percent of event users who trade a non-event market within 14 days
- Median markets traded in the first 30 days
- Support tickets per 1k event users (trust leak detector)
- Liquidity quality on bridge markets (do not bridge into ghost towns)

If your bridge markets are decorative inventory, you did not build a bridge. You built a cliff with nicer copy.

---

### A practical playbook after the whistle

**T+0 to T+48 hours**

Resolution communications live. A "your tournament" recap: what you traded, what you learned, without gamified shame. A bridge module with three to five markets max, personally relevant, liquid. Turn off or reshape event-only incentives before they teach the wrong lesson twice.

**T+3 to T+14 days**

Lifecycle messaging that educates more than it FOMO-screams. Habit nudges tied to a recurring calendar (matchday, data release, weekly brief). Creator or community layer only if it drives understanding, not spam. Review farming: did rewards create a cohort or a mercenary wave?

**T+15 to T+45 days**

Cohort autopsy: who stayed, what they traded, what they ignored. Listing strategy: cut decorative markets. Write the memo leadership needs: Peak is not PMF.

That memo is a career asset. The alternative is another quarter of buying the same spike and calling the hangover a retention problem.

---

### Incentives: the silent retention killer

If your acquisition paid people to show up for the final, you bought a crowd.

Rewards have two jobs that conflict. Help real users learn the loop. Avoid paying professionals to extract the program. Most teams optimize for screenshots of volume, then act surprised when farmers arrive.

Before you spend the next dollar, run four tests:

1. **Who is the marginal user of the next dollar?** If they never stick after incentives end, you are renting volume.
2. **What behavior is priced?** "Trade once during event X" is easy to farm. Sequences that look like real usage are harder and usually healthier.
3. **Can a spreadsheet beat your product?** If someone can win the program without developing taste for markets, farmers will find it.
4. **What does day 31 look like if rewards go to zero?** If the product story collapses, the rewards were life support.

Gamification is not the enemy. Unexamined incentive design is.

---

### The Monday decision

When the next marquee lands on the roadmap, do not start with the campaign brief.

Start with week-two.

Name the bridge markets before you buy the spike. Name the resolve story before you list the clever question. Name the incentive that prices a sequence, not a screenshot. Separate the event-acquired cohort in your metrics so nobody can hide hangover inside blended retention.

Picture the other world. The final still happens. The charts still spike. But Tuesday is not empty. The fair loser has a next natural bet. The home feed is not a graveyard. Leadership still gets the screenshot. You get the cohort.

That is the difference between a venue and a pop-up.

---

### Takeaway

The final is distribution. Tuesday is the product.

Before the next marquee, lock these four:

1. **Bridge:** three to five liquid, identity-continuous markets ready within 48 hours of resolve
2. **Resolve:** a settle story users can explain without support
3. **Incentives:** price sequences, not "show up for the final"
4. **Metrics:** event-acquired D14 into non-event markets, not peak day volume alone

If you only remember one line, make it this: design the bridge before you buy the spike.
