import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text, usePressed } from '@/components/ui';
import { useTheme, layout, radii } from '@/theme';
import { STRINGS } from '@/lib/strings';
import {
  weekdayVN,
  WEEKLY_SCHEDULE,
  getMostRecentDateForWeekday,
  haptics,
  type ScheduledStation,
  type DaySchedule,
} from '@/lib';
import { useWeeklySchedule } from '@/hooks';

export { WEEKLY_SCHEDULE, type ScheduledStation, type DaySchedule };

function getTodayWeekday(): number {
  return weekdayVN(new Date());
}

function ScheduleStationChip({
  station,
  isToday,
  onPress,
}: {
  station: ScheduledStation;
  isToday: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const { pressed, pressHandlers } = usePressed();

  return (
    <Pressable
      testID={`schedule-station-${station.code}`}
      accessibilityRole="button"
      accessibilityLabel={`Xem kết quả đài ${station.name}`}
      accessibilityHint={STRINGS.schedule.openResultA11yHint}
      onPress={onPress}
      {...pressHandlers}
      style={[
        styles.stationChip,
        {
          backgroundColor: isToday ? colors.surface : colors.surfaceSubtle,
          borderColor: isToday ? colors.primary : colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <Text
        variant="caption"
        color={isToday ? colors.primary : colors.textMain}
        style={styles.stationChipText}
      >
        {station.name}
      </Text>
    </Pressable>
  );
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
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
        }}
        className="flex-1 px-4 pt-3"
      >
        {/* Concise Draw Time & Holiday Notice */}
        <View style={styles.noticeBlock}>
          <Text variant="bodyStrong" color={colors.textMain}>
            {STRINGS.schedule.drawTimeTitle}
          </Text>
          <Text
            variant="caption"
            color={colors.textMuted}
            style={styles.noticeSub}
          >
            {STRINGS.schedule.holidayNotice}
          </Text>
        </View>

        {/* 7-Row Schedule Table — no outer accessible=true on rows (T11.46) */}
        <View
          style={[
            styles.tableFrame,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {schedule.map((day, idx) => {
            const isToday = day.dayOfWeek === todayWeekday;
            const isLast = idx === schedule.length - 1;
            const nearestDate = getMostRecentDateForWeekday(day.dayOfWeek);

            return (
              <View
                key={day.dayOfWeek}
                testID={`schedule-day-${day.dayOfWeek}`}
                accessible={false}
                style={[
                  styles.dayRow,
                  {
                    backgroundColor: isToday
                      ? colors.primaryTint
                      : colors.surface,
                    borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                {/* Left Column: Weekday + Today tag */}
                <View style={styles.dayLabelCol}>
                  <Text
                    variant="bodyStrong"
                    color={isToday ? colors.primary : colors.textMain}
                  >
                    {day.dayName}
                  </Text>
                  {isToday ? (
                    <View
                      testID="schedule-today-badge"
                      style={[
                        styles.todayPill,
                        {
                          backgroundColor: colors.primary,
                        },
                      ]}
                    >
                      <Text
                        variant="caption"
                        color={colors.onPrimary}
                        style={styles.todayPillText}
                      >
                        {STRINGS.schedule.todayTag}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Right Column: Tappable Stations */}
                <View style={styles.stationsCol}>
                  {day.stations.map((station) => (
                    <ScheduleStationChip
                      key={station.code}
                      station={station}
                      isToday={isToday}
                      onPress={() => {
                        haptics.selection?.();
                        router.push({
                          pathname: '/(tabs)/results',
                          params: {
                            station: station.code,
                            date: nearestDate,
                          },
                        });
                      }}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  noticeBlock: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  noticeSub: {
    marginTop: 4,
    lineHeight: 19,
  },
  tableFrame: {
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 56,
  },
  dayLabelCol: {
    width: 92,
    paddingTop: 4,
    paddingRight: 8,
  },
  todayPill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  todayPillText: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: 'BeVietnamPro-SemiBold',
  },
  stationsCol: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stationChip: {
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
  stationChipText: {
    fontFamily: 'BeVietnamPro-Medium',
  },
});
