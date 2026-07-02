import type { SettingsData } from "@/hooks/useTranslationPort";

export const PROVIDERS = ["gemini", "openrouter"] as const;

export const MODELS_BY_PROVIDER: Record<string, string[]> = {
  gemini: [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
  ],
  openrouter: [
    "openrouter/free",
  ],
};

export const DEFAULT_SETTINGS: SettingsData = {
  provider: "openrouter",
  apiKey: "",
  model: "openrouter/free",
};

export const SYSTEM_PROMPT = `You are a strict, context-aware dictionary assistant. 
The user will provide a sentence with a single word wrapped in <selected>...</selected> tags.
Your job is to look at the entire context of the sentence and provide a concise, direct definition for ONLY the selected word as it is used in that specific sentence. Do not define alternative meanings. Do not repeat the prompt.`;
