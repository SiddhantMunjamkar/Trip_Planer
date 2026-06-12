import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripJsonFences(content: string): string {
  return content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
}

function salvageTruncatedJson(text: string): string | null {
  let candidate = stripJsonFences(text.trim());

  // Close an unterminated string
  const quoteCount = (candidate.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    candidate += '"';
  }

  // Drop trailing comma / partial key
  candidate = candidate.replace(/,\s*"[^"]*"?\s*:\s*"?[^"]*$/, '');
  candidate = candidate.replace(/,\s*"[^"]*$/, '');
  candidate = candidate.replace(/,\s*$/, '');

  // Close open arrays/objects
  const opens = { '{': 0, '[': 0 };
  for (const ch of candidate) {
    if (ch === '{') opens['{']++;
    if (ch === '}') opens['{']--;
    if (ch === '[') opens['[']++;
    if (ch === ']') opens['[']--;
  }
  while (opens['['] > 0) {
    candidate += ']';
    opens['[']--;
  }
  while (opens['{'] > 0) {
    candidate += '}';
    opens['{']--;
  }

  try {
    JSON.parse(candidate);
    return candidate;
  } catch {
    return null;
  }
}

function extractJsonFromText(content: string): string {
  const stripped = stripJsonFences(content.trim());

  try {
    JSON.parse(stripped);
    return stripped;
  } catch {
    // continue
  }

  const objectStart = stripped.indexOf('{');
  const objectEnd = stripped.lastIndexOf('}');
  if (objectStart !== -1 && objectEnd > objectStart) {
    const candidate = stripped.slice(objectStart, objectEnd + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // continue
    }
  }

  const salvaged = salvageTruncatedJson(stripped);
  if (salvaged) return salvaged;

  return stripped;
}

function extractTextFromCandidate(candidate: {
  content?: { parts?: Array<{ text?: string; thought?: boolean }> };
}): string {
  const parts = candidate?.content?.parts ?? [];
  const answerParts = parts.filter((part) => !part.thought && part.text);
  if (answerParts.length > 0) {
    return answerParts.map((part) => part.text).join('\n').trim();
  }
  return parts.map((part) => part.text).filter(Boolean).join('\n').trim();
}

function toGeminiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as { error?: { message?: string; status?: string } } | undefined;
    const message = data?.error?.message || error.message;

    if (status === 429) {
      const err = new Error(`Gemini rate limit reached. Please wait a minute and try again.`);
      (err as Error & { status: number }).status = 429;
      return err;
    }
    if (status === 503 || status === 500) {
      const err = new Error(`Gemini is temporarily busy (${status}). Please try again in a few seconds.`);
      (err as Error & { status: number }).status = status;
      return err;
    }
    if (status === 403 || status === 401) {
      return new Error(`Gemini rejected the API key (${status}). Check GEMINI_API_KEY in Backend/.env.`);
    }
    return new Error(`Gemini request failed (${status ?? 'network error'}): ${message}`);
  }

  return error instanceof Error ? error : new Error(String(error));
}

export interface GeminiResult {
  text: string;
  finishReason?: string;
}

export async function generateWithGemini(
  prompt: string,
  options: {
    temperature?: number;
    maxOutputTokens?: number;
    retries?: number;
    jsonMode?: boolean;
  } = {}
): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) throw new Error('GEMINI_API_KEY not set in Backend/.env');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const maxAttempts = options.retries ?? 3;
  let lastError: Error | null = null;

  const generationConfig: Record<string, unknown> = {
    temperature: options.temperature ?? 0.2,
    maxOutputTokens: options.maxOutputTokens ?? 2048,
    thinkingConfig: { thinkingBudget: 0 },
  };

  if (options.jsonMode) {
    generationConfig.responseMimeType = 'application/json';
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000,
          httpsAgent,
        }
      );

      const candidate = response.data?.candidates?.[0];
      const finishReason = candidate?.finishReason;

      if (finishReason === 'SAFETY') {
        throw new Error('Gemini blocked the response due to safety filters.');
      }

      const text = extractTextFromCandidate(candidate);

      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      if (finishReason === 'MAX_TOKENS') {
        console.warn('[Gemini] Response truncated (MAX_TOKENS). Retrying with higher token limit...');
        generationConfig.maxOutputTokens = Math.min(
          Number(generationConfig.maxOutputTokens) * 2,
          8192
        );
        if (attempt < maxAttempts) {
          await sleep(500);
          continue;
        }
      }

      return { text: text.trim(), finishReason };
    } catch (error) {
      lastError = toGeminiError(error);
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      // Retry on rate limit (429) or temporary server overload (503/500)
      if ((status === 429 || status === 503 || status === 500) && attempt < maxAttempts) {
        const waitMs = status === 503 ? attempt * 3000 : attempt * 2000;
        console.warn(`[Gemini] ${status} on attempt ${attempt}/${maxAttempts}. Retrying in ${waitMs}ms...`);
        await sleep(waitMs);
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error('Gemini request failed');
}

export async function generateJsonWithGemini<T>(
  prompt: string,
  options: { temperature?: number; maxOutputTokens?: number } = {}
): Promise<T> {
  const { text } = await generateWithGemini(prompt, {
    ...options,
    jsonMode: true,
    maxOutputTokens: options.maxOutputTokens ?? 4096,
    retries: 5,
  });

  const jsonStr = extractJsonFromText(text);

  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    console.error('[Gemini] Failed to parse JSON. Raw response:', text.slice(0, 500));
    throw new Error('Gemini returned invalid JSON. Try again.');
  }
}
