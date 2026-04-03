import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Spacing, Radius } from '../constants/theme';
import { Card } from './GlassCard';
import { useTheme } from '../hooks/useTheme';

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
  const { colors, fontSize } = useTheme();

  const isTaken = !!takenAt;
  const isDone = isTaken || skipped;

  return (
    <Card style={{ padding: Spacing.md, marginBottom: Spacing.sm }}>
      <View style={styles.row}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="medical" size={20} color={colors.primary} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }} numberOfLines={1}>
            {medicationName}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
            {dosage} {unit} · {scheduledTime}
          </Text>
          {isTaken && (
            <Text style={{ color: colors.success, fontSize: fontSize.sm, fontWeight: '500', marginTop: 2 }}>
              {t('today.taken')}
            </Text>
          )}
          {skipped && !isTaken && (
            <Text style={{ color: colors.muted, fontSize: fontSize.sm, marginTop: 2 }}>
              {t('today.skipped')}
            </Text>
          )}
        </View>
        {!isDone && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.takeBtn, { backgroundColor: colors.primary }]}
              onPress={() => onTake(logId)}
              activeOpacity={0.7}
              accessibilityLabel={`${medicationName} ${t('today.take')}`}
              accessibilityRole="button"
            >
              <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: '600' }}>{t('today.take')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSkip(logId)} activeOpacity={0.6} accessibilityRole="button">
              <Text style={{ color: colors.muted, fontSize: fontSize.sm }}>{t('today.skip')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  photo: { width: 44, height: 44, borderRadius: 10, marginRight: Spacing.md },
  iconWrap: {
    width: 44, height: 44, borderRadius: 10, marginRight: Spacing.md,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  actions: { alignItems: 'flex-end', gap: 8 },
  takeBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
});
