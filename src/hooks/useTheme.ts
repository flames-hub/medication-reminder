import { getColors, FontSize } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

export function useTheme() {
  const { themeId, uiSize } = useSettingsStore();
  const colors = getColors(themeId);
  const fontSize = FontSize[uiSize];
  return { colors, fontSize, themeId, uiSize };
}
