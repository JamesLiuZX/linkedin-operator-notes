// site/src/demos/resolution-linter.js
//
// Market Rules Check: paste a market's resolution criteria, get back the
// dispute surface.
//
// The thesis this demo exists to prove: most prediction-market disputes are not
// oracle failures, they are writing failures. Every rule below maps to a real
// class of dispute. Two of the sample markets are real ones that went wrong in
// the way a rule describes, one is a recurring class of dispute, and one is a
// control that should come back clean.
//
// Deterministic. No model call. That is the point: you do not need an LLM to
// catch this, you need a checklist that someone actually runs.
//
// The rules, scoring and samples below the meta block are unchanged. The view
// is built from the demo kit: sample pills, an answer card, finding cards, and
// the rule IDs in a disclosure.

import { esc } from "../viz/charts.js";
import { answerCard, card, disclosure, hl, scenarioBar, status, table } from "./kit.js";
import "./resolution-linter.css";

export const meta = {
  slug: "resolution-linter",
  title: "Market Rules Check",
  tagline: "Will these rules start a dispute?",
  section: "markets",
  pillar: "Market design",
  essay: "07-the-sentence-is-the-product",
  blurb:
    "Paste the rules a prediction market settles by and see which wording could start a dispute. Start with a market that actually blew up.",
  how: [
    "A deterministic linter for prediction-market resolution criteria. 16 rules, each mapped to a real dispute class. Load a market that actually blew up and watch it fail.",
    "The thesis: most prediction-market disputes are not oracle failures, they are writing failures. Two of the four sample markets are real ones that went wrong, one is a recurring class of dispute, and one is a control that should come back clean.",
    "Each rule counts once, however many times it matches, because six vague adjectives are one writing problem, not six. A blocker costs 22 points, a major issue 12 and a minor one 5, from 100. Any blocker, or a score under 55, means do not list. Under 80 needs a rewrite.",
  ],
  formulas: [{ label: "Score", expr: "max(0, 100 − 22 × blockers − 12 × major − 5 × minor)" }],
  buildNote:
    "No model call. Regex, a clause checklist, and a scoring function. Built to make the point that this class of failure is catchable by a checklist nobody runs.",
  sources: [
    {
      label: "The Defiant: the $60M+ dispute over Strategy's May Bitcoin sale",
      href: "https://thedefiant.io/news/markets/usd85m-polymarket-dispute-over-strategy-s-may-bitcoin-sale-puts-uma-s-token-voting-oracle-on",
    },
    {
      label: "Orochi Network: oracle manipulation in Polymarket, 2025",
      href: "https://orochi.network/blog/oracle-manipulation-in-polymarket-2025",
    },
    { label: "Polymarket docs: how resolution works", href: "https://docs.polymarket.com/concepts/resolution" },
  ],
};

/* ------------------------------------------------------------------ rules */

const SEV = { blocker: 22, major: 12, minor: 5 };

const SPORT_WORDS = /\b(match|game|fight|bout|race|series|final|semifinal|tournament|season|playoff)\b/i;
// A threshold is a number carrying a unit, not any digit in the text. Without
// the unit this matched dates and timestamps and fired on every clean market.
const HAS_THRESHOLD = /\b\d[\d,]*(\.\d+)?\s?(%|percent|bps|basis points?|points?|dollars?|usd|btc|eth|shares?|contracts?)\b/i;

