#!/usr/bin/env python3
"""Tests for ab_stats.py. Standard library unittest only.

Run:  python3 -I test_ab_stats.py
"""

import copy
import contextlib
import io
import json
import math
import os
import statistics
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ab_stats as ab  # noqa: E402

EXAMPLE_DIR = os.path.join(os.path.dirname(HERE), "examples", "tangelo")


def make(users=(10000, 10000), counts=(1000, 1200), direction="up", guardrails=(),
         ran_days=14, planned_days=14, mde_set=0.01, alpha=0.05, split=(0.5, 0.5)):
    """Build a results.json-shaped dict from explicit numbers."""
    return {
        "test": {"name": "T", "hypothesis": "H", "unit": "users", "planned_split": list(split),
                 "planned_days": planned_days, "ran_days": ran_days, "start": "2026-01-05",
                 "end": "2026-01-18", "mde_set": mde_set, "alpha": alpha},
        "arms": [{"name": "Control", "users": users[0]}, {"name": "Variant", "users": users[1]}],
        "primary": {"name": "Converted", "direction": direction, "counts": list(counts)},
        "guardrails": [dict(g) for g in guardrails],
    }


def rail(counts, harm, tolerance, denominators=None, name="Guard"):
    g = {"name": name, "harm": harm, "counts": list(counts), "tolerance": tolerance}
    if denominators is not None:
        g["denominators"] = list(denominators)
    return g


def run_cli(args):
    """Run ab_stats.main, returning (exit code, stdout, stderr)."""
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        code = ab.main(args)
    return code, out.getvalue(), err.getvalue()


class SpecialFunctions(unittest.TestCase):

    def test_normal_quantile_known_values(self):
        self.assertAlmostEqual(ab.norm_ppf(0.95), 1.6448536, delta=1e-7)
        self.assertAlmostEqual(ab.norm_ppf(0.975), 1.9599640, delta=1e-7)
        self.assertAlmostEqual(ab.norm_ppf(0.995), 2.5758293, delta=1e-7)
        self.assertAlmostEqual(ab.norm_ppf(0.80), 0.8416212, delta=1e-7)
        self.assertEqual(ab.norm_ppf(0.5), 0.0)
        self.assertAlmostEqual(ab.norm_ppf(0.05), -1.6448536, delta=1e-7)

    def test_normal_quantile_against_stdlib_across_all_three_regions(self):
        nd = statistics.NormalDist()
        for p in (1e-10, 1e-6, 0.001, 0.01, 0.02, 0.02425, 0.03, 0.1, 0.3, 0.5, 0.7,
                  0.9, 0.97, 0.97575, 0.98, 0.999, 1 - 1e-6):
            self.assertAlmostEqual(ab.norm_ppf(p), nd.inv_cdf(p), delta=1e-12, msg=str(p))

    def test_normal_quantile_rejects_out_of_range(self):
        for p in (0.0, 1.0, -0.1, 1.5):
            with self.assertRaises(ab.InputError):
                ab.norm_ppf(p)

    def test_normal_cdf_known_values(self):
        self.assertEqual(ab.norm_cdf(0.0), 0.5)
        self.assertAlmostEqual(ab.norm_cdf(1.959963984540054), 0.975, delta=1e-12)
        self.assertAlmostEqual(ab.norm_cdf(1.6448536269514722), 0.95, delta=1e-12)
        self.assertAlmostEqual(ab.norm_cdf(-1.0), 0.15865525393145707, delta=1e-13)
        self.assertAlmostEqual(ab.norm_cdf(3.0), 0.9986501019683699, delta=1e-13)

    def test_erfc_against_math_erfc(self):
        x = -6.0
        while x <= 8.0:
            expected = math.erfc(x)
            got = ab.erfc(x)
            self.assertLessEqual(abs(got - expected), 1e-15, msg="absolute x=%r" % x)
            self.assertLessEqual(abs(got - expected), 1e-13 * expected + 1e-300,
                                 msg="x=%r got=%r expected=%r" % (x, got, expected))
            x = round(x + 0.05, 10)
        for x in (1.4999999, 1.5, 1.5000001, 10.0, 20.0, 26.0):
            self.assertLessEqual(abs(ab.erfc(x) - math.erfc(x)), 1e-13 * math.erfc(x) + 1e-300)

    def test_chi_square_p_known_values(self):
        self.assertAlmostEqual(ab.chi2_sf_1df(3.841459), 0.05, delta=1e-6)
        self.assertAlmostEqual(ab.chi2_sf_1df(6.634897), 0.01, delta=1e-6)
        self.assertAlmostEqual(ab.chi2_sf_1df(10.827566), 0.001, delta=1e-6)
        self.assertEqual(ab.chi2_sf_1df(0.0), 1.0)


