---
title: "Prototype aggressively. Productionize suspiciously."
slug: 03-prototype-aggressively-productionize-suspiciously
author: James Liu
series: Build Notes
section: agents
summary: "AI demos steal roadmaps. Bounded autonomy is the adult version."
status: draft
publishAt: 2026-08-19T01:00:00Z
platforms: twitter, medium, substack
tags: ai, agents, product
hero: "https://images.unsplash.com/photo-1595683363301-1e94594a550d?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTY5MDUzfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80"
heroAlt: "black laptop computer on white bed"
twitterExcerpt: "Prototype aggressively. Productionize suspiciously."
figures:
  - slot: hero
    prefer: JV_R_DNzIWU, mp11_hrQXf8
    queries: laptop code editor dark mode
    requireAny: laptop, computer, code, screen, monitor
  - slot: demo
    prefer: 26MJGnSoOqmRc, 26MJGnCM0Wc
    queries: whiteboard product sketch
    requireAny: whiteboard, sketch, presentation, meeting
  - slot: gates
    queries: metal lock macro | security gate
    requireAny: lock, key, gate, security
---

# Prototype aggressively. Productionize suspiciously.

<figure>
<img src="https://images.unsplash.com/photo-1595683363301-1e94594a550d?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTY5MDUzfA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="black laptop computer on white bed" />
<figcaption>A weekend prototype can teach you the edge. It cannot be your risk system.</figcaption>
</figure>

AI makes it easier to fake completeness.

Trading and fintech products punish fake completeness.

I prototyped an AI trading agent as a PM. Not because I think agents replace trading systems next quarter. Because I wanted to feel where the product boundaries actually are. A fluent agent can explain a market, draft a thesis, suggest sizing heuristics, call tools, summarize feeds. Stakeholders watch for three minutes and mentally skip to "so we ship autonomous trading next quarter."

That jump is the bug.

The winning pattern in 2026 is not "fully autonomous agent." It is bounded autonomy: agents that plan and assist fast, while deterministic gates own money movement, limits, audit, and halt.

Regulators and industry groups are converging here. MAS's SAFR (Safeguards for Agentic Finance at Runtime). IMF notes on agentic payments that emphasize mandate-based authorization, separation of decision versus execution, audit trails, and tiered human-in-the-loop. The frameworks differ. The product lesson rhymes.

---

### The demo that steals the roadmap

<figure>
<img src="https://images.unsplash.com/photo-1532622785990-d2c36a76f5a6?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzg0OTY5MDU1fA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="two people drawing on whiteboard" />
<figcaption>What is: a whiteboard that ends in "autonomous." What could be: a ladder with gates before money moves.</figcaption>
</figure>

Impressive demo → stakeholder imagination → unscoped roadmap pressure → eng inherits an undefined risk surface → incident, freeze, or trust damage.

Your job as PM is to keep two clocks honest.

1. **Learning clock:** how fast we can prototype and discover UX truth
2. **Risk clock:** how fast we can make failure non-catastrophic

AI compresses the first. It does not automatically compress the second. Teams that pretend otherwise ship liability with a chat bubble.

**What the room hears:** "It works."

**What you must say:** "It teaches. It does not yet protect."

---

### What a weekend can and cannot validate

Write this table into the PRD. Literally.

**Prototype zone (can validate)**

| Question | Method |
|----------|--------|
| Is the explanation useful? | Wizard-of-Oz + real users |
| Where does the UX break? | Tool latency, memory, permissions |
| Do users over-trust fluent tone? | Observe behavior, not surveys only |
| What tools are even needed? | Thin agent + logged tool calls |

**Production zone (cannot validate)**

| Question | Why a weekend fails |
|----------|---------------------|
| Risk controls | Need policy engines, limits, kill switches |
| Abuse / prompt injection | Adversaries do not attend your demo |
| Regulatory boundaries | Legal is not a prompt |
| Liability and audit | Needs durable trails, ownership, incident process |
| Trust with money | Irreversibility changes user psychology |

A weekend can validate whether an agent can explain a market in plain language, help a user form a thesis without pretending certainty, and where the UX breaks. It cannot validate risk controls, abuse, regulatory boundaries, whether users trust automation with money, or whether "helpful" becomes "liable."

That distinction is the whole game for AI near trading products.

**Operator test:** For every capability in the demo, mark it P (prototype-proven) or R (requires production risk work). If someone asks for roadmap space, only P items get a learning sprint. R items get a design review, not a launch date.

---

### Architecture that survives contact with money

<figure>
<img src="https://images.unsplash.com/photo-1592791770401-7a0cb5ee279b?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8bWV0YWwlMjBsb2NrJTIwbWFjcm98ZW58MHx8fHwxNzg0OTY5MDU2fDA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="red padlock on gray wire" />
<figcaption>Decision layer proposes. Execution layer decides whether money moves. The lock is the product.</figcaption>
</figure>

Industry guidance keeps repeating a clean split.

**Decision layer:** LLM plans, interprets, proposes.  
**Execution layer:** deterministic checks, mandates, limits, ledgers.

IMF-style mitigation themes for agentic payments include mandate-based authorization, architectural separation of decision making and execution, agent identity, programmable controls, audit trails, tiered human oversight, and halt mechanisms. MAS SAFR frames runtime safeguards: how actions are authorized, when humans are activated, what is recorded at decision time.

The flow that survives contact with money looks boring on purpose:

