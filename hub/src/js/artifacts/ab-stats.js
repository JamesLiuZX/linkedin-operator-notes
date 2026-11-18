// ab-stats.js: exact JavaScript port of
// skills/experiment-readout/scripts/ab_stats.py for the website demo.
//
//   import { readout, SCENARIOS } from './ab-stats.js';
//   const r = readout(SCENARIOS[0].input);
//
// readout(input) returns the same object as the Python script, with the same
// field names and full precision (the UI formats numbers). Every function
// mirrors its Python twin in the same order of floating-point operations, and
// scripts/hub-stats-parity.mjs checks that the two agree to 1e-9 on every
// number and exactly on every string and boolean. If you change the method,
// change both files and rerun the parity test.
//
// Conventions: arm 0 is control, arm 1 is the variant. Every difference is
// variant minus control. Rates are proportions between 0 and 1.
//
// No dependencies, no network, no storage.

const SRM_THRESHOLD = 0.001; // SRM check passes when p >= this
const POWER = 0.80; // power used for the minimum detectable effect

const SQRT2 = Math.sqrt(2.0);
const SQRT_PI = Math.sqrt(Math.PI);
const SQRT_2PI = Math.sqrt(2.0 * Math.PI);

/** Raised for any input the engine refuses to analyse. */
export class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputError';
  }
}

// ---------------------------------------------------------------------------
// Special functions (identical algorithms to the Python file).
// ---------------------------------------------------------------------------

/**
 * Complementary error function, erfc(x) = 1 - erf(x).
 * x < 0:        erfc(x) = 2 - erfc(-x).
 * 0 <= x < 1.5: erf(x) = (2 / sqrt(pi)) * exp(-x^2) * sum_{n>=0} 2^n x^(2n+1) / (1*3*...*(2n+1)),
 *               each term is the previous one times 2 x^2 / (2n + 1); erfc = 1 - erf.
 * x >= 1.5:     continued fraction (Abramowitz and Stegun 7.1.14),
 *               erfc(x) = exp(-x^2) / sqrt(pi) / (x + (1/2) / (x + 1 / (x + (3/2) / (x + ...)))),
 *               partial numerators k / 2, evaluated with the modified Lentz algorithm.
 */
export function erfc(x) {
  if (Number.isNaN(x)) throw new InputError('erfc received NaN.');
  if (x < 0) return 2.0 - erfc(-x);
  const x2 = x * x;
  if (x < 1.5) {
    let term = x;
    let total = x;
    let n = 0;
    while (n < 1000) {
      n += 1;
      term = term * (2.0 * x2) / (2 * n + 1);
      total = total + term;
      if (term <= total * 1e-17) break;
    }
    return 1.0 - (2.0 / SQRT_PI) * Math.exp(-x2) * total;
  }
  const tiny = 1e-300;
  let f = x;
  let c = x;
  let d = 0.0;
  let k = 0;
  while (k < 5000) {
    k += 1;
    const a = k / 2.0;
    d = x + a * d;
    if (d === 0.0) d = tiny;
    d = 1.0 / d;
    c = x + a / c;
    if (c === 0.0) c = tiny;
    const delta = c * d;
    f = f * delta;
    if (Math.abs(delta - 1.0) < 1e-16) break;
  }
  return Math.exp(-x2) / (SQRT_PI * f);
}

/** Standard normal CDF: Phi(z) = erfc(-z / sqrt(2)) / 2. */
export function normCdf(z) {
  return 0.5 * erfc(-z / SQRT2);
}

// Peter Acklam's rational approximation to the normal quantile.
const A = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
  1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
const B = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
  6.680131188771972e+01, -1.328068155288572e+01];
const C = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
  -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
const D = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
  3.754408661907416e+00];
const P_LOW = 0.02425;

