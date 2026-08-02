---
title: "Dead markets poison the whole venue"
slug: 06-dead-markets-poison
author: James Liu
series: Market Ops Notes
section: markets
summary: "Thin inventory teaches users to distrust every mid. Listing bars and death plans are product work."
status: draft
publishAt: 2026-09-09T01:00:00Z
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

Fat spreads. Ghost mids. You cannot get out without eating glass. The UI can look expensive and the product still feels like a toy. One session is enough. The user does not file a thoughtful bug about "liquidity quality on long-tail inventory." They learn a simpler lesson: this place is decorative. The number on the screen is not a price. It is a suggestion with teeth.

Then they open a liquid market on your venue and bring that lesson with them.

Suspicion is sticky. Once a mid feels fake, every future mid needs extra proof. You will pay that proof in maker spend, support time, and slower adoption of the markets that actually work.

That is the poison. Thin inventory does not stay local. It contaminates trust in the whole room.

---

### More markets is not more product

<figure>
<img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTc0MzY1fA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="person holding pencil near laptop computer" />
<figcaption>What is: a listing plan that fills the calendar. What could be: a bar that kills decorative inventory before users learn the wrong lesson.</figcaption>
</figure>

Growth wants content. The calendar looks empty. A competitor screenshots a longer list. Someone proposes forty new questions because "discovery needs breadth."

Breadth without depth is a museum of prices that do not behave like prices.

**What the spike / listing count proved:** you can publish text on a page.

**What it did not prove:** anyone can enter and exit without feeling like exit liquidity.

I would rather ship fewer markets that behave like markets. Maker incentives, listing bars, killing decorative inventory: those are product calls, not finance chores. And if a market is thin, say so. Silence is UX too. People fill silence by assuming you are hiding something.

The usual response to thinness is to list more stuff. That usually makes it worse. You trade one liquid question people understand for forty thin ones that exist to fill a slide.

**Operator test:** Would you put your own money in, knowing you might need to exit in the next hour? If the honest answer is "only if nothing moves," you do not have a market. You have a prop.

---

### How poison spreads

Dead markets train three bad beliefs that leak upward.

1. **The mid is cosplay.** If the displayed price is untradeable in size, users stop believing numbers elsewhere, including where depth is real.
2. **Exiting is a trap.** Once someone eats glass on a thin book, every future confirm button carries that memory.
3. **The venue is a casino of listings, not a market.** Catalog length starts to feel like a dark pattern: abundance as theater.

None of these require a scandal. They require one quiet Tuesday and a market that should never have been listed.

Resolution trust and surprise trust can be perfect and still lose to this. The fair loser who cannot exit fairly is not a fair loser. They are someone who got stuck in your decorative inventory.

---

### A listing bar that deserves the name

<figure>
<img src="https://images.unsplash.com/photo-1560221328-12fe60f83ab8?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTc0MzY1fA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="close-up photo of monitor displaying graph" />
<figcaption>If the chart cannot be entered and exited, it is not a market. It is wallpaper with a candle pattern.</figcaption>
</figure>

Before something lists, pressure-test more than the witty prompt.

**Comprehension:** Can a smart first-timer understand the question without a seminar?

**Settle:** Can a non-lawyer explain resolution in thirty seconds? (If not, you are booking a dispute.)

**Depth plan:** What makes this tradeable in the first week? Market makers, seeding, event heat, or honest "thin" labeling?

**Exit story:** In a realistic size for your target user, what does getting out cost when the news moves?

**Death plan:** What kills this market if it fails the above after listing? Sunset is a feature. Zombie inventory is a choice.

If your listing process cannot answer the death plan question, you will accumulate props until the home feed feels like a flea market of abandoned questions.

Public-safe principle: quality control for partner markets and long-tail listings is the same muscle. A bad listing from a partner poisons you, not them. Your brand is on the confirm button.

---

### What to ship instead of forty thin questions

**Curate hard at the edges.** Featured rows and "all markets" pages teach different lessons. Overwhelm is not discovery. It is a trust tax with scroll physics.

