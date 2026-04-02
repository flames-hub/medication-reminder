import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Colors, BorderRadius } from '../constants/theme';
import { DayStatus } from '../types';
import { useColorScheme } from 'react-native';

interface Props {
  dayStatuses: Record<string, DayStatus>;
  onDayPress: (dateStr: string) => void;
  currentMonth: string; // 'YYYY-MM'
  onMonthChange: (yearMonth: string) => void;
}

const STATUS_COLORS: Record<DayStatus, string> = {
  all_taken: '#16A34A',
  partial: '#F59E0B',
  all_missed: '#DC2626',
  none: 'transparent',
};

export function CalendarHeatmap({ dayStatuses, onDayPress, currentMonth, onMonthChange }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const markedDates = Object.entries(dayStatuses).reduce<Record<string, object>>(
    (acc, [date, status]) => {
      if (status === 'none') return acc;
      acc[date] = {
        customStyles: {
          container: {
            backgroundColor: STATUS_COLORS[status],
            borderRadius: BorderRadius.sm,
          },
          text: { color: '#fff', fontWeight: '600' },
        },
      };
      return acc;
    },
    {}
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: BorderRadius.lg }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
});
