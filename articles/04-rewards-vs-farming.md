---
title: "Your rewards bought a crowd. Farmers noticed first."
slug: 04-rewards-vs-farming
author: James Liu
series: Market Ops Notes
section: markets
summary: "Four tests before the next dollar of incentives: marginal user, priced behavior, spreadsheet, day 31."
status: draft
publishAt: 2026-08-26T01:00:00Z
platforms: twitter, medium, substack
tags: markets, incentives, retention
hero: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTc0MzUxfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80"
heroAlt: "A MacBook with lines of code on its screen on a busy desk"
twitterExcerpt: "Your rewards bought a crowd. Farmers noticed first."
figures:
  - slot: hero
    prefer: m_HRfLhgABo, 5fNmWej4tAA
    queries: arcade tokens coins close up | game tokens pile
    requireAny: coin, token, chip, arcade
    excludeAny: crypto chart, bitcoin logo
  - slot: spreadsheet
    prefer: i5U2gK-xqSk, hpjSkU2UYSU
    queries: spreadsheet laptop desk
    requireAny: spreadsheet, excel, laptop, numbers
  - slot: cohort
    prefer: QckxruozjRg, LqKhnDzFG08
    queries: people walking empty street morning
    requireAny: street, walk, path, road
    excludeAny: party, crowd festival
---

<!-- EVIDENCE
Claim: An incentive program is only growth if the retention curve survives the program ending, and most programs are never drawn against that question before launch.
Moment: {{MOMENT: the incentive design review where someone asked what day 31 looks like and the room had no answer. Rough timeframe, no program names.}}
Numbers: {{NUMBERS: share of reward-acquired users still active a month after incentives stopped, as a ratio or band, plus the cohort window.}}
Names: day 31, the marginal user, the spreadsheet test, wash patterns, priced behaviour.
Cost: {{COST: an incentive you priced wrong and what it attracted instead. Principle level.}}
Counterexample: Some programs are honestly bootstrapping liquidity rather than buying retention. Paying for the first fills in a new book is a market-making cost, and judging it on day-31 retention misreads what it was for.
Reader action: Draw the retention curve with rewards set to zero and get the room to sign the drawing before the budget is approved.
-->

# Your rewards bought a crowd. Farmers noticed first.

<figure>
<img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTc0MzUxfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="A MacBook with lines of code on its screen on a busy desk" />
<figcaption>If a spreadsheet can beat your product, your reward program is a mining job with better branding.</figcaption>
</figure>

Most reward systems in trading products fail the same way.

They optimize for screenshots of volume. Then they act surprised when farmers arrive.

In prediction markets, incentives have two jobs that conflict. Help real users learn the loop: deposit, decide, trade, resolve, return. Avoid paying professionals to extract the program. Growth wants the first. Finance wants a chart. Farmers want the gap between what you priced and what you meant.

That gap is the product.

If you only remember the shape of the failure: you paid for a parade, and the people who showed up knew the route better than you did.

---

### What you think you bought vs what showed up

<figure>
<img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTc0MzUzfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="group of people using laptop computer" />
<figcaption>What is: activity that looks like a community. What could be: a cohort that still has a reason to play when points stop shouting.</figcaption>
</figure>

**What leadership celebrates:** week-one volume, referral counts, the campaign retro with green arrows.

**What Tuesday reveals:** wash patterns, single-touch accounts, and a retention curve that collapses when points go to zero.

Farmers are not villains in a morality play. They are rational readers of your rules. If your program pays for "trade once during event X," they will trade once during event X. If it pays for notional that can be round-tripped, they will round-trip. If it pays for invites that never become traders, they will invite empty shells.

You did not get hacked. You got interpreted.

The uncomfortable reframe: incentive design is UX for people who optimize. Soft users feel your brand. Hard users feel your loopholes. Both are your users. Only one of them writes your unit economics.

---

### Four tests before you spend the next dollar

Run these in the design review, not in the postmortem.

#### 1. Who is the marginal user?

If the next dollar of rewards mostly attracts people who never stick after incentives end, you are renting volume. Say it out loud. Renting can be a tactic. It is not a strategy, and it is not "growth" if you call the hangover a retention bug.

Ask: if this person never earned another point, would they still have a reason to open the app on a quiet week? If the honest answer is no, you are buying a screenshot.

#### 2. What behavior is priced?

Paying for "trade once during event X" is easy to farm. Paying for sequences that look like real usage is harder and usually healthier: return after resolution, multi-market activity over time, non-wash patterns, competent second sessions.

Price the loop you want people to learn. If you price a stunt, you will get stunt artists.

**Operator test:** Write the behavior in one sentence a farmer would try to fake. Then ask whether your detection story is stronger than their spreadsheet. If not, change the behavior, not the monitoring theater.

#### 3. Can a spreadsheet beat your product?

<figure>
<img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTc0MzUyfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="laptop computer on glass-top table" />
<figcaption>The farmer's real product is the grid. Yours has to be better than the grid at teaching taste for markets.</figcaption>
</figure>

If someone can win the program without developing taste for markets, farmers will find it. Taste means: reading a question, forming a view, sizing with skin in the game, living with resolve, coming back when the calendar is boring.