/** Each rule returns [] or a list of {excerpt, note}. */
const RULES = [
  {
    id: "no-source",
    label: "No named source of truth",
    severity: "blocker",
    why: "If the text does not name who decides, the oracle decides what the text meant. That is where token-weighted voting starts mattering more than the event.",
    fix: 'Name one primary source and one fallback: "per the official classification published at <URL> by <body>. If unavailable, <secondary source>."',
    test: (t) => {
      // Three ways a source can be named, any one of which counts:
      // an explicit attribution phrase, a "<verb> by/at <someone>" clause
      // (which must tolerate "as FIRST published by"), or a bare domain.
      const attribution = /\b(according to|per the|source of truth|resolution source|based on data from)\b/i;
      const byClause =
        /\b(published|reported|announced|determined|recorded|stated|filed|released|calculated)\s+(by|at|with|on|in)\s+\S/i;
      const domain = /\b[a-z0-9-]+\.(gov|com|org|io|net|co|edu)\b/i;
      return attribution.test(t) || byClause.test(t) || domain.test(t)
        ? []
        : [{ excerpt: "(absent)", note: "no resolution source named anywhere in the text" }];
    },
  },
  {
    id: "no-timezone",
    label: "Deadline without a timezone",
    severity: "blocker",
    why: "A market that closes 'on March 31' closes at different moments for the trader, the source, and the resolver. Disputes cluster in that gap.",
    fix: 'Write the instant, not the day: "before 23:59:59 UTC on 2026-03-31".',
    test: (t) => {
      const hasDate =
        /\b(20\d\d-\d{2}-\d{2}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}|\b\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))/i.test(
          t
        ) || /\b(before|by|prior to|deadline|expires?|closes?)\b/i.test(t);
      const hasTz = /\b(utc|gmt|z\b|est|edt|et\b|pst|pdt|pt\b|cet|sgt|jst|local time|[+-]\d{2}:\d{2})\b/i.test(t);
      return hasDate && !hasTz
        ? [{ excerpt: "(absent)", note: "a date or deadline is present but no timezone is fixed" }]
        : [];
    },
  },
  {
    id: "no-source-failure",
    label: "No fallback if the source fails",
    severity: "major",
    why: "Sources get delayed, revised, paywalled, and retracted. If the text is silent, every one of those becomes a judgement call made after money is at risk.",
    fix: 'Add: "If <source> has not published by <instant>, resolution defers to <secondary>. If <source> later revises, the first published value stands."',
    test: (t) =>
      /\b(if|where|should|unless)\b[^.]{0,80}\b(unavailable|not published|has not|have not|does not publish|do not publish|neither|fails? to|delayed|silent|revis|retract|conflict|withdrawn|annulled|amended|superseded)\b/i.test(
        t
      ) || /\bin the event (that )?(the )?(source|data|report|filing)\b/i.test(t)
        ? []
        : [{ excerpt: "(absent)", note: "no clause covers a late, revised, or conflicting source" }],
  },
  {
    id: "no-void-rule",
    label: "No void / tie / N-A rule",
    severity: "major",
    why: "When an event becomes unresolvable, an oracle with no instruction can settle the market 50-50. Nobody was wrong about the world. The sentence was just unwriteable.",
    fix: 'State it: "If the event does not occur by <instant>, the market resolves NO" or "...voids and all positions are refunded."',
    test: (t) => {
      const vocabulary =
        /\b(void(s|ed|ing)?|invalid(ated)?|refund(s|ed|ing)?|cancel(s|led|ed|lation)?|tie(s|d)?|draw|50-50|50\/50|n\/a|does not occur|fails to occur|no official result)\b/i;
      // "If X has not published by <instant>, this market resolves NO" is a
      // complete instruction for the unresolvable case even with no void word.
      const explicitFallthrough =
        /\b(if|where|unless|should)\b[^.]{0,120}\b(not|neither|fails?|no )\b[^.]{0,120}\bresolves?\s+(yes|no)\b/i;
      return vocabulary.test(t) || explicitFallthrough.test(t)
        ? []
        : [{ excerpt: "(absent)", note: "no instruction for the unresolvable case" }];
    },
  },
  {
    id: "no-edge-cases",
    label: "Sports market with no abandonment rule",
    severity: "major",
    why: "Postponement, abandonment, forfeit, walkover, and extra time are not rare. Over a season they are the single largest source of settlement tickets.",
    fix: 'Enumerate them: "Extra time and penalties count. A match postponed beyond <instant> resolves NO. An abandoned match resolves per <governing body> official result."',
    test: (t) => {
      if (!SPORT_WORDS.test(t)) return [];
      return /\b(postpon|abandon|forfeit|walkover|suspend|rescheduled|extra time|overtime|penalt|replay|no contest|retire)\b/i.test(
        t
      )
        ? []
        : [{ excerpt: "(absent)", note: "sports event with no postponement or abandonment clause" }];
    },
  },
  {
    id: "subjective-adjective",
    label: "Subjective adjective doing load-bearing work",
    severity: "blocker",
    why: "These words feel precise while carrying no test. Two honest readers land on opposite settlements and both can defend it.",
    fix: "Replace each with a threshold and a source. 'Significant' becomes a number. 'Officially' becomes a named publisher.",
    test: (t) =>
      matchAll(
        t,
        /\b(significant(ly)?|major|substantial(ly)?|material(ly)?|widely|successful(ly)?|meaningful|credible|notable|reasonable|appropriate|properly|acceptable|clearly|effectively|essentially|largely|primarily)\b/gi
      ),
  },
  {
    id: "unbounded-time",
    label: "Unbounded time reference",
    severity: "blocker",
    why: "A market with no terminal instant cannot be settled, only argued about. It also cannot be priced, because the discount rate is undefined.",
    fix: "Every temporal phrase resolves to a timestamp. If you cannot write one, the market is not listable.",
    test: (t) =>
      matchAll(
        t,
        /\b(soon|in the near future|eventually|at some point|in due course|shortly|imminent(ly)?|end of (the )?(year|month|quarter|season)(?!\s+on)|by year[- ]end)\b/gi
      ),
  },
  {
    id: "announce-vs-complete",
    label: "Announcement and completion conflated",
    severity: "major",
    why: "A deal announced is not a deal signed is not a deal closed. Markets that do not pick one settle on whichever the largest holder argues for.",
    fix: 'Pick the earliest verifiable one and say so: "resolves YES on public announcement by <party>, regardless of whether the transaction later closes."',
    test: (t) => {
      const ann = /\b(announce[sd]?|announcement|reveal(s|ed)?|confirms?)\b/i.test(t);
      const comp = /\b(complete[sd]?|completion|clos(e|es|ed|ing)|finaliz|execut(e|ed)|sign(s|ed)?|settle[sd]?)\b/i.test(t);
      // If the text explicitly designates one of the two, it has already done
      // the thing this rule asks for.
      const designated =
        /\b(is not sufficient|are not sufficient|does not qualify|do not qualify|regardless of whether|is required|alone does not|is insufficient)\b/i.test(
          t
        );
      return ann && comp && !designated
        ? [{ excerpt: "announce + complete", note: "both trigger words present, neither is designated" }]
        : [];
    },
  },
  {
    id: "weasel-quantifier",
    label: "Approximate number in a threshold",
    severity: "major",
    why: "'Approximately 10,000' has no edge. The dispute is always about the boundary case, so the boundary is the only part that matters.",
    fix: "State the comparison exactly: 'at or above 10,000' or 'strictly greater than 10,000'.",
    test: (t) => matchAll(t, /\b(approximately|around|roughly|about|nearly|almost|close to|circa|~)\s*\d/gi),
  },
  {
    id: "passive-determiner",
    label: "Passive verb with no actor",
    severity: "major",
    why: "'Is deemed' by whom. The passive voice hides the exact fact the resolver needs, which is the identity of the decider.",
    fix: "Name the actor: 'as determined by <named body>'.",
    test: (t) => {
      const hits = matchAll(
        t,
        /\b(is|are|will be|shall be|has been|have been)\s+(confirmed|determined|deemed|considered|judged|verified|established|recognized|recognised|accepted|declared)\b/gi
      );
      return hits.filter((h) => {
        const after = t.slice(t.indexOf(h.excerpt) + h.excerpt.length, t.indexOf(h.excerpt) + h.excerpt.length + 40);
        return !/\bby\s+[A-Z"']/.test(after) && !/\bby the\b/i.test(after);
      });
    },
  },
  {
    id: "ambiguous-deadline",
    label: "Inclusive or exclusive deadline is undefined",
    severity: "major",
    why: "'Before April' excludes April 1. 'By April' probably includes it. The two readings are one day apart and that day is where the money sits.",
    fix: "Use an instant with an explicit operator: 'at or before 23:59:59 UTC on 2026-03-31'.",
    test: (t) => {
      const hits = matchAll(t, /\b(before|by|prior to|through|until)\s+(the\s+)?[A-Z0-9]/g);
      const explicit = /\b(at or before|on or before|inclusive|exclusive|23:59|00:00|end of day)\b/i.test(t);
      return explicit ? [] : hits;
    },
  },
  {
    id: "compound-condition",
    label: "Compound condition with no grouping",
    severity: "major",
    why: "'A and B or C' has two readings. Traders price one, the resolver applies the other.",
    fix: "Break into a numbered list, or parenthesise: '(A and B) or C'.",
    test: (t) =>
      sentencesOf(t)
        .filter((s) => {
          // "at or before" and "at or above" are fixed comparison phrases, not
          // disjunctions. Counting their "or" flags every well-written deadline.
          const cleaned = s.replace(
            /\b(at|on)\s+or\s+(above|below|before|after|later|earlier|equal)\b/gi,
            " "
          );
          const ands = (cleaned.match(/\band\b/gi) || []).length;
          const ors = (cleaned.match(/\bor\b/gi) || []).length;
          return ands >= 1 && ors >= 1 && !/[()]/.test(s) && !/^\s*\d+[.)]/.test(s);
        })
        .map((s) => ({ excerpt: trim(s, 110), note: "mixes AND and OR without grouping" })),
  },
  {
    id: "any-all-scope",
    label: "Quantifier scope undefined",
    severity: "minor",
    why: "'Any of the following' and 'all of the following' are opposite tests, and 'the following' is often a list of three things where only two are checkable.",
    fix: "Say the count: 'at least one of', 'each of the three'.",
    test: (t) => matchAll(t, /\b(any|all|either|each)\s+(of\s+)?(the\s+)?(following|these|them|criteria|conditions)\b/gi),
  },
  {
    id: "undefined-superlative",
    label: "Superlative with no tie-break",
    severity: "minor",
    why: "'The largest' and 'the first' both have tie cases, and ties in a binary market have to go somewhere.",
    fix: "Add the tie-break rule and the measurement instant.",
    test: (t) => {
      // "the first published figure" is a precision clause, not a contest with
      // a tie case. Only fire on superlatives that rank competitors.
      const hits = matchAll(
        t,
        /\b(first|largest|highest|lowest|best|most|top|leading|biggest)\b(?!\s+(published|filed|reported|released|stated|announced|recorded|instance|publication|figure|value|print|filing))/gi
      );
      return /\b(tie|tied|tie-break|tiebreak|in the event of a tie)\b/i.test(t) ? [] : hits;
    },
  },
  {
    id: "no-rounding",
    label: "Threshold with no rounding or comparison rule",
    severity: "minor",
    why: "Sources publish to different precision than the market assumes. The revision that adds a decimal place flips the settlement.",
    fix: "State precision and operator: 'as published to one decimal place, resolves YES if at or above 3.0'.",
    test: (t) => {
      if (!HAS_THRESHOLD.test(t)) return [];
      return /\b(at or above|at or below|greater than or equal|less than or equal|>=|<=|rounded|round(s|ing)? to|decimal place|inclusive)\b/i.test(
        t
      )
        ? []
        : [{ excerpt: "(absent)", note: "a numeric threshold exists with no comparison operator or precision" }];
    },
  },
  {
    id: "vague-pronoun",
    label: "Sentence opens on an unanchored pronoun",
    severity: "minor",
    why: "Cheap to fix, and it is the difference between a rule and a paragraph about a rule.",
    fix: "Repeat the noun. Resolution text is not prose, repetition is a feature.",
    test: (t) =>
      sentencesOf(t)
        .filter((s) => /^(it|this|that|they|these|those)\b/i.test(s.trim()))
        .map((s) => ({ excerpt: trim(s, 90), note: "opens on a pronoun with no clear antecedent" })),
  },
];

