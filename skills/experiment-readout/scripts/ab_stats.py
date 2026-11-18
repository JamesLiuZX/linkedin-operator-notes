#!/usr/bin/env python3
"""ab_stats.py: turn raw two-arm A/B test counts into a readout with a fixed decision rule.

Usage:
    python3 ab_stats.py results.json [--out readout.numbers.json]

Prints the readout as JSON on stdout. With --out it also writes the same JSON to
that file. Exit code 0 on success, 2 on invalid input (one-line message on stderr).

Standard library only. No network. The only file this script writes is --out.

Every statistical method is stated as a formula in a comment beside its code.
The JavaScript port (hub/src/js/artifacts/ab-stats.js) mirrors this file
function for function, in the same order of floating-point operations, and
scripts/hub-stats-parity.mjs checks that the two agree to 1e-9.

Conventions:
  * Arm 0 is control, arm 1 is the variant. Every difference is variant minus control.
  * All rates are proportions between 0 and 1. Sentences in "reasons" show them
    as percentages and differences as percentage points, to one decimal.
"""

import json
import math
import sys

SRM_THRESHOLD = 0.001  # SRM check passes when p >= this
POWER = 0.80           # power used for the minimum detectable effect

SQRT2 = math.sqrt(2.0)
SQRT_PI = math.sqrt(math.pi)
SQRT_2PI = math.sqrt(2.0 * math.pi)


class InputError(ValueError):
    """Raised for any input the script refuses to analyse. Becomes exit code 2."""


# ---------------------------------------------------------------------------
# Special functions. Implemented here (not math.erfc) so the JavaScript port,
# which has no erfc, can run the identical algorithm. The test suite checks
# this erfc against math.erfc to a relative error of 1e-13.
# ---------------------------------------------------------------------------

def erfc(x):
    """Complementary error function, erfc(x) = 1 - erf(x).

    Accuracy (checked in the tests against math.erfc): absolute error below 1e-15
    everywhere, relative error below 1e-13 for every result above 1e-300
    (the switch at x = 1.5 keeps the cancellation in 1 - erf(x) small).

    x < 0:        erfc(x) = 2 - erfc(-x).
    0 <= x < 1.5: power series with only positive terms (no cancellation):
                  erf(x) = (2 / sqrt(pi)) * exp(-x^2) * sum_{n>=0} 2^n x^(2n+1) / (1*3*5*...*(2n+1)),
                  each term is the previous one times 2 x^2 / (2n + 1); erfc = 1 - erf.
    x >= 1.5:     continued fraction (Abramowitz and Stegun 7.1.14),
                  erfc(x) = exp(-x^2) / sqrt(pi) * 1 / (x + (1/2) / (x + 1 / (x + (3/2) / (x + 2 / (x + ...))))),
                  partial numerators a_k = k / 2, partial denominators x,
                  evaluated with the modified Lentz algorithm.
    """
    if x != x:
        raise InputError("erfc received NaN.")
    if x < 0:
        return 2.0 - erfc(-x)
    x2 = x * x
    if x < 1.5:
        term = x
        total = x
        n = 0
        while n < 1000:
            n += 1
            term = term * (2.0 * x2) / (2 * n + 1)
            total = total + term
            if term <= total * 1e-17:
                break
        return 1.0 - (2.0 / SQRT_PI) * math.exp(-x2) * total
    tiny = 1e-300
    f = x
    c = x
    d = 0.0
    k = 0
    while k < 5000:
        k += 1
        a = k / 2.0
        d = x + a * d
        if d == 0.0:
            d = tiny
        d = 1.0 / d
        c = x + a / c
        if c == 0.0:
            c = tiny
        delta = c * d
        f = f * delta
        if abs(delta - 1.0) < 1e-16:
            break
    return math.exp(-x2) / (SQRT_PI * f)


def norm_cdf(z):
    """Standard normal CDF: Phi(z) = erfc(-z / sqrt(2)) / 2."""
    return 0.5 * erfc(-z / SQRT2)


