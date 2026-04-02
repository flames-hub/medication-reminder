import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Medication, DoseLog, DayStatus } from '../types';
import {
  getAllMedications,
  insertMedication,
  updateMedication,
  deleteMedication,
} from '../db/medicationRepository';
import { getDoseLogsForDate, getDoseLogsForMonth, upsertDoseLog } from '../db/doseLogRepository';
import { generateScheduleForDate } from '../utils/scheduler';
import { getTodayString, getYearMonthString } from '../utils/dateUtils';

interface ScheduledDose {
  logId: string;
  medication: Medication;
  scheduledAt: string;
  time: string;
  takenAt?: string;
  skipped: boolean;
}

interface TodayStats {
  done: number;
  total: number;
  percent: number;
}

interface MedicationState {
  medications: Medication[];
  todaySchedule: ScheduledDose[];
  isLoading: boolean;

  loadMedications: () => Promise<void>;
  addMedication: (data: Omit<Medication, 'id' | 'createdAt'>) => Promise<void>;
  editMedication: (med: Medication) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  loadTodaySchedule: () => Promise<void>;
  takeDose: (logId: string) => Promise<void>;
  skipDose: (logId: string) => Promise<void>;
  getTodayStats: () => TodayStats;
  getDayStatus: (dateStr: string, logs: DoseLog[]) => DayStatus;
  getMonthlyAdherence: (yearMonth: string) => Promise<{ percent: number; dayStatuses: Record<string, DayStatus> }>;
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: [],
  todaySchedule: [],
  isLoading: false,

  loadMedications: async () => {
    set({ isLoading: true });
    const medications = await getAllMedications();
    set({ medications, isLoading: false });
  },

  addMedication: async (data) => {
    const med: Medication = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    await insertMedication(med);
    set((state) => ({ medications: [med, ...state.medications] }));
  },

  editMedication: async (med) => {
    await updateMedication(med);
    set((state) => ({
      medications: state.medications.map((m) => (m.id === med.id ? med : m)),
    }));
  },

  removeMedication: async (id) => {
    await deleteMedication(id);
    set((state) => ({ medications: state.medications.filter((m) => m.id !== id) }));
  },

  loadTodaySchedule: async () => {
    const { medications } = get();
    const today = getTodayString();
    const schedule = generateScheduleForDate(medications, today);
    const existingLogs = await getDoseLogsForDate(today);
    const logMap = new Map(existingLogs.map((l) => [l.scheduledAt + l.medicationId, l]));

    const todaySchedule: ScheduledDose[] = await Promise.all(
      schedule.map(async (slot) => {
        const key = slot.scheduledAt + slot.medicationId;
        let log = logMap.get(key);
        if (!log) {
          log = {
            id: uuidv4(),
            medicationId: slot.medicationId,
            scheduledAt: slot.scheduledAt,
            skipped: false,
          };
          await upsertDoseLog(log);
        }
        const med = medications.find((m) => m.id === slot.medicationId)!;
        return {
          logId: log.id,
          medication: med,
          scheduledAt: slot.scheduledAt,
          time: slot.time,
          takenAt: log.takenAt,
          skipped: log.skipped,
        };
      })
    );

    set({ todaySchedule });
  },

  takeDose: async (logId) => {
    const { todaySchedule } = get();
    const dose = todaySchedule.find((d) => d.logId === logId);
    if (!dose) return;
    const updatedLog: DoseLog = {
      id: dose.logId,
      medicationId: dose.medication.id,
      scheduledAt: dose.scheduledAt,
      takenAt: new Date().toISOString(),
      skipped: false,
    };
    await upsertDoseLog(updatedLog);
    set((state) => ({
      todaySchedule: state.todaySchedule.map((d) =>
        d.logId === logId ? { ...d, takenAt: updatedLog.takenAt, skipped: false } : d
      ),
    }));
  },

  skipDose: async (logId) => {
    const { todaySchedule } = get();
    const dose = todaySchedule.find((d) => d.logId === logId);
    if (!dose) return;
    const updatedLog: DoseLog = {
      id: dose.logId,
      medicationId: dose.medication.id,
      scheduledAt: dose.scheduledAt,
      takenAt: undefined,
      skipped: true,
    };
    await upsertDoseLog(updatedLog);
    set((state) => ({
      todaySchedule: state.todaySchedule.map((d) =>
        d.logId === logId ? { ...d, takenAt: undefined, skipped: true } : d
      ),
    }));
  },

  getTodayStats: () => {
    const { todaySchedule } = get();
    const total = todaySchedule.length;
    const done = todaySchedule.filter((d) => !!d.takenAt).length;
    return { done, total, percent: total === 0 ? 100 : Math.round((done / total) * 100) };
  },

  getDayStatus: (dateStr, logs) => {
    const { medications } = get();
    const schedule = generateScheduleForDate(medications, dateStr);
    if (schedule.length === 0) return 'none';

    const takenCount = schedule.filter((slot) => {
      const log = logs.find(
        (l) => l.medicationId === slot.medicationId && l.scheduledAt === slot.scheduledAt
      );
      return log?.takenAt != null;
    }).length;

    if (takenCount === schedule.length) return 'all_taken';
    if (takenCount === 0) return 'all_missed';
    return 'partial';
  },

  getMonthlyAdherence: async (yearMonth) => {
    const logs = await getDoseLogsForMonth(yearMonth);
    const { medications } = get();
    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayStatuses: Record<string, DayStatus> = {};
    let totalScheduled = 0;
    let totalTaken = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const schedule = generateScheduleForDate(medications, dateStr);
      if (schedule.length === 0) {
        dayStatuses[dateStr] = 'none';
        continue;
      }
      totalScheduled += schedule.length;
      const dayLogs = logs.filter((l) => l.scheduledAt.startsWith(dateStr));
      const taken = schedule.filter((slot) => {
        const log = dayLogs.find(
          (l) => l.medicationId === slot.medicationId && l.scheduledAt === slot.scheduledAt
        );
        return log?.takenAt != null;
      }).length;
      totalTaken += taken;
      if (taken === schedule.length) dayStatuses[dateStr] = 'all_taken';
      else if (taken === 0) dayStatuses[dateStr] = 'all_missed';
      else dayStatuses[dateStr] = 'partial';
    }

    const percent = totalScheduled === 0 ? 100 : Math.round((totalTaken / totalScheduled) * 100);
    return { percent, dayStatuses };
  },
}));
