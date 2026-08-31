---
title: "Reach has an exit tax"
slug: 14-reach-has-an-exit-tax
author: James Liu
series: Market Ops Notes
section: growth
summary: "A link in a LinkedIn post's body costs the post about 60% of its reach. Not the topic, not the writing, the link's address. Move it to the first comment and change nothing else."
status: compliance-checked
publishAt: 2026-08-08T07:15:00Z
platforms: twitter, medium, substack
tags: growth, linkedin, distribution, content-ops
twitterExcerpt: "An outbound link in a LinkedIn post's body costs roughly 60% of its reach. The fix changes nothing about what the post says, only where the link sits."
---

<!-- EVIDENCE
Claim: LinkedIn's reach signals reward when and how a post is delivered, not what it argues, and the two costliest formatting mistakes, an outbound link in the body and a slow-to-engage opening, are both about delivery mechanics that have nothing to do with the argument's quality.
Moment: Rereading research/SOURCES.md's LinkedIn distribution table while writing this piece and noticing the whole rule set collapses into one instruction: change nothing about the writing, change only the delivery.
Numbers: dwell of 0 to 3 seconds correlates with a 1.2% engagement rate; dwell of 61 or more seconds correlates with 15.6%, about 13 times higher (DataSlayer). A comment counts roughly 2x a like in the ranking signal, and substantive multi-sentence comments are weighted well above that (SocialBee). An outbound link placed in the post body costs roughly 60% of the reach the same post would get without it (GrowLeads). The golden hour, the first 60 minutes after posting, is treated as a core reach signal.
Names: LinkedIn, DataSlayer, SocialBee, GrowLeads.
Cost: I have not run a controlled test on my own posts confirming these numbers transfer exactly to this account; they are platform-analytics-vendor-reported mechanics, not something I measured myself. Vendor-reported algorithm behavior is also the kind of number that goes stale fastest as a platform ships changes, so treat the specific percentages here as directional and re-verify before leaning on them a year from now.
Counterexample: none of this matters for a post nobody would finish regardless of delivery. Mechanics multiply an argument that already works. Optimizing delivery on a post with nothing checkable in it is polishing the container, and a 13x dwell multiplier cannot rescue a piece that has no receipt in it.
Reader action: move today's outbound link from the post body to the first comment, and do not touch the writing to compensate for it.
-->

# Reach has an exit tax

A link in the body of a LinkedIn post costs that post roughly 60% of its reach, compared to the identical post with no link in it. Not a worse topic. Not worse writing. Four inches of placement, body versus first comment, is the entire difference, and it is worth more than most of the 3 or 4 edits a typical rewrite makes.

That number comes from GrowLeads' analysis of the platform's 2026 behavior, and it sits next to a short table of 6 similar findings in this repo's own research file, `research/SOURCES.md`, the one every published number here is required to trace back to. Turn 60% less reach into people instead of a percentage: a post that would have reached 10,000 accounts with no link reaches roughly 4,000 with one, a loss of 6,000 people for the price of one address moved four inches down the page. Reread the whole table in one sitting and a pattern falls out that is easy to miss reading each row alone: every mechanic in it is about delivery, not content. LinkedIn is not telling anyone what to write differently. It is telling you where to put the parts of the post that are not writing at all.

## The three mechanics, read together

Dwell time is the clearest one. A post that holds a viewer for 0 to 3 seconds correlates with a 1.2% engagement rate. One that holds a viewer past 61 seconds correlates with 15.6%, close to 13 times higher, per DataSlayer's February 2026 breakdown of the algorithm. That is not "write more engaging sentences," it is a statement about how long someone's eyes stay on the screen before scrolling past, which line breaks, paragraph length, and a demo GIF instead of a static screenshot all influence without changing a single claim in the post.