# Coefficients of Peter Acklam's rational approximation to the normal quantile
# (relative error below 1.15e-9 before refinement).
_A = (-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
      1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00)
_B = (-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
      6.680131188771972e+01, -1.328068155288572e+01)
_C = (-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
      -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00)
_D = (7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
      3.754408661907416e+00)
_P_LOW = 0.02425


def norm_ppf(p):
    """Standard normal quantile z such that Phi(z) = p, for 0 < p < 1.

    Step 1, Acklam's rational approximation:
      central region (0.02425 <= p <= 0.97575): q = p - 0.5, r = q^2,
        z = (((((a1 r + a2) r + a3) r + a4) r + a5) r + a6) q / (((((b1 r + b2) r + b3) r + b4) r + b5) r + 1)
      lower tail (p < 0.02425): q = sqrt(-2 ln p),
        z = (((((c1 q + c2) q + c3) q + c4) q + c5) q + c6) / ((((d1 q + d2) q + d3) q + d4) q + 1)
      upper tail (p > 0.97575): q = sqrt(-2 ln(1 - p)), z = minus the lower-tail formula.
    Step 2, one Halley refinement using the exact CDF, which brings the error to
    about machine precision:
      e = Phi(z) - p,  u = e * sqrt(2 pi) * exp(z^2 / 2),  z = z - u / (1 + z u / 2).
    (For p > 0.5, e is computed as (1 - p) - Q(z) from the upper tail Q, the same quantity
    without the cancellation of 1 - Q(z).)
    """
    if not (0.0 < p < 1.0):
        raise InputError("norm_ppf needs 0 < p < 1, got %r." % (p,))
    a, b, c, d = _A, _B, _C, _D
    if p < _P_LOW:
        q = math.sqrt(-2.0 * math.log(p))
        z = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / \
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1.0)
    elif p <= 1.0 - _P_LOW:
        q = p - 0.5
        r = q * q
        z = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / \
            (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1.0)
    else:
        q = math.sqrt(-2.0 * math.log(1.0 - p))
        z = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / \
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1.0)
    if p > 0.5:
        # Phi(z) - p = (1 - p) - Q(z), with Q(z) = erfc(z / sqrt(2)) / 2 the upper tail.
        # 1 - p is exact for p in [0.5, 1], so this keeps precision in the upper tail.
        e = (1.0 - p) - 0.5 * erfc(z / SQRT2)
    else:
        e = norm_cdf(z) - p
    u = e * SQRT_2PI * math.exp(z * z / 2.0)
    z = z - u / (1.0 + z * u / 2.0)
    return z


def chi2_sf_1df(chi2):
    """Chi-square survival function with 1 degree of freedom.

    If X ~ chi-square(1) then X = Z^2 with Z standard normal, so
    P(X > x) = P(|Z| > sqrt(x)) = erfc(sqrt(x / 2)).
    """
    return erfc(math.sqrt(chi2 / 2.0))


# ---------------------------------------------------------------------------
# Statistics
# ---------------------------------------------------------------------------

def srm_check(users, split):
    """Sample ratio mismatch: Pearson chi-square goodness of fit, 1 degree of freedom.

    N = n0 + n1, expected_i = N * split_i,
    chi2 = sum_i (observed_i - expected_i)^2 / expected_i,
    p = P(chi-square(1) > chi2) = erfc(sqrt(chi2 / 2)),
    pass = p >= 0.001.
    """
    total = users[0] + users[1]
    expected = [total * split[0], total * split[1]]
    chi2 = 0.0
    for i in range(2):
        gap = users[i] - expected[i]
        chi2 = chi2 + gap * gap / expected[i]
    p = chi2_sf_1df(chi2)
    return {
        "expected": expected,
        "observed": [users[0], users[1]],
        "chi2": chi2,
        "p": p,
        "threshold": SRM_THRESHOLD,
        "pass": p >= SRM_THRESHOLD,
    }


