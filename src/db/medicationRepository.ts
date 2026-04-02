import { getDatabase } from './database';
import { Medication } from '../types';

export async function getAllMedications(): Promise<Medication[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM medications ORDER BY createdAt DESC');
  return rows.map((r) => ({
    ...r,
    weekdays: r.weekdays ? JSON.parse(r.weekdays) : undefined,
    times: JSON.parse(r.times),
  }));
}

export async function insertMedication(med: Medication): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO medications (id, name, dosage, unit, photoUri, frequency, intervalDays, weekdays, times, startDate, endDate, note, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [med.id, med.name, med.dosage, med.unit, med.photoUri ?? null, med.frequency, med.intervalDays ?? null, med.weekdays ? JSON.stringify(med.weekdays) : null, JSON.stringify(med.times), med.startDate, med.endDate ?? null, med.note ?? null, med.createdAt]
  );
}

export async function updateMedication(med: Medication): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE medications SET name=?, dosage=?, unit=?, photoUri=?, frequency=?, intervalDays=?, weekdays=?, times=?, startDate=?, endDate=?, note=? WHERE id=?',
    [med.name, med.dosage, med.unit, med.photoUri ?? null, med.frequency, med.intervalDays ?? null, med.weekdays ? JSON.stringify(med.weekdays) : null, JSON.stringify(med.times), med.startDate, med.endDate ?? null, med.note ?? null, med.id]
  );
}

export async function deleteMedication(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM medications WHERE id=?', [id]);
}
