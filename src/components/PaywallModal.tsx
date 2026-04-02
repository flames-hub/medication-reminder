import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import { useColorScheme } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  onRestore: () => void;
  price?: string;
}

export function PaywallModal({ visible, onClose, onSubscribe, onRestore, price = '¥200' }: Props) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { uiSize } = useSettingsStore();
  const fontSize = FontSize[uiSize];

  const features = ['feature1', 'feature2', 'feature3', 'feature4', 'feature5'] as const;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.lg }}>✕</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: colors.text, fontSize: fontSize.xxl }]}>
            {t('paywall.title')}
          </Text>
          <View style={[styles.featureList, { backgroundColor: colors.surface, borderRadius: BorderRadius.lg }]}>
            {features.map((key) => (
              <View key={key} style={styles.featureRow}>
                <Text style={{ color: colors.success, fontSize: fontSize.md, marginRight: Spacing.sm }}>✓</Text>
                <Text style={{ color: colors.text, fontSize: fontSize.md }}>{t(`paywall.${key}`)}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.subscribeBtn, { backgroundColor: colors.primary, borderRadius: BorderRadius.lg }]}
            onPress={onSubscribe}
          >
            <Text style={[styles.subscribeBtnText, { fontSize: fontSize.lg }]}>
              {t('paywall.purchase', { price })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restoreBtn} onPress={onRestore}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.md }}>
              {t('paywall.restore')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: { alignSelf: 'flex-end', padding: Spacing.md },
  content: { padding: Spacing.lg, alignItems: 'center' },
  title: { fontWeight: '700', marginBottom: Spacing.lg, textAlign: 'center' },
  featureList: { width: '100%', padding: Spacing.md, marginBottom: Spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  subscribeBtn: { width: '100%', paddingVertical: Spacing.md, alignItems: 'center', marginBottom: Spacing.md },
  subscribeBtnText: { color: '#fff', fontWeight: '700' },
  restoreBtn: { paddingVertical: Spacing.sm },
});
