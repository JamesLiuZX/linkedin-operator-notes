---
title: "The scene is not the prompt"
slug: 11-the-scene-is-not-the-prompt
author: James Liu
series: Market Ops Notes
section: media
summary: "Compile one scene for four current video-gen models and only one of the four, Veo 3.1, keeps the audio cue. The other three drop it, silently."
status: published
publishAt: 2026-08-08T07:00:00Z
platforms: twitter, medium, substack
tags: media, video-gen, gen-media, prompt-engineering
twitterExcerpt: "Four video models shipped this season. Only one of them has a slot for the audio cue you write into the prompt."
demo: restyle-lab
---

<!-- EVIDENCE
Claim: A prompt written for one video-generation model is not portable to another, because the models disagree on which fields they even read, and the gap is sharpest on audio.
Moment: Building Restyle Lab's per-model prompt tips from each vendor's own documentation and finding that exactly one of the four current models, Veo 3.1, has a documented slot for an inline audio or dialogue cue.
Numbers: four labs shipped a text-to-video API in the same season (Sora 2, OpenAI; Veo 3.1, Google DeepMind; Kling 3.0, Kuaishou; Seedance 2.0, ByteDance); Veo 3.1 generates audio, dialogue, and ambience in the same pass as the picture, an 8-second clip per call; the demo compiles 4 scenes x 6 styles x 4 models, 96 deterministic combinations.
Names: Restyle Lab, Sora 2, Veo 3.1, Kling 3.0, Seedance 2.0, Google DeepMind, fal.ai, scripts/restyle-generate.mjs.
Cost: I have compiled all 96 combinations. I have not generated real video from all of them to confirm the per-model prompt tips produce what the vendor docs claim, because that is real render time and real spend against four separate accounts. The prompts are exact and reproducible; the claim that a given model responds well to a given clause is my reading of public documentation, attached to my name, not a benchmark I ran frame by frame.
Counterexample: A team targeting exactly one model does not need a compiler, it needs one prompt template iterated against that model's real quirks. The compiler earns its keep only once you are producing for more than one model or expect to switch.
Reader action: Before sharing a prompt template across more than one video model, list the fields each target model's own documentation says it reads, rather than assuming they share a format because they share a category name.
-->

# The scene is not the prompt

Four labs shipped a text-to-video API in the same season: Sora 2 from OpenAI, Veo 3.1 from Google DeepMind, Kling 3.0 from Kuaishou, Seedance 2.0 from ByteDance. Feed all four the same scene and only one of them does anything with an audio cue written into the prompt. The other three generate the clip, silently drop the cue, and hand back a video with no sound.

I built Restyle Lab to compile one scene and one visual style into a prompt for whichever of the four models I pointed it at. The mechanism is not clever. A scene is three beats of text. A style is a list of prompt modifiers and a matching list of things to exclude. A model is a name and a handful of prompt tips read out of its own documentation. `compilePrompt()` concatenates the beats, appends the style clause, appends the model's own tips, and returns a prompt plus a negative prompt. Four scenes, six styles, four models: 96 combinations, each one deterministic, the same inputs always producing the same string.

The finding was not in the compiler. It was in what the four models' own prompt tips ask for once you set them down side by side. Veo 3.1's tip is to put dialogue or a sound cue inline, in quotes, because it generates audio, dialogue, and ambience in the same pass as the picture, lip-synced to the character speaking it. Kling 3.0's tip is to lead with an explicit camera verb, dolly in, whip pan, handheld, because it responds strongly to that placement and has nothing to say about sound. Sora 2's tip is to keep cause and effect physically explicit, because the model rewards concrete physics over vibes, again nothing about sound. Seedance 2.0's tip is to describe the cut between beats explicitly, because it composes multi-shot generations with natural transitions and its own native audio, a separate claim to sound that is not the same claim Veo makes.

## Why this is not a formatting problem

The instinct, carried over from text prompting, is that a prompt is a prompt: write one good paragraph, paste it into whichever box happens to be open. That instinct fails here in a specific, structural way. A large language model reads every token and tries to use all of it. A video model has a narrower contract: it reads for the fields its own training and conditioning respond to, and treats the rest as noise. Sora 2's training rewards physical plausibility, so a camera-move verb parked at the front of the prompt is not obviously more useful there than at the end. Kling 3.0's training rewards responsiveness to that exact verb placed early, so reordering the same sentence changes the output, and not subtly.

Audio is the sharpest version of the gap. Veo 3.1 has a slot for it: write "a rider says 'wait' as the door slams" and the model renders lips moving in sync with a generated voice saying it. Feed the identical clause to Sora 2, Kling 3.0, or Seedance 2.0 and there is no slot for it to land in. The clause does not error. It does not warn you. It contributes nothing, the way a stage direction contributes nothing when nobody in the room is an actor. A prompt template shared across all four models either carries an audio cue that three of them silently discard, or it carries no audio cue and Veo's clips come back mute for a reason no viewer could guess at from the video alone.

## What the compiler actually buys

Restyle Lab does not solve this by being smart. It solves it by refusing to have one prompt. `compilePrompt({ scene, style, model })` takes the model as a first-class input and rebuilds the model's own tip list into the output every time, so switching the dropdown from Veo 3.1 to Kling 3.0 does not just swap a vendor name in a template, it changes which clauses appear at all. The registry also pins a duration ceiling next to each model, the number `scripts/restyle-generate.mjs` will actually accept on a real render call: 15 seconds for Seedance 2.0, 10 for Kling 3.0, 10 for Sora 2, 8 for Veo 3.1. A shared prompt that asks for a 12-second arc renders fine on three of the four and gets truncated on the fourth, the same portability problem as the audio cue, one field over. The storyboard preview under the compiled prompt is a second, separate honesty check: three deterministic SVG frames, one per beat, seeded from a hash of the beat text and the style id, so the same scene and style always draw the same frames and a reviewer can sanity-check the shot list before spending a real generation call on it.

What it does not do is call a model. There is no network request anywhere in the browser build, on purpose: a page published from this repo has no server behind it, so "type a prompt, get a video back" was never on the table as a live demo. The real generation path is a separate script, `scripts/restyle-generate.mjs`, which imports the identical registry and calls fal.ai directly, and that is where my own testing stops. I have compiled all 96 combinations. I have not rendered real video from all of them to confirm the per-model tips produce what each vendor's documentation claims, because that is real render time and real spend across four separate accounts. The prompts themselves are exact and reproducible. The claim that Kling responds strongly to an early camera verb is my reading of public documentation and comparison coverage, not a frame-by-frame benchmark I ran myself.

## The counterexample

None of this matters if you only ever target one model. A team that has standardized on Veo and is not switching does not need a compiler, it needs one well-tuned prompt template, iterated against that one model's real behavior, and a compiler sitting between the writer and the model would only add a layer of indirection to strip back out later. The compiler earns its keep at a specific point: the moment a brief goes to more than one model, or a freelancer picks whichever vendor is cheapest that week, or a shared template outlives the model it was originally written for. That is a narrower claim than "prompt compilers are good," and it is the only version the demo actually supports.

## What to check Monday

Before sharing a prompt template across more than one video model, write down the fields each target model's own documentation says it reads, not the fields you assume they share because they are all filed under the same category name. If exactly one of your targets has a slot for audio, the shared template has a decision to make about that slot, not a default. Leaving it in and hoping the other three ignore it gracefully is itself a choice, and on three of the four current frontier models, they will not ignore it gracefully. They will just not do anything with it at all.

Takeaway: a prompt does not port across video models by default. Compile per model, or find out which clauses your shared prompt is quietly throwing away.
