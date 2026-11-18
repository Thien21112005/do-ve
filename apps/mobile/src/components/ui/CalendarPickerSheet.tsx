import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Sheet } from './Sheet';
import { Text } from './Text';
import { Chip } from './Chip';
import { IconButton } from './IconButton';
import { usePressed } from './usePressed';
import { useTheme } from '@/theme';
import { radii } from '@/theme/tokens';
import { todayVN, addDays, weekdayVN } from '@/lib/date';
import { formatDateVN } from '@/lib/format';
import { haptics } from '@/lib/haptics';

const WEEKDAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

export interface CalendarDayCellModel {
  dateString: string;
  dayNumber: number;
  isoWeekday: number; // 1 = T2 .. 7 = CN
}

/**
 * Builds an array of 7-column weeks (Monday T2 -> Sunday CN) for a given year and 1-based month.
 * Leading and trailing slots outside the month are null.
 */
export function buildMonthWeeks(
  year: number,
  month: number,
): (CalendarDayCellModel | null)[][] {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const mm = String(month).padStart(2, '0');
  const firstDateStr = `${year}-${mm}-01`;
  const leadingBlanks = weekdayVN(firstDateStr) - 1; // 0..6

  const flat: (CalendarDayCellModel | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) {
    flat.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dd = String(d).padStart(2, '0');
    const dateString = `${year}-${mm}-${dd}`;
    const isoWeekday = ((leadingBlanks + d - 1) % 7) + 1;
    flat.push({ dateString, dayNumber: d, isoWeekday });
  }
  while (flat.length % 7 !== 0) {
    flat.push(null);
  }

  const weeks: (CalendarDayCellModel | null)[][] = [];
  for (let i = 0; i < flat.length; i += 7) {
    weeks.push(flat.slice(i, i + 7));
  }
  return weeks;
}

function parseYearMonth(dateStr: string): { year: number; month: number } {
  const parts = dateStr.split('-').map(Number);
  const year = parts[0] || 2026;
  const month = parts[1] || 1;
  return { year, month };
}

interface DayCellButtonProps {
  cell: CalendarDayCellModel;
  selected: boolean;
  isToday: boolean;
  disabled: boolean;
  dayTestIDPrefix: string;
  onPressDay: (dateString: string) => void;
}

