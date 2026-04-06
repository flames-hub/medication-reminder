import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('medreminder.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dosage REAL NOT NULL,
      unit TEXT NOT NULL,
      photoUri TEXT,
      frequency TEXT NOT NULL,
      intervalDays INTEGER,
      weekdays TEXT,
      times TEXT NOT NULL,
      mealTiming TEXT NOT NULL DEFAULT 'anytime',
      startDate TEXT NOT NULL,
      endDate TEXT,
      note TEXT,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS dose_logs (
      id TEXT PRIMARY KEY,
      medicationId TEXT NOT NULL,
      scheduledAt TEXT NOT NULL,
      takenAt TEXT,
      skipped INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (medicationId) REFERENCES medications(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_dose_logs_scheduled ON dose_logs(scheduledAt);
    CREATE INDEX IF NOT EXISTS idx_dose_logs_med ON dose_logs(medicationId);
  `);
  // migration: add mealTiming column if missing
  try {
    await db.runAsync("ALTER TABLE medications ADD COLUMN mealTiming TEXT NOT NULL DEFAULT 'anytime'");
  } catch {
    // column already exists
  }
  // migration: add memo column to dose_logs if missing
  try {
    await db.runAsync("ALTER TABLE dose_logs ADD COLUMN memo TEXT");
  } catch {
    // column already exists
  }
  return db;
}
