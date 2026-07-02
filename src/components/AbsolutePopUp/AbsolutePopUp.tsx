import { useEffect, useRef, useState } from "react";
import SelectTextView from "../selectTextView/SelectTestView";
import { useTranslationPort, type SettingsData } from "@/hooks/useTranslationPort";
import OutputView from "../outputview/OutputView";
import { LoadingSpinner } from "@/components/icons";
import { settingsItem } from "@/utils/storage";
import { DEFAULT_SETTINGS } from "@/utils/constants";

type Props = {
  text: string;
  onClose: () => void;
};

export function AbsolutePopUp({ text, onClose }: Props) {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const { translate, outputText, status, error } = useTranslationPort(settings);
  const popupRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    settingsItem.getValue().then((saved) => {
      if (saved) setSettings(saved);
    });
  }, []);

  const handleSelected = (selectedText: string) => {
    translate(selectedText);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !e.composedPath().includes(popupRef.current)) {
        onCloseRef.current();
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      ref={popupRef}
      className="w-[45vw] min-w-80 max-w-120 min-h-60 rounded-3xl border border-[#81b29a]/30 bg-[#fdf6ec]/85 backdrop-blur-xl shadow-2xl shadow-black/10 p-6 overflow-y-auto flex flex-col"
    >
      {status === "idle" ? (
        <SelectTextView text={text} onTranslate={handleSelected} />
      ) : status === "loading" ? (
        <div className="flex-1 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : (
        <OutputView
          text={outputText}
          isStreaming={status !== "done"}
          error={error}
        />
      )}
    </div>
  );
}
