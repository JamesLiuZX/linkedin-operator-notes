// scripts/ledger/select.mjs
// Pre-registered market selection.
//
// Selection is the step where a "public track record" quietly becomes a lie. If
// you pick which markets to forecast after seeing them, you can manufacture any
// calibration curve you like. So the rule is fixed, published in
// data/ledger/PREREGISTRATION.md, and applied deterministically:
//
//   filter by the published criteria, order by sha256(seed:venue:id), take K.
//
// The seed is the run date. Same date and same market universe gives the same
// selection on anyone's machine. Nothing here reads the model's opinion, and
// nothing reads the market price except the published eligibility band.

import { createHash } from 'node:crypto';

export const DEFAULT_CRITERIA = {
  minProb: 0.05,          // below this the market has effectively decided
  maxProb: 0.95,
  minCloseDays: 1,        // needs to be far enough out that a forecast is not a coin flip on today's news
  maxCloseDays: 90,       // needs to resolve inside a quarter so the ledger scores something
  minVolume: 1000,        // venue-native units; thin markets are noise, not signal
  perVenue: 5,
};

const DAY_MS = 86_400_000;

function sortKey(seed, market) {
  return createHash('sha256').update(`${seed}:${market.venue}:${market.id}`).digest('hex');
}

export function eligible(market, criteria, now) {
  const reasons = [];
  if (market.resolved) reasons.push('already resolved');
  if (market.marketProb === null) reasons.push('no market price');
  else if (market.marketProb < criteria.minProb || market.marketProb > criteria.maxProb) {
    reasons.push(`price ${market.marketProb.toFixed(3)} outside [${criteria.minProb}, ${criteria.maxProb}]`);
  }
  if (!market.closeTime) reasons.push('no close time');
  else {
    const days = (new Date(market.closeTime).getTime() - now.getTime()) / DAY_MS;
    if (days < criteria.minCloseDays) reasons.push(`closes in ${days.toFixed(1)}d, under ${criteria.minCloseDays}d`);
    if (days > criteria.maxCloseDays) reasons.push(`closes in ${days.toFixed(1)}d, over ${criteria.maxCloseDays}d`);
  }
  if ((market.volume ?? 0) < criteria.minVolume) {
    reasons.push(`volume ${market.volume ?? 0} under ${criteria.minVolume}`);
  }
  if (!market.question) reasons.push('no question text');
  return { ok: reasons.length === 0, reasons };
}

/**
 * @returns {{ selected: object[], rejected: object[] }}
 * Rejections are returned, not swallowed. A selection you cannot audit is not
 * a pre-registered selection.
 */
export function select(markets, { criteria = DEFAULT_CRITERIA, seed, now = new Date() } = {}) {
  if (!seed) throw new Error('select() requires a seed (the run date) so the choice is reproducible');

  const selected = [];
  const rejected = [];

  for (const market of markets) {
    const verdict = eligible(market, criteria, now);
    if (verdict.ok) selected.push(market);
    else rejected.push({ venue: market.venue, id: market.id, reasons: verdict.reasons });
  }

  selected.sort((a, b) => {
    const ka = sortKey(seed, a);
    const kb = sortKey(seed, b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });

  const byVenue = new Map();
  const capped = selected.filter((m) => {
    const n = byVenue.get(m.venue) ?? 0;
    if (n >= criteria.perVenue) return false;
    byVenue.set(m.venue, n + 1);
    return true;
  });

  return { selected: capped, rejected };
}

/** Hash of the criteria, stamped onto every forecast so a later change is visible in the log. */
export function criteriaHash(criteria) {
  const keys = Object.keys(criteria).sort();
  return createHash('sha256')
    .update(keys.map((k) => `${k}=${criteria[k]}`).join('|'))
    .digest('hex')
    .slice(0, 16);
}
