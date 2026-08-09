---
title: "Developers felt 20% faster with AI. A stopwatch said 19% slower."
slug: 15-workflow-roi
pillar: growth
section: growth
status: ready
derivedFrom: articles/13-the-stopwatch-not-the-forecast.md
publishAt: 2026-08-14T01:00:00Z
platforms: linkedin
tags: growth, ai-workflows, roi
---

<!-- EVIDENCE
Claim: Self-reported speedup is not a reliable measurement of whether an AI workflow paid for itself, and token cost is rarely the number that actually decides it.
Moment: Building a breakeven calculator and finding the token-cost bar on the chart is consistently the smallest of four, by close to two orders of magnitude, at realistic token counts.
Numbers: METR's randomized trial, 16 experienced developers, 246 tasks: AI access increased completion time 19%, despite a pre-task forecast of 24% faster and a post-task belief of still being 20% faster. Claude Sonnet 5 costs $2 input / $10 output per million tokens (intro, through 31 Aug 2026).
Names: Workflow ROI Lab, METR, Anthropic, Claude Sonnet 5.
Cost: the token prices are exact; the task volume, minutes, and rework rate a real workflow needs are assumptions the calculator asks you to set yourself, not a number I can hand you.
Counterexample: a task with a small, fixed, well-understood manual cost may not be worth automating at all, regardless of how the AI math works out, since building and maintaining the automation is not priced here.
Reader action: time the review step on a stopwatch, across enough tasks to trust the average, before claiming a workflow saved time.
-->

## Draft

A trial asked 16 experienced developers to guess how much faster AI coding tools would make them. 24%, on average, before starting.

They finished the tasks. A stopwatch, not a feeling, said 19% slower.

Ask them again afterward and they still guessed positive, 20% faster, having just been measured going the other way. METR ran the numbers on 246 real tasks. Every self-reported estimate pointed the same wrong direction.

I wanted the equivalent number for AI workflow automation broadly, not just coding, so I built a calculator instead of trusting a guess. Feed it realistic token counts against Claude Sonnet 5's published rate, $2 in, $10 out per million tokens, and the token line on the resulting chart is almost never the biggest cost. It usually sits two orders of magnitude under the human-time lines beside it. A cheaper model barely moves the total.

Review time is. At the calculator's own default settings, 400 tasks a month, a $45 hourly rate, breakeven lands at 11 minutes of AI-assisted review per task. Push review time to 14 minutes with nothing else changed and monthly savings flips from roughly $2,100 positive to $890 negative. It does not care how fast the workflow feels while you are running it.

The fix is not a smarter model. It is a stopwatch, used on the review step, across enough tasks that the average means something, instead of a feeling that things are obviously faster now.

Takeaway: time the review step for real before you claim an AI workflow saved you anything. Self-report already failed this exact test once, on a controlled trial, in the direction that flatters the tool.

## First comment

Try the calculator: /demos/workflow-roi-lab

The full breakdown, with the exact breakeven math: /growth/13-the-stopwatch-not-the-forecast