function matchAll(text, re) {
  const out = [];
  const seen = new Set();
  for (const m of text.matchAll(re)) {
    const key = m[0].toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ excerpt: m[0], note: contextOf(text, m.index, m[0].length) });
  }
  return out;
}

function contextOf(text, at, len) {
  const s = Math.max(0, at - 34);
  const e = Math.min(text.length, at + len + 34);
  return `${s > 0 ? "..." : ""}${text.slice(s, e).replace(/\s+/g, " ")}${e < text.length ? "..." : ""}`;
}

function sentencesOf(t) {
  return t.split(/(?<=[.!?])\s+|\n+/).filter((s) => s.trim().length > 3);
}

const trim = (s, n) => (s.length > n ? `${s.slice(0, n).trim()}...` : s.trim());

/* ------------------------------------------------------------------ lint */

export function lint(text) {
  const findings = [];
  for (const rule of RULES) {
    const hits = rule.test(text || "");
    for (const h of hits) {
      findings.push({
        id: rule.id,
        label: rule.label,
        severity: rule.severity,
        why: rule.why,
        fix: rule.fix,
        excerpt: h.excerpt,
        note: h.note,
      });
    }
  }
  // A rule fires once for scoring even if it matched six times. Six vague
  // adjectives is one writing problem, not six.
  const byRule = new Map();
  for (const f of findings) if (!byRule.has(f.id)) byRule.set(f.id, f);
  const penalty = [...byRule.values()].reduce((n, f) => n + SEV[f.severity], 0);
  const score = Math.max(0, 100 - penalty);

  const counts = {
    blocker: [...byRule.values()].filter((f) => f.severity === "blocker").length,
    major: [...byRule.values()].filter((f) => f.severity === "major").length,
    minor: [...byRule.values()].filter((f) => f.severity === "minor").length,
  };

  const verdict =
    counts.blocker > 0 || score < 55
      ? { key: "block", label: "Do not list", tone: "critical" }
      : score < 80
        ? { key: "work", label: "Needs a rewrite", tone: "warning" }
        : { key: "ok", label: "Listable", tone: "good" };

  return { findings, score, counts, verdict, rulesRun: RULES.length };
}

