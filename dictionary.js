browser.runtime.onMessage.addListener((request) => {
  if (request.action === "showPopup") {
    showCustomPopup(request.text);
  }
});

function showCustomPopup(text) {
  const existingPopup = document.getElementById("custom-dictionary-popup");
  if (existingPopup && existingPopup.parentNode) {
    existingPopup.parentNode.removeChild(existingPopup);
  }

  const popup = document.createElement("div");
  popup.id = "custom-dictionary-popup";
  
  const popupContent = document.createElement("div");
  popupContent.style.cssText = `
    position: absolute;
    top: ${window.scrollY + 100}px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    background: black;
    color: white;
    border: 1px solid #ccc;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    padding: 16px;
    border-radius: 8px;
    max-width: 300px;
  `;

  const heading = document.createElement("h3");
  heading.style.marginTop = "0";
  heading.textContent = "Dictionary Lookup";

  const contentPara = document.createElement("p");

  const words = text.split(" ");
  words.forEach((word) => {
    const wordSpan = document.createElement("span");
    wordSpan.textContent = word + " ";
    wordSpan.style.cssText = "cursor: pointer; color: blue; text-decoration: underline;";
    contentPara.appendChild(wordSpan);
  });

  popupContent.appendChild(heading);
  popupContent.appendChild(contentPara);
  popup.appendChild(popupContent);
  document.body.appendChild(popup);

  const closePopup = (e) => {
    if (!popup.contains(e.target)) {
      popup.parentNode.removeChild(popup);
      document.removeEventListener("click", closePopup);
    }
  };

  async function fetchDefinition(word, sentence) {
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma3:1b", 
          prompt: `Define "${word}" in: "${sentence}". Be concise.`,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (contentPara.firstChild) {
        contentPara.removeChild(contentPara.firstChild);
      }

      const wordLabel = document.createElement("strong");
      wordLabel.textContent = `${word}: `;
      contentPara.appendChild(wordLabel);

      const loadingSpan = document.createElement("span");
      loadingSpan.style.color = "gray";
      loadingSpan.textContent = "Loading...";
      contentPara.appendChild(loadingSpan);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        try {
          const parsed = JSON.parse(chunk);
          fullResponse += parsed.response || "";
          
          loadingSpan.textContent = fullResponse;
        } catch (e) {
          console.error("JSON parse error:", e);
        }
      }

      return fullResponse;
    } catch (error) {
      console.error("Streaming error:", error);
      const errorSpan = document.createElement("span");
      errorSpan.style.color = "red";
      errorSpan.textContent = `Error: ${error.message}`;
      contentPara.appendChild(errorSpan);
      return null;
    }
  }

  const onclickHandler = async (e) => {
    if (e.target.tagName === "SPAN") {
      await fetchDefinition(e.target.textContent.trim(), text);
    }
  };

  popup.addEventListener("click", onclickHandler);
  setTimeout(() => document.addEventListener("click", closePopup), 10);
}