Comments are the second mechanic, and the weighting is specific: a comment counts roughly twice a like in the ranking signal, and a substantive, multi-sentence comment is weighted well above a one-word one, according to SocialBee's breakdown, while a generic "Great post!" is flagged as inauthentic and effectively discounted. Run the multiplier on two hypothetical posts: one earning 60 likes and 4 one-word comments scores lower, on this weighting, than one earning 45 likes and 15 substantive comments, a 15-point gap in raw likes that the comment math erases and then reverses. That changes what a call to action should ask for, a real question with a specific answer rather than a request for a like, but it still says nothing about the argument underneath.

The link penalty is the third, and the biggest single number in the table: roughly 60% less reach for a post with an outbound URL in the body, per GrowLeads' 2026 analysis. The mechanism is not mysterious. LinkedIn's ranking rewards time spent on the platform, and a link is an invitation to leave it. `WRITING.md`, this repo's own voice contract, states the fix in one line: "Outbound links in the body suppress distribution and the proof link is worth more than the click it would have bought." Eight of the 29 rows in `content/schedule.json`, the file that plans every post this account ships, carry a `linkInComment` field instead of a URL anywhere near the `hook` line, which is the rule enforced as a data-entry habit, not just an essay's advice.

## What actually changes, and what does not

The fix for the link penalty is not to stop linking. It is to move the link to the first comment, post it immediately after the post itself goes live, and let the body read as a complete, self-contained argument with nowhere it needs the reader to go. This repo enforces the rule mechanically rather than trusting memory: `scripts/content-check.mjs`'s "links" check fails a LinkedIn atom outright if a URL sits anywhere in the body, and `WRITING.md`'s own format spec puts the same rule in writing, a `## First comment` section, separate from the `## Draft` section that is the only part that gets pasted. A blunt automatic check beats a habit, because a habit is the thing that slips on the one post posted in a hurry. The golden hour matters here too: the first 60 minutes after posting is treated as a core reach signal, which is the actual reason this repo's own publishing notes say to land a post 30 to 60 minutes before a window you can spend replying, not a vague sense that mornings perform better. Presence in the first hour drives early comments, early comments compound through the 2x weighting, and the combination is what the platform reads as a post worth showing to more people, all before the writing itself enters into it at all.

None of this is a reason to write worse, and it is worth stating as a rule rather than a suggestion, because the mechanics create a real temptation to let them. A hook engineered purely for the first 3 seconds, with nothing behind it, will show the same 1.2%-versus-15.6% pattern on the way down as it does going up: strong dwell on the promise, a collapse the moment the post fails to deliver on it. The mechanics measure attention, not quality, and attention earned by a promise the post does not keep is attention that reports back to LinkedIn as a bad outcome the next time that account posts.

## The counterexample

Every mechanic above assumes the post is worth finishing in the first place. Move a link to the first comment on a post that says nothing checkable and the 60% penalty disappears while the underlying problem, nothing in the post a stranger could verify, stays exactly where it was. A 13x dwell-time multiplier does not create a receipt that was not in the writing to begin with, and a 2x comment weighting does not make an unsubstantiated claim more true. Delivery mechanics are a multiplier on an argument, and a multiplier on zero is zero. The order of operations matters: fix the writing first, against whatever quality bar the account actually holds itself to, and only then spend effort on where the link sits and when the post goes up.

## What to check Monday

Take the next 1 or 2 posts already queued and check exactly one thing: is there a URL anywhere in the body. If there is, move it to a first comment, published the moment the post goes live, and change nothing else about the text. That single edit, on this data, is worth more reach than most rewrites: a 60% recovery on distribution for zero words changed, against a rewrite that might buy back 2 or 3 points of density if it goes well. It is also the cheapest test in the whole table to run, a 2-minute formatting decision, a before-and-after on the same account, no new draft required.

Takeaway: LinkedIn's reach signals are instructions for delivery, not for writing. Fix where the link sits and when the post goes up before touching a sentence, and let the writing stand or fall on what it actually says.
