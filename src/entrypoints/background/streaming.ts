import { fetchGemini, fetchOpenRouter, extractGemini, extractOpenRouter } from "./providers";

async function* parseSSE(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  signal: AbortSignal,
): AsyncGenerator<unknown> {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    if (signal.aborted) return;
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return;
      try {
        yield JSON.parse(data);
      } catch {
        // skip unparseable chunks
      }
    }
  }
}

export async function* streamProvider(
  provider: string,
  apiKey: string,
  model: string,
  text: string,
  signal: AbortSignal,
) {
  const fetcher = provider === "openrouter" ? fetchOpenRouter : fetchGemini;
  const extract = provider === "openrouter" ? extractOpenRouter : extractGemini;

  const response = await fetcher(apiKey, model, text, signal);

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`[${response.status}] ${errBody}`);
  }

  const reader = response.body!.getReader();

  for await (const chunk of parseSSE(reader, signal)) {
    const delta = extract(chunk);
    if (delta) yield delta;
  }
}
