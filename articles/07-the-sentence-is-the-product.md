---
title: "The sentence is the product"
slug: 07-the-sentence-is-the-product
author: James Liu
series: Market Ops Notes
section: markets
summary: "Most prediction market disputes are not oracle failures. They are writing failures, and they are catchable by a checklist."
status: draft
publishAt: 2026-08-04T01:00:00Z
platforms: twitter, medium, substack
tags: markets, resolution, product
twitterExcerpt: "The oracle was right. The sentence was wrong."
demo: resolution-linter
---

<!-- EVIDENCE
Claim: Most prediction market disputes are caused by resolution text with no test in it, not by oracle mechanism failure.
Moment: Reading the Ukraine minerals resolution text after the fact and finding the entire dispute sitting inside the word "credible".
Numbers: 9% to 100% between 24 and 25 March 2025; 5M UMA cast, 25% of the round; $60M+ Strategy dispute; WSJ May 2026 found >50% of votes in most disputed markets from the 10 largest wallets and >=60% of active voters linked to live Polymarket accounts; lint scores 3/100 and 95/100; 16 rules; 6 required clauses.
Names: Polymarket, UMA, DVM, Kalshi, Strategy, Bureau of Labor Statistics, Wall Street Journal.
Cost: I have written "as determined by credible reporting" into a live market. It read as careful. It was an unwritten rule.
Counterexample: Criteria so tight the market is unattractive. A perfectly specified question nobody wants to trade is also a failure, and the CPI example scores 100 while being boring.
Reader action: Run the six clause checks on the next market before it lists.
-->

# The sentence is the product

The oracle was right. The sentence was wrong.

On 24 March 2025 a Polymarket contract asking "Will Ukraine agree to Trump's mineral deal before April?" moved from 9% to 100% inside a day and resolved YES. No agreement had been reached. An attacker cast 5M UMA, about 25% of the votes in that resolution round.

The story everyone told was governance capture. It is a real story. A Wall Street Journal investigation in May 2026 found that in most disputed Polymarket markets, more than half the votes came from the ten largest wallets, and at least 60% of active UMA voters could be linked to live Polymarket accounts. Those are alarming numbers and they deserve the attention they got.

But read the resolution text.

"This market will resolve YES if Ukraine officially agrees to the minerals deal before April. Otherwise it will resolve NO. The resolution will be determined by credible reporting."

Three undefined words carrying the entire contract. Officially. Before April. Credible.

An attacker did not have to corrupt a mechanism designed to find truth. The mechanism was handed a sentence with no test in it, and asked to vote on what it meant. A sentence with no test resolves to whoever votes hardest. That is not a bug in token voting. That is what token voting does when the input is empty.

## The gap between the event and the words

Here is the distinction that matters and almost nobody makes.

There are two ways a market can settle wrong. The world can be unclear, or the words can be unclear. Only one of those is your fault.

When the world is genuinely unclear, a good venue has an answer ready. UMA can settle a fundamentally ambiguous market 50-50. That is a reasonable fallback and it is honest about what happened.

But a 50-50 settlement is the oracle telling you the sentence was unwriteable. Nobody was wrong about the world. Someone was wrong about the words, and that someone works at the venue.

The $60M dispute over whether Strategy sold Bitcoin in May is the same shape. The market asked whether Strategy would "sell any significant amount" of its holdings. Significant. There is no filing anywhere that reports significance. There is a filing that reports a number, and the market could have asked about the number.

## What actually goes wrong

I stopped treating this as a legal problem and started treating it as a linting problem, because the failures repeat. After going through enough of them, they fall into two families.

The first family is absence. Something that must be in the text is not there.

A named source of truth. If the words do not say who decides, the resolver decides, and after money is committed everyone discovers they had different assumptions about who that was.

A timezone. A market that closes "on 31 March" closes at different instants for the trader in Singapore, the source in Washington, and the resolver wherever they are. Disputes cluster in that gap because that is where the boundary cases live.

A fallback for source failure. Sources get delayed, revised, paywalled and retracted. If the text is silent about that, each one becomes a judgement call made under pressure by someone with a position.

A void rule. What happens when the event simply does not occur.

Edge cases for the domain. In sports that means postponement, abandonment, forfeit, walkover and extra time. Over a season these are not rare events, they are the single largest steady source of settlement tickets.

A comparison operator on any threshold. "Above 3%" and "at or above 3.0%" differ on exactly the case that will be disputed.

The second family is presence. Something is in the text that should not be.

Subjective adjectives doing load-bearing work: significant, material, widely, credible, successful. These feel precise while carrying no test, which is the worst possible combination, because they pass review.

Passive verbs with no actor. "Is deemed" by whom. The passive voice hides the exact fact the resolver needs.

Unbounded time. Soon, eventually, by year end.

Announcement and completion conflated. A deal announced is not a deal signed is not a deal closed, and a market that does not pick one settles on whichever the largest holder argues for.

AND and OR in one sentence with no grouping. "A and B or C" has two readings. Traders price one, the resolver applies the other.

## So I built the linter

Sixteen rules, each mapped to one of those classes. No model call. Regex, a clause checklist, and a scoring function, because the point is that this class of failure is catchable by a checklist that nobody runs, and adding an LLM would obscure that rather than prove it.

The Ukraine market scores 3 out of 100.

Then I rewrote it. Same event, same oracle, same traders:

> Resolves YES if, at or before 23:59:59 UTC on 2026-03-31, the Cabinet of Ministers of Ukraine publishes a signed bilateral minerals agreement with the United States on kmu.gov.ua, or the US Department of State publishes the executed text on state.gov.
>
> Announcement is not sufficient. A signed and published document is required.
>
> If neither source has published by the deadline, this market resolves NO. This market does not void.

That scores 95.

The rewrite is longer, uglier, and impossible to argue with. All three are features. Resolution text is not prose. Repetition is correct there, and elegance is a tell that someone was writing for a reader instead of for a dispute.

## The counterexample, because there is one

Tighter is not monotonically better, and I want to be honest about where this argument breaks.

You can specify a question so narrowly that nobody wants to trade it. A market with eleven clauses covering every branch is unambiguous and also unappealing, and an unappealing market is thin, and a thin market teaches users the venue is decorative. That is a different failure with the same root: the sentence.

The control example in the linter is a CPI print. It scores 100 out of 100 and it is genuinely boring to read. That is the right trade for a macro market where the audience is comfortable with precision. It would be the wrong trade for a culture market where the audience is there for the question, not the mechanism.

So the bar is not maximum specification. The bar is that every branch a trader could plausibly argue about has an answer written down before listing, in language a normal person can check.

## What to do on Monday

Take the next market on your listing calendar. Before it goes live, run the six absence checks: source, timezone, source failure, void, domain edge cases, comparison operator.

Then hand the settle explainer to someone outside your team and give them 30 seconds. Ask them two questions. How does this resolve, and what happens if the source is late. If they shrug, the market is not ready, and your rules document is not a product.

The honest admission: I have written "as determined by credible reporting" into a live market. It read as careful and appropriately humble about a fast-moving situation. It was an unwritten rule wearing the costume of a written one, and I would have defended it in review.

The disputes that cost the most are rarely about mechanism design. They are about a sentence somebody wrote quickly on a Thursday because the market needed to list on Friday.

Takeaway: if you cannot write the settle explainer without squirming, the market is not ready to list, and no oracle will save you from your own sentence.
