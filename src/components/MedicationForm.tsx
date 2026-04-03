import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { Medication } from '../types';
import { Spacing, Radius } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { getTodayString } from '../utils/dateUtils';

type FormData = Omit<Medication, 'id' | 'createdAt'>;

interface Props {
  initial?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export function MedicationForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useTranslation();
  const { colors, fontSize } = useTheme();

  const [name, setName] = useState(initial?.name ?? '');
  const [dosage, setDosage] = useState(String(initial?.dosage ?? ''));
  const [unit, setUnit] = useState<Medication['unit']>(initial?.unit ?? 'tablet');
  const [photoUri, setPhotoUri] = useState(initial?.photoUri);
  const [frequency, setFrequency] = useState<Medication['frequency']>(initial?.frequency ?? 'daily');
  const [intervalDays, setIntervalDays] = useState(String(initial?.intervalDays ?? '2'));
  const [weekdays, setWeekdays] = useState<number[]>(initial?.weekdays ?? [1, 2, 3, 4, 5]);
  const [times, setTimes] = useState<string[]>(initial?.times ?? ['08:00']);
  const [startDate, setStartDate] = useState(initial?.startDate ?? getTodayString());
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [note, setNote] = useState(initial?.note ?? '');

  const units: Medication['unit'][] = ['mg', 'ml', 'tablet', 'capsule', 'drop', 'other'];
  const frequencies: Medication['frequency'][] = ['daily', 'weekly', 'interval'];

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  function addTime() {
    setTimes([...times, '12:00']);
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: Spacing.md, lineHeight: 18 }}>
        {t('form.hint')}
      </Text>

      <Text style={labelStyle}>{t('medication.name')}</Text>
      <TextInput style={inputStyle} value={name} onChangeText={setName} placeholder={t('form.namePlaceholder')} placeholderTextColor={colors.muted} accessibilityLabel={t('medication.name')} />

      <Text style={labelStyle}>{t('medication.dosage')}</Text>
      <View style={styles.row}>
        <TextInput style={[inputStyle, { flex: 1, marginRight: Spacing.sm }]} value={dosage} onChangeText={setDosage} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.muted} accessibilityLabel={t('medication.dosage')} />
        <View style={styles.chips}>
          {units.map((u) => (
            <TouchableOpacity
              key={u} onPress={() => setUnit(u)}
              style={[styles.chip, { backgroundColor: unit === u ? colors.primary : colors.fill, borderRadius: Radius.pill }]}
              accessibilityRole="radio" accessibilityState={{ selected: unit === u }}
            >
              <Text style={{ color: unit === u ? '#fff' : colors.text, fontSize: fontSize.sm }}>
                {t(`medication.units.${u}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={labelStyle}>{t('medication.frequency')}</Text>
      <Text style={{ color: colors.muted, fontSize: fontSize.sm, marginBottom: Spacing.xs }}>{t('form.frequencyHint')}</Text>
      <View style={[styles.segmented, { backgroundColor: colors.fill, borderRadius: Radius.sm }]}>
        {frequencies.map((f) => (
          <TouchableOpacity
            key={f} onPress={() => setFrequency(f)}
            style={[styles.segment, { backgroundColor: frequency === f ? colors.primary : 'transparent', borderRadius: Radius.sm }]}
            accessibilityRole="radio" accessibilityState={{ selected: frequency === f }}
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
              accessibilityRole="checkbox" accessibilityState={{ checked: weekdays.includes(day) }}
            >
              <Text style={{ color: weekdays.includes(day) ? '#fff' : colors.text, fontSize: fontSize.sm }}>
                {t(`medication.weekdays.${day}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={labelStyle}>{t('medication.times')}</Text>
      <Text style={{ color: colors.muted, fontSize: fontSize.sm, marginBottom: Spacing.xs }}>{t('form.timeHint')}</Text>
      {times.map((time, index) => (
        <View key={index} style={[styles.timeRow, { backgroundColor: colors.fill, borderRadius: Radius.sm }]}>
          <Text style={{ color: colors.text, fontSize: fontSize.md, flex: 1 }}>{time}</Text>
          {times.length > 1 && (
            <TouchableOpacity onPress={() => removeTime(index)} accessibilityLabel={t('common.delete')}>
              <Ionicons name="close" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity onPress={addTime} style={styles.addTimeBtn} accessibilityRole="button">
        <Text style={{ color: colors.primary, fontSize: fontSize.md }}>+ {t('medication.addTime')}</Text>
      </TouchableOpacity>

      <Text style={labelStyle}>{t('medication.note')}</Text>
      <TextInput style={[inputStyle, { minHeight: 60, textAlignVertical: 'top' }]} value={note} onChangeText={setNote} multiline placeholder={t('medication.note')} placeholderTextColor={colors.muted} />

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.cancelBtn, { backgroundColor: colors.fill, borderRadius: Radius.pill }]}
          onPress={onCancel} accessibilityRole="button"
        >
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.md }}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: Radius.pill }]}
          onPress={handleSubmit} accessibilityRole="button"
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
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 6 },
  segmented: { flexDirection: 'row', padding: 3, marginBottom: Spacing.xs },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  dayBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  timeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10, marginBottom: 4 },
  addTimeBtn: { paddingVertical: Spacing.sm, alignItems: 'center' },
  buttons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
});
