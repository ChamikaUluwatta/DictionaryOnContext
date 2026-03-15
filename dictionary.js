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
    this.closeButton = null;
    this.heading = null;
    this.theme = null;
  }

  getTheme(isDarkMode) {
    return {
      surface: isDarkMode ? '#1f1f1f' : '#ffffff',
      surfaceContainer: isDarkMode ? '#2b2b2b' : '#f7f7f9',
      onSurface: isDarkMode ? '#f5f5f5' : '#1f1f1f',
      onSurfaceMuted: isDarkMode ? '#b8b8b8' : '#5f6368',
      outline: isDarkMode ? '#474747' : '#d7d7db',
      primary: '#6750a4',
      primaryHover: '#5b4692',
      onPrimary: '#ffffff',
      primaryContainer: isDarkMode ? '#4e3a80' : '#e9ddff',
      onPrimaryContainer: isDarkMode ? '#f2ecff' : '#2f1c52',
      disabled: isDarkMode ? '#6b6b6b' : '#b8bcc2',
      disabledText: isDarkMode ? '#9a9a9a' : '#7a7f86',
      error: isDarkMode ? '#ffb4ab' : '#ba1a1a',
      scrim: isDarkMode ? 'rgba(0, 0, 0, 0.58)' : 'rgba(15, 23, 42, 0.2)',
      link: isDarkMode ? '#cbb5ff' : '#6750a4',
      linkDisabled: isDarkMode ? '#7c738f' : '#b2a7cb',
      selectedWordBg: isDarkMode ? '#4e3a80' : '#e9ddff',
      selectedWordText: isDarkMode ? '#f2ecff' : '#2f1c52',
    };
  }

  applyModeLabelStyles(singleLabel, multipleLabel) {
    [singleLabel, multipleLabel].forEach((label) => {
      const isActive = label.dataset.active === 'true';
      label.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid ${isActive ? this.theme.primary : this.theme.outline};
        color: ${isActive ? this.theme.onPrimaryContainer : this.theme.onSurfaceMuted};
        background: ${isActive ? this.theme.primaryContainer : this.theme.surface};
        border-radius: 999px;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.2s ease;
        user-select: none;
      `;
    });
  }

  updateTranslateButtonState() {
    if (!this.translateBtn || !this.theme) {
      return;
    }

    const canTranslate = this.selectedWords.length > 0;
    this.translateBtn.disabled = !canTranslate;
    this.translateBtn.style.backgroundColor = canTranslate ? this.theme.primary : this.theme.disabled;
    this.translateBtn.style.color = canTranslate ? this.theme.onPrimary : this.theme.disabledText;
    this.translateBtn.style.cursor = canTranslate ? 'pointer' : 'not-allowed';
    this.translateBtn.style.boxShadow = canTranslate
      ? '0 2px 4px rgba(0, 0, 0, 0.2)'
      : 'none';
  }

  formatModelResponse(text) {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    return escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  async show(text) {
    this.remove();

    this.selectedWords = [];
    this.selectedIndices = [];
    this.wordSpans = [];
    this.mode = 'single';

    const storage = await browser.storage.local.get('darkMode');
    const isDarkMode = storage.darkMode !== undefined ? storage.darkMode : false;
    this.theme = this.getTheme(isDarkMode);

    this.popup = document.createElement('div');
    this.popup.id = 'custom-dictionary-popup';
    this.popup.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: ${this.theme.scrim};
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    `;

    this.popupContent = document.createElement('div');
    this.popupContent.style.cssText = `
      position: relative;
      background: ${this.theme.surface};
      color: ${this.theme.onSurface};
      border: 1px solid ${this.theme.outline};
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28), 0 2px 8px rgba(0, 0, 0, 0.2);
      padding: 20px;
      border-radius: 16px;
      width: min(460px, calc(100vw - 32px));
      min-width: 300px;
      max-height: min(80vh, 640px);
      overflow: auto;
      font-family: "Roboto", "Noto Sans", "Segoe UI", sans-serif;
      animation: material-popup-in 0.2s ease-out;
    `;

    this.heading = document.createElement('h3');
    this.heading.style.cssText = `
      margin-top: 0;
      margin-bottom: 16px;
      color: ${this.theme.onSurface};
      font-size: 20px;
      line-height: 28px;
      font-weight: 600;
      letter-spacing: 0.15px;
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    this.backButton = document.createElement('span');
    this.backButton.textContent = '<';
    this.backButton.style.cssText = `
      cursor: pointer;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: none;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: ${this.theme.onSurfaceMuted};
      border: 1px solid transparent;
      font-size: 20px;
      opacity: 0.95;
      transition: all 0.2s ease;
    `;
    this.backButton.addEventListener('mouseover', () => {
      this.backButton.style.opacity = '1';
      this.backButton.style.background = this.theme.surfaceContainer;
      this.backButton.style.borderColor = this.theme.outline;
    });
    this.backButton.addEventListener('mouseout', () => {
      this.backButton.style.opacity = '0.95';
      this.backButton.style.background = 'transparent';
      this.backButton.style.borderColor = 'transparent';
    });
    this.backButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.restoreSelectionView();
    });

    this.heading.appendChild(this.backButton);
    const titleText = document.createElement('span');
    titleText.textContent = 'Dictionary Lookup';
    titleText.style.cssText = `
      flex: 1;
    `;
    this.heading.appendChild(titleText);

    this.closeButton = document.createElement('span');
    this.closeButton.textContent = 'x';
    this.closeButton.style.cssText = `
      cursor: pointer;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: ${this.theme.onSurfaceMuted};
      border: 1px solid transparent;
      font-size: 20px;
      line-height: 1;
      transition: all 0.2s ease;
      user-select: none;
    `;
    this.closeButton.addEventListener('mouseover', () => {
      this.closeButton.style.color = this.theme.onSurface;
      this.closeButton.style.background = this.theme.surfaceContainer;
      this.closeButton.style.borderColor = this.theme.outline;
    });
    this.closeButton.addEventListener('mouseout', () => {
      this.closeButton.style.color = this.theme.onSurfaceMuted;
      this.closeButton.style.background = 'transparent';
      this.closeButton.style.borderColor = 'transparent';
    });
    this.closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.remove();
    });
    this.heading.appendChild(this.closeButton);

    this.modeSelector = document.createElement('div');
    this.modeSelector.style.cssText = `
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
      align-items: center;
      flex-wrap: wrap;
    `;

    const singleLabel = document.createElement('label');
    singleLabel.dataset.active = 'true';
    const singleRadio = document.createElement('input');
    singleRadio.type = 'radio';
    singleRadio.name = 'mode';
    singleRadio.value = 'single';
    singleRadio.checked = true;
    singleRadio.style.cssText = 'display: none;';
    singleLabel.appendChild(singleRadio);
    singleLabel.appendChild(document.createTextNode('Single'));

    const multipleLabel = document.createElement('label');
    multipleLabel.dataset.active = 'false';
    const multipleRadio = document.createElement('input');
    multipleRadio.type = 'radio';
    multipleRadio.name = 'mode';
    multipleRadio.value = 'multiple';
    multipleRadio.style.cssText = 'display: none;';
    multipleLabel.appendChild(multipleRadio);
    multipleLabel.appendChild(document.createTextNode('Multiple'));

    this.applyModeLabelStyles(singleLabel, multipleLabel);
    this.modeSelector.appendChild(singleLabel);
    this.modeSelector.appendChild(multipleLabel);

    this.contentPara = document.createElement('p');
    this.contentPara.style.cssText = `
      margin: 0 0 15px 0;
      line-height: 1.6;
      border: 1px solid ${this.theme.outline};
      border-radius: 12px;
      padding: 14px;
      background: ${this.theme.surfaceContainer};
      min-height: 64px;
    `;

    this.translateBtn = document.createElement('button');
    this.translateBtn.textContent = 'Translate';
    this.translateBtn.style.cssText = `
      display: none;
      width: 100%;
      padding: 11px 14px;
      background-color: ${this.theme.primary};
      color: ${this.theme.onPrimary};
      border: none;
      border-radius: 999px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.1px;
      margin-top: 10px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    `;
    this.translateBtn.addEventListener('mouseenter', () => {
      if (!this.translateBtn.disabled) {
        this.translateBtn.style.backgroundColor = this.theme.primaryHover;
      }
    });
    this.translateBtn.addEventListener('mouseleave', () => {
      this.translateBtn.style.backgroundColor = this.translateBtn.disabled
        ? this.theme.disabled
        : this.theme.primary;
    });

    const words = text.split(' ');
    words.forEach((word, index) => {
      const wordSpan = document.createElement('span');
      wordSpan.textContent = word + ' ';
      wordSpan.dataset.index = index;
      wordSpan.style.cssText = `
        cursor: pointer;
        color: ${this.theme.link};
        transition: all 0.2s;
        border-radius: 4px;
      `;
      wordSpan.addEventListener('mouseenter', () => {
        if (this.mode === 'single' || this.canSelectWord(index)) {
          wordSpan.style.opacity = '0.75';
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

    const handleModeChange = () => {
      this.mode = singleRadio.checked ? 'single' : 'multiple';
      this.clearSelection();
      singleLabel.dataset.active = singleRadio.checked ? 'true' : 'false';
      multipleLabel.dataset.active = multipleRadio.checked ? 'true' : 'false';
      this.applyModeLabelStyles(singleLabel, multipleLabel);

      if (this.mode === 'multiple') {
        this.translateBtn.style.display = 'block';
        this.updateTranslateButtonState();
      } else {
        this.translateBtn.style.display = 'none';
      }

      this.updateWordStyles();
    };

    singleRadio.addEventListener('change', handleModeChange);
    multipleRadio.addEventListener('change', handleModeChange);

    this.translateBtn.addEventListener('click', async () => {
      if (this.selectedWords.length > 0) {
        const selectedText = this.selectedWords.join(' ');
        this.modeSelector.style.display = 'none';
        this.translateBtn.style.display = 'none';
        await this.fetchDefinition(selectedText, text);
      }
    });

    const wordClickHandler = async (e) => {
      if (e.target.tagName === 'SPAN' && e.target.parentElement === this.contentPara) {
        e.stopPropagation();
        const clickedIndex = parseInt(e.target.dataset.index, 10);

        if (this.mode === 'single') {
          this.modeSelector.style.display = 'none';
          await this.fetchDefinition(e.target.textContent.trim(), text);
        } else {
          this.toggleWordSelection(clickedIndex);
        }
      }
    };

    this.contentPara.addEventListener('click', wordClickHandler);

    this.popupContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    this.popup.addEventListener('click', (e) => {
      if (e.target === this.popup) {
        this.remove();
      }
    });

    this.popupContent.appendChild(this.heading);
    this.popupContent.appendChild(this.modeSelector);
    this.popupContent.appendChild(this.contentPara);
    this.popupContent.appendChild(this.translateBtn);
    this.popup.appendChild(this.popupContent);
    document.body.appendChild(this.popup);
  }

  canSelectWord(index) {
    if (this.selectedIndices.length === 0) {
      return true;
    }

    const maxIndex = Math.max(...this.selectedIndices);
    return index === maxIndex + 1;
  }

  toggleWordSelection(index) {
    const indexPos = this.selectedIndices.indexOf(index);

    if (indexPos !== -1) {
      this.selectedIndices = this.selectedIndices.slice(0, indexPos);
      this.selectedWords = this.selectedWords.slice(0, indexPos);
    } else if (this.canSelectWord(index)) {
      this.selectedIndices.push(index);
      this.selectedWords.push(this.wordSpans[index].textContent.trim());
    }

    this.updateWordStyles();
  }

  updateWordStyles() {
    this.wordSpans.forEach((span, index) => {
      const isSelected = this.selectedIndices.includes(index);
      const canSelect = this.canSelectWord(index);

      if (this.mode === 'single') {
        span.style.cssText = `
          cursor: pointer;
          color: ${this.theme.link};
          transition: all 0.2s;
          border-radius: 4px;
        `;
      } else if (isSelected) {
        span.style.cssText = `
          cursor: pointer;
          color: ${this.theme.selectedWordText};
          background-color: ${this.theme.selectedWordBg};
          padding: 2px 4px;
          border-radius: 3px;
          text-decoration: none;
          transition: all 0.2s;
        `;
      } else if (canSelect) {
        span.style.cssText = `
          cursor: pointer;
          color: ${this.theme.link};
          transition: all 0.2s;
          border-radius: 4px;
        `;
      } else {
        span.style.cssText = `
          cursor: not-allowed;
          color: ${this.theme.linkDisabled};
          text-decoration: none;
          opacity: 0.5;
          transition: all 0.2s;
        `;
      }
    });

    if (this.mode === 'multiple') {
      this.updateTranslateButtonState();
    }
  }

  clearSelection() {
    this.selectedWords = [];
    this.selectedIndices = [];
    this.updateWordStyles();
  }

  restoreSelectionView() {
    this.backButton.style.display = 'none';
    this.modeSelector.style.display = 'flex';

    while (this.contentPara.firstChild) {
      this.contentPara.removeChild(this.contentPara.firstChild);
    }

    this.wordSpans.forEach((span) => {
      this.contentPara.appendChild(span);
    });

    this.updateWordStyles();

    if (this.mode === 'multiple') {
      this.translateBtn.style.display = 'block';
      this.updateTranslateButtonState();
    }
  }

  remove() {
    const existingPopup = document.getElementById('custom-dictionary-popup');
    if (existingPopup && existingPopup.parentNode) {
      existingPopup.parentNode.removeChild(existingPopup);
      this.popup = null;
      this.popupContent = null;
      this.contentPara = null;
    }
  }

  async fetchDefinition(word, sentence) {
    try {
      this.backButton.style.display = 'inline-flex';
      this.modeSelector.style.display = 'none';
      this.translateBtn.style.display = 'none';

      this.showLoadingAnimation();

      const storage = await browser.storage.local.get('selectedModel');
      const modelName = storage.selectedModel;

      if (!modelName) {
        throw new Error('No model selected. Please select a model in the extension settings.');
      }

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: `Define "${word}" in: "${sentence}". Be concise.`,
          stream: true,
          think: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffered = '';

      while (this.contentPara.firstChild) {
        this.contentPara.removeChild(this.contentPara.firstChild);
      }

      const wordLabel = document.createElement('strong');
      wordLabel.style.cssText = `
        color: ${this.theme.onSurface};
        font-weight: 600;
      `;
      wordLabel.textContent = `${word}: `;
      this.contentPara.appendChild(wordLabel);

      const loadingSpan = document.createElement('span');
      loadingSpan.style.cssText = `
        color: ${this.theme.onSurfaceMuted};
      `;
      loadingSpan.innerHTML = 'Loading...';
      this.contentPara.appendChild(loadingSpan);

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffered += decoder.decode(value, { stream: true });
        const lines = buffered.split('\n');
        buffered = lines.pop() || '';

        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return;
          }

          try {
            const parsed = JSON.parse(trimmed);
            fullResponse += parsed.response || '';
          } catch (e) {
            console.error('JSON parse error:', e, trimmed);
          }
        });

        loadingSpan.style.color = this.theme.onSurface;
        loadingSpan.innerHTML = this.formatModelResponse(fullResponse);
      }

      if (buffered.trim()) {
        try {
          const parsed = JSON.parse(buffered.trim());
          fullResponse += parsed.response || '';
          loadingSpan.innerHTML = this.formatModelResponse(fullResponse);
        } catch (e) {
          console.error('Trailing JSON parse error:', e, buffered);
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Streaming error:', error);

      while (this.contentPara.firstChild) {
        this.contentPara.removeChild(this.contentPara.firstChild);
      }

      const errorSpan = document.createElement('span');
      errorSpan.style.cssText = `
        color: ${this.theme.error};
        font-weight: 600;
      `;
      errorSpan.textContent = `Error: ${error.message}`;
      this.contentPara.appendChild(errorSpan);
      return null;
    }
  }

  showLoadingAnimation() {
    while (this.contentPara.firstChild) {
      this.contentPara.removeChild(this.contentPara.firstChild);
    }

    const loadingContainer = document.createElement('div');
    loadingContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      gap: 12px;
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid ${this.theme.primaryContainer};
      border-top-color: ${this.theme.primary};
      animation: material-spin 0.8s linear infinite;
    `;

    const loadingText = document.createElement('div');
    loadingText.style.cssText = `
      color: ${this.theme.primary};
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.3px;
      animation: pulse 1.5s infinite;
    `;
    loadingText.textContent = 'Translating';

    if (!document.getElementById('popup-animations')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'popup-animations';
      styleTag.textContent = `
        @keyframes material-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
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
        @keyframes material-popup-in {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `;
      document.head.appendChild(styleTag);
    }

    loadingContainer.appendChild(spinner);
    loadingContainer.appendChild(loadingText);
    this.contentPara.appendChild(loadingContainer);
  }
}

const dictionaryPopup = new CustomDictionaryPopup();

browser.runtime.onMessage.addListener((request) => {
  if (request.action === 'showPopup') {
    dictionaryPopup.show(request.text);
  }
});
