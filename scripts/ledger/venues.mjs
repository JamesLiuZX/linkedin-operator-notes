// scripts/ledger/venues.mjs
// Public-venue adapters. Read-only. No auth, no orders, no account endpoints.
//
// Every venue normalizes into one shape:
//
//   { venue, id, question, url, marketProb, closeTime, volume, resolved, outcome }
//
//   marketProb  the venue's implied probability of YES, 0..1
//   outcome     1 (yes) | 0 (no) | null (not resolved, or voided)
//
// Each adapter keeps its venue-specific field mapping in one small `map`
// function and declares the response fields it depends on in `probes`. Run
// `npm run ledger -- verify` against a live venue to check those fields still
// exist before trusting a run. Field names here were written from each venue's
// documented shape and have NOT been confirmed against a live response from
// this machine, so treat `verify` as a required first step, not a formality.

import { readFile } from 'node:fs/promises';

const UA = 'linkedin-operator-notes-calibration-ledger (research; contact via github.com/JamesLiuZX)';

async function getJSON(url) {
  const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${url}`);
  return res.json();
}

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
const clamp01 = (p) => (p === null || Number.isNaN(p) ? null : Math.min(1, Math.max(0, p)));

// ---------------------------------------------------------------- adapters

const manifold = {
  name: 'manifold',
  probes: ['id', 'question', 'probability', 'closeTime', 'isResolved', 'outcomeType'],
  async fetchOpen(limit) {
    const rows = await getJSON(`https://api.manifold.markets/v0/markets?limit=${limit}`);
    return rows.map((r) => this.map(r)).filter(Boolean);
  },
  async fetchOne(id) {
    return this.map(await getJSON(`https://api.manifold.markets/v0/market/${encodeURIComponent(id)}`));
  },
  map(r) {
    if (r?.outcomeType && r.outcomeType !== 'BINARY') return null;
    const resolution = r.resolution ?? null;
    return {
      venue: 'manifold',
      id: String(r.id),
      question: r.question ?? null,
      url: r.url ?? null,
      marketProb: clamp01(num(r.probability)),
      closeTime: r.closeTime ? new Date(r.closeTime).toISOString() : null,
      volume: num(r.volume) ?? 0,
      resolved: Boolean(r.isResolved),
      // MKT (partial) and CANCEL (voided) are deliberately not scored as 0/1.
      outcome: resolution === 'YES' ? 1 : resolution === 'NO' ? 0 : null,
    };
  },
};

const kalshi = {
  name: 'kalshi',
  probes: ['ticker', 'title', 'last_price', 'close_time', 'status'],
  async fetchOpen(limit) {
    const body = await getJSON(
      `https://api.elections.kalshi.com/trade-api/v2/markets?limit=${limit}&status=open`,
    );
    return (body.markets ?? []).map((r) => this.map(r)).filter(Boolean);
  },
  async fetchOne(id) {
    const body = await getJSON(
      `https://api.elections.kalshi.com/trade-api/v2/markets/${encodeURIComponent(id)}`,
    );
    return this.map(body.market ?? body);
  },
  map(r) {
    // Kalshi quotes in cents. Prefer the bid/ask midpoint; last trade can be stale.
    const bid = num(r.yes_bid);
    const ask = num(r.yes_ask);
    const cents = bid !== null && ask !== null && (bid || ask) ? (bid + ask) / 2 : num(r.last_price);
    const result = (r.result ?? '').toLowerCase();
    return {
      venue: 'kalshi',
      id: String(r.ticker),
      question: r.title ?? null,
      url: r.ticker ? `https://kalshi.com/markets/${encodeURIComponent(r.ticker)}` : null,
      marketProb: cents === null ? null : clamp01(cents / 100),
      closeTime: r.close_time ? new Date(r.close_time).toISOString() : null,
      volume: num(r.volume) ?? 0,
      resolved: r.status === 'settled' || r.status === 'finalized',
      outcome: result === 'yes' ? 1 : result === 'no' ? 0 : null,
    };
  },
};

