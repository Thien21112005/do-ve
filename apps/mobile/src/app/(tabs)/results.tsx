import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DateStrip,
  StationChips,
  OfflineBanner,
  Icon,
  DrawTable,
} from '@/components';
import { useDraw } from '@/hooks';
import { useTheme } from '@/theme';
import { formatDateVN } from '@/lib/format';
import { STRINGS } from '@/lib/strings';

export default function ResultsScreen() {
  const { colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedStation, setSelectedStation] = useState<string>('');

  const { draw, isLoading, isError, refetch } = useDraw(
    selectedDate,
    selectedStation,
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const formattedDate = formatDateVN(selectedDate);

  return (
    <SafeAreaView
      testID="results-screen"
      edges={['bottom']}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView
        testID="results-scroll-view"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1"
        refreshControl={
          <RefreshControl
            testID="results-refresh-control"
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Offline Banner */}
        <OfflineBanner onRetry={refetch} />

        {/* Section: Chọn ngày mở thưởng */}
        <View className="pt-3 px-4 pb-1">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {STRINGS.results.dateLabel}
          </Text>
        </View>
        <DateStrip
          selectedDate={selectedDate}
          onSelectDate={(newDate) => {
            setSelectedDate(newDate);
          }}
        />

        {/* Section: Chọn đài quay */}
        <View className="pt-2 px-4 pb-1">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {STRINGS.results.stationLabel}
          </Text>
        </View>
        <StationChips
          selectedDate={selectedDate}
          selectedStation={selectedStation}
          onSelectStation={setSelectedStation}
        />

        {/* Draw details container */}
        <View testID="results-draw-container" className="mt-4 mx-4">
          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                className="mt-3 text-sm"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.results.loading}
              </Text>
            </View>
          ) : isError || !draw ? (
            <View
              className="p-5 rounded-2xl border items-center text-center mt-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Icon name="clock" size={32} color={colors.pending} />
              <Text
                className="text-base font-bold mt-2.5 text-center"
                style={{ color: colors.textMain }}
              >
                {STRINGS.results.emptyTitle}
              </Text>
              <Text
                className="text-xs text-center mt-1 leading-5"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.results.emptyMessage(formattedDate)}
              </Text>
            </View>
          ) : (
            <View
              className="p-4 rounded-2xl border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              {/* Draw Header */}
              <View
                className="flex-row items-center justify-between pb-3 border-b"
                style={{ borderColor: colors.border }}
              >
                <View>
                  <Text
                    className="text-base font-bold"
                    style={{ color: colors.textMain }}
                  >
                    {draw.stationName || draw.stationCode}
                  </Text>
                  <Text
                    className="text-xs mt-0.5"
                    style={{ color: colors.textMuted }}
                  >
                    {STRINGS.results.drawDatePrefix} {formattedDate}
                  </Text>
                </View>
                <View
                  className="px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      draw.status === 'FINAL'
                        ? `${colors.win}1A`
                        : `${colors.pending}1A`,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{
                      color:
                        draw.status === 'FINAL' ? colors.win : colors.pending,
                    }}
                  >
                    {draw.status === 'FINAL'
                      ? STRINGS.results.statusFinal
                      : STRINGS.results.statusPending}
                  </Text>
                </View>
              </View>

              {/* Detailed DrawTable (T06.24) */}
              <View className="mt-3">
                <DrawTable prizes={draw.prizes} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
