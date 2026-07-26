---
title: "The PM who opens PRs"
slug: 02-pm-opens-prs
section: agents
pillar: agents
format: build log
status: draft
---

<!-- EVIDENCE
Claim: The useful AI upgrade to PM work is shortening the loop between taste and implementation, not writing better PRDs.
Moment: Prototyping an edge case in an afternoon after three weeks of failing to describe it in a doc.
Numbers: 14 pull requests last quarter, none of them features; 3 weeks of spec revisions replaced by one afternoon; 2 PRs created review debt; 1 reverted.
Names: Cursor, Claude Code.
Cost: Two of those PRs created review debt for someone else. One was reverted, correctly.
Counterexample: Anything touching the order path. A PM prototype near matching logic is a liability, not a contribution.
Reader action: Prototype the edge case instead of writing the third revision of the paragraph describing it.
-->

# The PM who opens PRs

I opened 14 pull requests last quarter. None of them were features.

Internal tooling, a seed-data script, and 3 fixes to copy that was wrong in a way only someone reading 200 support tickets a week would ever notice.

For years "technical PM" meant writing crisp specs, knowing enough SQL, and sitting quietly in architecture reviews. Useful. Incomplete.

What changed with Cursor and Claude Code is the loop between having taste about something and finding out whether it survives contact with the code.

I spent 3 weeks on revisions of one paragraph describing an edge case in a settlement flow. Nobody could agree on what I meant. I built it in an afternoon instead, and the disagreement resolved in about four minutes, because everyone was finally looking at the same broken screen.

That is the whole benefit. Not velocity. Shared reference.

The failure mode is obvious and I walked straight into it. Two of those 14 PRs created review debt for an engineer who had better things to do that week. One got reverted, correctly, because I had not thought about the migration path. That is a 14% waste rate, and I was wrong to treat it as a rounding error at the time.

So the rules I run now.

Prototype to learn, and throw most of it away.

Open a PR only when the change is scoped, reviewable, and boring.

Never touch the order path. A PM prototype near matching logic is a liability wearing a helpful face.

The point was never that PMs should become engineers. It is that my strategy docs got honest faster, because I had to confront what actually worked instead of describing what should.

Takeaway: build the edge case instead of writing the third revision of the paragraph describing it.
