# WRITING.md

Voice spec and quality gate for linkedin-operator-notes.
This file is the contract. `npm run content:check` enforces the mechanical parts.

---

## 0. Who this is for

Audience, in priority order:

1. Operators building trading, markets, or AI products who want field notes they can steal from.
2. Hiring managers and founders evaluating whether James can actually ship.
3. The AI-curious crowd who arrive through tooling content and stay for the market stuff.

Not for: prompt collectors, growth hackers, people who bookmark and never build.

If a draft would delight audience 3 and bore audience 1, it is the wrong draft.

---

## 1. Why the old drafts read as AI-written

Five root causes. Every rule below traces back to one of them.

**Cause 1: prompting for output instead of evidence.**
"Write a LinkedIn post about prediction markets" produces generalities because the model has no specifics to work with. It will invent structure to fill the vacuum. Fix: no drafting until the evidence block is filled.

**Cause 2: no cost.**
Slop has nothing at stake. Every piece that travels contains something the author would slightly prefer not to publish: a number that flatters someone else, a decision that was wrong, a thing that broke. Fix: mandatory receipt or admission.

**Cause 3: rhythmic symmetry.**
LLM prose clusters at 15 to 22 words per sentence with even paragraph blocks. Human writing is lumpy. A four word sentence lands. Then a long, specific, clause-heavy one carries the detail. Fix: enforced sentence length variance.

**Cause 4: the abstraction ladder never descends.**
"Liquidity is important for market health" is a claim with no floor under it. Fix: every claim gets a named concrete instance within two sentences. A number, a date, a screenshot, a person, a product.

**Cause 5: length used as a proxy for depth.**
The drafts are not too short. They are too thin. A 180 word post with four specifics beats an 800 word post with none. Fix: measure specificity density, not word count.

---

## 2. Hard rules (mechanical, checked by CI)

| Rule | Applies to | Enforcement |
|---|---|---|
| File has frontmatter. A file the pipeline cannot see is not a draft | all | fail |
| Evidence block present, with every field filled | all | fail |
| No unfilled `{{ }}` slots | all | fail |
| No em dashes (`—`) or en dashes used as em dashes | all | fail |
| Ends with a `Takeaway:` line | all | fail |
| No banned LLM tells (see list in `scripts/content-check.mjs`) | all | fail |
| No "not just X, but Y" construction | all | fail |
| No vague sourcing ("public reporting", "studies show") without a named source | all | fail |
| Specificity density at or above threshold for the format | all | fail |
| First sentence is under the format's hook length, or contains a number or proper noun | all | fail |
| No engagement bait ("Save this", "Comment X below", "Agree?") | all | fail |
| At least one strong receipt (see section 2b) | all | fail |
| `derivedFrom:` points at a source file that exists | posts | fail |
| Under 12% phrasing overlap with that source | posts | fail at 12%, warn at 6% |
| Fold (first 210 chars) contains at least one specific | posts | fail |
| Body pastes clean: no markdown LinkedIn cannot render | posts | fail |
| Under 3,000 characters | posts | fail |
| At most 3 hashtags, no URLs in the body | posts | fail |
| Sentence length standard deviation at or above 5.5 | all | warn |
| Hedge word density under 2.5% | all | warn |
| At least one drawn figure, not only Unsplash slots | articles | warn |

Blocking model: `status: draft` is advisory so work in progress can live in the
repo. Everything else blocks. A file with no frontmatter always blocks, because
that is the hole that let 7 of 8 posts break three hard rules each while CI
stayed green. `npm run content:strict` blocks on drafts too.

### 2b. What counts as a receipt

Not every number is a receipt. "Three surfaces" and "30 seconds" are structure,
not evidence, and counting them is how a piece scores well while containing
nothing a stranger could check.

A receipt is one of:

- money, a percentage, an ISO date, a quarter with a year, or a year anchor
- a path or link into something the reader can open and run
- a first-person admission: what broke, what you got wrong, what you have not done

The third kind is the one that travels. It is also the one a model cannot
generate for you, which is the point of the evidence block.

### 2c. The `{{ }}` rule

When a piece needs a number only you have, the draft carries `{{SLOT: what to
fill and what not to leak}}` and the gate refuses to publish it. Nothing in this
system is allowed to invent a figure about your work to make a draft pass. A
held draft is a correct state. A fabricated number is not.

---

## 3. Format specs

### LinkedIn atom (`posts/`)
- 150 to 350 words, under 3,000 characters.
- Hook is a single line under 12 words. It states a position or a number, never a question.
- **The fold is the unit.** LinkedIn cuts at roughly 210 characters and appends
  "see more". Those 210 characters are the entire advertisement for the rest.
  Blank lines count against the budget. Write them last and read them alone.
