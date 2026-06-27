export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "wxtCustomButton",
      title: "Translate with context",
      contexts: ["all"],
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "wxtCustomButton" && tab && tab.id) {
      const activeTabId: number = tab.id;
      console.log(
        "Button clicked! and here is the selection text:" + info.selectionText,
      );
      browser.tabs.sendMessage(activeTabId, {
        action: "startStream",
        text: info.selectionText,
      });
    }
  });
  console.log("Hello background!", { id: browser.runtime.id });
});
