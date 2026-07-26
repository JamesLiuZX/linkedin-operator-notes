---
title: "Your rewards bought a crowd. Farmers noticed first."
slug: 04-rewards-vs-farming
author: James Liu
series: Market Ops Notes
section: markets
summary: "Four tests before the next dollar of incentives: marginal user, priced behavior, spreadsheet, day 31."
status: draft
publishAt: 2026-08-18T01:00:00Z
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

# Your rewards bought a crowd. Farmers noticed first.

<figure>
<img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTc0MzUxfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="A MacBook with lines of code on its screen on a busy desk" />
<figcaption>If a spreadsheet can beat your product, your reward program is a mining job with better branding.</figcaption>
</figure>

Most reward systems in trading products fail the same way. They optimise for screenshots of volume, then act surprised when farmers arrive on day 2.

Incentives have 2 jobs that conflict. Teach real users the loop: deposit, decide, trade, resolve, return. Avoid paying professionals to extract the program. Growth wants the first, finance wants a chart, and farmers want the gap between what you priced and what you meant.

That gap is the product.

You paid for a parade, and the people who showed up knew the route better than you did.

---

### What you think you bought vs what showed up

<figure>
<img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTc0MzUzfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="group of people using laptop computer" />
<figcaption>What is: activity that looks like a community. What could be: a cohort that still has a reason to play when points stop shouting.</figcaption>
</figure>

**What leadership celebrates:** week-1 volume, referral counts, a campaign retro with green arrows.

**What Tuesday reveals:** wash patterns, single-touch accounts, and a retention curve that collapses when points hit 0.

The category makes this easy to hide. Kalshi and Polymarket did a combined $44.8B in June 2026, and sector volume was $8.6B in April 2026. Against numbers like those, a rewarded cohort looks like a rounding error in the right direction. Then check open interest: $1.11B on 1 May 2026, roughly 13% of the monthly volume headline. Most of what gets celebrated is turnover, and rewarded turnover is the cheapest kind to manufacture.

Farmers are not villains. They are rational readers of your rules. Pay for "trade once during event X" and they trade once during event X. Pay for round-trippable notional and they round-trip. Pay for invites and you get 500 empty shells.

You did not get hacked. You got interpreted.

Incentive design is UX for people who optimise. Soft users feel your brand. Hard users feel your loopholes. Both are your users, and only 1 group writes your unit economics.

---

### The formula, and the term it does not have

Abstractions are easy to nod at, so here is a real one. Polymarket publishes its maker reward rule:

```
S(v) = ((max_spread - order_spread) / max_spread)^2 x order_size
```

Orders beyond `max_spread`, typically 3 cents from the midpoint, score 0. Two-sided quoting is required through `Q_min = min(Q_one, Q_two)`, and single-sided liquidity takes a 3x penalty. The daily pool splits pro-rata by score across roughly 288 sampled epochs a day.

It is a good rule. The square does real work: an order 0.5 cents from the midpoint earns about 69% of a mid-touching order, while one at 2.5 cents earns 2.8%. It pays hard for tightness, which is what a thin book needs most.

Now read it again looking for the variable representing whether the order filled.

There is not one.

That absence is the entire farming surface. The optimal strategy is to rest at minimum size as close to the midpoint as the tick allows, on both sides, and cancel when real flow arrives. You collect for displaying liquidity and never take the adverse selection that displaying it is meant to compensate.

I rebuilt this as a simulator to find out what the gap costs. At settings that look unremarkable, a $5,000 daily pool buys liquidity at $0.042 per filled share, with farmers taking 49% of the budget while filling 15% of the volume. The book advertises a 0.1 cent spread. The taker experiences 1.5 cents.

That 14x gap between quoted and realised is not slippage. It is orders that were never going to be there.

The cost curve is also convex in the one variable you do not control. A program that looks defensible at a 40% cancel rate is nowhere near defensible at 85%, and cancel rate is set by the farmer's infrastructure, not by your rules.

One term fixes most of it: disqualify makers whose fill rate falls below a floor. It is the term the published rule does not have, and it has a real cost that I would rather state than bury. Set the floor too high and you drive off honest makers, because honest makers get filled precisely when they are wrong. The floor has to be low enough to catch the strategy and high enough to survive being adversely selected.

Here is my admission. I have defended a rewards program in a review using displayed-depth charts, and I was wrong about which chart mattered. Displayed depth was flattering and meaningless. Nobody in that room asked for cost per filled unit, including me, and the program ran for a quarter on that basis.

---

### Four tests before you spend the next dollar

