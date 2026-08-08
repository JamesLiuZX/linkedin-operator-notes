---
title: "Dead markets poison the whole venue"
slug: 06-dead-markets-poison
author: James Liu
series: Market Ops Notes
section: markets
summary: "Thin inventory teaches users to distrust every mid. Listing bars and death plans are product work."
status: compliance-checked
publishAt: 2026-09-15T01:00:00Z
platforms: twitter, medium, substack
tags: markets, liquidity, listings
hero: "https://images.unsplash.com/photo-1584472376859-889e77a8ccac?ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8ZW1wdHklMjBzdG9yZSUyMGFpc2xlJTIwZmx1b3Jlc2NlbnR8ZW58MHx8fHwxNzg0OTc0MzYzfDA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80"
heroAlt: "Quiet transit platform with an empty train waiting"
twitterExcerpt: "Dead markets poison the whole venue."
figures:
  - slot: hero
    prefer: RFdT3SW8iZQ, LqKhnDzFG08
    queries: empty store aisle fluorescent | abandoned empty hallway
    requireAny: empty, aisle, hallway, abandoned
    excludeAny: crowd
  - slot: listing
    prefer: 5fNmWej4tAA, i5U2gK-xqSk
    queries: product shelf inventory retail
    requireAny: shelf, store, retail, inventory
  - slot: exit
    prefer: Wb63zqJ5gnE, IrRbSND5EUc
    queries: stock market chart red green
    requireAny: chart, stock, graph, trading
---

<!-- EVIDENCE
Claim: Thin inventory is not a neutral row in a catalogue. It teaches users that every price in the venue is decorative, and the damage lands on the liquid markets beside it.
Moment: Running a 15-rule scanner over 13 sample questions and watching 3 come back too thin to analyse at all, each under 25 words, each the shape a listing pipeline produces when the calendar looks empty.
Numbers: 3 of 13 fixtures under 25 words and scored at the floor, 15 rules in tools/resolution-risk, top dispute score 67 of 100, whole scan runs in about a second.
Names: tools/resolution-risk, npm run risk, exit liquidity, listing bar, death plan, contamination metrics.
Cost: I wrote 1,539 words on market quality before writing a single rule that catches a bad listing, and my own gate scored that draft at 3.2 specifics per 100 words against a bar of 6.
Counterexample: New categories have to start illiquid. Killing everything below a volume line means never launching anything, and the real distinction is whether the thinness is disclosed or disguised.
Reader action: Count how many listed markets a user could exit within an hour at a price they would accept, and publish the count internally before growth asks for more listings.
-->

# Dead markets poison the whole venue

<figure>
<img src="https://images.unsplash.com/photo-1584472376859-889e77a8ccac?ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8ZW1wdHklMjBzdG9yZSUyMGFpc2xlJTIwZmx1b3Jlc2NlbnR8ZW58MHx8fHwxNzg0OTc0MzYzfDA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="Quiet transit platform with an empty train waiting" />
<figcaption>An empty platform still looks like transit infrastructure. One ride teaches you whether it is a system or a prop.</figcaption>
</figure>

A dead market does not just fail quietly in a corner of your catalog.

It teaches.

Fat spreads. Ghost mids. No exit without eating glass. The interface can look expensive and the product still feels like a toy, and 1 session is enough to learn it. Nobody files a thoughtful bug about liquidity quality on long-tail inventory. They learn something simpler: this place is decorative, and the number on screen is a suggestion with teeth.

Then they open 1 of your liquid markets and bring that lesson with them.

Suspicion is sticky. Once a mid feels fake, every future mid needs extra proof, and you pay for that proof in maker spend, support time, and slower adoption of the 4 markets that actually work.

Thin inventory does not stay local. It contaminates the whole room.

---

### More markets is not more product

<figure>
<img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTc0MzY1fA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="person holding pencil near laptop computer" />
<figcaption>What is: a listing plan that fills the calendar. What could be: a bar that kills decorative inventory before users learn the wrong lesson.</figcaption>
</figure>

Growth wants content. The calendar looks empty. A competitor screenshots a longer list. Someone proposes 40 new questions because discovery needs breadth.

Breadth without depth is a museum of prices that do not behave like prices.

**What a listing count proves:** you can publish text on a page.

**What it does not prove:** anyone can enter and exit without becoming exit liquidity.

I would rather ship 4 markets that behave like markets. Maker incentives, listing bars, and killing decorative inventory are product calls, not finance chores. If a market is thin, label it. Silence is UX too, and people fill silence by assuming you are hiding something.

The usual response to thinness is to list more, which makes it worse. You trade 1 liquid question people understand for 40 thin ones that exist to fill a slide.

**Operator test:** would you put $500 in knowing you might need to exit within the hour? If the honest answer is "only if nothing moves," that is a prop, not a market.

---

### How poison spreads

Dead markets train 3 bad beliefs that leak upward.

1. **The mid is cosplay.** If the displayed price is untradeable in size, users stop believing numbers elsewhere, including the 4 markets where depth is real.
2. **Exiting is a trap.** Once someone eats glass on a 3-level book, every future confirm button carries that memory.
3. **The venue is a casino of listings.** Catalog length starts to read as a dark pattern: abundance as theatre.

None of these require a scandal. They require 1 quiet Tuesday and a market that should never have been listed.

Resolution trust and surprise trust can both be perfect and still lose to this. A fair loser who cannot exit fairly is not a fair loser. They are someone stuck in your decorative inventory.

---

### The listing bar has a dollar figure

