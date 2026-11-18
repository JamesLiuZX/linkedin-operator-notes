---
title: How to check AI output
summary: Five questions that catch most bad AI work before it reaches a decision, and what each one looks like when a script asks it for you.
minutes: 5
order: 2
verified: 2026-11-18
---

AI output fails in a particular way. It reads well and it is wrong in one place, and you cannot tell which place by reading. So most of it gets skimmed, half trusted and thrown away.

The fix is not a better prompt. It is to make the output checkable, and then to check it. These are the five questions every skill in this handbook is built around.

## 1. Can I open the source?

Every claim should point at something you can open: a quote at a line in a transcript, a number at the counts it came from, a recommendation at the screen that shows it working.

A claim with no source is an opinion. That may be fine, but it should be labelled as one. In the [pre-mortem](/workflows/premortem/), a risk with no evidence either way is marked as a guess, and the page counts the guesses at the top.

## 2. Was it computed or written?

A language model asked for a p-value will write one. It will look right. The same goes for a total, a percentage and a count of how many customers said something.

Anything with a right answer should come from code, and the code should be in the folder. In the [experiment readout](/workflows/experiment-readout/) a script does all of the arithmetic, and the checker reruns it on the counts stored in the file. If a single figure differs, the check fails.

## 3. Is every quote real?

Models tidy quotes. They merge two sentences, drop a hedge, or produce the line the customer should have said. People do it too, from memory.

The [interview synthesis](/workflows/interview-synthesis/) looks for every quote in the transcripts, word for word, and removes any it cannot find. In its test run the request included a line the requester remembered from the calls. Nobody had said it. The script took it out.

## 4. Does it say what it does not know?

Good work has edges. Look for the list of what was not covered: the stage with no screens, the participants who said little, the question the data cannot answer. If the output has no such list, the edges are still there. You just cannot see them.

## 5. Could the check have failed?

A check that always passes is decoration. Ask of any "verified" label what would have made it fail, and whether anyone tried.

Each skill here was handed to a fresh agent session with nothing but the skill folder, and asked to list everything wrong with the instructions. Those records are public, one per workflow. The first run of the teardown passed every check and came back with fifteen complaints. That was the sign the checks were too easy, and they were made stricter.

## What a script cannot check

Some things stay with you, and each skill names one:

- whether the counts in an experiment are the right counts;
- whether the themes answer the question you asked;
- whether a tripwire uses a metric your team really has;
- whether your product was scored as hard as the competitors.

A script can tell you a document is well formed and its sources exist. It cannot tell you the document is right. The point of the checks is to leave you with the one judgment that needs you, and to take the rest away.

## The two-minute version

For any AI document, from any tool, ask three things:

1. **Pick one number.** Where did it come from? Can you recompute it?
2. **Pick one quote or citation.** Open the source. Is it there, in those words?
3. **Find the part that says what was left out.** If there is none, ask for it.

If all three hold, read the rest. If one fails, the rest has not earned your time yet.