Run these in the design review, not the postmortem.

#### 1. Who is the marginal user?

If the next dollar mostly attracts people who leave on day 31, you are renting volume. Renting is a valid tactic. It is not a strategy, and it is not growth if you call the hangover a retention bug.

Ask: with 0 further points, would this person open the app on a quiet Tuesday? If not, you bought a screenshot.

#### 2. What behavior is priced?

"Trade once during event X" is trivially farmable. A sequence is not: return after resolve, activity across 3 days, 2 market families, non-wash patterns.

Price the loop you want learned. Price a stunt and you get stunt artists.

**Operator test:** write the priced behavior in 1 sentence a farmer would try to fake. Ask whether your detection story beats their spreadsheet. If not, change the behavior rather than the monitoring.

#### 3. Can a spreadsheet beat your product?

<figure>
<img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTc0MzUyfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="laptop computer on glass-top table" />
<figcaption>The farmer's real product is the grid. Yours has to be better than the grid at teaching taste for markets.</figcaption>
</figure>

If someone can win without developing taste for markets, farmers will. Taste means reading a question, forming a view, sizing with skin in the game, and returning when the calendar is boring.

A program cleared by scripting notional, cycling 1 thin market, or farming referrals without first trades is a bounty board.

Sit a sharp operator down for 30 minutes and ask them to break your rules on paper. Assume whatever they find was found in production 2 weeks ago.

#### 4. What happens on day 31?

Draw the retention curve with rewards at 0. If the product story collapses, the rewards were life support.

Life support keeps a patient alive through surgery. It cannot be the personality of the hospital. A campaign that only works while subsidised is marketing expense in a product costume.

**Operator test:** put the "rewards to 0" chart beside the launch chart in the same memo. If that slide is unwelcome in the room, you already have your answer.

---

### Four constraints that survive contact with extractors

5 boring constraints that make real usage cheaper than fake usage.

**Price sequences, not spikes.** Return after resolve, activity across 3 days, 2 market families. Expensive to fake without looking like wash.

**Require fills, not quotes.** A fill-rate floor, low enough to survive adverse selection. This is the missing term from the formula above, and it is worth more than every detection system you could build instead.

**Gate on liquidity.** A market too thin to exit should not be a rewards sink. Paying people to trade ghost markets teaches them the venue is decorative, which costs more than the rewards.

**Name anti-patterns in the rules, not the fine print.** Wash trading, self-dealing loops, referral shells. Ambiguous enforcement feels arbitrary. Named constraints feel like standards.

**Report cohorts, not blends.** Separate rewarded-acquired from organic, watch D7 and D30 after the boost ends. Blended volume makes farmers look like product-market fit indefinitely.

---

### The failure gallery, in 4 lines

**The event bounty.** Pay for 1 trade during the final, get exactly 1 trade during the final, and a week-2 ghost town with a good retro slide.

**The notional treadmill.** Pay for round-trippable volume in a 3-level book. Get a liquidity mirage plus a trust hangover for anyone who tried to exit at size.

**The referral shell.** Pay for invites, get 500 accounts and 12 traders. Top-of-funnel looks excellent until you segment for first competent trade.

**The points personality.** Day 31 is not a dip. It is the real product arriving 30 days late to its own launch.

All 4 fail the same test. The program taught extraction instead of the loop.

---

### Rewards amplify the three trust surfaces

If prices feel fake, rewards teach people to poke a toy for points. If resolution is fuzzy, rewards drag more money into disputes, and the $60M Strategy dispute over 1 ambiguous word is that at scale. If the app surprises people after the tap, rewards buy anger at volume.

A reward on top of a leak is a louder leak.

**Operator test:** would you put your own money through the rewarded path, knowing you might need to exit, settle, and read the fee? If the answer is "only for the points," you designed a farm.

---

### The Monday decision

Start with the 4 tests rather than the creative. Name the priced behavior, the day-31 story, how you separate cohort health from blended vanity, and what gets killed if wash shows up. Put the "rewards to 0" chart beside the launch forecast.

Then compute 1 number before the meeting: dollars per filled unit. In my simulator that number was $0.042 while every displayed-depth chart looked healthy. If nobody in the room has seen it, the program was not reviewed. It was admired.

---

### Takeaway

Rewards fail when they buy screenshots and the hangover gets filed as a retention bug.

Before the next program: name the marginal user, name the priced behavior, run the spreadsheet test, and draw the day-31 curve at 0.

If a spreadsheet can beat your product, you did not design growth. You designed a bounty.
