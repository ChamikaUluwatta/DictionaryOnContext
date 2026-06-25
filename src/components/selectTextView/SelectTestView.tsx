import { useState } from "react";

type Props = {
  text: string;
  onTranslate: (selectedText: string) => void;
};

export default function SelectTextView({ text, onTranslate }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const words = text.split(" ");

  const handleTranslateSelected = () => {
    if (selectedIndex === null) return;
    const tagged = words
      .map((w, i) => (i === selectedIndex ? `<selected>${w}</selected>` : w))
      .join(" ");
    onTranslate(tagged);
  };

  return (
    <div className="bg-[#f0e6d3] rounded-xl p-4 mt-3 mx-1">
      <p className="text-[#3d405b]/60 text-[12px] mb-2">
        Tap a word to define in context:
      </p>
      <div className="flex flex-wrap gap-1">
        {words.map((word, i) => (
          <button
            key={i}
            onClick={() =>
              setSelectedIndex(i === selectedIndex ? null : i)
            }
            className={`text-sm rounded-sm p-1 cursor-pointer whitespace-nowrap transition-colors ${
              i === selectedIndex
                ? "bg-[#81b29a] text-[#fdf6ec]"
                : "text-[#3d405b] hover:bg-[#81b29a]/20"
            }`}
          >
            {word}
          </button>
        ))}
      </div>
      <button
        onClick={handleTranslateSelected}
        disabled={selectedIndex === null}
        className="mt-3 w-full bg-[#81b29a] text-[#fdf6ec] rounded-lg py-2 text-[14px] font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Define Selected
      </button>
    </div>
  );
}