User intent → decision layer proposes (action + rationale + tool plan) → execution gates → pass low-risk to deterministic execute, route high-risk or irreversible to human approval, refuse out-of-policy → audit trail with model version, tools, and state.

If your architecture diagram does not show a refuse path, you do not have an architecture. You have a hope.

#### Autonomy tiers (use in design reviews)

| Tier | Name | Example near trading | Default stance |
|------|------|----------------------|----------------|
| 1 | Assistive | Explain market, quiz user, summarize news | Ship early |
| 2 | Supervised autonomous | Place order only after explicit confirm + limit checks | Ship carefully |
| 3 | Fully autonomous | Agent trades within a mandate without per-trade approval | Rare; heavy governance |

If someone says "agent" without a tier, ask them to pick one. Ambiguous vocabulary is how demos steal roadmaps.

---

### The PM build ladder

Ship this sequence. Skip steps only if you enjoy incident reviews.

**Step 0: Define non-autonomy.** List actions that must never be autonomous in v1: moving funds, raising limits, trading above $X or beyond a market set, changing account permissions, anything irreversible without a clear mandate.

**Step 1: Assistive agent in production.** Explanation, education, checklist generation. No execution tools. Success metric: users understand markets better or complete a first competent trade faster. Not "messages sent."

**Step 2: Proposal-only execution.** Agent can draft an order ticket. User must confirm. Execution path is the same path as manual trading. Reuse trusted rails.

**Step 3: Bounded tools.** Hard allowlists: read-only market data, portfolio read, create draft order. Not arbitrary code, open web browse-to-trade, or uncontrolled withdrawals.

**Step 4: Mandates.** User pre-commits: markets allowed, max notional per day, max loss, time window. Agent operates inside the mandate. Outside means refuse.

**Step 5: Runtime safeguards.** Pre-commitment gates. Real-time monitoring plus automatic halt. Post-action audit and reversal paths where legally and technically possible. This is where SAFR-like thinking becomes product requirements, not a PDF.

**Operator test:** Can you point to the step you are on, and the step you are not ready for? If the roadmap skips from Step 1 language to Step 5 ambition, you are negotiating fiction.

---

### Eval before UI polish

Teams polish chat bubbles while skipping evals.

Minimum eval set for an agent near markets:

1. **Factuality:** does it invent resolution rules?
2. **Refusal:** does it refuse disallowed actions?
3. **Overconfidence:** does it present estimates as certainty?
4. **Tool correctness:** wrong ticker / wrong market ID rate
5. **Injection:** does hostile content in market metadata hijack tools?
6. **Audit completeness:** can you reconstruct why it proposed X?

If you cannot measure these, you do not have an AI product. You have a demo with CSS.

Evals are not a research luxury. They are the difference between "the model sounded nice" and "we can ship this near money without lying to ourselves." Put the eval sheet in the PRD next to the autonomy tier. If the tier is 2 and refusal is unmeasured, you do not have a tier. You have a wish.

---

### How I use AI as a PM without lying to myself

Tools like Cursor and Claude Code changed my loop. Prototype the awkward edge case instead of only describing it. Feel latency and state bugs before eng translates a doc. Open small, reviewable PRs. Not "PM rewrites the trading engine."

A concrete week looks like this. Monday: write the non-autonomy list and the tier. Tuesday: ship a thin assistive prototype that explains one public-style sample market with no execution tools. Wednesday: watch three people over-trust fluent tone and rewrite the refusals. Thursday: open a reviewable PR for the checklist UX, not for "the agent." Friday: write the eval sheet before anyone asks for a launch date.

Rules that keep this healthy:

1. Prototype to learn
2. PR only when scoped and reviewable
3. Never confuse a demo with a production system, especially near money

AI did not make strategy docs prettier. It made them honest faster.

The personal brand version of this is easy to fake: "I use AI every day." The operator version is harder: "Here is what the prototype proved, here is what it did not, here is the gate before money moves."

Hire for the second sentence. In design reviews, ban the word "agent" until someone names a tier. In roadmap reviews, ban "autonomous" until someone shows green refusal and audit evals. Vocabulary discipline is product discipline when the demo is this persuasive.

What stakeholders often want is magic. What you can honestly offer is a ladder. Assistive now. Proposal-only when the rails are reused. Mandates before anything unsupervised. Halt before heroics. That ladder is how you keep learning speed without pretending the risk clock moved.

---

### The Monday decision

When a stakeholder watches a fluent agent and asks for autonomous trading on the roadmap, do not argue about model quality.

Ask for the tier. Ask for the non-autonomy list. Ask which evals are green. Ask whether execution reuses the same rails as manual trading. Ask what halt looks like when the agent is wrong with confidence.

Picture the other world. The demo still impresses. Learning still moves fast. But the roadmap shows assistive shipping now, proposal-only next, mandates before anything unsupervised. Legal is in the design review, not the postmortem. Users get help without inheriting your unfinished risk surface.

That is prototype aggressively, productionize suspiciously. Both halves are required. Either half alone is theater.

---

### Takeaway

AI fakes completeness. Trading punishes it.

Before you put an agent near money:

1. **Split clocks:** learning speed is not risk speed
2. **Pick a tier:** assistive, supervised, or fully autonomous (rare)
3. **Write non-autonomy:** funds, limits, irreversible actions stay gated
4. **Eval before polish:** factuality, refusal, overconfidence, tools, injection, audit

If you only remember one line, make it this: prototype aggressively, productionize suspiciously.
