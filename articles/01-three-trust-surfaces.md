---
title: "People don’t quit because they lost. They quit because they felt hustled."
slug: 01-three-trust-surfaces
author: James Liu
series: Market Ops Notes
hero: "https://images.unsplash.com/photo-1761396677022-3678bcb336f0?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTY5MDQ4fA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80"
heroAlt: "Empty soccer stadium with red seats and lights"
---

# People don’t quit because they lost. They quit because they felt hustled.

<figure>
<img src="https://images.unsplash.com/photo-1761396677022-3678bcb336f0?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTY5MDQ4fA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="Empty soccer stadium with red seats and lights" />
<figcaption>The stadium after the final. This is what your retention cohort looks like when trust leaked and the crowd was only rented.</figcaption>
</figure>

Here’s the part nobody puts in the launch deck: users will forgive a bad beat. They will not forgive feeling played.

I’ve watched people lose money and open the app the next morning. I’ve also watched people win once, feel something off about the venue, and never come back. Same balance change. Opposite story in their head.

That gap is the whole product.

Retention in prediction markets is not mainly a “more markets” problem. It’s a trust problem that shows up in three boring places. When something breaks, you need to know which surface leaked. Otherwise you ship another campaign on top of a hole.

---

### The user who tells the truth about your product

Forget the whale. Forget the screenshot farmer. Forget the person who only shows up when the world is watching.

Think about one person.

They put real money on a question they understood. The price moved against them. They lost. Fairly. No mystery. No gotcha. And somehow they still trust the room enough to come back on a quiet Tuesday.

That person is your real retention cohort. Everyone else is traffic.

Most roadmaps are built for traffic. Traffic claps during the spike. Your cohort decides whether you have a venue or a pop-up.

So the question is not “how do we get more people in the door?” The question is: what would make the fair loser stay?

In practice, trust fails on three surfaces. Not in a brand workshop. In the five minutes after someone commits money.

---

### 1. The price has to feel real

<figure>
<img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTY5MDQ4fA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="stock market candlestick chart on dark screen" />
<figcaption>What is: a chart that looks like a market. What could be: a price you can enter and exit without feeling like exit liquidity.</figcaption>
</figure>

Nobody is studying your depth chart for fun. They’re asking a simpler question: if I tap here, am I in the game, or am I the exit liquidity?

Dead markets teach that lesson in one session. Fat spreads. Ghost mids. You can’t get out without eating glass. The UI can look expensive and the product still feels like a toy.

**What teams ship:** more listings, because the calendar looks empty and growth wants “content.”

**What users learn:** this place is decorative. The number on the screen is not a price. It’s a suggestion with teeth.

The usual response is to list more stuff. That usually makes it worse. You trade one liquid question people understand for forty thin ones that exist to fill a slide.

I’d rather ship fewer markets that behave like markets. Maker incentives, listing bars, killing decorative inventory: those are product calls, not finance chores. And if a market is thin, say so. Silence is UX too. People fill silence by assuming you’re hiding something.

**Operator test:** Would you put your own money in, knowing you might need to exit in the next hour? If the honest answer is “only if nothing moves,” you don’t have a market. You have a prop.

---

### 2. Resolution is UX (yes, even if legal owns the doc)

<figure>
<img src="https://images.unsplash.com/photo-1589391886645-d51941baf7fb?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTY5MDQ5fA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="wooden gavel and block on marble" />
<figcaption>People accept the verdict. They do not accept a verdict that feels negotiable after the fact.</figcaption>
</figure>

This is the surface product teams duck because it looks like ops.

People accept losing. They do not accept not knowing why. Fuzzy rules are not a “we’ll clarify if it comes up” ticket. They’re a defect with a financial blast radius.

The clever question that performs in a growth channel is often the dispute waiting to happen. It screenshots well. It settles badly.

**What is:** a market copy that sounds sharp in a feed, a resolution doc written for lawyers, and a support queue that inherits the gap.

**What could be:** a settle story so boring that nobody argues. Named source of truth. What happens if that source is late or conflicts. An explainer a normal person can read in thirty seconds.

My bar before something lists: if you can’t write that explainer without squirming, the market isn’t ready. Ship it anyway and you’re borrowing trust from every clean settle you’ve ever done. One messy outcome can spend that balance faster than a quarter of good ones can rebuild it.

Committees, oracles, challenge windows: users don’t care which architecture you picked. They care whether the outcome felt inevitable afterward, or negotiable.

**Operator test:** Hand the settle explainer to someone outside your team. Give them thirty seconds. Can they tell you how it resolves, and what happens if the source flakes? If they shrug, the market is not ready. Your legal doc is not a product.

---

### 3. The app has to stop surprising people

<figure>
<img src="https://images.unsplash.com/photo-1600856209923-34372e319a5d?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTY5MDUwfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="person holding blue light in dark room" />
<figcaption>In a social app, surprise is annoying. In a market, surprise feels extractive. Same pixel. Different moral.</figcaption>
</figure>

Fees that only show up after you confirm. PnL that doesn’t match the math in your head. Orders that hang during the only five minutes anyone cared about. A market resolves and nobody tells you. A restriction appears with no explanation.

In a social app, surprise is annoying. In a market, surprise feels extractive.

Users don’t split “eng latency” from “compliance hold” from “bad copy.” They experience one brand that might jerk them around. Your org chart is invisible. Their stomach is not.

**What teams debate:** which squad owns the ticket.

**What the fair loser feels:** I committed, then the venue moved the floor.

I treat “surprised by numbers” and “surprised by availability” like P0s, same family as a bad settle. If your support tags can’t point tickets at price quality, resolution, or integrity, you’ll keep pouring growth on a leak you refuse to name.

**Operator test:** List every place the app can change the user’s expected money, access, or outcome after they’ve already committed. For each one, ask: did we explain it before the tap, or only after the flinch? After is too late.

---

### The only roadmap question I trust

<figure>
<img src="https://images.unsplash.com/photo-1542081403278-ba5973c25c7a?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTY5MDUwfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="empty office room" />
<figcaption>Tuesday. No parade. No final. Just the product you actually built.</figcaption>
</figure>

Campaigns amplify whatever you already are. Big events make that obvious. The stadium fills, the charts look like product-market fit, then Tuesday shows up.

If Tuesday is empty, you didn’t build a venue. You rented a crowd.

So when a roadmap item shows up (new game mode, new reward, new tab, new AI wrapper), I ask one thing:

Does this make prices feel more real, settles feel cleaner, or the app feel less surprising?

If not, it’s probably decoration for a spike. Decks are fine. Just don’t confuse them with the work that keeps the person who lost fairly and still opened the app next week.

Picture the other world for a second. Fewer markets, each one exit-able. Settles so plain they bore Twitter. An app that never flinches after the tap. Growth still matters. It just stops being a coat of paint on a hole.

That person who lost fairly and came back? They’re not a metric. They’re the proof you built something that deserves a second session.

That person is the whole game. Everyone else is traffic.

---

### Takeaway

Users don’t churn because they lost. They churn because the venue felt uneven.

Before you ship the next growth idea, pressure-test the three surfaces:

1. **Price:** Does this market feel fair to enter and exit?
2. **Resolution:** Could a non-lawyer explain how it settles in 30 seconds?
3. **Surprise:** Where might the app feel extractive after someone has already committed?

If you only remember one line, make it this: build for the user who lost money fairly and still came back. That’s the cohort worth growing.
