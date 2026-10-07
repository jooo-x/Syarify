export type FontSize = 'normal' | 'large' | 'xlarge';

export interface Settings {
  fontSize: FontSize;
  highContrast: boolean;
  darkMode: boolean;
  modePengantar: boolean;
}

export const defaultSettings: Settings = {
  fontSize: 'normal',
  highContrast: false,
  darkMode: false,
  modePengantar: true,
};

const STORAGE_KEY = 'paham-syariah-settings';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultSettings, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return defaultSettings;
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export function applySettingsToDom(settings: Settings) {
  const root = document.documentElement;
  root.setAttribute('data-fontsize', settings.fontSize);
  root.classList.toggle('dark', settings.darkMode);
  root.classList.toggle('contrast-high', settings.highContrast);
}
