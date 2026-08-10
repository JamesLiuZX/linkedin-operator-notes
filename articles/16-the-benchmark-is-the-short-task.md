---
title: "The benchmark is the short task"
slug: 16-the-benchmark-is-the-short-task
author: James Liu
series: Market Ops Notes
section: agents
summary: "A computer-use agent now matches the human baseline on OSWorld's standard tasks, up from 12% two years ago. On OSWorld 2.0, where the median task takes a human 1.6 hours, the best frontier system completes 20.6% of them. Same benchmark family, two different jobs."
status: ready
tags: ai, agents, benchmarks, automation
twitterExcerpt: "Computer-use agents now match the human baseline on OSWorld. On OSWorld 2.0, the long-horizon version, the best system completes 20.6% of tasks. The benchmark you clear tells you the length of job you're ready for, not whether you're ready."
---

<!-- EVIDENCE
Claim: A computer-use agent's benchmark score describes the length of task it was tested on, not a general capability. The same class of agent that now matches the human baseline on short, standard tasks completes only about a fifth as well on long-horizon ones.
Moment: Rereading this repo's own BROWSER-POSTING.md after finding OSWorld 2.0's numbers. The file already breaks a posting session into single-row cycles, one platform posted and marked done before the next one starts, for exactly the reason OSWorld 2.0 exists to measure: a long autonomous run has more places to fail than a short one, and the fix is procedural, not a smarter model.
Numbers: OSWorld's early computer-use agents scored around 12% in April 2024. The human baseline on standard OSWorld tasks is about 72%, and multiple frontier systems now reach or pass it. OSWorld 2.0, a longer-horizon extension where the median task takes a human 1.6 hours, tops out at 20.6% for the best frontier system. Verified success rates across OSWorld, WebArena, GAIA, and WebVoyager rose roughly 5 to 7 times between 2023 and early 2026.
Names: OSWorld, OSWorld 2.0, BROWSER-POSTING.md.
Cost: model-by-model leaderboard rankings shift monthly and several widely circulated scores are self-reported by the vendor whose product they describe, so this piece uses the benchmark-level trend and the OSWorld 2.0 headline figure, not any single product's marketing claim.
Counterexample: a genuinely short, bounded task, the kind OSWorld's original suite measures, is exactly where today's agents are already reliable. The caution here is about extrapolating that reliability onto a long, multi-hour, many-step job, not a claim that agents do not work.
Reader action: before trusting an agent with an autonomous multi-step job, ask what the longest unbroken step is, not what the model's headline benchmark score is, and design a checkpoint at every point a human could plausibly need to intervene or resume.
-->

# The benchmark is the short task

Computer-use agents scored around 12% on OSWorld in April 2024. Two years later, several frontier systems reach or pass the human baseline on the same benchmark's standard tasks, which sits at about 72%. That is a real jump, roughly six times, on a benchmark built from real desktop and web tasks in a live operating system rather than a scripted sandbox. It is also, on its own, a misleading number to plan around, because OSWorld's standard tasks are short: open an app, find a setting, fill a form, done in a few minutes.

OSWorld 2.0 exists because the standard suite stopped being hard enough to separate good agents from great ones. It extends the same idea to longer jobs, where the median task takes a human 1.6 hours to finish. On that version, the best frontier system available completes 20.6% of tasks. Not 72%. Not a modest step down. A little over a fifth.

## Same family, different job

The instinct when a benchmark score looks strong is to treat it as a capability statement: this agent can do computer tasks. That is true, and also not the useful version of the claim. The useful version names the length of the task the score was measured against. An agent clearing 72% on OSWorld's standard suite has demonstrated it can reliably execute a short, bounded sequence of clicks and keystrokes toward a clear goal. It has demonstrated nothing about what happens when that sequence runs for ninety minutes instead of five, because the two are, empirically, different problems with different failure rates, not the same problem run longer.

The reason is not mysterious once you look for it. A short task has few steps, so few places for a wrong click, a misread label, or a stale assumption about the screen's state to compound into a failure the agent cannot recover from. A long task has many steps, and unless something breaks the chain into checkpoints, an error twelve minutes into a ninety-minute run can silently invalidate everything that follows for the remaining hour. The benchmark-wide trend backs this up in aggregate: across four separate suites, OSWorld, WebArena, GAIA, and WebVoyager, the best verified success rates rose roughly 5 to 7 times between 2023 and early 2026, real, broad-based progress, entirely on benchmarks built primarily from tasks measured in minutes. OSWorld 2.0's 20.6% is the first widely cited number that isolates what happens once the horizon stretches to 1.6 hours, past what those four suites were built to test. The raw gap, 72 points down to roughly 21, is 51 percentage points on the same underlying skill.

## The fix already exists, and it is not a bigger model

I found this comparison while rereading a file already sitting in this repo. BROWSER-POSTING.md is the prompt that runs a browser-driven posting session across four platforms, and it was written before I had OSWorld 2.0's number in front of me, for an unrelated-sounding reason: so that a crash mid-session leaves a clean state to resume from. Its Step 3 says it directly: finish one row's full cycle, post it, comment on it if the channel needs one, mark it done in the schedule, before starting the next row. Never post to a second platform for a row that has not been marked finished.

That rule is not a capability upgrade. It does not make the underlying model better at parsing a web page or clicking the right button. It is a procedural answer to exactly the failure mode OSWorld 2.0 measures: a long, unsupervised run has more chances to go wrong than a short one, and the number of chances, not the sharpness of any individual step, is what a multi-hour success rate is actually tracking. Breaking a 90-minute job into a dozen five-minute jobs, each one checked and marked before the next starts, does not close the 72-to-20.6 gap by making the agent smarter. It closes the gap that matters in practice, which is how much unrecoverable damage a single failure can do, by shrinking the blast radius of any one step to the length of task the agent was already good at.

## What the 20.6% actually rules out

It does not rule out computer-use agents for real work. It rules out handing one a genuinely long, unstructured, many-step job and trusting the headline OSWorld number as evidence it will get there. The gap between 72% and 20.6% is not a gap in the model's competence at any individual click; it is a gap in how many consecutive correct decisions a task demands before it counts as done, and that number is a property of how the task was designed, not just how capable the agent is.

This cuts the other way too. A task that looks long on the calendar but decomposes cleanly into short, independently checkable steps is not a long task in the sense OSWorld 2.0 means. It is a short task repeated, and the whole point of a checkpoint between repetitions is to make sure that is what it actually is, structurally, rather than one long unbroken chain wearing a checklist as decoration.

## What to check before you hand off a multi-step job

Ask what the longest unbroken step actually is, measured in decisions that would be expensive to silently get wrong, not in wall-clock minutes. A ninety-minute job made of nine ten-minute checkpoints, each independently verifiable, is closer to nine short tasks scored near 72% than to one long one scored near 20.6%. A ninety-minute job with no natural place to check in, one continuous 1.6-hour chain, is the exact shape OSWorld 2.0 measures, and the benchmark's answer for that shape, as of 2026, is roughly one success in five, down from four in five on the short version of the same class of task.

Takeaway: a computer-use agent's benchmark score names the length of task it was tested on, not a general skill level. Before trusting one with a long, unsupervised job, build the checkpoints in yourself. The fix for a long-horizon failure rate has never required a smarter model, only a shorter leash.
