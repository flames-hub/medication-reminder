import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/settingsStore';
import { PaywallModal } from '../components/PaywallModal';
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
  const { isPro, uiSize, notificationsEnabled, setUISize, setIsPro, setNotificationsEnabled, setThemeId } = useSettingsStore();
  const [showPaywall, setShowPaywall] = useState(false);

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
        {isPro ? (
          <TouchableOpacity
            style={[styles.segmentBtn, { backgroundColor: uiSize === 'large' ? colors.primary : 'transparent' }]}
            onPress={() => setUISize('large')}
            accessibilityRole="radio" accessibilityState={{ selected: uiSize === 'large' }}
          >
            <Text style={{ color: uiSize === 'large' ? '#fff' : colors.text, fontSize: fontSize.md, fontWeight: '500' }}>
              {t('settings.uiLarge')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.segmentBtn, { backgroundColor: 'transparent' }]}
            onPress={() => setShowPaywall(true)}
          >
            <Ionicons name="lock-closed" size={12} color={colors.muted} style={{ marginRight: 4 }} />
            <Text style={{ color: colors.muted, fontSize: fontSize.md }}>{t('settings.uiLarge')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Pro ── */}
      {!isPro && (
        <>
          <SectionTitle text="PRO" />
          <TouchableOpacity
            style={[styles.proCard, { backgroundColor: colors.primary }]}
            onPress={() => setShowPaywall(true)}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#fff', fontSize: fontSize.lg, fontWeight: '700' }}>{t('settings.subscribe')}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm, marginTop: 4 }}>
              {t('settings.subscribeDesc')}
            </Text>
          </TouchableOpacity>
        </>
      )}
      {isPro && (
        <View style={[styles.row, { backgroundColor: colors.surface, borderBottomColor: colors.border, marginTop: Spacing.md }]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={{ color: colors.success, fontSize: fontSize.md, fontWeight: '600', marginLeft: Spacing.sm }}>Pro</Text>
        </View>
      )}

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

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={() => { setIsPro(true); setShowPaywall(false); }}
        onRestore={() => setShowPaywall(false)}
      />
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
  proCard: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