def two_proportions(counts, denoms, z_crit):
    """Difference in proportions, variant minus control.

    r0 = x0 / n0, r1 = x1 / n1, diff = r1 - r0.
    Unpooled standard error (used for the interval):
        se = sqrt(r0 (1 - r0) / n0 + r1 (1 - r1) / n1)
    Wald interval: diff -/+ z_{1 - alpha/2} * se.
    Pooled z-test (used for the p-value):
        r_pool = (x0 + x1) / (n0 + n1),
        se_pool = sqrt(r_pool (1 - r_pool) (1/n0 + 1/n1)),
        z = diff / se_pool,  two-sided p = 2 (1 - Phi(|z|)) = erfc(|z| / sqrt(2)).
    When se_pool is 0 (both rates 0, or both 1) the rates are identical, so z = 0 and p = 1.
    """
    r0 = counts[0] / denoms[0]
    r1 = counts[1] / denoms[1]
    diff = r1 - r0
    se = math.sqrt(r0 * (1.0 - r0) / denoms[0] + r1 * (1.0 - r1) / denoms[1])
    ci = [diff - z_crit * se, diff + z_crit * se]
    r_pool = (counts[0] + counts[1]) / (denoms[0] + denoms[1])
    se_pool = math.sqrt(r_pool * (1.0 - r_pool) * (1.0 / denoms[0] + 1.0 / denoms[1]))
    if se_pool > 0.0:
        z = diff / se_pool
        p = erfc(abs(z) / SQRT2)
    else:
        z = 0.0
        p = 1.0
    return {"rates": [r0, r1], "diff": diff, "se": se, "ci": ci, "z": z, "p": p}


def primary_result(ci, direction):
    """Oriented by direction. 'up': positive if lo > 0, negative if hi < 0.
    'down': positive if hi < 0, negative if lo > 0. Otherwise inconclusive."""
    lo, hi = ci
    if direction == "up":
        good, bad = lo > 0.0, hi < 0.0
    else:
        good, bad = hi < 0.0, lo > 0.0
    if good:
        return "positive"
    if bad:
        return "negative"
    return "inconclusive"


def guardrail_verdict(ci, harm, tolerance):
    """Orient the interval so that harm is negative, then judge it.

    harm 'down' (a fall hurts): oriented interval = [lo, hi].
    harm 'up' (a rise hurts):   oriented interval = [-hi, -lo].
    'worse' if oriented hi < 0 (the whole interval is harmful: significant harm).
    'held'  if oriented lo > -tolerance (harm larger than the tolerance is ruled out).
    'unclear' otherwise. 'worse' is tested first, so a significant harm is
    reported as 'worse' even when it is smaller than the tolerance.
    """
    lo, hi = ci
    if harm == "down":
        olo, ohi = lo, hi
    else:
        olo, ohi = -hi, -lo
    if ohi < 0.0:
        return "worse"
    if olo > -tolerance:
        return "held"
    return "unclear"


def power_check(baseline, n0, n1, alpha, mde_set):
    """Minimum detectable absolute effect at 80% power, two-sided alpha.

    p = control rate (baseline), n0 and n1 the actual arm sizes:
        mde_abs = (z_{1 - alpha/2} + z_{0.80}) * sqrt(p (1 - p) (1/n0 + 1/n1)),
        mde_rel = mde_abs / p,
        adequate = (mde_abs <= mde_set) when mde_set is set, else null.
    If the baseline is 0 or 1 the variance is 0 and the formula says nothing
    useful: mde_rel and adequate are then null (a flag says so).
    """
    z_sum = norm_ppf(1.0 - alpha / 2.0) + norm_ppf(POWER)
    mde_abs = z_sum * math.sqrt(baseline * (1.0 - baseline) * (1.0 / n0 + 1.0 / n1))
    degenerate = baseline <= 0.0 or baseline >= 1.0
    mde_rel = None if degenerate else mde_abs / baseline
    if mde_set is None or degenerate:
        adequate = None
    else:
        adequate = mde_abs <= mde_set
    return {"baseline": baseline, "mde_abs": mde_abs, "mde_rel": mde_rel,
            "mde_set": mde_set, "adequate": adequate}


