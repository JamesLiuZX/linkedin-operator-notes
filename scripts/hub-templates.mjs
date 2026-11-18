#!/usr/bin/env node
// scripts/hub-templates.mjs
//
// Writes skills/<skill>/assets/template.html for every skill that has an
// output renderer. The template is the renderer the handbook's own demos use,
// bundled into one file with its CSS, so a skill's output looks exactly like
// the worked example on the site.
//
//   node scripts/hub-templates.mjs           write the templates
//   node scripts/hub-templates.mjs --check   fail if a committed template is stale
//
// The site build (hub-build.mjs) also uses examples() from here to publish
// each worked example at /examples/<case>/<skill>.html.

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { SITE } from "../hub/site.config.mjs";
import { TEMPLATES, buildTemplate, fillJson, fillSpec, readExample } from "../hub/lib/templates.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** What each template holds before a skill fills it: the smallest valid example of its format. */
const BLANK = {
  prd: {
    doc: { title: "Replace this JSON with your prd.json", short: "PRD", eyebrow: "Template", date: "", summary: "This page is drawn from the JSON in the element with id prd-data. The format is in references/format.md." },
    sources: [{ id: "N", label: "Your notes", detail: "replace me" }],
    sections: [
      {
        n: 1,
        id: "area",
        title: "First area",
        summary: "One line on what changes here.",
        points: [
          {
            id: "1.1",
            title: "The problem, as the user meets it",
            problem: "What happens today, and what it costs the user.",
            change: "The concrete move on the screen.",
            evidence: [{ tag: "today", label: "Today", caption: "What the screen shows now.", screen: { blocks: [["bar", "Home"], ["search", "Search"], ["grid", "", { n: 2 }]] } }],
            sources: ["N"],
            know: { baseline: "What to measure first.", expect: "What should move.", stop: "The signal that means stop." },
          },
        ],
      },
    ],
    priority: [{ id: "1.1", change: "The change", moves: "The metric", effort: "S", status: { level: "ok", text: "Nothing" }, first: "The smallest next step" }],
    rollout: [{ when: "First release", points: ["1.1"], why: "Why this goes first." }],
    next: [],
    caveats: "",
  },
  board: {
    title: "Replace this JSON with your teardown.json",
    question: "This board is drawn from the JSON in the element with id teardown-data. The format is in references/format.md.",
    us: "ours",
    captured: "",
    note: "",
    apps: [
      { id: "one", name: "App one", accent: "#5b3df5", role: "Competitor" },
      { id: "two", name: "App two", accent: "#c2410c", role: "Competitor" },
      { id: "ours", name: "Our product", accent: "#14532d", role: "Our product" },
    ],
    dimensions: [
      { id: "clarity", name: "Clarity", means: "You can tell what to do next without reading twice." },
      { id: "speed", name: "Speed", means: "Few steps and little typing to finish the stage." },
      { id: "transparency", name: "Transparency", means: "Costs, limits and consequences are shown before they bite." },
      { id: "trust", name: "Trust", means: "Nothing surprises the user later." },
      { id: "engagement", name: "Engagement", means: "It gives a reason to come back or go further." },
    ],
    stages: [
      {
        id: "S1",
        name: "First stage",
        finding: "One sentence: the thing to remember about this stage.",
        lanes: [
          {
            app: "one",
            flow: "What this lane shows",
            source: "Where the screens came from, and when",
            coverage: "One screen only, as a placeholder.",
            screens: [{ step: "What the user is doing", blocks: [["bar", "Home"], ["search", "Search"], ["card", "A card", { sub: "With a second line" }], ["grid", "", { n: 2 }]], notes: [{ k: "note", t: "Replace this JSON with your teardown.json." }] }],
            scores: { clarity: { n: 4, why: "Replace with a one line reason." }, speed: { n: 4, why: "Replace with a one line reason." }, transparency: { n: 4, why: "Replace with a one line reason." }, trust: { n: 4, why: "Replace with a one line reason." }, engagement: { n: 4, why: "Replace with a one line reason." } },
            verdict: "A strength, but a weakness.",
            well: ["One thing it does well."],
            wrong: ["One thing it does wrong."],
            steal: ["One thing worth stealing."],
          },
          {
            app: "two",
            flow: "What this lane shows",
            source: "Where the screens came from, and when",
            coverage: "One screen only, as a placeholder.",
            screens: [{ step: "What the user is doing", blocks: [["bar", "Home"], ["search", "Search"], ["card", "A card", { sub: "With a second line" }], ["grid", "", { n: 2 }]], notes: [{ k: "note", t: "Replace this JSON with your teardown.json." }] }],
            scores: { clarity: { n: 3, why: "Replace with a one line reason." }, speed: { n: 3, why: "Replace with a one line reason." }, transparency: { n: 3, why: "Replace with a one line reason." }, trust: { n: 3, why: "Replace with a one line reason." }, engagement: { n: 3, why: "Replace with a one line reason." } },
            verdict: "A strength, but a weakness.",
            well: ["One thing it does well."],
            wrong: ["One thing it does wrong."],
            steal: ["One thing worth stealing."],
          },
          {
            app: "ours",
            flow: "What this lane shows",
            source: "Where the screens came from, and when",
            coverage: "One screen only, as a placeholder.",
            screens: [{ step: "What the user is doing", blocks: [["bar", "Home"], ["search", "Search"], ["card", "A card", { sub: "With a second line" }], ["grid", "", { n: 2 }]], notes: [{ k: "note", t: "Replace this JSON with your teardown.json." }] }],
            scores: { clarity: { n: 2, why: "Replace with a one line reason." }, speed: { n: 2, why: "Replace with a one line reason." }, transparency: { n: 2, why: "Replace with a one line reason." }, trust: { n: 2, why: "Replace with a one line reason." }, engagement: { n: 2, why: "Replace with a one line reason." } },
            verdict: "A strength, but a weakness.",
            well: ["One thing it does well."],
            wrong: ["One thing it does wrong."],
          },
        ],
        synthesis: {
          best: [{ app: "one", why: "Why it is the best here." }],
          patterns: [{ name: "A pattern", text: "What it is.", seen: ["one", "two"] }],
          anti: [{ name: "An anti-pattern", text: "What to avoid.", seen: ["ours"] }],
          ideal: [{ name: "First step", text: "What happens." }, { name: "Second step", text: "What happens next." }],
          gaps: [{ p: "P0", title: "A gap", today: "What happens today.", fix: "The fix.", benchmark: "one" }],
        },
      },
    ],
    principles: [
      { name: "First principle", text: "What the best versions have in common.", evidence: ["S1"] },
      { name: "Second principle", text: "Another thing they share.", evidence: ["S1"] },
      { name: "Third principle", text: "And a third.", evidence: ["S1"] },
    ],
  },
  prototype: `const spec = {
  title: "Replace this spec with your own",
  sub: "The format is in references/format.md. This one has a single screen and a single switch.",
  legal: "Concept for review. All data is illustrative.",
  theme: { brand: "#0b0c0c", brandInk: "#ffffff", brandSoft: "#eef0ea", bg: "#f6f6f2" },
  start: "home",
  sections: [{ n: 1, title: "Home" }],
  flags: [{ id: "1.1", section: 1, label: "A new card on Home", screens: ["home"], note: "What changes and why, in one or two sentences." }],
  screens: {
    home: {
      name: "Home",
      render: (ctx) => \`
        <div class="p-scroll">
          <h1 class="p-h1">Home</h1>
          \${ctx.on("1.1") ? \`<div class="p-card has-pin" \${ctx.flag("1.1")}>\${ctx.pin("1.1")}<h3>The new card</h3><p>Shown only when switch 1.1 is on.</p></div>\` : ""}
          <div class="p-card"><h3>What is here today</h3><p>With every switch off, this is the product as it is.</p></div>
          <button class="p-btn wide" style="margin-top:12px" data-toast-text="This would open the next step.">Continue</button>
        </div>\`,
    },
  },
};`,
};

