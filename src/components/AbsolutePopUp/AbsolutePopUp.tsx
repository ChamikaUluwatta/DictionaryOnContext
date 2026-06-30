import { useEffect, useRef } from "react";
import SelectTextView from "../selectTextView/SelectTestView";
import { useTranslationPort } from "@/hooks/useTranslationPort";
import OutputView from "../outputview/OutputView";

type Props = {
  text: string;
  onClose: () => void;
};

export function AbsolutePopUp({ text, onClose }: Props) {
  const { translate, abort, outputText, status, error } = useTranslationPort();
  const popupRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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
      className="w-[45vw] min-w-80 max-w-120  min-h-60 rounded-3xl border border-[#81b29a]/30 bg-[#fdf6ec]/85 backdrop-blur-xl shadow-2xl shadow-black/10 p-6 overflow-y-auto"
    >
      {status === "idle" ? (
        <SelectTextView text={text} onTranslate={handleSelected} />
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
