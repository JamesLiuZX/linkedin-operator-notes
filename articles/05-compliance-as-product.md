---
title: "Compliance is not the gate at the end. It is a product input."
slug: 05-compliance-as-product
author: James Liu
series: Market Ops Notes
section: shipping
summary: "Structure, clear constraints, and translation: how market products still exist next year."
status: draft
publishAt: 2026-09-02T01:00:00Z
platforms: twitter, medium, substack
tags: markets, compliance, product
hero: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTl8fGJsdWVwcmludCUyMGFyY2hpdGVjdHVyZSUyMHBsYW5zJTIwZGVza3xlbnwwfHx8fDE3ODQ5NzQzNTZ8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80"
heroAlt: "An architect working on a draft with a pencil and ruler"
twitterExcerpt: "Compliance is not the gate at the end. It is a product input."
figures:
  - slot: hero
    prefer: nGoCBof4xP0, 5QgIuuBxKs4
    queries: blueprint architecture plans desk
    requireAny: blueprint, plan, architect, drawing
  - slot: translate
    prefer: 8T9AVksyuA0, 5QgIuuBxKs4
    queries: meeting notes whiteboard markers
    requireAny: whiteboard, meeting, notes, desk
  - slot: clarity
    prefer: 6jYoil2LlFQ, veNb0DDegzE
    queries: road sign fork path
    requireAny: sign, road, path, direction
---

# Compliance is not the gate at the end. It is a product input.

<figure>
<img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTl8fGJsdWVwcmludCUyMGFyY2hpdGVjdHVyZSUyMHBsYW5zJTIwZGVza3xlbnwwfHx8fDE3ODQ5NzQzNTZ8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="An architect working on a draft with a pencil and ruler" />
<figcaption>Draw the constraints into the blueprint. Retrofitting them after the "fun" market ships is a redesign with extra steps.</figcaption>
</figure>

In prediction markets, compliance is not a gate at the end.

It is a product input at the beginning.

If you design the "fun" market first and ask legal later, you do not get a delay. You get a redesign. The copy changes. The eligibility changes. The marketing claim changes. Sometimes the whole listing dies after the campaign already taught users to want it.

Users do not experience "pending regulatory review." They experience a product that feels inconsistent: available here, restricted there, unexplained elsewhere. Your org chart is invisible. Their stomach is not.

I am not interested in "move fast and break licensed markets." I am interested in building market products that can still exist next year.

That sounds conservative until you price the alternative: a growth win that forces a silent restriction, a confused cohort, and a trust rebuild that takes longer than the campaign that caused it.

---

### Market structure is a feature

What can be listed, how it resolves, who can participate, what can be marketed: these are not footnotes. They change the UX and the business model.

A sports question with a clean source of truth is a different product from a clever cultural gotcha that settles into a dispute. A market open to a broad retail audience is a different product from one that only works behind heavier eligibility. A claim you can put in a growth channel is a different product from a claim that must stay muted.

When teams treat structure as "legal will decide," they accidentally treat the core product as optional. Structure is how the venue behaves when money is real. That is the product.

**What is:** a growth brief that assumes every witty question can be a listing.

**What could be:** a listing bar that includes settle clarity, eligibility, and marketing constraints before creative gets excited.

**Operator test:** can you explain in 1 breath who can trade this, how it resolves, and what you are allowed to say about it publicly? If any of the 3 answers is "we'll figure it out," the market is not ready and the campaign is early.

---

### What "moving target" actually looks like

Abstractions let people nod without changing anything, so here is the real calendar for a single contract type in the United States.

The Third Circuit ruled for Kalshi on 7 April 2026, holding sports event contracts are swaps under the Commodity Exchange Act and therefore federally preempted. The Ninth Circuit heard Nevada's appeal on 16 April 2026, 9 days later, and the panel did not obviously read it the same way.

Around those 2 dates: the CFTC sued Arizona, Connecticut and Illinois on 2 April 2026 to block state enforcement. A Tennessee court converted a restraining order into a preliminary injunction on 19 February 2026. A Maryland court had denied Kalshi the same relief on 1 August 2025, finding state gaming authority could coexist with CFTC oversight. On 10 June 2026 the CFTC issued a new proposed rule revising Rule 40.11.

6 dates, 18 months, 1 contract type, and 2 federal appeals courts that disagree.

Read that as a product requirement rather than as news. It means the mapping from jurisdiction to what you may list is data that changes mid-quarter, not configuration you set at launch. A schema that assumes the mapping is stable will be wrong on a schedule.

Which is where I got it wrong. I designed a market model where jurisdiction was a launch-day config flag rather than a field on the market object. Retrofitting it cost roughly 3 months of engineering time that should have been 3 days of schema design, and the person who paid for that was an engineer who had not been in the room when I made the call.

---

### Ambiguity is a trust bug

<figure>
<img src="https://images.unsplash.com/photo-1593115057322-e94b77572f20?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTc0MzYwfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="brown wooden tool on white surface" />
<figcaption>Clear constraints feel like standards. Silent restrictions feel like the venue moved the floor after the tap.</figcaption>
</figure>

Across jurisdictions, products get uneven. That unevenness can be correct and still feel extractive if you refuse to narrate it.

Silent geo blocks. Features that vanish without a sentence. Markets that appear for one cohort and not another with no explanation. Support macros that say "policy" when the user asked "what happened to my money path?"

