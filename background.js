// Context menu for text selection
browser.contextMenus.create({
  id: "search-dictionary",
  title: "Search in Dictionary",
  contexts: ["selection","all"] , 
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "search-dictionary" && info.selectionText) {
    browser.tabs.sendMessage(tab.id, {
      action: "showPopup",
      text: info.selectionText
    });
  }
});

browser.tabs.query({}).then((tabs) => {
  for (let tab of tabs) {
    browser.pageAction.show(tab.id);
  }
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  browser.pageAction.show(tabId);
});

