import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { Medication } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import { getTodayString } from '../utils/dateUtils';
import { useColorScheme } from 'react-native';

type FormData = Omit<Medication, 'id' | 'createdAt'>;

interface Props {
  initial?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export function MedicationForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { uiSize } = useSettingsStore();
  const fontSize = FontSize[uiSize];

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
      Alert.alert('', t('medication.name') + ' is required');
      return;
    }
    const dosageNum = parseFloat(dosage);
    if (isNaN(dosageNum) || dosageNum <= 0) {
      Alert.alert('', t('medication.dosage') + ' must be a positive number');
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

  const inputStyle = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, fontSize: fontSize.md, borderRadius: BorderRadius.sm }];
  const labelStyle = [styles.label, { color: colors.textSecondary, fontSize: fontSize.sm }];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={labelStyle}>{t('medication.name')}</Text>
      <TextInput style={inputStyle} value={name} onChangeText={setName} placeholder={t('medication.name')} placeholderTextColor={colors.muted} />

      <Text style={labelStyle}>{t('medication.dosage')}</Text>
      <View style={styles.row}>
        <TextInput style={[inputStyle, { flex: 1, marginRight: Spacing.sm }]} value={dosage} onChangeText={setDosage} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.muted} />
        <View style={styles.unitPicker}>
          {units.map((u) => (
            <TouchableOpacity key={u} onPress={() => setUnit(u)} style={[styles.unitBtn, { borderRadius: BorderRadius.sm, backgroundColor: unit === u ? colors.primary : colors.surface, borderColor: colors.border }]}>
              <Text style={{ color: unit === u ? '#fff' : colors.text, fontSize: fontSize.sm }}>{t(`medication.units.${u}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={labelStyle}>{t('medication.frequency')}</Text>
      <View style={styles.row}>
        {frequencies.map((f) => (
          <TouchableOpacity key={f} onPress={() => setFrequency(f)} style={[styles.freqBtn, { borderRadius: BorderRadius.sm, backgroundColor: frequency === f ? colors.primary : colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: frequency === f ? '#fff' : colors.text, fontSize: fontSize.sm }}>{t(`medication.${f}`)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {frequency === 'interval' && (
        <>
          <Text style={labelStyle}>{t('medication.intervalDays', { count: parseInt(intervalDays) })}</Text>
          <TextInput style={inputStyle} value={intervalDays} onChangeText={setIntervalDays} keyboardType="numeric" />
        </>
      )}

      {frequency === 'weekly' && (
        <View style={styles.row}>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <TouchableOpacity key={day} onPress={() => toggleWeekday(day)} style={[styles.dayBtn, { borderRadius: BorderRadius.sm, backgroundColor: weekdays.includes(day) ? colors.primary : colors.surface, borderColor: colors.border }]}>
              <Text style={{ color: weekdays.includes(day) ? '#fff' : colors.text, fontSize: fontSize.sm }}>{t(`medication.weekdays.${day}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={labelStyle}>{t('medication.times')}</Text>
      {times.map((time, index) => (
        <View key={index} style={styles.row}>
          <Text style={[styles.timeText, { color: colors.text, fontSize: fontSize.md, flex: 1 }]}>{time}</Text>
          {times.length > 1 && (
            <TouchableOpacity onPress={() => removeTime(index)}>
              <Text style={{ color: colors.error, fontSize: fontSize.md, marginLeft: Spacing.sm }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity onPress={addTime} style={[styles.addTimeBtn, { borderColor: colors.primary, borderRadius: BorderRadius.sm }]}>
        <Text style={{ color: colors.primary, fontSize: fontSize.md }}>+ {t('medication.addTime')}</Text>
      </TouchableOpacity>

      <Text style={labelStyle}>{t('medication.note')}</Text>
      <TextInput style={[inputStyle, { minHeight: 60 }]} value={note} onChangeText={setNote} multiline placeholder={t('medication.note')} placeholderTextColor={colors.muted} />

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border, borderRadius: BorderRadius.md }]} onPress={onCancel}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.md }}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: BorderRadius.md }]} onPress={handleSubmit}>
          <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: '600' }}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  label: { marginTop: Spacing.md, marginBottom: Spacing.xs, fontWeight: '500' },
  input: { borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginBottom: Spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.xs },
  unitBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderWidth: 1 },
  unitPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 2 },
  freqBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 1 },
  dayBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderWidth: 1 },
  timeText: { paddingVertical: Spacing.xs },
  addTimeBtn: { borderWidth: 1, borderStyle: 'dashed', paddingVertical: Spacing.sm, alignItems: 'center', marginVertical: Spacing.xs },
  buttons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  cancelBtn: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderWidth: 1 },
  saveBtn: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
});
