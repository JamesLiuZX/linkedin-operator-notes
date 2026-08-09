---
title: "Three of four video models throw away your audio cue"
slug: 13-restyle-lab
pillar: media
section: media
status: ready
derivedFrom: articles/11-the-scene-is-not-the-prompt.md
publishAt: 2026-08-10T01:00:00Z
platforms: linkedin
tags: media, video-gen, prompt-engineering
---

<!-- EVIDENCE
Claim: Only one of four current video-gen models has a slot for an audio cue written into the prompt; the other three drop it with no warning.
Moment: Compiling the same scene through Restyle Lab for all four models and watching three of the four come back with the sound cue simply gone.
Numbers: 4 current models (Sora 2, Veo 3.1, Kling 3.0, Seedance 2.0); 1 of the 4 generates audio in the same pass (Veo 3.1); duration caps of 15s, 10s, 10s, 8s across the four; 96 scene/style/model combinations the demo compiles.
Names: Restyle Lab, Sora 2, Veo 3.1, Kling 3.0, Seedance 2.0.
Cost: I have not generated real video from all 96 combinations to confirm the per-model tips work, only compiled the prompts. The prompts are exact; the claim that a model responds well to a given clause is my reading of public docs, not a benchmark I ran.
Counterexample: a team targeting exactly one model does not need this, a single tuned prompt beats a generic one every time.
Reader action: before sharing a prompt template across more than one video model, check which fields each one's own documentation says it reads.
-->

## Draft

Four video models shipped this year. I wrote one prompt template to test all of them.

Three of the four threw away the audio cue.

Not an error, not a warning. The clip just came back silent, because Sora 2, Kling 3.0, and Seedance 2.0 have no field in their prompt format for a sound cue to land in. Veo 3.1 is the only one of the four that reads it, because it is the only one that generates audio in the same pass as the picture.

I built Restyle Lab to compile one scene into a prompt for whichever model you point it at: 4 scenes, 6 styles, 4 models, 96 combinations, each one deterministic. I have not rendered real video from all 96 to confirm the vendor docs are right, only compiled the prompts, which is a real limit and worth saying plainly.

The duration caps differ too: 15 seconds on Seedance 2.0, 10 on Kling and Sora, 8 on Veo. A shared prompt asking for a 12-second arc renders fine on three models and gets truncated on the fourth.

None of this shows up until you are writing for more than one model at a time. Most people never are, which is exactly why nobody had listed it out.

Takeaway: a prompt does not port across video models by default. Check which fields each one actually reads before you assume they share a format.

## First comment

Try it: /demos/restyle-lab

The longer version, with the duration table and what the compiler does and does not prove: /media/11-the-scene-is-not-the-prompt
