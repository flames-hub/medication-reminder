import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMedicationStore } from '../store/medicationStore';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { Card } from '../components/GlassCard';
import { Spacing, Radius, Shadow } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { getYearMonthString } from '../utils/dateUtils';
import { DayStatus } from '../types';

export function HistoryScreen() {
  const { t } = useTranslation();
  const { colors, fontSize } = useTheme();
  const { getMonthlyAdherence } = useMedicationStore();

  const [currentMonth, setCurrentMonth] = useState(getYearMonthString(new Date()));
  const [dayStatuses, setDayStatuses] = useState<Record<string, DayStatus>>({});
  const [adherence, setAdherence] = useState(100);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadMonth(currentMonth);
  }, [currentMonth]);

  async function loadMonth(yearMonth: string) {
    const result = await getMonthlyAdherence(yearMonth);
    setDayStatuses(result.dayStatuses);
    setAdherence(result.percent);
  }

  const statusColor: Record<DayStatus, string> = {
    all_taken: colors.success,
    partial: colors.warning,
    all_missed: colors.error,
    none: colors.muted,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.adherenceCard}>
        <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '700' }}>
          {t('history.adherence', { percent: adherence })}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: Spacing.xs }}>
          {t('history.adherenceHint')}
        </Text>
      </Card>

      <View style={{ paddingHorizontal: Spacing.md }}>
        <CalendarHeatmap
          dayStatuses={dayStatuses}
          onDayPress={(date) => setSelectedDate(date)}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      </View>

      <View style={styles.legend}>
        {(['all_taken', 'partial', 'all_missed', 'none'] as DayStatus[]).map((status) => (
          <View key={status} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: statusColor[status] }]} />
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
              {t(`history.legend.${status === 'all_taken' ? 'allTaken' : status === 'all_missed' ? 'allMissed' : status}`)}
            </Text>
          </View>
        ))}
      </View>

      <Text style={{ color: colors.muted, fontSize: fontSize.sm, textAlign: 'center', paddingHorizontal: Spacing.lg }}>
        {t('history.tapHint')}
      </Text>

      <Modal visible={!!selectedDate} animationType="fade" transparent onRequestClose={() => setSelectedDate(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedDate(null)}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderRadius: Radius.lg }, Shadow.lg]}>
            <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginBottom: Spacing.md }}>
              {selectedDate}
            </Text>
            {selectedDate && (
              <View style={[styles.statusBadge, { backgroundColor: statusColor[dayStatuses[selectedDate] ?? 'none'] }]}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: fontSize.md }}>
                  {t(`history.legend.${dayStatuses[selectedDate] === 'all_taken' ? 'allTaken' : dayStatuses[selectedDate] === 'all_missed' ? 'allMissed' : dayStatuses[selectedDate] ?? 'none'}`)}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  adherenceCard: { padding: Spacing.md, margin: Spacing.md, alignItems: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { padding: Spacing.lg, minWidth: 220, alignItems: 'center' },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill },
});