class TwoProportions(unittest.TestCase):

    def test_hand_computed_example(self):
        """Control 100 of 1000, variant 150 of 1000, alpha 0.05.

        r0 = 100 / 1000 = 0.10
        r1 = 150 / 1000 = 0.15
        diff = 0.15 - 0.10 = 0.05
        lift = 0.05 / 0.10 = 0.5
        unpooled se = sqrt(0.10 * 0.90 / 1000 + 0.15 * 0.85 / 1000)
                    = sqrt(0.00009 + 0.0001275) = sqrt(0.0002175) = 0.0147478812037526
        z_{0.975} = 1.9599639845400536
        ci = 0.05 -/+ 1.9599639845400536 * 0.0147478812037526
           = 0.05 -/+ 0.0289053160076304 = [0.0210946839923696, 0.0789053160076304]
        pooled rate = (100 + 150) / 2000 = 0.125
        pooled se = sqrt(0.125 * 0.875 * (1/1000 + 1/1000)) = sqrt(0.00021875) = 0.0147901994577490
        z = 0.05 / 0.0147901994577490 = 3.38061701891407
        p = erfc(3.38061701891407 / sqrt(2)) = 0.000723232716430
        """
        z_crit = ab.norm_ppf(0.975)
        self.assertAlmostEqual(z_crit, 1.9599639845400536, delta=1e-14)
        s = ab.two_proportions([100, 150], [1000, 1000], z_crit)
        self.assertAlmostEqual(s["rates"][0], 0.10, delta=1e-15)
        self.assertAlmostEqual(s["rates"][1], 0.15, delta=1e-15)
        self.assertAlmostEqual(s["diff"], 0.05, delta=1e-15)
        self.assertAlmostEqual(s["se"], 0.0147478812037526, delta=1e-15)
        self.assertAlmostEqual(s["ci"][0], 0.0210946839923696, delta=1e-14)
        self.assertAlmostEqual(s["ci"][1], 0.0789053160076304, delta=1e-14)
        self.assertAlmostEqual(s["z"], 3.38061701891407, delta=1e-12)
        self.assertAlmostEqual(s["p"], 0.000723232716430, delta=1e-14)
        r = ab.readout(make(users=(1000, 1000), counts=(100, 150), mde_set=None))
        self.assertAlmostEqual(r["primary"]["lift"], 0.5, delta=1e-14)

    def test_identical_extreme_rates_give_p_one(self):
        s = ab.two_proportions([0, 0], [500, 500], 1.96)
        self.assertEqual((s["z"], s["p"], s["se"], s["ci"]), (0.0, 1.0, 0.0, [0.0, 0.0]))

    def test_srm_hand_computed(self):
        """1000 vs 1200 users on a 50/50 plan: expected 1100 each,
        chi2 = 100^2/1100 + 100^2/1100 = 18.1818..., p = erfc(sqrt(9.0909...)) = 2.0110e-5."""
        s = ab.srm_check([1000, 1200], [0.5, 0.5])
        self.assertEqual(s["expected"], [1100.0, 1100.0])
        self.assertAlmostEqual(s["chi2"], 20000.0 / 1100.0, delta=1e-12)
        self.assertAlmostEqual(s["p"], math.erfc(math.sqrt(20000.0 / 2200.0)), delta=1e-17)
        self.assertFalse(s["pass"])

    def test_power_formula(self):
        """baseline 0.1, 1000 per arm: mde = (1.959964 + 0.841621) * sqrt(0.09 * 0.002) = 0.0375868."""
        pw = ab.power_check(0.1, 1000, 1000, 0.05, 0.01)
        zs = statistics.NormalDist().inv_cdf(0.975) + statistics.NormalDist().inv_cdf(0.8)
        self.assertAlmostEqual(pw["mde_abs"], zs * math.sqrt(0.09 * 0.002), delta=1e-15)
        self.assertAlmostEqual(pw["mde_rel"], pw["mde_abs"] / 0.1, delta=1e-15)
        self.assertIs(pw["adequate"], False)
        self.assertIsNone(ab.power_check(0.1, 1000, 1000, 0.05, None)["adequate"])
        self.assertIs(ab.power_check(0.1, 100000, 100000, 0.05, 0.01)["adequate"], True)


