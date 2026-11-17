import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
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

export function DateStrip({
  selectedDate,
  onSelectDate,
  daysCount = 14,
  testID = 'date-strip',
}: DateStripProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const flatListRef = useRef<FlatList<DayItem>>(null);

  const todayStr = todayVN();
  const timeVN = nowVN();
  const isPastDrawTimeToday = timeVN.hour * 60 + timeVN.minute >= toMinutes(DRAW_WINDOW.expectedDone);

  // Determine dynamic count so selectedDate is always within list (up to 60 days)
  let effectiveCount = daysCount;
  if (selectedDate && selectedDate < todayStr) {
    const diffTime =
      new Date(todayStr).getTime() - new Date(selectedDate).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    effectiveCount = Math.min(60, Math.max(daysCount, diffDays + 1));
  }

  const days = getPastDays(effectiveCount);
  const past60Days = getPastDays(60);

  // Auto-scroll to selectedDate when it changes (T10.25)
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
      <TouchableOpacity
        key={item.dateString}
        testID={`${testID}-chip-${item.dateString}`}
        onPress={() => onSelectDate(item.dateString)}
        accessibilityRole="button"
        accessibilityLabel={`${item.isToday ? 'Hôm nay, ' : ''}${item.dayOfWeekShort}, ngày ${item.dayOfMonth}${hasResult ? ', đã có kết quả' : ''}`}
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
        {hasResult && (
          <View
            testID={
              !item.isToday
                ? 'date-strip-chip-dot-past'
                : `${testID}-chip-${item.dateString}-dot`
            }
            className="w-1.5 h-1.5 rounded-full mt-1"
            style={{
              backgroundColor: isSelected ? '#ffffff' : colors.primary,
            }}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View testID={testID} className="my-2">
      <FlatList
        ref={flatListRef}
        data={days}
        keyExtractor={(item) => item.dateString}
        renderItem={renderDayItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: ITEM_GAP }}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH + ITEM_GAP,
          offset: (ITEM_WIDTH + ITEM_GAP) * index,
          index,
        })}
        onScrollToIndexFailed={() => {}}
        ListFooterComponent={
          <TouchableOpacity
            testID={`${testID}-calendar-btn`}
            onPress={() => setModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.check.openCalendarA11y}
            className="items-center justify-center py-2 px-3 rounded-xl border min-w-[62px]"
            style={{
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
            }}
          >
            <Icon name="calendar" size={18} color={colors.primary} />
            <Text
              className="text-xs font-semibold mt-0.5"
              style={{ color: colors.primary }}
            >
              Lịch
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Date Picker Modal (60 days) */}
      {modalVisible && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            testID="date-picker-modal"
            className="flex-1 justify-end bg-black/50"
          >
            <SafeAreaView
              className="rounded-t-3xl max-h-[80%]"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                <View className="flex-row items-center gap-2">
                  <Icon name="calendar" size={18} color={colors.primary} />
                  <Text
                    accessibilityRole="header"
                    className="text-base font-bold"
                    style={{ color: colors.textMain }}
                  >
                    Chọn ngày mở thưởng (60 ngày)
                  </Text>
                </View>
                <TouchableOpacity
                  testID="date-picker-close-btn"
                  onPress={() => setModalVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel={STRINGS.common.close}
                  className="p-1 rounded-full"
                >
                  <Icon name="x" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView className="px-4 py-2">
                <View className="flex-row flex-wrap justify-between gap-y-2 pb-6">
                  {past60Days.map((item) => {
                    const isSelected = item.dateString === selectedDate;
                    const hasResult =
                      item.dateString < todayStr ||
                      (item.isToday && isPastDrawTimeToday);

                    return (
                      <TouchableOpacity
                        key={item.dateString}
                        testID={`date-picker-item-${item.dateString}`}
                        onPress={() => {
                          onSelectDate(item.dateString);
                          setModalVisible(false);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.dayOfWeekShort}, ${item.dateString}`}
                        accessibilityState={{ selected: isSelected }}
                        className="w-[30%] py-2.5 px-2 rounded-xl border items-center justify-center"
                        style={{
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.surfaceSubtle,
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                        }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{
                            color: isSelected ? '#ffffff' : colors.textMuted,
                          }}
                        >
                          {item.isToday ? 'Hôm nay' : item.dayOfWeekShort}
                        </Text>
                        <Text
                          className="text-sm font-bold mt-0.5"
                          style={{
                            color: isSelected ? '#ffffff' : colors.textMain,
                          }}
                        >
                          {item.dayOfMonth}
                        </Text>
                        {hasResult && (
                          <View
                            className="w-1.5 h-1.5 rounded-full mt-1"
                            style={{
                              backgroundColor: isSelected
                                ? '#ffffff'
                                : colors.primary,
                            }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </View>
  );
}
