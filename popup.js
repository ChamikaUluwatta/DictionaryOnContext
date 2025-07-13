document.addEventListener("DOMContentLoaded", () => {
  browser.storage.local.get("selectedText").then((result) => {
    const selectedText = result.selectedText || "No text selected";
    document.getElementById("selected-text").textContent = selectedText;
  });
});