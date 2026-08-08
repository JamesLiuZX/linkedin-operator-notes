// scripts/lib/sections.mjs
// The one list of site categories. site/src/content.js re-exports this for the
// Vite build; scripts/build-seo.mjs imports it directly for the plain-Node
// sitemap build. One array, two consumers, so a new category cannot go stale
// in one of them the way it did before this file existed.

export const SECTIONS = [
  {
    id: "markets",
    title: "Market design",
    blurb: "Resolution, liquidity, incentives, and what breaks when real money shows up.",
  },
  {
    id: "agents",
    title: "AI & agents",
    blurb: "LLMs pointed at systems that have consequences, from trading agents to the tooling that catches what a model gets wrong.",
  },
  {
    id: "media",
    title: "Gen media & UGC",
    blurb: "Video generation, UGC, and the taste that decides whether generated content is worth shipping.",
  },
  {
    id: "growth",
    title: "Growth & AI workflows",
    blurb: "Distribution mechanics, workflow automation, and putting a real number on what AI actually saves.",
  },
  {
    id: "shipping",
    title: "Shipping",
    blurb: "Zero to one inside a regulated exchange.",
  },
  {
    id: "notes",
    title: "Field notes",
    blurb: "Shorter observations from the desk.",
  },
];
