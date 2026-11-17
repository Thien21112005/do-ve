import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Icon, OfflineBanner, HomeDrawsSkeleton } from '@/components';
import { useLatestDraws, useCheckTicket, useActiveDrawSession } from '@/hooks';
import { useSavedTickets, saveTicket } from '@/store/ticketStore';
import { useTheme, layout } from '@/theme';
import { formatDateVN, formatCurrency } from '@/lib/format';
import { todayVN, nowVN, weekdayVN, isLiveDrawingVN } from '@/lib/date';
import { WEEKLY_SCHEDULE } from '@/lib/schedule';
import { STRINGS } from '@/lib/strings';
import { haptics } from '@/lib/haptics';

export default function HomeScreen() {
  const { colors } = useTheme();
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

  // Check live drawing window (16h10 - 16h40 VN)
  const isLive = isLiveDrawingVN();

  // Compute live time status
  const timeStatus = useMemo(() => {
    if (isLive) {
      return STRINGS.home.statusLive;
    }
    const { hour, minute } = nowVN();
    const timeMinutes = hour * 60 + minute;
    if (timeMinutes > 1000 || (draws && draws.length > 0)) {
      return STRINGS.home.statusFinal;
    }
    return STRINGS.home.statusUpcoming;
  }, [isLive, draws]);

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
    if (ticketNumber.length !== 6 || isChecking) return;
    haptics.medium();
    setSaved(false);
    doCheckTicket({
      ticket: ticketNumber,
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

        {/* 1. Today Status Row (T10.18) */}
        <View className="px-4 pt-3 pb-2">
          <View
            testID="home-today-status"
            className="flex-row items-center justify-between px-3.5 py-2.5 rounded-xl border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <Animated.View
                testID={isLive ? 'home-live-pulse-dot' : 'home-status-dot'}
                className="w-2.5 h-2.5 rounded-full mr-2"
                style={{
                  backgroundColor:
                    timeStatus === STRINGS.home.statusLive
                      ? colors.pending
                      : timeStatus === STRINGS.home.statusFinal
                        ? colors.win
                        : colors.primary,
                  opacity: isLive && !reduceMotion ? pulseAnim : 1,
                }}
              />
              <Text
                className="text-xs font-semibold"
                style={{ color: colors.textMain }}
                numberOfLines={1}
              >
                {scheduleDay?.dayName || STRINGS.schedule.todayTag}, {todayStr} · {todayStations.length} đài · {timeStatus}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text
                className="text-xs font-bold mr-1"
                style={{ color: colors.primary }}
              >
                {STRINGS.common.appName}
              </Text>
              <View
                className="px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${colors.primary}1A` }}
              >
                <Text
                  className="text-[10px] font-bold"
                  style={{ color: colors.primary }}
                >
                  {STRINGS.common.regionName}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Inline Quick Check Card (T10.18) */}
        <View className="px-4 py-2">
          <View
            className="p-4 rounded-2xl border shadow-sm"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View
                  className="w-7 h-7 rounded-lg items-center justify-center mr-2.5"
                  style={{ backgroundColor: `${colors.primary}1A` }}
                >
                  <Icon name="search" size={16} color={colors.primary} />
                </View>
                <Text
                  className="text-base font-bold"
                  style={{ color: colors.textMain }}
                >
                  {STRINGS.home.quickCheckTitle}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/(tabs)/check')}
                className="flex-row items-center"
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.primary }}
                >
                  Dò nhiều vé
                </Text>
                <Icon name="chevronRight" size={12} color={colors.primary} />
              </Pressable>
            </View>

            <Text
              className="text-xs leading-relaxed mb-3"
              style={{ color: colors.textMuted }}
            >
              {STRINGS.home.quickCheckSession(
                sessionDay?.dayName ?? '',
                formatDateVN(session.date),
              )}
            </Text>

            {/* Today Station Selector Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
              contentContainerStyle={{ paddingRight: 8 }}
            >
              {session.stations.map((st) => {
                const isSelected = activeStation === st.code;
                return (
                  <TouchableOpacity
                    key={st.code}
                    onPress={() => setSelectedStation(st.code)}
                    className="mr-2 px-3 py-1.5 rounded-lg border"
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
                        color: isSelected ? '#FFFFFF' : colors.textMain,
                      }}
                    >
                      {st.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Ticket Input & Submit Button */}
            {!result ? (
              <View className="space-y-3">
                <TextInput
                  testID="home-ticket-input"
                  value={ticketNumber}
                  onChangeText={(val) => setTicketNumber(val.replace(/\D/g, '').slice(0, 6))}
                  placeholder={STRINGS.home.quickCheckPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  className="px-3.5 py-3 rounded-xl border text-base font-bold text-center tracking-widest"
                  style={{
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    color: colors.textMain,
                    fontVariant: ['tabular-nums'],
                  }}
                />

                <TouchableOpacity
                  testID="home-quick-check-btn"
                  accessibilityRole="button"
                  accessibilityLabel={STRINGS.home.quickCheckBtn}
                  onPress={handleQuickCheck}
                  disabled={ticketNumber.length !== 6 || isChecking}
                  className="mt-2.5 py-3 px-4 rounded-xl flex-row items-center justify-center"
                  style={{
                    backgroundColor:
                      ticketNumber.length === 6 && !isChecking
                        ? colors.primary
                        : colors.border,
                  }}
                >
                  {isChecking ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text className="text-white font-bold text-sm mr-1.5">
                        {STRINGS.home.quickCheckBtn}
                      </Text>
                      <Icon name="chevronRight" size={16} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* Inline Result Display */
              <View
                testID="home-quick-check-result"
                className="p-3.5 rounded-xl border"
                style={{
                  backgroundColor: result.won
                    ? `${colors.win}12`
                    : colors.surfaceSubtle,
                  borderColor: result.won ? colors.win : colors.border,
                }}
              >
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text
                    className="text-xs font-semibold"
                    style={{
                      color: result.won ? colors.win : colors.textMuted,
                    }}
                  >
                    Số vé: {result.ticket} · {result.stationName || activeStation}
                  </Text>
                  <View
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: result.won
                        ? colors.win
                        : colors.textMuted,
                    }}
                  >
                    <Text className="text-[10px] font-bold text-white">
                      {result.won ? STRINGS.check.resultWonBadge : STRINGS.check.resultLostBadge}
                    </Text>
                  </View>
                </View>

                {result.won ? (
                  <View className="my-1">
                    <Text
                      className="text-base font-bold"
                      style={{ color: colors.win }}
                    >
                      {STRINGS.check.resultWonTitle}
                    </Text>
                    <Text
                      className="text-xl font-bold tracking-tight mt-0.5"
                      style={{ color: colors.win, fontVariant: ['tabular-nums'] }}
                    >
                      {formatCurrency(result.totalAmount)}
                    </Text>
                  </View>
                ) : (
                  <Text
                    className="text-xs my-1"
                    style={{ color: colors.textMuted }}
                  >
                    {STRINGS.check.lostNotice(result.ticket)}
                  </Text>
                )}

                <View className="flex-row items-center justify-end mt-2 pt-2 border-t" style={{ borderColor: colors.border }}>
                  {result.won && (
                    <TouchableOpacity
                      testID="home-save-ticket-btn"
                      onPress={handleSaveResultTicket}
                      disabled={saved}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      className="px-3 py-1.5 rounded-lg mr-2 border min-h-[44px] justify-center items-center"
                      style={{
                        backgroundColor: saved ? colors.surfaceSubtle : colors.surface,
                        borderColor: colors.border,
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: saved ? colors.textMuted : colors.primary }}
                      >
                        {saved ? STRINGS.check.savedTicket : STRINGS.check.saveTicket}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    testID="home-reset-check-btn"
                    onPress={handleResetQuickCheck}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    className="px-3 py-1.5 rounded-lg min-h-[44px] justify-center items-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-xs font-semibold text-white">
                      {STRINGS.check.checkAgain}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
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
