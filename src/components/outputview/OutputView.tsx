type OutputViewProps = {
  text: string;
  error: string | null;
  isStreaming: boolean;
};

export default function OutputView({ text, error, isStreaming }: OutputViewProps) {
  if (error) {
    return (
      <div className="bg-[#f0e6d3] rounded-xl p-4 mt-3 mx-1 border border-[#e07a5f]/30">
        <p className="text-[#e07a5f] text-[13px] leading-relaxed">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f0e6d3] rounded-xl p-4 mt-3 mx-1">
      <p className="text-[#3d405b] text-[14px] leading-relaxed whitespace-pre-wrap">
        <b>Meaning: <br></br></b>
        {text}
        {isStreaming && (
          <span className="inline-block w-2 h-3.5 bg-[#81b29a] ml-0.5 animate-pulse align-middle" />
        )}
      </p>
    </div>
  );
}
