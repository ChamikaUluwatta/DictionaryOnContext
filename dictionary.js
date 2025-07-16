browser.runtime.onMessage.addListener((request) => {
  if (request.action === "showPopup") {
    showCustomPopup(request.text);
  }
});

function showCustomPopup(text) {
  const existingPopup = document.getElementById("custom-dictionary-popup");
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement("div");
  popup.id = "custom-dictionary-popup";
  popup.innerHTML = `
    <div style="
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
    ">
      <h3 style="margin-top: 0;">Dictionary Lookup</h3>
      <p></p>
    </div>
  `;
  const words = text.split(" ");
  var sperateWords = "";
  words.forEach((word) => {
    sperateWords += `<span style="cursor: pointer; color: blue; text-decoration: underline;">${word}</span> `;
  });
  popup.querySelector("p").innerHTML = sperateWords;
  document.body.appendChild(popup);

  const closePopup = (e) => {
    if (!popup.contains(e.target)) {
      popup.remove();
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
          prompt: `Define "${word}" in this context: "${sentence}". Be concise.`,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      const popup = document.getElementById("custom-dictionary-popup");
      popup.querySelector("p").innerHTML = `
        <strong>${word}:</strong> <span style="color: gray;">Loading...</span>
      `;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullResponse += JSON.parse(chunk).response || "";
        popup.querySelector("p").innerHTML = `
          <strong>${word}:</strong> ${fullResponse}
        `;
      }

      return fullResponse;
    } catch (error) {
      console.error("Streaming error:", error);
      return `Error: ${error.message}`;
    }
  }
  const onclickHandler = async (e) => {
    if (e.target.tagName === "SPAN") {
      const word = e.target.textContent;
      await fetchDefinition(word, text);
    }
  };
  popup.addEventListener("click", onclickHandler);

  setTimeout(() => {
    document.addEventListener("click", closePopup);
  }, 10);
}
