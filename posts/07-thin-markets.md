---
title: "3 of 13 questions were too thin for a linter to even read"
slug: 07-thin-markets
pillar: field-notes
section: markets
status: ready
derivedFrom: articles/06-dead-markets-poison.md
publishAt: 2026-08-25T01:00:00Z
platforms: linkedin
tags: markets, liquidity, product
---

<!-- EVIDENCE
Claim: Thin markets do not sit harmlessly in the catalogue. They teach the whole venue that prices are decorative, and the damage lands on the liquid markets next to them.
Moment: Running my scanner and watching 3 of 13 questions come back with the same note, too thin to analyse, under 25 words, which is exactly the length that a listing pipeline optimised for volume produces.
Numbers: 3 of 13 fixtures under 25 words and scored at the floor, 13 questions scanned, 15 rules, 1 question at 67 of 100, roughly 1 second to run the whole scan.
Names: tools/resolution-risk, npm run risk, exit liquidity, listing bar.
Cost: My essay on this subject scored 3.2 specifics per 100 words against a bar of 6, and failed the receipts check outright. I had written 1,539 words on market quality with nothing in them a reader could check.
Counterexample: Some thin markets are worth carrying. A new category has to start illiquid, and killing everything below a volume line means never launching anything new. The distinction is whether the thinness is disclosed or disguised.
Reader action: Count how many of your listed markets a user could exit within an hour at a price they would accept. Publish the count internally before growth asks for more listings.
-->

## Draft

3 of the 13 questions I scanned were too thin for a linter to read.

Under 25 words each. 0 named sources, 0 tie clauses, nothing to analyse. The 15 rules in tools/resolution-risk scored them at the floor and said why, which is more feedback than most of them would get before listing.

"Will the merger close?" was 1 of the 3. 4 words of question, 0 words of criteria, and it would have listed on a Tuesday because the calendar looked empty and someone needed the catalogue to feel full.

Here is the part that gets missed. A thin market is not a neutral row in a list. It is a lesson, and it teaches in 1 session.

A user taps in, cannot exit at a price they would accept, and learns something about the venue rather than about that 1 question. They do not conclude the market was thin. They conclude the prices are decorative. Then they carry that conclusion to the liquid market beside it, the one a team spent a quarter making good.

40 decorative questions do not add up to a catalogue. They subtract from the 3 that work.

I wrote 1,539 words on this before I wrote 15 rules that catch it. My own gate scored that essay at 3.2 specifics per 100 words against a bar of 6, and failed it on receipts. The essay was right and unusable, which is its own kind of wrong.

Fewer markets that behave like markets. A listing bar a growth target cannot quietly lower. And when something is thin, say so, because silence is UX too and people fill silence by assuming you are hiding something.

The 1 number I would put on a wall: how many listed markets can a user exit within an hour at a price they would accept.

Takeaway: a market you would not take the other side of is not inventory, it is a warning.

## First comment

The scanner that produced these scores, with the rule table and the fixtures: github.com/JamesLiuZX/linkedin-operator-notes/tree/master/tools/resolution-risk

Longer version, including what a dead market does to the markets beside it: /markets/06-dead-markets-poison