/**
 * Standard normal quantile z with Phi(z) = p, 0 < p < 1.
 * Acklam's approximation (central q = p - 0.5, r = q^2; tails q = sqrt(-2 ln p) or
 * sqrt(-2 ln(1 - p))), then one Halley step:
 *   e = Phi(z) - p, u = e sqrt(2 pi) exp(z^2 / 2), z = z - u / (1 + z u / 2),
 * with e taken as (1 - p) - Q(z) from the upper tail when p > 0.5.
 */
export function normPpf(p) {
  if (!(p > 0.0 && p < 1.0)) throw new InputError(`normPpf needs 0 < p < 1, got ${p}.`);
  let z;
  if (p < P_LOW) {
    const q = Math.sqrt(-2.0 * Math.log(p));
    z = (((((C[0] * q + C[1]) * q + C[2]) * q + C[3]) * q + C[4]) * q + C[5]) /
      ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1.0);
  } else if (p <= 1.0 - P_LOW) {
    const q = p - 0.5;
    const r = q * q;
    z = (((((A[0] * r + A[1]) * r + A[2]) * r + A[3]) * r + A[4]) * r + A[5]) * q /
      (((((B[0] * r + B[1]) * r + B[2]) * r + B[3]) * r + B[4]) * r + 1.0);
  } else {
    const q = Math.sqrt(-2.0 * Math.log(1.0 - p));
    z = -(((((C[0] * q + C[1]) * q + C[2]) * q + C[3]) * q + C[4]) * q + C[5]) /
      ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1.0);
  }
  let e;
  if (p > 0.5) {
    e = (1.0 - p) - 0.5 * erfc(z / SQRT2);
  } else {
    e = normCdf(z) - p;
  }
  const u = e * SQRT_2PI * Math.exp(z * z / 2.0);
  z = z - u / (1.0 + z * u / 2.0);
  return z;
}

