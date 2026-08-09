---
title: "Same 77-word post. 95/100 on one tool, 66/100 on another."
slug: 17-gate-drift
pillar: agents
section: agents
status: ready
derivedFrom: articles/15-a-checklist-not-a-model.md
publishAt: 2026-08-19T01:00:00Z
platforms: linkedin
tags: ai, agents, content-ops
---

<!-- EVIDENCE
Claim: Two copies of this site's own quality-gate function had quietly drifted apart, disagreeing on which checks ran and how a failure was scored, until they got merged into one shared core.
Moment: Running the same clean 77-word LinkedIn post through both copies while building a paste-anything demo and getting two different scores for identical text.
Numbers: before the merge, one copy ran 11 checks at 14 points per fail, the other ran 21 at 10 points per fail. The same post scored 95 on one, 66 on the other. After merging, the shared core scores it 96; the full gate still scores it 66, now for 3 specific, correct reasons instead of an accident.
Names: Slop Gate, scripts/lib/analyze.mjs, scripts/content-check.mjs.
Cost: I found the drift by accident, comparing two files to decide which one a demo should call, not by auditing the pipeline on purpose.
Counterexample: for text that already cleanly passes every shared check, the two copies always agreed. The gap only ever showed up on the specific boundary of a file with no frontmatter.
Reader action: if two tools in your own stack claim to implement the same rule, run one input through both before trusting either number.
-->

## Draft

Same 77-word post. 95 out of 100 on one copy of a quality-gate function in my own repo. 66 out of 100 on another copy, same repo, same day.

Not a different draft. The identical string of text, scored by two functions that both claimed to be the real one.

I found this by accident, comparing scripts/lib/analyze.mjs and scripts/content-check.mjs to decide which one a new demo should call. One had 11 checks and docked 14 points per failure. The other had 21 checks and docked 10. A header comment in the smaller file still claimed the bigger file imported it, which had not been true for a while.

The fix was not more code. It was less: delete one copy, keep the checks that mean something on any text in one shared place, and have the fuller version import that and add only what a real repo file needs on top, an evidence block, a source trail, things a pasted paragraph cannot have anyway.

Same post now: 96 on the shared core, 66 on the full gate, for three specific, named reasons instead of an unexplained gap.

The finding underneath is the boring, useful one. A checklist with no model call, run against a stranger's post, will still catch the em dashes, the dead phrases, the paragraph with nothing checkable in it. It just has to be one checklist, not two that stopped talking to each other.

Takeaway: if two tools in your stack both claim to implement the same rule, run one input through both before you trust either number.

## First comment

Try it: /demos/slop-gate

The full writeup, including exactly where the two copies disagreed: /agents/15-a-checklist-not-a-model
