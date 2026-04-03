import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Spacing, Radius, Shadow } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  onRestore: () => void;
  price?: string;
}

const FEATURE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  feature1: 'infinite',
  feature2: 'document-text-outline',
  feature3: 'download-outline',
  feature4: 'grid-outline',
  feature5: 'text-outline',
};

export function PaywallModal({ visible, onClose, onSubscribe, onRestore, price = '¥200' }: Props) {
  const { t } = useTranslation();
  const { colors, fontSize } = useTheme();

  const features = ['feature1', 'feature2', 'feature3', 'feature4', 'feature5'] as const;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel={t('common.cancel')} accessibilityRole="button">
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={{ color: colors.text, fontSize: fontSize.xxl, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.sm }}>
            {t('paywall.title')}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center', marginBottom: Spacing.lg }}>
            {t('paywall.description')}
          </Text>
          <View style={[styles.featureList, { backgroundColor: colors.surface, borderRadius: Radius.lg }, Shadow.sm]}>
            {features.map((key, i) => (
              <View key={key} style={[styles.featureRow, i < features.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <Ionicons name={FEATURE_ICONS[key]} size={20} color={colors.primary} style={{ width: 28 }} />
                <Text style={{ color: colors.text, fontSize: fontSize.md, flex: 1 }}>{t(`paywall.${key}`)}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.subscribeBtn, { backgroundColor: colors.primary }]}
            onPress={onSubscribe}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={{ color: '#fff', fontSize: fontSize.lg, fontWeight: '700' }}>
              {t('paywall.purchase', { price })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restoreBtn} onPress={onRestore} accessibilityRole="button">
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.md }}>
              {t('paywall.restore')}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: colors.muted, fontSize: fontSize.sm, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 18 }}>
            {t('paywall.terms')}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: { alignSelf: 'flex-end', padding: Spacing.md },
  content: { padding: Spacing.lg, alignItems: 'center' },
  featureList: { width: '100%', marginBottom: Spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  subscribeBtn: {
    width: '100%', paddingVertical: 14, alignItems: 'center',
    borderRadius: Radius.pill, marginBottom: Spacing.md,
  },
  restoreBtn: { paddingVertical: Spacing.sm },
});
