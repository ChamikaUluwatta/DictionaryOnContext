import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";

type Status = "idle" | "loading" | "streaming" | "done" | "error";

export function useTranslationPort() {
  const [status, setStatus] = useState<Status>("idle");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const portRef = useRef<Browser.runtime.Port | null>(null);

  const translate = useCallback(async (text: string) => {
    if (!text.trim()) return;

    abort();

    setStatus("loading");
    setOutputText("");
    setError(null);

    const port = browser.runtime.connect({ name: "gemini-translate" });
    portRef.current = port;

    port.onMessage.addListener(
      (msg: { type: string; text?: string; message?: string }) => {
        if (msg.type === "delta") {
          flushSync(() => {
            setStatus("streaming");
            setOutputText((prev) => prev + (msg.text ?? ""));
          });
        } else if (msg.type === "done") {
          flushSync(() => {
            setStatus("done");
          });
        } else if (msg.type === "error") {
          flushSync(() => {
            setStatus("error");
            setError(msg.message ?? "Unknown error");
          });
        }
      },
    );

    port.onDisconnect.addListener(() => {
      portRef.current = null;
      setStatus((prev) => (prev === "streaming" ? "done" : prev));
    });

    port.postMessage({ text });
  }, []);

  const abort = useCallback(() => {
    if (portRef.current) {
      try {
        portRef.current.postMessage({ abort: true });
        portRef.current.disconnect();
      } catch {}
      portRef.current = null;
    }
    setStatus("idle");
    setOutputText("");
    setError(null);
  }, []);

  return { status, outputText, error, translate, abort };
}
