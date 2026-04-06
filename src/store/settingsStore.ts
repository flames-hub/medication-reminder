import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UISize, ThemeId } from '../types';

interface SettingsState {
  uiSize: UISize;
  themeId: ThemeId;
  notificationsEnabled: boolean;
  isLoaded: boolean;
  setUISize: (s: UISize) => void;
  setThemeId: (t: ThemeId) => void;
  setNotificationsEnabled: (v: boolean) => void;
  loadSettings: () => Promise<void>;
}

const STORAGE_KEY = '@med_reminder_settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  uiSize: 'standard',
  themeId: 'sakura',
  notificationsEnabled: true,
  isLoaded: false,

  setUISize: (s) => {
    set({ uiSize: s });
    persistSettings({ ...get(), uiSize: s });
  },

  setThemeId: (t) => {
    set({ themeId: t });
    persistSettings({ ...get(), themeId: t });
  },

  setNotificationsEnabled: (v) => {
    set({ notificationsEnabled: v });
    persistSettings({ ...get(), notificationsEnabled: v });
  },

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        set({
          uiSize: saved.uiSize ?? 'standard',
          themeId: saved.themeId ?? 'sakura',
          notificationsEnabled: saved.notificationsEnabled !== false,
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },
}));

function persistSettings(state: SettingsState) {
  const { uiSize, themeId, notificationsEnabled } = state;
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ uiSize, themeId, notificationsEnabled })).catch(() => {});
}
