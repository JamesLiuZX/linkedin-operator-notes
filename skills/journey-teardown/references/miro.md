# Building the board on Miro

Do this only when a Miro connector is connected and the user wants the board there. `teardown.json` is still written first: the Miro board is drawn from it, so the two cannot disagree.

## Before drawing

1. **Load the connector's own drawing guidance.** Miro's connector publishes how its canvas tools expect content to be written. Call that guidance tool first (at the time of writing it is the canvas composer skill tool) and follow it for every shape. Tool names and formats change, and the connector's guidance outranks anything written here.
2. **Create a new board,** named after the teardown's title. Never draw onto an existing board unless the user names it.
3. **Upload the screens.** Each screenshot needs an address the board can show: upload image files through the connector, or use their links. Schematic screens have no image, so draw each as a placeholder rectangle with its step caption inside.

## What to draw, in this order

Draw the vocabulary first. Then one stage at a time, so a stage is complete before the next begins.

| Order | Frame | Where | Holds |
|---|---|---|---|
| 1 | Start here | Top left | Title, the question, how to read the board, the four note labels with their colours, the five dimensions with their meanings, the apps |
| 2 | Scorecard | Top right | A grid of apps (rows, the user's product tinted) by stages (columns). Each cell is the mean of that lane's five scores |
| 3 | Stage N | Left column, stacked | One lane per app, the user's product last |
| 4 | Stage N synthesis | Directly right of its stage | Finding, scores, best in class, patterns, anti-patterns, the ideal flow, gaps |
| 5 | The ideal flow | Bottom, full width | The principles, each with the stages it draws on |

## A lane, left to right

- **Meta column:** the app's name, the flow, the source and capture date, the overall score, then five score bars with their numbers.
- **Screens:** each with its step caption above, an arrow to the next, and up to three note cards under it.
- **Verdict column:** the one-sentence verdict, then Does well (green), Does wrong (red) and, for competitors, Steal (blue).

Give the user's own lane a tinted background so it stands apart.

## Colours

Keep these the same on every frame, so colour alone tells a reader what a card is.

| Card | Colour |
|---|---|
| Good, Does well, Patterns | Green |
| Friction, Does wrong, Anti-patterns, Gaps | Red |
| Note | Grey |
| Idea, Steal, Ideal flow steps | Blue |
| The user's own lane | Pale blue background |

## Sizes that work

Use these as a starting grid and let the connector's guidance adjust them.

- A lane about 4,000 wide. Height depends on the notes, around 1,300.
- A screen slot about 300 by 650, with 60 between screens for the arrow.
- A note card 300 wide under its screen, 16 apart.
- Stage frames stacked with 200 between them. The synthesis frame the same height as its stage, 200 to its right.

## After drawing

- Read the board back through the connector and compare the counts of lanes, screens and notes with `teardown.json`. If they differ, fix the board.
- Give the user the board link, and say plainly if any frame could not be drawn.

## When it goes wrong

- **The connector is missing a tool this file assumes.** Use what it has. A board of frames, rectangles, images and text is enough.
- **Uploads fail.** Draw placeholders with the step captions and tell the user which images to drop in.
- **The board gets too large to draw in one go.** Draw one stage per call. A real teardown of ten apps and ten stages runs to thousands of items.
