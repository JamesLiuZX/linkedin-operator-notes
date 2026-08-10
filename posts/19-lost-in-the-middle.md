---
title: "The dashboard already does the thing the RAG papers recommend"
slug: 19-lost-in-the-middle
pillar: agents
section: agents
status: ready
derivedFrom: articles/17-the-middle-of-the-window.md
publishAt: 2026-08-24T01:00:00Z
platforms: linkedin
tags: ai, agents, rag, context-engineering
---

<!-- EVIDENCE
Claim: A bigger context window doesn't fix a positional retrieval problem; extracting the right slice does, and this repo's own dashboard already does that for an unrelated reason.
Moment: Rereading site/src/dashboard/index.js's buildCopy() function and noticing it never hands a consuming agent a whole raw file.
Numbers: over 30% accuracy loss for a mid-context answer vs one at the start or end, replicated across 6 model families. A retriever at 90% accuracy and 1M tokens still misses roughly 1 in 10 queries.
Names: "lost in the middle," site/src/dashboard/index.js, draftBody(), firstCommentBlock().
Cost: the 30% figure is from the original 6-model test set, not a live number on this week's frontier models.
Counterexample: a short context with only 1 relevant fact has no middle to lose it in.
Reader action: test your own RAG setup with the answer moved to the middle of the document before trusting the window size to cover for you.
-->

## Draft

Move 1 fact from the start of a document to the middle. Change nothing else. Model accuracy at finding it drops more than 30%. Replicated across 6 separate model families, 6 companies, in the 2023 study that named the effect "lost in the middle."

A bigger context window doesn't fix this. It's a positional problem, not a capacity one.

I checked whether this repo's own dashboard already had the problem. It doesn't, and not because anyone was thinking about attention curves.

The posting dashboard hands a browser agent exactly 2 things for a LinkedIn post: the draft text, the first-comment text. It never hands over the raw file, notes-to-self, evidence block, and all 3 headings included, and trusts the agent to find the right section in the middle. 2 small functions, draftBody() and firstCommentBlock(), extract exactly the slice needed, before any of it reaches a model.

That was built to fix a copy button leaking markdown onto a live post. It turns out to be the identical fix the context-window research recommends for a much bigger, much subtler problem: retrieve the slice before the model has to guess, don't paste in everything and hope.

A retriever reporting 90% accuracy at 1M tokens still misses roughly 1 in 10 queries. That's not close to solved. It's a wrong answer with the same confident tone as the 9 right ones next to it.

Takeaway: window size buys capacity, not attention. If your system pastes in a whole document and asks a question, test it with the answer moved to the middle before you trust the size of the window to cover for you.

## First comment

The full argument, with the study's 6 model families and the exact function names: /agents/17-the-middle-of-the-window
