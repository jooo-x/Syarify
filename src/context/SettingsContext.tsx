import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  type Settings,
  type FontSize,
  defaultSettings,
  loadSettings,
  saveSettings,
  applySettingsToDom,
} from '@/settings';

interface SettingsContextValue {
  settings: Settings;
  setFontSize: (size: FontSize) => void;
  toggleHighContrast: () => void;
  toggleDarkMode: () => void;
  toggleModePengantar: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  useEffect(() => {
    applySettingsToDom(settings);
    saveSettings(settings);
  }, [settings]);

  const value: SettingsContextValue = {
    settings,
    setFontSize: (fontSize) => setSettings((s) => ({ ...s, fontSize })),
    toggleHighContrast: () => setSettings((s) => ({ ...s, highContrast: !s.highContrast })),
    toggleDarkMode: () => setSettings((s) => ({ ...s, darkMode: !s.darkMode })),
    toggleModePengantar: () => setSettings((s) => ({ ...s, modePengantar: !s.modePengantar })),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
