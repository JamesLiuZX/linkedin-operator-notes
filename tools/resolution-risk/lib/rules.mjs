// tools/resolution-risk/lib/rules.mjs
// The rule table. This file is the actual IP of the scanner.
//
// Every rule encodes one way a resolution criteria sentence has historically
// produced a dispute. A rule is not "this market is wrong". A rule is "this
// sentence has a hole in it that two honest people can read differently".
//
// Severity is about dispute cost, not about how ugly the writing is:
//   critical - two good-faith readers reach opposite payouts
//   high     - resolution is decidable but only after an argument
//   medium   - resolution is decidable, edge cases will generate support load
//   low      - hygiene, cheap to fix, embarrassing if it bites
//
// Zero dependencies, same as scripts/content-check.mjs.

export const SEVERITY_WEIGHT = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 4,
};

// ------------------------------------------------------------------ helpers

// Collect up to `cap` windows of surrounding text for each regex hit, so the
// report shows the offending phrase in context rather than just naming a rule.
function matches(text, re, cap = 3) {
  const out = [];
  const rx = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let m;
  while ((m = rx.exec(text)) !== null && out.length < cap) {
    const start = Math.max(0, m.index - 40);
    const end = Math.min(text.length, m.index + m[0].length + 40);
    out.push({
      term: m[0].trim(),
      excerpt: (start > 0 ? '…' : '') + text.slice(start, end).replace(/\s+/g, ' ').trim() + (end < text.length ? '…' : ''),
    });
    if (m.index === rx.lastIndex) rx.lastIndex++;
  }
  return out;
}

function has(text, re) {
  return new RegExp(re.source, re.flags.replace('g', '')).test(text);
}

// ------------------------------------------------------------------- rules