class DecisionRules(unittest.TestCase):

    def decide(self, data):
        r = ab.readout(data)
        return r["verdict"]["decision"], int(r["verdict"]["rule"].split(":")[0].split()[1]), r

    def test_rule_1_srm_fails_do_not_trust(self):
        # 1000 vs 1200 users on a 50/50 plan: p = 2.0e-5 < 0.001. A worse guardrail is ignored.
        d, rule, r = self.decide(make(users=(1000, 1200), counts=(100, 180),
                                      guardrails=[rail((10, 60), "up", 0.01)]))
        self.assertEqual((d, rule), ("do-not-trust", 1))
        self.assertFalse(r["checks"]["srm"]["pass"])

    def test_rule_2_guardrail_worse_stop(self):
        # Primary 10.0% -> 12.0% (positive); guardrail 1.0% -> 2.0% with harm up: worse.
        d, rule, r = self.decide(make(counts=(1000, 1200), guardrails=[rail((100, 200), "up", 0.01)]))
        self.assertEqual(r["primary"]["result"], "positive")
        self.assertEqual(r["guardrails"][0]["verdict"], "worse")
        self.assertEqual((d, rule), ("stop", 2))

    def test_rule_3_primary_negative_stop(self):
        # Direction up, 12.0% -> 10.0%: the whole interval is below zero.
        d, rule, r = self.decide(make(counts=(1200, 1000)))
        self.assertEqual(r["primary"]["result"], "negative")
        self.assertEqual((d, rule), ("stop", 3))

    def test_rule_3_respects_direction_down(self):
        # Direction down, 10.0% -> 12.0% is the bad side.
        d, rule, r = self.decide(make(counts=(1000, 1200), direction="down"))
        self.assertEqual((r["primary"]["result"], d, rule), ("negative", "stop", 3))
        d, rule, r = self.decide(make(counts=(1200, 1000), direction="down"))
        self.assertEqual((r["primary"]["result"], d, rule), ("positive", "ship", 5))

    def test_rule_4_positive_but_stopped_early_extend(self):
        d, rule, r = self.decide(make(counts=(1000, 1200), ran_days=7, planned_days=14))
        self.assertTrue(r["checks"]["duration"]["stopped_early"])
        self.assertEqual((d, rule), ("extend", 4))

    def test_rule_5_positive_all_held_ship(self):
        # Guardrail 1.0% vs 1.0%, harm up, tolerance 1 point: interval about -/+0.28 points.
        d, rule, r = self.decide(make(counts=(1000, 1200), guardrails=[rail((100, 100), "up", 0.01)]))
        self.assertEqual(r["guardrails"][0]["verdict"], "held")
        self.assertEqual((d, rule), ("ship", 5))

    def test_rule_6_positive_guardrail_unclear_extend(self):
        # Guardrail 50.0% -> 49.5%, harm down, tolerance 0.5 points: interval -1.9 to 0.9 points.
        d, rule, r = self.decide(make(counts=(1000, 1200), guardrails=[rail((5000, 4950), "down", 0.005)]))
        self.assertEqual(r["guardrails"][0]["verdict"], "unclear")
        self.assertEqual((d, rule), ("extend", 6))

    def test_rule_7_inconclusive_with_power_stop(self):
        # 100,000 per arm, 10.00% -> 10.05%: mde 0.38 points <= 1 point set, interval spans zero.
        d, rule, r = self.decide(make(users=(100000, 100000), counts=(10000, 10050)))
        self.assertEqual(r["primary"]["result"], "inconclusive")
        self.assertIs(r["checks"]["power"]["adequate"], True)
        self.assertEqual((d, rule), ("stop", 7))

    def test_rule_8_inconclusive_underpowered_extend(self):
        # 1,000 per arm, 10.0% -> 11.0%: mde 3.8 points > 1 point set.
        d, rule, r = self.decide(make(users=(1000, 1000), counts=(100, 110)))
        self.assertIs(r["checks"]["power"]["adequate"], False)
        self.assertEqual((d, rule), ("extend", 8))

    def test_rule_8_when_mde_set_missing(self):
        d, rule, r = self.decide(make(users=(100000, 100000), counts=(10000, 10050), mde_set=None))
        self.assertIsNone(r["checks"]["power"]["adequate"])
        self.assertEqual((d, rule), ("extend", 8))
        self.assertTrue(any("mde_set" in f for f in r["flags"]))

    def test_reasons_are_two_to_four_sentences_without_em_dashes(self):
        cases = [make(users=(1000, 1200)), make(guardrails=[rail((100, 200), "up", 0.01)]),
                 make(counts=(1200, 1000)), make(ran_days=7), make(),
                 make(guardrails=[rail((5000, 4950), "down", 0.005)] * 2),
                 make(users=(100000, 100000), counts=(10000, 10050)),
                 make(users=(1000, 1000), counts=(100, 110))]
        for c in cases:
            reasons = ab.readout(c)["verdict"]["reasons"]
            self.assertTrue(2 <= len(reasons) <= 4, reasons)
            for s in reasons:
                self.assertNotIn("—", s)
                self.assertTrue(s.endswith("."), s)


