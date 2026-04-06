import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform, Keyboard,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { Medication, MealTiming } from '../types';
import { Spacing, Radius, Shadow } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { getTodayString } from '../utils/dateUtils';
import { MEDICATION_SUGGESTIONS } from '../constants/medications';

type FormData = Omit<Medication, 'id' | 'createdAt'>;

interface Props {
  initial?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const MEAL_TIMINGS: { id: MealTiming; icon: string; iconColor: string }[] = [
  { id: 'before_meal', icon: 'restaurant-outline', iconColor: '#E8A85C' },
  { id: 'after_meal', icon: 'restaurant', iconColor: '#D4935D' },
  { id: 'between_meals', icon: 'time-outline', iconColor: '#5CAAAB' },
  { id: 'before_bed', icon: 'moon-outline', iconColor: '#8B7EC8' },
  { id: 'anytime', icon: 'ellipsis-horizontal', iconColor: '#9CA3AF' },
];

function padTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function MedicationForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useTranslation();
  const { colors, fontSize } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const [name, setName] = useState(initial?.name ?? '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dosage, setDosage] = useState(String(initial?.dosage ?? ''));
  const [unit, setUnit] = useState<Medication['unit']>(initial?.unit ?? 'tablet');
  const [photoUri, setPhotoUri] = useState(initial?.photoUri);
  const [frequency, setFrequency] = useState<Medication['frequency']>(initial?.frequency ?? 'daily');
  const [intervalDays, setIntervalDays] = useState(String(initial?.intervalDays ?? '2'));
  const [weekdays, setWeekdays] = useState<number[]>(initial?.weekdays ?? [1, 2, 3, 4, 5]);
  const [times, setTimes] = useState<string[]>(initial?.times ?? ['08:00']);
  const [mealTiming, setMealTiming] = useState<MealTiming>(initial?.mealTiming ?? 'after_meal');
  const [startDate, setStartDate] = useState(initial?.startDate ?? getTodayString());
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [note, setNote] = useState(initial?.note ?? '');

  // TimePicker state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerIndex, setPickerIndex] = useState(-1); // -1 = adding new
  const [pickerDate, setPickerDate] = useState(new Date());

  const units: Medication['unit'][] = ['mg', 'ml', 'tablet', 'capsule', 'drop', 'other'];
  const frequencies: Medication['frequency'][] = ['daily', 'weekly', 'interval'];

  const suggestions = useMemo(() => {
    if (!name.trim() || name.length < 1) return [];
    const q = name.toLowerCase();
    return MEDICATION_SUGGESTIONS.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6);
  }, [name]);

  function selectSuggestion(s: typeof MEDICATION_SUGGESTIONS[0]) {
    setName(s.name);
    setUnit(s.unit);
    setShowSuggestions(false);
    Keyboard.dismiss();
  }

