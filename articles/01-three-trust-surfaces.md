# People don’t quit because they lost. They quit because they felt hustled.

I used to think prediction market product work was mostly about listings and liquidity programs. Get the questions people care about, keep the book alive, ship the campaign around the event. That stuff matters. It is also the part everyone already knows how to argue about in a roadmap meeting.

What actually decides whether someone comes back is quieter.

A user can lose money and stay. Plenty do. What they will not forgive is the feeling that the venue was uneven — that the price was fake, the settle was slippery, or the app surprised them after they had already committed. In markets, that feeling is fatal. It does not show up as a clean “trust score” in Amplitude. It shows up as silence.

I think about this as three surfaces. Not because frameworks are impressive. Because when something breaks, you need to know which surface leaked, or you will fix the wrong thing.

---

### 1. The price has to feel real

Users are not reading your depth charts. They are asking a simpler question: if I tap here, am I a participant or a mark?

Dead markets teach the wrong lesson fast. Wide spreads, ghost mids, inability to exit without eating glass — the UI can be beautiful and the product still feels like a toy. Teams respond by listing more markets, which often makes it worse. You trade one liquid question people understand for forty thin ones that exist to fill a content calendar.

If I am prioritizing, I would rather have fewer markets that behave like markets. Maker incentives, listing bars, and the courage to kill decorative inventory are product decisions, not finance chores. And if a market is thin, say so. Silence is also a UX. People fill silence with the assumption that you are hiding something.

---

### 2. Resolution is UX, whether legal likes that sentence or not

This is the surface product teams duck because it looks like ops.

People accept losing. They do not accept not understanding why. Ambiguous rules are not a “we’ll clarify if it comes up” item. They are a defect with a financial blast radius. Clever question wording that performs well in a growth channel is often the seed of a dispute.

The standard I want before something lists: named source of truth, what happens if that source is late or conflicts, and a plain-language settle explainer a non-lawyer can read in thirty seconds. If you cannot write that explainer without squirming, the market is not ready. Ship it anyway and you are borrowing trust from every clean settle you have ever done.

Venue architecture differs — committees, oracles, challenge windows — but the user does not care about your stack diagram. They care whether the outcome felt inevitable in retrospect, or negotiable.

---

### 3. The app has to stop surprising people

Fees that only become obvious after confirm. PnL that does not match mental math. Orders that hang during the only five minutes anyone cared about. A resolve with no notification. A restriction that appears with no explanation.

None of these are “polish.” In a social app, surprise is annoying. In a market, surprise reads as extractive. Users do not distinguish between eng latency, compliance holds, and product copy failures. They experience one brand that might jerk them around.

I have started treating “surprised by numbers” and “surprised by availability” as P0 bug classes, same family as broken settles. If your support tags cannot attribute tickets to price quality, resolution, or integrity, you will keep shipping campaigns on top of a leak.

---

### The only roadmap question I trust

Campaigns amplify whatever you already are. Marquee events make this obvious. The stadium fills, the charts look like product-market fit, and then Tuesday arrives. If Tuesday is empty, you did not build a venue. You rented an audience.

So when a roadmap item shows up — new game mode, new reward, new tab, new AI wrapper — I ask one question:

Does this make prices feel realer, settles feel cleaner, or the app feel less surprising?

If the honest answer is no, it is probably decoration for a spike. Decoration can be fine. Just do not confuse them with the work that keeps the user who lost fairly and still opened the app the next week.

That user is the whole game. Everyone else is traffic.
