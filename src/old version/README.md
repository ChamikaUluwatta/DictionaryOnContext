# DictionaryOnContext


##  Overview
**DictionaryOnContext** is a Firefox extension that helps you quickly understand the meaning of words in context.  
Unlike traditional dictionaries, this extension considers the **entire sentence** before providing a definition, making explanations more relevant and accurate.

##  Features
- **Context-aware definitions** – Considers the full sentence for more accurate meanings
- **Single & Multiple word selection modes** – Choose one word or multiple consecutive words
- **Dark/Light theme** – Switch between dark and light modes for comfortable viewing
- **Customizable AI model** – Select your preferred Ollama model from settings
- **Address bar popup** – Quick access to lookup any text directly
- **Right-click context menu** – Instantly look up selected text on any webpage
- **Back navigation** – Return to word selection after viewing definitions
- **Lightweight and fast** – Works seamlessly on all websites

## Installation
You can install it directly from the Firefox Add-ons Store:

 [Dictionary with Ollama – Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/dictionarywithollama/)

Or, to load it manually:
1. Clone or download this repository.
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click **"Load Temporary Add-on"**.
4. Select the `manifest.json` file from the project folder.

##  Prerequisites
This extension requires **Ollama** running locally:
1. Install Ollama from [https://ollama.ai](https://ollama.ai)
2. Start the Ollama server: `ollama serve`
3. Pull a model: `ollama pull qwen2.5:3b-instruct` (or any other model)



##  How to use

### Method 1: Context Menu (Right-click)
1. Highlight a word or sentence on any webpage
2. Right-click and choose **"Search in Dictionary"**
3. Select single or multiple word mode
4. Click on words to see their definitions

### Method 2: Address Bar Popup
1. Click the extension icon in your address bar
2. Type or paste text in the input box
3. Click **"Translate"** to get definitions
4. Access **Settings** to change theme or select a different Ollama model

### Settings
- **Model Selection**: Choose from installed Ollama models
- **Dark/Light Mode**: Toggle between themes for comfortable viewing


---
[DictionaryOnContext – Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/dictionarywithollama/)