class GuardrailOrientation(unittest.TestCase):

    def test_harm_down(self):
        # A fall hurts. Interval wholly below zero -> worse; a rise -> held.
        self.assertEqual(ab.guardrail_verdict([-0.03, -0.01], "down", 0.005), "worse")
        self.assertEqual(ab.guardrail_verdict([0.01, 0.03], "down", 0.005), "held")
        self.assertEqual(ab.guardrail_verdict([-0.004, 0.01], "down", 0.005), "held")
        self.assertEqual(ab.guardrail_verdict([-0.006, 0.01], "down", 0.005), "unclear")

    def test_harm_up(self):
        # A rise hurts. Interval wholly above zero -> worse; a fall -> held.
        self.assertEqual(ab.guardrail_verdict([0.01, 0.03], "up", 0.005), "worse")
        self.assertEqual(ab.guardrail_verdict([-0.03, -0.01], "up", 0.005), "held")
        self.assertEqual(ab.guardrail_verdict([-0.01, 0.004], "up", 0.005), "held")
        self.assertEqual(ab.guardrail_verdict([-0.01, 0.006], "up", 0.005), "unclear")

    def test_worse_is_checked_before_held(self):
        # Significant harm smaller than the tolerance is still reported as worse.
        self.assertEqual(ab.guardrail_verdict([-0.002, -0.001], "down", 0.01), "worse")

    def test_orientation_through_readout_from_counts(self):
        up = ab.readout(make(guardrails=[rail((200, 100), "up", 0.005), rail((100, 200), "up", 0.005)]))
        self.assertEqual([g["verdict"] for g in up["guardrails"]], ["held", "worse"])
        down = ab.readout(make(guardrails=[rail((200, 100), "down", 0.005), rail((100, 200), "down", 0.005)]))
        self.assertEqual([g["verdict"] for g in down["guardrails"]], ["worse", "held"])

    def test_denominators_default_to_arm_users(self):
        r = ab.readout(make(users=(10000, 20000), split=(1 / 3, 2 / 3),
                            guardrails=[rail((100, 200), "up", 0.01)]))
        self.assertEqual(r["guardrails"][0]["rates"], [0.01, 0.01])


class Flags(unittest.TestCase):

    def test_flags(self):
        r = ab.readout(make(users=(80, 90), counts=(8, 9), ran_days=10, mde_set=None,
                            guardrails=[rail((1, 1), "up", 0.01)] * 4))
        text = " ".join(r["flags"])
        for needle in ("stopped after 10 of 14", "not a whole number of weeks", "mde_set",
                       "4 guardrails", "Control has 80 users", "Variant has 90 users"):
            self.assertIn(needle, text)

    def test_clean_test_has_no_flags(self):
        self.assertEqual(ab.readout(make())["flags"], [])

    def test_short_run_is_not_full_weeks(self):
        self.assertFalse(ab.readout(make(ran_days=0 + 6, planned_days=6))["checks"]["duration"]["full_weeks"])
        self.assertTrue(ab.readout(make(ran_days=21, planned_days=14))["checks"]["duration"]["full_weeks"])


