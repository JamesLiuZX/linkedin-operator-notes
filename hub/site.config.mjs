// hub/site.config.mjs
//
// The one place the hub's name, links and install commands live. Every page,
// the newsletter, the feed and the skills pack read from here, so renaming the
// hub or moving the skills to their own repository is a change to this file
// only.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The sign-up form's public address, once a sending account exists (see NEWSLETTER.md).
const subFile = fileURLToPath(new URL("./subscribe.json", import.meta.url));
const sub = existsSync(subFile) ? JSON.parse(readFileSync(subFile, "utf8")) : {};

export const SITE = {
  name: "AI Workflow Handbook",
  short: "Handbook",
  tagline: "Practical AI workflows for product people",
  description:
    "A free handbook of working AI workflows for product, research, data and strategy. Each one is an agent skill with a live demo and a worked example you can open before you install anything.",

  author: {
    name: "James Liu",
    role: "Product owner. Builds with AI agents every working day.",
    url: "https://jamesliuzx.com",
    linkedin: "https://www.linkedin.com/in/james-liu-zx/",
  },

  // Where the skills are installed from. When the pack moves to its own
  // repository, change owner/name here and nothing else.
  repo: {
    owner: "JamesLiuZX",
    name: "linkedin-operator-notes",
    branch: "master",
    skillsDir: "skills",
  },

  // Claude Code plugin marketplace name and plugin name (.claude-plugin/).
  marketplace: "ai-workflow-handbook",
  plugin: "handbook",

  // Used for absolute URLs (feed, Open Graph, sitemap) when SITE_URL is unset.
  defaultOrigin: "https://jamesliuzx.github.io/linkedin-operator-notes",

  weekly: {
    name: "The Weekly Run",
    promise: "One working AI workflow, one demo and the three changes that matter to people who ship products. Every Tuesday, about four minutes.",
    // Filled from hub/subscribe.json once a sending account exists (see
    // NEWSLETTER.md). Until then the subscribe block offers the feed and a
    // LinkedIn follow.
    formAction: process.env.HUB_SUBSCRIBE_ACTION || sub.formAction || "",
    formEmailField: process.env.HUB_SUBSCRIBE_FIELD || sub.emailField || "email_address",
    subscribeUrl: process.env.HUB_SUBSCRIBE_URL || sub.subscribeUrl || "",
  },
};

/** The spine of the handbook: the five stages a piece of product work moves through. */
export const STAGES = [
  { id: "understand", n: "01", title: "Understand", blurb: "Find out what is true before deciding anything." },
  { id: "decide", n: "02", title: "Decide", blurb: "Choose what to do and write down what would change your mind." },
  { id: "specify", n: "03", title: "Specify", blurb: "Turn the decision into something a team can build and a reviewer can try." },
  { id: "measure", n: "04", title: "Measure", blurb: "Read the result honestly and say what happens next." },
];

/**
 * The cases the worked examples are drawn from. Every workflow has one example
 * per case, so a reader can follow the domain closest to their own work.
 * All three companies are invented.
 */
export const CASES = [
  {
    id: "tangelo",
    domain: "Consumer marketplace",
    company: "Tangelo",
    what: "a grocery delivery app",
    title: "Making the weekly shop a two-minute job",
    question: "Why does a repeat shop take so long, and what would make it a two-minute job?",
    outcome: "The test won, and the readout said extend: one guardrail was not settled.",
  },
  {
    id: "larkspur",
    domain: "B2B SaaS",
    company: "Larkspur",
    what: "a planning tool for product teams",
    title: "Getting a second person into a trial",
    question: "Why do most trial workspaces never get a second active person in the first week, and what would get one in?",
    outcome: "A free view-only link beat the invite. Every guardrail held, and the readout said ship.",
  },
  {
    id: "vireo",
    domain: "AI product",
    company: "Vireo",
    what: "AI meeting recaps",
    title: "A recap people trust enough to send",
    question: "Why do people not trust an AI recap enough to send it on, and what would make one sendable?",
    outcome: "The test looked like an 8-point win. The split was broken, and the readout said do not trust it.",
  },
];

export const caseOf = (id) => CASES.find((c) => c.id === id) || CASES[0];

export const ROLES = [
  { id: "product", title: "Product" },
  { id: "research", title: "Research" },
  { id: "data", title: "Data" },
  { id: "strategy", title: "Strategy" },
];

export const repoUrl = (path = "") =>
  `https://github.com/${SITE.repo.owner}/${SITE.repo.name}${path ? `/tree/${SITE.repo.branch}/${path}` : ""}`;

export const repoSlug = () => `${SITE.repo.owner}/${SITE.repo.name}`;
