export interface Medication {
  id: string;
  name: string;
  dosage: number;
  unit: 'mg' | 'ml' | 'tablet' | 'capsule' | 'drop' | 'other';
  photoUri?: string;
  frequency: 'daily' | 'weekly' | 'interval';
  intervalDays?: number;
  weekdays?: number[];    // 0=Sun ... 6=Sat
  times: string[];        // ['08:00', '12:00', '20:00']
  startDate: string;
  endDate?: string;
  note?: string;
  createdAt: string;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  scheduledAt: string;    // ISO datetime
  takenAt?: string;
  skipped: boolean;
}

export type DayStatus = 'all_taken' | 'partial' | 'all_missed' | 'none';
export type UISize = 'standard' | 'large';
export type ThemeId = 'sakura' | 'mint' | 'honey';
