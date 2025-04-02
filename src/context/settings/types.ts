
import { Settings } from "@/types";

export interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}