  function openTimePicker(index: number) {
    if (index >= 0) {
      const [h, m] = times[index].split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      setPickerDate(d);
    } else {
      // new time: default to next hour from last
      const last = times[times.length - 1];
      const [h] = last.split(':').map(Number);
      const d = new Date();
      d.setHours(Math.min(h + 4, 23), 0, 0, 0);
      setPickerDate(d);
    }
    setPickerIndex(index);
    setPickerVisible(true);
    // Scroll down so picker + confirm button are easily reachable
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  function onPickerChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setPickerVisible(false);
      if (event.type === 'dismissed' || !date) return;
      // Android: picker closes immediately, so save the time directly
      const timeStr = padTime(date.getHours(), date.getMinutes());
      if (pickerIndex >= 0) {
        const updated = [...times];
        updated[pickerIndex] = timeStr;
        setTimes(updated.sort());
      } else {
        setTimes([...times, timeStr].sort());
      }
      return;
    }
    if (date) setPickerDate(date);
  }

  function confirmTimePicker() {
    const timeStr = padTime(pickerDate.getHours(), pickerDate.getMinutes());
    if (pickerIndex >= 0) {
      const updated = [...times];
      updated[pickerIndex] = timeStr;
      setTimes(updated.sort());
    } else {
      setTimes([...times, timeStr].sort());
    }
    setPickerVisible(false);
  }

  function removeTime(index: number) {
    if (times.length === 1) return;
    setTimes(times.filter((_, i) => i !== index));
  }

  function toggleWeekday(day: number) {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  function handleSubmit() {
    if (!name.trim()) {
      Alert.alert(t('form.error'), t('form.nameRequired'));
      return;
    }
    const dosageNum = parseFloat(dosage);
    if (isNaN(dosageNum) || dosageNum <= 0) {
      Alert.alert(t('form.error'), t('form.dosageRequired'));
      return;
    }
    if (times.length === 0) {
      Alert.alert(t('form.error'), t('form.timeRequired'));
      return;
    }
    onSubmit({
      name: name.trim(),
      dosage: dosageNum,
      unit,
      photoUri,
      frequency,
      intervalDays: frequency === 'interval' ? parseInt(intervalDays, 10) : undefined,
      weekdays: frequency === 'weekly' ? weekdays : undefined,
      times,
      mealTiming,
      startDate,
      endDate: endDate || undefined,
      note: note.trim() || undefined,
    });
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.fill, color: colors.text, fontSize: fontSize.md, borderRadius: Radius.sm },
  ];
  const labelStyle = { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '500' as const, marginTop: Spacing.md, marginBottom: Spacing.xs };

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
    >
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: Spacing.md, lineHeight: 20 }}>
        {t('form.hint')}
      </Text>

      {/* ── 薬名 ── */}
      <Text style={labelStyle}>{t('medication.name')}</Text>
      <TextInput
        style={inputStyle}
        value={name}
        onChangeText={(v) => { setName(v); setShowSuggestions(true); }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={t('form.namePlaceholder')}
        placeholderTextColor={colors.muted}
        accessibilityLabel={t('medication.name')}
      />
      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.suggestBox, { backgroundColor: colors.surface, borderRadius: Radius.md }, Shadow.md]}>
          {suggestions.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.suggestItem, i < suggestions.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
              onPress={() => selectSuggestion(s)}
            >
              <Ionicons name="medical-outline" size={16} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: fontSize.md, marginLeft: Spacing.sm, flex: 1 }}>{s.name}</Text>
              <Text style={{ color: colors.muted, fontSize: fontSize.sm }}>{t(`medication.units.${s.unit}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── 用量 ── */}
      <Text style={labelStyle}>{t('medication.dosage')}</Text>
      <View style={styles.row}>
        <TextInput
          style={[inputStyle, { flex: 1, marginRight: Spacing.sm }]}
          value={dosage}
          onChangeText={setDosage}
          keyboardType="numeric"
          placeholder="1"
          placeholderTextColor={colors.muted}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
        <View style={styles.chips}>
          {units.map((u) => (
            <TouchableOpacity
              key={u} onPress={() => setUnit(u)}
              style={[styles.chip, { backgroundColor: unit === u ? colors.primary : colors.fill, borderRadius: Radius.pill }]}
            >
              <Text style={{ color: unit === u ? '#fff' : colors.text, fontSize: fontSize.sm }}>
                {t(`medication.units.${u}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── タイミング ── */}
      <Text style={labelStyle}>{t('medication.mealTiming')}</Text>
      <View style={styles.timingRow}>
        {MEAL_TIMINGS.map((mt) => {
          const selected = mealTiming === mt.id;
          return (
            <TouchableOpacity
              key={mt.id}
              onPress={() => setMealTiming(mt.id)}
              style={[styles.timingBtn, { backgroundColor: selected ? colors.primaryMuted : colors.fill, borderColor: selected ? colors.primary : 'transparent', borderWidth: selected ? 1.5 : 0, borderRadius: Radius.md }]}
            >
              <Ionicons name={mt.icon as any} size={20} color={selected ? colors.primary : mt.iconColor} />
              <Text style={{ color: selected ? colors.primary : colors.text, fontSize: fontSize.xs, marginTop: 3, fontWeight: selected ? '600' : '400' }}>
                {t(`timing.${mt.id}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── 頻度 ── */}
      <Text style={labelStyle}>{t('medication.frequency')}</Text>
      <View style={[styles.segmented, { backgroundColor: colors.fill, borderRadius: Radius.sm }]}>
        {frequencies.map((f) => (
          <TouchableOpacity
            key={f} onPress={() => setFrequency(f)}
            style={[styles.segment, { backgroundColor: frequency === f ? colors.primary : 'transparent', borderRadius: Radius.sm }]}
          >
            <Text style={{ color: frequency === f ? '#fff' : colors.text, fontSize: fontSize.sm, fontWeight: '500' }}>
              {t(`medication.${f}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {frequency === 'interval' && (
        <>
          <Text style={labelStyle}>{t('medication.intervalDays', { count: parseInt(intervalDays) || 2 })}</Text>
          <TextInput style={inputStyle} value={intervalDays} onChangeText={setIntervalDays} keyboardType="numeric" />
        </>
      )}

      {frequency === 'weekly' && (
        <View style={[styles.row, { marginTop: Spacing.sm }]}>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <TouchableOpacity
              key={day} onPress={() => toggleWeekday(day)}
              style={[styles.dayBtn, { backgroundColor: weekdays.includes(day) ? colors.primary : colors.fill }]}
            >
              <Text style={{ color: weekdays.includes(day) ? '#fff' : colors.text, fontSize: fontSize.sm }}>
                {t(`medication.weekdays.${day}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── 時間 ── */}
      <Text style={labelStyle}>{t('medication.times')}</Text>
      <Text style={{ color: colors.muted, fontSize: fontSize.xs, marginBottom: Spacing.xs }}>{t('form.timeHint')}</Text>
      {times.map((time, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.timeRow, { backgroundColor: colors.fill, borderRadius: Radius.sm }]}
          onPress={() => openTimePicker(index)}
          activeOpacity={0.6}
        >
          <Ionicons name="time-outline" size={18} color={colors.primary} />
          <Text style={{ color: colors.text, fontSize: fontSize.md, flex: 1, marginLeft: Spacing.sm, fontWeight: '500' }}>{time}</Text>
          {times.length > 1 && (
            <TouchableOpacity onPress={() => removeTime(index)} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={() => openTimePicker(-1)} style={[styles.addTimeBtn, { borderColor: colors.primary, borderRadius: Radius.sm }]}>
        <Ionicons name="add" size={18} color={colors.primary} />
        <Text style={{ color: colors.primary, fontSize: fontSize.md, marginLeft: 4 }}>{t('medication.addTime')}</Text>
      </TouchableOpacity>

      {/* TimePicker */}
      {pickerVisible && (
        <View style={[styles.pickerWrap, { backgroundColor: colors.surface, borderRadius: Radius.lg }, Shadow.lg]}>
          <DateTimePicker
            value={pickerDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onPickerChange}
            minuteInterval={5}
            textColor={colors.text}
            themeVariant="light"
          />
          {Platform.OS === 'ios' && (
            <View style={styles.pickerButtons}>
              <TouchableOpacity onPress={() => setPickerVisible(false)} style={styles.pickerBtn}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.md }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmTimePicker} style={styles.pickerBtn}>
                <Text style={{ color: colors.primary, fontSize: fontSize.md, fontWeight: '600' }}>{t('common.done')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ── メモ ── */}
      <Text style={labelStyle}>{t('medication.note')}</Text>
      <TextInput
        style={[inputStyle, { minHeight: 60, textAlignVertical: 'top' }]}
        value={note}
        onChangeText={setNote}
        multiline
        placeholder={t('medication.note')}
        placeholderTextColor={colors.muted}
        returnKeyType="done"
        blurOnSubmit
        onSubmitEditing={Keyboard.dismiss}
      />

      {/* ── ボタン ── */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.cancelBtn, { backgroundColor: colors.fill, borderRadius: Radius.pill }]}
          onPress={onCancel}
        >
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.md }}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: Radius.lg }]}
          onPress={handleSubmit}
        >
          <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: '600' }}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  input: { paddingHorizontal: Spacing.md, paddingVertical: 10, marginBottom: Spacing.xs },
  suggestBox: { marginBottom: Spacing.sm, marginTop: -Spacing.xs },
  suggestItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: Spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 6 },
  timingRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.sm },
  timingBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: 2 },
  segmented: { flexDirection: 'row', padding: 3, marginBottom: Spacing.xs },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  dayBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  timeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 12, marginBottom: 4 },
  addTimeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', paddingVertical: Spacing.sm, marginBottom: Spacing.xs },
  pickerWrap: { padding: Spacing.md, marginBottom: Spacing.md },
  pickerButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  pickerBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  buttons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
});
