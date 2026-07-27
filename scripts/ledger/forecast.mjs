// scripts/ledger/forecast.mjs
// The two-arm forecaster.
//
// Arm A (anchored) sees the current market price. Arm B (blind) does not.
//
// That split is the point of the whole project. Everyone assumes an LLM shown a
// market price mostly restates it; nobody has published the measurement. If the
// anchored arm is well calibrated and the blind arm is not, the model is not
// forecasting, it is reading the price and adding prose. The delta between the
// arms is the finding, and it only exists if the blind prompt never sees a
// price, so the two prompts are built by separate functions below and the blind
// one is given no field that could carry one.

import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-opus-5';
export const ARMS = ['anchored', 'blind'];

const SYSTEM = `You are a calibrated forecaster producing probability estimates for binary prediction markets.

Your estimates are scored with Brier and log loss against real resolutions, in public, permanently. Overconfidence is punished hardest at the tails: saying 0.95 and being wrong costs far more than saying 0.75 and being wrong.

Rules:
- Reason from base rates first, then adjust for the specific evidence.
- State what would have to be true for you to be wrong.
- Never output 0 or 1. If you are as certain as you can honestly be, 0.02 and 0.98 are the limits.
- If the resolution criteria are ambiguous, say so and widen toward 0.5 rather than guessing which reading is intended.

End your response with a fenced json block, and nothing after it:

\`\`\`json
{"probability": 0.42, "confidence": "low|medium|high", "key_factors": ["...", "..."], "wrong_if": "..."}
\`\`\``;

function anchoredPrompt(market, asOf) {
  return `Market: ${market.question}
Venue: ${market.venue}
Closes: ${market.closeTime}
Today: ${asOf}
Current market price (implied probability of YES): ${market.marketProb.toFixed(3)}

The market's own price is shown above. Use it as one input among others. Where you disagree with it, say why explicitly.

Give your probability that this resolves YES.`;
}

function blindPrompt(market, asOf) {
  // Deliberately narrow. No price, no volume, no venue-side hint of consensus.
  return `Market: ${market.question}
Closes: ${market.closeTime}
Today: ${asOf}

You do not have access to any market price for this question. Estimate from evidence and base rates alone. Do not guess what a market would say; give your own probability that this resolves YES.`;
}

/** Pull the trailing json block out of the response text. */
function extractJSON(text) {
  const fences = [...text.matchAll(/```json\s*([\s\S]*?)```/gi)];
  const candidates = fences.length ? fences.map((m) => m[1]) : [];

  const last = text.lastIndexOf('{');
  if (last !== -1) candidates.push(text.slice(last));

  for (const candidate of candidates.reverse()) {
    try {
      const parsed = JSON.parse(candidate.trim());
      if (typeof parsed?.probability === 'number') return parsed;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

function validate(parsed) {
  const p = Number(parsed.probability);
  if (!Number.isFinite(p)) throw new Error(`probability is not a number: ${parsed.probability}`);
  if (p <= 0 || p >= 1) throw new Error(`probability ${p} is outside (0, 1); log loss would be infinite`);
  return {
    probability: p,
    confidence: ['low', 'medium', 'high'].includes(parsed.confidence) ? parsed.confidence : null,
    keyFactors: Array.isArray(parsed.key_factors) ? parsed.key_factors.map(String).slice(0, 6) : [],
    wrongIf: parsed.wrong_if ? String(parsed.wrong_if) : null,
  };
}

const REPAIR_SCHEMA = {
  type: 'object',
  properties: {
    probability: { type: 'number', description: 'Probability of YES, strictly between 0 and 1' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    key_factors: { type: 'array', items: { type: 'string' } },
    wrong_if: { type: 'string' },
  },
  required: ['probability', 'confidence', 'key_factors', 'wrong_if'],
  additionalProperties: false,
};

function textOf(message) {
  return message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
}

function usageOf(message) {
  const u = message.usage ?? {};
  return {
    input: u.input_tokens ?? 0,
    output: u.output_tokens ?? 0,
    cacheRead: u.cache_read_input_tokens ?? 0,
  };
}

/**
 * One arm, one market. Runs the model, resumes across `pause_turn` (the server
 * tool loop pauses at its iteration cap), then parses. If the trailing json
 * block is missing or malformed, a second constrained call repairs it rather
 * than throwing away a paid research turn.
 */
export async function forecastOne({
  client,
  market,
  arm,
  asOf,
  effort = 'high',
  research = true,
  maxTokens = 16000,
  maxContinuations = 5,
}) {
  if (!ARMS.includes(arm)) throw new Error(`unknown arm "${arm}"`);
  if (arm === 'anchored' && market.marketProb === null) {
    throw new Error(`anchored arm needs a market price for ${market.venue}:${market.id}`);
  }

  const tools = research ? [{ type: 'web_search_20260209', name: 'web_search', max_uses: 6 }] : [];
  const params = {
    model: MODEL,
    max_tokens: maxTokens,
    system: SYSTEM,
    output_config: { effort },
    ...(tools.length ? { tools } : {}),
  };

  const messages = [
    {
      role: 'user',
      content: arm === 'anchored' ? anchoredPrompt(market, asOf) : blindPrompt(market, asOf),
    },
  ];

  const usage = { input: 0, output: 0, cacheRead: 0 };
  let message;
  let continuations = 0;

  while (true) {
    message = await client.messages.create({ ...params, messages });
    const u = usageOf(message);
    usage.input += u.input;
    usage.output += u.output;
    usage.cacheRead += u.cacheRead;

    if (message.stop_reason !== 'pause_turn') break;
    if (++continuations > maxContinuations) break;
    // Re-send with the paused assistant turn appended; the server resumes.
    messages.push({ role: 'assistant', content: message.content });
  }

  if (message.stop_reason === 'refusal') {
    throw new Error(`model declined this market (${message.stop_details?.category ?? 'unspecified'})`);
  }

  const body = textOf(message);
  let parsed = extractJSON(body);
  let repaired = false;

  if (!parsed) {
    const repair = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: REPAIR_SCHEMA } },
      messages: [
        {
          role: 'user',
          content: `Extract the forecast from this analysis. Report the probability the analysis actually argues for, do not invent a new one.\n\n<analysis>\n${body}\n</analysis>`,
        },
      ],
    });
    const u = usageOf(repair);
    usage.input += u.input;
    usage.output += u.output;
    parsed = extractJSON(textOf(repair)) ?? JSON.parse(textOf(repair));
    repaired = true;
  }

  const result = validate(parsed);

  return {
    ...result,
    arm,
    model: MODEL,
    effort,
    research,
    repaired,
    stopReason: message.stop_reason,
    usage,
    // Kept short on purpose. The ledger is a scoreboard, not a transcript store.
    rationale: body.replace(/```json[\s\S]*?```/gi, '').trim().slice(0, 2000),
  };
}

export function makeClient() {
  // Resolves ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN, or an `ant auth login` profile.
  return new Anthropic();
}