export const RULES = [
  {
    id: 'undefined-threshold',
    label: 'Undefined qualitative threshold',
    severity: 'critical',
    why: 'A judgement word with no number behind it. The oracle is being asked for an opinion, not a fact.',
    fix: 'Replace the adjective with a number and a unit. "Major" becomes ">= 10,000 units". "Widely reported" becomes "reported by at least 2 of [named list]".',
    detect: (t) => matches(t, /\b(major|significant|substantial|meaningful|widely|broadly|generally|materially|successful|credible|reputable|notable|considerable|reasonable)\b/i),
  },
  {
    id: 'no-named-source',
    label: 'No named source of truth',
    severity: 'critical',
    why: 'Criteria defers to "reporting" or "sources" in the abstract. Every dispute then becomes an argument about which outlet counts.',
    fix: 'Name the exact source and the exact field. "Per the BLS Employment Situation release, Table A-1, seasonally adjusted."',
    detect: (t) => {
      // Only fires when vague sourcing appears AND no concrete source is named.
      const vague = matches(t, /\b(credible (news )?(sources?|reporting|media)|reliable sources?|news reports?|media reports?|public(ly)? (available )?(information|reporting)|widely reported)\b/i);
      if (!vague.length) return [];
      const named = has(t, /\b(according to|as (published|reported|released) by|per the|source:)\s+[A-Z]/);
      const hasProperNoun = has(t, /\b(Reuters|Associated Press|Bloomberg|BLS|CFTC|SEC|FRED|CoinGecko|CoinMarketCap|Chainlink|ESPN|FIFA|UEFA|NBA|NFL|official website|press release)\b/i);
      return named && hasProperNoun ? [] : vague;
    },
  },
  {
    id: 'single-source-fragility',
    label: 'Single source with no fallback',
    severity: 'high',
    why: 'One named source and no successor clause. Pages get paywalled, accounts get deleted, APIs get versioned. The market outlives the URL.',
    fix: 'Name a primary and at least one fallback, plus what happens if both are unavailable at resolution time.',
    detect: (t) => {
      const single = matches(t, /\b(the official [\w\s]{0,24}?(website|account|page|feed|site|portal|statistics)|https?:\/\/\S+|@[A-Za-z0-9_]{2,15}\b)/i);
      if (!single.length) return [];
      const fallback = has(t, /\b(if (that|the|this) (source|site|page|feed|account) is (unavailable|down|deleted|inaccessible)|fallback|backup source|successor|in the event the source)\b/i);
      return fallback ? [] : single;
    },
  },
  {
    id: 'missing-timezone',
    label: 'Deadline without timezone',
    severity: 'high',
    why: 'A date boundary with no timezone is a 24-hour window of disagreement, and it always bites on the last day.',
    fix: 'Every timestamp gets an explicit zone and an inclusive/exclusive marker. "before 23:59:59 ET on 3 Nov 2026 (inclusive)".',
    detect: (t) => {
      // Two shapes: a deadline word followed by a date token, or a bare
      // "end of the year" style boundary which is timezone-ambiguous on its own.
      const dated = matches(t, /\b(by|before|on or before|prior to|no later than|as of)\b[^.]{0,60}?\b(\d{1,2}(st|nd|rd|th)?\s+\w+|\w+\s+\d{1,2}(st|nd|rd|th)?,?\s*\d{4}|\d{4}-\d{2}-\d{2}|midnight|noon)\b/i);
      const bare = matches(t, /\b(end of (the )?(day|month|year|quarter)|year[- ]end|close of (business|play))\b/i);
      const deadline = [...dated, ...bare];
      if (!deadline.length) return [];
      const zoned = has(t, /\b(UTC|GMT|ET|EST|EDT|PT|PST|PDT|CT|CST|SGT|JST|CET|Z\b|UTC[+-]\d)/);
      return zoned ? [] : deadline;
    },
  },
  {
    id: 'no-tie-clause',
    label: 'Comparison with no tie clause',
    severity: 'critical',
    why: 'The market asks whether A beats B and never says what happens when A equals B. Exact ties are rare, which is precisely why nobody writes the clause and everybody argues when it happens.',
    fix: 'State the tie outcome explicitly, including at what precision equality is measured.',
    detect: (t) => {
      // Only quantity-vs-quantity comparisons need a tie clause. A comparison
      // against a fixed numeric threshold is already decided at equality by the
      // strictness of the operator, so it is handled by price-precision instead.
      // "at least" / "at most" / "or more" are inclusive by construction, so
      // they are excluded rather than matched.
      const cmp = [
        ...matches(t, /\b(more|greater|higher|larger|fewer|less|lower)\b(?![\s\w]{0,12}\bthan\b\s*[$€£]?\d)[\s\w]{0,30}?\bthan\b(?!\s*[$€£]?\d)/i),
        ...matches(t, /\b(beats?|outperforms?|outscores?|exceeds?)\b(?!\s*[$€£]?\d)/i),
      ];
      if (!cmp.length) return [];
      const tie = has(t, /\b(tie|tied|equal|exactly the same|in the event of a draw|draw\b|push\b)/i);
      return tie ? [] : cmp;
    },
  },
  {
    id: 'revision-risk',
    label: 'Revisable data with no vintage clause',
    severity: 'high',
    why: 'Official statistics get revised. Without an "as first published" clause the market can resolve one way on Friday and be wrong by the following Thursday.',
    fix: 'Pin the vintage. "As first published on [date]; subsequent revisions are disregarded."',
    detect: (t) => {
      const revisable = matches(t, /\b(GDP|CPI|PPI|unemployment rate|nonfarm payrolls?|jobs report|inflation rate|vote count|final tally|census|earnings report|preliminary (estimate|figure|result))\b/i);
      if (!revisable.length) return [];
      const pinned = has(t, /\b(as first (published|released|reported)|initial (release|print|estimate)|revisions? (will be|are) (disregarded|ignored|excluded)|first print)\b/i);
      return pinned ? [] : revisable;
    },
  },
  {
    id: 'discretionary-escape-hatch',
    label: 'Discretionary escape hatch',
    severity: 'high',
    why: 'Language that hands the decision to a human is the criteria admitting it is incomplete. It converts a written rule into a trust exercise.',
    fix: 'Escape hatches are fine as a last resort, but the clause above them should be specific enough that the hatch never opens.',
    detect: (t) => matches(t, /\b(at (the )?(sole )?discretion|discretion of|the (admin|administrator|team|resolver|oracle) (will|shall|may) (decide|determine|resolve|judge)|deemed appropriate|as determined by the (team|admin|platform)|good faith (judgement|judgment|determination))\b/i),
  },
  {
    id: 'ambiguous-actor',
    label: 'Ambiguous acting entity',
    severity: 'medium',
    why: 'A company announcing something is not one event. A subsidiary blog post, a CEO tweet, and an 8-K are three different facts wearing the same sentence.',
    fix: 'Name the entity and the channel. "A press release published on the investor relations page of the parent entity."',
    detect: (t) => {
      const actor = matches(t, /\b(the company|the government|the team|the organization|the administration|officials?)\s+(announces?|confirms?|states?|declares?|says?|reports?|publishes?)/i);
      if (!actor.length) return [];
      const channel = has(t, /\b(press release|8-K|10-Q|10-K|official (statement|blog|website)|investor relations|SEC filing|verified account)\b/i);
      return channel ? [] : actor;
    },
  },
  {
    id: 'compound-condition',
    label: 'Unparenthesised compound condition',
    severity: 'medium',
    why: 'Three or more clauses joined by and/or with no grouping. "A and B or C" has two readings and they pay differently.',
    fix: 'Break into a numbered list. Resolution logic wants bullet points, not prose.',
    detect: (t) => {
      const hits = matches(t, /\b(and|or)\b/gi, 12);
      if (hits.length < 3) return [];
      const listed = has(t, /(\n\s*[-*\d]|\(i+\)|\(1\)|\ba\)\s)/);
      return listed ? [] : hits.slice(0, 3);
    },
  },
  {
    id: 'missing-null-case',
    label: 'No clause for the event not occurring',
    severity: 'high',
    why: 'Markets contingent on an event happening at all need a rule for the event being cancelled, postponed past expiry, or silently never scheduled.',
    fix: 'Add the null branch. "If the event does not occur before [date], this market resolves NO / voids."',
    detect: (t) => {
      const contingent = matches(t, /\b(if|when|once|upon)\b[^.]{0,80}\b(occurs?|happens?|takes place|is held|is scheduled|is announced|is released|launches?)\b/i);
      if (!contingent.length) return [];
      const nullCase = has(t, /\b(does not occur|fails to occur|is cancell?ed|is postponed|no such event|if no\b|otherwise (resolves?|this market)|void(s|ed)?\b|resolves? NO if)\b/i);
      return nullCase ? [] : contingent;
    },
  },
  {
    id: 'undefined-counting',
    label: 'Count without a counting method',
    severity: 'medium',
    why: 'Any "number of X" question needs inclusion and dedupe rules. Otherwise the count is whatever the counter felt like including.',
    fix: 'Define what counts as one unit, what is excluded, and the snapshot moment the count is taken.',
    detect: (t) => {
      // Requires explicit counting language. A bare "at least 25 basis points"
      // is a magnitude, not a count, and firing on it was pure noise.
      const counting = matches(t, /\b(number of|count of|total (number|count)|how many|tally of)\b/i);
      if (!counting.length) return [];
      const method = has(t, /\b(counted as|excludes?|excluding|duplicates?|unique|distinct|de-?dup|measured (at|as)|snapshot|per the (table|column|field))\b/i);
      return method ? [] : counting;
    },
  },
  {
    id: 'price-precision',
    label: 'Price threshold without venue or precision',
    severity: 'high',
    why: 'A price level with no venue and no precision is three disputes in one: which exchange, which candle, and whether the boundary is inclusive.',
    fix: 'Name the venue, the pair, the aggregation window, and inclusivity. "BTC/USD on Coinbase, 1-minute close, >= $100,000.00".',
    detect: (t) => {
      const price = matches(t, /([$€£]\s?[\d,]+(\.\d+)?|\b\d[\d,]*(\.\d+)?\s?(USD|USDT|EUR|dollars)\b)/i);
      if (!price.length) return [];
      const venue = has(t, /\b(Coinbase|Binance|Kraken|Bitstamp|Coingecko|CoinMarketCap|Chainlink|NYSE|NASDAQ|CME|index price|mark price|spot price on)\b/i);
      const precise = has(t, /\b(inclusive|exclusive|or (higher|greater|above)|or (lower|less|below)|>=|<=|closing price|close of)\b/i);
      return venue && precise ? [] : price;
    },
  },
  {
    id: 'relative-date',
    label: 'Relative date with no anchor',
    severity: 'medium',
    why: '"Within 30 days" is only a date if the sentence says 30 days from what.',
    fix: 'Anchor every interval to a named, observable timestamp.',
    detect: (t) => {
      const rel = matches(t, /\bwithin\s+\d+\s+(days?|weeks?|months?|hours?)\b/i);
      if (!rel.length) return [];
      const anchored = has(t, /\bwithin\s+\d+\s+(days?|weeks?|months?|hours?)\s+(of|after|from|following)\b/i);
      return anchored ? [] : rel;
    },
  },
  {
    id: 'negation-ambiguity',
    label: 'Negative resolution without a distinguishing test',
    severity: 'medium',
    why: 'A "will not happen" market has to separate an explicit denial from mere silence. Those are different worlds and traders price them differently.',
    fix: 'Say whether absence of evidence resolves the market, and at what deadline silence becomes a NO.',
    detect: (t) => {
      const neg = matches(t, /\b(will not|does not|fails? to|no longer|never)\b/i);
      if (!neg.length) return [];
      // A deadline that converts silence into a resolution counts as the
      // distinguishing test, however it happens to be phrased.
      const distinguished = has(
        t,
        /\b(absence of|silence|if no (announcement|statement|confirmation)|lack of (evidence|reporting)|deadline passes|has not (occurred|happened|taken place) by|if .{0,40}not .{0,40}\bby\b .{0,40}(resolves?|market)|resolves? NO if|by that (timestamp|deadline|date))\b/i,
      );
      return distinguished ? [] : neg;
    },
  },
  {
    id: 'close-before-source',
    label: 'Trading close and resolution source may not align',
    severity: 'low',
    why: 'If the market stops trading before the source publishes, there is a window where the answer is knowable and the book is shut. That is a fairness complaint, not a resolution bug, but it lands in the same inbox.',
    fix: 'State the resolution lag explicitly and keep the book open or clearly closed across it.',
    detect: (t) => {
      const timing = matches(t, /\b(trading (closes?|ends?|halts?)|market closes?|expir(es|y|ation))\b/i);
      if (!timing.length) return [];
      const lag = has(t, /\b(resolution (will|may) (occur|take place|be delayed)|resolves? (within|after)|settlement (occurs|lag))\b/i);
      return lag ? [] : timing;
    },
  },
];

// A market with almost no criteria text at all is its own failure mode, and it
// would otherwise score a suspiciously clean zero because no rule can fire.
export const MIN_CRITERIA_WORDS = 25;

export function ruleById(id) {
  return RULES.find((r) => r.id === id);
}