# ---------------------------------------------------------------------------
# Text helpers. Hand-rolled so Python and JavaScript produce identical strings
# (both languages differ on how they round exact ties when formatting).
# ---------------------------------------------------------------------------

def fixed(x, places):
    """x rounded half away from zero to `places` decimals, as a string. Never '-0.0'."""
    scale = float(10 ** places)
    k = int(math.floor(abs(x) * scale + 0.5))
    whole = str(k // (10 ** places))
    if places > 0:
        whole = whole + "." + str(k % (10 ** places)).zfill(places)
    if x < 0 and k != 0:
        return "-" + whole
    return whole


def pts(x):
    """A proportion difference as signed percentage points, one decimal: 0.0172 -> '1.7'."""
    return fixed(x * 100.0, 1)


def pct(x):
    """A proportion as a percentage, one decimal: 0.334 -> '33.4%'."""
    return fixed(x * 100.0, 1) + "%"


def group(n):
    """An integer with thousands separators: 20912 -> '20,912'."""
    s = str(int(n))
    out = ""
    while len(s) > 3:
        out = "," + s[-3:] + out
        s = s[:-3]
    return s + out


def conf_label(alpha):
    """The interval's confidence level: alpha 0.05 -> '95%', 0.1 -> '90%', 0.025 -> '97.5%'."""
    tenths = int(math.floor((1.0 - alpha) * 1000.0 + 0.5))
    if tenths % 10 == 0:
        return str(tenths // 10) + "%"
    return str(tenths // 10) + "." + str(tenths % 10) + "%"


def verb(diff):
    if diff > 0:
        return "rose"
    if diff < 0:
        return "fell"
    return "did not move"


def change_sentence(name, stats, conf, with_rates):
    """'Ordered within 7 days rose 1.8 points, from 33.4% to 35.1%, with a 95% interval of 0.9 to 2.7.'"""
    diff = stats["diff"]
    lo, hi = stats["ci"]
    if diff == 0:
        head = name + " did not move"
    else:
        head = name + " " + verb(diff) + " " + fixed(abs(diff) * 100.0, 1) + " points"
    if with_rates:
        head = head + ", from " + pct(stats["rates"][0]) + " to " + pct(stats["rates"][1])
    return head + ", with a " + conf + " interval of " + pts(lo) + " to " + pts(hi)


# ---------------------------------------------------------------------------
# Input validation
# ---------------------------------------------------------------------------

def _is_num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)


def _is_int(v):
    return _is_num(v) and float(v).is_integer()


def _need(cond, message):
    if not cond:
        raise InputError(message)


def _int_pair(v, what, minimum):
    _need(isinstance(v, list) and len(v) == 2, what + " must be a list of two numbers.")
    for x in v:
        _need(_is_int(x) and x >= minimum,
              what + " must hold whole numbers of at least " + str(minimum) + ".")
    return [int(v[0]), int(v[1])]


def validate(data):
    """Check the input and return a normalised copy. Raises InputError with a one-line message."""
    _need(isinstance(data, dict), "The input must be a JSON object.")
    test = data.get("test")
    _need(isinstance(test, dict), "'test' must be an object.")
    _need(isinstance(test.get("name"), str), "test.name must be a string.")
    split = test.get("planned_split")
    _need(isinstance(split, list) and len(split) == 2 and all(_is_num(s) and s > 0 for s in split),
          "test.planned_split must be two positive numbers.")
    _need(abs(split[0] + split[1] - 1.0) < 1e-9, "test.planned_split must sum to 1.")
    _need(_is_int(test.get("planned_days")) and test["planned_days"] >= 1,
          "test.planned_days must be a whole number of at least 1.")
    _need(_is_int(test.get("ran_days")) and test["ran_days"] >= 1,
          "test.ran_days must be a whole number of at least 1.")
    alpha = test.get("alpha")
    _need(_is_num(alpha) and 0 < alpha < 1, "test.alpha must be a number between 0 and 1.")
    mde_set = test.get("mde_set")
    _need(mde_set is None or (_is_num(mde_set) and mde_set > 0),
          "test.mde_set must be a positive number or null.")

    arms = data.get("arms")
    _need(isinstance(arms, list), "'arms' must be a list.")
    _need(len(arms) == 2, "Exactly two arms are supported (control and one variant); got "
          + str(len(arms)) + ".")
    users = []
    names = []
    for arm in arms:
        _need(isinstance(arm, dict) and isinstance(arm.get("name"), str),
              "Each arm needs a string name.")
        _need(_is_int(arm.get("users")) and arm["users"] >= 1,
              "Arm '" + arm["name"] + "' needs users as a whole number of at least 1.")
        users.append(int(arm["users"]))
        names.append(arm["name"])

    primary = data.get("primary")
    _need(isinstance(primary, dict) and isinstance(primary.get("name"), str),
          "'primary' must be an object with a string name.")
    _need(primary.get("direction") in ("up", "down"), "primary.direction must be 'up' or 'down'.")
    p_counts = _int_pair(primary.get("counts"), "primary.counts", 0)
    for i in range(2):
        _need(p_counts[i] <= users[i],
              "Count " + str(p_counts[i]) + " for " + names[i] + " in '" + primary["name"]
              + "' is larger than its denominator " + str(users[i]) + ".")

    guardrails = data.get("guardrails", [])
    _need(isinstance(guardrails, list), "'guardrails' must be a list.")
    rails = []
    for g in guardrails:
        _need(isinstance(g, dict) and isinstance(g.get("name"), str),
              "Each guardrail needs a string name.")
        _need(g.get("harm") in ("up", "down"),
              "Guardrail '" + g["name"] + "' needs harm 'up' or 'down'.")
        g_counts = _int_pair(g.get("counts"), "Guardrail '" + g["name"] + "' counts", 0)
        if g.get("denominators") is None:
            g_denoms = list(users)
        else:
            g_denoms = _int_pair(g.get("denominators"), "Guardrail '" + g["name"] + "' denominators", 1)
        _need(_is_num(g.get("tolerance")) and g["tolerance"] >= 0,
              "Guardrail '" + g["name"] + "' needs a tolerance of at least 0.")
        for i in range(2):
            _need(g_counts[i] <= g_denoms[i],
                  "Count " + str(g_counts[i]) + " for " + names[i] + " in '" + g["name"]
                  + "' is larger than its denominator " + str(g_denoms[i]) + ".")
        rails.append({"name": g["name"], "harm": g["harm"], "counts": g_counts,
                      "denoms": g_denoms, "tolerance": float(g["tolerance"])})

    return {
        "split": [float(split[0]), float(split[1])],
        "planned_days": int(test["planned_days"]),
        "ran_days": int(test["ran_days"]),
        "alpha": float(alpha),
        "mde_set": None if mde_set is None else float(mde_set),
        "names": names,
        "users": users,
        "primary": {"name": primary["name"], "direction": primary["direction"], "counts": p_counts},
        "guardrails": rails,
    }


# ---------------------------------------------------------------------------
# The readout
# ---------------------------------------------------------------------------

RULES = {
    1: "Rule 1: sample ratio mismatch, so do not trust the result",
    2: "Rule 2: a guardrail got worse, so stop",
    3: "Rule 3: the primary metric moved the wrong way, so stop",
    4: "Rule 4: positive but stopped early, so extend",
    5: "Rule 5: positive and every guardrail held, so ship",
    6: "Rule 6: positive but a guardrail is unclear, so extend",
    7: "Rule 7: inconclusive with adequate power, so stop",
    8: "Rule 8: inconclusive without adequate power, so extend",
}


def decide(srm, duration, power, primary, guardrails, conf, v):
    """The fixed decision rule. First match wins. Returns (decision, rule number, reasons)."""
    rails = guardrails
    verdicts = [g["verdict"] for g in rails]
    result = primary["result"]
    p_sentence = change_sentence(primary["name"], primary, conf, True) + "."

    if not srm["pass"]:
        split_label = fixed(v["split"][0] * 100.0, 0) + "/" + fixed(v["split"][1] * 100.0, 0)
        p_text = "below 0.0001" if srm["p"] < 0.0001 else fixed(srm["p"], 4)
        return "do-not-trust", 1, [
            "Arm sizes are " + group(v["users"][0]) + " and " + group(v["users"][1])
            + " against a planned " + split_label + " split, and a gap that large happens by chance with p "
            + p_text + ".",
            "Assignment is broken, so no metric in this test can be trusted.",
            "Fix how users are assigned and rerun the test.",
        ]

    if "worse" in verdicts:
        worse = [g for g in rails if g["verdict"] == "worse"]
        reasons = [change_sentence(g["name"], g, conf, False) + ", so it got significantly worse."
                   for g in worse[:2]]
        reasons.append("A guardrail got worse, so stop whatever the primary metric says.")
        return "stop", 2, reasons

    if result == "negative":
        return "stop", 3, [
            p_sentence,
            "The whole interval is on the harmful side of zero, so the change hurts the metric it was meant to help.",
        ]

    if result == "positive" and duration["stopped_early"]:
        return "extend", 4, [
            p_sentence,
            "The test stopped after " + str(duration["ran_days"]) + " of " + str(duration["planned_days"])
            + " planned days, and an early look overstates significance.",
            "Run it to the planned length before deciding.",
        ]

    if result == "positive" and all(x == "held" for x in verdicts):
        if rails:
            middle = "Every guardrail held: each interval rules out harm beyond its tolerance."
        else:
            middle = "No guardrails were set, so nothing else was checked."
        return "ship", 5, [p_sentence, middle]

    if result == "positive":
        unclear = [g for g in rails if g["verdict"] == "unclear"]
        reasons = [p_sentence]
        for g in unclear[:2]:
            reasons.append(change_sentence(g["name"], g, conf, False)
                           + ", so a harmful change beyond the " + pts(g["tolerance"])
                           + "-point tolerance is not ruled out.")
        reasons.append("Extend the test until the guardrail interval is narrow enough to decide.")
        return "extend", 6, reasons

    if result == "inconclusive" and power["adequate"] is True:
        return "stop", 7, [
            p_sentence,
            "The test could detect a change of " + pts(power["mde_abs"]) + " points, smaller than the "
            + pts(power["mde_set"]) + " points worth shipping, and its interval still includes zero.",
            "Stop: an effect worth shipping would most likely have shown up.",
        ]

    if power["adequate"] is False:
        power_sentence = ("The test can only reliably detect a change of " + pts(power["mde_abs"])
                          + " points, more than the " + pts(power["mde_set"])
                          + " points worth shipping, so a real effect could be hiding.")
    else:
        power_sentence = ("The test can reliably detect a change of " + pts(power["mde_abs"])
                          + " points, but no effect worth shipping was set to judge that against.")
    return "extend", 8, [
        p_sentence,
        power_sentence,
        "Extend the test to gain power, or accept that it cannot answer the question.",
    ]


def readout(data):
    """Compute the full readout object for one parsed results.json."""
    v = validate(data)
    alpha = v["alpha"]
    z_crit = norm_ppf(1.0 - alpha / 2.0)
    conf = conf_label(alpha)
    users = v["users"]

    srm = srm_check(users, v["split"])

    duration = {
        "planned_days": v["planned_days"],
        "ran_days": v["ran_days"],
        "stopped_early": v["ran_days"] < v["planned_days"],
        "full_weeks": v["ran_days"] >= 7 and v["ran_days"] % 7 == 0,
    }

    pm = v["primary"]
    ps = two_proportions(pm["counts"], users, z_crit)
    r0 = ps["rates"][0]
    primary = {
        "name": pm["name"],
        "rates": ps["rates"],
        "diff": ps["diff"],
        "lift": ps["diff"] / r0 if r0 > 0.0 else None,  # relative lift = diff / control rate
        "se": ps["se"],
        "ci": ps["ci"],
        "z": ps["z"],
        "p": ps["p"],
        "result": primary_result(ps["ci"], pm["direction"]),
    }

    power = power_check(r0, users[0], users[1], alpha, v["mde_set"])

    guardrails = []
    for g in v["guardrails"]:
        gs = two_proportions(g["counts"], g["denoms"], z_crit)
        guardrails.append({
            "name": g["name"],
            "rates": gs["rates"],
            "diff": gs["diff"],
            "se": gs["se"],
            "ci": gs["ci"],
            "harm": g["harm"],
            "tolerance": g["tolerance"],
            "verdict": guardrail_verdict(gs["ci"], g["harm"], g["tolerance"]),
        })

    decision, rule, reasons = decide(srm, duration, power, primary, guardrails, conf, v)

    flags = []
    if duration["stopped_early"]:
        flags.append("The test stopped after " + str(v["ran_days"]) + " of " + str(v["planned_days"])
                     + " planned days.")
    if not duration["full_weeks"]:
        flags.append("The test ran " + str(v["ran_days"])
                     + " days, not a whole number of weeks, so weekday patterns may be uneven across the run.")
    if v["mde_set"] is None:
        flags.append("No minimum effect worth shipping (mde_set) was set before the test, so power cannot be judged.")
    if v["mde_set"] is not None and primary["result"] == "positive":
        least = ps["ci"][0] if pm["direction"] == "up" else -ps["ci"][1]
        if least < v["mde_set"]:
            flags.append("The interval reaches below the " + pts(v["mde_set"])
                         + "-point effect the team said is worth shipping, so the true effect may be smaller than that.")
    if len(guardrails) > 3:
        flags.append("There are " + str(len(guardrails))
                     + " guardrails; with several metrics, one will look bad by chance.")
    for i in range(2):
        if users[i] < 100:
            flags.append("Arm " + v["names"][i] + " has " + str(users[i])
                         + " users; under 100 per arm the normal approximation is weak.")
    if r0 <= 0.0 or r0 >= 1.0:
        flags.append("The control rate is " + pct(r0) + ", so the power estimate is not meaningful.")

    return {
        "input": data,
        "checks": {"srm": srm, "duration": duration, "power": power},
        "primary": primary,
        "guardrails": guardrails,
        "verdict": {"decision": decision, "rule": RULES[rule], "reasons": reasons},
        "flags": flags,
    }


# ---------------------------------------------------------------------------
# Command line
# ---------------------------------------------------------------------------

def _fail(message):
    sys.stderr.write("ab_stats: " + message.replace("\n", " ") + "\n")
    return 2


def main(argv):
    usage = "usage: python3 ab_stats.py results.json [--out readout.numbers.json]"
    args = list(argv)
    out = None
    if "--out" in args:
        i = args.index("--out")
        if i + 1 >= len(args):
            return _fail(usage)
        out = args[i + 1]
        del args[i:i + 2]
    if len(args) != 1 or args[0].startswith("-"):
        return _fail(usage)
    try:
        with open(args[0], "r", encoding="utf-8") as fh:
            data = json.load(fh)
    except OSError as exc:
        return _fail("cannot read " + args[0] + ": " + exc.strerror)
    except ValueError as exc:
        return _fail("invalid JSON in " + args[0] + ": " + str(exc))
    try:
        result = readout(data)
    except InputError as exc:
        return _fail(str(exc))
    text = json.dumps(result, indent=2, ensure_ascii=False, allow_nan=False) + "\n"
    sys.stdout.write(text)
    if out is not None:
        with open(out, "w", encoding="utf-8") as fh:
            fh.write(text)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
