# The request

What the agent was sent, word for word. The test, the company and the numbers are fictional.

> We ran the reorder card test on Home for returning customers. 50/50 split, planned for 14 days, and it ran the full 14 days, 26 October to 8 November 2026. Hypothesis: putting last week's shop on Home gets more returning customers to order within 7 days. The counts were pulled on 16 November, so everyone had their full 7 days.
>
> Control: 20,912 customers, 6,984 of them ordered within 7 days.
> Reorder card: 20,958 customers, 7,357 ordered within 7 days.
>
> Before the test we agreed the smallest lift worth shipping is 1 point.
>
> Guardrails, all counted per order, so the bases are the orders (6,984 control, 7,357 reorder card):
>
> - Orders with 15 or more items: 4,120 vs 4,267. A fall is the harm. We would accept a fall of at most 1 point.
> - Orders with a substitution complaint: 301 vs 268. A rise is the harm. Tolerance 0.5 points.
> - Orders cancelled before delivery: 154 vs 158. A rise is the harm. Tolerance 0.5 points.
>
> Should we ship?

`results.json` beside this file is what the agent wrote from it.
