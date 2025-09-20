# DictionaryOnContext


##  Overview
**DictionaryOnContext** is a Firefox extension that helps you quickly understand the meaning of words in context.  
Unlike traditional dictionaries, this extension considers the **entire sentence** before providing a definition, making explanations more relevant and accurate.

##  Features
- Right-click on any word to get its meaning in context.  
- Uses a background service (Ollama) to process word definitions.  
- Lightweight and simple to use.  
- Works on all websites you visit.  

## Installation
You can install it directly from the Firefox Add-ons Store:

 [Dictionary with Ollama – Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/dictionarywithollama/)

Or, to load it manually:
1. Clone or download this repository.
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click **"Load Temporary Add-on"**.
4. Select the `manifest.json` file from the project folder.


##  Permissions
This extension requires the following permissions:
- `activeTab` – to read the currently active tab.
- `contextMenus` – to add right-click dictionary options.
- `http://localhost/*` – to communicate with the local Ollama server.

##  How to use
1. Highlight a word on any webpage.  
2. Right-click and choose **"Search in the Dictionary"**.  
3. The extension will fetch a context-aware definition.  


---
[DictionaryOnContext – Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/dictionarywithollama/)
