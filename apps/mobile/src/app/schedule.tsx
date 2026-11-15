import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components';
import { useTheme } from '@/theme';
import { STRINGS } from '@/lib/strings';
import {
  weekdayVN,
  WEEKLY_SCHEDULE,
  type ScheduledStation,
  type DaySchedule,
} from '@/lib';
import { useWeeklySchedule } from '@/hooks';

export { WEEKLY_SCHEDULE, type ScheduledStation, type DaySchedule };

function getTodayWeekday(): number {
  return weekdayVN(new Date());
}

export default function ScheduleScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const todayWeekday = getTodayWeekday();
  const { schedule } = useWeeklySchedule();

  return (
    <SafeAreaView
      testID="schedule-screen"
      edges={['bottom']}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1 px-4 pt-3"
      >
        {/* Info Banner */}
        <View
          className="p-3.5 rounded-2xl border mb-4 flex-row items-center"
          style={{
            backgroundColor: `${colors.primary}0D`,
            borderColor: `${colors.primary}26`,
          }}
        >
          <View
            className="w-8 h-8 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: `${colors.primary}1A` }}
          >
            <Icon name="clock" size={18} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text
              className="text-xs font-bold"
              style={{ color: colors.primary }}
            >
              {STRINGS.schedule.drawTimeTitle}
            </Text>
            <Text
              className="text-xs mt-0.5 leading-snug"
              style={{ color: colors.textMuted }}
            >
              {STRINGS.schedule.holidayNotice}
            </Text>
          </View>
        </View>

        {/* 7 Days Schedule Cards */}
        {schedule.map((day) => {
          const isToday = day.dayOfWeek === todayWeekday;

          return (
            <View
              key={day.dayOfWeek}
              testID={`schedule-day-${day.dayOfWeek}`}
              className="p-4 rounded-2xl border mb-3 shadow-sm"
              style={{
                backgroundColor: colors.surface,
                borderColor: isToday ? colors.primary : colors.border,
                borderWidth: isToday ? 1.5 : 1,
              }}
            >
              {/* Day Header */}
              <View
                className="flex-row items-center justify-between pb-2.5 border-b"
                style={{ borderColor: colors.border }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-7 h-7 rounded-lg items-center justify-center mr-2.5"
                    style={{
                      backgroundColor: isToday
                        ? colors.primary
                        : `${colors.border}77`,
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: isToday ? '#FFFFFF' : colors.textMain }}
                    >
                      {day.shortName}
                    </Text>
                  </View>
                  <Text
                    className="text-base font-bold"
                    style={{
                      color: isToday ? colors.primary : colors.textMain,
                    }}
                  >
                    {day.dayName}
                  </Text>
                </View>

                {isToday && (
                  <View
                    testID="schedule-today-badge"
                    className="px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${colors.primary}1A` }}
                  >
                    <Text
                      className="text-xs font-bold tracking-wide"
                      style={{ color: colors.primary }}
                    >
                      HÔM NAY
                    </Text>
                  </View>
                )}
              </View>

              {/* Stations Grid */}
              <View className="pt-3 flex-row flex-wrap gap-2">
                {day.stations.map((station) => (
                  <Pressable
                    key={station.code}
                    testID={`schedule-station-${station.code}`}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Xem kết quả đài ${station.name}`}
                    accessibilityHint="Mở màn hình kết quả của đài này"
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/results',
                        params: { station: station.code },
                      })
                    }
                    className="px-3 py-2 rounded-xl border flex-row items-center active:opacity-70"
                    style={{
                      backgroundColor: isToday
                        ? `${colors.primary}0D`
                        : colors.background,
                      borderColor: isToday
                        ? `${colors.primary}33`
                        : colors.border,
                    }}
                  >
                    <View
                      className="w-2 h-2 rounded-full mr-2"
                      style={{
                        backgroundColor: isToday
                          ? colors.primary
                          : colors.textMuted,
                      }}
                    />
                    <Text
                      className="text-xs font-semibold"
                      style={{
                        color: isToday ? colors.primary : colors.textMain,
                      }}
                    >
                      {station.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