const polymarket = {
  name: 'polymarket',
  probes: ['id', 'question', 'outcomePrices', 'endDate', 'closed'],
  async fetchOpen(limit) {
    const rows = await getJSON(
      `https://gamma-api.polymarket.com/markets?limit=${limit}&closed=false&order=volume&ascending=false`,
    );
    return (Array.isArray(rows) ? rows : (rows.data ?? [])).map((r) => this.map(r)).filter(Boolean);
  },
  async fetchOne(id) {
    const row = await getJSON(`https://gamma-api.polymarket.com/markets/${encodeURIComponent(id)}`);
    return this.map(Array.isArray(row) ? row[0] : row);
  },
  map(r) {
    // outcomes / outcomePrices arrive as JSON-encoded strings, not arrays.
    const parse = (v) => {
      if (Array.isArray(v)) return v;
      try {
        return JSON.parse(v ?? '[]');
      } catch {
        return [];
      }
    };
    const outcomes = parse(r.outcomes).map((o) => String(o).toLowerCase());
    const prices = parse(r.outcomePrices).map(num);
    const yesIdx = outcomes.indexOf('yes');
    if (outcomes.length && yesIdx === -1) return null; // not a yes/no market
    const idx = yesIdx === -1 ? 0 : yesIdx;
    const resolved = Boolean(r.closed);
    const price = prices[idx] ?? null;
    return {
      venue: 'polymarket',
      id: String(r.id ?? r.conditionId ?? r.slug),
      question: r.question ?? null,
      url: r.slug ? `https://polymarket.com/event/${r.slug}` : null,
      marketProb: clamp01(price),
      closeTime: r.endDate ? new Date(r.endDate).toISOString() : null,
      volume: num(r.volume) ?? 0,
      resolved,
      // A closed market settles at 0 or 1. Anything in between is still moving.
      outcome: resolved && price !== null ? (price > 0.99 ? 1 : price < 0.01 ? 0 : null) : null,
    };
  },
};

/**
 * Offline venue backed by committed JSON. This is not a mock for tests only:
 * it is how selection, scoring, and reporting stay verifiable on a machine with
 * no network access to the real venues.
 */
const fixture = {
  name: 'fixture',
  probes: [],
  async fetchOpen(limit) {
    const rows = JSON.parse(await readFile(new URL('./fixtures/markets.json', import.meta.url), 'utf8'));
    return rows.filter((r) => !r.resolved).slice(0, limit);
  },
  async fetchOne(id) {
    const rows = JSON.parse(await readFile(new URL('./fixtures/markets.json', import.meta.url), 'utf8'));
    const resolutions = JSON.parse(
      await readFile(new URL('./fixtures/resolutions.json', import.meta.url), 'utf8'),
    );
    const base = rows.find((r) => r.id === id);
    if (!base) return null;
    return { ...base, ...(resolutions[id] ?? {}) };
  },
};

export const VENUES = { manifold, kalshi, polymarket, fixture };

export function getVenue(name) {
  const venue = VENUES[name];
  if (!venue) throw new Error(`Unknown venue "${name}". Known: ${Object.keys(VENUES).join(', ')}`);
  return venue;
}

/** Fetch one raw row and report which expected fields are actually present. */
export async function probeVenue(name) {
  const venue = getVenue(name);
  const markets = await venue.fetchOpen(1);
  if (!markets.length) return { venue: name, ok: false, reason: 'venue returned no open markets' };

  const m = markets[0];
  const missing = ['id', 'question', 'marketProb', 'closeTime'].filter(
    (k) => m[k] === null || m[k] === undefined,
  );
  return {
    venue: name,
    ok: missing.length === 0,
    missing,
    sample: { id: m.id, question: m.question?.slice(0, 70), marketProb: m.marketProb, closeTime: m.closeTime },
    dependsOn: venue.probes,
  };
}
