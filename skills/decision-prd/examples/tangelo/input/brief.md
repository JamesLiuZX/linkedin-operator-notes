# Brief: the weekly shop

Tangelo is a fictional grocery delivery app. Everything in this folder is made up so the skill can be shown end to end.

## What was asked

Write the PRD for making a repeat weekly shop faster, from the three pieces of research below.

## Evidence supplied

| Code | What | Where |
|---|---|---|
| T | Journey teardown: 4 apps, 3 stages | `../../../../journey-teardown/examples/tangelo/teardown.json` |
| S | Interview synthesis: 8 weekly shoppers | `../../../../interview-synthesis/examples/tangelo/synthesis.json` |
| R | Pre-mortem on one-tap reorder: 9 risks, 4 tripwires | `../../../../premortem/examples/tangelo/premortem.json` |

## The product today

- **Home:** search, category chips, a free delivery banner and a grid of popular items. Nothing about the customer's past orders.
- **Repeating a shop:** Orders tab, open an order, tap Reorder. Three taps from Home.
- **Basket:** a list of lines with prices and a total. No stock check, no substitution choice, no price history.
- **Checkout:** the delivery slot is chosen here. Stock is checked when Place order is tapped. The total is shown with no comparison to last week.
- **Substitutions:** chosen by the picker if an item runs out after ordering. The customer is told after delivery.

## Constraints given

- A repeat order must not go straight to payment. The customer has to see the basket first.
- Operations must agree to anything that holds a delivery slot.
- Any display of a previous price needs legal review before it ships.
- No baselines have been measured yet. Do not put figures in the expected results.
