#!/usr/bin/env node
// scripts/build-apps.mjs
// The apps in apps/*.html are authored as Artifact bodies: no doctype, no
// <html>, no <head>, no <body>, because the Artifact runtime supplies that
// wrapper at publish time. This wraps the same source into standalone pages
// under site/public/apps/ so GitHub Pages serves the identical build.
//
// One source, two deployments. Editing the artifact and forgetting the hosted
// copy is the failure this script exists to prevent.

import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';

const SRC = 'apps';
const OUT = 'site/public/apps';

function titleOf(html, fallback) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : fallback;
}

function descriptionOf(html) {
  const m = html.match(/<p>([\s\S]*?)<\/p>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 180) : '';
}

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function wrap(body, title, description) {
  // Mirrors the Artifact wrapper: a minimal reset, then the body verbatim.
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escapeAttr(description)}">
<title>${title}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { min-height: 100vh; }
  img, svg, video, canvas { display: block; max-width: 100%; }
  button, input, select, textarea { font: inherit; color: inherit; }
</style>
</head>
<body>
${body}
</body>
</html>
`;
}

const files = (await readdir(SRC)).filter((f) => extname(f) === '.html');
if (!files.length) {
  console.error(`no .html files in ${SRC}/`);
  process.exit(1);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const built = [];
for (const file of files) {
  const body = await readFile(join(SRC, file), 'utf8');

  // These would be silently duplicated inside the Artifact wrapper. The tag
  // boundary matters: <header> must not be mistaken for <head>.
  const DOC_TAGS = [/<!doctype/i, /<html[\s>]/i, /<head[\s>]/i, /<body[\s>]/i];
  for (const re of DOC_TAGS) {
    if (re.test(body)) {
      console.error(`${SRC}/${file} contains ${re.source}. Artifact bodies must not include document tags.`);
      process.exit(1);
    }
  }

  const name = basename(file, '.html');
  const title = titleOf(body, name);
  const description = descriptionOf(body);
  await writeFile(join(OUT, file), wrap(body, title, description), 'utf8');
  built.push({ file, title, bytes: body.length });
}

const index = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Apps</title>
<style>
  body { margin:0; padding:48px 24px; background:#0a0d13; color:#dce3ee;
    font:15px/1.6 system-ui, sans-serif; }
  main { max-width: 62ch; margin: 0 auto; }
  h1 { font-family: ui-monospace, Menlo, monospace; font-size:15px; letter-spacing:.16em;
    text-transform:uppercase; margin:0 0 28px; }
  ul { list-style:none; padding:0; margin:0; display:grid; gap:2px; }
  a { display:block; padding:16px 0; border-top:1px solid #1f2836; color:#dce3ee;
    text-decoration:none; }
  a:hover, a:focus-visible { color:#e8a33d; }
  li:last-child a { border-bottom:1px solid #1f2836; }
</style></head>
<body><main><h1>Apps</h1><ul>
${built.map((b) => `<li><a href="./${b.file}">${b.title}</a></li>`).join('\n')}
</ul></main></body></html>
`;
await writeFile(join(OUT, 'index.html'), index, 'utf8');

for (const b of built) console.log(`  ${b.file.padEnd(24)} ${(b.bytes / 1024).toFixed(1)} KB  ${b.title}`);
console.log(`\n  wrote ${built.length + 1} file(s) to ${OUT}/`);
