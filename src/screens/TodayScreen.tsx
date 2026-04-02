import React, { useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMedicationStore } from '../store/medicationStore';
import { useSettingsStore } from '../store/settingsStore';
import { ProgressRing } from '../components/ProgressRing';
import { DoseCard } from '../components/DoseCard';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { useColorScheme } from 'react-native';

export function TodayScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { uiSize } = useSettingsStore();
  const fontSize = FontSize[uiSize];
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
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ProgressRing done={stats.done} total={stats.total} />
        <Text style={[styles.progressText, { color: colors.textSecondary, fontSize: fontSize.md, marginTop: Spacing.sm }]}>
          {t('today.progress', { done: stats.done, total: stats.total })}
        </Text>
        {allDone && (
          <Text style={[styles.allDoneText, { color: colors.success, fontSize: fontSize.lg }]}>
            🎉 {t('today.allDone')}
          </Text>
        )}
      </View>
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
          <Text style={[styles.empty, { color: colors.muted, fontSize: fontSize.md }]}>
            {t('today.allDone')}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center' },
  header: { alignItems: 'center', paddingVertical: Spacing.lg, borderBottomWidth: 1 },
  progressText: { marginTop: Spacing.xs },
  allDoneText: { marginTop: Spacing.sm, fontWeight: '600' },
  list: { padding: Spacing.md },
  empty: { textAlign: 'center', marginTop: Spacing.xl },
});
