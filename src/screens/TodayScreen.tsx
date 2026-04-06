import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useMedicationStore } from '../store/medicationStore';
import { DoseRow } from '../components/DoseRow';
import { ProgressRing } from '../components/ProgressRing';
import { Spacing, getHeaderColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

function formatDate(lang: string): string {
  const now = new Date();
  if (lang.startsWith('ja')) {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${now.getMonth() + 1}月${now.getDate()}日（${weekdays[now.getDay()]}）`;
  }
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getGreeting(t: (key: string) => string): string {
  const h = new Date().getHours();
  if (h < 12) return t('today.greetMorning');
  if (h < 18) return t('today.greetAfternoon');
  return t('today.greetEvening');
}

function getTimePeriodLabel(time: string, lang: string): string {
  const h = parseInt(time.split(':')[0], 10);
  if (lang.startsWith('ja')) {
    if (h < 10) return `朝 · ${time}`;
    if (h < 14) return `昼 · ${time}`;
    if (h < 18) return `夕 · ${time}`;
    return `夜 · ${time}`;
  }
  if (h < 10) return `Morning · ${time}`;
  if (h < 14) return `Noon · ${time}`;
  if (h < 18) return `Afternoon · ${time}`;
  return `Evening · ${time}`;
}

type ScheduleItem = ReturnType<typeof useMedicationStore.getState>['todaySchedule'][0];
type TimeGroup = { time: string; items: ScheduleItem[] };

type FlatItem =
  | { type: 'group-header'; time: string }
  | { type: 'dose'; item: ScheduleItem; isLast: boolean }
  | { type: 'group-gap' };

export function TodayScreen() {
  const { t, i18n } = useTranslation();
  const { colors, fontSize, themeId } = useTheme();
  const { todaySchedule, isLoading, loadTodaySchedule, takeDose, skipDose, getTodayStats } = useMedicationStore();
  const stats = getTodayStats();
  const header = getHeaderColors(themeId);

  useEffect(() => { loadTodaySchedule(); }, []);

  const timeGroups = useMemo((): TimeGroup[] => {
    const sorted = [...todaySchedule].sort((a, b) => {
      const aDone = a.takenAt || a.skipped ? 1 : 0;
      const bDone = b.takenAt || b.skipped ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      return a.time.localeCompare(b.time);
    });
    const map = new Map<string, ScheduleItem[]>();
    sorted.forEach((item) => {
      if (!map.has(item.time)) map.set(item.time, []);
      map.get(item.time)!.push(item);
    });
    return Array.from(map.entries()).map(([time, items]) => ({ time, items }));
  }, [todaySchedule]);

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} color={colors.primary} />;
  }

  const remaining = stats.total - stats.done;
  const skippedCount = todaySchedule.filter((d) => d.skipped && !d.takenAt).length;
  const allDone = stats.total > 0 && stats.done === stats.total;

  const flatData: FlatItem[] = [];
  timeGroups.forEach((group, gi) => {
    flatData.push({ type: 'group-header', time: group.time });
    group.items.forEach((item, ii) => {
      flatData.push({ type: 'dose', item, isLast: ii === group.items.length - 1 });
    });
    if (gi < timeGroups.length - 1) flatData.push({ type: 'group-gap' });
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* フルブリードヘッダー */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: header.bg }}>
        <View style={[styles.header, { backgroundColor: header.bg }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={{ color: header.text, fontSize: fontSize.sm, opacity: 0.8 }}>
                {getGreeting(t)}
              </Text>
              <Text style={{ color: header.text, fontSize: fontSize.xl, fontWeight: '700', letterSpacing: -0.5, marginTop: 2 }}>
                {formatDate(i18n.language)}
              </Text>
            </View>
            <ProgressRing done={stats.done} total={stats.total} size={56} strokeWidth={3} inverted={themeId !== 'dark'} compact />
          </View>
          <View style={styles.tagRow}>
            {allDone ? (
              <View style={[styles.tag, { backgroundColor: header.tagBg }]}>
                <Text style={{ color: header.tagText, fontSize: fontSize.xs, fontWeight: '600' }}>
                  {t('today.allDone')} ✓
                </Text>
              </View>
            ) : (
              <>
                {remaining > 0 && (
                  <View style={[styles.tag, { backgroundColor: header.tagBg }]}>
                    <Text style={{ color: header.tagText, fontSize: fontSize.xs, fontWeight: '600' }}>
                      {t('today.remaining', { count: remaining })}
                    </Text>
                  </View>
                )}
                {stats.done > 0 && (
                  <View style={[styles.tag, { backgroundColor: header.tagBg }]}>
                    <Text style={{ color: header.tagText, fontSize: fontSize.xs, fontWeight: '600' }}>
                      ✓ {t('today.doneCount', { count: stats.done })}
                    </Text>
                  </View>
                )}
                {skippedCount > 0 && (
                  <View style={[styles.tag, { backgroundColor: header.tagBg }]}>
                    <Text style={{ color: header.tagText, fontSize: fontSize.xs, fontWeight: '600' }}>
                      {t('today.skippedCount', { count: skippedCount })}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* スケジュールリスト */}
      <FlatList
        data={flatData}
        keyExtractor={(item, i) => `${item.type}-${i}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (item.type === 'group-header') {
            return (
              <Text style={[styles.sectionHeader, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                {getTimePeriodLabel(item.time, i18n.language)}
              </Text>
            );
          }
          if (item.type === 'group-gap') {
            return <View style={[styles.gap, { backgroundColor: colors.background }]} />;
          }
          return (
            <View style={{ backgroundColor: colors.surface }}>
              <DoseRow
                logId={item.item.logId}
                medicationName={item.item.medication.name}
                dosage={item.item.medication.dosage}
                unit={item.item.medication.unit}
                scheduledTime={item.item.time}
                mealTiming={item.item.medication.mealTiming}
                takenAt={item.item.takenAt}
                skipped={item.item.skipped}
                isLast={item.isLast}
                onTake={takeDose}
                onSkip={skipDose}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 36 }}>☀️</Text>
            <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginTop: Spacing.sm }}>
              {t('today.empty')}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, textAlign: 'center', marginTop: Spacing.xs }}>
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
  loader: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft: { flex: 1 },
  tagRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
  list: { paddingBottom: 24 },
  sectionHeader: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  gap: { height: 8 },
  emptyWrap: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
});
