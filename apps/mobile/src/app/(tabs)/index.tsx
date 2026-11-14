import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon, OfflineBanner } from '@/components';
import { useLatestDraws } from '@/hooks';
import { useTheme } from '@/theme';
import { formatDateVN } from '@/lib/format';
import { STRINGS } from '@/lib/strings';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { draws, isLoading, isError, refetch } = useLatestDraws();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const todayStr = formatDateVN(new Date().toISOString().split('T')[0]);

  return (
    <SafeAreaView
      testID="home-screen"
      edges={['bottom']}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
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

        {/* Top Header Banner */}
        <View className="px-5 pt-4 pb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.primary}1A` }}
              >
                <Icon name="ticket" size={22} color={colors.primary} />
              </View>
              <View>
                <View className="flex-row items-center">
                  <Text
                    className="text-2xl font-black tracking-tight"
                    style={{ color: colors.textMain }}
                  >
                    {STRINGS.common.appName}
                  </Text>
                  <View
                    className="ml-2 px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${colors.primary}15` }}
                  >
                    <Text
                      className="text-[10px] font-bold tracking-wide"
                      style={{ color: colors.primary }}
                    >
                      {STRINGS.common.regionName}
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.textMuted }}
                >
                  {STRINGS.common.tagline}
                </Text>
              </View>
            </View>
            <Text
              className="text-xs font-medium"
              style={{ color: colors.textMuted }}
            >
              {todayStr}
            </Text>
          </View>
        </View>

        {/* Quick Check Card */}
        <View className="px-4 py-2">
          <View
            className="p-4 rounded-2xl border shadow-sm"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center mb-2">
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
            <Text
              className="text-xs leading-relaxed mb-3.5"
              style={{ color: colors.textMuted }}
            >
              {STRINGS.home.quickCheckDesc}
            </Text>
            <Pressable
              testID="home-quick-check-btn"
              accessibilityRole="button"
              accessibilityLabel={STRINGS.home.quickCheckBtn}
              onPress={() => router.push('/(tabs)/check')}
              className="py-3 px-4 rounded-xl flex-row items-center justify-center active:opacity-80"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-bold text-sm mr-1.5">
                {STRINGS.home.quickCheckBtn}
              </Text>
              <Icon name="chevronRight" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Latest Draws Section */}
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
              onPress={() => router.push('/(tabs)/results')}
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
              const specialPrize = draw.prizes?.SPECIAL?.[0] || '------';
              const firstPrize = draw.prizes?.FIRST?.[0] || '---';
              const eighthPrize = draw.prizes?.EIGHTH?.[0] || '--';
              const isFinal = draw.status === 'FINAL';

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
                      className="text-[11px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: colors.primary }}
                    >
                      {STRINGS.home.specialPrizeBanner}
                    </Text>
                    <Text
                      className="text-2xl font-black tracking-widest"
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
                    onPress={() => router.push('/(tabs)/results')}
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
