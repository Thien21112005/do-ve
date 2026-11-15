import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import { todayVN, addDays, weekdayVN } from '@/lib';

export interface DateStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  daysCount?: number;
  testID?: string;
}

export interface DayItem {
  dateString: string; // YYYY-MM-DD
  dayOfWeekShort: string; // T2, T3, CN...
  dayOfMonth: string; // 14/11
  isToday: boolean;
}

const VN_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function getPastDays(count = 14, baseDate = new Date()): DayItem[] {
  const items: DayItem[] = [];
  const baseDayStr = todayVN(baseDate);

  for (let i = 0; i < count; i++) {
    const dateString = addDays(baseDayStr, -i);
    const [, month, day] = dateString.split('-');

    const isToday = i === 0;
    const isoWeekday = weekdayVN(dateString);
    const dayOfWeekShort = isoWeekday === 7 ? 'CN' : VN_DAYS[isoWeekday];
    const dayOfMonth = `${day}/${month}`;

    items.push({
      dateString,
      dayOfWeekShort,
      dayOfMonth,
      isToday,
    });
  }

  return items;
}

export function DateStrip({
  selectedDate,
  onSelectDate,
  daysCount = 14,
  testID = 'date-strip',
}: DateStripProps) {
  const { colors } = useTheme();
  const days = getPastDays(daysCount);

  return (
    <View testID={testID} className="my-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
      >
        {days.map((item) => {
          const isSelected = item.dateString === selectedDate;

          return (
            <TouchableOpacity
              key={item.dateString}
              testID={`${testID}-chip-${item.dateString}`}
              onPress={() => onSelectDate(item.dateString)}
              accessibilityRole="button"
              accessibilityLabel={`${item.isToday ? 'Hôm nay, ' : ''}${item.dayOfWeekShort}, ngày ${item.dayOfMonth}`}
              accessibilityState={{ selected: isSelected }}
              className="items-center justify-center py-2 px-3 rounded-xl border min-w-[62px]"
              style={{
                backgroundColor: isSelected
                  ? colors.primary
                  : colors.surfaceSubtle,
                borderColor: isSelected ? colors.primary : colors.border,
              }}
            >
              <Text
                className="text-xs font-medium mb-0.5"
                style={{
                  color: isSelected ? '#ffffff' : colors.textMuted,
                }}
              >
                {item.isToday ? 'Hôm nay' : item.dayOfWeekShort}
              </Text>
              <Text
                className="text-sm font-bold"
                style={{
                  color: isSelected ? '#ffffff' : colors.textMain,
                }}
              >
                {item.dayOfMonth}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
