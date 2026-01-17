document.getElementById('translateBtn').addEventListener('click', () => {
  const text = document.getElementById('textInput').value.trim();
  
  if (text) {
    // Send message to the active tab to show the dictionary popup
    browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {
        action: "showPopup",
        text: text
      });
      // Close the popup after sending the message
      window.close();
    });
  } else {
    window.close();
  }
});

// Auto-resize textarea based on content
const textInput = document.getElementById('textInput');

function autoResizeTextarea() {
  textInput.style.height = 'auto';
  const newHeight = Math.min(textInput.scrollHeight, 150); // Max height 150px
  textInput.style.height = newHeight + 'px';
}

// Listen for input and paste events
textInput.addEventListener('input', autoResizeTextarea);
textInput.addEventListener('paste', () => {
  setTimeout(autoResizeTextarea, 0);
});

// Allow pressing Enter to trigger the translate button (Ctrl+Enter or Cmd+Enter)
document.getElementById('textInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    document.getElementById('translateBtn').click();
  }
});

// Settings icon click handler
document.getElementById('settingsIcon').addEventListener('click', () => {
  showSettingsView();
});

// Back button click handler
document.getElementById('backButton').addEventListener('click', () => {
  showMainView();
});

// Function to show settings view
function showSettingsView() {
  document.getElementById('mainView').classList.add('hidden');
  document.getElementById('settingsView').classList.remove('hidden');
  document.getElementById('backButton').classList.remove('hidden');
  document.getElementById('settingsIcon').classList.add('hidden');
  document.getElementById('headerTitle').textContent = 'Settings';
  
  // Load Ollama models
  loadOllamaModels();
}

// Function to show main view
function showMainView() {
  document.getElementById('mainView').classList.remove('hidden');
  document.getElementById('settingsView').classList.add('hidden');
  document.getElementById('backButton').classList.add('hidden');
  document.getElementById('settingsIcon').classList.remove('hidden');
  document.getElementById('headerTitle').textContent = 'Dictionary Lookup';
}

// Function to load Ollama models from local API
async function loadOllamaModels() {
  const modelSelect = document.getElementById('modelSelect');
  
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    
    const data = await response.json();
    
    // Clear existing options
    modelSelect.innerHTML = '';
    
    if (data.models && data.models.length > 0) {
      // Get saved model from storage
      browser.storage.local.get('selectedModel').then((result) => {
        const savedModel = result.selectedModel;
        
        data.models.forEach((model) => {
          const option = document.createElement('option');
          option.value = model.name;
          option.textContent = model.name;
          
          // Select the saved model or default
          if (savedModel && model.name === savedModel) {
            option.selected = true;
          }
          
          modelSelect.appendChild(option);
        });
        
        // If no saved model, select the first one by default
        if (!savedModel && data.models.length > 0) {
          modelSelect.value = data.models[0].name;
          browser.storage.local.set({ selectedModel: data.models[0].name });
        }
      });
    } else {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No models available';
      modelSelect.appendChild(option);
    }
  } catch (error) {
    console.error('Error loading Ollama models:', error);
    modelSelect.innerHTML = '<option value="">Error loading models</option>';
  }
}

// Save selected model when changed
document.getElementById('modelSelect').addEventListener('change', (e) => {
  const selectedModel = e.target.value;
  browser.storage.local.set({ selectedModel: selectedModel });
});

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');

// Load saved theme on startup
browser.storage.local.get('darkMode').then((result) => {
  const darkMode = result.darkMode !== undefined ? result.darkMode : true; // Default to dark mode
  applyTheme(darkMode);
});

// Theme toggle click handler
themeToggle.addEventListener('click', () => {
  const isDarkMode = themeToggle.classList.contains('active');
  const newDarkMode = !isDarkMode;
  
  applyTheme(newDarkMode);
  browser.storage.local.set({ darkMode: newDarkMode });
});

// Function to apply theme
function applyTheme(darkMode) {
  if (darkMode) {
    document.body.classList.remove('light-mode');
    themeToggle.classList.add('active');
  } else {
    document.body.classList.add('light-mode');
    themeToggle.classList.remove('active');
  }
}