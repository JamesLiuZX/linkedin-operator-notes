// tools/resolution-risk/lib/sources.mjs
// Where markets come from.
//
// Two modes on purpose:
//   fixtures - checked-in synthetic corpus. Runs offline, runs in CI, runs on a
//              plane. This is the default so the tool is never broken by an
//              upstream API change.
//   live     - public read-only endpoints. No auth, no keys, no trading.
//
// Live mode needs open outbound network. It will not work inside a sandboxed
// agent session with a restrictive proxy policy, which is why fixtures exist.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, '..', 'fixtures', 'markets.json');

/** Normalised shape every adapter must return. */
function normalise({ id, question, criteria, venue, url, closeTime }) {
  return {
    id: String(id),
    question: (question || '').trim(),
    criteria: (criteria || '').trim(),
    venue: venue || 'unknown',
    url: url || null,
    closeTime: closeTime || null,
  };
}

export async function loadFixtures() {
  const raw = JSON.parse(await readFile(FIXTURES, 'utf8'));
  return raw.markets.map(normalise);
}

async function getJSON(url, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: 'application/json', 'user-agent': 'resolution-risk-scanner' },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Polymarket Gamma API, public read-only.
 * The description field is where resolution criteria live.
 */
export async function fetchPolymarket(limit = 50) {
  const url = `https://gamma-api.polymarket.com/markets?limit=${limit}&closed=false&order=volume24hr&ascending=false`;
  const data = await getJSON(url);
  const rows = Array.isArray(data) ? data : data.data || [];
  return rows.map((m) =>
    normalise({
      id: `pm-${m.id ?? m.conditionId}`,
      question: m.question ?? m.title,
      criteria: m.description ?? m.resolutionSource ?? '',
      venue: 'polymarket',
      url: m.slug ? `https://polymarket.com/event/${m.slug}` : null,
      closeTime: m.endDate ?? null,
    }),
  );
}

/**
 * Kalshi public markets endpoint. `rules_primary` is the criteria field.
 */
export async function fetchKalshi(limit = 50) {
  const url = `https://api.elections.kalshi.com/trade-api/v2/markets?limit=${limit}&status=open`;
  const data = await getJSON(url);
  return (data.markets || []).map((m) =>
    normalise({
      id: `kalshi-${m.ticker}`,
      question: m.title,
      criteria: [m.rules_primary, m.rules_secondary].filter(Boolean).join('\n\n'),
      venue: 'kalshi',
      url: m.ticker ? `https://kalshi.com/markets/${m.ticker}` : null,
      closeTime: m.close_time ?? null,
    }),
  );
}

/** Read a local JSON file in either the raw fixture shape or a bare array. */
export async function loadFile(path) {
  const raw = JSON.parse(await readFile(path, 'utf8'));
  const rows = Array.isArray(raw) ? raw : raw.markets || [];
  return rows.map(normalise);
}

export const SOURCES = {
  fixtures: loadFixtures,
  polymarket: fetchPolymarket,
  kalshi: fetchKalshi,
};
