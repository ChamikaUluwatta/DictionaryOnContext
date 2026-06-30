import { GoogleGenAI } from "@google/genai";

export default defineBackground(() => {
  const ai = new GoogleGenAI({
    apiKey: import.meta.env.WXT_GEMINI_API_KEY,
  });

  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "wxtCustomButton",
      title: "Translate with context",
      contexts: ["all"],
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "wxtCustomButton" && tab && tab.id) {
      browser.tabs.sendMessage(tab.id, {
        action: "startStream",
        text: info.selectionText,
      });
    }
  });

  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== "gemini-translate") return;

    let abortController: AbortController | null = null;

    port.onMessage.addListener(async (msg: { text: string; abort?: boolean }) => {
      if (msg.abort) {
        abortController?.abort();
        return;
      }

      abortController?.abort();
      const controller = new AbortController();
      abortController = controller;

      try {
        const stream = await ai.interactions.create({
          model: "gemini-3-flash-preview",
          system_instruction: `You are a strict, context-aware dictionary assistant. 
The user will provide a sentence with a single word wrapped in <selected>...</selected> tags.
Your job is to look at the entire context of the sentence and provide a concise, direct definition for ONLY the selected word as it is used in that specific sentence. Do not define alternative meanings. Do not repeat the prompt.`,
          input: msg.text,
          stream: true,
        });

        for await (const event of stream) {
          if (controller.signal.aborted) break;

          if (event.event_type === "step.delta") {
            const delta = event.delta;
            if (delta.type === "text") {
              console.log("Post msg: "+ delta)
              port.postMessage({ type: "delta", text: delta.text });
            }
          }
          if (event.event_type === "step.stop") {
            port.postMessage({ type: "done" });
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          port.postMessage({
            type: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }
    });

    port.onDisconnect.addListener(() => {
      abortController?.abort();
      abortController = null;
    });
  });
});
