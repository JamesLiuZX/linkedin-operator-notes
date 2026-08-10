---
title: "88% use it. 25% finished integrating it."
slug: 19-88-percent-use-it-25-percent-finished
author: James Liu
series: Market Ops Notes
section: growth
summary: "88% of contact centers use AI in some form. Only 25% have fully integrated it into the actual workflow. The other 63% are the real adoption story: a pilot running next to the real system, not instead of it, counted as a yes on the same survey either way."
status: ready
tags: ai, voice-ai, customer-service, growth
twitterExcerpt: "88% of contact centers use AI. 25% have fully integrated it. Both numbers are true on the same survey, and the 63-point gap between them is the actual adoption story, not the 88%."
---

<!-- EVIDENCE
Claim: The widely cited AI-adoption number in customer service, 88% of contact centers use AI in some form, and the integration number, only 25% have it fully integrated into their workflow, describe the same population. Most of what counts as "adoption" in these surveys is a pilot running alongside the real system, not a replacement for it, and the 2 numbers get quoted separately far more often than they get quoted together.
Moment: Deciding how to write about voice AI for this batch and finding that almost every source citing the 88% figure was a vendor blog with an AI product to sell, while the 25% figure, the less flattering half of the same statistic, showed up mostly as a smaller line further down the same articles.
Numbers: 88% of contact centers use AI in some form; 25% have fully integrated it into their workflow. 67% of Fortune 500 companies run production voice AI systems. 78% of the top 50 banks have deployed a production voice agent for at least 1 customer-facing use case, up from 34% in 2024. Customer satisfaction with AI voice interactions rose from 53% in 2022 to 72% in 2025.
Names: none proprietary; industry-wide adoption figures for AI in contact centers and banking.
Cost: "fully integrated" is not independently defined the same way across every source reporting the 25% figure, so treat it as a directional finding, a wide gap between trial and finished deployment, rather than a single precise, universally agreed threshold.
Counterexample: 78% of the top 50 banks reaching production deployment, up from 34% 2 years earlier, shows integration is not stalled everywhere. Regulated, high-volume, well-resourced deployments close the gap between pilot and production faster than the 25% aggregate suggests; the gap is widest in the median deployment, not the best-resourced one.
Reader action: when a vendor or a team reports "we use AI for X," ask the follow-up the 88/25 split implies: is this the whole workflow, or a pilot running next to the workflow that still exists underneath it. The answer changes what the adoption number is actually telling you.
-->

# 88% use it. 25% finished integrating it.

88% of contact centers use AI in some form. 25% have fully integrated it into their actual workflow. Both numbers come from the same population, are true at the same time, and get quoted separately often enough that most people who have heard the first one have not heard the second. The gap between them, 63 percentage points, is the real adoption story. The 88% is not.

The reason the 2 numbers coexist is that "use AI in some form" is a low bar. A single AI-assisted call-routing step counts. A chatbot handling only the simplest 10% of tickets, with everything else still going to a human exactly as it did before, counts. A pilot running in parallel with the existing system, generating a dashboard nobody has decided to trust yet, counts. None of these are a workflow that has actually changed. They are a workflow that now has an AI feature bolted onto its side, measured and reported honestly as adoption, because by the survey's own definition it is.

## Where the gap actually closes

Not every deployment sits at the median. 78% of the top 50 banks have deployed a production voice agent for at least 1 real customer-facing use case, up from 34% just 2 years earlier, a 44-point jump in a sector known for being conservative about customer-facing automation, not aggressive. And 67% of Fortune 500 companies now run production voice AI systems, not pilots. These are not contradictions of the 88/25 split, they are evidence for what it actually predicts: integration speed tracks resourcing and regulatory pressure, and a well-capitalized bank facing real compliance stakes on every call closes the pilot-to-production gap faster than a team running a side-project chatbot nobody above them is tracking.

That pattern is the more useful number. "We use AI for customer service" from a top-50 bank likely means the 78% story. The same sentence from a smaller team with no comparable regulatory pressure likely means the 88% story: something is switched on, nothing has been displaced.

## Why the flattering number travels further

Satisfaction data adds a second layer worth separating from the adoption numbers. Customer satisfaction with AI voice interactions rose from 53% in 2022 to 72% in 2025, a real, 19-point improvement in how people rate the experience of talking to one. That number is a legitimate reason optimism about voice AI is not baseless. It is also, on its own, uninformative about integration, because a satisfying pilot running next to the main system and a satisfying pilot that has become the main system produce the same customer-facing satisfaction score. The 72% says the technology got better at the interaction. It says nothing about whether the interaction it is having is the whole job or a fraction of it still wrapped around a mostly unchanged human process.

This is why the 88% figure is the one that travels: it is the flattering half of a 2-number statistic, cited constantly by vendors with a product built on exactly this category, and the 25% sits a few paragraphs lower in the same source, quoted far less, saying the less exciting thing.

## A smaller version of the same gap

This repo's own publishing pipeline draws the identical line, at a much smaller scale, on purpose. A post here moves through 5 states: draft, ready, compliance-checked, scheduled, published. "Ready" means only that a mechanical gate, `npm run content:check`, passed it: no banned phrases, enough specific detail, a working hook. It is deliberately not the same claim as "published," which requires a human to have read it again with an employer's risk tolerance in mind and scheduled it for real. A repo that only tracked "ready" versus "not ready" would look far more finished than it actually is, for the same reason 88% looks more finished than 25%: the earlier state is real and worth recording, and it is not the same claim as the later one, and collapsing them into 1 number always flatters the earlier state.

## What to ask instead of the adoption number

Ask what fraction of the relevant call or ticket volume the AI system now handles start to finish, without a human step still sitting underneath it as the actual mechanism. That number is closer to the 25% question than the 88% one, and it is the number that predicts whether the deployment saves the cost or headcount it was pitched on, not whether the org can honestly say yes to "do you use AI here."

A useful second question follows from the bank comparison: what changes if this fails silently at 2am with nobody watching. The 44-point jump from 34% to 78% at the top 50 banks happened because a wrong answer on a real account has a cost someone in that building is personally accountable for, so the pilot did not get to run indefinitely next to the production system. A side-project chatbot with no equivalent accountability has no equivalent pressure to finish, and 63 points of the 88% figure are most plausibly made of exactly that: a pilot with nobody's job depending on whether it ever graduates.

Line the 3 gaps up and the shape repeats: adoption to integration is a 63-point gap, 88% to 25%. Pilot to production in banking closed 44 points in 2 years, 34% to 78%, under real accountability. Interaction quality improved 19 points in 3 years, 53% to 72%, and improved regardless of which side of the other 2 gaps a given deployment sat on. 3 different metrics, 3 different sizes, and only 1 of the 3 tells you whether the workflow underneath actually changed.

Takeaway: adoption and integration are 2 different numbers, 88% and 25% on the same survey, and the flattering one is not the one that predicts whether anything actually changed. Ask which fraction of the real workflow the system now runs unassisted, not whether it is switched on somewhere.