/* -------------------------------------------------------------- examples */

const EXAMPLES = [
  {
    id: "ukraine",
    name: "Ukraine minerals (real, resolved wrong)",
    label: "Ukraine minerals",
    receipt:
      "Traded on Polymarket. Between 24 and 25 March 2025 the odds moved 9% to 100% and it resolved YES with no agreement reached. The attacker cast 5M UMA, about 25% of that resolution round.",
    text: `Will Ukraine agree to Trump's mineral deal before April?

This market will resolve YES if Ukraine officially agrees to the minerals deal before April. Otherwise it will resolve NO.

The resolution will be determined by credible reporting.`,
    rewrite: `Will Ukraine sign the US minerals agreement at or before 23:59:59 UTC on 2026-03-31?

Resolves YES if, at or before 23:59:59 UTC on 2026-03-31, the Cabinet of Ministers of Ukraine publishes a signed bilateral minerals agreement with the United States on kmu.gov.ua, or the US Department of State publishes the executed text on state.gov.

Announcement is not sufficient. A signed and published document is required. A framework, memorandum of understanding, or statement of intent does not qualify.

If neither source has published by the deadline, this market resolves NO. This market does not void.

If a signed text is published and later withdrawn, the first publication stands. The same applies if the agreement is annulled.`,
  },
  {
    id: "strategy-btc",
    name: "Strategy sells Bitcoin (real, $60M disputed)",
    label: "Strategy sells Bitcoin",
    receipt:
      "A $60M+ dispute over whether Strategy sold Bitcoin in May put UMA's token-voting oracle on trial. A WSJ investigation in May 2026 found that in most disputed markets, more than half the votes came from the ten largest wallets.",
    text: `Will Strategy sell Bitcoin in May?

Resolves YES if Strategy sells any significant amount of its Bitcoin holdings during May.

This will be determined by official company filings or credible reporting.`,
    rewrite: `Will Strategy report a decrease in total bitcoin holdings for May 2026?

Resolves YES if Strategy's total bitcoin held is lower at 2026-05-31 than at 2026-04-30. The figure is taken from the next Form 8-K or 10-Q filed with the SEC, as published on sec.gov.

The comparison uses total BTC count, not USD value. Any decrease, however small, resolves YES.

If the relevant filing has not been published by 23:59:59 UTC on 2026-08-15, this market resolves NO.

Press reports, executive statements, and on-chain analysis do not resolve this market. Only the SEC filing does.

If a filing is later amended, the first filed figure stands.`,
  },
  {
    id: "match",
    name: "Sports abandonment (the season-long ticket generator)",
    label: "A sports match",
    receipt:
      "Not one incident, a recurring class. Postponement, abandonment, forfeit and extra time are the largest steady source of settlement tickets across a season.",
    text: `Will Team A win the match on Saturday?

Resolves YES if Team A wins the match. Resolves NO if they do not.

The result will be confirmed after the game ends.`,
    rewrite: `Will Team A be the winner of the Team A vs Team B fixture scheduled 2026-08-15?

Resolves YES if Team A is recorded as the winner in the official result published by the competition organiser at <organiser URL>.

Extra time and penalty shootouts count toward the result. A draw after regulation, where the competition records no winner, resolves NO.

If the fixture is postponed and completed at or before 23:59:59 UTC on 2026-08-29, the market follows the rescheduled result. If the fixture is not completed by that instant, the market voids and all positions are refunded. An abandoned fixture with no official result recorded also voids.

If the organiser has not published an official result within 72 hours of the final whistle, the market voids.

A walkover or forfeit awarded to Team A resolves YES.`,
  },
  {
    id: "cpi",
    name: "CPI print (control: how it should read)",
    label: "A well-written market",
    receipt:
      "Nothing broke here. This is what a market looks like when the sentence was written before the listing, not after the dispute.",
    text: `Will US CPI year-over-year for July 2026 come in at or above 3.0%?

Resolves YES if the year-over-year change in the US Consumer Price Index for All Urban Consumers (CPI-U, not seasonally adjusted), as first published by the Bureau of Labor Statistics at bls.gov, is at or above 3.0%.

The figure is read to one decimal place exactly as published. 2.95 rounded by BLS to 3.0 resolves YES. 3.04 published as 3.0 resolves YES.

Scheduled release is 2026-08-12 at 12:30 UTC. If BLS has not published by 23:59:59 UTC on 2026-08-26, this market voids and all positions are refunded.

Subsequent revisions do not change the resolution. The first published figure stands.`,
    rewrite: null,
  },
];

