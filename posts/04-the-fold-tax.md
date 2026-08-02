---
title: "LinkedIn shows 210 characters. I was writing for 1,300."
slug: 04-the-fold-tax
pillar: how-i-build
section: shipping
status: ready
derivedFrom: scripts/lib/linkedin.mjs
publishAt: 2026-08-13T01:00:00Z
platforms: linkedin
tags: writing, distribution, systems
---

<!-- EVIDENCE
Claim: On LinkedIn the first 210 characters are the entire advertisement for the rest of the post, and a quality gate that checks the first sentence is checking the wrong unit.
Moment: Measuring the visible fold on my own 8 drafts and finding the best line in the retention post sitting at character 1,180, past the cut, where roughly nobody reaches it.
Numbers: 210 characters visible before the cut, 3,000 character composer cap, 7 of 8 drafts spending the fold on setup, best line buried at character 1,180, markdown artifacts per draft of 12, 6, 14, 12, 8, 14, 8 and 6.
Names: LinkedIn, scripts/lib/linkedin.mjs, npm run linkedin, the see-more cut.
Cost: Every one of those drafts was written in markdown and headed "copy to LinkedIn". Pasted as written, post 3 would have published with 14 pieces of visible syntax in it. I would have shipped literal asterisks to a professional audience.
Counterexample: Front-loading can be overdone. A fold engineered purely for the cut produces a hook that oversells what follows, which buys the click and loses the reader on the second screen.
Reader action: Paste your draft into a character counter, cut at 210, and read only that. If it does not carry a specific, rewrite the opening rather than the body.
-->

## Draft

LinkedIn cuts the post at roughly 210 characters and adds "see more".

That is the whole advertisement for everything below it. I had been writing 1,300 character posts and treating the first paragraph as a warm-up.

Measured across my 8 drafts: 7 of 8 spent the visible window on setup. The single best line in the retention post sat at character 1,180, which is past the cut, behind a click nobody had a reason to make.

My quality gate had a hook rule. It checked the first sentence. A sentence is not a fold. Line breaks and blank lines burn characters too, and a three-line opener can spend the entire budget before making a claim.

The second finding was worse. Every draft was written in markdown, under a heading that said "copy to LinkedIn". LinkedIn renders no markdown. Counted per draft, the literal syntax that would have pasted through: 12, 6, 14, 12, 8, 14, 8, 6.

Post 3 would have gone live with 14 visible asterisks and hyphens in it.

So the fold is a check now, not a habit. It lives in scripts/lib/linkedin.mjs with the two numbers that matter hard-coded at the top. The renderer prints the exact visible window, flags a cut that lands mid-word, counts against the 3,000 cap, and refuses anything with markdown left in it.

The general version: every distribution surface has a unit that decides whether the work gets read. Find yours and measure it, because taste does not count characters.

Takeaway: write the first 210 characters last, and read them alone before you post.

## First comment

The renderer and the fold rules: github.com/JamesLiuZX/linkedin-operator-notes/blob/master/scripts/lib/linkedin.mjs

Run npm run linkedin on any draft to see the visible window, the character budget, and anything that will paste as literal syntax.
