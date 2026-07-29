#!/usr/bin/env node
/**
 * Restyle Lab CLI — compiles a scene/style/model into a prompt (same registry
 * the browser demo at /demos/restyle-lab uses) and, if FAL_KEY is set,
 * actually submits it to fal.ai's queue API for real generation.
 *
 * Usage:
 *   node scripts/restyle-generate.mjs --scene flooded-ruin --style gta --model seedance-2
 *   node scripts/restyle-generate.mjs --scene "custom text..." --style noir --model kling-3 --out out.mp4
 *   node scripts/restyle-generate.mjs --list                       # show scene/style/model ids
 *
 * Without FAL_KEY set, prints the compiled prompt and stops (dry run).
 * Model slugs drift as providers ship new versions — override a stale
 * registry entry with --fal-model <slug>.
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SCENES, STYLES, MODELS, findScene, findStyle, findModel, compilePrompt } from "./lib/restyle.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadDotEnv() {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadDotEnv();

function parseArgs(argv) {
  const out = { out: "restyle-out.mp4" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    if (key === "list") {
      out.list = true;
      continue;
    }
    out[key] = argv[i + 1];
    i++;
  }
  return out;
}

function listRegistry() {
  console.log("Scenes:  " + SCENES.map((s) => s.id).join(", "));
  console.log("Styles:  " + STYLES.map((s) => s.id).join(", "));
  console.log("Models:  " + MODELS.map((m) => m.id).join(", "));
}

async function submitToFal(falModel, compiled, timeoutMs) {
  const key = process.env.FAL_KEY;
  const headers = { Authorization: `Key ${key}`, "Content-Type": "application/json" };
  const body = JSON.stringify({
    prompt: compiled.prompt,
    negative_prompt: compiled.negativePrompt,
    duration: compiled.model.maxDurationSec,
  });

  const submitRes = await fetch(`https://queue.fal.run/${falModel}`, { method: "POST", headers, body });
  if (!submitRes.ok) {
    throw new Error(`fal.ai submit failed: ${submitRes.status} ${await submitRes.text()}`);
  }
  const { status_url, response_url, request_id } = await submitRes.json();
  console.log(`Submitted. request_id=${request_id}`);

  const deadline = Date.now() + timeoutMs;
  let delay = 2000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay * 1.4, 10000);
    const statusRes = await fetch(status_url, { headers: { Authorization: `Key ${key}` } });
    const statusBody = await statusRes.json();
    console.log(`  status: ${statusBody.status}`);
    if (statusBody.status === "COMPLETED") {
      const resultRes = await fetch(response_url, { headers: { Authorization: `Key ${key}` } });
      return resultRes.json();
    }
    if (statusBody.status === "ERROR" || statusBody.status === "FAILED") {
      throw new Error(`fal.ai generation failed: ${JSON.stringify(statusBody)}`);
    }
  }
  throw new Error(`Timed out after ${timeoutMs}ms waiting on ${status_url}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.list || (!args.scene && !args.style && !args.model)) {
    listRegistry();
    if (!args.scene) return;
  }

  const style = findStyle(args.style) || STYLES[0];
  const model = findModel(args.model) || MODELS[0];
  const scene = findScene(args.scene);
  const customText = scene ? null : args.scene;

  if (!scene && !customText) {
    console.error("Pass --scene <id> (see --list) or --scene \"free text\".");
    process.exit(1);
  }

  const compiled = compilePrompt({ scene: scene || SCENES[0], style, model, customText });
  const falModel = args["fal-model"] || model.falModel;

  console.log(`\nScene:  ${compiled.scene.title}`);
  console.log(`Style:  ${compiled.style.name}`);
  console.log(`Model:  ${compiled.model.name} (${compiled.model.vendor}) — fal slug: ${falModel}`);
  console.log(`\nPrompt:\n${compiled.prompt}`);
  console.log(`\nNegative prompt:\n${compiled.negativePrompt}`);
  console.log(`\nShots:`);
  for (const shot of compiled.shots) {
    console.log(`  ${shot.index}. [${shot.camera}] ${shot.text}`);
  }

  if (!process.env.FAL_KEY) {
    console.log(`\nDry run only — set FAL_KEY in .env to actually generate via fal.ai.`);
    console.log(`Verify the model slug at ${model.docsUrl} first; it changes as providers ship new versions.`);
    return;
  }

  console.log(`\nSubmitting to fal.ai (${falModel})...`);
  const timeoutMs = args.timeout ? Number(args.timeout) * 1000 : 10 * 60 * 1000;
  const result = await submitToFal(falModel, compiled, timeoutMs);
  const videoUrl = result?.video?.url || result?.output?.url || result?.output?.[0]?.url;
  if (!videoUrl) {
    console.log("Completed, but couldn't find a video URL in the response — raw result:");
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const bytes = Buffer.from(await (await fetch(videoUrl)).arrayBuffer());
  writeFileSync(join(process.cwd(), args.out), bytes);
  console.log(`Saved ${args.out} (${bytes.length} bytes)`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
