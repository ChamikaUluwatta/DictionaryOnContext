import { useState, useEffect } from "react";
import InputView from "@/components/Inputview/InputView";
import OutputView from "@/components/outputview/OutputView";
import Settings from "@/components/setting/Settings";
import { useTranslationPort, type SettingsData } from "@/hooks/useTranslationPort";
import SelectTextView from "@/components/selectTextView/SelectTestView";
import { settingsItem } from "@/utils/storage";
import { DEFAULT_SETTINGS } from "@/utils/constants";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [showSelectedView, setShowSelectedView] = useState(false);
  const { status, outputText, error, translate, abort } = useTranslationPort(settings);

  const saveApiKey = () => {
    settingsItem.setValue(settings);
    setShowSettings(false);
  };

  useEffect(() => {
    settingsItem.getValue().then((saved) => {
      if (saved) {
        const v = saved as SettingsData & { apiKey?: string };
        if (v.apiKey && !v.apiKeys) {
          setSettings({ ...v, apiKeys: { [v.provider]: v.apiKey } });
        } else {
          setSettings(saved);
        }
      }
    });
  }, []);


  const isLoading = status === "loading" || status === "streaming";
  const showOutput =
    status === "streaming" || status === "done" || status === "error";

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    abort();
    setShowSettings(false);
    setShowSelectedView(true);
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
      {showSettings && <Settings value={settings} onChange={setSettings} saveApiKey={saveApiKey} />}
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
