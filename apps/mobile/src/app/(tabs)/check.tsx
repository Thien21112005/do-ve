import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DateStrip,
  StationChips,
  TicketInput,
  Icon,
  ResultSkeleton,
  ResultCard,
  OfflineBanner,
  getPastDays,
  BatchTicketInput,
  parseBatchTickets,
  BatchResultList,
  Segmented,
} from '@/components';
import { useTheme } from '@/theme';
import { useQueryClient } from '@tanstack/react-query';
import { haptics, STRINGS } from '@/lib';
import { useCheckTicket, useCheckBatchTickets } from '@/hooks';
import { useSavedTickets } from '@/store/ticketStore';
import { useSettings } from '@/store/settings';
import { getApiErrorMessage } from '@/api/client';
import type { SavedTicketStatus } from '@/types';

export default function CheckScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const {
    checkTicket: submitCheck,
    result,
    isLoading,
    isError,
    error,
    reset: resetSingle,
  } = useCheckTicket();

  const {
    checkBatchTickets: submitBatchCheck,
    result: batchResult,
    isLoading: isBatchLoading,
    isError: isBatchError,
    error: batchError,
    reset: resetBatch,
  } = useCheckBatchTickets();

  const [
    savedTickets,
    { save: saveTicketToStore, saveMany: saveManyTicketsToStore },
  ] = useSavedTickets();
  const [settings] = useSettings();
  const [justSaved, setJustSaved] = useState(false);

  // Initial state: today's date
  const defaultDate = getPastDays(1)[0].dateString;
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [ticketNumber, setTicketNumber] = useState<string>('');
  const [batchText, setBatchText] = useState<string>('');
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Clear stale check result when single ticket input, station, or date changes (T09.20)
  useEffect(() => {
    if (result) {
      resetSingle();
      setJustSaved(false);
    }
  }, [ticketNumber, selectedStation, selectedDate, resetSingle]);

  // Clear stale batch check result when batch input, station, or date changes (T09.20)
  useEffect(() => {
    if (batchResult) {
      resetBatch();
    }
  }, [batchText, selectedStation, selectedDate, resetBatch]);

  const scrollViewRef = useRef<any>(null);
  const resultLayoutY = useRef<number>(0);
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

  // Auto-scroll to check result and announce for accessibility (T10.29)
  useEffect(() => {
    const hasSingleResult = mode === 'single' && result && !isLoading;
    const hasBatchResult = mode === 'batch' && batchResult && !isBatchLoading;

    if (hasSingleResult || hasBatchResult) {
      const timer = setTimeout(() => {
        if (resultLayoutY.current > 0) {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, resultLayoutY.current - 16),
            animated: !reduceMotion,
          });
        } else {
          scrollViewRef.current?.scrollToEnd({ animated: !reduceMotion });
        }

        if (hasSingleResult && result) {
          const announcement = result.won
            ? `Đã có kết quả dò vé: Chúc mừng! Vé ${result.ticket} trúng thưởng!`
            : `Đã có kết quả dò vé: Rất tiếc, vé ${result.ticket} không trúng giải.`;
          AccessibilityInfo.announceForAccessibility(announcement);
        } else if (hasBatchResult && batchResult) {
          const announcement = `Đã có kết quả dò vé hàng loạt: ${batchResult.totalWonTickets ?? 0} vé trúng.`;
          AccessibilityInfo.announceForAccessibility(announcement);
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [result, batchResult, isLoading, isBatchLoading, mode, reduceMotion]);

  // Retry offline: refetch background data (schedule, stations) instead of submitting check form (T09.21)
  const handleOfflineRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['schedule'] });
    queryClient.invalidateQueries({ queryKey: ['stations'] });
  };

  // Inline validation calculation
  let ticketError: string | null = null;
  if (hasInteracted && ticketNumber.length > 0 && ticketNumber.length < 6) {
    ticketError = STRINGS.check.validationIncomplete(ticketNumber.length);
  }

  const parsedBatch = parseBatchTickets(batchText, 20);

  const isResultSaved =
    justSaved ||
    Boolean(
      result &&
        savedTickets.some(
          (t) =>
            t.ticket === result.ticket &&
            (t.station === (result as any).station ||
              t.station === (result as any).stationCode) &&
            t.drawDate === result.drawDate,
        ),
    );

  const handleSaveTicket = async (ticketResult: any) => {
    let status: SavedTicketStatus = 'LOST';
    if (ticketResult.status === 'RESULT_NOT_AVAILABLE') {
      status = 'PENDING';
    } else if (ticketResult.won) {
      status = 'WON';
    }

    const station =
      ticketResult.stationCode || ticketResult.station || selectedStation;
    const stationName = ticketResult.stationName || station;
    const totalPrize =
      typeof ticketResult.totalPrize === 'number'
        ? ticketResult.totalPrize
        : typeof ticketResult.totalAmount === 'number'
          ? ticketResult.totalAmount
          : 0;

    try {
      await saveTicketToStore({
        ticket: ticketResult.ticket,
        station,
        stationName,
        drawDate: ticketResult.drawDate,
        status,
        totalPrize,
        wins: ticketResult.wins || [],
      });
      setJustSaved(true);
    } catch {
      Alert.alert(
        STRINGS.common.error,
        STRINGS.check.saveTicketError,
      );
    }
  };

  const handleSaveAllBatchTickets = async (ticketsList: any[]) => {
    try {
      const station = batchResult?.stationCode || selectedStation;
      const stationName = (batchResult as any)?.stationName || station;
      const drawDate = batchResult?.drawDate || selectedDate;

      const toSave = ticketsList.map((ticketResult) => {
        let status: SavedTicketStatus = 'LOST';
        if (ticketResult.status === 'RESULT_NOT_AVAILABLE') {
          status = 'PENDING';
        } else if (ticketResult.won) {
          status = 'WON';
        }
        const totalPrize =
          typeof ticketResult.totalPrize === 'number'
            ? ticketResult.totalPrize
            : typeof ticketResult.totalAmount === 'number'
              ? ticketResult.totalAmount
              : 0;
        return {
          ticket: ticketResult.ticket,
          station,
          stationName,
          drawDate,
          status,
          totalPrize,
          wins: ticketResult.wins || [],
        };
      });

      await saveManyTicketsToStore(toSave);
    } catch {
      Alert.alert(
        STRINGS.common.error,
        STRINGS.check.saveTicketError,
      );
    }
  };

  const activeLoading = mode === 'single' ? isLoading : isBatchLoading;
  const activeError = mode === 'single' ? isError : isBatchError;
  const activeErrorObj = mode === 'single' ? error : batchError;

  const isFormValid =
    (mode === 'single'
      ? ticketNumber.length === 6 && !ticketError
      : parsedBatch.validTickets.length > 0 &&
        !parsedBatch.isOverLimit &&
        parsedBatch.invalidTokens.length === 0) &&
    Boolean(selectedStation) &&
    Boolean(selectedDate) &&
    !activeLoading;

  const triggerSingleCheck = useCallback(
    (ticketToSubmit: string) => {
      if (
        !selectedStation ||
        !selectedDate ||
        ticketToSubmit.length !== 6 ||
        isLoading
      ) {
        return;
      }
      setJustSaved(false);
      haptics.medium();
      Keyboard.dismiss();
      submitCheck(
        {
          ticket: ticketToSubmit,
          stationCode: selectedStation,
          drawDate: selectedDate,
        },
        {
          onError: () => {
            haptics.error();
          },
        },
      );
    },
    [selectedStation, selectedDate, isLoading, submitCheck],
  );

  const handleBatchPaste = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setBatchText((prev) => (prev ? `${prev}\n${text}` : text));
          haptics.light();
        }
      }
    } catch {
      // Clipboard not available or permissions denied
    }
  };

  const handleTicketChange = (val: string) => {
    setHasInteracted(true);
    setTicketNumber(val);

    if (result) resetSingle();
    if (batchResult) resetBatch();

    // Auto-submit when exactly 6 digits are typed, if enabled in settings (T10.28)
    if (val.length === 6 && settings.autoSubmitEnabled && mode === 'single') {
      triggerSingleCheck(val);
    }
  };

  const handleSubmit = () => {
    setHasInteracted(true);
    setJustSaved(false);
    if (!isFormValid) {
      haptics.warning();
      return;
    }

    if (mode === 'single') {
      triggerSingleCheck(ticketNumber);
    } else {
      haptics.medium();
      submitBatchCheck(
        {
          stationCode: selectedStation,
          drawDate: selectedDate,
          tickets: parsedBatch.validTickets,
        },
        {
          onError: () => {
            haptics.error();
          },
        },
      );
    }
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          ref={scrollViewRef}
          testID="check-scroll-view"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          className="flex-1"
        >
          {/* Offline indicator banner */}
          <OfflineBanner onRetry={handleOfflineRetry} />

          {/* Context box: Gộp chọn ngày + đài thành 1 khối ngữ cảnh (T10.24) */}
          <View
            testID="check-context-box"
            className="mx-4 mt-3 mb-2 rounded-2xl border p-3 shadow-xs"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center justify-between px-1 mb-1">
              <View className="flex-row items-center gap-1.5">
                <Icon name="calendar" size={15} color={colors.primary} />
                <Text
                  accessibilityRole="header"
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: colors.primary }}
                >
                  Kỳ mở thưởng
                </Text>
              </View>
              <Text
                className="text-xs font-medium"
                style={{ color: colors.textMuted }}
              >
                {selectedDate}
              </Text>
            </View>

            <DateStrip
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            <View
              className="h-[1px] my-1"
              style={{ backgroundColor: colors.border }}
            />

            <StationChips
              selectedDate={selectedDate}
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
            />
          </View>

          {/* Mode Selector: Dò từng vé / Dò hàng loạt (T10.26) */}
          <View className="px-4 pt-2 pb-1">
            <Segmented
              testID="mode-segmented"
              selectedKey={mode}
              onChange={(key) => setMode(key as 'single' | 'batch')}
              options={[
                { key: 'single', label: STRINGS.check.modeSingleShort, testID: 'mode-single-btn' },
                {
                  key: 'batch',
                  label: STRINGS.check.modeBatchShort,
                  testID: 'mode-batch-btn',
                },
              ]}
            />
          </View>

          {/* Section: Nhập số vé */}
          {mode === 'single' ? (
            <View className="pt-3 px-4 pb-2 items-center">
              <Text
                accessibilityRole="header"
                className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 self-start"
              >
                {STRINGS.check.stepTicket}
              </Text>
              <TicketInput
                value={ticketNumber}
                onChangeText={handleTicketChange}
                onComplete={(code) => {
                  setHasInteracted(true);
                  setTicketNumber(code);
                }}
                disabled={isLoading}
                hasError={Boolean(ticketError)}
              />

              {/* Inline validation message */}
              {ticketError && (
                <View
                  testID="ticket-validation-error"
                  accessibilityRole="alert"
                  accessibilityLiveRegion="assertive"
                  className="flex-row items-center mt-2.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60"
                >
                  <Icon name="alertCircle" size={16} color={colors.error} />
                  <Text
                    className="ml-1.5 text-xs font-medium"
                    style={{ color: colors.error }}
                  >
                    {ticketError}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="pt-3 px-4 pb-2">
              <Text
                accessibilityRole="header"
                className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3"
              >
                {STRINGS.check.stepBatch}
              </Text>
              <BatchTicketInput
                value={batchText}
                onChangeText={setBatchText}
                onPaste={handleBatchPaste}
                maxTickets={20}
              />
            </View>
          )}

          {/* API Error Notification */}
          {activeError && (
            <View
              testID="api-error-banner"
              className="mt-4 mx-5 p-4 rounded-xl border flex-row items-center justify-between"
              style={{
                backgroundColor: colors.errorBg,
                borderColor: colors.error,
              }}
            >
              <View className="flex-1 mr-2">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.error }}
                >
                  {getApiErrorMessage(
                    activeErrorObj,
                    STRINGS.common.unknownError,
                  )}
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: colors.textMuted }}
                >
                  {STRINGS.check.dataPreservedNotice}
                </Text>
              </View>
              <TouchableOpacity
                testID="api-error-retry-btn"
                onPress={handleSubmit}
                className="px-3 py-1.5 rounded-lg border flex-row items-center"
                style={{
                  borderColor: colors.error,
                  backgroundColor: `${colors.error}15`,
                }}
                accessibilityRole="button"
                accessibilityLabel={STRINGS.common.retry}
              >
                <Icon name="refresh" size={14} color={colors.error} />
                <Text
                  className="ml-1 text-xs font-semibold"
                  style={{ color: colors.error }}
                >
                  {STRINGS.common.retry}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading Skeleton */}
          {activeLoading && <ResultSkeleton testID="check-loading-skeleton" />}

          {/* Single Result Card */}
          {mode === 'single' && result && !isLoading && (
            <View
              onLayout={(e) => {
                resultLayoutY.current = e.nativeEvent.layout.y;
              }}
            >
              <ResultCard
                result={result}
                testID="check-result-section"
                onCheckAgain={handleSubmit}
                onSaveTicket={handleSaveTicket}
                isSaved={isResultSaved}
              />
            </View>
          )}

          {/* Batch Result List */}
          {mode === 'batch' && batchResult && !isBatchLoading && (
            <View
              testID="batch-results-section"
              className="mt-4 px-4"
              onLayout={(e) => {
                resultLayoutY.current = e.nativeEvent.layout.y;
              }}
            >
              <BatchResultList
                batchResult={batchResult}
                onSaveTicket={handleSaveTicket}
                onSaveAllTickets={handleSaveAllBatchTickets}
                onCheckAgain={() => {
                  resetBatch();
                  setBatchText('');
                }}
              />
            </View>
          )}
        </ScrollView>

        {/* Sticky Bottom CTA Bar (T10.27) */}
        <View
          testID="sticky-cta-bar"
          className="px-4 py-2 border-t"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <TouchableOpacity
            testID="check-ticket-button"
            disabled={!isFormValid}
            onPress={handleSubmit}
            accessibilityRole="button"
            accessibilityLabel={
              mode === 'single'
                ? STRINGS.check.accessibilityCheckBtnSingle
                : STRINGS.check.accessibilityCheckBtnBatch
            }
            accessibilityState={{ disabled: !isFormValid }}
            className="w-full rounded-xl items-center justify-center flex-row shadow-sm"
            style={{
              height: 52,
              minHeight: 52,
              backgroundColor: isFormValid ? colors.primary : colors.surfaceSubtle,
              borderColor: isFormValid ? colors.primary : colors.border,
              borderWidth: 1,
              opacity: isFormValid ? 1 : 0.85,
            }}
          >
            {activeLoading && (
              <ActivityIndicator
                size="small"
                color="#ffffff"
                className="mr-2"
              />
            )}
            <Text
              className="text-base font-bold"
              style={{
                color: isFormValid ? '#ffffff' : colors.textMuted,
              }}
            >
              {activeLoading
                ? STRINGS.check.btnChecking
                : !isFormValid && mode === 'single' && ticketNumber.length < 6
                  ? STRINGS.check.validationIncomplete(ticketNumber.length)
                  : !isFormValid && !selectedStation
                    ? STRINGS.check.selectStationPrompt
                    : mode === 'single'
                      ? STRINGS.check.btnCheck
                      : STRINGS.check.btnCheckBatch(parsedBatch.validTickets.length)}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
