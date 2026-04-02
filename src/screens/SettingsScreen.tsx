import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/settingsStore';
import { PaywallModal } from '../components/PaywallModal';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useColorScheme } from 'react-native';

export function SettingsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { uiSize, isPro, notificationsEnabled, setUISize, setIsPro, setNotificationsEnabled } = useSettingsStore();
  const fontSize = FontSize[uiSize];
  const [showPaywall, setShowPaywall] = useState(false);

  const rowStyle = [styles.row, { backgroundColor: colors.surface, borderColor: colors.border }];
  const labelStyle = [styles.label, { color: colors.text, fontSize: fontSize.md }];
  const sectionTitleStyle = [styles.sectionTitle, { color: colors.textSecondary, fontSize: fontSize.sm }];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={sectionTitleStyle}>{t('settings.notifications')}</Text>
      <View style={rowStyle}>
        <Text style={labelStyle}>{t('settings.notifications')}</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ true: colors.primary }}
        />
      </View>

      <Text style={sectionTitleStyle}>{t('settings.uiSize')}</Text>
      <View style={rowStyle}>
        <TouchableOpacity
          style={[styles.sizeBtn, { backgroundColor: uiSize === 'standard' ? colors.primary : colors.surface, borderRadius: BorderRadius.sm, borderColor: colors.border }]}
          onPress={() => setUISize('standard')}
        >
          <Text style={{ color: uiSize === 'standard' ? '#fff' : colors.text, fontSize: fontSize.md }}>{t('settings.uiStandard')}</Text>
        </TouchableOpacity>
        {isPro ? (
          <TouchableOpacity
            style={[styles.sizeBtn, { backgroundColor: uiSize === 'large' ? colors.primary : colors.surface, borderRadius: BorderRadius.sm, borderColor: colors.border }]}
            onPress={() => setUISize('large')}
          >
            <Text style={{ color: uiSize === 'large' ? '#fff' : colors.text, fontSize: fontSize.md }}>{t('settings.uiLarge')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.sizeBtn, { backgroundColor: colors.surface, borderRadius: BorderRadius.sm, borderColor: colors.border }]}
            onPress={() => setShowPaywall(true)}
          >
            <Text style={{ color: colors.muted, fontSize: fontSize.md }}>{t('settings.uiLarge')} 🔒</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isPro && (
        <>
          <Text style={sectionTitleStyle}>{t('settings.subscribe')}</Text>
          <TouchableOpacity
            style={[styles.subscribeRow, { backgroundColor: colors.primary, borderRadius: BorderRadius.md }]}
            onPress={() => setShowPaywall(true)}
          >
            <Text style={[styles.subscribeTitle, { fontSize: fontSize.lg }]}>{t('settings.subscribe')}</Text>
            <Text style={[styles.subscribeDesc, { fontSize: fontSize.sm }]}>{t('settings.subscribeDesc')}</Text>
          </TouchableOpacity>
        </>
      )}

      {isPro && (
        <View style={[rowStyle, { marginTop: Spacing.md }]}>
          <Text style={[labelStyle, { color: colors.success }]}>Pro ✓</Text>
        </View>
      )}

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
  sectionTitle: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderTopWidth: 1, borderBottomWidth: 1, marginBottom: 1 },
  label: {},
  sizeBtn: { flex: 1, padding: Spacing.sm, alignItems: 'center', borderWidth: 1, marginHorizontal: 2 },
  subscribeRow: { margin: Spacing.md, padding: Spacing.lg, alignItems: 'center' },
  subscribeTitle: { color: '#fff', fontWeight: '700', marginBottom: 4 },
  subscribeDesc: { color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
});
