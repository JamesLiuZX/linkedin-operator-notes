---
title: "Before the agent runs"
slug: 2026-11-22-before-the-agent-runs
date: 2026-11-22
status: published
summary: "Amazon caught attackers' AI agents going from an API map to arbitrary file writes in about 11 minutes, Claude computer use reached Team and Enterprise plans switched off by default, Signal started blocking AI assistants from reading its screen, a House report counted the Chinese models inside US products, and METR found AI judges grading stronger models too kindly. Plus two courses."
cover: /digests/2026-11-22-before-the-agent-runs/cover.png
carousel: /digests/2026-11-22-before-the-agent-runs/carousel.pdf
slides: 8
post: posts/dg-2026-11-22-before-the-agent-runs.md
window: 20 to 21 Nov 2026
---

# Before the agent runs

Covering 20 to 21 Nov 2026: five changes that move a product team's week, all of them published on Friday 20 Nov. Each one is a question to settle before an agent runs: what it can reach, who checks its work, and where its model came from. Plus two courses and my read. Every number links to where it came from.

## 1. Attackers' AI agents found and exploited a zero-day in about 11 minutes

**What happened.** On 20 Nov, Amazon's CISO CJ Moses published Amazon Threat Intelligence's account of a campaign that ran for about 48 hours from 8 Sep 2026 against universities in East Asia outside mainland China. The operator used Cairn, which Amazon describes as "an open-source autonomous AI penetration-testing framework" built for defenders: give it a starting point and a goal in plain language, and it coordinates several AI agents to reach the goal. Against an open-source medical imaging AI application, the agents found a path traversal flaw in an upload endpoint, and "in about 11 minutes, the agents went from mapping the application's API to arbitrarily writing files on the server." A later session produced a reverse shell running as root, and a second university network was reached through a tunnel. Amazon assesses with high confidence that the flaw was a zero-day. It told the maintainers, who released a fix and a GitHub security advisory. BleepingComputer dates the update to 18 Nov and names the application as MONAI Label.

**Why it matters.** Speed is only half of it. Elsewhere in the same campaign the agents spent roughly 16 hours and 148 sequential actions on an unauthenticated Redis instance, and more than 6 hours trying over 30,000 credential combinations against a GPU server. Both attempts failed, but Amazon says they show the agents "kept adapting for nearly a full day without human direction." Anything you expose, internal AI tooling included, can now be probed with that persistence for the price of the tokens. Amazon's advice is to "prioritize high-confidence detections that trigger automated response, with humans overseeing outcomes rather than reviewing every individual action." Note also how the campaign surfaced: on 10 Sep Amazon found the attackers' own Cairn instance publicly hosted and running without authentication. Agent infrastructure with no login shows the world everything it does, and that applies to yours.

**The catch.** This is Amazon's account, and its attribution is "moderate confidence" that the actor is Chinese-nexus, based on Simplified Chinese prompts, China Standard Time timestamps and the choice of targets. The affected organizations were not AWS customers, and the post also promotes AWS's own active defenses. Amazon's post names the application only through its advisory link and gives no affected versions or CVE, so if you run MONAI Label, read the advisory.

