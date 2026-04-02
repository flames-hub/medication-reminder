import { Medication } from '../types';
import { daysBetween } from './dateUtils';

/**
 * Determines if a medication is scheduled to be taken on the given date.
 *
 * Rules:
 * - 'daily': every day within start/end range
 * - 'weekly': only on specified weekdays within range
 * - 'interval': every N days starting from startDate (day 0 = startDate, day N = startDate+N, etc.)
 *
 * @param med - the medication
 * @param dateStr - date in 'YYYY-MM-DD' format
 */
export function isMedicationScheduledForDate(med: Medication, dateStr: string): boolean {
  // Before start date: not scheduled
  if (dateStr < med.startDate) return false;
  // After end date: not scheduled
  if (med.endDate && dateStr > med.endDate) return false;

  switch (med.frequency) {
    case 'daily':
      return true;

    case 'weekly': {
      // new Date('YYYY-MM-DD') parses as UTC midnight, getDay() would be wrong in negative offsets.
      // Parse manually to get local day of week.
      const [year, month, day] = dateStr.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      const dayOfWeek = localDate.getDay(); // 0=Sun
      return (med.weekdays ?? []).includes(dayOfWeek);
    }

    case 'interval': {
      const diff = daysBetween(med.startDate, dateStr);
      const interval = med.intervalDays ?? 1;
      return diff >= 0 && diff % interval === 0;
    }

    default:
      return false;
  }
}

/**
 * Generates all scheduled dose slots for a given date across all medications.
 * Returns sorted by scheduledAt (ascending time).
 *
 * @param medications - all active medications
 * @param dateStr - date in 'YYYY-MM-DD' format
 */
export function generateScheduleForDate(
  medications: Medication[],
  dateStr: string
): { medicationId: string; scheduledAt: string; time: string }[] {
  const schedule: { medicationId: string; scheduledAt: string; time: string }[] = [];

  for (const med of medications) {
    if (!isMedicationScheduledForDate(med, dateStr)) continue;
    for (const time of med.times) {
      schedule.push({
        medicationId: med.id,
        scheduledAt: `${dateStr}T${time}:00`,
        time,
      });
    }
  }

  return schedule.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

/**
 * Generates schedule for a range of dates (e.g., for scheduling notifications).
 *
 * @param medications - all active medications
 * @param startDate - start date string 'YYYY-MM-DD'
 * @param days - number of days to generate (inclusive of startDate)
 */
export function generateScheduleForRange(
  medications: Medication[],
  startDate: string,
  days: number
): { medicationId: string; scheduledAt: string; time: string; date: string }[] {
  const results: { medicationId: string; scheduledAt: string; time: string; date: string }[] = [];
  const [year, month, day] = startDate.split('-').map(Number);

  for (let i = 0; i < days; i++) {
    const d = new Date(year, month - 1, day + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const daySchedule = generateScheduleForDate(medications, dateStr);
    for (const slot of daySchedule) {
      results.push({ ...slot, date: dateStr });
    }
  }
  return results;
}
