# The quality bar

A PRD from this skill is not handed over until these hold. Six are checked by `scripts/check.py`. One is yours.

| # | Check | Who checks | What fails it |
|---|---|---|---|
| 1 | Every point has a problem, a change and evidence | Script | A point with any of the three empty |
| 2 | IDs are unique and used consistently | Script | A duplicate ID, an ID in a table that is not a point, a point missing from the priority table or the rollout, a point in two rollout rows |
| 3 | Titles state problems | Script | A title that opens with a building verb such as Add, Build or Improve |
| 4 | Every point says how you would know | Script | A missing baseline, expected movement or stop signal |
| 5 | Every figure has a source or is marked as an estimate | Script | A size in the expected movement (a percentage, points, a multiple) with no "estimate" beside it. A percentage in a problem is flagged as a warning to verify |
| 6 | Problem and Change stay short | Script | More than two sentences in either |
| 7 | The first release is small enough to ship | You | Read the first rollout row and ask what you would cut |

## Why these seven

1. **Problem, change, evidence.** A point missing one of these is an opinion, a wish or an unsupported claim. Reviewers can only approve the combination.
2. **Consistent IDs.** The numbering is what lets a reviewer move from a problem to its row in the plan and its switch in the prototype. One broken reference and the scheme stops being trusted.
3. **Problem titles.** If the headings are solutions, a skim tells the reader what you want to build, not why. A problem title also survives when the solution changes.
4. **How you would know.** A change with no stop signal is never stopped.
5. **Sourced figures.** An invented number in a PRD is repeated in every meeting after it.
6. **Short.** Two sentences forces the claim to be specific. Longer explanations belong in the linked research.
7. **A small first release.** This is the judgment the script cannot make. The usual failure is a first release that is the whole document.

## What the checker does not see

- Whether the evidence actually supports the point. It checks that a source is cited, not that the citation is fair.
- Whether the change solves the problem.
- Organisational reality: who has to agree, and in what order.

Those are the review.
