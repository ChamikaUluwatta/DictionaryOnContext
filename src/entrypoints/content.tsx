import { createRoot, Root } from "react-dom/client";
import SelectTextView from "@/components/selectTextView/SelectTestView";
import { AbsolutePopUp } from "@/components/AbsolutePopUp/AbsolutePopUp";
export default defineContentScript({
  matches: ["<all_urls>"],
  async main(ctx) {
    let uiInstance: any = null;
    let reactRoot: Root | null = null;
    let currentText = "";

    const handleClose = () => {
      if (reactRoot) {
        reactRoot.unmount();
        reactRoot = null;
      }
      if (uiInstance) {
        uiInstance.remove();
        uiInstance = null;
      }
      currentText = "";
    };

    browser.runtime.onMessage.addListener(async (message) => {
      if (message.action === "startStream") {
        currentText = message.text;

        if (!uiInstance) {
          uiInstance = await createShadowRootUi(ctx, {
            name: "wxt-react-output-overlay",
            position: "modal",
            anchor: "body",
            onMount: (container) => {
              container.style.position = "fixed";
              container.style.inset = "0";
              container.style.display = "flex";
              container.style.alignItems = "center";
              container.style.justifyContent = "center";
              container.style.zIndex = "999999";
              // container.style.background = "rgba(0,0,0,0.15)";

              reactRoot = createRoot(container);
              reactRoot.render(<AbsolutePopUp text={currentText} />);
            },
          });
          uiInstance.mount();
        }
      }
    });
  },
});
