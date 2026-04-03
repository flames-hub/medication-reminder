import React, { useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMedicationStore } from '../store/medicationStore';
import { ProgressRing } from '../components/ProgressRing';
import { DoseCard } from '../components/DoseCard';
import { Spacing, Shadow } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

export function TodayScreen() {
  const { t } = useTranslation();
  const { colors, fontSize } = useTheme();
  const { todaySchedule, isLoading, loadTodaySchedule, takeDose, skipDose, getTodayStats } = useMedicationStore();
  const stats = getTodayStats();

  useEffect(() => {
    loadTodaySchedule();
  }, []);

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} color={colors.primary} />;
  }

  const allDone = stats.total > 0 && stats.done === stats.total;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }, Shadow.sm]}>
        <ProgressRing done={stats.done} total={stats.total} />
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, marginTop: Spacing.sm }}>
          {t('today.progress', { done: stats.done, total: stats.total })}
        </Text>
        {allDone && (
          <Text style={{ color: colors.success, fontSize: fontSize.lg, fontWeight: '600', marginTop: Spacing.xs }}>
            {t('today.allDone')}
          </Text>
        )}
      </View>
      {stats.total > 0 && !allDone && (
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, paddingHorizontal: Spacing.md, paddingTop: Spacing.md }}>
          {t('today.instruction')}
        </Text>
      )}
      <FlatList
        data={todaySchedule}
        keyExtractor={(item) => item.logId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <DoseCard
            logId={item.logId}
            medicationName={item.medication.name}
            dosage={item.medication.dosage}
            unit={item.medication.unit}
            photoUri={item.medication.photoUri}
            scheduledTime={item.time}
            takenAt={item.takenAt}
            skipped={item.skipped}
            onTake={takeDose}
            onSkip={skipDose}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={{ color: colors.muted, fontSize: fontSize.md, textAlign: 'center' }}>
              {t('today.empty')}
            </Text>
            <Text style={{ color: colors.muted, fontSize: fontSize.sm, textAlign: 'center', marginTop: Spacing.xs }}>
              {t('today.emptyHint')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center' },
  header: { alignItems: 'center', paddingVertical: Spacing.lg },
  list: { padding: Spacing.md },
  emptyWrap: { marginTop: Spacing.xl * 2, paddingHorizontal: Spacing.lg },
});
