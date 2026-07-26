---
title: "Compliance is a field in the data model, not a gate at the end"
slug: 05-compliance-as-product
section: shipping
pillar: shipping
format: tradeoff
status: draft
derivedFrom: articles/05-compliance-as-product.md
linkInComment: /shipping/05-compliance-as-product
---

<!-- EVIDENCE
Claim: Jurisdiction has to be a first-class field in the market model, because the legal position genuinely differs by circuit and changes mid-quarter.
Moment: Reading that two federal appeals courts reached different answers on the same contract type.
Numbers: Third Circuit ruled for Kalshi 7 April 2026; CFTC sued Arizona, Connecticut and Illinois 2 April 2026; Tennessee injunction 19 February 2026; Maryland denial 1 August 2025; Ninth Circuit heard Nevada 16 April 2026; CFTC proposed rule 10 June 2026.
Names: CFTC, Kalshi, Third Circuit, Ninth Circuit, Rule 40.11.
Cost: I designed a market model where jurisdiction was a launch-day config flag. Retrofitting it was three months of work that should have been three days.
Counterexample: Over-modelling this early is real waste. If you operate in one venue under one regulator, a flag is correct.
Reader action: Make jurisdiction a field on the market object before the second jurisdiction exists.
-->

# Compliance is a field in the data model, not a gate at the end

Two federal appeals courts disagree about the same contract.

The Third Circuit ruled for Kalshi on 7 April 2026, holding that sports event contracts are swaps. The Ninth Circuit heard Nevada's appeal on 16 April 2026 and the panel did not appear to be leaning the same way.

Meanwhile the CFTC sued Arizona, Connecticut and Illinois on 2 April 2026 to block state enforcement, a Tennessee court granted an injunction on 19 February 2026, a Maryland court denied one on 1 August 2025, and the CFTC issued a new proposed rule on 10 June 2026 revising Rule 40.11.

That is not a legal footnote to read once. It is a product requirement.

The same contract is settled law in one circuit and contested in another, and the answer can change between your spec review and your launch.

Which means jurisdiction cannot be a flag you add on launch day. It has to be a field on the market object, alongside resolution source and settlement time, from the first version.

I did not do this. I designed a model where jurisdiction was configuration, and retrofitting it took three months of work that should have taken three days.

The failure users experience is different from the one lawyers worry about. Users do not experience "pending regulatory review". They experience a product that is available here, restricted there, and silent about why. Silence trains people to assume the venue is arbitrary.

I will say the other side of this, because over-modelling early is genuine waste. If you operate one venue under one regulator, a flag is the right call and I would defend it.

The moment there is a second jurisdiction, the flag is already technical debt.

Takeaway: treat compliance partners like design partners, and bring them a prototype rather than a deck.
