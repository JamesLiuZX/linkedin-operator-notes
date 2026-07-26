# First milestone: 14 days, three artifacts

Positioning lives in [00-positioning.md](./00-positioning.md).
Voice gate lives in [WRITING.md](./WRITING.md) + `npm run content:check`.

The risk here is not quality. The risk is that this becomes the fourth thing that
gets built to 95% and never deploys. So milestone 1 is deliberately small and
ends in something publicly visible.

**Done means:** the library is live on a path URL, with one essay and one demo on it,
and a third person has seen it.

| Day | Ship |
|---|---|
| 1 | Library live at a real URL with 2 stub sections. Empty is fine. Deploy first. |
| 2-4 | Essay 1 drafted through the gate. Evidence block first. |
| 5 | Essay 1 published, canonical URL live, X thread + LinkedIn atom derived from it. |
| 6-9 | Demo 1 built and recorded. 90 seconds, screen only, no face needed. |
| 10 | Demo 1 published with a 200 word writeup. |
| 11-13 | Two atoms harvested from the essay. One teardown of how the demo was built. |
| 14 | Review the tape. What got engagement, what got DMs. DMs matter more. |

## Essay 1: "The resolution criteria are the product"

The single best first piece. Here is why it works:

- The claim is non-obvious and slightly contrarian. Everyone talks about oracles
  and liquidity. Almost nobody writes about the fact that most disputes are
  writing failures.
- Only someone who has actually operated a market can write it.
- It generalizes. Any PM shipping anything with an ambiguous success condition
  recognizes themselves in it.
- It has a natural admission in it, which is the thing that makes content travel.

Evidence to fill before drafting:

- The specific market that resolved badly, and what the criteria said versus what happened.
- What the dispute volume looked like, and how long resolution took.
- The rewrite. Before and after criteria text, side by side. That is the shareable artifact.
- The counterexample: a case where tighter criteria made the market worse
  (too narrow, nobody traded it).

Hook candidates, all under 12 words:

- "Most prediction market disputes are not oracle failures. They are writing failures."
- "I lost a week to one undefined word in a market description."
- "The oracle was right. The sentence was wrong."

## Demo 1: "I gave an LLM $100 and a prediction market"

Build: an agent that reads a news feed, prices a small set of markets, posts its
implied probability against the live market price, and logs where it disagrees.
It does not need to trade real money to be interesting. The interesting output is
the disagreement log.

What makes it shareable is the failure mode, not the success. Ship it with the
part where the model confidently mispriced something and you can see why.

Recording: 90 seconds. Terminal on the left, market on the right. No intro. Start
mid-action. First frame should be the disagreement log filling up.

## Backlog, ordered by expected value

1. The resolution criteria are the product. (markets, essay)
2. I gave an LLM $100 and a prediction market. (agents, demo)
3. Liquidity is a cold start problem, not a math problem. (markets, essay)
4. Spec to PR: shipping product changes without waiting on eng. (agents, teardown)
5. What the World Cup taught me about event-led retention. (shipping, essay)
6. Your prediction market has adverse selection and you cannot see it. (markets, atom)
7. The KYC to first-trade funnel, annotated. (shipping, essay with a real funnel diagram)
8. I rebuilt my content pipeline as a compiler. (agents, teardown)

Numbers 1, 2, and 4 are the strongest openers. Do them in that order.

## Library shape

```
/                     the thesis, three sections, latest three pieces
/markets              Market design
/agents               Agents on rails
/shipping             Shipping inside a regulated exchange
/{section}/{slug}     the canonical piece
```

The 55-page prediction markets textbook is the spine of Market design.
Do not publish it as a PDF download. Break it into chapters, publish two or three
as free canonical pages, and hold the rest.

Takeaway: your edge is the thing you were about to abandon. Point AI at markets,
film it, and file it somewhere people can come back to.