function DayCellButton({
  cell,
  selected,
  isToday,
  disabled,
  dayTestIDPrefix,
  onPressDay,
}: DayCellButtonProps) {
  const { colors } = useTheme();
  const { pressed, pressHandlers } = usePressed();
  const isSunday = cell.isoWeekday === 7;

  const formatted = formatDateVN(cell.dateString);
  const a11yParts = [
    isToday ? `Hôm nay, ngày ${formatted}` : `Ngày ${formatted}`,
  ];
  if (selected) a11yParts.push('đang chọn');
  if (disabled) a11yParts.push('không khả dụng');

  const textColor = selected
    ? colors.onPrimary
    : disabled
      ? colors.textMuted
      : isSunday
        ? colors.special
        : colors.textMain;

  const bgColor = selected
    ? colors.primary
    : isToday && !disabled
      ? colors.primaryTint
      : pressed && !disabled
        ? colors.surfaceSubtle
        : 'transparent';

  return (
    <Pressable
      testID={`${dayTestIDPrefix}-${cell.dateString}`}
      accessibilityRole="button"
      accessibilityLabel={a11yParts.join(', ')}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      hitSlop={2}
      onPress={() => {
        if (disabled) return;
        haptics.selection?.();
        onPressDay(cell.dateString);
      }}
      {...pressHandlers}
      style={[
        styles.dayButton,
        {
          backgroundColor: bgColor,
          borderColor:
            isToday && !selected && !disabled ? colors.primary : 'transparent',
          borderWidth: isToday && !selected && !disabled ? 1.5 : 0,
          opacity: disabled ? 0.28 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        variant={selected || isToday ? 'bodyStrong' : 'body'}
        color={textColor}
        style={styles.dayNumberText}
      >
        {String(cell.dayNumber)}
      </Text>
      {isToday ? (
        <View
          style={[
            styles.todayDot,
            {
              backgroundColor: selected ? colors.onPrimary : colors.primary,
            },
          ]}
        />
      ) : null}
    </Pressable>
  );
}

export interface CalendarPickerSheetProps {
  visible: boolean;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
  title?: string;
  maxPastDays?: number;
  today?: string;
  closeOnSelect?: boolean;
  headerSlot?: React.ReactNode;
  closeTestID?: string;
  dayTestIDPrefix?: string;
  testID?: string;
}

/**
 * Vietnamese Monday-first (T2 -> CN) monthly calendar bottom sheet (T12.08).
 * Built purely with design-system primitives (zero third-party calendar deps).
 */
export function CalendarPickerSheet({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
  title = 'Chọn ngày mở thưởng',
  maxPastDays = 90,
  today,
  closeOnSelect = true,
  headerSlot,
  closeTestID,
  dayTestIDPrefix = 'calendar-day',
  testID = 'calendar-picker-sheet',
}: CalendarPickerSheetProps) {
  const { colors } = useTheme();
  const todayStr = today || todayVN();
  const yesterdayStr = addDays(todayStr, -1);
  const minAllowedDate = addDays(todayStr, -maxPastDays);

  const initialYm = parseYearMonth(selectedDate || todayStr);
  const [viewYear, setViewYear] = useState(initialYm.year);
  const [viewMonth, setViewMonth] = useState(initialYm.month);
  const [syncKey, setSyncKey] = useState(`${visible}|${selectedDate}`);

  const nextSyncKey = `${visible}|${selectedDate}`;
  if (nextSyncKey !== syncKey) {
    setSyncKey(nextSyncKey);
    if (visible && selectedDate) {
      const ym = parseYearMonth(selectedDate);
      setViewYear(ym.year);
      setViewMonth(ym.month);
    }
  }

  const todayYm = parseYearMonth(todayStr);
  const minYm = parseYearMonth(minAllowedDate);

  const canGoNextMonth =
    viewYear < todayYm.year ||
    (viewYear === todayYm.year && viewMonth < todayYm.month);
  const canGoPrevMonth =
    viewYear > minYm.year ||
    (viewYear === minYm.year && viewMonth > minYm.month);

  const stepMonth = (delta: -1 | 1) => {
    let nextMonth = viewMonth + delta;
    let nextYear = viewYear;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    } else if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    setViewYear(nextYear);
    setViewMonth(nextMonth);
  };

  const handlePickDate = (dateStr: string) => {
    onSelectDate(dateStr);
    if (closeOnSelect) {
      onClose();
    }
  };

  const weeks = buildMonthWeeks(viewYear, viewMonth);

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title}
      closeTestID={closeTestID}
      testID={testID}
    >
      <ScrollView
        testID="calendar-scroll-view"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {headerSlot}

      {/* Quick shortcut chips: Hôm nay / Hôm qua */}
      <View style={styles.quickRow}>
        <Chip
          testID="calendar-quick-today"
          label={`Hôm nay (${formatDateVN(todayStr).slice(0, 5)})`}
          selected={selectedDate === todayStr}
          onPress={() => handlePickDate(todayStr)}
        />
        <Chip
          testID="calendar-quick-yesterday"
          label={`Hôm qua (${formatDateVN(yesterdayStr).slice(0, 5)})`}
          selected={selectedDate === yesterdayStr}
          onPress={() => handlePickDate(yesterdayStr)}
        />
      </View>

      {/* Month navigation bar: ‹ Tháng MM, YYYY › */}
      <View
        style={[
          styles.monthNavBar,
          {
            backgroundColor: colors.surfaceSubtle,
            borderColor: colors.border,
          },
        ]}
      >
        <IconButton
          testID="calendar-prev-month-btn"
          accessibilityLabel="Tháng trước"
          disabled={!canGoPrevMonth}
          onPress={() => stepMonth(-1)}
          icon={
            <ChevronLeft size={20} color={colors.textMain} strokeWidth={2} />
          }
        />
        <Text
          testID="calendar-month-label"
          variant="bodyStrong"
          color={colors.textMain}
          align="center"
        >
          {`Tháng ${viewMonth}, ${viewYear}`}
        </Text>
        <IconButton
          testID="calendar-next-month-btn"
          accessibilityLabel="Tháng sau"
          disabled={!canGoNextMonth}
          onPress={() => stepMonth(1)}
          icon={
            <ChevronRight size={20} color={colors.textMain} strokeWidth={2} />
          }
        />
      </View>

      {/* 7-column Vietnamese weekday header: T2 .. CN */}
      <View style={styles.weekdayHeaderRow}>
        {WEEKDAY_HEADERS.map((wd) => (
          <View key={wd} style={styles.gridCol}>
            <Text
              variant="caption"
              align="center"
              color={wd === 'CN' ? colors.special : colors.textMuted}
              style={styles.weekdayText}
            >
              {wd}
            </Text>
          </View>
        ))}
      </View>

      {/* Explicit 7-cell week rows (never wraps unevenly across DPIs) */}
      <View style={styles.weeksContainer}>
        {weeks.map((week, wIdx) => (
          <View
            key={`week-${viewYear}-${viewMonth}-${wIdx}`}
            testID={`calendar-week-${wIdx}`}
            style={styles.weekRow}
          >
            {week.map((cell, cIdx) => (
              <View
                key={cell ? cell.dateString : `empty-${wIdx}-${cIdx}`}
                style={styles.gridCol}
              >
                {cell ? (
                  <DayCellButton
                    cell={cell}
                    selected={cell.dateString === selectedDate}
                    isToday={cell.dateString === todayStr}
                    disabled={
                      cell.dateString > todayStr ||
                      cell.dateString < minAllowedDate
                    }
                    dayTestIDPrefix={dayTestIDPrefix}
                    onPressDay={handlePickDate}
                  />
                ) : (
                  <View style={styles.emptyDaySlot} />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  monthNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  weekdayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekdayText: {
    fontFamily: 'BeVietnamPro-SemiBold',
  },
  weeksContainer: {
    gap: 4,
    paddingBottom: 4,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridCol: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    paddingHorizontal: 2,
  },
  dayButton: {
    minHeight: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDaySlot: {
    height: 44,
  },
  dayNumberText: {
    fontVariant: ['tabular-nums'],
    fontSize: 15,
    lineHeight: 20,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: radii.full,
    marginTop: 2,
  },
});

