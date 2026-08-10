---
title: "The middle of the window is where facts go to die"
slug: 17-the-middle-of-the-window
author: James Liu
series: Market Ops Notes
section: agents
summary: "LLM accuracy on multi-document retrieval follows a U-shape by position: highest at the start and end of the context, and down more than 30% when the answer sits in the middle. A bigger context window does not fix this. What you retrieve, and where you place it, does."
status: ready
tags: ai, agents, rag, context-engineering
twitterExcerpt: "A model's accuracy on a fact buried in the middle of its context drops more than 30% compared to the same fact at the start or end. The fix marketed as the fix, a bigger context window, does not touch the actual problem."
---

<!-- EVIDENCE
Claim: LLM accuracy on multi-document retrieval and key-value lookup follows a U-shaped curve by the position of the answer in the context: highest at the start and end, and degraded by more than 30% when the answer sits in the middle. A larger context window does not fix this, because the problem is positional, not capacity.
Moment: Checking whether this repo's own dashboard already avoided the trap, before writing about it. It does, by construction: buildCopy() in site/src/dashboard/index.js never hands a consuming agent the whole raw markdown file and trusts it to find the right section. It calls draftBody() and firstCommentBlock() and extracts exactly the slice needed, so there is no middle for the answer to get lost in.
Numbers: The U-shaped degradation, over 30% accuracy loss for a mid-context answer versus one at the start or end, replicated across six model families in the original study: GPT-3.5-Turbo, GPT-4, Claude 1.3, LongChat-13B, MPT-30B, and Cohere Command. A retriever reporting 90% accuracy at 1M tokens of indexed context still returns a wrong result on roughly 1 in 10 queries.
Names: the "lost in the middle" finding, site/src/dashboard/index.js, draftBody(), firstCommentBlock().
Cost: the six-model replication is the number this piece leans on hardest; newer, larger frontier models were not part of that original test set, so treat the exact 30% figure as a documented historical finding on the models it was measured against, not a live, continuously re-verified number on this week's model.
Counterexample: a context window with only one relevant fact in it, placed anywhere, has no competing position to lose to, so the U-curve has nothing to bite on. The problem is specifically a long context with the needed fact surrounded by plausible-looking but irrelevant neighbors, which is the normal shape of a real document dump, not an edge case.
Reader action: before shipping a feature that pastes a large document into a model's context and asks a question about it, test the same question with the answer deliberately moved to the middle of the document. If accuracy drops, the fix is retrieving a smaller, more targeted slice, not buying a bigger context window.
-->

# The middle of the window is where facts go to die

Move 1 fact from the start of a document to the middle, change nothing else, and accuracy drops more than 30%. Not a quirk of 1 model or 1 prompt. The finding, "lost in the middle" after the 2023 paper that named it, replicated across 6 model families, 6 companies, tested the same way: GPT-3.5-Turbo, GPT-4, Claude 1.3, LongChat-13B, MPT-30B, Cohere Command. It rhymes with a 2026 finding on computer-use agents: 72% on short tasks, 20.6% on 1.6-hour ones. Different benchmark, same shape. Six companies' worth of different architectures and training runs, and the same U-shaped curve: accuracy highest with the answer at the start or the end of the context, lowest with the same answer moved to the middle, regardless of which of the six was asked.

The plain reading of that curve is uncomfortable for a popular pitch. Anthropic, OpenAI, and Google each market ever-larger context windows, well past 100,000 tokens and climbing, as the fix for a model not knowing something you told it. A window can hold more tokens without the model's attention across those tokens becoming any more even. Position, not capacity, is what the U-curve is a function of, and stacking more capacity on a positional problem does not touch the position.

## Why "just paste it all in" keeps sounding right

Retrieval, deciding in advance which slice of a corpus is relevant, is real engineering work: chunking, embedding, ranking, re-ranking, and living with a ranker that will sometimes be wrong. Pasting the whole document in and asking the model to find the answer itself skips all four steps. For a short document this works fine, because a short document has no real middle for the U-curve to bite on. The failure shows up once a document has a genuine start, a genuine end, and a real stretch of middle carrying facts that are not the one you asked about: a policy handbook, a 40-page contract, a support thread with 200 replies, a markdown file with a title, some notes, and one paragraph that matters.

The math behind why this hurts more than it looks like it should is straightforward once stated. A retriever that reports 90% accuracy at 1M tokens of indexed context sounds close to solved. It means roughly 1 in every 10 queries against that index returns a wrong result, silently, with the same confident tone as the 9 that were right. A system built on top of that retriever inherits a 10% wrong-answer rate it usually has no way to detect at the point of use, because a wrong retrieval and a right one look identical in the output: both are just an answer.

## What this repo already does about it, and why

Rereading this repo's own dashboard code before writing this, the fix was already sitting there, built for an unrelated reason. The posting dashboard's `buildCopy()` function, in `site/src/dashboard/index.js`, decides what a browser-driven agent pastes onto LinkedIn or X. It does not hand that agent the full raw markdown file, notes-to-self, an evidence block, a `## Draft` heading, draft text, a `## First comment` heading, comment text, and trust the agent to find the right section. It calls `draftBody()` and `firstCommentBlock()`, 2 small functions that extract exactly the slice needed, before the text reaches an agent or a model. No middle, no getting lost in it.

That was built in an earlier session to stop a different, more literal bug, a copy button leaking raw markdown headings onto a live post. It is the same fix lost-in-the-middle research points to for a subtler failure: retrieve or extract the specific slice first, hand over only that, do not paste in everything and hope attention finds the needle. The dashboard's retrieval step is a plain function call, not an embedding search, because the corpus, 1 markdown file per post, is small enough that a regular expression is a perfectly good retriever. A RAG pipeline is solving the identical problem at a much larger scale: decide what is relevant before the model has to guess.

The same repo makes a related bet one layer down, on humans instead of models. Its LinkedIn formatter folds a post after 210 characters and hard-caps it at 3,000, and the one rule that survives every draft is that the link goes in the first comment, never buried in the body a reader has to click "see more" to reach. A model losing a fact in the middle of 100,000 tokens and a reader never seeing a link past the fold at character 210 are the same failure at two different scales: the thing that matters was placed somewhere attention does not reliably reach, and no amount of added capacity, a bigger context window, a longer allowed post, fixes a placement problem.

## Where a bigger window still helps

Not an argument against long windows, only against window size as the fix for a positional problem. A longer window genuinely helps 2 cases: holding already-filtered material after retrieval, and full-document tasks, a summary, a side-by-side comparison of 2 documents, where most of the context is load-bearing rather than irrelevant neighbors surrounding 1 buried answer. The U-curve describes exactly that second case's opposite. Outside that shape, a bigger window helps exactly where it was marketed to.

## What to test before you trust the setup

Take 1 real question your system needs to answer from a long document. Run it twice: once with the answer left where it naturally falls, once with the same answer manually moved to the middle third of the same document. A noticeably worse second run means a lost-in-the-middle problem, regardless of how large the window technically is. The fix is retrieving a smaller, targeted slice before the model sees it, the same choice this repo's own dashboard already made for a smaller, more literal version of the same problem.

Takeaway: a bigger context window buys capacity, not attention. Move a fact from the edge of the context to the middle and accuracy drops more than 30% on the 6 model families this was tested against. The fix is retrieving the right slice before the model sees it, not paying for more tokens to paste the wrong slice into.
