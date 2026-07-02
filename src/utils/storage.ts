import type { SettingsData } from "@/hooks/useTranslationPort";
import { DEFAULT_SETTINGS } from "./constants";

export const settingsItem = storage.defineItem<SettingsData>("local:settings", {
  fallback: DEFAULT_SETTINGS,
});
