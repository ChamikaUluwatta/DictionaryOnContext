import SelectTextView from "../selectTextView/SelectTestView";
type props = {
  text: string;
};

export function AbsolutePopUp({ text }: props) {
  const { translate, abort } = useTranslation();
  const handleSelected = (selectedText: string) => {
    translate(selectedText);
  };
  return (
    <div className="w-[45vw] min-w-80 h-[45vh] min-h-60 rounded-3xl border border-[#81b29a]/30 bg-[#fdf6ec]/85 backdrop-blur-xl shadow-2xl shadow-black/10 p-6 overflow-auto">
      <SelectTextView text={text} onTranslate={handleSelected} />
    </div>
  );
}
