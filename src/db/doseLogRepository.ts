import { getDatabase } from './database';
import { DoseLog } from '../types';

export async function getDoseLogsForDate(date: string): Promise<DoseLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM dose_logs WHERE scheduledAt LIKE ? ORDER BY scheduledAt ASC",
    [`${date}%`]
  );
  return rows.map((r) => ({ ...r, skipped: r.skipped === 1 }));
}

export async function getDoseLogsForMonth(yearMonth: string): Promise<DoseLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM dose_logs WHERE scheduledAt LIKE ? ORDER BY scheduledAt ASC",
    [`${yearMonth}%`]
  );
  return rows.map((r) => ({ ...r, skipped: r.skipped === 1 }));
}

export async function upsertDoseLog(log: DoseLog): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO dose_logs (id, medicationId, scheduledAt, takenAt, skipped) VALUES (?, ?, ?, ?, ?)',
    [log.id, log.medicationId, log.scheduledAt, log.takenAt ?? null, log.skipped ? 1 : 0]
  );
}

export async function getDoseLogsForMedication(medicationId: string): Promise<DoseLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM dose_logs WHERE medicationId=? ORDER BY scheduledAt ASC",
    [medicationId]
  );
  return rows.map((r) => ({ ...r, skipped: r.skipped === 1 }));
}
