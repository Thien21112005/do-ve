import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DateStrip,
  StationChips,
  TicketInput,
  Icon,
  ResultSkeleton,
  ResultCard,
  CelebrationEffect,
  OfflineBanner,
  getPastDays,
  BatchTicketInput,
  parseBatchTickets,
  BatchResultList,
} from '@/components';
import { useTheme } from '@/theme';
import { haptics, STRINGS } from '@/lib';
import { useCheckTicket, useCheckBatchTickets } from '@/hooks';
import { useSavedTickets } from '@/store/ticketStore';
import type { SavedTicketStatus } from '@/types';

export interface CheckScreenProps {
  onCheckSuccess?: (result: any) => void;
}

export default function CheckScreen({ onCheckSuccess }: CheckScreenProps = {}) {
  const { colors } = useTheme();
  const {
    checkTicket: submitCheck,
    result,
    isLoading,
    isError,
    error,
  } = useCheckTicket();

  const {
    checkBatchTickets: submitBatchCheck,
    result: batchResult,
    isLoading: isBatchLoading,
    isError: isBatchError,
    error: batchError,
    reset: resetBatch,
  } = useCheckBatchTickets();

  const [savedTickets, { save: saveTicketToStore }] = useSavedTickets();

  // Initial state: today's date
  const defaultDate = getPastDays(1)[0].dateString;
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [ticketNumber, setTicketNumber] = useState<string>('');
  const [batchText, setBatchText] = useState<string>('');
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Inline validation calculation
  let ticketError: string | null = null;
  if (hasInteracted && ticketNumber.length > 0 && ticketNumber.length < 6) {
    ticketError = STRINGS.check.validationIncomplete(ticketNumber.length);
  }

  const parsedBatch = parseBatchTickets(batchText, 20);

  const isResultSaved = Boolean(
    result &&
      savedTickets.some(
        (t) =>
          t.ticket === result.ticket &&
          (t.station === (result as any).station || t.station === (result as any).stationCode) &&
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

    const station = ticketResult.stationCode || ticketResult.station || selectedStation;
    const stationName = ticketResult.stationName || station;
    const totalPrize =
      typeof ticketResult.totalPrize === 'number'
        ? ticketResult.totalPrize
        : typeof ticketResult.totalAmount === 'number'
          ? ticketResult.totalAmount
          : 0;

    await saveTicketToStore({
      ticket: ticketResult.ticket,
      station,
      stationName,
      drawDate: ticketResult.drawDate,
      status,
      totalPrize,
      wins: ticketResult.wins || [],
    });
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

  const handleTicketChange = (val: string) => {
    setHasInteracted(true);
    setTicketNumber(val);

    if (val.length === 5) {
      haptics.warning();
    }
  };

  const handleSubmit = () => {
    setHasInteracted(true);
    if (!isFormValid) {
      haptics.warning();
      return;
    }
    haptics.medium();

    if (mode === 'single') {
      submitCheck(
        {
          ticket: ticketNumber,
          stationCode: selectedStation,
          drawDate: selectedDate,
        },
        {
          onSuccess: (data) => {
            if (data.won) {
              haptics.success();
            }
            onCheckSuccess?.(data);
          },
          onError: () => {
            haptics.error();
          },
        },
      );
    } else {
      submitBatchCheck(
        {
          stationCode: selectedStation,
          drawDate: selectedDate,
          tickets: parsedBatch.validTickets,
        },
        {
          onSuccess: (data) => {
            if ((data.results?.filter((r) => r.won).length ?? 0) > 0) {
              haptics.success();
            }
            onCheckSuccess?.(data);
          },
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          className="flex-1"
        >
          {/* Offline indicator banner */}
          <OfflineBanner onRetry={handleSubmit} />

          {/* Section: Chọn ngày mở thưởng */}
          <View className="pt-3 px-4 pb-1">
            <Text
              accessibilityRole="header"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              {STRINGS.check.stepDate}
            </Text>
          </View>
          <DateStrip
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {/* Section: Chọn đài */}
          <View className="pt-2 px-4 pb-1">
            <Text
              accessibilityRole="header"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              {STRINGS.check.stepStation}
            </Text>
          </View>
          <StationChips
            selectedDate={selectedDate}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
          />

          {/* Mode Selector: Dò từng vé / Dò hàng loạt */}
          <View className="px-4 pt-3 pb-1">
            <View
              className="flex-row rounded-xl p-1 border"
              style={{
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
              }}
            >
              <TouchableOpacity
                testID="mode-single-btn"
                onPress={() => setMode('single')}
                accessibilityRole="button"
                accessibilityLabel={STRINGS.check.modeSingle}
                accessibilityState={{ selected: mode === 'single' }}
                className="flex-1 py-2 rounded-lg items-center justify-center"
                style={{
                  backgroundColor:
                    mode === 'single' ? colors.surface : 'transparent',
                }}
              >
                <Text
                  className={`text-xs ${mode === 'single' ? 'font-bold' : 'font-medium'}`}
                  style={{
                    color:
                      mode === 'single' ? colors.primary : colors.textMuted,
                  }}
                >
                  {STRINGS.check.modeSingle}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="mode-batch-btn"
                onPress={() => setMode('batch')}
                accessibilityRole="button"
                accessibilityLabel={STRINGS.check.modeBatch}
                accessibilityState={{ selected: mode === 'batch' }}
                className="flex-1 py-2 rounded-lg items-center justify-center"
                style={{
                  backgroundColor:
                    mode === 'batch' ? colors.surface : 'transparent',
                }}
              >
                <Text
                  className={`text-xs ${mode === 'batch' ? 'font-bold' : 'font-medium'}`}
                  style={{
                    color: mode === 'batch' ? colors.primary : colors.textMuted,
                  }}
                >
                  {STRINGS.check.modeBatch}
                </Text>
              </TouchableOpacity>
            </View>
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
                maxTickets={20}
              />
            </View>
          )}

          {/* Action button: Dò vé */}
          <View className="mt-8 px-5 w-full max-w-[360px] self-center">
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
              className="py-3.5 px-6 rounded-xl items-center justify-center shadow-sm flex-row"
              style={{
                backgroundColor: isFormValid
                  ? colors.primary
                  : colors.surfaceSubtle,
                opacity: isFormValid ? 1 : 0.6,
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
                  : mode === 'single'
                    ? STRINGS.check.btnCheck
                    : STRINGS.check.btnCheckBatch(parsedBatch.validTickets.length)}
              </Text>
            </TouchableOpacity>
          </View>

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
                  {(activeErrorObj as any)?.detail ||
                    activeErrorObj?.message ||
                    STRINGS.common.unknownError}
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
            <ResultCard
              result={result}
              testID="check-result-section"
              onCheckAgain={handleSubmit}
              onSaveTicket={handleSaveTicket}
              isSaved={isResultSaved}
            />
          )}

          {/* Batch Result List */}
          {mode === 'batch' && batchResult && !isBatchLoading && (
            <View testID="batch-results-section" className="mt-4 px-4">
              <BatchResultList
                batchResult={batchResult}
                onCheckAgain={() => {
                  resetBatch();
                  setBatchText('');
                }}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Subtle celebration when ticket wins */}
      <CelebrationEffect
        active={Boolean(result?.won || (batchResult?.results?.some((r) => r.won) ?? false))}
      />
    </SafeAreaView>
  );
}
