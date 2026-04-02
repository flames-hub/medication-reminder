export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getYearMonthString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Returns the number of full days from date string a to date string b.
 * Positive if b is after a.
 */
export function daysBetween(a: string, b: string): number {
  // Use date-only to avoid timezone offset issues
  const [aYear, aMonth, aDay] = a.split('-').map(Number);
  const [bYear, bMonth, bDay] = b.split('-').map(Number);
  const aStart = new Date(aYear, aMonth - 1, aDay);
  const bStart = new Date(bYear, bMonth - 1, bDay);
  return Math.round((bStart.getTime() - aStart.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}