/** Chi-square survival with 1 degree of freedom: P(X > x) = P(|Z| > sqrt(x)) = erfc(sqrt(x / 2)). */
export function chi2Sf1df(chi2) {
  return erfc(Math.sqrt(chi2 / 2.0));
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

/**
 * Sample ratio mismatch, Pearson chi-square goodness of fit, 1 dof:
 * expected_i = N split_i, chi2 = sum (observed_i - expected_i)^2 / expected_i,
 * p = erfc(sqrt(chi2 / 2)), pass = p >= 0.001.
 */
function srmCheck(users, split) {
  const total = users[0] + users[1];
  const expected = [total * split[0], total * split[1]];
  let chi2 = 0.0;
  for (let i = 0; i < 2; i++) {
    const gap = users[i] - expected[i];
    chi2 = chi2 + gap * gap / expected[i];
  }
  const p = chi2Sf1df(chi2);
  return {
    expected,
    observed: [users[0], users[1]],
    chi2,
    p,
    threshold: SRM_THRESHOLD,
    pass: p >= SRM_THRESHOLD,
  };
}

/**
 * Difference in proportions, variant minus control.
 * r_i = x_i / n_i, diff = r1 - r0.
 * Unpooled se = sqrt(r0 (1 - r0) / n0 + r1 (1 - r1) / n1); Wald CI diff -/+ z se.
 * Pooled z-test: r_pool = (x0 + x1) / (n0 + n1), se_pool = sqrt(r_pool (1 - r_pool) (1/n0 + 1/n1)),
 * z = diff / se_pool, two-sided p = erfc(|z| / sqrt(2)). se_pool = 0 gives z = 0, p = 1.
 */
function twoProportions(counts, denoms, zCrit) {
  const r0 = counts[0] / denoms[0];
  const r1 = counts[1] / denoms[1];
  const diff = r1 - r0;
  const se = Math.sqrt(r0 * (1.0 - r0) / denoms[0] + r1 * (1.0 - r1) / denoms[1]);
  const ci = [diff - zCrit * se, diff + zCrit * se];
  const rPool = (counts[0] + counts[1]) / (denoms[0] + denoms[1]);
  const sePool = Math.sqrt(rPool * (1.0 - rPool) * (1.0 / denoms[0] + 1.0 / denoms[1]));
  let z;
  let p;
  if (sePool > 0.0) {
    z = diff / sePool;
    p = erfc(Math.abs(z) / SQRT2);
  } else {
    z = 0.0;
    p = 1.0;
  }
  return { rates: [r0, r1], diff, se, ci, z, p };
}

/** 'up': positive if lo > 0, negative if hi < 0. 'down': the reverse. Else inconclusive. */
function primaryResult(ci, direction) {
  const [lo, hi] = ci;
  let good;
  let bad;
  if (direction === 'up') {
    good = lo > 0.0;
    bad = hi < 0.0;
  } else {
    good = hi < 0.0;
    bad = lo > 0.0;
  }
  if (good) return 'positive';
  if (bad) return 'negative';
  return 'inconclusive';
}

/**
 * Orient so harm is negative (harm 'down': [lo, hi]; harm 'up': [-hi, -lo]).
 * 'worse' if oriented hi < 0; else 'held' if oriented lo > -tolerance; else 'unclear'.
 */
function guardrailVerdict(ci, harm, tolerance) {
  const [lo, hi] = ci;
  let olo;
  let ohi;
  if (harm === 'down') {
    olo = lo;
    ohi = hi;
  } else {
    olo = -hi;
    ohi = -lo;
  }
  if (ohi < 0.0) return 'worse';
  if (olo > -tolerance) return 'held';
  return 'unclear';
}

/**
 * MDE at 80% power: mde_abs = (z_{1-alpha/2} + z_{0.80}) sqrt(p (1 - p) (1/n0 + 1/n1)),
 * mde_rel = mde_abs / p, adequate = mde_abs <= mde_set (null without mde_set).
 * A baseline of 0 or 1 makes mde_rel and adequate null.
 */
function powerCheck(baseline, n0, n1, alpha, mdeSet) {
  const zSum = normPpf(1.0 - alpha / 2.0) + normPpf(POWER);
  const mdeAbs = zSum * Math.sqrt(baseline * (1.0 - baseline) * (1.0 / n0 + 1.0 / n1));
  const degenerate = baseline <= 0.0 || baseline >= 1.0;
  const mdeRel = degenerate ? null : mdeAbs / baseline;
  const adequate = (mdeSet === null || degenerate) ? null : mdeAbs <= mdeSet;
  return { baseline, mde_abs: mdeAbs, mde_rel: mdeRel, mde_set: mdeSet, adequate };
}

// ---------------------------------------------------------------------------
// Text helpers (hand-rolled so both languages produce identical strings).
// ---------------------------------------------------------------------------

/** x rounded half away from zero to `places` decimals, as a string. Never '-0.0'. */
function fixed(x, places) {
  const scale = Math.pow(10, places);
  const k = Math.floor(Math.abs(x) * scale + 0.5);
  let whole = String((k - (k % scale)) / scale);
  if (places > 0) whole = whole + '.' + String(k % scale).padStart(places, '0');
  if (x < 0 && k !== 0) return '-' + whole;
  return whole;
}

const pts = (x) => fixed(x * 100.0, 1);
const pct = (x) => fixed(x * 100.0, 1) + '%';

function group(n) {
  let s = String(Math.trunc(n));
  let out = '';
  while (s.length > 3) {
    out = ',' + s.slice(-3) + out;
    s = s.slice(0, -3);
  }
  return s + out;
}

function confLabel(alpha) {
  const tenths = Math.floor((1.0 - alpha) * 1000.0 + 0.5);
  const whole = (tenths - (tenths % 10)) / 10;
  if (tenths % 10 === 0) return whole + '%';
  return whole + '.' + (tenths % 10) + '%';
}

function verb(diff) {
  if (diff > 0) return 'rose';
  if (diff < 0) return 'fell';
  return 'did not move';
}

function changeSentence(name, stats, conf, withRates) {
  const diff = stats.diff;
  const [lo, hi] = stats.ci;
  let head;
  if (diff === 0) head = name + ' did not move';
  else head = name + ' ' + verb(diff) + ' ' + fixed(Math.abs(diff) * 100.0, 1) + ' points';
  if (withRates) head = head + ', from ' + pct(stats.rates[0]) + ' to ' + pct(stats.rates[1]);
  return head + ', with a ' + conf + ' interval of ' + pts(lo) + ' to ' + pts(hi);
}

// ---------------------------------------------------------------------------
// Input validation (same rules and messages as Python).
// ---------------------------------------------------------------------------

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isInt = (v) => isNum(v) && Number.isInteger(v);
const isStr = (v) => typeof v === 'string';
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function need(cond, message) {
  if (!cond) throw new InputError(message);
}

function intPair(v, what, minimum) {
  need(Array.isArray(v) && v.length === 2, what + ' must be a list of two numbers.');
  for (const x of v) {
    need(isInt(x) && x >= minimum, what + ' must hold whole numbers of at least ' + minimum + '.');
  }
  return [v[0], v[1]];
}

function validate(data) {
  need(isObj(data), 'The input must be a JSON object.');
  const test = data.test;
  need(isObj(test), "'test' must be an object.");
  need(isStr(test.name), 'test.name must be a string.');
  const split = test.planned_split;
  need(Array.isArray(split) && split.length === 2 && split.every((s) => isNum(s) && s > 0),
    'test.planned_split must be two positive numbers.');
  need(Math.abs(split[0] + split[1] - 1.0) < 1e-9, 'test.planned_split must sum to 1.');
  need(isInt(test.planned_days) && test.planned_days >= 1,
    'test.planned_days must be a whole number of at least 1.');
  need(isInt(test.ran_days) && test.ran_days >= 1,
    'test.ran_days must be a whole number of at least 1.');
  const alpha = test.alpha;
  need(isNum(alpha) && alpha > 0 && alpha < 1, 'test.alpha must be a number between 0 and 1.');
  const mdeSet = test.mde_set === undefined ? null : test.mde_set;
  need(mdeSet === null || (isNum(mdeSet) && mdeSet > 0),
    'test.mde_set must be a positive number or null.');

  const arms = data.arms;
  need(Array.isArray(arms), "'arms' must be a list.");
  need(arms.length === 2,
    'Exactly two arms are supported (control and one variant); got ' + arms.length + '.');
  const users = [];
  const names = [];
  for (const arm of arms) {
    need(isObj(arm) && isStr(arm.name), 'Each arm needs a string name.');
    need(isInt(arm.users) && arm.users >= 1,
      "Arm '" + arm.name + "' needs users as a whole number of at least 1.");
    users.push(arm.users);
    names.push(arm.name);
  }

  const primary = data.primary;
  need(isObj(primary) && isStr(primary.name), "'primary' must be an object with a string name.");
  need(primary.direction === 'up' || primary.direction === 'down',
    "primary.direction must be 'up' or 'down'.");
  const pCounts = intPair(primary.counts, 'primary.counts', 0);
  for (let i = 0; i < 2; i++) {
    need(pCounts[i] <= users[i], 'Count ' + pCounts[i] + ' for ' + names[i] + " in '" + primary.name +
      "' is larger than its denominator " + users[i] + '.');
  }

  const guardrails = data.guardrails === undefined ? [] : data.guardrails;
  need(Array.isArray(guardrails), "'guardrails' must be a list.");
  const rails = [];
  for (const g of guardrails) {
    need(isObj(g) && isStr(g.name), 'Each guardrail needs a string name.');
    need(g.harm === 'up' || g.harm === 'down', "Guardrail '" + g.name + "' needs harm 'up' or 'down'.");
    const gCounts = intPair(g.counts, "Guardrail '" + g.name + "' counts", 0);
    const gDenoms = (g.denominators === undefined || g.denominators === null)
      ? [users[0], users[1]]
      : intPair(g.denominators, "Guardrail '" + g.name + "' denominators", 1);
    need(isNum(g.tolerance) && g.tolerance >= 0,
      "Guardrail '" + g.name + "' needs a tolerance of at least 0.");
    for (let i = 0; i < 2; i++) {
      need(gCounts[i] <= gDenoms[i], 'Count ' + gCounts[i] + ' for ' + names[i] + " in '" + g.name +
        "' is larger than its denominator " + gDenoms[i] + '.');
    }
    rails.push({ name: g.name, harm: g.harm, counts: gCounts, denoms: gDenoms, tolerance: g.tolerance });
  }

  return {
    split: [split[0], split[1]],
    planned_days: test.planned_days,
    ran_days: test.ran_days,
    alpha,
    mde_set: mdeSet,
    names,
    users,
    primary: { name: primary.name, direction: primary.direction, counts: pCounts },
    guardrails: rails,
  };
}

// ---------------------------------------------------------------------------
// The readout
// ---------------------------------------------------------------------------

export const RULES = {
  1: 'Rule 1: sample ratio mismatch, so do not trust the result',
  2: 'Rule 2: a guardrail got worse, so stop',
  3: 'Rule 3: the primary metric moved the wrong way, so stop',
  4: 'Rule 4: positive but stopped early, so extend',
  5: 'Rule 5: positive and every guardrail held, so ship',
  6: 'Rule 6: positive but a guardrail is unclear, so extend',
  7: 'Rule 7: inconclusive with adequate power, so stop',
  8: 'Rule 8: inconclusive without adequate power, so extend',
};

/** The fixed decision rule. First match wins. Returns [decision, rule number, reasons]. */
function decide(srm, duration, power, primary, rails, conf, v) {
  const verdicts = rails.map((g) => g.verdict);
  const result = primary.result;
  const pSentence = changeSentence(primary.name, primary, conf, true) + '.';

  if (!srm.pass) {
    const splitLabel = fixed(v.split[0] * 100.0, 0) + '/' + fixed(v.split[1] * 100.0, 0);
    const pText = srm.p < 0.0001 ? 'below 0.0001' : fixed(srm.p, 4);
    return ['do-not-trust', 1, [
      'Arm sizes are ' + group(v.users[0]) + ' and ' + group(v.users[1]) +
        ' against a planned ' + splitLabel + ' split, and a gap that large happens by chance with p ' +
        pText + '.',
      'Assignment is broken, so no metric in this test can be trusted.',
      'Fix how users are assigned and rerun the test.',
    ]];
  }

  if (verdicts.includes('worse')) {
    const worse = rails.filter((g) => g.verdict === 'worse');
    const reasons = worse.slice(0, 2).map(
      (g) => changeSentence(g.name, g, conf, false) + ', so it got significantly worse.');
    reasons.push('A guardrail got worse, so stop whatever the primary metric says.');
    return ['stop', 2, reasons];
  }

  if (result === 'negative') {
    return ['stop', 3, [
      pSentence,
      'The whole interval is on the harmful side of zero, so the change hurts the metric it was meant to help.',
    ]];
  }

  if (result === 'positive' && duration.stopped_early) {
    return ['extend', 4, [
      pSentence,
      'The test stopped after ' + duration.ran_days + ' of ' + duration.planned_days +
        ' planned days, and an early look overstates significance.',
      'Run it to the planned length before deciding.',
    ]];
  }

  if (result === 'positive' && verdicts.every((x) => x === 'held')) {
    const middle = rails.length
      ? 'Every guardrail held: each interval rules out harm beyond its tolerance.'
      : 'No guardrails were set, so nothing else was checked.';
    return ['ship', 5, [pSentence, middle]];
  }

  if (result === 'positive') {
    const unclear = rails.filter((g) => g.verdict === 'unclear');
    const reasons = [pSentence];
    for (const g of unclear.slice(0, 2)) {
      reasons.push(changeSentence(g.name, g, conf, false) + ', so a harmful change beyond the ' +
        pts(g.tolerance) + '-point tolerance is not ruled out.');
    }
    reasons.push('Extend the test until the guardrail interval is narrow enough to decide.');
    return ['extend', 6, reasons];
  }

  if (result === 'inconclusive' && power.adequate === true) {
    return ['stop', 7, [
      pSentence,
      'The test could detect a change of ' + pts(power.mde_abs) + ' points, smaller than the ' +
        pts(power.mde_set) + ' points worth shipping, and its interval still includes zero.',
      'Stop: an effect worth shipping would most likely have shown up.',
    ]];
  }

  let powerSentence;
  if (power.adequate === false) {
    powerSentence = 'The test can only reliably detect a change of ' + pts(power.mde_abs) +
      ' points, more than the ' + pts(power.mde_set) +
      ' points worth shipping, so a real effect could be hiding.';
  } else {
    powerSentence = 'The test can reliably detect a change of ' + pts(power.mde_abs) +
      ' points, but no effect worth shipping was set to judge that against.';
  }
  return ['extend', 8, [
    pSentence,
    powerSentence,
    'Extend the test to gain power, or accept that it cannot answer the question.',
  ]];
}

/** Compute the full readout object for one results.json-shaped input. Throws InputError. */
export function readout(input) {
  const v = validate(input);
  const alpha = v.alpha;
  const zCrit = normPpf(1.0 - alpha / 2.0);
  const conf = confLabel(alpha);
  const users = v.users;

  const srm = srmCheck(users, v.split);

  const duration = {
    planned_days: v.planned_days,
    ran_days: v.ran_days,
    stopped_early: v.ran_days < v.planned_days,
    full_weeks: v.ran_days >= 7 && v.ran_days % 7 === 0,
  };

  const pm = v.primary;
  const ps = twoProportions(pm.counts, users, zCrit);
  const r0 = ps.rates[0];
  const primary = {
    name: pm.name,
    rates: ps.rates,
    diff: ps.diff,
    lift: r0 > 0.0 ? ps.diff / r0 : null, // relative lift = diff / control rate
    se: ps.se,
    ci: ps.ci,
    z: ps.z,
    p: ps.p,
    result: primaryResult(ps.ci, pm.direction),
  };

  const power = powerCheck(r0, users[0], users[1], alpha, v.mde_set);

  const guardrails = v.guardrails.map((g) => {
    const gs = twoProportions(g.counts, g.denoms, zCrit);
    return {
      name: g.name,
      rates: gs.rates,
      diff: gs.diff,
      se: gs.se,
      ci: gs.ci,
      harm: g.harm,
      tolerance: g.tolerance,
      verdict: guardrailVerdict(gs.ci, g.harm, g.tolerance),
    };
  });

  const [decision, rule, reasons] = decide(srm, duration, power, primary, guardrails, conf, v);

  const flags = [];
  if (duration.stopped_early) {
    flags.push('The test stopped after ' + v.ran_days + ' of ' + v.planned_days + ' planned days.');
  }
  if (!duration.full_weeks) {
    flags.push('The test ran ' + v.ran_days +
      ' days, not a whole number of weeks, so weekday patterns may be uneven across the run.');
  }
  if (v.mde_set === null) {
    flags.push('No minimum effect worth shipping (mde_set) was set before the test, so power cannot be judged.');
  }
  if (guardrails.length > 3) {
    flags.push('There are ' + guardrails.length +
      ' guardrails; with several metrics, one will look bad by chance.');
  }
  for (let i = 0; i < 2; i++) {
    if (users[i] < 100) {
      flags.push('Arm ' + v.names[i] + ' has ' + users[i] +
        ' users; under 100 per arm the normal approximation is weak.');
    }
  }
  if (r0 <= 0.0 || r0 >= 1.0) {
    flags.push('The control rate is ' + pct(r0) + ', so the power estimate is not meaningful.');
  }

  return {
    input: JSON.parse(JSON.stringify(input)),
    checks: { srm, duration, power },
    primary,
    guardrails,
    verdict: { decision, rule: RULES[rule], reasons },
    flags,
  };
}

// ---------------------------------------------------------------------------
// Demo scenarios. The first is the published Tangelo example
// (skills/experiment-readout/examples/tangelo/input/results.json); the others
// change as few numbers as possible to reach each decision.
// ---------------------------------------------------------------------------

const TANGELO = {
  test: {
    name: 'Reorder card on Home',
    hypothesis: "Putting last week's shop on Home gets more returning customers to order within 7 days.",
    unit: 'returning customers',
    planned_split: [0.5, 0.5],
    planned_days: 14,
    ran_days: 14,
    start: '2026-10-26',
    end: '2026-11-08',
    mde_set: 0.01,
    alpha: 0.05,
  },
  arms: [
    { name: 'Control', users: 20912 },
    { name: 'Reorder card', users: 20958 },
  ],
  primary: { name: 'Ordered within 7 days', direction: 'up', counts: [6984, 7357] },
  guardrails: [
    { name: 'Orders with 15 or more items', harm: 'down', counts: [4120, 4267], denominators: [6984, 7357], tolerance: 0.01 },
    { name: 'Orders with a substitution complaint', harm: 'up', counts: [301, 268], denominators: [6984, 7357], tolerance: 0.005 },
    { name: 'Orders cancelled before delivery', harm: 'up', counts: [154, 158], denominators: [6984, 7357], tolerance: 0.005 },
  ],
};

const clone = (x) => JSON.parse(JSON.stringify(x));

function variant(edit) {
  const input = clone(TANGELO);
  edit(input);
  return input;
}

export const SCENARIOS = [
  {
    id: 'tangelo',
    label: 'The Tangelo test',
    blurb: 'Orders rose, but one guardrail cannot yet rule out real harm.',
    input: clone(TANGELO),
  },
  {
    id: 'clean',
    label: 'Every guardrail holds',
    blurb: 'The same test, but every guardrail now rules out harm beyond its tolerance.',
    // [4143, 4364] as first drafted still reads 'unclear': with about 7,000 orders per
    // arm the 95% half-width is 1.6 points, wider than the 1-point tolerance, so equal
    // rates cannot rule out a 1-point fall. 4409 is the smallest variant count that holds.
    input: variant((d) => { d.guardrails[0].counts = [4143, 4409]; }),
  },
  {
    id: 'srm',
    label: 'Broken split',
    blurb: 'A big win on paper, but the arms are far from the planned 50/50 split.',
    input: variant((d) => {
      // Variant guardrail counts scale with its larger order count (8184 / 7357).
      d.arms[1].users = 22740;
      d.primary.counts = [6984, 8184];
      d.guardrails[0].counts = [4120, 4747];
      d.guardrails[1].counts = [301, 298];
      d.guardrails[2].counts = [154, 176];
      for (const g of d.guardrails) g.denominators = [6984, 8184];
    }),
  },
  {
    id: 'small',
    label: 'Too small to tell',
    blurb: 'The same idea on 2,100 users per arm, too few to see a 1-point effect.',
    input: variant((d) => {
      // About a tenth of the Tangelo traffic, with the same rates.
      d.arms[0].users = 2100;
      d.arms[1].users = 2100;
      d.primary.counts = [701, 727];
      d.guardrails[0].counts = [414, 422];
      d.guardrails[1].counts = [30, 26];
      d.guardrails[2].counts = [15, 16];
      for (const g of d.guardrails) g.denominators = [701, 727];
    }),
  },
  {
    id: 'harm',
    label: 'A guardrail breaks',
    blurb: 'Orders rose, but substitution complaints rose with them.',
    input: variant((d) => { d.guardrails[1].counts = [301, 412]; }),
  },
];
