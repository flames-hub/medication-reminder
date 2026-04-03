import { ThemeId } from '../types';

interface Palette {
  primary: string;
  primaryMuted: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  error: string;
  errorMuted: string;
  muted: string;
  fill: string;
}

// ── さくら (Sakura) ─────────────────────
const sakura: Palette = {
  primary: '#E8788A',
  primaryMuted: '#FFF0F2',
  background: '#FFF8F6',
  surface: '#FFFFFF',
  text: '#3D2C2E',
  textSecondary: '#8C7072',
  border: '#F2E0E2',
  success: '#6BBF8A',
  successMuted: '#EDF8F0',
  warning: '#E8A85C',
  warningMuted: '#FFF5E8',
  error: '#D96B6B',
  errorMuted: '#FDECEC',
  muted: '#B8A0A3',
  fill: '#FEF2F0',
};

// ── みんと (Mint) ────────────────────────
const mint: Palette = {
  primary: '#5CAAAB',
  primaryMuted: '#E8F5F5',
  background: '#F5FAFA',
  surface: '#FFFFFF',
  text: '#2C3A3A',
  textSecondary: '#6E8484',
  border: '#D8EDED',
  success: '#6BBF8A',
  successMuted: '#EDF8F0',
  warning: '#E2A755',
  warningMuted: '#FFF5E5',
  error: '#D47070',
  errorMuted: '#FDECEC',
  muted: '#9BB3B3',
  fill: '#EEF6F6',
};

// ── はちみつ (Honey) ─────────────────────
const honey: Palette = {
  primary: '#D4935D',
  primaryMuted: '#FFF3E8',
  background: '#FFFAF5',
  surface: '#FFFFFF',
  text: '#3A3028',
  textSecondary: '#857060',
  border: '#F0E4D8',
  success: '#7BB87B',
  successMuted: '#EFF8EF',
  warning: '#D4A84A',
  warningMuted: '#FFF8E8',
  error: '#CC6B6B',
  errorMuted: '#FDECEC',
  muted: '#B5A596',
  fill: '#F8F0E8',
};

export const ThemePalettes: Record<ThemeId, Palette> = {
  sakura,
  mint,
  honey,
};

export const ThemeMeta: Record<ThemeId, { emoji: string; labelJa: string; labelEn: string }> = {
  sakura: { emoji: '🌸', labelJa: 'さくら', labelEn: 'Sakura' },
  mint:   { emoji: '🍃', labelJa: 'みんと', labelEn: 'Mint' },
  honey:  { emoji: '🍯', labelJa: 'はちみつ', labelEn: 'Honey' },
};

/** 現在のテーマのパレットを返す */
export function getColors(themeId: ThemeId): Palette {
  return ThemePalettes[themeId];
}

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const FontSize = {
  standard: { sm: 12, md: 14, lg: 16, xl: 20, xxl: 28 },
  large: { sm: 16, md: 18, lg: 22, xl: 28, xxl: 36 },
};

export const Radius = { sm: 8, md: 12, lg: 16, pill: 999 };

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};
