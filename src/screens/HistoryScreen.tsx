import React, { useEffect, useState } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMedicationStore } from '../store/medicationStore';
import { useSettingsStore } from '../store/settingsStore';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { getYearMonthString } from '../utils/dateUtils';
import { DayStatus } from '../types';
import { useColorScheme } from 'react-native';

export function HistoryScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { uiSize } = useSettingsStore();
  const fontSize = FontSize[uiSize];
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
      <View style={[styles.adherenceBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.adherenceText, { color: colors.text, fontSize: fontSize.xl }]}>
          {t('history.adherence', { percent: adherence })}
        </Text>
      </View>
      <CalendarHeatmap
        dayStatuses={dayStatuses}
        onDayPress={(date) => setSelectedDate(date)}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
      />
      <View style={[styles.legend, { backgroundColor: colors.surface }]}>
        {(['all_taken', 'partial', 'all_missed', 'none'] as DayStatus[]).map((status) => (
          <View key={status} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: statusColor[status] }]} />
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
              {t(`history.legend.${status === 'all_taken' ? 'allTaken' : status === 'all_missed' ? 'allMissed' : status}`)}
            </Text>
          </View>
        ))}
      </View>

      <Modal visible={!!selectedDate} animationType="fade" transparent onRequestClose={() => setSelectedDate(null)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setSelectedDate(null)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: BorderRadius.lg }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: fontSize.lg }]}>{selectedDate}</Text>
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
  adherenceBar: { padding: Spacing.md, borderBottomWidth: 1, alignItems: 'center' },
  adherenceText: { fontWeight: '700' },
  legend: { flexDirection: 'row', justifyContent: 'space-around', padding: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: Spacing.lg, minWidth: 200, alignItems: 'center' },
  modalTitle: { fontWeight: '600', marginBottom: Spacing.md },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 20 },
});
