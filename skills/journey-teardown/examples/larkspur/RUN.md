# Test run: four planning tools, 19 November 2026

## Setup

A fresh agent session was given the journey-teardown skill folder and 24 schematic desktop screens of four planning tools. It could read nothing else in the repository. Nobody answered questions, so every ambiguity was settled from the skill's own text. Everything is fictional: Larkspur, Thistle, Corbel and Halyard, and every screen, are made up. The request was to find what the other three do to get a second person into a workspace that Larkspur does not.

## Result

The check passed on the first run, so it took one check run and nothing failed on the way. The notes and scores were built by a script that copies every lane, screen and block from the input unchanged and adds the analysis. The board built without error. The final check output was:

```
4 apps, 3 stages, 12 lanes, 24 screens, 54 notes
Mean score by app: thistle 3.6, corbel 3.87, halyard 3.87, larkspur 2.6
  PASS  Every score has a reason
  PASS  Every pattern lists where it was seen
  PASS  Every gap names a benchmark
  PASS  No screen has more than three notes
  PASS  Your product is the last lane in every stage
  PASS  Coverage is stated
  ----  Your product was scored by the same rubric (yours to judge)
6 of 6 scripted checks passed
```

## What the teardown found

- Larkspur never mentions another person on its project screens. The Owner column says "You" on every row, and no banner, menu or prompt offers an invite. Thistle and Halyard both raise it inside the work.
- Only by comparing S1 and S3: Larkspur's signup says "Free for 14 days. No card needed." and the Add member dialog says "Adding a member starts billing today: $12 per month". The Members table also marks the admin seat "Paid". Halyard says "billed from the end of your trial".
- Only by comparing S1 and S2: Larkspur's checklist reads 2 of 5 on the project page, but the table holds three items with due dates, which are two more of the five tasks.
- Larkspur's invite takes four steps from Home (Settings, Members, Add member, type an email). Thistle has People in the main nav. Corbel needs a copied link and no typing.
- Halyard's chat tool connection at signup lists 12 named people. The S2 prompt and the S3 invite reuse those names, so no email is typed. Halyard also shows no price when people are added in S1, only in S3.
- Thistle's signup offers three email fields and says "free". Its S3 dialog says "3 seats included, then $9 per member". The fields match the seat count, but signup never states the limit.

## What the run noticed about the skill

- The checker passed on the first run, so it exercised nothing here. It is silent on note quality, so every fail-and-fix loop the skill describes had no chance to show.
- The format says a phone is the default and a desktop screen takes `frame`, `url` and `nav`, but the input already carried them. It does not say to keep them unchanged, only that blocks stay as given. The task text had to supply that.
- The highlight rule appears twice in format.md with slightly different wording. It is unclear whether `hi` on a `cols` block counts as one block when its children are not marked. The run assumed it does.
- Some blocks have no options object (`["gap"]`). The skill says to add one as the third element, but a one-element block would need an empty label too. The run avoided highlighting those.
- The skill says a note may compare two screens "and say which screens", but gives no short way to name them. The run wrote "S1", "S3" and screen texts in the sentence, which uses up the 30 word limit.
- "Relative to the best example seen for that stage" is hard to apply when the stage question and the stage content differ. Corbel S1 won on clarity but has no teammate ask. The run scored the stage as the signup, not the invite goal. This is one reader's call.
- The checker does not read whether a note on a gap is true, and it does not check that a `benchmark` app actually shows the fix on a screen of the named stage. The benchmark is only checked to be a competitor.
- The checker only tests that `best` names a real app, not that it is a competitor. The skill text says "best one or two apps", which leaves it open.

## What this does not show

This is one run of one agent, so a second reader might score the same screens differently. The screens are schematic drawings, so layout, colour, motion and copy length were not seen. The scores are one reader's, from one sitting, and they rank the apps, they do not measure them. Nothing here says whether Halyard's or Thistle's approach would raise Larkspur's second person rate.
