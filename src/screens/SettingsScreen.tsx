import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/settingsStore';
import { Spacing, Radius, ThemeMeta, ThemePalettes } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { ThemeId } from '../types';

const APP_VERSION = '1.0.0';
const PRIVACY_URL = 'https://flames-hub.github.io/medication-reminder/privacy.html';
const TERMS_URL = 'https://flames-hub.github.io/medication-reminder/terms.html';
const THEME_IDS: ThemeId[] = ['sakura', 'mint', 'honey', 'dark'];

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, fontSize, themeId } = useTheme();
  const { uiSize, notificationsEnabled, setUISize, setNotificationsEnabled, setThemeId } = useSettingsStore();

  const lang = i18n.language?.startsWith('ja') ? 'ja' : 'en';

  function SectionTitle({ text }: { text: string }) {
    return <Text style={[styles.section, { color: colors.textSecondary, fontSize: fontSize.xs }]}>{text.toUpperCase()}</Text>;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>

      {/* ── テーマ ── */}
      <SectionTitle text={t('settings.theme')} />
      <View style={[styles.swatchRow, { backgroundColor: colors.surface }]}>
        {THEME_IDS.map((id) => {
          const selected = id === themeId;
          const swatchColor = id === 'dark' ? '#2a2a2a' : ThemePalettes[id].primary;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setThemeId(id)}
              style={styles.swatchWrap}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View style={[
                styles.swatch,
                { backgroundColor: swatchColor },
                selected && { borderWidth: 2.5, borderColor: colors.primary },
              ]}>
                {selected && <Text style={{ color: '#fff', fontSize: 16 }}>✓</Text>}
              </View>
              <Text style={{ color: selected ? colors.primary : colors.textSecondary, fontSize: fontSize.xs, fontWeight: selected ? '700' : '400', marginTop: 4 }}>
                {lang === 'ja' ? ThemeMeta[id].labelJa : ThemeMeta[id].labelEn}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── 通知 ── */}
      <SectionTitle text={t('settings.notifications')} />
      <View style={[styles.row, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={{ color: colors.text, fontSize: fontSize.md, flex: 1 }}>{t('settings.notificationsDesc')}</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ true: colors.primary, false: colors.fill }}
          thumbColor="#fff"
        />
      </View>

      {/* ── 文字サイズ ── */}
      <SectionTitle text={t('settings.uiSize')} />
      <Text style={{ color: colors.muted, fontSize: fontSize.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.xs }}>
        {t('settings.uiSizeDesc')}
      </Text>
      <View style={[styles.row, { backgroundColor: colors.surface, borderBottomColor: colors.border, gap: 0, padding: 0, overflow: 'hidden' }]}>
        <TouchableOpacity
          style={[styles.segmentBtn, { backgroundColor: uiSize === 'standard' ? colors.primary : 'transparent' }]}
          onPress={() => setUISize('standard')}
          accessibilityRole="radio" accessibilityState={{ selected: uiSize === 'standard' }}
        >
          <Text style={{ color: uiSize === 'standard' ? '#fff' : colors.text, fontSize: fontSize.md, fontWeight: '500' }}>
            {t('settings.uiStandard')}
          </Text>
        </TouchableOpacity>
        <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
        <TouchableOpacity
          style={[styles.segmentBtn, { backgroundColor: uiSize === 'large' ? colors.primary : 'transparent' }]}
          onPress={() => setUISize('large')}
          accessibilityRole="radio" accessibilityState={{ selected: uiSize === 'large' }}
        >
          <Text style={{ color: uiSize === 'large' ? '#fff' : colors.text, fontSize: fontSize.md, fontWeight: '500' }}>
            {t('settings.uiLarge')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── About ── */}
      <SectionTitle text={t('settings.about')} />
      <View style={{ backgroundColor: colors.surface }}>
        <TouchableOpacity style={[styles.aboutRow, { borderBottomColor: colors.border }]} onPress={() => Linking.openURL(PRIVACY_URL)} accessibilityRole="link">
          <Text style={{ color: colors.text, fontSize: fontSize.md, flex: 1 }}>{t('settings.privacy')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.aboutRow, { borderBottomColor: colors.border }]} onPress={() => Linking.openURL(TERMS_URL)} accessibilityRole="link">
          <Text style={{ color: colors.text, fontSize: fontSize.md, flex: 1 }}>{t('settings.terms')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </TouchableOpacity>
        <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
          <Text style={{ color: colors.text, fontSize: fontSize.md, flex: 1 }}>{t('settings.version')}</Text>
          <Text style={{ color: colors.muted, fontSize: fontSize.md }}>{APP_VERSION}</Text>
        </View>
      </View>

      <Text style={{ color: colors.muted, fontSize: fontSize.sm, textAlign: 'center', paddingVertical: Spacing.lg }}>
        {t('settings.madeWith')}
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xl },
  section: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  swatchRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  swatchWrap: { alignItems: 'center' },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  segmentBtn: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center',
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
