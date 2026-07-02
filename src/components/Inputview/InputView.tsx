import { useRef, useEffect, useCallback } from "react";
import { ArrowUpIcon, LoadingSpinner, SettingsIcon } from "@/components/icons";

const MIN_HEIGHT = 44;
const MAX_HEIGHT = 160;

type InputViewProps = {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  showSettings: boolean;
  onToggleSettings: () => void;
};

export default function InputView({
  inputValue,
  onInputChange,
  onSend,
  isLoading,
  showSettings,
  onToggleSettings,
}: InputViewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = inputValue.trim().length === 0;
  const placeholder = "Enter text to translate...";

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, MIN_HEIGHT),
      MAX_HEIGHT,
    );
    textarea.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [inputValue, adjustHeight]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isEmpty && !isLoading) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full min-w-[320px]">
      <div className="bg-[#f0e6d3] rounded-3xl px-3.5 py-2.5 flex items-center gap-2.5">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className="
            flex-1 bg-transparent resize-none outline-none border-none
            text-[#3d405b] text-[14px] leading-relaxed
            placeholder:text-[#3d405b]/30
            min-h-11 max-h-40
            overflow-y-auto
            disabled:opacity-50
            disabled:cursor-not-allowed
            custom-scrollbar
          "
          style={{ height: `${MIN_HEIGHT}px` }}
        />
        <button
          type="button"
          onClick={onToggleSettings}
          aria-label="Toggle settings"
          className="bg-transparent border-none p-0 text-[#81b29a] shrink-0 cursor-pointer"
        >
          <SettingsIcon open={showSettings} />
        </button>
        <button
          onClick={onSend}
          disabled={isEmpty || isLoading}
          className={`
            flex items-center justify-center
            w-7.5 h-7.5 rounded-full shrink-0
            transition-all duration-150 ease-out
            active:scale-[0.95]
            ${
              isEmpty || isLoading
                ? "bg-[#81b29a]/40 text-[#fdf6ec] cursor-not-allowed"
                : "bg-[#81b29a] text-[#fdf6ec] cursor-pointer hover:bg-[#6b9a85]"
            }
          `}
          aria-label={isLoading ? "Loading" : "Send"}
        >
          {isLoading ? <LoadingSpinner /> : <ArrowUpIcon />}
        </button>
      </div>
    </div>
  );
}
