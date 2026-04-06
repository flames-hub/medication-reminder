import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useMedicationStore, ScheduledDose } from '../store/medicationStore';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { Spacing, Radius, Shadow, getHeaderColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { getYearMonthString } from '../utils/dateUtils';
import { DayStatus, MealTiming } from '../types';

const TIMING_ICON: Record<MealTiming, { icon: string; color: string }> = {
  before_meal: { icon: 'restaurant-outline', color: '#E8A85C' },
  after_meal: { icon: 'restaurant', color: '#D4935D' },
  between_meals: { icon: 'time-outline', color: '#5CAAAB' },
  before_bed: { icon: 'moon-outline', color: '#8B7EC8' },
  anytime: { icon: 'ellipsis-horizontal', color: '#9CA3AF' },
};

function formatDateLabel(dateStr: string, lang: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (lang.startsWith('ja')) {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${m}月${d}日（${weekdays[date.getDay()]}）`;
  }
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const { colors, fontSize, themeId } = useTheme();
  const { getMonthlyAdherence, getDayDetail, updateDoseLog } = useMedicationStore();
  const header = getHeaderColors(themeId);

  const [currentMonth, setCurrentMonth] = useState(getYearMonthString(new Date()));
  const [dayStatuses, setDayStatuses] = useState<Record<string, DayStatus>>({});
  const [adherence, setAdherence] = useState(100);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDoses, setDayDoses] = useState<ScheduledDose[]>([]);
  const [memos, setMemos] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMonth(currentMonth);
  }, [currentMonth]);

  async function loadMonth(yearMonth: string) {
    const result = await getMonthlyAdherence(yearMonth);
    setDayStatuses(result.dayStatuses);
    setAdherence(result.percent);
  }

  const openDayDetail = useCallback(async (dateStr: string) => {
    setSelectedDate(dateStr);
    const doses = await getDayDetail(dateStr);
    setDayDoses(doses);
    const m: Record<string, string> = {};
    doses.forEach((d) => { if (d.memo) m[d.logId] = d.memo; });
    setMemos(m);
  }, [getDayDetail]);

  async function toggleDoseStatus(dose: ScheduledDose) {
    if (!dose.logId) return;
    if (dose.takenAt) {
      await updateDoseLog(dose.logId, { takenAt: null, skipped: true });
    } else if (dose.skipped) {
      await updateDoseLog(dose.logId, { takenAt: null, skipped: false });
    } else {
      await updateDoseLog(dose.logId, { takenAt: new Date().toISOString(), skipped: false });
    }
    if (selectedDate) {
      const doses = await getDayDetail(selectedDate);
      setDayDoses(doses);
      loadMonth(currentMonth);
    }
  }

  async function saveMemos() {
    setSaving(true);
    for (const dose of dayDoses) {
      if (!dose.logId) continue;
      const memo = memos[dose.logId];
      if (memo !== undefined && memo !== (dose.memo ?? '')) {
        await updateDoseLog(dose.logId, { memo: memo || undefined });
      }
    }
    setSaving(false);
    Alert.alert('', t('history.saved'));
    if (selectedDate) {
      const doses = await getDayDetail(selectedDate);
      setDayDoses(doses);
    }
  }

  function closeModal() {
    setSelectedDate(null);
    setDayDoses([]);
    setMemos({});
  }

  function getStatusIcon(dose: ScheduledDose): { icon: string; color: string; label: string } {
    if (dose.takenAt) return { icon: 'checkmark-circle', color: colors.success, label: t('today.taken') };
    if (dose.skipped) return { icon: 'arrow-redo-circle', color: colors.warning, label: t('today.skipped') };
    return { icon: 'ellipse-outline', color: colors.muted, label: '—' };
  }

  const statusColor: Record<DayStatus, string> = {
    all_taken: colors.success,
    partial: colors.warning,
    all_missed: colors.error,
    none: colors.muted,
  };

  function prevMonth() {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  function nextMonth() {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* フルブリードヘッダー */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: header.bg }}>
        <View style={[styles.headerInner, { backgroundColor: header.bg }]}>
          <View>
            <Text style={{ color: header.text, fontSize: fontSize.sm, opacity: 0.8 }}>
              {t('history.adherenceHint')}
            </Text>
            <Text style={{ color: header.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginTop: 2 }}>
              {t('history.adherence', { percent: adherence })}
            </Text>
          </View>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} hitSlop={12}>
              <Text style={{ color: header.text, fontSize: 22, opacity: 0.8 }}>‹</Text>
            </TouchableOpacity>
            <Text style={{ color: header.text, fontSize: fontSize.sm, fontWeight: '600', marginHorizontal: 8 }}>
              {currentMonth.replace('-', '年') + '月'}
            </Text>
            <TouchableOpacity onPress={nextMonth} hitSlop={12}>
              <Text style={{ color: header.text, fontSize: 22, opacity: 0.8 }}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <View style={{ paddingHorizontal: Spacing.md }}>
        <CalendarHeatmap
          dayStatuses={dayStatuses}
          onDayPress={openDayDetail}
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

      {/* ── Detail Modal ── */}
      <Modal visible={!!selectedDate} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderRadius: Radius.lg }, Shadow.lg]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '700', flex: 1 }}>
                {selectedDate && formatDateLabel(selectedDate, i18n.language)}
              </Text>
              <TouchableOpacity onPress={closeModal} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedDate && dayStatuses[selectedDate] && dayStatuses[selectedDate] !== 'none' && (
              <View style={[styles.dayStatusBadge, { backgroundColor: statusColor[dayStatuses[selectedDate]] + '20' }]}>
                <View style={[styles.legendDot, { backgroundColor: statusColor[dayStatuses[selectedDate]] }]} />
                <Text style={{ color: statusColor[dayStatuses[selectedDate]], fontSize: fontSize.sm, fontWeight: '600', marginLeft: 6 }}>
                  {t(`history.legend.${dayStatuses[selectedDate] === 'all_taken' ? 'allTaken' : dayStatuses[selectedDate] === 'all_missed' ? 'allMissed' : dayStatuses[selectedDate]}`)}
                </Text>
              </View>
            )}

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {dayDoses.length === 0 ? (
                <View style={styles.emptyDetail}>
                  <Ionicons name="calendar-outline" size={32} color={colors.muted} />
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, marginTop: Spacing.sm, textAlign: 'center' }}>
                    {t('history.noSchedule')}
                  </Text>
                </View>
              ) : (
                dayDoses.map((dose) => {
                  const status = getStatusIcon(dose);
                  const timing = dose.medication.mealTiming;
                  return (
                    <TouchableOpacity
                      key={dose.logId || dose.scheduledAt}
                      style={[styles.doseRow, { borderBottomColor: colors.border }]}
                      onPress={() => toggleDoseStatus(dose)}
                      activeOpacity={0.6}
                    >
                      <Ionicons name={status.icon as any} size={24} color={status.color} />
                      <View style={styles.doseInfo}>
                        <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '600' }} numberOfLines={1}>
                          {dose.medication.name}
                        </Text>
                        <View style={styles.doseSubRow}>
                          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                            {dose.time} · {dose.medication.dosage} {dose.medication.unit}
                          </Text>
                          {timing && timing !== 'anytime' && (
                            <View style={[styles.timingMini, { backgroundColor: TIMING_ICON[timing].color + '18' }]}>
                              <Ionicons name={TIMING_ICON[timing].icon as any} size={11} color={TIMING_ICON[timing].color} />
                              <Text style={{ color: TIMING_ICON[timing].color, fontSize: 11, marginLeft: 2 }}>
                                {t(`timing.${timing}`)}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ color: status.color, fontSize: fontSize.xs, marginTop: 2 }}>
                          {status.label}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                    </TouchableOpacity>
                  );
                })
              )}

              {/* Memo section */}
              {dayDoses.length > 0 && (
                <View style={{ marginTop: Spacing.md }}>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '500', marginBottom: Spacing.xs }}>
                    {t('history.memo')}
                  </Text>
                  {dayDoses.map((dose) => (
                    <View key={`memo-${dose.logId || dose.scheduledAt}`} style={{ marginBottom: Spacing.sm }}>
                      <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 2 }}>
                        {dose.medication.name} ({dose.time})
                      </Text>
                      <TextInput
                        style={[styles.memoInput, { backgroundColor: colors.fill, color: colors.text, fontSize: fontSize.sm, borderRadius: Radius.sm }]}
                        value={memos[dose.logId] ?? dose.memo ?? ''}
                        onChangeText={(v) => setMemos((prev) => ({ ...prev, [dose.logId]: v }))}
                        placeholder={t('history.memoPlaceholder')}
                        placeholderTextColor={colors.muted}
                        multiline
                        returnKeyType="done"
                        blurOnSubmit
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Save button */}
            {dayDoses.length > 0 && (
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: Radius.pill }]}
                onPress={saveMemos}
                disabled={saving}
              >
                <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: '600' }}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  monthNav: { flexDirection: 'row', alignItems: 'center', paddingBottom: 4 },
  legend: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: { maxHeight: '85%', paddingTop: Spacing.lg, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  dayStatusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: Spacing.md },
  modalScroll: { maxHeight: 400 },
  emptyDetail: { alignItems: 'center', paddingVertical: Spacing.xl },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  doseInfo: { flex: 1, marginLeft: Spacing.sm },
  doseSubRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  timingMini: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8 },
  memoInput: { paddingHorizontal: Spacing.md, paddingVertical: 8, minHeight: 36 },
  saveBtn: { paddingVertical: 14, alignItems: 'center', marginTop: Spacing.md },
});