class InvalidInputs(unittest.TestCase):

    def assertInvalid(self, data, fragment):
        with self.assertRaises(ab.InputError) as ctx:
            ab.readout(data)
        self.assertIn(fragment, str(ctx.exception))

    def test_three_arms(self):
        d = make()
        d["arms"].append({"name": "B", "users": 10000})
        self.assertInvalid(d, "Exactly two arms")

    def test_one_arm(self):
        d = make()
        d["arms"].pop()
        self.assertInvalid(d, "Exactly two arms")

    def test_count_above_users(self):
        self.assertInvalid(make(users=(100, 100), counts=(50, 101)), "larger than its denominator")

    def test_count_above_guardrail_denominator(self):
        self.assertInvalid(make(guardrails=[rail((10, 60), "up", 0.01, denominators=(50, 50))]),
                           "larger than its denominator")

    def test_bad_fields(self):
        self.assertInvalid(make(direction="sideways"), "direction")
        self.assertInvalid(make(split=(0.5, 0.6)), "sum to 1")
        self.assertInvalid(make(alpha=1.5), "alpha")
        self.assertInvalid(make(mde_set=-0.01), "mde_set")
        self.assertInvalid(make(users=(0, 100)), "users")
        self.assertInvalid(make(counts=(-1, 5)), "counts")
        self.assertInvalid(make(counts=(1.5, 5)), "counts")
        self.assertInvalid(make(guardrails=[rail((1, 1), "sideways", 0.01)]), "harm")
        g = rail((1, 1), "up", 0.01)
        del g["tolerance"]
        self.assertInvalid(make(guardrails=[g]), "tolerance")
        d = make()
        d["arms"][0]["users"] = True
        self.assertInvalid(d, "users")
        self.assertInvalid([], "JSON object")

    def test_cli_exit_codes(self):
        with tempfile.TemporaryDirectory() as tmp:
            bad = os.path.join(tmp, "bad.json")
            with open(bad, "w") as fh:
                json.dump(make(users=(100, 100), counts=(50, 101)), fh)
            code, out, err = run_cli([bad])
            self.assertEqual(code, 2)
            self.assertEqual(out, "")
            self.assertEqual(err.count("\n"), 1)
            notjson = os.path.join(tmp, "x.json")
            with open(notjson, "w") as fh:
                fh.write("{not json")
            self.assertEqual(run_cli([notjson])[0], 2)
            self.assertEqual(run_cli([os.path.join(tmp, "missing.json")])[0], 2)
            self.assertEqual(run_cli([])[0], 2)

    def test_cli_out_matches_stdout(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = os.path.join(tmp, "in.json")
            dst = os.path.join(tmp, "out.json")
            with open(src, "w") as fh:
                json.dump(make(), fh)
            code, out, err = run_cli([src, "--out", dst])
            self.assertEqual((code, err), (0, ""))
            with open(dst) as fh:
                self.assertEqual(fh.read(), out)


class TangeloExample(unittest.TestCase):

    def setUp(self):
        with open(os.path.join(EXAMPLE_DIR, "input", "results.json")) as fh:
            self.data = json.load(fh)
        self.r = ab.readout(copy.deepcopy(self.data))

    def test_intended_outcome(self):
        r = self.r
        self.assertTrue(r["checks"]["srm"]["pass"])
        self.assertEqual(r["primary"]["result"], "positive")
        self.assertEqual([g["verdict"] for g in r["guardrails"]], ["unclear", "held", "held"])
        self.assertEqual(r["verdict"]["decision"], "extend")
        self.assertTrue(r["verdict"]["rule"].startswith("Rule 6:"))

    def test_against_independent_stdlib_computation(self):
        """Recompute the primary with math.erfc and statistics.NormalDist, not the script's own functions."""
        nd = statistics.NormalDist()
        n0, n1, x0, x1 = 20912, 20958, 6984, 7357
        r0, r1 = x0 / n0, x1 / n1
        se = math.sqrt(r0 * (1 - r0) / n0 + r1 * (1 - r1) / n1)
        zc = nd.inv_cdf(0.975)
        pool = (x0 + x1) / (n0 + n1)
        z = (r1 - r0) / math.sqrt(pool * (1 - pool) * (1 / n0 + 1 / n1))
        pr = self.r["primary"]
        self.assertAlmostEqual(pr["ci"][0], (r1 - r0) - zc * se, delta=1e-14)
        self.assertAlmostEqual(pr["ci"][1], (r1 - r0) + zc * se, delta=1e-14)
        self.assertAlmostEqual(pr["p"], 2 * (1 - nd.cdf(abs(z))), delta=1e-12)
        chi2 = 2 * (n0 - (n0 + n1) / 2) ** 2 / ((n0 + n1) / 2)
        self.assertAlmostEqual(self.r["checks"]["srm"]["p"], math.erfc(math.sqrt(chi2 / 2)), delta=1e-14)

    def test_committed_readout_is_current(self):
        with open(os.path.join(EXAMPLE_DIR, "readout.numbers.json")) as fh:
            committed = json.load(fh)
        self.assertEqual(committed, json.loads(json.dumps(self.r)))


if __name__ == "__main__":
    unittest.main(verbosity=1)
