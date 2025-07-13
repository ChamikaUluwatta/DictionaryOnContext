browser.contextMenus.create({
  id: "search-dictionary",
  title: "Search in Dictionary",
  contexts: ["selection","all"] , 
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "search-dictionary" && info.selectionText) {
    browser.storage.local.set({ selectedText: info.selectionText }).then(() => {
      browser.browserAction.openPopup();
    });
  }
});