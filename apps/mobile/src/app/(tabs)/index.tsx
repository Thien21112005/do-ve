import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  Animated,
  AccessibilityInfo,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Icon,
  OfflineBanner,
  HomeDrawsSkeleton,
  TicketInput,
  ResultStub,
} from '@/components';
import {
  Text as UiText,
  Perforation,
  Chip,
  Button,
  SectionHeader,
  ListRow,
  Banner,
  EmptyState,
  usePressed,
} from '@/components/ui';
import { useLatestDraws, useCheckTicket, useActiveDrawSession } from '@/hooks';
import { useSavedTickets, saveTicket } from '@/store/ticketStore';
import { useTheme, layout, radii } from '@/theme';
import { formatDateVN } from '@/lib/format';
import { todayVN, nowVN, weekdayVN, isLiveDrawingVN } from '@/lib/date';
import { WEEKLY_SCHEDULE } from '@/lib/schedule';
import { STRINGS } from '@/lib/strings';
import { haptics } from '@/lib/haptics';
import { computeTodayStatus } from '@/lib/todayStatus';
import type { UiDrawView } from '@/api/mappers';

interface LatestDrawRowProps {
  draw: UiDrawView;
  isLast: boolean;
  onPress: () => void;
}

function LatestDrawRow({ draw, isLast, onPress }: LatestDrawRowProps) {
  const { colors } = useTheme();
  const { pressed, pressHandlers } = usePressed();
  const formattedDrawDate = formatDateVN(draw.drawDate);
  const drawNumbers = draw.numbers || draw.prizes;
  const specialNumber = drawNumbers?.SPECIAL?.[0];
  const stationLabel = draw.stationName || draw.stationCode;

  return (
    <Pressable
      testID={`latest-draw-card-${draw.stationCode}`}
      accessibilityRole="button"
      accessibilityLabel={`Kết quả đài ${stationLabel}, kỳ quay ngày ${formattedDrawDate}${
        specialNumber ? `, giải Đặc biệt ${specialNumber}` : ', đang cập nhật'
      }`}
      onPress={() => {
        haptics.selection?.();
        onPress();
      }}
      {...pressHandlers}
      style={[
        styles.drawRow,
        {
          backgroundColor: colors.surface,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <View style={styles.drawRowLeft}>
        <UiText variant="bodyStrong" color={colors.textMain} numberOfLines={1}>
          {stationLabel}
        </UiText>
      </View>

      <View style={styles.drawRowRight}>
        {specialNumber ? (
          <>
            <UiText
              variant="caption"
              color={colors.textMuted}
              style={styles.specialTag}
            >
              ĐB
            </UiText>
            <UiText
              variant="ticketMd"
              color={colors.special}
              style={styles.specialDigits}
            >
              {specialNumber}
            </UiText>
          </>
        ) : (
          <UiText variant="caption" color={colors.pending}>
            {STRINGS.results.statusPending}
          </UiText>
        )}
        <UiText
          variant="body"
          color={colors.textMuted}
          style={styles.rowChevron}
        >
          ›
        </UiText>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { pressed: changePressed, pressHandlers: changeHandlers } = usePressed();
  const { pressed: fullTablePressed, pressHandlers: fullTableHandlers } =
    usePressed();
  const router = useRouter();
  const { draws, isLoading, isError, refetch } = useLatestDraws();
  const {
    checkTicket: doCheckTicket,
    result,
    isLoading: isChecking,
    reset: resetCheck,
  } = useCheckTicket();
  const [savedTickets] = useSavedTickets();

  const [refreshing, setRefreshing] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [saved, setSaved] = useState(false);

  const today = todayVN();
  const todayStr = formatDateVN(today);
  const weekday = weekdayVN(today);
  const scheduleDay = useMemo(
    () => WEEKLY_SCHEDULE.find((s) => s.dayOfWeek === weekday),
    [weekday],
  );
  const todayStations = scheduleDay?.stations || [];

  // Quick check always uses one consistent session: the station chips
  // and the draw date come from the same day (T11.08).
  const session = useActiveDrawSession();
  const sessionDay = WEEKLY_SCHEDULE.find((s) => s.dayOfWeek === session.dayOfWeek);
  const activeStation = session.stations.some((st) => st.code === selectedStation)
    ? selectedStation
    : session.stations[0]?.code || '';

  // Check live drawing window (DRAW_WINDOW, T11.20)
  const isLive = isLiveDrawingVN();

  // Today's status from data: yesterday's draws never make today "final" (T11.09)
  const todayStatus = useMemo(() => {
    const { hour, minute } = nowVN();
    return computeTodayStatus({
      today,
      minutes: hour * 60 + minute,
      isLive,
      stationsCount: todayStations.length,
      draws,
    });
  }, [today, isLive, todayStations.length, draws]);

  // Animated pulse dot for live drawing, respects reduceMotion
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    if (!isLive || reduceMotion) {
      pulseAnim.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.25,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [isLive, reduceMotion, pulseAnim]);

  // Auto-refetch every 60s when screen is focused during live drawing window
  useFocusEffect(
    useCallback(() => {
      if (!isLive) return;
      const interval = setInterval(() => {
        refetch();
      }, 60000);
      return () => clearInterval(interval);
    }, [isLive, refetch]),
  );

  const pendingCount = savedTickets.filter((t) => t.status === 'PENDING').length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleQuickCheck = () => {
    const clean = ticketNumber.replace(/\D/g, '');
    if (clean.length !== 6 || isChecking) return;
    haptics.medium();
    setSaved(false);
    doCheckTicket({
      ticket: clean,
      stationCode: activeStation,
      drawDate: session.date,
    });
  };

  const handleSaveResultTicket = async () => {
    if (!result || saved) return;
    haptics.success();
    await saveTicket({
      ticket: result.ticket,
      station: result.stationCode,
      stationName: result.stationName,
      drawDate: result.drawDate,
      status: result.won
        ? 'WON'
        : result.status === 'RESULT_NOT_AVAILABLE'
          ? 'PENDING'
          : 'LOST',
      totalPrize: result.totalAmount,
      wins: result.wins || [],
    });
    setSaved(true);
  };

  const handleResetQuickCheck = () => {
    resetCheck();
    setTicketNumber('');
    setSaved(false);
  };

  return (
    <SafeAreaView
      testID="home-screen"
      edges={['bottom']}
      className="flex-1 bg-background"
      style={{ backgroundColor: colors.background }}
    >
      {/* Offline Banner — pinned directly under header (T11.48) */}
      <OfflineBanner onRetry={refetch} />

      <ScrollView
        testID="home-scroll-view"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
        }}
        className="flex-1"
        refreshControl={
          <RefreshControl
            testID="home-refresh-control"
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* 1. Today Block — data-driven stations & status without repeated branding (T11.30) */}
        <View className="px-4 pt-4 pb-1" testID="home-today-status">
          <UiText
            testID="home-today-stations"
            variant="title"
            color={colors.textMain}
          >
            {todayStations.length > 0
              ? todayStations.map((s) => s.name).join(' · ')
              : STRINGS.schedule.todayTag}
          </UiText>

          <View className="flex-row items-center mt-1">
            {isLive ? (
              <Animated.View
                testID="home-live-pulse-dot"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginRight: 6,
                  backgroundColor: colors.pending,
                  opacity: !reduceMotion ? pulseAnim : 1,
                }}
              />
            ) : null}
            <UiText
              variant="caption"
              color={
                todayStatus.kind === 'live'
                  ? colors.pending
                  : todayStatus.kind === 'final'
                    ? colors.win
                    : colors.textMuted
              }
            >
              {scheduleDay?.dayName || STRINGS.schedule.todayTag}, {todayStr} ·{' '}
              {todayStatus.label}
            </UiText>
          </View>

          <Perforation />
        </View>

        {/* 2. Inline Quick Check — 6-box TicketInput + ResultStub (T11.31) */}
        <View className="px-4 py-2">
          <View className="flex-row items-center justify-between mb-2.5">
            <UiText variant="title" color={colors.textMain}>
              {STRINGS.home.quickCheckTitle}
            </UiText>
            <Pressable
              testID="home-quick-check-change-btn"
              accessibilityRole="button"
              accessibilityLabel="Đổi kỳ dò hoặc dò nhiều vé"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => router.push('/(tabs)/check')}
              {...changeHandlers}
              style={{ opacity: changePressed ? 0.7 : 1 }}
            >
              <UiText variant="caption" color={colors.textMuted}>
                kỳ {sessionDay?.shortName || ''}{' '}
                {formatDateVN(session.date).slice(0, 5)}{'  '}
                <UiText variant="bodyStrong" color={colors.primary}>
                  Đổi ›
                </UiText>
              </UiText>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          >
            {session.stations.map((st) => (
              <Chip
                key={st.code}
                label={st.name}
                selected={activeStation === st.code}
                onPress={() => {
                  setSelectedStation(st.code);
                  if (result) resetCheck();
                  setSaved(false);
                }}
              />
            ))}
          </ScrollView>

          <TicketInput
            testID="home-ticket-input"
            autoFocus={false}
            value={ticketNumber}
            onChangeText={(val) => {
              setTicketNumber(val);
              if (result) resetCheck();
              setSaved(false);
            }}
            disabled={isChecking}
          />

          {!result ? (
            <Button
              testID="home-quick-check-btn"
              size="lg"
              title={STRINGS.home.quickCheckBtn}
              accessibilityLabel={STRINGS.home.quickCheckBtn}
              loading={isChecking}
              disabled={!/^\d{6}$/.test(ticketNumber) || isChecking}
              onPress={handleQuickCheck}
              style={{ marginTop: 12 }}
            />
          ) : (
            <ResultStub
              result={result}
              compact={true}
              showPerforation={true}
              testID="home-quick-check-result"
              onSaveTicket={handleSaveResultTicket}
              isSaved={saved}
              onCheckAgain={handleResetQuickCheck}
            />
          )}
        </View>

        {/* 3. Latest Draws — flat rows >=56pt without card-in-card or G1/G8 clutter (T11.32) */}
        <SectionHeader
          title={
            draws[0]?.drawDate
              ? `${STRINGS.home.latestDrawsTitle} · ${
                  WEEKLY_SCHEDULE.find(
                    (s) => s.dayOfWeek === weekdayVN(draws[0].drawDate),
                  )?.shortName || ''
                } ${formatDateVN(draws[0].drawDate).slice(0, 5)}`.replace(
                  '·  ',
                  '· ',
                )
              : STRINGS.home.latestDrawsTitle
          }
          actionText={STRINGS.home.viewAll}
          actionTestID="home-view-all-draws-btn"
          onAction={() =>
            router.push({
              pathname: '/(tabs)/results',
              params: draws[0]?.drawDate ? { date: draws[0].drawDate } : undefined,
            })
          }
        />

        <View className="px-4 pb-2">
          {/* Loading State (T10.21) */}
          {isLoading ? (
            <View testID="home-draws-loading">
              <HomeDrawsSkeleton count={3} />
            </View>
          ) : null}

          {/* Error State — unified actionable Banner (T11.48) */}
          {!isLoading && isError ? (
            <Banner
              testID="home-draws-error-banner"
              actionTestID="home-draws-retry-btn"
              variant="error"
              title={STRINGS.home.errorLatest}
              message="Kiểm tra kết nối mạng và bấm Thử lại để cập nhật."
              icon={<Icon name="alertCircle" size={18} color={colors.error} />}
              actionText={STRINGS.common.retry}
              onAction={() => refetch()}
            />
          ) : null}

          {/* Empty State */}
          {!isLoading && !isError && draws.length === 0 ? (
            <View
              style={[
                styles.stateCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <EmptyState
                icon={<Icon name="clock" size={28} color={colors.pending} />}
                title={STRINGS.home.emptyLatestTitle}
                description={STRINGS.home.emptyLatestDesc}
                style={{ paddingVertical: 24 }}
              />
            </View>
          ) : null}

          {/* Flat Draw Rows */}
          {!isLoading && !isError && draws.length > 0 ? (
            <View
              style={[
                styles.flatListGroup,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {draws.map((draw) => (
                <LatestDrawRow
                  key={`${draw.stationCode}-${draw.drawDate}`}
                  draw={draw}
                  isLast={false}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/results',
                      params: {
                        station: draw.stationCode,
                        date: draw.drawDate,
                      },
                    })
                  }
                />
              ))}

              <Pressable
                testID="home-view-full-table-btn"
                accessibilityRole="button"
                accessibilityLabel="Xem bảng đầy đủ"
                onPress={() => {
                  haptics.selection?.();
                  router.push({
                    pathname: '/(tabs)/results',
                    params: draws[0]?.drawDate
                      ? { date: draws[0].drawDate }
                      : undefined,
                  });
                }}
                {...fullTableHandlers}
                style={[
                  styles.fullTableRow,
                  {
                    backgroundColor: colors.surface,
                    opacity: fullTablePressed ? 0.72 : 1,
                  },
                ]}
              >
                <UiText variant="bodyStrong" color={colors.primary}>
                  Xem bảng đầy đủ ›
                </UiText>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* 4. My Tickets Shortcut — clean ListRow (T11.32) */}
        <View className="px-4 pt-2 pb-1">
          <ListRow
            testID="home-my-tickets-shortcut"
            title="Vé của tôi"
            subtitle={
              pendingCount > 0
                ? `${pendingCount} vé đang chờ kết quả`
                : `${savedTickets.length} vé đã lưu trên máy`
            }
            icon={
              <Icon
                name={pendingCount > 0 ? 'clock' : 'bookmark'}
                size={18}
                color={pendingCount > 0 ? colors.pending : colors.textMuted}
              />
            }
            showChevron={true}
            onPress={() => router.push('/(tabs)/tickets')}
            style={{
              borderWidth: 1,
              borderBottomWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flatListGroup: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  drawRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  drawRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  drawRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialTag: {
    marginRight: 8,
    fontFamily: 'BeVietnamPro-SemiBold',
  },
  specialDigits: {
    letterSpacing: 1.5,
  },
  rowChevron: {
    marginLeft: 10,
    fontSize: 20,
    lineHeight: 22,
  },
  fullTableRow: {
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stateCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
});
