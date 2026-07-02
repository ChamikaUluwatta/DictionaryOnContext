import { SYSTEM_PROMPT } from "@/utils/constants";

export function fetchGemini(
  apiKey: string,
  model: string,
  text: string,
  signal: AbortSignal,
) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text }] }],
      }),
      signal,
    },
  );
}

export function fetchOpenRouter(
  apiKey: string,
  model: string,
  text: string,
  signal: AbortSignal,
) {
  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      stream: true,
    }),
    signal,
  });
}

export function extractGemini(chunk: unknown): string | undefined {
  const c = chunk as any;
  return c?.candidates?.[0]?.content?.parts?.[0]?.text;
}

export function extractOpenRouter(chunk: unknown): string | undefined {
  const c = chunk as any;
  return c?.choices?.[0]?.delta?.content;
}