/* ------------------------------------------------------------------- view */

// Plain-English names for the rules, by id. The rule's own label stays in the
// "all rules" table.
const PLAIN = {
  "no-source": "No named source of truth",
  "no-timezone": "A deadline with no timezone",
  "no-source-failure": "No fallback if the source fails",
  "no-void-rule": "No rule for a market that cannot settle",
  "no-edge-cases": "No rule for a postponed or abandoned match",
  "subjective-adjective": "Vague words that can be read two ways",
  "unbounded-time": "A time reference with no real date",
  "announce-vs-complete": "Announced and completed not told apart",
  "weasel-quantifier": "An approximate number in a threshold",
  "passive-determiner": "A decision with no one named to make it",
  "ambiguous-deadline": "Unclear whether the deadline day counts",
  "compound-condition": "“And” and “or” mixed without brackets",
  "any-all-scope": "“Any” or “all” with no count",
  "undefined-superlative": "A “first” or “largest” with no tie-break",
  "no-rounding": "A number threshold with no rounding rule",
  "vague-pronoun": "A sentence that opens on “it” or “this”",
};

const SEVERITY = {
  blocker: { tone: "bad", word: "Blocker", note: "Fix before listing" },
  major: { tone: "warn", word: "Major", note: "A dispute is likely" },
  minor: { tone: "neutral", word: "Minor", note: "Tighten in review" },
};

