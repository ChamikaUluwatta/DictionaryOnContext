import { GoogleGenAI } from "@google/genai";
import { useCallback, useRef, useState } from "react";

type Status = "idle" | "loading" | "streaming" | "done" | "error";

export function useTranslation() {
  const [status, setStatus] = useState<Status>("idle");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const translate = useCallback(async (text: string) => {
    if (!text.trim()) return;

    abortRef.current?.abort();

    setStatus("loading");
    setOutputText("");
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const client = new GoogleGenAI({
        apiKey: import.meta.env.WXT_GEMINI_API_KEY,
      });

      const stream = await client.interactions.create({
        model: "gemini-3-flash-preview",
        system_instruction: `You are a strict, context-aware dictionary assistant. 
The user will provide a sentence with a single word wrapped in <selected>...</selected> tags.
Your job is to look at the entire context of the sentence and provide a concise, direct definition for ONLY the selected word as it is used in that specific sentence. Do not define alternative meanings. Do not repeat the prompt.`,
        input: text,
        stream: true,
      });

      let didStream = false;
      for await (const event of stream) {
        if (controller.signal.aborted) break;

        if (event.event_type === "step.delta") {
          const delta = event.delta;
          if (delta.type === "text") {
            if (!didStream) {
              setStatus("streaming");
              didStream = true;
            }
            setOutputText((prev) => prev + delta.text);
          }
        }
        if (event.event_type === "step.stop") {
          setStatus("done");
        }
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setStatus("error");
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
    setOutputText("");
    setError(null);
  }, []);

  return { status, outputText, error, translate, abort };
}
