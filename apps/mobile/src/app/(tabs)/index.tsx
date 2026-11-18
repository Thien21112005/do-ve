import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  TouchableOpacity,
  Animated,
  AccessibilityInfo,
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
  usePressed,
} from '@/components/ui';
import { useLatestDraws, useCheckTicket, useActiveDrawSession } from '@/hooks';
import { useSavedTickets, saveTicket } from '@/store/ticketStore';
import { useTheme, layout } from '@/theme';
import { formatDateVN } from '@/lib/format';
import { todayVN, nowVN, weekdayVN, isLiveDrawingVN } from '@/lib/date';
import { WEEKLY_SCHEDULE } from '@/lib/schedule';
import { STRINGS } from '@/lib/strings';
import { haptics } from '@/lib/haptics';
import { computeTodayStatus } from '@/lib/todayStatus';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { pressed: changePressed, pressHandlers: changeHandlers } = usePressed();
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
        {/* Offline Banner */}
        <OfflineBanner onRetry={refetch} />

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

        {/* 3. My Tickets Shortcut (T10.18) */}
        <View className="px-4 py-1">
          <TouchableOpacity
            testID="home-my-tickets-shortcut"
            onPress={() => router.push('/(tabs)/tickets')}
            className="flex-row items-center justify-between p-3.5 rounded-xl border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-2.5"
                style={{
                  backgroundColor:
                    pendingCount > 0
                      ? `${colors.pending}20`
                      : `${colors.primary}1A`,
                }}
              >
                <Icon
                  name={pendingCount > 0 ? 'clock' : 'bookmark'}
                  size={16}
                  color={pendingCount > 0 ? colors.pending : colors.primary}
                />
              </View>
              <View>
                <Text
                  className="text-xs font-bold"
                  style={{ color: colors.textMain }}
                >
                  Vé của tôi
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{
                    color:
                      pendingCount > 0 ? colors.pending : colors.textMuted,
                  }}
                >
                  {pendingCount > 0
                    ? `${pendingCount} vé đang chờ kết quả`
                    : `${savedTickets.length} vé đã lưu trên máy`}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Text
                className="text-xs font-semibold mr-1"
                style={{ color: colors.primary }}
              >
                Xem
              </Text>
              <Icon name="chevronRight" size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 4. Latest Draws Section */}
        <View className="px-4 pt-3 pb-2">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View
                className="w-2 h-4 rounded-full mr-2"
                style={{ backgroundColor: colors.primary }}
              />
              <Text
                className="text-base font-bold"
                style={{ color: colors.textMain }}
              >
                {STRINGS.home.latestDrawsTitle}
              </Text>
            </View>
            <Pressable
              testID="home-view-all-draws-btn"
              accessibilityRole="button"
              accessibilityLabel={STRINGS.home.viewAll}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/results',
                  params: draws[0]?.drawDate ? { date: draws[0].drawDate } : undefined,
                })
              }
              className="flex-row items-center min-h-[44px] justify-center"
            >
              <Text
                className="text-xs font-semibold mr-0.5"
                style={{ color: colors.primary }}
              >
                {STRINGS.home.viewAll}
              </Text>
              <Icon name="chevronRight" size={14} color={colors.primary} />
            </Pressable>
          </View>

          {/* Loading State (T10.21) */}
          {isLoading && (
            <View testID="home-draws-loading">
              <HomeDrawsSkeleton count={3} />
            </View>
          )}

          {/* Error State */}
          {!isLoading && isError && (
            <View
              className="py-8 px-4 items-center justify-center rounded-2xl border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Icon name="alertCircle" size={32} color={colors.error} />
              <Text
                className="text-sm font-semibold mt-2 text-center"
                style={{ color: colors.textMain }}
              >
                {STRINGS.home.errorLatest}
              </Text>
              <Pressable
                onPress={() => refetch()}
                className="mt-3 px-4 py-2 rounded-xl"
                style={{ backgroundColor: `${colors.primary}1A` }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: colors.primary }}
                >
                  {STRINGS.common.retry}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !isError && draws.length === 0 && (
            <View
              className="py-8 px-4 items-center justify-center rounded-2xl border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Icon name="clock" size={32} color={colors.pending} />
              <Text
                className="text-sm font-semibold mt-2 text-center"
                style={{ color: colors.textMain }}
              >
                {STRINGS.home.emptyLatestTitle}
              </Text>
              <Text
                className="text-xs mt-1 text-center"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.home.emptyLatestDesc}
              </Text>
            </View>
          )}

          {/* Draw Cards List */}
          {!isLoading &&
            !isError &&
            draws.map((draw) => {
              const formattedDrawDate = formatDateVN(draw.drawDate);
              const drawNumbers = draw.numbers || draw.prizes;
              const specialPrize = drawNumbers?.SPECIAL?.[0] || '------';
              const firstPrize = drawNumbers?.FIRST?.[0] || '---';
              const eighthPrize = drawNumbers?.EIGHTH?.[0] || '--';
              const isFinal = draw.status === 'FINAL' || draw.isComplete;

              return (
                <TouchableOpacity
                  key={`${draw.stationCode}-${draw.drawDate}`}
                  testID={`latest-draw-card-${draw.stationCode}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Kết quả đài ${draw.stationName || draw.stationCode}, kỳ quay ngày ${formattedDrawDate}`}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/results',
                      params: {
                        station: draw.stationCode,
                        date: draw.drawDate,
                      },
                    })
                  }
                  activeOpacity={0.8}
                  className="p-4 rounded-2xl border mb-3 shadow-sm"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  {/* Card Header: Station name + Status badge */}
                  <View className="flex-row items-center justify-between pb-2.5">
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
                        {STRINGS.results.drawDatePrefix} {formattedDrawDate}
                      </Text>
                    </View>

                    <View
                      className="px-2.5 py-1 rounded-full flex-row items-center"
                      style={{
                        backgroundColor: isFinal
                          ? `${colors.win}1A`
                          : `${colors.pending}1A`,
                      }}
                    >
                      <View
                        className="w-1.5 h-1.5 rounded-full mr-1.5"
                        style={{
                          backgroundColor: isFinal ? colors.win : colors.pending,
                        }}
                      />
                      <Text
                        className="text-xs font-semibold"
                        style={{
                          color: isFinal ? colors.win : colors.pending,
                        }}
                      >
                        {isFinal
                          ? STRINGS.results.statusFinal
                          : STRINGS.results.statusPending}
                      </Text>
                    </View>
                  </View>

                  {/* Special Prize Display: Flat, no card-in-card, vermilion red */}
                  <View
                    className="py-3 px-3.5 rounded-xl flex-row items-center justify-between"
                    style={{
                      backgroundColor: colors.surfaceSubtle,
                    }}
                  >
                    <View>
                      <Text
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: colors.textMuted }}
                      >
                        {STRINGS.home.specialPrizeBanner}
                      </Text>
                    </View>
                    <Text
                      className="text-2xl font-bold tracking-widest"
                      style={{
                        color: colors.special,
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      {specialPrize}
                    </Text>
                  </View>

                  {/* Secondary prizes (First & Eighth) + Deep link cue */}
                  <View
                    className="flex-row items-center justify-between mt-3 pt-2.5 border-t"
                    style={{ borderColor: colors.border }}
                  >
                    <View className="flex-row items-center">
                      <Text
                        className="text-xs font-medium mr-1"
                        style={{ color: colors.textMuted }}
                      >
                        {STRINGS.home.firstPrizeLabel}:
                      </Text>
                      <Text
                        className="text-xs font-bold mr-3"
                        style={{
                          color: colors.textMain,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {firstPrize}
                      </Text>
                      <Text
                        className="text-xs font-medium mr-1"
                        style={{ color: colors.textMuted }}
                      >
                        {STRINGS.home.eighthPrizeLabel}:
                      </Text>
                      <Text
                        className="text-xs font-bold"
                        style={{
                          color: colors.textMain,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {eighthPrize}
                      </Text>
                    </View>

                    <View
                      testID={`home-card-view-details-${draw.stationCode}`}
                      className="flex-row items-center"
                    >
                      <Text
                        className="text-xs font-semibold mr-1"
                        style={{ color: colors.primary }}
                      >
                        {STRINGS.home.viewFullTable}
                      </Text>
                      <Icon
                        name="chevronRight"
                        size={14}
                        color={colors.primary}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