**Make thinness legible.** "Low liquidity" is not shame. It is respect. Users can opt into a prop if they know it is a prop. They cannot forgive a mid that pretended to be a price.

**Concentrate incentives where books can heal.** Rewards that dump notional into ghost markets teach farming and teach deadness at the same time. If you run incentives, point them at markets that can absorb activity without becoming wash theater.

**Sunset in public.** Killing a category or a long-tail family is not failure if the alternative is teaching users that your venue is full of traps. Write the sunset copy before you need it.

**Measure contamination, not just volume per market.** Watch whether users who touch thin inventory show worse retention or worse trust tickets afterward. If you only celebrate listings shipped, you will never see the poison.

A simple operating rhythm helps. Weekly: top thin markets by touch volume from new users. Monthly: sunset candidates with owners and copy. Quarterly: category mix review against Tuesday reality, not against competitor screenshot length. Ritualize killing props the way you ritualize launching them.

---

### Sports, politics, crypto: different deadness

Not every category dies the same way.

Sports can look alive on marquee nights and hollow on Tuesday. Politics can choke on ambiguous settle. Crypto-adjacent questions can suffer from narrative churn and oracle drama. The product problem is shared: a market that cannot be exited fairly teaches the wrong lesson. The ops response differs by category mix, calendar density, and how natural hedging shows up (often: it doesn't, especially in pure speculation sports books).

Do not copy a competitor's catalog breadth and assume you copied their liquidity. You may have copied their screenshot.

Category mix is a retention tool when it creates recurring reasons to return. It is a poison vector when it is only a way to inflate listing count. The question is not "do we have sports and politics and culture?" The question is whether each family has at least a few markets that pass the exit test on a normal week.

**Operator test:** For each category you list, name the Tuesday story. If the category only works as a parade, you need bridges and listing discipline, not more parade floats.

One more practical rule for roadmap fights: when growth asks for breadth and trading asks for depth, make them pick a pilot. Ten liquid markets that behave beat fifty props every time in cohort health, even when the screenshot looks quieter. Quiet screenshots with healthy Tuesday cohorts beat loud catalogs with contaminated trust. Ship the quieter catalog on purpose, and defend that choice in the room.

---

### "All markets" pages and the overwhelm tax

Discovery UX is where dead inventory becomes a product crime in public.

An "all markets" page that dumps every thin question into an endless scroll does not create choice. It creates noise that hides the few markets that behave like markets. First-timers bounce. Power users filter. Screenshot farmers find the weirdest mid. Your brand looks busy and feels hollow.

One thing to remove often beats one thing to add. Remove decorative rows from default surfaces. Put thin markets behind honest labels or secondary navigation. Feature liquid, comprehensible questions where new money actually lands.

Mobile makes this sharper. On a small screen, every extra dead row is a trust lesson delivered with a thumb. If you are choosing between another listing and removing a zombie from the default feed, remove the zombie.

Partner listings need the same discipline. A partner's catalog ambition is not your obligation. Quality control is. If their market cannot clear your exit test and death plan, it does not get a seat on your confirm button.

---

### The Monday decision

When someone proposes filling the calendar because discovery "needs content," ask for the exit story and the death plan.

Ask whether the new listings make prices feel more real or make the venue feel more like a prop warehouse. Ask whether "all markets" will create overwhelm that hides the liquid ones. Ask whether rewards or campaigns will shove users into glass exits. Ask for the contamination metric you will watch after ship.

Picture the other world. Fewer markets. Each one exit-able in a realistic size. Thinness labeled when it exists. Decorative inventory killed before it teaches. Growth still has something to say. Users stop treating your mids like cosplay.

That is how a venue stays a venue.

---

### Takeaway

Dead markets do not fail in isolation. They teach users to distrust the whole room.

Before you list the next wave:

1. **Exit test:** own money, one-hour exit, realistic size
2. **Depth plan:** how it stays tradeable in week one
3. **Death plan:** how you sunset if it fails
4. **Contamination metrics:** what thin inventory does to retention and trust tickets

If you only remember one line, make it this: I'd rather ship fewer markets that behave like real markets than a catalog of props that poison the venue.