- One idea. If there are two, that is two posts.
- Line breaks every 1 to 2 sentences. LinkedIn eats dense blocks.
- **Plain text only.** LinkedIn renders no markdown. No `**bold**`, no `#`
  headings, no `- ` bullets, no `[text](url)`. Use `·` for bullets. A draft that
  pastes with visible asterisks is the most avoidable way to look careless.
- **Links go in the first comment**, in a `## First comment` section. Outbound
  links in the body suppress distribution and the proof link is worth more than
  the click it would have bought.
- At most 3 hashtags, at the end.
- Minimum specificity density: 5.0 per 100 words.
- `derivedFrom:` names the essay or the artifact this atom came from. Atoms are
  derived. An atom that reprints more than 12% of its source is not a derivation.
- Ends with `Takeaway:` one line.

File shape:

```markdown
---
title: ...
slug: ...
status: draft | ready | scheduled
derivedFrom: articles/xx.md   # or tools/..., scripts/...
platforms: linkedin
---

<!-- EVIDENCE ... -->

## Draft
(the publishable body, plain text)

## First comment
(links, in one place, out of the body)
```

Everything outside `## Draft` is notes to yourself. `npm run linkedin -- <file>`
prints the exact paste, the visible fold, and the character budget.

### X thread
- First tweet is the whole argument compressed. If someone reads only tweet 1, they got value.
- Maximum 9 tweets. Longer is an article with extra steps.
- For articles, X gets `twitterExcerpt` plus a canonical link. Never the full body.

### Essay (`articles/`)
- 900 to 2200 words.
- Minimum specificity density: 6.0 per 100 words.
- Structure: claim, the moment it became obvious, the mechanism, the counterexample, what to do about it, Takeaway.
- One figure minimum. A diagram you drew beats an Unsplash photo. Unsplash is a fallback, not a default.
- Must be able to answer: what would someone have to believe for this to be wrong?

---

## 4. The evidence block

No drafting starts before this exists. Put it at the top of the markdown file inside an HTML comment so it never renders.

```markdown
<!-- EVIDENCE
Claim: (one sentence, falsifiable)
Moment: (the specific day/incident that made this obvious)
Numbers: (at least two, with units and time windows)
Names: (products, companies, tools, mechanisms)
Cost: (what went wrong, what this admission costs me)
Counterexample: (a case where the claim fails)
Reader action: (what they do differently Monday morning)
-->
```

If the Cost field is empty, the piece is not ready. That field is the difference between a post and a press release.

---

## 5. Banned moves

- Opening with "In the world of", "As a PM", "Have you ever", "Let's talk about", "I've been thinking about".
- The triad reflex. Three parallel items when two are true and the third was invented for rhythm.
- Rhetorical questions used as transitions.
- Emoji as bullet points.
- Numbers without a denominator. "60% growth" is meaningless without the base and the window.
- Claiming a result you cannot show. If you say revenue doubled, name the quarter.
- Explaining what a prediction market is. The audience knows. If they do not, link to the library.
- Over-claiming as compensation. The braggier register tests worse than the plainer one. Understate, then show the number.

---

## 6. Voice calibration

Write like the smartest person on the desk explaining something to a peer at 11pm, not like someone presenting to a board.

Good: "The market resolved wrong. Not the oracle, the criteria. I wrote 'winner of the match' and did not define what happens on abandonment."

Bad: "Resolution criteria are a critical component of prediction market design that product managers must carefully consider."

The first sentence has a failure in it. The second has an opinion nobody can disagree with.

---

## 7. The two-pass draft process

**Pass 1, generation.** Feed the evidence block plus this file to the model. Ask for a draft. Expect it to be mediocre.

**Pass 2, adversarial.** Separate prompt, fresh context:

> Here is a draft. You are a skeptical operator who has shipped in this domain. Find every sentence that could appear in any article on this topic by any author. Delete it or force it to earn its place with a specific. Find every claim without a receipt. Flag it. Do not rewrite the voice, only cut and challenge.

Pass 2 is where the quality comes from. Skipping it is why the current drafts feel thin.

**Pass 3, the gate.** `npm run content:check <file>`. Fix what it names. It is
deliberately unpleasant about receipts, because that is the failure mode this
whole system exists to prevent.

---

## 8. Where the receipts come from

The hardest part of this standard is that it demands evidence, and evidence is
not something a drafting session produces. Three honest sources, in order of how
much they are worth:

1. **What you operated.** The incident, the number, the thing you got wrong.
   Highest value, only you have it, and it is the field most often left empty.
2. **What you built.** The tools in this repo are receipts: the scanner's rule
   count and its worst score, the ledger's self-test suite and its unverified
   adapters, the gate's own findings about this corpus. Anyone can clone and
   check them, which is exactly what makes them evidence.
3. **What is public and named.** A source you link. Never "public reporting
   suggests", which is an appeal to authority with no authority in it.

If a piece has none of the three, it is an opinion. Opinions are fine. They are
not what this account is for.

---

Takeaway: quality is not a prompt, it is a gate. The evidence block is the gate.
