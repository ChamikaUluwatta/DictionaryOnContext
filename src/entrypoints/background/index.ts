import type { TranslateMessage, DeltaMessage } from "./types";
import { streamProvider } from "./streaming";

export default defineBackground(() => {
  function postMessage(port: Browser.runtime.Port, msg: DeltaMessage) {
    port.postMessage(msg);
  }

  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "wxtCustomButton",
      title: "Translate with context",
      contexts: ["all"],
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "wxtCustomButton" && tab?.id) {
      browser.tabs.sendMessage(tab.id, {
        action: "startStream",
        text: info.selectionText,
      });
    }
  });

  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== "translate") return;

    let abortController: AbortController | null = null;

    port.onMessage.addListener(async (msg: TranslateMessage) => {
      if (msg.abort) {
        abortController?.abort();
        return;
      }

      abortController?.abort();
      const controller = new AbortController();
      abortController = controller;

      const { text, provider, apiKey, model } = msg;

      try {
        for await (const delta of streamProvider(provider, apiKey, model, text, controller.signal)) {
          if (typeof delta === "string") {
            postMessage(port, { type: "delta", text: delta });
          }
        }
        if (!controller.signal.aborted) {
          postMessage(port, { type: "done" });
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          postMessage(port, {
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
