# Test run: four meeting-recap products, 19 November 2026

## Setup

A fresh agent session was given the journey-teardown skill folder and 24 schematic screens of four products, Vireo, Castell, Ondine and Parley. It could read nothing else in the repository, and the worked examples for other cases were off limits. Nobody answered questions, so every unclear point was settled by the skill's own text. Everything is fictional. The request was to tear down how the four handle an AI meeting recap, from arrival to sent on, and to learn why people do not trust Vireo's recap enough to send it.

## Result

The check script was run once and passed on that run. Nothing failed on the way in the skill's own checks. One earlier attempt of my build script stopped on a mistake in my own sanity test (it compared blocks with and without an empty options object), before any check could run. I fixed the test and did not touch the data. The board built with the build script without errors.

```
4 apps, 3 stages, 12 lanes, 24 screens, 66 notes
Mean score by app: castell 3.4, ondine 2.6, parley 4.13, vireo 2.0
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

- Vireo's recap has already gone to all 9 invitees at 10:47 (stage 1, email), yet the Share recap dialog in stage 3 asks "Choose who gets this recap" with "All 9 invitees" selected, and the page header still offers "Share recap". The host is asked to decide something that has already happened.
- Vireo's single Decisions list holds "Offer a two-year term" beside "Annual billing stays the default". Castell files the two-year term under "Raised, not decided" and Parley under "Discussed, not decided". Vireo's page also lists "Move the kickoff call to Friday" as a decision, but its email lists only three decisions, and its action item is "Book the kickoff call".
- Vireo gives no way to check a line. Castell ends every line in a time that opens the clip at that moment. Ondine and Vireo offer only a 42-minute recording, and Parley offers no recording on any screen but does flag the doubtful pilot date with "Heard as 4 January and 11 January".
- The competitors are not clean. Castell's pilot line reads "if the quote is accepted" in the stage 1 summary and drops that condition under Decisions in stage 2, and its only share route is "Anyone with the link". Ondine says "Pricing is settled for all tiers" directly above "Sam owns the revised quote", and it created tasks at 10:43, the minute of the recap.
- Vireo gives "Book the kickoff call" to Marcus, whom Parley's lane lists as the external guest from Northgate, and nothing on Vireo's screen lets an owner accept or reply. Parley leaves Marcus unticked by default and has owners confirm their own items.
- Mean scores across the three stages: Parley 4.13, Castell 3.4, Ondine 2.6, Vireo 2.0. Vireo is last mainly on stage 2, where it scores 1.4.

## What the run noticed about the skill

- The most useful findings join two apps, such as Vireo's two-year term against Castell's "Raised, not decided". The notes rule allows a comparison of two screens of the same app only, so these findings had to go into verdicts and gaps. The text does not say whether a note may cite another app's screen.
- The input's Parley flow says "doubtful lines marked", but the first Parley screen in stage 2 shows no marks. The rule says not to repeat a claim the screen does not show. It does not say where to record the mismatch, so I put it in an idea note.
- "Relative to the best example seen" and "a 5 means you would not change it" pull against each other. It is unclear whether the best lane may take a 5 on a dimension. I gave a few 5s where nothing would change, and the checker has no view on this.
- Speed is defined as few steps and little typing, so Ondine scored 5 in stage 3 by skipping the host's consent step, while Trust marked the same skip as 1. The skill does not say how to treat a step that is short because a safeguard is missing.
- The format allows `hi` on one block, but gives no word on blocks inside `cols` or over-screen blocks (`modal`, `toast`). I highlighted the modal and the toast without seeing how they draw, and I skipped `cols`. I had no browser, so I did not view the board, and the checker does not test whether blocks fit the 215 height.
- The checker passed on the first run, so it taught nothing about my draft. It does not test that a `finding` is one sentence, that a `why` is one line, or that a gap's benchmark app has a lane in the stage or elsewhere, so the quality bar rests on the review step.
- The template prints a lane's `coverage` as "Thin coverage:". I used `coverage` on lanes with two screens to say a pre-send step might exist but is not shown, and the label fits that badly. The format says coverage is only required below two screens and is silent on this use.
- The question handling is clear. The input carried its own question, the user asked another, and the rule that the user's wins settled it at once.

## What this does not show

This is one run by one reader in one sitting, and the scores rank four products against each other. They do not measure them. The screens are schematic drawings made for the example, so nothing here says how real products look or behave, and nothing was timed. Speed is read as steps and clicks. A second reader would likely move some scores by a point, and the board itself was built but not looked at in a browser.
