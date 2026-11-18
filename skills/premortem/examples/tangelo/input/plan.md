# Plan: one-tap reorder

Tangelo is a fictional grocery delivery app. This plan and everything around it is made up so the skill can be shown end to end.

## What ships

A card at the top of Home for returning customers: "Your usual shop, 23 items, about $61", with one button, Reorder. Tapping it places last week's order again, to the same address, on the next available delivery slot, with the saved card. A confirmation screen follows.

## Who gets it

Every customer who has placed at least three orders. Planned for the first week of January 2027.

## What it is meant to change

- More returning customers place an order each week.
- A repeat order takes under two minutes, not the ten or more it takes now.

## What we already know

- **Journey teardown (code T):** four apps, three stages. Two competitors put the repeat order on Home. One checks stock when the basket opens. One holds the delivery slot from the first screen. Tangelo does none of these, and its checkout fails at the last step when items are out of stock.
- **Interview synthesis (code S):** eight weekly shoppers. Six of eight rebuild the same basket by hand each week. Five of eight have received a substitution they did not want. Four of eight have lost the delivery slot they wanted while building the basket. Three of eight notice the same basket costing more and cannot tell why. The one participant who had used the existing Reorder button reached checkout and found four items unavailable.
- There is no order data in this plan. No baseline has been measured.

## What we can measure today

- Orders per returning customer per week
- Items per order
- Share of checkouts that fail on an out-of-stock item
- Substitution complaints per 100 orders
- Delivery slot utilisation
- Orders cancelled before delivery
- Contacts to support, by reason

## Constraints

- Operations run the delivery slots and have not been consulted.
- The stock service is owned by another team. Its response time on a full basket is not known.
