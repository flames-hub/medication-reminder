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
  primary: '#3D9EA0',
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
  primary: '#C47A3A',
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

// ── ダーク (Dark / DESIGN.md) ───────────────
const dark: Palette = {
  primary: '#f59e0b',
  primaryMuted: 'rgba(245,158,11,0.15)',
  background: '#0b0a09',
  surface: '#161513',
  text: '#f2f0ec',
  textSecondary: '#a8a29e',
  border: 'rgba(255,255,255,0.10)',
  success: '#22c55e',
  successMuted: 'rgba(34,197,94,0.12)',
  warning: '#f59e0b',
  warningMuted: 'rgba(245,158,11,0.15)',
  error: '#ef4444',
  errorMuted: 'rgba(239,68,68,0.12)',
  muted: '#78716c',
  fill: '#1e1d1b',
};

export const ThemePalettes: Record<ThemeId, Palette> = {
  sakura,
  mint,
  honey,
  dark,
};

export const ThemeMeta: Record<ThemeId, { icon: string; iconColor: string; labelJa: string; labelEn: string }> = {
  sakura: { icon: 'flower-outline', iconColor: '#E8788A', labelJa: 'さくら', labelEn: 'Sakura' },
  mint:   { icon: 'leaf-outline',   iconColor: '#5CAAAB', labelJa: 'みんと', labelEn: 'Mint' },
  honey:  { icon: 'sunny-outline',  iconColor: '#D4935D', labelJa: 'はちみつ', labelEn: 'Honey' },
  dark:   { icon: 'moon',           iconColor: '#f59e0b', labelJa: 'ダーク',   labelEn: 'Dark' },
};

/** 現在のテーマのパレットを返す */
export function getColors(themeId: ThemeId): Palette {
  return ThemePalettes[themeId];
}

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const FontSize = {
  standard: { xs: 12, sm: 14, md: 16, lg: 18, xl: 24, xxl: 32 },
  large: { xs: 16, sm: 18, md: 22, lg: 26, xl: 32, xxl: 40 },
};

export const Radius = { sm: 8, md: 12, lg: 16, pill: 999 };

export type HeaderColors = {
  bg: string;
  text: string;
  tagBg: string;
  tagText: string;
};

export function getHeaderColors(themeId: ThemeId): HeaderColors {
  if (themeId === 'dark') {
    const p = ThemePalettes.dark;
    return { bg: p.surface, text: p.text, tagBg: 'rgba(255,255,255,0.08)', tagText: p.textSecondary };
  }
  const p = ThemePalettes[themeId];
  return { bg: p.primary, text: '#fff', tagBg: 'rgba(255,255,255,0.2)', tagText: '#fff' };
}

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