/** kind -> template html, for every kind whose renderer exists. */
export async function templates(root = ROOT) {
  const out = [];
  for (const t of TEMPLATES) {
    if (!existsSync(join(root, "hub", "src", "js", "standalone", `${t.kind}.js`))) continue;
    if (BLANK[t.kind] === undefined) continue;
    out.push({ t, html: await buildTemplate(root, SITE, t, BLANK[t.kind]) });
  }
  return out;
}

/** Every example of every skill as a finished page: [{ path, contents, skill, case }]. */
export async function examples(root = ROOT) {
  const out = [];
  for (const { t, html } of await templates(root)) {
    const dir = join(root, "skills", t.skill, "examples");
    if (!existsSync(dir)) continue;
    for (const caseName of (await readdir(dir)).sort()) {
      if (!existsSync(join(dir, caseName, t.example))) continue;
      const source = await readExample(root, t, t.example, caseName);
      const contents = t.kind === "prototype" ? fillSpec(html, source) : fillJson(html, t, JSON.parse(source));
      out.push({ path: `/examples/${caseName}/${t.skill}.html`, contents, skill: t.skill, case: caseName });
    }
  }
  return out;
}

async function main() {
  const check = process.argv.includes("--check");
  let stale = 0;
  for (const { t, html } of await templates()) {
    const file = join(ROOT, "skills", t.skill, "assets", "template.html");
    const have = existsSync(file) ? await readFile(file, "utf8") : null;
    if (have === html) continue;
    if (check) {
      console.error(`hub-templates: ${file.replace(ROOT + "/", "")} is stale. Run npm run hub:templates and commit.`);
      stale++;
    } else {
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, html);
      console.log(`hub-templates: wrote ${file.replace(ROOT + "/", "")} (${(html.length / 1024).toFixed(0)} KB)`);
    }
  }
  if (check && !stale) console.log("hub-templates: every template is current");
  process.exit(stale ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
