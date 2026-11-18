import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Text, Sheet, usePressed } from './ui';
import { useTheme } from '@/theme';
import { radii } from '@/theme/tokens';
import { todayVN, addDays, weekdayVN, nowVN } from '@/lib';
import { STRINGS } from '@/lib/strings';
import { Icon } from './Icon';
import { DRAW_WINDOW, toMinutes } from '@/lib/drawWindow';

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

const ITEM_WIDTH = 66;
const ITEM_GAP = 8;

function DayChip({
  item,
  isSelected,
  hasResult,
  testID,
  dotTestID,
  onPress,
}: {
  item: DayItem;
  isSelected: boolean;
  hasResult: boolean;
  testID: string;
  dotTestID?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const { pressed, pressHandlers } = usePressed();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.isToday ? 'Hôm nay, ' : ''}${item.dayOfWeekShort}, ngày ${item.dayOfMonth}${hasResult ? ', đã có kết quả' : ''}`}
      accessibilityState={{ selected: isSelected }}
      {...pressHandlers}
      style={{
        ...styles.dayChip,
        backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
        borderColor: isSelected ? colors.primary : colors.border,
        opacity: pressed ? 0.85 : 1,
      }}
    >
      <Text
        variant="caption"
        color={isSelected ? colors.onPrimary : colors.textMuted}
      >
        {item.isToday ? 'Hôm nay' : item.dayOfWeekShort}
      </Text>
      <Text
        variant="bodyStrong"
        color={isSelected ? colors.onPrimary : colors.textMain}
      >
        {item.dayOfMonth}
      </Text>
      {hasResult ? (
        <View
          testID={dotTestID}
          style={[
            styles.dot,
            {
              backgroundColor: isSelected ? colors.onPrimary : colors.primary,
            },
          ]}
        />
      ) : null}
    </Pressable>
  );
}

export function DateStrip({
  selectedDate,
  onSelectDate,
  daysCount = 14,
  testID = 'date-strip',
}: DateStripProps) {
  const { colors } = useTheme();
  const { pressed: calPressed, pressHandlers: calHandlers } = usePressed();
  const [modalVisible, setModalVisible] = useState(false);
  const flatListRef = useRef<FlatList<DayItem>>(null);

  const todayStr = todayVN();
  const timeVN = nowVN();
  const isPastDrawTimeToday =
    timeVN.hour * 60 + timeVN.minute >= toMinutes(DRAW_WINDOW.expectedDone);

  let effectiveCount = daysCount;
  if (selectedDate && selectedDate < todayStr) {
    const diffTime =
      new Date(todayStr).getTime() - new Date(selectedDate).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    effectiveCount = Math.min(60, Math.max(daysCount, diffDays + 1));
  }

  const days = getPastDays(effectiveCount);
  const past60Days = getPastDays(60);

  useEffect(() => {
    const targetIndex = days.findIndex((d) => d.dateString === selectedDate);
    if (targetIndex > 0 && flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({
          index: targetIndex,
          animated: true,
          viewPosition: 0.5,
        });
      } catch {
        // Fallback if measurement not yet ready
      }
    }
  }, [selectedDate, days]);

  const renderDayItem = ({ item }: { item: DayItem }) => {
    const isSelected = item.dateString === selectedDate;
    const hasResult =
      item.dateString < todayStr || (item.isToday && isPastDrawTimeToday);

    return (
      <DayChip
        item={item}
        isSelected={isSelected}
        hasResult={hasResult}
        testID={`${testID}-chip-${item.dateString}`}
        dotTestID={
          !item.isToday
            ? 'date-strip-chip-dot-past'
            : `${testID}-chip-${item.dateString}-dot`
        }
        onPress={() => onSelectDate(item.dateString)}
      />
    );
  };

  return (
    <View testID={testID} style={styles.root}>
      <FlatList
        ref={flatListRef}
        data={days}
        keyExtractor={(item) => item.dateString}
        renderItem={renderDayItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH + ITEM_GAP,
          offset: (ITEM_WIDTH + ITEM_GAP) * index,
          index,
        })}
        onScrollToIndexFailed={() => {}}
        ListFooterComponent={
          <Pressable
            testID={`${testID}-calendar-btn`}
            onPress={() => setModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.check.openCalendarA11y}
            {...calHandlers}
            style={[
              styles.dayChip,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
                opacity: calPressed ? 0.8 : 1,
              },
            ]}
          >
            <Icon name="calendar" size={18} color={colors.primary} />
            <Text variant="caption" color={colors.primary} style={styles.calText}>
              Lịch
            </Text>
          </Pressable>
        }
      />

      <Sheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Chọn ngày mở thưởng (60 ngày)"
        closeTestID="date-picker-close-btn"
        testID="date-picker-modal"
      >
        <ScrollView style={styles.modalScroll}>
          <View style={styles.modalGrid}>
            {past60Days.map((item) => {
              const isSelected = item.dateString === selectedDate;
              const hasResult =
                item.dateString < todayStr ||
                (item.isToday && isPastDrawTimeToday);

              return (
                <View key={item.dateString} style={styles.gridCell}>
                  <DayChip
                    item={item}
                    isSelected={isSelected}
                    hasResult={hasResult}
                    testID={`date-picker-item-${item.dateString}`}
                    onPress={() => {
                      onSelectDate(item.dateString);
                      setModalVisible(false);
                    }}
                  />
                </View>
              );
            })}
          </View>
        </ScrollView>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginVertical: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: ITEM_GAP,
  },
  dayChip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    minWidth: 62,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radii.full,
    marginTop: 4,
  },
  calText: {
    marginTop: 2,
  },
  modalScroll: {
    maxHeight: 380,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    paddingBottom: 16,
  },
  gridCell: {
    width: '31.5%',
  },
});
