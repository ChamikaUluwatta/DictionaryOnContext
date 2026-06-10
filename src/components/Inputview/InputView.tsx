import React, { useState, useRef, useEffect, useCallback } from "react";

const ArrowUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const LoadingSpinner = () => (
  <svg
    className="animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v4" />
    <path d="m16.2 7.8 2.9-2.9" />
    <path d="M18 12h4" />
    <path d="m16.2 16.2 2.9 2.9" />
    <path d="M12 18v4" />
    <path d="m4.9 19.1 2.9-2.9" />
    <path d="M2 12h4" />
    <path d="m4.9 4.9 2.9 2.9" />
  </svg>
);

const SettingsIcon = ({ open }: { open: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="cursor-pointer transition-transform duration-200"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
  >
    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MIN_HEIGHT = 44;
const MAX_HEIGHT = 160;

export default function InputView() {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMountedRef = useRef(true);
  const isEmpty = inputValue.trim().length === 0;
  const placeholder = "Enter text to translate...";

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, MIN_HEIGHT),
      MAX_HEIGHT
    );
    textarea.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [inputValue, adjustHeight]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isEmpty && !isLoading) {
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (isEmpty || isLoading) return;

    setIsLoading(true);

    setTimeout(() => {
      if (!isMountedRef.current) return;
      setIsLoading(false);
      setInputValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = `${MIN_HEIGHT}px`;
      }
    }, 2000);
  };

  return (
    <div className="w-full min-w-[320px] p-4">
      <div className="bg-[#f0e6d3] rounded-t-3xl px-3.5 py-2.5 flex items-center gap-2.5 relative">
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
      </div>
     <div className="flex rounded-b-3xl flex-row justify-end gap-2 bg-[#f0e6d3] outline-none p-3">
      <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Toggle settings"
          className="bg-transparent border-none p-0 text-[#81b29a] shrink-0 cursor-pointer"
        >
          <SettingsIcon open={showSettings} />
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isEmpty || isLoading}
          className={`
            flex items-center justify-center
            w-7.5 h-7.5 rounded-full shrink-0
            transition-all duration-150 ease-out
            active:scale-[0.95]
            ${isEmpty || isLoading
              ? "bg-[#81b29a]/40 text-[#fdf6ec] cursor-not-allowed"
              : "bg-[#81b29a] text-[#fdf6ec] cursor-pointer hover:bg-[#6b9a85]"
            }
          `}
          aria-label={isLoading ? "Loading" : "Send"}
        >
          {isLoading ? <LoadingSpinner /> : <ArrowUpIcon />}
        </button>
     </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-[#f0e6d3] rounded-xl p-4 mt-3 mx-1">
          <h2 className="text-[#3d405b] text-[14px] font-semibold mb-3">Settings</h2>
          <div className="space-y-3">
            <div>
              <label className="text-[#3d405b]/60 text-[12px] font-medium uppercase tracking-wider mb-1 block">
                Model
              </label>
              <select className="w-full bg-[#fdf6ec] text-[#3d405b] rounded-lg px-3 py-2 text-[14px] outline-none border border-[#3d405b]/10 cursor-pointer">
                <option>Loading models...</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
