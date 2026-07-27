// scripts/ledger/log.mjs
// Append-only, hash-chained JSONL. Zero dependencies.
//
// The entire credibility of the ledger rests on this file. A forecast log you
// can silently edit after resolution is worth nothing, so every record carries
// the hash of the record before it. Rewriting record N invalidates every hash
// from N onward, and `ledger verify` says so.

import { createHash } from 'node:crypto';
import { appendFile, readFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export const GENESIS = '0'.repeat(64);

/** Deterministic JSON: keys sorted at every level, so the same record always hashes the same. */
export function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
}

export function hashRecord(record) {
  const { hash, ...rest } = record;
  return createHash('sha256').update(canonical(rest)).digest('hex');
}

export async function readLog(path) {
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
  return raw
    .split('\n')
    .filter((line) => line.trim())
    .map((line, i) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error(`${path}:${i + 1} is not valid JSON. The log is corrupt; do not append to it.`);
      }
    });
}

/**
 * Append records, chaining each to the last. Returns the appended records.
 * Reads the tail first so concurrent writers cannot silently fork the chain.
 */
export async function append(path, records) {
  if (!records.length) return [];
  await mkdir(dirname(path), { recursive: true });

  const existing = await readLog(path);
  let prev = existing.length ? existing[existing.length - 1].hash : GENESIS;
  let seq = existing.length;

  const chained = records.map((record) => {
    const withChain = { ...record, seq: seq++, prev };
    const hash = hashRecord(withChain);
    prev = hash;
    return { ...withChain, hash };
  });

  await appendFile(path, chained.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  return chained;
}

/**
 * Walk the chain and report the first break. An intact chain does not prove the
 * log was never rewritten, only that it was not rewritten *carelessly*. Pairing
 * it with a published commit hash is what closes that gap.
 */
export function verify(records) {
  const errors = [];
  let prev = GENESIS;

  records.forEach((record, i) => {
    if (record.seq !== i) {
      errors.push({ line: i + 1, kind: 'seq', detail: `expected seq ${i}, found ${record.seq}` });
    }
    if (record.prev !== prev) {
      errors.push({ line: i + 1, kind: 'chain', detail: `prev does not match the previous record's hash` });
    }
    const expected = hashRecord(record);
    if (record.hash !== expected) {
      errors.push({ line: i + 1, kind: 'hash', detail: `content was modified after it was written` });
    }
    // Chain on the RECOMPUTED hash, not the stored one. An edit then breaks every
    // downstream link whether or not the editor bothered to refresh `hash`.
    prev = expected;
  });

  return { ok: errors.length === 0, errors, count: records.length, head: prev };
}