In a social app, inconsistency is annoying. In a market, inconsistency feels like the house changing the rules.

Clarity beats silent constraint. You do not need a legal essay in the UI. You need a human sentence before the flinch: why this is unavailable, what still is, what to do next.

This is the same family as the surprise trust surface. Compliance debt shows up as surprise when product treats policy as a backend flag instead of a user-facing story.

**Operator test:** List every place eligibility or availability can change after a user has already formed intent. For each one, is the explanation before the tap, or only after the flinch? After is too late.

---

### Speed vs clarity is a false choice

Teams love a false war. Ship fast and confuse people, or go slow and be responsible.

The brand choice is a third thing: ship with clear constraints. Clear is not slow forever. It means you do not train users to assume the product is arbitrary.

A confusing restriction with no explanation spends trust. A listing delayed 2 weeks with a boring honest settle story earns it. The calendar is 1 clock. The trust balance is the other, and it compounds both ways.

If expansion creates inconsistency users can feel, treat that feeling as a P0 UX bug rather than a legal side effect.

---

### The PM job is translation

<figure>
<img src="https://images.unsplash.com/photo-1553044707-b710ee53ffbd?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTV8fG1lZXRpbmclMjBub3RlcyUyMHdoaXRlYm9hcmQlMjBtYXJrZXJzfGVufDB8fHx8MTc4NDk3NDM1OXww&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="yellow sticky notes" />
<figcaption>Legal speaks risk. Users speak outcomes. Eng speaks state machines. Someone has to make those sticky notes into one product.</figcaption>
</figure>

Legal speaks risk. Users speak outcomes. Eng speaks state machines. Growth speaks campaigns. The job is the shared language.

Which means prototypes rather than decks. The settle explainer a normal person reads in 30 seconds. The empty state when a market is unavailable. The push copy after a restriction. The 3 claims you will not make in ads.

Compliance partners who see slideware become gates. Compliance partners who see flows become design partners.

I have watched a team align in a meeting and ship 3 different products: the 1 legal thought was approved, the 1 eng implemented, and the 1 growth promoted. The user got the collision.

**Operator test:** before kickoff, write the user-facing sentences for list, restrict, resolve, and refuse. If legal, eng and growth cannot sign the same 4 sentences, that is not alignment. It is a future incident with better snacks.

---

### Listing, marketing, and the dispute you are pre-booking

The clever question that performs in a feed is often the dispute waiting to happen. It screenshots well. It settles badly. Compliance tension and resolution UX are the same problem wearing different badges.

If you cannot write a settle explainer without squirming, the market is not ready. If marketing needs a claim that settle cannot support, the campaign is not ready. If eligibility is unclear, acquisition is not ready.

Treat these as one readiness bar:

1. **Settle story** a non-lawyer can repeat in thirty seconds
2. **Eligibility story** that matches what the app will actually allow
3. **Marketing story** that does not promise a product you cannot operate
4. **Support story** for the first three tickets you know you will get

Skip any one and you are borrowing trust from every clean market you have ever shipped.

---

### What "design partner" looks like on a calendar

4 weeks, principle-level, no process dump required.

**Week 3 before ship:** constraints workshop against a strawman listing. What cannot ship, what ships with copy changes, what needs a different market family.

**Week 2:** prototype the 4 unhappy paths. Restricted state, delayed resolve, source conflict, fee visibility. The meeting should hurt slightly, because hurting early is cheaper than hurting in App Store reviews.

**Week 1:** freeze the 4 sentences. Campaign creative locks to them, with no softening in review.

**Ship week:** monitor trust tickets as hard as volume, tagged for price, resolution, surprise and eligibility. What you cannot tag, you cannot learn.

---

### What "done" looks like before growth spends

A market family is not ready when the witty question exists. It is ready when these artifacts can sit in one folder without arguing with each other:

- Settle explainer (thirty seconds, non-lawyer)
- Eligibility and availability copy (including the "no" state)
- Marketing claims list (what you will say; what you will not)
- Support macros for the first trust tickets
- Eng acceptance checks that match the four shared sentences

If growth wants to spend before that folder exists, you are funding a future redesign. Sometimes the business still chooses speed. Fine. Name the debt in the memo. Do not pretend the folder was optional and then act shocked when users feel hustled by inconsistency.

This is also where AI feature requests collide with licensed surfaces. An agent that explains markets inherits every settle and eligibility ambiguity you left fuzzy. Compliance as product input is not only for listings. It is for anything that speaks to users near money.

---

### The Monday decision

When the roadmap item is "launch this market family," do not start with the witty question.

Start with structure. Who can trade, how it settles, what you may say, and what the app shows when the answer is no. Bring compliance a prototype rather than a PDF, and bring the unhappy paths. Make the meeting slightly uncomfortable on purpose.

Then ask 1 schema question: is jurisdiction a field on the market object, or a flag? If it is a flag and you already have 2 jurisdictions, you are carrying the debt now. It cost me 3 months of somebody else's Q2.

---

### Takeaway

Compliance is a product input, and the 6 dates above are why.

Before the next listing: structure first, so eligibility and settle and marketing claims are features. Narrate constraints, because silence feels extractive and clarity feels like a standard. Write the 4 shared sentences for list, restrict, resolve and refuse. Prototype the unhappy paths with compliance before the campaign, not after.

Design the fun market first and ask legal later and you do not get a delay. You get a redesign.