A program that can be cleared by scripting notional, cycling the same thin market, or farming referrals without first trades is not onboarding. It is a bounty board.

This test is cruel and useful. Sit with a sharp operator for thirty minutes and ask them to break your rules on paper. Whatever they find, assume someone already found it in production.

#### 4. What happens on day 31?

Draw the retention curve assuming rewards go to zero. If the product story collapses, the rewards were life support.

Life support can keep a patient alive during surgery. It cannot be the personality of the hospital. Campaigns that only work while subsidized are marketing expense with a product costume.

**Operator test:** In the memo to leadership, include the "rewards → 0" chart next to the launch chart. If that slide is not allowed in the room, you already know the answer.

---

### Design patterns that survive contact with extractors

You do not need a novel theory of points. You need boring constraints that make real usage cheaper than fake usage.

**Prefer sequences over spikes.** Return after resolve. Trade across days. Touch more than one market family. Sequences are annoying to fake at scale without looking like wash. Spikes are a farmer's favorite meal.

**Prefer identity continuity over viral emptiness.** Rewards that deepen a user's relationship to a theme (team, topic, recurring calendar) beat rewards that pay for a single screenshot of notional.

**Prefer liquidity-aware eligibility.** Paying people to trade ghost markets teaches them the venue is decorative. If a market is too thin to exit without eating glass, it should not be a rewards sink.

**Prefer clear anti-patterns in the rules, not only in the fine print.** Wash trading, self-dealing loops, referral shells: name them. Ambiguous enforcement feels arbitrary. Clear constraints feel like a venue with standards.

**Prefer cohort health over blended vanity.** Separate rewarded-acquired users from organic. Watch D7 / D30 after the boost ends. If you only report blended volume, farmers will forever look like product-market fit.

None of this requires disclosing internal thresholds in public writing. It requires admitting that incentive design is a product surface, not a growth garnish.

---

### The false war: "gamification bad" vs "points forever"

Gamification is not the enemy. Unexamined incentive design is.

Points can teach the loop. Badges can mark competence. Referrals can bring people who actually trade. The failure mode is not "fun." The failure mode is paying for the wrong movie: a clip of volume instead of a habit of returning.

Conversely, moral purity ("we would never do rewards") often just moves the subsidy into fee holidays, listing spam, or paid acquisition that still collapses on day 31. The mechanism changes. The honesty requirement does not.

**What is:** a campaign brief that asks for "more activity this week."

**What could be:** a program that leaves behind a cohort with a reason to play when the points stop shouting.

That second sentence is the only definition of success worth defending in a roadmap meeting.

---

### How rewards talk to the three trust surfaces

Incentives do not live in a silo. They amplify whatever your venue already is.

If prices feel fake, rewards teach people to poke a toy for points. If resolution is fuzzy, rewards drag more money into disputes. If the app surprises people after the tap, rewards buy anger at scale.

So before you launch the next program, pressure-test the three surfaces from the trust essay: price quality, resolution clarity, surprise. A reward on top of a leak is not growth. It is a louder leak.

**Operator test:** Would you put your own money through the rewarded path, knowing you might need to exit, settle, and understand the fee? If you would only do it "for the points," you designed a farm.

---

### A short failure gallery (patterns, not gossip)

You do not need confidential metrics to recognize the shapes.

**The event bounty.** Pay for one trade during the final. Get one trade during the final. Week-two is a ghost town with a beautiful retro slide.

**The notional treadmill.** Pay for volume that can be round-tripped in a thin book. Get volume. Also get a liquidity mirage and a trust hangover for anyone who tried to exit for real.

**The referral shell.** Pay for invites. Get accounts. Not traders. Your top-of-funnel looks world-class until you segment for first competent trade.

**The points personality.** The product only makes sense while subsidized. Day 31 is not a dip. It is the real product showing up late to its own launch.

Each pattern fails the same underlying test: the program did not teach the loop. It taught extraction.

If your current draft resembles any of these, rewrite the priced behavior before you rewrite the creative. Creative cannot save a bounty board.

---

### The Monday decision

When someone proposes a rewards push for the next marquee, do not start with the creative.

Start with the four tests. Name the priced behavior. Name the day-31 story. Name how you will separate cohort health from blended vanity. Name what you will kill if wash shows up. Put the "rewards → 0" chart in the same deck as the launch forecast so nobody can celebrate week one in isolation.

Picture the other world. You still run campaigns. Charts still move. But the marginal dollar buys a second session after resolve, not a single stunt during the final. Farmers still try. The rules make real usage the cheaper path. Leadership still gets a launch. You get a cohort that still opens the app when the points stop shouting.

That is the difference between renting volume and growing a venue.

---

### Takeaway

Rewards fail when they buy screenshots and call the hangover retention.

Before you ship the next program:

1. **Marginal user:** will they stick when points end?
2. **Priced behavior:** sequence and loop, not a one-tap stunt
3. **Spreadsheet test:** can farming beat taste for markets?
4. **Day 31:** draw rewards → 0 before you celebrate week one

If you only remember one line, make it this: if a spreadsheet can beat your product, you did not design growth. You designed a bounty.
