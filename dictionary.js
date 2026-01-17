class CustomDictionaryPopup {
  constructor() {
    this.popup = null;
    this.popupContent = null;
    this.contentPara = null;
    this.mode = 'single';
    this.selectedWords = [];
    this.selectedIndices = [];
    this.wordSpans = [];
    this.modeSelector = null;
    this.translateBtn = null;
    this.backButton = null;
    this.heading = null;
  }

  async show(text) {
    // Remove existing popup if present
    this.remove();

    // Reset selection state
    this.selectedWords = [];
    this.selectedIndices = [];
    this.wordSpans = [];
    this.mode = 'single';

    // Get theme preference
    const storage = await browser.storage.local.get('darkMode');
    const isDarkMode = storage.darkMode !== undefined ? storage.darkMode : false;

    // Create popup container
    this.popup = document.createElement("div");
    this.popup.id = "custom-dictionary-popup";
    
    // Create popup content
    this.popupContent = document.createElement("div");
    this.popupContent.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      background: ${isDarkMode ? '#1e1e1e' : '#ffffff'};
      color: ${isDarkMode ? '#ffffff' : '#000000'};
      border: 1px solid ${isDarkMode ? '#444' : '#ccc'};
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      padding: 20px;
      border-radius: 8px;
      max-width: 400px;
      min-width: 300px;
      font-family: Arial, sans-serif;
    `;

    // Create heading
    this.heading = document.createElement("h3");
    this.heading.style.cssText = `
      margin-top: 0;
      margin-bottom: 15px;
      color: ${isDarkMode ? '#ffffff' : '#000000'};
      font-size: 16px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    
    // Create back button (initially hidden)
    this.backButton = document.createElement("span");
    this.backButton.textContent = "←";
    this.backButton.style.cssText = `
      cursor: pointer;
      font-size: 20px;
      opacity: 0.8;
      transition: opacity 0.2s;
      display: none;
    `;
    this.backButton.addEventListener('mouseover', () => {
      this.backButton.style.opacity = '1';
    });
    this.backButton.addEventListener('mouseout', () => {
      this.backButton.style.opacity = '0.8';
    });
    this.backButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.restoreSelectionView(isDarkMode);
    });
    
    this.heading.appendChild(this.backButton);
    const titleText = document.createElement("span");
    titleText.textContent = "Dictionary Lookup";
    this.heading.appendChild(titleText);

    // Create mode selector
    this.modeSelector = document.createElement("div");
    this.modeSelector.style.cssText = `
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
      align-items: center;
    `;

    const singleLabel = document.createElement("label");
    singleLabel.style.cssText = `
      display: flex;
      align-items: center;
      cursor: pointer;
      color: ${isDarkMode ? '#ffffff' : '#000000'};
    `;
    const singleRadio = document.createElement("input");
    singleRadio.type = "radio";
    singleRadio.name = "mode";
    singleRadio.value = "single";
    singleRadio.checked = true;
    singleRadio.style.cssText = "margin-right: 5px; cursor: pointer;";
    singleLabel.appendChild(singleRadio);
    singleLabel.appendChild(document.createTextNode("Single"));

    const multipleLabel = document.createElement("label");
    multipleLabel.style.cssText = `
      display: flex;
      align-items: center;
      cursor: pointer;
      color: ${isDarkMode ? '#ffffff' : '#000000'};
    `;
    const multipleRadio = document.createElement("input");
    multipleRadio.type = "radio";
    multipleRadio.name = "mode";
    multipleRadio.value = "multiple";
    multipleRadio.style.cssText = "margin-right: 5px; cursor: pointer;";
    multipleLabel.appendChild(multipleRadio);
    multipleLabel.appendChild(document.createTextNode("Multiple"));

    this.modeSelector.appendChild(singleLabel);
    this.modeSelector.appendChild(multipleLabel);

    // Create content paragraph
    this.contentPara = document.createElement("p");
    this.contentPara.style.cssText = `
      margin: 0 0 15px 0;
      line-height: 1.5;
    `;

    // Create translate button (initially hidden)
    this.translateBtn = document.createElement("button");
    this.translateBtn.textContent = "Translate";
    this.translateBtn.style.cssText = `
      display: none;
      width: 100%;
      padding: 10px;
      background-color: #0078d4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      margin-top: 10px;
    `;
    this.translateBtn.addEventListener('mouseenter', () => {
      this.translateBtn.style.backgroundColor = '#005a9e';
    });
    this.translateBtn.addEventListener('mouseleave', () => {
      this.translateBtn.style.backgroundColor = '#0078d4';
    });

    // Split text into clickable words
    const words = text.split(" ");
    words.forEach((word, index) => {
      const wordSpan = document.createElement("span");
      wordSpan.textContent = word + " ";
      wordSpan.dataset.index = index;
      wordSpan.style.cssText = `
        cursor: pointer;
        color: ${isDarkMode ? '#4da6ff' : '#0078d4'};
        transition: all 0.2s;
      `;
      wordSpan.addEventListener('mouseenter', () => {
        if (this.mode === 'single' || this.canSelectWord(index)) {
          wordSpan.style.opacity = '0.7';
          wordSpan.style.textDecoration = 'underline';
        }
      });
      wordSpan.addEventListener('mouseleave', () => {
        wordSpan.style.opacity = '1';
        wordSpan.style.textDecoration = 'none';
      });
      this.contentPara.appendChild(wordSpan);
      this.wordSpans.push(wordSpan);
    });

    // Mode change handler
    const handleModeChange = () => {
      this.mode = singleRadio.checked ? 'single' : 'multiple';
      this.clearSelection(isDarkMode);
      
      if (this.mode === 'multiple') {
        this.translateBtn.style.display = 'block';
      } else {
        this.translateBtn.style.display = 'none';
      }
      
      this.updateWordStyles(isDarkMode);
    };

    singleRadio.addEventListener('change', handleModeChange);
    multipleRadio.addEventListener('change', handleModeChange);

    // Translate button handler
    this.translateBtn.addEventListener('click', async () => {
      if (this.selectedWords.length > 0) {
        const selectedText = this.selectedWords.join(" ");
        // Hide mode selector and translate button
        this.modeSelector.style.display = 'none';
        this.translateBtn.style.display = 'none';
        await this.fetchDefinition(selectedText, text, isDarkMode);
      }
    });

    // Word click handler
    const wordClickHandler = async (e) => {
      if (e.target.tagName === "SPAN" && e.target.parentElement === this.contentPara) {
        e.stopPropagation(); // Prevent event from bubbling to document
        const clickedIndex = parseInt(e.target.dataset.index);
        
        if (this.mode === 'single') {
          // Hide mode selector when translation starts
          this.modeSelector.style.display = 'none';
          await this.fetchDefinition(e.target.textContent.trim(), text, isDarkMode);
        } else {
          // Multiple mode
          this.toggleWordSelection(clickedIndex, isDarkMode);
        }
      }
    };

    this.popup.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent clicks inside popup from closing it
      wordClickHandler(e);
    });

    // Append elements
    this.popupContent.appendChild(this.heading);
    this.popupContent.appendChild(this.modeSelector);
    this.popupContent.appendChild(this.contentPara);
    this.popupContent.appendChild(this.translateBtn);
    this.popup.appendChild(this.popupContent);
    document.body.appendChild(this.popup);
    
    // Close popup when clicking outside (with longer delay to ensure popup is fully rendered)
    setTimeout(() => {
      const closeHandler = (e) => {
        if (this.popup && !this.popup.contains(e.target)) {
          this.remove();
          document.removeEventListener("click", closeHandler);
        }
      };
      document.addEventListener("click", closeHandler);
    }, 100);
  }

  canSelectWord(index) {
    if (this.selectedIndices.length === 0) {
      return true; // First word can always be selected
    }
    
    const maxIndex = Math.max(...this.selectedIndices);
    
    // Can only select the next consecutive word
    return index === maxIndex + 1;
  }

  toggleWordSelection(index, isDarkMode) {
    const indexPos = this.selectedIndices.indexOf(index);
    
    if (indexPos !== -1) {
      // Deselect: remove this word and all words after it
      this.selectedIndices = this.selectedIndices.slice(0, indexPos);
      this.selectedWords = this.selectedWords.slice(0, indexPos);
    } else if (this.canSelectWord(index)) {
      // Select: add this word
      this.selectedIndices.push(index);
      this.selectedWords.push(this.wordSpans[index].textContent.trim());
    }
    
    this.updateWordStyles(isDarkMode);
  }

  updateWordStyles(isDarkMode) {
    this.wordSpans.forEach((span, index) => {
      const isSelected = this.selectedIndices.includes(index);
      const canSelect = this.canSelectWord(index);
      
      if (this.mode === 'single') {
        // Single mode: all words are clickable
        span.style.cssText = `
          cursor: pointer;
          color: ${isDarkMode ? '#4da6ff' : '#0078d4'};
          transition: all 0.2s;
        `;
      } else {
        // Multiple mode
        if (isSelected) {
          span.style.cssText = `
            cursor: pointer;
            color: ${isDarkMode ? '#ffffff' : '#000000'};
            background-color: ${isDarkMode ? '#0078d4' : '#4da6ff'};
            padding: 2px 4px;
            border-radius: 3px;
            text-decoration: none;
            transition: all 0.2s;
          `;
        } else if (canSelect) {
          span.style.cssText = `
            cursor: pointer;
            color: ${isDarkMode ? '#4da6ff' : '#0078d4'};
            transition: all 0.2s;
          `;
        } else {
          span.style.cssText = `
            cursor: not-allowed;
            color: ${isDarkMode ? '#666' : '#999'};
            text-decoration: none;
            opacity: 0.5;
            transition: all 0.2s;
          `;
        }
      }
    });
  }

  clearSelection(isDarkMode) {
    this.selectedWords = [];
    this.selectedIndices = [];
    this.updateWordStyles(isDarkMode);
  }

  restoreSelectionView(isDarkMode) {
    // Hide back button and show mode selector
    this.backButton.style.display = 'none';
    this.modeSelector.style.display = 'flex';
    
    // Clear content
    while (this.contentPara.firstChild) {
      this.contentPara.removeChild(this.contentPara.firstChild);
    }
    
    // Re-append existing word spans
    this.wordSpans.forEach((span) => {
      this.contentPara.appendChild(span);
    });
    
    // Update word styles based on current mode and selections
    this.updateWordStyles(isDarkMode);
    
    // Show translate button if in multiple mode
    if (this.mode === 'multiple') {
      this.translateBtn.style.display = 'block';
    }
  }

  remove() {
    const existingPopup = document.getElementById("custom-dictionary-popup");
    if (existingPopup && existingPopup.parentNode) {
      existingPopup.parentNode.removeChild(existingPopup);
      this.popup = null;
      this.popupContent = null;
      this.contentPara = null;
    }
  }

  async fetchDefinition(word, sentence, isDarkMode) {
    try {
      // Show back button and hide mode selector
      this.backButton.style.display = 'inline';
      this.modeSelector.style.display = 'none';
      this.translateBtn.style.display = 'none';
      
      // Show creative loading animation immediately
      this.showLoadingAnimation(isDarkMode);
      
      // Get the saved model from storage
      const storage = await browser.storage.local.get('selectedModel');
      const modelName = storage.selectedModel || "qwen2.5:3b-instruct"; // Default fallback
      
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName, 
          prompt: `Define "${word}" in: "${sentence}". Be concise.`,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      // Clear content (including loading animation)
      while (this.contentPara.firstChild) {
        this.contentPara.removeChild(this.contentPara.firstChild);
      }

      // Add word label
      const wordLabel = document.createElement("strong");
      wordLabel.style.cssText = `
        color: ${isDarkMode ? '#ffffff' : '#000000'};
        font-weight: bold;
      `;
      wordLabel.textContent = `${word}: `;
      this.contentPara.appendChild(wordLabel);

      // Add loading indicator
      const loadingSpan = document.createElement("span");
      loadingSpan.style.cssText = `
        color: ${isDarkMode ? '#888' : '#666'};
      `;
      loadingSpan.textContent = "Loading...";
      this.contentPara.appendChild(loadingSpan);

      // Stream response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        try {
          const parsed = JSON.parse(chunk);
          fullResponse += parsed.response || "";
          
          loadingSpan.style.color = isDarkMode ? '#ffffff' : '#000000';
          loadingSpan.textContent = fullResponse;
        } catch (e) {
          console.error("JSON parse error:", e);
        }
      }

      return fullResponse;
    } catch (error) {
      console.error("Streaming error:", error);
      
      // Clear and show error
      while (this.contentPara.firstChild) {
        this.contentPara.removeChild(this.contentPara.firstChild);
      }
      
      const errorSpan = document.createElement("span");
      errorSpan.style.cssText = `
        color: #ff4444;
        font-weight: bold;
      `;
      errorSpan.textContent = `Error: ${error.message}`;
      this.contentPara.appendChild(errorSpan);
      return null;
    }
  }

  showLoadingAnimation(isDarkMode) {
    // Clear content
    while (this.contentPara.firstChild) {
      this.contentPara.removeChild(this.contentPara.firstChild);
    }

    // Create loading container
    const loadingContainer = document.createElement("div");
    loadingContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      gap: 15px;
    `;

    // Create animated dots container
    const dotsContainer = document.createElement("div");
    dotsContainer.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
    `;

    // Create 3 animated dots
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.style.cssText = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: ${isDarkMode ? '#4da6ff' : '#0078d4'};
        animation: bounce 1.4s infinite ease-in-out both;
        animation-delay: ${i * 0.16}s;
      `;
      dotsContainer.appendChild(dot);
    }

    // Create translating text
    const loadingText = document.createElement("div");
    loadingText.style.cssText = `
      color: ${isDarkMode ? '#4da6ff' : '#0078d4'};
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 1px;
      animation: pulse 1.5s infinite;
    `;
    loadingText.textContent = "Translating";

    // Add CSS animations
    if (!document.getElementById('popup-animations')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'popup-animations';
      styleTag.textContent = `
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.8) translateY(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2) translateY(-10px);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `;
      document.head.appendChild(styleTag);
    }

    loadingContainer.appendChild(dotsContainer);
    loadingContainer.appendChild(loadingText);
    this.contentPara.appendChild(loadingContainer);
  }
}

// Create global instance
const dictionaryPopup = new CustomDictionaryPopup();

browser.runtime.onMessage.addListener((request) => {
  if (request.action === "showPopup") {
    dictionaryPopup.show(request.text);
  }
});