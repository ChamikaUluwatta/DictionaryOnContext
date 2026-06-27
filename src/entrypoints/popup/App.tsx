import { useState } from "react";
import InputView from "@/components/Inputview/InputView";
import OutputView from "@/components/outputview/OutputView";
import Settings from "@/components/setting/Settings";
import { useTranslation } from "@/hooks/useTranslation";
import SelectTextView from "@/components/selectTextView/SelectTestView";

const DEFAULT_SETTINGS = {
  provider: "gemini",
  apiKey: "",
  model: "gemini-3-flash-preview",
};

function App() {
  const [inputValue, setInputValue] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSelectedView, setShowSelectedView] = useState(false);
  const { status, outputText, error, translate, abort  } = useTranslation();

  const isLoading = status === "loading" || status === "streaming";
  const showOutput =
    status === "streaming" || status === "done" || status === "error";

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    abort()
    setShowSettings(false)
    setShowSelectedView(true)
  };

  const handleSelected = (selectedText: string) => {
    setShowSelectedView(false);
    translate(selectedText);
  };

  return (
    <div className="w-full rounded-4xl p-3">
      <InputView
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={handleSend}
        isLoading={isLoading}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings((prev) => !prev)}
      />
      {showSettings && <Settings value={settings} onChange={setSettings} />}
      {showOutput && (
        <OutputView
          text={outputText}
          error={error}
          isStreaming={status === "streaming"}
        />
      )}
      {
        showSelectedView && <SelectTextView text={inputValue} onTranslate={handleSelected}/>
      }
    </div>
  );
}

export default App;