Sources: [AWS Security Blog, "Chinese-nexus actor's Cairn AI agents found a zero-day on their own"](https://aws.amazon.com/blogs/security/chinese-nexus-actors-cairn-ai-agents-found-a-zero-day-on-their-own/) · [BleepingComputer, 20 Nov](https://www.bleepingcomputer.com/news/security/hackers-use-autonomous-ai-tool-cairn-to-find-zero-day-take-over-server/)

## 2. Claude computer use reached Team and Enterprise plans, switched off by default

**What happened.** Anthropic's release notes for 20 Nov make computer use available in beta on Team and Enterprise plans, rolling out to organizations gradually. It lets Claude see a user's screen and work in the desktop apps they allow: in Claude Desktop on macOS 14 or later and on Windows, and from Claude on the web and on mobile, where the organization's Computer access setting is on and a computer with Claude Desktop is open. The setup guide says it is "off by default" and that "only an Owner or Primary Owner can change this setting." Owners can keep a block list or an allow list of apps ("Every app is denied except the ones on your allow list. Users still approve each app."), and a device management key can keep it off on chosen machines.

**Why it matters.** The guide is direct about the risk: "Computer use has no sandbox between Claude and a user's applications," and "content on the screen, such as web pages or emails, could cause Claude to take unintended actions." It is not limited to the folders a user has connected, and the app lists do not cover Claude in Chrome, Claude Code, websites, browser extensions or remote desktops. For a finance or operations team, the allow list and each user's app approvals are the fence. Write the list before anyone switches the feature on, and keep apps that show customer or account data off it until you have tested what an instruction planted on screen can make Claude do.

**The catch.** It is a beta with a gradual rollout, so your organization may not have it yet. Screenshots "can include personal or confidential information," and the automated check that reviews Claude's actions can see the latest one, which Anthropic says it can keep in its record of that check. Turning access off or changing it takes "about an hour, sometimes longer" to reach every computer. On Enterprise, everyone with a built-in role gets it as soon as it is on, and leaving someone out means moving them to a custom role.

Sources: [Claude release notes, 20 Nov](https://support.claude.com/en/articles/12138966-release-notes) · [Claude Help Center, "Set up computer use for Team and Enterprise plans"](https://support.claude.com/en/articles/18483812-set-up-computer-use-for-team-and-enterprise-plans)

## 3. Signal now blocks AI assistants from reading its screen by default

**What happened.** Engadget reported on 20 Nov that Signal now blocks screenshots by default on iOS 27, through a new "Block Siri AI" setting that is on by default, and blocks AI assistants that try to capture the screen on Android, using its existing "Screen security" option. When it detects a screenshot on iOS, or an assistant reading the screen on Android, it shows a prompt that offers to turn the protection off. The targets are assistants built into the operating system that read what is on screen to answer questions, such as Apple's Siri AI and Google's Gemini Intelligence. Signal already blocked Microsoft's Recall from snapshotting chats on Windows 11 last year.

**Why it matters.** Per Engadget, Signal calls agents built into phones an "existential threat," describes accessibility permissions "as a skeleton key," and says operating system makers offer developers no way to restrict AI access "without making drastic compromises to the core user experience." If your app shows balances, statements or trade tickets, the same assistants can read those screens. Today the control an app has is the one Signal used: block capture on sensitive screens, and accept the cost for users who wanted the assistant's help. If you build agents that work through the screen, expect more apps to make the same call, and use an API wherever one exists.

**The catch.** Per Engadget, Signal describes the fix as incomplete, and the gaps are wide. Blocking on your phone does nothing if the person you are talking to has switched the protection off, it does not stop third-party agents reading notifications or files, and "on Mac, that leaves Signal without any user protections at all." Engadget, citing Reuters, says Meta's Muse agent read Signal messages through notifications on Android and accessibility permissions on Mac. I could not open Signal's own post, so this item rests on Engadget's report.

Source: [Engadget, "Signal now blocks screenshots by default to stymie AI agents"](https://www.engadget.com/2323574/signal-now-blocks-screenshots-by-default-to-stymie-ai-agents/)

## 4. A House report counts the Chinese models inside US products

**What happened.** On Friday 20 Nov, the House Homeland Security Committee and the Select Committee on China released a joint report on US companies that run Chinese open-weight models, per TNW. The inquiry began in April with letters to Anysphere, the company behind Cursor, and to Airbnb, and added DoorDash in July. In TNW's account of the report, Airbnb runs customized versions of Alibaba's Qwen on US servers: one powers an assistant handling about 80,000 guest and host conversations a day, and another summarizes about 250,000 support cases and calls a day. DoorDash reported 25 Chinese model families in real use, each costing at least $5,000 to run. Anysphere "plans to explore phasing out PRC-developed open-weight models because of geopolitical risk," the committees wrote. Cursor's Composer 2 was built on Moonshot AI's Kimi K2.5, a base the committees say became public only after an outside developer identified it.

**Why it matters.** The committees recommend extending the federal DeepSeek ban to other Chinese developers, keeping such models out of federal contract work and high-risk critical infrastructure, a model provenance standard, and a national American open-weight initiative. They add that hosting a model in the US keeps the data out of China but "does not change how the model was trained." If you sell to government, banks or other regulated buyers, expect due diligence to ask which base models sit under your product, fine-tunes included. DoorDash supplied the planning number: swapping out a model built into a larger system could take up to six months, while most other uses could switch almost at once.

**The catch.** These are recommendations in a congressional report, not law, and TNW says Cursor's plan is exploratory, "with no decision or timetable." The committees themselves warn that forcing companies off Chinese models before trusted alternatives exist would raise costs and hand the market to a few closed providers. Neither the committee's page nor CNBC's story loaded for me, so every figure in this item comes from TNW's account of the report.

Sources: [TNW, 21 Nov](https://thenextweb.com/news/cursor-chinese-ai-models-house-report-sarvam-deepseek) · [the joint report, as linked by TNW (not opened by me)](https://chinaselectcommittee.house.gov/media/reports/joint-investigation-report-china-is-trying-to-get-us-companies-addicted-to-chinese-ai-models)

## 5. METR found AI judges grading stronger models too kindly

**What happened.** METR published a capability update on 20 Nov titled "AI R&D-relevant model capabilities are improving rapidly and are getting harder to measure." It added new tasks, including some that are hard to verify or need judgment, and tested public models up to Opus 5.5 and GPT-6 Astra. On its pooled task suites it estimates a 50% time horizon of 40 hours for GPT-6 Astra and 39 hours for Opus 5.5, with the horizon doubling "roughly every 3.61 months," or about 110 days. It also asked agents to design new evaluation tasks for it: "None of the tasks agents produced were sufficiently useful to us to warrant inclusion in this post."

**Why it matters.** METR also tested models as graders. Opus 5.5, the judge that agreed most with METR's human scorer, still scored GPT-6 Astra's tasks "on average about 0.2 (out of 1) more highly" than the human did, and judges were overgenerous when the model being graded was as strong as the judge or stronger. If your team grades an agent with an LLM, check the judge against a sample of human-scored outputs, and check again each time you upgrade the agent's model, because a judge that grades a weaker model fairly can turn generous on a stronger one. On rating critiques of philosophical arguments, every public model still fell short of experts given 15 minutes.

**The catch.** The intervals are wide: Astra's 40 hours has a 95% interval of 13 to 2,645 hours. METR says it is "increasingly concerned that our easy-to-run, containerized evals could overestimate real-world capabilities," it scored runs that gamed their tasks as zero, and many of its human task times are estimates. I read the main findings and parts of appendices A to C, not appendices D to O.

Source: [METR, "AI R&D-relevant model capabilities are improving rapidly and are getting harder to measure"](https://metr.org/blog/2026-11-20-q4-2026-capability-update/)

## New courses worth an evening

- **CS 329Z: Engineering AI Agents** · YouTube · free. Stanford's Fall 2026 course by Diyi Yang, Michael Ryan and John Yang, on building agents from scratch. Its site links 9 lecture videos so far, running from foundations, RAG and tool use to memory, multi-agent systems and optimization. The lectures on evaluation, LLM-as-judge and agent safety (prompt injection, red-teaming, sandboxing and permission models) have slides up but no video yet. It assumes an NLP course or equivalent background. Take it if you want to know what your vendor's agent is doing between your prompt and its answer. [Stanford](https://cs329z.stanford.edu/)
- **CMU AI Agents 2026: 13. Agentic Safety** · YouTube · free. Graham Neubig's lecture for CMU 11-768, posted 16 Oct, on what it takes to make an agentic system safe. It comes from the CMU course this digest picked on 6 Nov, and it is the lecture to watch before you write a computer-use allow list. [YouTube](https://www.youtube.com/watch?v=Mbonnq-PUGM)

No Udemy pick again: every Udemy page I tried failed to load, so I could check neither a rating nor an update date, and I do not list a course I cannot check. Every pick so far is on the [courses page](/courses).

## My read

Every item this week is a question that has to be answered before an agent runs, because afterwards is too late. What it may reach: Anthropic shipped computer use with no sandbox, so the owner's allow list and each user's approvals are the fence, and Signal had to fence off its own screen from assistants it cannot otherwise stop. Who checks it: the attackers' agents moved in minutes and kept going for a day, which is why Amazon wants automated response, and METR's numbers say that check should not be one model grading a stronger one with no human calibration. Where its model came from: the House wants that on record, and Cursor's base model only came to light because an outsider spotted it. None of this is exotic. It is one page per agent, kept current. Two of this week's primary sources, Signal's post and the House report, did not load for me, and I say so where they appear.

Takeaway: before an agent runs, write down what it may touch, who checks its work and where its model came from.