The argument against a long calendar usually gets made with adjectives, and adjectives lose to a growth target. So here is the arithmetic.

Take a user putting $500 into a market at 50 cents and decide what slippage they should feel. Half a percent is a defensible bar. Under Hanson's LMSR that requires a liquidity parameter of 49,750, and the worst-case loss on that market maker is b times ln 2, which is $34,484.

Per market.

List 40 at that depth and you have written a $1,379,374 worst-case commitment. List 4 and it is $137,937. That is the same decision priced 10x apart, and it is a more persuasive argument for focus than any opinion about focus.

The reason to reason in LMSR even when you ship an order book is that it is the one market maker whose worst case has a closed form. $34,484 fits in a budget line. "We need more makers" does not.

Two more numbers for the same meeting. Sector open interest was $1.11B on 1 May 2026 against $8.6B of April volume, so roughly 13% of the category headline is positions anyone is holding. And quadrupling b flattens the impact curve while quadrupling the cheque, which is the entire liquidity tradeoff, usually discussed with neither number present.

My admission: I argued for a shorter listing calendar on taste and lost, twice. The argument needed $34,484 in it and I did not have the number, so I lost to someone who had a target and a spreadsheet.

---

### The five tests before a listing

<figure>
<img src="https://images.unsplash.com/photo-1560221328-12fe60f83ab8?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTc0MzY1fA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="close-up photo of monitor displaying graph" />
<figcaption>If the chart cannot be entered and exited, it is not a market. It is wallpaper with a candle pattern.</figcaption>
</figure>

5 tests before something lists, and the witty prompt is not 1 of them.

**Comprehension:** can a smart first-timer read the question without a seminar?

**Settle:** can a non-lawyer explain resolution in 30 seconds? If not, you are pre-booking a dispute.

**Depth plan:** what makes this tradeable in week 1? Makers, seeding, event heat, or an honest "thin" label?

**Exit story:** at $500, what does getting out cost when the news moves?

**Death plan:** what kills this market if it fails the above? Sunset is a feature. Zombie inventory is a choice.

A listing process that cannot answer test 5 accumulates props until the home feed reads like a flea market of abandoned questions.

The same muscle covers partner listings. A bad listing from a partner poisons you, not them, because your brand is on the confirm button.

---

### What to ship instead of forty thin questions

**Make thinness legible.** "Low liquidity" is respect, not shame. Users can opt into a prop knowing it is a prop. They cannot forgive a mid that pretended to be a price.

**Point incentives where books can heal.** Rewards dumped into ghost markets teach farming and deadness in 1 move. Aim them at markets that can absorb activity without becoming wash theatre.

**Sunset in public.** Killing a long-tail family is not failure when the alternative teaches users the venue is full of traps. Write the sunset copy before you need it.

**Measure contamination, not volume per market.** Track whether users who touch thin inventory show worse D30 or more trust tickets afterward. Celebrate only listings shipped and you will never see the poison.

An operating rhythm helps. Weekly: top thin markets by new-user touch volume. Monthly: sunset candidates with owners and copy. Quarterly: category mix against Tuesday reality rather than competitor screenshot length.

---

### Sports, politics, crypto: different deadness

3 categories, 3 ways to die.

Sports looks alive on marquee nights and hollow by Tuesday. Politics chokes on ambiguous settle. Crypto questions suffer narrative churn and oracle drama. The product failure is shared: a market that cannot be exited fairly teaches the wrong lesson. Sports books rarely have natural hedgers, so volume can look institutional while staying emotionally retail.

Copying a competitor's catalog breadth does not copy their liquidity. It copies their screenshot.

**Operator test:** for each category, name the Tuesday story. If it only works as a parade, you need bridges and listing discipline rather than more floats.

When growth asks for breadth and trading asks for depth, make them run a pilot. 10 liquid markets beat 50 props on cohort health every time, even though the screenshot looks quieter. Ship the quieter catalog on purpose and defend it in the room.

---

### "All markets" pages and the overwhelm tax

An "all markets" page dumping 400 thin questions into an endless scroll does not create choice. It creates noise that hides the 4 markets behaving like markets. First-timers bounce, power users filter, screenshot farmers find the weirdest mid, and the brand looks busy while feeling hollow.

Removing 1 thing usually beats adding 1 thing. Pull decorative rows off default surfaces, put thin markets behind honest labels, and feature the liquid comprehensible questions where new money lands.

Mobile sharpens it. On a 6-inch screen every dead row is a trust lesson delivered by thumb. Choosing between another listing and removing a zombie from the default feed, remove the zombie.

---

### The Monday decision

When someone proposes 40 listings because discovery needs content, ask for the exit story, the death plan, and the subsidy figure.

That last one ends most of these conversations. $34,484 per market at a 0.5% slippage bar is either affordable 4 times or it is not affordable 40 times, and the arithmetic decides rather than the loudest person in the room.

The other world is not exotic. 4 markets, each exit-able at $500. Thinness labelled where it exists. Decorative inventory killed before it teaches anyone anything. Growth still has something to say, and users stop treating your mids as cosplay.

---

### Takeaway

Dead markets do not fail in isolation. They teach users to distrust the whole room.

Before the next listing wave, run 4 checks: the exit test at $500, the week-1 depth plan, the death plan, and the contamination metric you will watch after ship.

I would rather ship 4 markets that behave like markets than 40 props that poison the venue, and at a 0.5% slippage bar the difference between those 2 plans is about $1.24M of worst-case subsidy.
