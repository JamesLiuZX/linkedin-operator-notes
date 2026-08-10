---
title: "72% on the short version. 20.6% on the 1.6-hour one."
slug: 18-the-benchmark-is-the-short-task
pillar: agents
section: agents
status: ready
derivedFrom: articles/16-the-benchmark-is-the-short-task.md
publishAt: 2026-08-21T01:00:00Z
platforms: linkedin
tags: ai, agents, benchmarks
---

<!-- EVIDENCE
Claim: A computer-use agent's benchmark score names the length of task it was tested on, and the fix for a long-horizon task is a checkpoint, not a smarter model.
Moment: Writing this repo's own browser-posting prompt, then finding a benchmark number that explains why it was built the way it was.
Numbers: OSWorld human baseline about 72%, up from a 12% agent baseline in April 2024. OSWorld 2.0, median task 1.6 human-hours, best frontier system 20.6%.
Names: OSWorld, OSWorld 2.0, BROWSER-POSTING.md.
Cost: benchmark leaderboards shift monthly; this is the headline trend, not this week's exact model ranking.
Counterexample: short, bounded tasks are where today's agents are already reliable.
Reader action: ask what the longest unchecked step in your agent's job actually is before trusting the headline score.
-->

## Draft

I built a prompt this month that hands a browser agent a posting job across 4 platforms. Step 3 says: finish one row completely, mark it done, before starting the next. Never touch platform 2 for a row you have not finished.

I wrote that rule for a boring reason: so a crash mid-session leaves something resumable. Then I found the number that explains why it mattered more than I thought.

Computer-use agents scored 12% on OSWorld in April 2024. Today several frontier systems match the human baseline, about 72%, on OSWorld's standard tasks. Real progress, roughly 6x.

OSWorld 2.0 tests the same skill on longer jobs, median task length 1.6 human-hours. Best frontier system: 20.6%.

Same agent family. Short task, near-human. Long task, 1 success in 5.

The gap isn't a smarter-model problem. It's a blast-radius problem: more steps means more places an early error compounds silently before anyone checks. My posting prompt's "finish one row, mark it, then move on" rule doesn't raise any single step's accuracy. It just stops a bad step from being invisible for the next hour.

If you're handing an agent something that takes longer than a few minutes, the question isn't "how good is the model." It's "where are the checkpoints."

Takeaway: a benchmark score names the length of task it was tested on. Build the checkpoints in yourself before you trust it with a long one.

## First comment

Full essay, with the OSWorld numbers and how this repo's own posting prompt landed on the same fix independently: /agents/16-the-benchmark-is-the-short-task
