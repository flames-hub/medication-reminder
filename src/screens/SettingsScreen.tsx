import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/settingsStore';
import { PaywallModal } from '../components/PaywallModal';
import { Card } from '../components/GlassCard';
import { Spacing, Radius, ThemeMeta } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { ThemeId } from '../types';

const APP_VERSION = '1.0.0';
const PRIVACY_URL = 'https://flames-hub.github.io/medication-reminder/privacy.html';
const TERMS_URL = 'https://flames-hub.github.io/medication-reminder/terms.html';
const THEME_IDS: ThemeId[] = ['sakura', 'mint', 'honey'];

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, fontSize, themeId } = useTheme();
  const { isPro, uiSize, notificationsEnabled, setUISize, setIsPro, setNotificationsEnabled, setThemeId } = useSettingsStore();
  const [showPaywall, setShowPaywall] = useState(false);

  const lang = i18n.language?.startsWith('ja') ? 'ja' : 'en';

  function SectionTitle({ text }: { text: string }) {
    return <Text style={[styles.section, { color: colors.textSecondary, fontSize: fontSize.sm }]}>{text.toUpperCase()}</Text>;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>

      {/* ── テーマ ── */}
      <SectionTitle text={t('settings.theme')} />
      <Card style={[styles.themeRow]}>
        {THEME_IDS.map((id) => {
          const meta = ThemeMeta[id];
          const selected = id === themeId;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setThemeId(id)}
              style={[styles.themeBtn, selected && { backgroundColor: colors.primaryMuted, borderColor: colors.primary, borderWidth: 2 }]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text style={{ fontSize: 24 }}>{meta.emoji}</Text>
              <Text style={{ color: selected ? colors.primary : colors.text, fontSize: fontSize.sm, fontWeight: selected ? '600' : '400', marginTop: 4 }}>
                {lang === 'ja' ? meta.labelJa : meta.labelEn}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Card>

      {/* ── 通知 ── */}
      <SectionTitle text={t('settings.notifications')} />
      <Card style={styles.row}>
        <Text style={{ color: colors.text, fontSize: fontSize.md, flex: 1 }}>{t('settings.notificationsDesc')}</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ true: colors.primary, false: colors.fill }}
          thumbColor="#fff"
        />
      </Card>

      {/* ── 文字サイズ ── */}
      <SectionTitle text={t('settings.uiSize')} />
      <Text style={{ color: colors.muted, fontSize: fontSize.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.xs }}>
        {t('settings.uiSizeDesc')}
      </Text>
      <Card style={[styles.row, { gap: 0, padding: 0, overflow: 'hidden' }]}>
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
      </Card>

      {/* ── Pro ── */}
      {!isPro && (
        <>
          <SectionTitle text="PRO" />
          <TouchableOpacity onPress={() => setShowPaywall(true)} activeOpacity={0.8}>
            <Card style={[styles.proCard, { backgroundColor: colors.primary }]}>
              <Text style={{ color: '#fff', fontSize: fontSize.lg, fontWeight: '700' }}>{t('settings.subscribe')}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm, marginTop: 4 }}>
                {t('settings.subscribeDesc')}
              </Text>
            </Card>
          </TouchableOpacity>
        </>
      )}
      {isPro && (
        <Card style={[styles.row, { marginTop: Spacing.md, marginHorizontal: Spacing.md }]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={{ color: colors.success, fontSize: fontSize.md, fontWeight: '600', marginLeft: Spacing.sm }}>Pro</Text>
        </Card>
      )}

      {/* ── About ── */}
      <SectionTitle text={t('settings.about')} />
      <Card style={styles.aboutCard}>
        <TouchableOpacity style={styles.aboutRow} onPress={() => Linking.openURL(PRIVACY_URL)} accessibilityRole="link">
          <Text style={{ color: colors.text, fontSize: fontSize.md, flex: 1 }}>{t('settings.privacy')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </TouchableOpacity>
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
        <TouchableOpacity style={styles.aboutRow} onPress={() => Linking.openURL(TERMS_URL)} accessibilityRole="link">
          <Text style={{ color: colors.text, fontSize: fontSize.md, flex: 1 }}>{t('settings.terms')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </TouchableOpacity>
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
        <View style={styles.aboutRow}>
          <Text style={{ color: colors.text, fontSize: fontSize.md, flex: 1 }}>{t('settings.version')}</Text>
          <Text style={{ color: colors.muted, fontSize: fontSize.md }}>{APP_VERSION}</Text>
        </View>
      </Card>

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
  section: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.xs, fontWeight: '500', letterSpacing: 0.5 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, marginHorizontal: Spacing.md,
  },
  themeRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    padding: Spacing.md, marginHorizontal: Spacing.md,
  },
  themeBtn: {
    alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderRadius: Radius.md, borderWidth: 2, borderColor: 'transparent',
  },
  segmentBtn: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center',
  },
  proCard: { padding: Spacing.lg, marginHorizontal: Spacing.md },
  aboutCard: { marginHorizontal: Spacing.md },
  aboutRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
});
