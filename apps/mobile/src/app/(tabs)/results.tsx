import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import {
  DateStrip,
  StationChips,
  OfflineBanner,
  Icon,
  DrawTable,
  MultiStationDrawTable,
  Segmented,
  DrawTableSkeleton,
} from '@/components';
import { useDraw, useSchedule, useDailyDraws } from '@/hooks';
import { useTheme, layout } from '@/theme';
import {
  formatDateVN,
  getEstimatedDrawTimeMessage,
  formatDrawForShare,
  formatDailyDrawsForShare,
} from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { todayVN } from '@/lib';
import { STRINGS } from '@/lib/strings';
import { getApiErrorMessage } from '@/api/client';

export default function ResultsScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ station?: string; date?: string }>();
  const [selectedDate, setSelectedDate] = useState(() => params.date || todayVN());
  const [selectedStation, setSelectedStation] = useState<string>(
    () => params.station || '',
  );

  // Follow incoming route params (e.g. "Xem bảng" from another tab) without
  // stale-closure effects: compare with the previous params during render.
  const [prevParams, setPrevParams] = useState({
    station: params.station,
    date: params.date,
  });
  if (params.station !== prevParams.station || params.date !== prevParams.date) {
    setPrevParams({ station: params.station, date: params.date });
    if (params.station && params.station !== prevParams.station) {
      setSelectedStation(params.station);
    }
    if (params.date && params.date !== prevParams.date) {
      setSelectedDate(params.date);
    }
  }

  const { stations, isLoading: isScheduleLoading } = useSchedule(selectedDate);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [quickQuery, setQuickQuery] = useState('');

  const {
    draws: dailyDraws,
    isLoading: isDailyLoading,
    isError: isDailyError,
    error: dailyError,
    refetch: refetchDaily,
  } = useDailyDraws(selectedDate, stations);

  const { draw, isLoading, isError, error, refetch } = useDraw(
    selectedDate,
    selectedStation,
  );

  // T09.29: Avoid empty state flash before station chips are loaded and auto-selected
  const isWaitingForStation =
    !selectedStation && (isScheduleLoading || stations.length > 0);
  const showLoading =
    viewMode === 'all'
      ? isDailyLoading
      : isWaitingForStation || (Boolean(selectedStation) && isLoading);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (viewMode === 'all') {
        await refetchDaily();
      } else {
        await refetch();
      }
    } finally {
      setRefreshing(false);
    }
  }, [viewMode, refetch, refetchDaily]);

  const formattedDate = formatDateVN(selectedDate);

  const handleShare = useCallback(async () => {
    if (!draw) return;
    try {
      haptics.selection();
      const message = formatDrawForShare(draw, formattedDate);
      await Share.share({
        message,
        title: STRINGS.results.shareTitle(
          draw.stationName || draw.stationCode,
          formattedDate,
        ),
      });
    } catch {
      // share cancelled or dismissed
    }
  }, [draw, formattedDate]);

  const handleShareDaily = useCallback(async () => {
    if (!dailyDraws || dailyDraws.length === 0) return;
    try {
      haptics.selection();
      const message = formatDailyDrawsForShare(dailyDraws, formattedDate);
      await Share.share({
        message,
        title: STRINGS.results.shareTitle('Miền Nam', formattedDate),
      });
    } catch {
      // share cancelled or dismissed
    }
  }, [dailyDraws, formattedDate]);

  return (
    <SafeAreaView
      testID="results-screen"
      edges={['bottom']}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView
        testID="results-scroll-view"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          width: '100%',
          maxWidth: viewMode === 'all' ? layout.tableMaxWidth : layout.contentMaxWidth,
          alignSelf: 'center',
        }}
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

        {/* Section: Chế độ xem Từng đài / Cả ngày (T10.39) */}
        <View className="px-4 pt-3 pb-1">
          <Segmented
            testID="results-view-mode-segmented"
            selectedKey={viewMode}
            onChange={(key) => setViewMode(key as 'single' | 'all')}
            options={[
              {
                key: 'single',
                label: STRINGS.results.viewModeSingle,
                testID: 'results-view-mode-single',
              },
              {
                key: 'all',
                label: STRINGS.results.viewModeAll,
                testID: 'results-view-mode-all',
              },
            ]}
          />
        </View>

        {viewMode === 'single' && (
          <>
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
          </>
        )}

        {/* Quick Search within Table (T10.40) */}
        <View className="mx-4 mt-3 mb-1" testID="results-quick-search-box">
          <View
            className="flex-row items-center px-3 py-2 rounded-xl border"
            style={{
              backgroundColor: colors.surface,
              borderColor: quickQuery ? colors.primary : colors.border,
            }}
          >
            <Icon name="search" size={16} color={colors.textMuted} />
            <TextInput
              testID="results-quick-search-input"
              value={quickQuery}
              onChangeText={(text) =>
                setQuickQuery(text.replace(/\D/g, '').slice(0, 6))
              }
              placeholder={STRINGS.results.quickSearchPlaceholder}
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              className="flex-1 ml-2 text-sm p-0"
              style={{
                color: colors.textMain,
                fontVariant: ['tabular-nums'],
              }}
            />
            {quickQuery.length > 0 && (
              <TouchableOpacity
                testID="results-quick-search-clear-btn"
                onPress={() => setQuickQuery('')}
                accessibilityRole="button"
                accessibilityLabel={STRINGS.results.quickSearchClear}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="p-1"
              >
                <Icon name="x" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Draw details container */}
        <View testID="results-draw-container" className="mt-4 mx-4">
          {viewMode === 'all' ? (
            showLoading ? (
              <DrawTableSkeleton testID="draw-table-skeleton" />
            ) : isDailyError ? (
              <View
                testID="results-error-container"
                className="p-5 rounded-2xl border items-center text-center mt-2"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.error,
                }}
              >
                <Icon name="alertCircle" size={32} color={colors.error} />
                <Text
                  className="text-base font-bold mt-2.5 text-center"
                  style={{ color: colors.error }}
                >
                  {getApiErrorMessage(
                    dailyError,
                    STRINGS.results.errorLoading,
                  )}
                </Text>
                <TouchableOpacity
                  testID="results-error-retry-btn"
                  onPress={() => refetchDaily()}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="mt-3.5 px-4 py-2 rounded-xl border flex-row items-center justify-center min-h-[44px]"
                  style={{
                    borderColor: colors.error,
                    backgroundColor: `${colors.error}15`,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.error }}
                  >
                    Thử lại
                  </Text>
                </TouchableOpacity>
              </View>
            ) : dailyDraws.length === 0 ? (
              <View
                testID="results-empty-container"
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
                {/* Estimated time notice (T10.42) */}
                <View
                  testID="results-empty-estimated-time"
                  className="mt-2.5 px-3 py-1.5 rounded-lg border flex-row items-center"
                  style={{
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.pending }}
                  >
                    {getEstimatedDrawTimeMessage(selectedDate)}
                  </Text>
                </View>
                <Text
                  className="text-xs text-center mt-2 leading-5"
                  style={{ color: colors.textMuted }}
                >
                  {STRINGS.results.emptyMessage(formattedDate)}
                </Text>
              </View>
            ) : (
              <View
                className="p-3 rounded-2xl border"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <View
                  className="flex-row items-center justify-between pb-2 mb-2 border-b"
                  style={{ borderColor: colors.border }}
                >
                  <Text
                    className="text-sm font-bold"
                    style={{ color: colors.textMain }}
                  >
                    {STRINGS.results.allStationsSummary(dailyDraws.length)}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text
                      className="text-xs font-medium"
                      style={{ color: colors.textMuted }}
                    >
                      {formattedDate}
                    </Text>
                    <TouchableOpacity
                      testID="results-share-daily-btn"
                      onPress={handleShareDaily}
                      accessibilityRole="button"
                      accessibilityLabel={STRINGS.results.shareA11y}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      className="p-1.5 rounded-lg border items-center justify-center"
                      style={{
                        backgroundColor: colors.surfaceSubtle,
                        borderColor: colors.border,
                      }}
                    >
                      <Icon name="share" size={14} color={colors.textMain} />
                    </TouchableOpacity>
                  </View>
                </View>
                <MultiStationDrawTable
                  draws={dailyDraws}
                  highlightQuery={quickQuery}
                />
              </View>
            )
          ) : showLoading ? (
            <DrawTableSkeleton testID="draw-table-skeleton" />
          ) : isError ? (
            <View
              testID="results-error-container"
              className="p-5 rounded-2xl border items-center text-center mt-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.error,
              }}
            >
              <Icon name="alertCircle" size={32} color={colors.error} />
              <Text
                className="text-base font-bold mt-2.5 text-center"
                style={{ color: colors.error }}
              >
                {getApiErrorMessage(error, STRINGS.results.errorLoading)}
              </Text>
              <TouchableOpacity
                testID="results-error-retry-btn"
                onPress={() => refetch()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="mt-3.5 px-4 py-2 rounded-xl border flex-row items-center justify-center min-h-[44px]"
                style={{
                  borderColor: colors.error,
                  backgroundColor: `${colors.error}15`,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.error }}
                >
                  Thử lại
                </Text>
              </TouchableOpacity>
            </View>
          ) : !selectedStation ? (
            <View
              testID="results-no-station-container"
              className="p-6 rounded-2xl border items-center text-center mt-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Icon name="mapPin" size={32} color={colors.primary} />
              <Text
                className="text-base font-bold mt-2.5 text-center"
                style={{ color: colors.textMain }}
              >
                {STRINGS.results.noStationSelectedTitle}
              </Text>
              <Text
                className="text-xs text-center mt-1.5 leading-5 px-2"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.results.noStationSelectedDesc(formattedDate)}
              </Text>
            </View>
          ) : !draw ? (
            <View
              testID="results-empty-container"
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
              {/* Estimated time notice (T10.42) */}
              <View
                testID="results-empty-estimated-time"
                className="mt-2.5 px-3 py-1.5 rounded-lg border flex-row items-center"
                style={{
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.pending }}
                >
                  {getEstimatedDrawTimeMessage(selectedDate)}
                </Text>
              </View>
              <Text
                className="text-xs text-center mt-2 leading-5"
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
                <View className="flex-1 mr-2">
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
                <View className="flex-row items-center gap-2">
                  <View
                    className="px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        draw.status === 'FINAL' || draw.isComplete
                          ? `${colors.win}1A`
                          : `${colors.pending}1A`,
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{
                        color:
                          draw.status === 'FINAL' || draw.isComplete ? colors.win : colors.pending,
                      }}
                    >
                      {draw.status === 'FINAL' || draw.isComplete
                        ? STRINGS.results.statusFinal
                        : STRINGS.results.statusPending}
                    </Text>
                  </View>
                  <TouchableOpacity
                    testID="results-share-btn"
                    onPress={handleShare}
                    accessibilityRole="button"
                    accessibilityLabel={STRINGS.results.shareA11y}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    className="p-1.5 rounded-lg border items-center justify-center"
                    style={{
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.border,
                    }}
                  >
                    <Icon name="share" size={16} color={colors.textMain} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Detailed DrawTable (T06.24 & T10.40) */}
              <View className="mt-3">
                <DrawTable
                  prizes={draw.prizes}
                  numbers={draw.numbers}
                  highlightQuery={quickQuery}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
