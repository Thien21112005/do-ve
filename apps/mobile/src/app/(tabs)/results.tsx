import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  TextInput,
  Share,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import {
  StationChips,
  OfflineBanner,
  Icon,
  DrawTable,
  MultiStationDrawTable,
  Segmented,
  DrawTableSkeleton,
} from '@/components';
import {
  Text,
  Banner,
  CalendarPickerSheet,
  usePressed,
} from '@/components/ui';
import {
  useDraw,
  useSchedule,
  useDailyDraws,
  useActiveDrawSession,
} from '@/hooks';
import { useTheme, layout, radii } from '@/theme';
import {
  formatDateVN,
  getEstimatedDrawTimeMessage,
  formatDrawForShare,
  formatDailyDrawsForShare,
} from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { todayVN, addDays, weekdayVN } from '@/lib';
import { WEEKLY_SCHEDULE } from '@/lib/schedule';
import { STRINGS } from '@/lib/strings';
import { getApiErrorMessage } from '@/api/client';
import { DRAW_TIERS } from '@/components/DrawTable';
import { findQuickMatches, quickSearchFeedback } from '@/lib/quickSearch';

export default function ResultsScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    station?: string;
    date?: string;
    mode?: string;
  }>();
  const activeSession = useActiveDrawSession();

  const [selectedDate, setSelectedDate] = useState(
    () => params.date || activeSession.date,
  );
  const [selectedStation, setSelectedStation] = useState<string>(
    () => params.station || '',
  );
  const [dateSheetOpen, setDateSheetOpen] = useState(false);

  const { pressed: prevPressed, pressHandlers: prevHandlers } = usePressed();
  const { pressed: nextPressed, pressHandlers: nextHandlers } = usePressed();
  const { pressed: datePressed, pressHandlers: dateHandlers } = usePressed();
  const { pressed: calPressed, pressHandlers: calHandlers } = usePressed();
  const { pressed: sharePressed, pressHandlers: shareHandlers } = usePressed();
  const { pressed: shareDailyPressed, pressHandlers: shareDailyHandlers } =
    usePressed();
  const { pressed: clearPressed, pressHandlers: clearHandlers } = usePressed();

  // Follow incoming route params (e.g. "Xem bảng" from another tab) without
  // stale-closure effects: compare with the previous params during render (T11.05).
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
  const [viewMode, setViewMode] = useState<'single' | 'all'>(() =>
    params.mode === 'all' ? 'all' : 'single',
  );
  const [quickQuery, setQuickQuery] = useState('');

  // Keep station aligned with current date's schedule even while StationChips is unmounted in 'all' mode (T12.07)
  const effectiveStation =
    stations.length > 0 && !stations.some((s) => s.code === selectedStation)
      ? stations[0]?.code || ''
      : selectedStation;

  const {
    draws: dailyDraws,
    isLoading: isDailyLoading,
    isError: isDailyError,
    error: dailyError,
    refetch: refetchDaily,
  } = useDailyDraws(
    selectedDate,
    stations,
    viewMode === 'all' && !isScheduleLoading,
  );

  const { draw, availability, isLoading, isError, error, refetch } = useDraw(
    selectedDate,
    effectiveStation,
    viewMode === 'single',
  );

  // T09.29: Avoid empty state flash before station chips are loaded and auto-selected
  const isWaitingForStation =
    !effectiveStation && (isScheduleLoading || stations.length > 0);
  const showLoading =
    viewMode === 'all'
      ? isScheduleLoading || isDailyLoading
      : isWaitingForStation || (Boolean(effectiveStation) && isLoading);

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

  const todayStr = todayVN();
  const formattedDate = formatDateVN(selectedDate);
  const daySchedule = WEEKLY_SCHEDULE.find(
    (s) => s.dayOfWeek === weekdayVN(selectedDate),
  );
  const fullDateLabel = daySchedule?.dayName
    ? `${daySchedule.dayName}, ${formattedDate}`
    : formattedDate;
  const shortDateLabel = `${daySchedule?.shortName || ''} ${formattedDate.slice(0, 5)}`.trim();
  const canStepNext = selectedDate < todayStr;

  // Say what the quick search found, including 'nothing' — but only when a
  // draw table is actually on screen (never while loading, pending or errored) (T11.19)
  const searchDraws = viewMode === 'all' ? dailyDraws : draw ? [draw] : [];
  const hasVisibleTable =
    !showLoading &&
    !(viewMode === 'all' ? isDailyError : isError) &&
    searchDraws.length > 0;
  const quickMatches = hasVisibleTable
    ? findQuickMatches(searchDraws, quickQuery)
    : [];
  const quickFeedback = hasVisibleTable
    ? quickSearchFeedback(
        quickMatches,
        quickQuery,
        (tier) => DRAW_TIERS.find((t) => t.key === tier)?.shortName ?? tier,
        viewMode === 'all',
      )
    : null;

  const handleShare = useCallback(async () => {
    if (!draw) return;
    try {
      haptics.selection?.();
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
      haptics.selection?.();
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
      className="flex-1 bg-background"
      style={{ backgroundColor: colors.background }}
    >
      {/* Offline Banner — pinned directly under header, retries current mode (T11.19 / T11.48) */}
      <OfflineBanner onRetry={viewMode === 'all' ? refetchDaily : refetch} />

      <ScrollView
        testID="results-scroll-view"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          width: '100%',
          maxWidth:
            viewMode === 'all' ? layout.tableMaxWidth : layout.contentMaxWidth,
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
        {/* Compact Date Navigation Bar: ‹ Chủ nhật, 16/11/2026 › 📅 (T11.39) */}
        <View testID="results-date-nav" style={styles.dateNavRow}>
          <View
            style={[
              styles.dateStepperGroup,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Pressable
              testID="results-prev-date-btn"
              accessibilityRole="button"
              accessibilityLabel="Ngày trước"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              onPress={() => {
                haptics.selection?.();
                setSelectedDate((prev) => addDays(prev, -1));
              }}
              {...prevHandlers}
              style={[
                styles.navIconBtn,
                { opacity: prevPressed ? 0.65 : 1 },
              ]}
            >
              <Icon name="chevronLeft" size={20} color={colors.textMain} />
            </Pressable>

            <Pressable
              testID="results-date-picker-btn"
              accessibilityRole="button"
              accessibilityLabel={`Chọn ngày mở thưởng, đang xem ${fullDateLabel}`}
              onPress={() => {
                haptics.selection?.();
                setDateSheetOpen(true);
              }}
              {...dateHandlers}
              style={[
                styles.dateCenterBtn,
                { opacity: datePressed ? 0.72 : 1 },
              ]}
            >
              <Text
                variant="bodyStrong"
                color={colors.textMain}
                numberOfLines={1}
              >
                {fullDateLabel}
              </Text>
            </Pressable>

            <Pressable
              testID="results-next-date-btn"
              accessibilityRole="button"
              accessibilityLabel="Ngày sau"
              accessibilityState={{ disabled: !canStepNext }}
              disabled={!canStepNext}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              onPress={() => {
                if (!canStepNext) return;
                haptics.selection?.();
                setSelectedDate((prev) => addDays(prev, 1));
              }}
              {...nextHandlers}
              style={[
                styles.navIconBtn,
                {
                  opacity: !canStepNext ? 0.3 : nextPressed ? 0.65 : 1,
                },
              ]}
            >
              <Icon name="chevronRight" size={20} color={colors.textMain} />
            </Pressable>
          </View>

          <Pressable
            testID="results-calendar-btn"
            accessibilityRole="button"
            accessibilityLabel={STRINGS.check.openCalendarA11y}
            onPress={() => {
              haptics.selection?.();
              setDateSheetOpen(true);
            }}
            {...calHandlers}
            style={[
              styles.calendarBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: calPressed ? 0.72 : 1,
              },
            ]}
          >
            <Icon name="calendar" size={18} color={colors.textMain} />
          </Pressable>
        </View>

        {/* View Mode: Từng đài | Cả ngày */}
        <View className="px-4 pt-2 pb-1">
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

        {viewMode === 'single' ? (
          <View className="pt-1">
            <StationChips
              selectedDate={selectedDate}
              selectedStation={effectiveStation}
              onSelectStation={setSelectedStation}
            />
          </View>
        ) : null}

        {/* Draw Sheet Container — single flat sheet, zero card-in-card (T11.39) */}
        <View testID="results-draw-container" className="mt-2 mx-4">
          {viewMode === 'all' ? (
            showLoading ? (
              <DrawTableSkeleton testID="draw-table-skeleton" />
            ) : isDailyError ? (
              <Banner
                testID="results-error-container"
                actionTestID="results-error-retry-btn"
                variant="error"
                title={getApiErrorMessage(
                  dailyError,
                  STRINGS.results.errorLoading,
                )}
                message="Bấm Thử lại để cập nhật bảng mở thưởng."
                icon={<Icon name="alertCircle" size={18} color={colors.error} />}
                actionText={STRINGS.common.retry}
                onAction={() => refetchDaily()}
              />
            ) : dailyDraws.length === 0 ? (
              <View
                testID="results-empty-container"
                style={[
                  styles.stateCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Icon name="clock" size={28} color={colors.pending} />
                <Text
                  variant="title"
                  align="center"
                  color={colors.textMain}
                  style={styles.stateTitle}
                >
                  {STRINGS.results.emptyTitle}
                </Text>
                <View
                  testID="results-empty-estimated-time"
                  style={[
                    styles.estimatedBadge,
                    {
                      backgroundColor: colors.pendingTint,
                      borderColor: colors.pendingBorder,
                    },
                  ]}
                >
                  <Text variant="caption" color={colors.pending}>
                    {getEstimatedDrawTimeMessage(selectedDate)}
                  </Text>
                </View>
                <Text
                  variant="caption"
                  align="center"
                  color={colors.textMuted}
                  style={styles.stateDesc}
                >
                  {STRINGS.results.emptyMessage(formattedDate)}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.sheetFrame,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.sheetHeader,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    variant="bodyStrong"
                    color={colors.textMain}
                    style={styles.sheetHeaderTitle}
                  >
                    {STRINGS.results.allStationsSummary(dailyDraws.length)}
                  </Text>
                  <Pressable
                    testID="results-share-daily-btn"
                    onPress={handleShareDaily}
                    accessibilityRole="button"
                    accessibilityLabel={STRINGS.results.shareA11y}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    {...shareDailyHandlers}
                    style={[
                      styles.shareAction,
                      { opacity: shareDailyPressed ? 0.7 : 1 },
                    ]}
                  >
                    <Icon name="share" size={14} color={colors.primary} />
                    <Text
                      variant="caption"
                      color={colors.primary}
                      style={styles.shareLabel}
                    >
                      Chia sẻ
                    </Text>
                  </Pressable>
                </View>
                <MultiStationDrawTable
                  draws={dailyDraws}
                  highlightQuery={quickQuery}
                  borderless={true}
                />
              </View>
            )
          ) : showLoading ? (
            <DrawTableSkeleton testID="draw-table-skeleton" />
          ) : isError ? (
            <Banner
              testID="results-error-container"
              actionTestID="results-error-retry-btn"
              variant="error"
              title={getApiErrorMessage(error, STRINGS.results.errorLoading)}
              message="Bấm Thử lại để cập nhật bảng mở thưởng."
              icon={<Icon name="alertCircle" size={18} color={colors.error} />}
              actionText={STRINGS.common.retry}
              onAction={() => refetch()}
            />
          ) : !effectiveStation ? (
            <View
              testID="results-no-station-container"
              style={[
                styles.stateCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Icon name="mapPin" size={28} color={colors.primary} />
              <Text
                variant="title"
                align="center"
                color={colors.textMain}
                style={styles.stateTitle}
              >
                {STRINGS.results.noStationSelectedTitle}
              </Text>
              <Text
                variant="caption"
                align="center"
                color={colors.textMuted}
                style={styles.stateDesc}
              >
                {STRINGS.results.noStationSelectedDesc(formattedDate)}
              </Text>
            </View>
          ) : !draw ? (
            <View
              testID="results-empty-container"
              style={[
                styles.stateCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Icon name="clock" size={28} color={colors.pending} />
              <Text
                variant="title"
                align="center"
                color={colors.textMain}
                style={styles.stateTitle}
              >
                {availability === 'NOT_DRAWING'
                  ? STRINGS.results.notDrawingTitle
                  : STRINGS.results.emptyTitle}
              </Text>
              {availability !== 'NOT_DRAWING' ? (
                <View
                  testID="results-empty-estimated-time"
                  style={[
                    styles.estimatedBadge,
                    {
                      backgroundColor: colors.pendingTint,
                      borderColor: colors.pendingBorder,
                    },
                  ]}
                >
                  <Text variant="caption" color={colors.pending}>
                    {getEstimatedDrawTimeMessage(selectedDate)}
                  </Text>
                </View>
              ) : null}
              <Text
                variant="caption"
                align="center"
                color={colors.textMuted}
                style={styles.stateDesc}
              >
                {availability === 'NOT_DRAWING'
                  ? STRINGS.results.notDrawingMessage(formattedDate)
                  : STRINGS.results.emptyMessage(formattedDate)}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.sheetFrame,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.sheetHeader,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.sheetHeaderLeft}>
                  <Text
                    variant="bodyStrong"
                    color={colors.textMain}
                    numberOfLines={1}
                  >
                    {draw.stationName || draw.stationCode} · {shortDateLabel}
                  </Text>
                  {!(draw.status === 'FINAL' || draw.isComplete) ? (
                    <Text variant="caption" color={colors.pending}>
                      {STRINGS.results.statusPending}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  testID="results-share-btn"
                  onPress={handleShare}
                  accessibilityRole="button"
                  accessibilityLabel={STRINGS.results.shareA11y}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  {...shareHandlers}
                  style={[
                    styles.shareAction,
                    { opacity: sharePressed ? 0.7 : 1 },
                  ]}
                >
                  <Icon name="share" size={14} color={colors.primary} />
                  <Text
                    variant="caption"
                    color={colors.primary}
                    style={styles.shareLabel}
                  >
                    Chia sẻ
                  </Text>
                </Pressable>
              </View>

              <DrawTable
                prizes={draw.prizes}
                numbers={draw.numbers}
                highlightQuery={quickQuery}
                borderless={true}
              />
            </View>
          )}
        </View>

        {/* Quick Search within Table — placed below draw table (T11.39) */}
        <View className="mx-4 mt-3" testID="results-quick-search-box">
          <View
            style={[
              styles.searchInputWrap,
              {
                backgroundColor: colors.surface,
                borderColor: quickQuery ? colors.primary : colors.border,
              },
            ]}
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
              style={[
                styles.searchInput,
                {
                  color: colors.textMain,
                },
                Platform.OS === 'web'
                  ? ({ outlineStyle: 'none' } as any)
                  : null,
              ]}
            />
            {quickQuery.length > 0 ? (
              <Pressable
                testID="results-quick-search-clear-btn"
                onPress={() => setQuickQuery('')}
                accessibilityRole="button"
                accessibilityLabel={STRINGS.results.quickSearchClear}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                {...clearHandlers}
                style={[
                  styles.clearBtn,
                  { opacity: clearPressed ? 0.7 : 1 },
                ]}
              >
                <Icon name="x" size={16} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
          {quickFeedback ? (
            <Text
              testID="results-quick-search-feedback"
              accessibilityLiveRegion="polite"
              variant="caption"
              color={quickMatches.length > 0 ? colors.textMain : colors.textMuted}
              style={styles.searchFeedback}
            >
              {quickFeedback}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {/* Month Calendar Picker Sheet (T12.09) */}
      <CalendarPickerSheet
        visible={dateSheetOpen}
        selectedDate={selectedDate}
        onSelectDate={(dateStr) => setSelectedDate(dateStr)}
        onClose={() => setDateSheetOpen(false)}
        title="Chọn ngày mở thưởng"
        closeTestID="results-date-picker-close-btn"
        dayTestIDPrefix="results-date-option"
        testID="results-date-picker-sheet"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dateNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  dateStepperGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  navIconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenterBtn: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  calendarBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetFrame: {
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sheetHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  sheetHeaderTitle: {
    flex: 1,
    marginRight: 8,
  },
  shareAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  shareLabel: {
    marginLeft: 5,
    fontFamily: 'BeVietnamPro-SemiBold',
  },
  stateCard: {
    padding: 20,
    borderWidth: 1,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: 4,
  },
  stateTitle: {
    marginTop: 10,
  },
  stateDesc: {
    marginTop: 8,
    lineHeight: 20,
  },
  estimatedBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  retryBtn: {
    marginTop: 14,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    fontFamily: 'BeVietnamPro-Medium',
    fontVariant: ['tabular-nums'],
    paddingVertical: 8,
  },
  clearBtn: {
    padding: 4,
  },
  searchFeedback: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
});
