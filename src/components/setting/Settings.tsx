
type SettingsData = {
  provider: string;
  apiKey: string;
  model: string;
};

type SettingsProps = {
  value: SettingsData;
  onChange: (settings: SettingsData) => void;
};

const PROVIDERS = ["gemini"] as const;

const MODELS_BY_PROVIDER: Record<string, string[]> = {
  gemini: [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
  ],
};

export default function Settings({ value, onChange }: SettingsProps) {
  const models = MODELS_BY_PROVIDER[value.provider] ?? [];

  const update = (patch: Partial<SettingsData>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="bg-[#f0e6d3] rounded-xl p-4 mt-3 mx-1">
      <h2 className="text-[#3d405b] text-[14px] font-semibold mb-3">
        Settings
      </h2>
      <div className="space-y-3">
        <div>
          <label className="text-[#3d405b]/60 text-[12px] font-medium uppercase tracking-wider mb-1 block">
            Provider
          </label>
          <select
            value={value.provider}
            onChange={(e) => update({ provider: e.target.value, model: "" })}
            className="w-full bg-[#fdf6ec] text-[#3d405b] rounded-lg px-3 py-2 text-[14px] outline-none border border-[#3d405b]/10 cursor-pointer"
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p === "gemini" ? "Google Gemini" : p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[#3d405b]/60 text-[12px] font-medium uppercase tracking-wider mb-1 block">
            API Key
          </label>
          <input
            type="password"
            value={value.apiKey}
            onChange={(e) => update({ apiKey: e.target.value })}
            placeholder="Enter your API key"
            className="w-full bg-[#fdf6ec] text-[#3d405b] rounded-lg px-3 py-2 text-[14px] outline-none border border-[#3d405b]/10"
          />
        </div>
        <div>
          <label className="text-[#3d405b]/60 text-[12px] font-medium uppercase tracking-wider mb-1 block">
            Model
          </label>
          <select
            value={value.model}
            onChange={(e) => update({ model: e.target.value })}
            className="w-full bg-[#fdf6ec] text-[#3d405b] rounded-lg px-3 py-2 text-[14px] outline-none border border-[#3d405b]/10 cursor-pointer"
          >
            <option value="">Select a model</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
