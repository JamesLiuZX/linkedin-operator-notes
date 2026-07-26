---
title: "Jurisdiction is a field, not a flag"
slug: 09-jurisdiction-is-a-product-field
author: James Liu
series: Market Ops Notes
section: shipping
summary: "Two federal appeals courts disagree about the same contract. That is not a legal footnote, it is a schema decision you make once."
status: draft
publishAt: 2026-09-29T01:00:00Z
platforms: twitter, medium, substack
tags: shipping, compliance, regulation
twitterExcerpt: "The Third Circuit said swaps. The Ninth may not. Your data model has to agree with both."
---

<!-- EVIDENCE
Claim: Regulatory position on the same contract differs by circuit and changes mid-quarter, so jurisdiction has to be a first-class field in the market model rather than a launch-time configuration flag.
Moment: Reading the Third Circuit and Ninth Circuit dockets in the same week and realising the same contract had two legal statuses at once.
Numbers: Third Circuit ruled for Kalshi 7 April 2026; CFTC sued Arizona, Connecticut and Illinois 2 April 2026; Tennessee TRO converted 19 February 2026; Maryland denial 1 August 2025; Ninth Circuit heard Nevada 16 April 2026; CFTC proposed rule 10 June 2026 revising Rule 40.11; 3 months of retrofit against 3 days.
Names: CFTC, Kalshi, Polymarket, Third Circuit, Ninth Circuit, Commodity Exchange Act, Rule 40.11.
Cost: I designed a market model with jurisdiction as a config flag. Retrofitting took 3 months of engineering time that should have been 3 days of schema design.
Counterexample: A single-venue operator under one regulator should absolutely use a flag. Modelling for jurisdictions you do not have is waste.
Reader action: Put jurisdiction on the market object before the second jurisdiction exists.
-->

# Jurisdiction is a field, not a flag

Two federal appeals courts disagree about the same contract.

On 7 April 2026 the Third Circuit ruled for Kalshi, holding that sports event contracts are swaps under the Commodity Exchange Act and therefore federally preempted. On 16 April 2026 the Ninth Circuit heard Nevada's appeal, and the panel did not obviously read it the same way.

Around those two dates: the CFTC sued Arizona, Connecticut and Illinois on 2 April 2026 seeking to block state enforcement. A Tennessee court converted a restraining order into a preliminary injunction on 19 February 2026. A Maryland court had denied Kalshi the same relief on 1 August 2025, finding state gaming authority could coexist with CFTC regulation. On 10 June 2026 the CFTC issued a new proposed rule revising Rule 40.11.

Six dates. Eighteen months. One contract type.

If you build market products, the temptation is to read that as news and move on, because it is somebody else's department. I want to argue it is a schema decision, and one you get exactly one cheap opportunity to make.

## The flag and the field

Most market products start with 1 boolean somewhere. `available: true`. Then a market launches in a second country and it becomes `availableRegions: ["US", "SG"]`. Then a state carves out and it becomes a list of exclusions. Then a category is fine in the Third Circuit and contested in the Ninth, and the list stops being able to express the thing.

The failure is not that the list gets long. It is that the list is attached to the wrong object.

Availability is a property of the pair (market, jurisdiction), not of the market. Once you accept that, 4 downstream questions get obvious answers. Which resolution source is authoritative here. Which disclosures show before the tap. What the fee display says. Whether the category can be marketed at all, which is a separate question from whether it can be traded.

All 4 vary by jurisdiction, and all 4 are things a user sees.

When jurisdiction is a flag, each one gets answered by a conditional somewhere in the rendering path, written by whoever held that ticket that week. 6 months later nobody can answer "what does a user in Nevada see" without reading code, and "show me every market available in Illinois" costs an engineer 2 days.

When jurisdiction is a field on the market object, that question is a query that runs in 40 milliseconds.

I did not do this. I designed a model where jurisdiction was configuration, and the retrofit took roughly 3 months of engineering time that should have been 3 days of schema design at the start. That is the most expensive mistake in this piece and it was entirely mine.

## Why this is different from ordinary localisation

Teams that have shipped internationally sometimes hear this and think it is solved. Currency, language, date formats, tax display. We have a framework for that.

It is a different problem, and the difference matters.

Localisation varies presentation over a stable product. Jurisdiction varies what the product legally is. The same contract is a swap in the Third Circuit and a contested gaming instrument in Nevada. That is not a display string. It changes the authoritative resolution source, the records you keep, who can hold a position, and whether the market can exist.

The second difference is time. Locales are stable for years. The regulatory position moved 6 times in 18 months in the list above, and 2 of those moves came 9 days apart in April 2026.

A schema that assumes a stable mapping will be wrong on a schedule. You want the mapping to be data, so changing it is a config change reviewed by compliance rather than a deploy reviewed by nobody who understands the legal question.

## What users actually experience

Here is the part product people underweight, and it connects back to trust.

Users do not experience "pending regulatory review". They experience a product that is available here, restricted there, and silent about why. That silence gets filled in with the least charitable available explanation, which is usually that the venue is arbitrary or that it is hiding something.

A restriction with a 1-line reason attached costs almost nothing to build and reads completely differently from the same restriction with no explanation. "Not available in your state while this category is under review" is 12 words. It is also only writeable if the system knows why the market is restricted, which it only does if the reason is a field rather than the absence of a row.

So the schema decision and the trust decision turn out to be 1 decision, reached from opposite directions.

## The counterexample

This argument has an obvious failure mode: building a jurisdiction engine for jurisdictions you do not have.

If you run 1 venue under 1 regulator with no near-term plan to change that, a flag is correct and a general model is waste. I watched a team spend Q3 on a rules engine for a compliance surface with 4 rules in it, all of which fit in a switch statement. The engine still needed a rewrite when the 5th rule arrived, because it had been designed against imagined requirements rather than real ones.

The trigger is not "we might expand one day". The trigger is jurisdiction number 2. At that moment the flag is already technical debt, and the conversion cost grows roughly linearly with how long you wait.

## What to do on Monday

Look at your market object. If jurisdiction is not on it, ask what would have to change for "show me every market tradeable in Illinois today, and why" to be a query rather than an investigation.

Then go find whoever handles regulatory work at your company and ask them one question: what has changed in the last six months that we have not modelled. In most companies that person has been carrying the answer around in their head, waiting to be asked by someone who could act on it.

Bring them a prototype, not a deck. Compliance partners give much better answers to a screen than to a paragraph, for exactly the same reason engineers do.

Takeaway: the second jurisdiction is the moment to make it a field, and every month after that one costs more than the last.
