import type { SettingsData } from "@/hooks/useTranslationPort";
import { SaveIcon } from "@/components/icons";
import { PROVIDERS, MODELS_BY_PROVIDER } from "@/utils/constants";

type SettingsProps = {
  value: SettingsData;
  onChange: (settings: SettingsData) => void;
  saveApiKey: ()=>void
};

export default function Settings({ value, onChange, saveApiKey }: SettingsProps) {
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
            onChange={(e) => {
              const newProvider = e.target.value;
              const firstModel = MODELS_BY_PROVIDER[newProvider]?.[0] ?? "";
              update({ provider: newProvider, model: firstModel });
            }}
            className="w-full bg-[#fdf6ec] text-[#3d405b] rounded-lg px-3 py-2 text-[14px] outline-none border border-[#3d405b]/10 cursor-pointer"
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p === "gemini" ? "Google Gemini" : p === "openrouter" ? "Openrouter" : p}
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
            value={value.apiKeys[value.provider] ?? ""}
            onChange={(e) =>
              update({
                apiKeys: { ...value.apiKeys, [value.provider]: e.target.value },
              })
            }
            placeholder={`Enter your ${value.provider === "gemini" ? "Gemini" : "OpenRouter"} API key`}
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
      <div className="flex flex-row justify-end mt-4">
        <button onClick={saveApiKey} className="flex items-center gap-1.5 bg-[#81b29a] text-[#fdf6ec] rounded-lg px-3 py-1.5 text-[13px] cursor-pointer hover:bg-[#6b9a85] transition-colors">
          <SaveIcon />
          Save
        </button>
      </div>
    </div>
  );
}
