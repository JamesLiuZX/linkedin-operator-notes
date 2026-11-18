# Test run: four grocery apps, 18 November 2026

A check on whether the skill works when it is all an agent has. It was run twice, and the board in this folder is from the second run.

## Setup

A fresh agent session was given this skill folder and the 24 schematic screens in `input/screens.json`. It could read nothing else, and nobody was available to answer questions. The request was: tear down how these four apps handle a repeat weekly shop, and say what would make it a two-minute job. The apps and screens are fictional.

A Miro connector was present in the session. The request said the user does not use Miro, so no Miro board was built. The Miro route in `references/miro.md` has not been exercised by a test run.

## Result

The first run passed all six checks on the first attempt and came back with fifteen things wrong with the instructions. A first-time pass with fifteen complaints mostly shows the checker was too lenient. The instructions and the checker were both changed, and the skill was run again from scratch by a new session.

The second run, which is the board published here:

```
4 apps, 3 stages, 12 lanes, 24 screens, 60 notes
Mean score by app: pippin 3.73, marrow 3.67, sorrel 2.53, tangelo 2.13
  PASS  Every score has a reason
  PASS  Every pattern lists where it was seen
  PASS  Every gap names a benchmark
  PASS  No screen has more than three notes
  PASS  Your product is the last lane in every stage
  PASS  Coverage is stated
  ----  Your product was scored by the same rubric (yours to judge)
6 of 6 scripted checks passed
```

The scores moved between runs. In the first, the two best apps averaged 4.13. In the second they averaged 3.73 and 3.67, after the instructions said that a 5 means you would not change it, so the best lane in a stage does not get a 5 by default.

## What the first run found wrong with the skill

These are fixed in version 1.0.0.

| Found | Fixed by |
|---|---|
| The screen format was defined in another skill's reference, which this skill could not read | The block reference is now in this skill's own `references/format.md` |
| It was unclear how the `hi` highlight works: per note or per screen, and what to do with blocks that have no options | One highlighted block per screen at most, and the rule for adding options is spelled out |
| The procedure said `finding` belongs to the synthesis. The format and the checker put it on the stage | The procedure now matches the format |
| The input carried its own question and the user asked another | The user's question wins, and the agent writes the title |
| The input arrived with lanes and step captions. The procedure assumed the agent builds them | Keep what is given, and never repeat in a note a claim the screen does not show |
| "Relative to the best example" did not say whether the best lane must score 5 | A 5 means you would not change it |
| No way to score a dimension the lane's screens do not show | Score what is visible and say so in the reason |
| Every gap had to name a competitor, even when no app on the board showed the fix | `benchmark` may be `null`, with a `benchmarkNote` saying so |
| A pattern could count the user's own product as one of its two sightings | At least one sighting has to be a competitor |
| A missing verdict or finding, or an ideal flow of the wrong length, only produced a warning | They now fail |
| `steal` on the user's own lane passed | It fails |
| Nothing was said about a house style | Honour any house style the user gives |

## What the second run found

Eight smaller points. The ones that changed the skill:

| Found | Fixed by |
|---|---|
| `SKILL.md` said to build a Miro board whenever a connector is present. `miro.md` said only when the user wants one | Both now say: only when a connector is connected and the user wants the board there |
| A note could not record a fact that spans two stages, such as a total that changed between Home and the basket | A note may compare two screens of the same app, in this stage or another, and says which |
| It was unclear whether a benchmark must come from the same stage | It may come from any stage |
| The question was about time and nothing was timed | Read Speed as steps, taps and typing, and say nothing was timed |

Left as they are: a note of exactly 30 words passes although the format says under 30, and two stages pass with a warning although the skill asks for three to six.

## What the run found in Tangelo

Worth saying, because it is the reason the method exists. The Home screen promises "Free delivery over $40". The basket two screens later charges $4.50 delivery on a $56.70 subtotal. No single screen shows the problem, so a screen-by-screen review misses it. The teardown caught it by comparing two screens of the same lane. It is recorded as an anti-pattern and a gap, and the PRD lists it as a bug to fix whatever else ships.

## What this does not show

Two runs, one set of screens, one model. The screens are schematic drawings, so nothing here tests how well the skill reads real screenshots. One reader scored every lane in one sitting. The scores rank the lanes. They do not measure them.
