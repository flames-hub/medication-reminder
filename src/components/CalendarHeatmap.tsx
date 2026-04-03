import React from 'react';
import { StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Radius } from '../constants/theme';
import { Card } from './GlassCard';
import { DayStatus } from '../types';
import { useTheme } from '../hooks/useTheme';

interface Props {
  dayStatuses: Record<string, DayStatus>;
  onDayPress: (dateStr: string) => void;
  currentMonth: string;
  onMonthChange: (yearMonth: string) => void;
}

export function CalendarHeatmap({ dayStatuses, onDayPress, currentMonth, onMonthChange }: Props) {
  const { colors } = useTheme();

  const statusColors: Record<DayStatus, string> = {
    all_taken: colors.success,
    partial: colors.warning,
    all_missed: colors.error,
    none: 'transparent',
  };

  const markedDates = Object.entries(dayStatuses).reduce<Record<string, object>>(
    (acc, [date, status]) => {
      if (status === 'none') return acc;
      acc[date] = {
        customStyles: {
          container: { backgroundColor: statusColors[status], borderRadius: Radius.sm },
          text: { color: '#fff', fontWeight: '600' },
        },
      };
      return acc;
    },
    {}
  );

  return (
    <Card style={styles.container}>
      <Calendar
        current={`${currentMonth}-01`}
        markingType="custom"
        markedDates={markedDates}
        onDayPress={(day) => onDayPress(day.dateString)}
        onMonthChange={(month) => onMonthChange(`${month.year}-${String(month.month).padStart(2, '0')}`)}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: 'transparent',
          textSectionTitleColor: colors.textSecondary,
          dayTextColor: colors.text,
          monthTextColor: colors.text,
          arrowColor: colors.primary,
          todayTextColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
        }}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
});
