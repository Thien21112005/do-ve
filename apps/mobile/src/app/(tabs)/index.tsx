import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon, OfflineBanner } from '@/components';
import { useLatestDraws, useCheckTicket } from '@/hooks';
import { useSavedTickets, saveTicket } from '@/store/ticketStore';
import { useTheme } from '@/theme';
import { formatDateVN, formatCurrency } from '@/lib/format';
import { todayVN, nowVN, weekdayVN } from '@/lib/date';
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

  // Default selected station to first today station or first draw
  const activeStation =
    selectedStation ||
    todayStations[0]?.code ||
    draws[0]?.stationCode ||
    'tp-hcm';

  // Compute live time status
  const timeStatus = useMemo(() => {
    const { hour, minute } = nowVN();
    const timeMinutes = hour * 60 + minute;
    if (timeMinutes >= 975 && timeMinutes <= 1005) {
      return 'Đang quay';
    }
    if (timeMinutes > 1005 || (draws && draws.length > 0)) {
      return 'Đã có kết quả';
    }
    return 'Quay lúc 16h15';
  }, [draws]);

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
      drawDate: draws[0]?.drawDate || today,
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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
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
              <View
                className="w-2.5 h-2.5 rounded-full mr-2"
                style={{
                  backgroundColor:
                    timeStatus === 'Đang quay'
                      ? colors.pending
                      : timeStatus === 'Đã có kết quả'
                        ? colors.win
                        : colors.primary,
                }}
              />
              <Text
                className="text-xs font-semibold"
                style={{ color: colors.textMain }}
                numberOfLines={1}
              >
                {scheduleDay?.dayName || 'Hôm nay'}, {todayStr} · {todayStations.length} đài · {timeStatus}
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
              Chọn đài và nhập 6 chữ số để dò trực tiếp ngay tại đây:
            </Text>

            {/* Today Station Selector Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
              contentContainerStyle={{ paddingRight: 8 }}
            >
              {(todayStations.length > 0
                ? todayStations
                : [
                    { code: 'tp-hcm', name: 'TP. Hồ Chí Minh' },
                    { code: 'dong-thap', name: 'Đồng Tháp' },
                    { code: 'ca-mau', name: 'Cà Mau' },
                  ]
              ).map((st) => {
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
                  placeholder="Nhập 6 chữ số vé (vd: 654321)"
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
                      {result.won ? 'TRÚNG THƯỞNG' : 'KHÔNG TRÚNG'}
                    </Text>
                  </View>
                </View>

                {result.won ? (
                  <View className="my-1">
                    <Text
                      className="text-base font-bold"
                      style={{ color: colors.win }}
                    >
                      Chúc mừng bạn đã trúng thưởng!
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
                    Rất tiếc, vé {result.ticket} không trúng giải kỳ mở thưởng này.
                  </Text>
                )}

                <View className="flex-row items-center justify-end mt-2 pt-2 border-t" style={{ borderColor: colors.border }}>
                  {result.won && (
                    <TouchableOpacity
                      testID="home-save-ticket-btn"
                      onPress={handleSaveResultTicket}
                      disabled={saved}
                      className="px-3 py-1.5 rounded-lg mr-2 border"
                      style={{
                        backgroundColor: saved ? colors.surfaceSubtle : colors.surface,
                        borderColor: colors.border,
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: saved ? colors.textMuted : colors.primary }}
                      >
                        {saved ? 'Đã lưu vé' : 'Lưu vé này'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    testID="home-reset-check-btn"
                    onPress={handleResetQuickCheck}
                    className="px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-xs font-semibold text-white">
                      Dò vé khác
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
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/results',
                  params: draws[0]?.drawDate ? { date: draws[0].drawDate } : undefined,
                })
              }
              className="flex-row items-center"
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

          {/* Loading State */}
          {isLoading && (
            <View
              testID="home-draws-loading"
              className="py-12 items-center justify-center rounded-2xl border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                className="text-xs mt-2.5 font-medium"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.home.loadingLatest}
              </Text>
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
                <View
                  key={`${draw.stationCode}-${draw.drawDate}`}
                  testID={`latest-draw-card-${draw.stationCode}`}
                  className="p-4 rounded-2xl border mb-3 shadow-sm"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  {/* Card Header */}
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
                        {STRINGS.results.drawDatePrefix} {formattedDrawDate}
                      </Text>
                    </View>

                    <View
                      className="px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: isFinal
                          ? `${colors.win}1A`
                          : `${colors.pending}1A`,
                      }}
                    >
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

                  {/* Special Prize Banner */}
                  <View
                    className="mt-3 p-3 rounded-xl items-center border"
                    style={{
                      backgroundColor: `${colors.primary}0D`,
                      borderColor: `${colors.primary}26`,
                    }}
                  >
                    <Text
                      className="text-xs font-bold uppercase tracking-wider mb-1"
                      style={{ color: colors.primary }}
                    >
                      {STRINGS.home.specialPrizeBanner}
                    </Text>
                    <Text
                      className="text-2xl font-bold tracking-widest"
                      style={{
                        color: colors.primary,
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      {specialPrize}
                    </Text>
                  </View>

                  {/* Quick Prize Highlights (First & Eighth) */}
                  <View className="flex-row items-center justify-between mt-3 pt-2">
                    <View className="flex-1 mr-2 flex-row items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <Text
                        className="text-xs font-medium"
                        style={{ color: colors.textMuted }}
                      >
                        {STRINGS.home.firstPrizeLabel}
                      </Text>
                      <Text
                        className="text-sm font-bold"
                        style={{
                          color: colors.textMain,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {firstPrize}
                      </Text>
                    </View>
                    <View className="flex-1 ml-2 flex-row items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <Text
                        className="text-xs font-medium"
                        style={{ color: colors.textMuted }}
                      >
                        {STRINGS.home.eighthPrizeLabel}
                      </Text>
                      <Text
                        className="text-sm font-bold"
                        style={{
                          color: colors.textMain,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {eighthPrize}
                      </Text>
                    </View>
                  </View>

                  {/* Action Link to Details */}
                  <Pressable
                    testID={`home-card-view-details-${draw.stationCode}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Xem toàn bộ bảng giải đài ${draw.stationName || draw.stationCode}`}
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/results',
                        params: {
                          station: draw.stationCode,
                          date: draw.drawDate,
                        },
                      })
                    }
                    className="mt-3 pt-2.5 border-t flex-row items-center justify-center"
                    style={{ borderColor: colors.border }}
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
                  </Pressable>
                </View>
              );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
