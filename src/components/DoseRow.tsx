import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MealTiming } from '../types';
import { Spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface Props {
  logId: string;
  medicationName: string;
  dosage: number;
  unit: string;
  scheduledTime: string;
  mealTiming?: MealTiming;
  takenAt?: string;
  skipped: boolean;
  isLast?: boolean;
  onTake: (logId: string) => void;
  onSkip: (logId: string) => void;
}

export function DoseRow({
  logId, medicationName, dosage, unit, scheduledTime,
  takenAt, skipped, isLast, onTake, onSkip,
}: Props) {
  const { t } = useTranslation();
  const { colors, fontSize } = useTheme();

  const isTaken = !!takenAt;
  const isDone = isTaken || skipped;

  function handleLongPress() {
    if (isDone) return;
    Alert.alert(
      medicationName,
      undefined,
      [
        { text: t('today.skip'), style: 'destructive', onPress: () => onSkip(logId) },
        { text: t('common.cancel'), style: 'cancel' },
      ],
    );
  }

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      activeOpacity={isDone ? 1 : 0.6}
      accessibilityRole="button"
      accessibilityLabel={`${medicationName} ${scheduledTime}`}
      style={[
        styles.row,
        { borderBottomColor: colors.border, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth },
        isDone && styles.rowDone,
      ]}
    >
      {/* 状態ドット */}
      <View style={[styles.dot, { backgroundColor: isDone ? colors.muted : colors.primary }]} />

      {/* 薬名 + 用量 */}
      <View style={styles.info}>
        <Text
          style={{ color: isDone ? colors.muted : colors.text, fontSize: fontSize.md, fontWeight: '600',
            textDecorationLine: isDone ? 'line-through' : 'none' }}
          numberOfLines={1}
        >
          {medicationName}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
          {dosage} {unit}
        </Text>
      </View>

      {/* 時刻 */}
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginRight: Spacing.sm }}>
        {scheduledTime}
      </Text>

      {/* アクション */}
      {isTaken ? (
        <View style={[styles.statusBadge, { backgroundColor: colors.successMuted }]}>
          <Text style={{ color: colors.success, fontSize: fontSize.xs, fontWeight: '700' }}>✓</Text>
        </View>
      ) : skipped ? (
        <View style={[styles.statusBadge, { backgroundColor: colors.warningMuted }]}>
          <Text style={{ color: colors.warning, fontSize: fontSize.xs, fontWeight: '700' }}>Skip</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.takeBtn, { backgroundColor: colors.primary }]}
          onPress={() => onTake(logId)}
          activeOpacity={0.75}
          accessibilityLabel={`${medicationName} ${t('today.take')}`}
          accessibilityRole="button"
        >
          <Text style={{ color: '#fff', fontSize: fontSize.xs, fontWeight: '700' }}>
            {t('today.take')}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
  },
  rowDone: { opacity: 0.45 },
  dot: { width: 9, height: 9, borderRadius: 99, flexShrink: 0 },
  info: { flex: 1 },
  takeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    flexShrink: 0,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    flexShrink: 0,
  },
});