const VERDICT_TONE = { block: "bad", work: "warn", ok: "good" };

const plural = (n, one, many = `${one}s`) => (n === 1 ? one : many);
const lowerFirst = (s) => `${s.charAt(0).toLowerCase()}${s.slice(1)}`;
const sentence = (s) => {
  const t = String(s).trim();
  return t ? `${t[0].toUpperCase()}${t.slice(1)}${/[.!?…]$/.test(t) ? "" : "."}` : "";
};

/** Findings grouped by rule, worst first: the same grouping as the score uses. */
function groupFindings(findings) {
  const grouped = [];
  const seen = new Set();
  for (const f of findings) {
    if (seen.has(f.id)) {
      grouped[grouped.findIndex((g) => g.id === f.id)].hits.push(f);
    } else {
      seen.add(f.id);
      grouped.push({ ...f, hits: [f] });
    }
  }
  const order = { blocker: 0, major: 1, minor: 2 };
  return grouped.sort((a, b) => order[a.severity] - order[b.severity]);
}

/* A hit is a short quote from the market's text with the matched words marked,
   or, for something missing, a plain sentence saying what is absent. */

// Some matches stop at their first character ("before A"). Take the rest of the word.
function matchEnd(text, at, len) {
  const rest = text.slice(at + len).match(/^[\w%'’-]*(?:[.,]\d[\w%]*)*/)[0];
  return at + len + rest.length;
}

// Excerpts are cut at a fixed length. Drop the half word and use a real ellipsis.
const tidy = (s) => s.replace(/\s+/g, " ").replace(/\s+\S*\.\.\.$/, "…");

function hitHtml(h) {
  if (h.excerpt === "(absent)" || h.id === "announce-vs-complete") return `<li>${esc(sentence(h.note))}</li>`;
  const ctx = h.note.replace(/^\.\.\./, "… ").replace(/\.\.\.$/, " …");
  const at = ctx.toLowerCase().indexOf(h.excerpt.toLowerCase());
  if (at >= 0) {
    const end = matchEnd(ctx, at, h.excerpt.length);
    return `<li class="mrc-quote">${esc(ctx.slice(0, at))}<mark>${esc(ctx.slice(at, end))}</mark>${esc(ctx.slice(end))}</li>`;
  }
  return `<li class="mrc-quote">“${esc(tidy(h.excerpt))}”<span class="mrc-quote-note">${esc(sentence(h.note))}</span></li>`;
}

function findingHtml(g) {
  const sev = SEVERITY[g.severity];
  const shown = g.hits.slice(0, 3);
  const more = g.hits.length - shown.length;
  return `
    <li class="kit-card mrc-finding">
      <div class="mrc-finding-top">${status(sev.tone, sev.word)}<span class="mrc-finding-note">${esc(sev.note)}</span></div>
      <h3 class="mrc-finding-title">${esc(PLAIN[g.id] || g.label)}</h3>
      <ul class="mrc-hits">${shown.map(hitHtml).join("")}${more > 0 ? `<li class="mrc-more">and ${more} more</li>` : ""}</ul>
      <p class="mrc-why">${esc(g.why)}</p>
      <div class="mrc-fix"><p class="mrc-fix-label">Suggested fix</p><p>${esc(g.fix)}</p></div>
    </li>`;
}

/** The live sentence under the hero number, from the findings. */
function verdictFor(r, top) {
  const { blocker, major, minor } = r.counts;
  if (!r.findings.length) {
    return "Nothing here is likely to start a dispute. Every clause the checker looks for is present, and no vague wording matched.";
  }
  const worst = hl(lowerFirst(PLAIN[top.id] || top.label));
  if (!blocker && !major) {
    return `Nothing here is likely to start a dispute. Worth tightening: ${worst}${minor > 1 ? `, and ${hl(String(minor - 1))} more` : ""}.`;
  }
  if (blocker) {
    return `The most serious problem: ${worst}. A market with a blocker should not list until it is fixed.`;
  }
  return `The most serious problem: ${worst}. Until it is fixed, two readers could settle this market differently.`;
}

/** The detail behind the verdict: the score, and every rule with its ID. */
function rulesHtml(r, grouped) {
  const fired = new Set(grouped.map((g) => g.id));
  const rows = RULES.map((rl) => [
    rl.label,
    rl.id,
    `${rl.severity[0].toUpperCase()}${rl.severity.slice(1)}`,
    fired.has(rl.id) ? "Fired" : "Clear",
  ]);
  rows.sort((a, b) => (b[3] === "Fired") - (a[3] === "Fired"));
  return `
    <p class="mrc-score">Score: ${hl(`${r.score} out of 100`)}. Each rule that fires counts once, however many times it matches: a blocker costs ${SEV.blocker} points, a major issue ${SEV.major} and a minor one ${SEV.minor}.</p>
    <div class="mrc-rules">${table(["Rule", "Rule ID", "Severity", "Result"], rows)}</div>`;
}

function reportText(r) {
  return [
    `Market Rules Check: ${r.verdict.label} (score ${r.score}/100)`,
    `${r.counts.blocker} blockers, ${r.counts.major} major, ${r.counts.minor} minor`,
    "",
    ...r.findings.map((f) => `[${f.severity}] ${f.label}: ${f.excerpt === "(absent)" ? f.note : f.excerpt}`),
  ].join("\n");
}

/** What a sample's rewrite scores, said from the rules rather than asserted. */
function rewriteNote(ex) {
  const rr = lint(ex.rewrite);
  const risk = rr.counts.blocker + rr.counts.major;
  return `A rewrite of the same market. It comes back ${rr.verdict.label.toLowerCase()}, with ${risk} ${plural(risk, "issue")} likely to start a dispute.`;
}

export function mount(root) {
  root.innerHTML = `
    <div class="mrc">
      <div data-slot="bar"></div>
      <div class="kit-grid kit-grid-split">
        <section class="kit-panel mrc-input" aria-label="The market's rules">
          <div class="mrc-field">
            <label class="kit-label" for="mrc-src">Market question and resolution rules</label>
            <textarea id="mrc-src" class="kit-textarea mrc-textarea" spellcheck="false" aria-describedby="mrc-help"
              placeholder="Paste the market question and its resolution criteria."></textarea>
            <p class="kit-help" id="mrc-help">Everything runs in your browser. Edit the text and the check updates as you type.</p>
          </div>
          <div class="kit-actions">
            <button type="button" class="kit-text-btn" data-act="rewrite" hidden>See a rewrite</button>
            <button type="button" class="kit-text-btn" data-act="copy">Copy report</button>
            <button type="button" class="kit-text-btn" data-act="clear">Clear</button>
          </div>
        </section>
        <div class="kit-stage">
          <div data-slot="answer"></div>
          <div data-slot="empty" hidden>${card({ title: "Nothing to check yet", body: "<p>Paste a market's rules, or pick a sample above.</p>" })}</div>
          <div data-slot="findings"></div>
        </div>
      </div>
      ${disclosure({ summary: `See all ${RULES.length} rules`, className: "kit-breakdown" })}
      <p class="mrc-sr" role="status" data-slot="status"></p>
    </div>`;

  const $ = (sel) => root.querySelector(sel);
  const src = $("#mrc-src");
  const emptyEl = $('[data-slot="empty"]');
  const findingsEl = $('[data-slot="findings"]');
  const statusEl = $('[data-slot="status"]');
  const rewriteBtn = $('[data-act="rewrite"]');
  const breakdown = $(".kit-breakdown");
  const breakdownBody = breakdown.querySelector(".kit-disclosure-body");

  const answer = answerCard();
  $('[data-slot="answer"]').replaceWith(answer.el);

  const bar = scenarioBar({
    items: EXAMPLES.map((e) => ({ id: e.id, label: e.label, note: e.receipt })),
    label: "Sample market",
    onSelect: (id) => load(id),
  });
  $('[data-slot="bar"]').replaceWith(bar.el);
  const noteEl = bar.el.querySelector(".kit-scenarios-note");

  let current = null; // the sample on screen, or null
  let showingRewrite = false;
  let edited = false; // the reader has changed the text

  const syncActions = () => {
    rewriteBtn.hidden = !current?.rewrite || edited;
    rewriteBtn.textContent = showingRewrite ? "Back to the original" : "See a rewrite";
  };

  function render({ animate = false } = {}) {
    const empty = !src.value.trim();
    answer.el.hidden = empty;
    findingsEl.hidden = empty;
    emptyEl.hidden = !empty;
    breakdown.hidden = empty;
    if (empty) return;

    const r = lint(src.value);
    const grouped = groupFindings(r.findings);
    const { blocker, major, minor } = r.counts;
    const risk = blocker + major;

    answer.update(
      {
        label: "Dispute check",
        value: risk,
        format: (v) => String(Math.round(v)),
        unit: `${plural(risk, "issue")} likely to start a dispute`,
        tone: VERDICT_TONE[r.verdict.key],
        status: r.verdict.label,
        verdict: verdictFor(r, grouped[0]),
        stats: [
          { label: "Blockers", value: String(blocker), sub: SEVERITY.blocker.note },
          { label: "Major issues", value: String(major), sub: SEVERITY.major.note },
          { label: "Minor issues", value: String(minor), sub: SEVERITY.minor.note },
        ],
      },
      { animate }
    );

    const clear = RULES.length - grouped.length;
    findingsEl.innerHTML = grouped.length
      ? `<section class="mrc-findings" aria-labelledby="mrc-found-h">
           <div class="kit-section-head"><h2 id="mrc-found-h">What to fix</h2><p>Worst first, each with a suggested fix.</p></div>
           <ol class="mrc-list">${grouped.map(findingHtml).join("")}</ol>
           <p class="mrc-clear">${clear} of ${RULES.length} rules came back clear.</p>
         </section>`
      : `<p class="mrc-clear">All ${RULES.length} rules came back clear.</p>`;

    breakdownBody.innerHTML = rulesHtml(r, grouped);
  }

  function load(id) {
    const ex = EXAMPLES.find((x) => x.id === id);
    if (!ex) return;
    current = ex;
    showingRewrite = false;
    edited = false;
    src.value = ex.text;
    bar.select(ex.id);
    syncActions();
    render({ animate: true });
  }

  rewriteBtn.addEventListener("click", () => {
    if (!current?.rewrite || edited) return;
    showingRewrite = !showingRewrite;
    src.value = showingRewrite ? current.rewrite : current.text;
    noteEl.textContent = showingRewrite ? rewriteNote(current) : current.receipt;
    syncActions();
    render({ animate: true });
  });

  $('[data-act="clear"]').addEventListener("click", () => {
    src.value = "";
    current = null;
    showingRewrite = false;
    edited = true;
    bar.select(null);
    noteEl.textContent = "Paste a market's rules, or pick a sample above.";
    syncActions();
    render();
    src.focus();
  });

  const copyBtn = $('[data-act="copy"]');
  copyBtn.addEventListener("click", async () => {
    let message = "Copied";
    try {
      await navigator.clipboard.writeText(reportText(lint(src.value)));
    } catch {
      message = "Copy blocked";
    }
    copyBtn.textContent = message;
    statusEl.textContent = message === "Copied" ? "Report copied to the clipboard." : "The browser blocked copying.";
    setTimeout(() => {
      copyBtn.textContent = "Copy report";
      statusEl.textContent = "";
    }, 1400);
  });

  src.addEventListener("input", () => {
    if (!edited) {
      edited = true;
      bar.select(null);
      noteEl.textContent = "Your own text. Pick a sample above to start over.";
      syncActions();
    }
    render();
  });

  load(EXAMPLES[0].id);
}
