import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import { useColorScheme } from 'react-native';

interface Props {
  logId: string;
  medicationName: string;
  dosage: number;
  unit: string;
  photoUri?: string;
  scheduledTime: string;
  takenAt?: string;
  skipped: boolean;
  onTake: (logId: string) => void;
  onSkip: (logId: string) => void;
}

export function DoseCard({ logId, medicationName, dosage, unit, photoUri, scheduledTime, takenAt, skipped, onTake, onSkip }: Props) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { uiSize } = useSettingsStore();
  const fontSize = FontSize[uiSize];

  const isTaken = !!takenAt;
  const isDone = isTaken || skipped;

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: isTaken ? colors.successLight : colors.surface,
        borderColor: isTaken ? colors.success : colors.border,
        borderRadius: BorderRadius.md,
      }
    ]}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.photo} />
      ) : (
        <View style={[styles.photoPlaceholder, { backgroundColor: colors.primaryLight }]} />
      )}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text, fontSize: fontSize.lg }]} numberOfLines={1}>
          {medicationName}
        </Text>
        <Text style={[styles.dosage, { color: colors.textSecondary, fontSize: fontSize.md }]}>
          {dosage} {unit} · {scheduledTime}
        </Text>
        {isTaken && (
          <Text style={[styles.takenLabel, { color: colors.success, fontSize: fontSize.sm }]}>
            ✓ {t('today.taken')}
          </Text>
        )}
        {skipped && !isTaken && (
          <Text style={[styles.takenLabel, { color: colors.muted, fontSize: fontSize.sm }]}>
            — {t('today.skip')}
          </Text>
        )}
      </View>
      {!isDone && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.takeBtn, { backgroundColor: colors.primary, borderRadius: BorderRadius.sm }]}
            onPress={() => onTake(logId)}
          >
            <Text style={[styles.takeBtnText, { fontSize: fontSize.md }]}>{t('today.take')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.skipBtn, { borderRadius: BorderRadius.sm, borderColor: colors.border }]}
            onPress={() => onSkip(logId)}
          >
            <Text style={[styles.skipBtnText, { color: colors.textSecondary, fontSize: fontSize.sm }]}>{t('today.skip')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  photo: { width: 48, height: 48, borderRadius: 8, marginRight: Spacing.md },
  photoPlaceholder: { width: 48, height: 48, borderRadius: 8, marginRight: Spacing.md },
  info: { flex: 1 },
  name: { fontWeight: '600', marginBottom: 2 },
  dosage: { marginBottom: 2 },
  takenLabel: { fontWeight: '500' },
  actions: { alignItems: 'flex-end', gap: 4 },
  takeBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  takeBtnText: { color: '#fff', fontWeight: '600' },
  skipBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderWidth: 1 },
  skipBtnText: {},
});
