---
title: "I published 6 AI workflows, and every one checks itself"
slug: hb-launch
pillar: growth
section: growth
status: ready
derivedFrom: skills/README.md
publishAt: 2026-11-19T01:00:00Z
platforms: linkedin
tags: ai, product-management, skills, handbook
media: /hub/launch/flagged-prototype/carousel.pdf, /hub/launch/flagged-prototype/clip.mp4
---

<!-- EVIDENCE
Claim: A workflow that publishes its finished output and the result of a check that could have failed is more useful to a product person than a prompt, and six such workflows can be shipped free as agent skills.
Moment: On 18 Nov 2026 the first test run of the journey teardown skill passed all 6 of its checks and still returned 15 faults in the instructions, which showed the checks were too easy.
Numbers: 6 workflows published on 18 Nov 2026; 34 checks run by a script across the six skills; 42 tests on the experiment readout's statistics; 5 of 6 skills tested by a fresh agent session; 15 faults listed by the first teardown run.
Names: AI Workflow Handbook, Claude Code, Claude, Cursor, Codex, MIT licence, journey teardown, interview synthesis, pre-mortem, decision-ready PRD, flagged prototype, experiment readout.
Cost: The PRD skill has not had a fresh-run test and its page says so. One run per skill on an invented grocery app is not proof it works on real material. The Miro route in the teardown skill is written down and untested.
Counterexample: A team that needs a one-off answer in chat gains little from an installed skill with a checker. The overhead pays back only when the same document is produced again and again.
Reader action: Open one worked example before installing anything, pick the workflow whose input you already have, and read the check lines it prints at the end.
-->

## Draft

I published 6 AI workflows today, and every one checks itself.

Most AI advice for product people is a prompt. You cannot tell from a prompt whether the result is any good.

So this handbook shows the result first. Each workflow has a demo you can scrub, a finished example you can open, and a skill you can install in Claude Code, the Claude app, Cursor or Codex.

The six, in the order work happens:
· Journey teardown: four apps on one board, scored, ending in gaps
· Interview synthesis: each quote found in its transcript
· Pre-mortem: the top risks each get a tripwire
· Decision-ready PRD: one number per point
· Flagged prototype: one switch per PRD point
· Experiment readout: a script does the arithmetic

34 checks run as code across the six. The readout's statistics have 42 tests.

I tested 5 of the 6 by handing the folder to a fresh agent session with nothing else, and asking for a list of what was wrong with it. The first teardown run passed all 6 checks and still came back with 15 faults. That told me the checks were too easy, so I made them stricter and ran it again.

The sixth, the PRD, has not had that test yet. Its page says so.

What this does not show: one run per skill is not proof it works on your material. The examples use an invented grocery app. The checks are there so you find out fast.

It is free, MIT licensed and plain text. Read every line before you run it.

Takeaway: publish the output and the check that could have failed, then the prompt.

#ProductManagement #AI #ClaudeCode

## First comment

The handbook, with all six demos, the worked examples and the install commands: /
