---
title: "I built a linter for market resolution criteria"
slug: 09-resolution-linter
section: markets
pillar: markets
format: demo
status: ready
derivedFrom: articles/07-the-sentence-is-the-product.md
demo: resolution-linter
linkInComment: /demos/resolution-linter
---

<!-- EVIDENCE
Claim: Most prediction market disputes are writing failures, and they are catchable by a checklist.
Moment: Reading the Ukraine minerals market resolution text and realising the whole dispute lived in the word "credible".
Numbers: 9% to 100% in 24 hours; 5M UMA = 25% of the vote; 3/100 lint score; 95/100 after rewrite; 16 rules.
Names: Polymarket, UMA, Ukraine minerals market, Strategy, Bureau of Labor Statistics.
Cost: I have written criteria this loose. The "credible reporting" line is one I would have shipped two years ago.
Counterexample: Over-tight criteria that nobody trades. The CPI market scores 100 and is also boring.
Reader action: Run your next market's resolution text through the 6 clause checks before it lists.
-->

## Draft

I ran two real prediction markets through a linter. Both failed.

Not close calls. The Ukraine minerals market scored 3 out of 100.

That market moved from 9% to 100% between 24 and 25 March 2025 and resolved YES with no agreement reached. The attacker's 5M UMA made up about 25% of that round's vote.

Everyone called it an oracle attack. Read the text again:

"This market will resolve YES if Ukraine officially agrees to the minerals deal before April. The resolution will be determined by credible reporting."

Three undefined words. "Officially." "Before April." "Credible."

The oracle did not fail. The sentence gave it nothing to test, so the result went to whoever voted hardest.

So I wrote 16 rules and pointed them at the text instead of the outcome. No model call. Regex and a clause checklist.

The rules look for six things that must be present: a named source, a timezone, a fallback if the source fails, a void rule, edge cases, and a comparison operator on any threshold.

Then they look for the constructions that always precede a dispute. Subjective adjectives. Passive verbs with no actor. "Before" with no instant. AND and OR sharing a sentence, with no brackets.

The rewrite of that same market scores 95.

Same event. Same oracle. Same traders. The only thing that changed was the sentence.

The uncomfortable part: I have shipped criteria this loose. "Credible reporting" is a phrase I would have waved through two years ago because it sounded careful.

Takeaway: write the settle explainer before the market lists. If it makes you squirm, the sentence is not finished.

## First comment

Try it: /demos/resolution-linter

The longer version of the argument: /markets/07-the-sentence-is-the-product
