import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
  AccessibilityInfo,
  AppState,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import {
  StationChips,
  TicketInput,
  Icon,
  ResultSkeleton,
  ResultStub,
  OfflineBanner,
  BatchTicketInput,
  parseBatchTickets,
  BatchResultList,
  Segmented,
} from '@/components';
import {
  Text,
  CalendarPickerSheet,
  Chip,
  StickyFooter,
  Banner,
  usePressed,
} from '@/components/ui';
import { useTheme, layout } from '@/theme';
import { radii } from '@/theme/tokens';
import { useQueryClient } from '@tanstack/react-query';
import { haptics, STRINGS, weekdayVN, formatDateVN } from '@/lib';
import {
  useCheckTicket,
  useCheckBatchTickets,
  useActiveDrawSession,
  useSchedule,
} from '@/hooks';
import { useSavedTickets, normalizeStationCode } from '@/store/ticketStore';
import { useSettings } from '@/store/settings';
import { getApiErrorMessage } from '@/api/client';
import type { SavedTicketStatus } from '@/types';

const VALIDATION_DELAY_MS = 600;
const SHORT_DAYS = ['CN', 'T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7'];

export function getCheckKeyboardBehavior(
  os: string = Platform.OS,
): 'padding' | 'height' | undefined {
  if (os === 'ios') return 'padding';
  if (os === 'android') return 'height';
  return undefined;
}

export default function CheckScreen() {
  const { colors } = useTheme();
  const { pressed: pickerPressed, pressHandlers: pickerHandlers } = usePressed();
  const { pressed: ctaPressed, pressHandlers: ctaHandlers } = usePressed();
  const queryClient = useQueryClient();

  const {
    checkTicket: submitCheck,
    result: rawResult,
    isLoading,
    isError,
    error,
    reset: resetSingle,
  } = useCheckTicket();

  const {
    checkBatchTickets: submitBatchCheck,
    result: rawBatchResult,
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

  // Default to the latest drawn session: before 16h10 that is yesterday (T11.18)
  const { date: defaultDate } = useActiveDrawSession();
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  // Until the user picks a date, keep following the session across 16h10 / midnight (T13.02).
  const [userPickedDate, setUserPickedDate] = useState(false);
  const [, setForegroundTick] = useState(0);

  useEffect(() => {
    // Re-render on return to foreground so useActiveDrawSession re-reads the clock.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setForegroundTick((n) => n + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!userPickedDate && defaultDate !== selectedDate) {
      setSelectedDate(defaultDate);
    }
  }, [defaultDate, selectedDate, userPickedDate]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [ticketNumber, setTicketNumber] = useState<string>('');
  const [batchText, setBatchText] = useState<string>('');
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const { stations } = useSchedule(selectedDate);
  const activeStationObj = stations.find((s) => s.code === selectedStation);
  const isoDay = weekdayVN(selectedDate);
  const dayLabel = isoDay === 7 ? 'CN' : SHORT_DAYS[isoDay] || '';
  const [, mm, dd] = selectedDate.split('-');
  const shortDate = dd && mm ? `${dd}/${mm}` : formatDateVN(selectedDate);

  // Only show a response that belongs to the form as it is now (T11.13).
  const formKey = `${selectedDate}|${selectedStation}|${ticketNumber}`;
  const batchFormKey = `${selectedDate}|${selectedStation}|${batchText}`;
  const [submittedKey, setSubmittedKey] = useState<string | null>(null);
  const [submittedBatchKey, setSubmittedBatchKey] = useState<string | null>(null);
  const result = rawResult && submittedKey === formKey ? rawResult : null;
  const batchResult =
    rawBatchResult && submittedBatchKey === batchFormKey ? rawBatchResult : null;

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

  const handleOfflineRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['schedule'] });
    queryClient.invalidateQueries({ queryKey: ['stations'] });
  };

  const [showIncomplete, setShowIncomplete] = useState(false);
  const isIncomplete =
    hasInteracted && ticketNumber.length > 0 && ticketNumber.length < 6;

  useEffect(() => {
    setShowIncomplete(false);
    if (!isIncomplete) return;
    const timer = setTimeout(() => {
      setShowIncomplete(true);
      haptics.warning();
    }, VALIDATION_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isIncomplete, ticketNumber]);

  const ticketError =
    isIncomplete && showIncomplete
      ? STRINGS.check.validationIncomplete(ticketNumber.length)
      : null;

  const parsedBatch = parseBatchTickets(batchText, 20);

  const isResultSaved =
    justSaved ||
    Boolean(
      result &&
        savedTickets.some(
          (t) =>
            t.ticket === result.ticket &&
            normalizeStationCode(t.station) ===
              normalizeStationCode(
                (result as any).stationCode || (result as any).station || '',
              ) &&
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
      Alert.alert(STRINGS.common.error, STRINGS.check.saveTicketError);
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
      Alert.alert(STRINGS.common.error, STRINGS.check.saveTicketError);
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

  const ctaState: 'disabled' | 'ready' | 'loading' = activeLoading
    ? 'loading'
    : isFormValid
      ? 'ready'
      : 'disabled';

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
      setSubmittedKey(`${selectedDate}|${selectedStation}|${ticketToSubmit}`);
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
      const text = (await Clipboard.getStringAsync()).trim();
      if (text) {
        setHasInteracted(true);
        setBatchText((prev) => (prev ? `${prev}\n${text}` : text));
        haptics.light();
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

    if (val.length === 6 && settings.autoSubmitEnabled && mode === 'single') {
      triggerSingleCheck(val);
    }
  };

  const handleSubmit = () => {
    setHasInteracted(true);
    setJustSaved(false);
    if (!isFormValid) {
      haptics.warning();
      setShowIncomplete(true);
      return;
    }

    if (mode === 'single') {
      triggerSingleCheck(ticketNumber);
    } else {
      haptics.medium();
      setSubmittedBatchKey(batchFormKey);
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
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        testID="check-keyboard-avoiding"
        behavior={getCheckKeyboardBehavior()}
        style={styles.flex}
      >
        <OfflineBanner onRetry={handleOfflineRetry} />

        <ScrollView
          ref={scrollViewRef}
          testID="check-scroll-view"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          style={styles.flex}
        >
          {/* Mode Selector at top (T11.33 wireframe) */}
          <View style={styles.modeSection}>
            <Segmented
              testID="mode-segmented"
              selectedKey={mode}
              onChange={(key) => setMode(key as 'single' | 'batch')}
              options={[
                {
                  key: 'single',
                  label: STRINGS.check.modeSingleShort,
                  testID: 'mode-single-btn',
                },
                {
                  key: 'batch',
                  label: STRINGS.check.modeBatchShort,
                  testID: 'mode-batch-btn',
                },
              ]}
            />
          </View>

          {/* Compact 1-line draw context + station chips (T11.33) */}
          <View testID="check-context-box" style={styles.contextRow}>
            <Text
              accessibilityRole="header"
              variant="body"
              color={colors.textMuted}
            >
              Kỳ{'  '}
              <Text variant="bodyStrong" color={colors.textMain}>
                {dayLabel} {shortDate}
                {activeStationObj?.name ? ` · ${activeStationObj.name}` : ''}
              </Text>
            </Text>

            <Pressable
              testID="check-context-picker-btn"
              accessibilityRole="button"
              accessibilityLabel="Đổi kỳ mở thưởng và đài quay"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => {
                haptics.selection();
                setIsPickerOpen(true);
              }}
              {...pickerHandlers}
              style={[styles.pickerBtn, { opacity: pickerPressed ? 0.7 : 1 }]}
            >
              <Text variant="bodyStrong" color={colors.primary}>
                Đổi ›
              </Text>
            </Pressable>
          </View>

          <StationChips
            selectedDate={selectedDate}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
          />

          {/* Ticket Input Section */}
          {mode === 'single' ? (
            <View style={styles.inputSection}>
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

              {ticketError ? (
                <View
                  testID="ticket-validation-error"
                  accessibilityRole="alert"
                  accessibilityLiveRegion="assertive"
                  style={[
                    styles.validationRow,
                    {
                      backgroundColor: colors.errorTint,
                      borderColor: colors.error,
                    },
                  ]}
                >
                  <Icon name="alertCircle" size={16} color={colors.error} />
                  <Text
                    variant="caption"
                    color={colors.error}
                    style={styles.validationText}
                  >
                    {ticketError}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.batchSection}>
              <BatchTicketInput
                value={batchText}
                onChangeText={setBatchText}
                onPaste={handleBatchPaste}
                maxTickets={20}
              />
            </View>
          )}

          {/* API Error Notification — unified actionable Banner (T11.48) */}
          {activeError ? (
            <Banner
              testID="api-error-banner"
              actionTestID="api-error-retry-btn"
              variant="error"
              title={getApiErrorMessage(
                activeErrorObj,
                STRINGS.common.unknownError,
              )}
              message={STRINGS.check.dataPreservedNotice}
              icon={<Icon name="alertCircle" size={18} color={colors.error} />}
              actionText={STRINGS.common.retry}
              onAction={handleSubmit}
              style={styles.errorBannerWrap}
            />
          ) : null}

          {activeLoading ? (
            <ResultSkeleton testID="check-loading-skeleton" />
          ) : null}

          {/* Single Result Stub (T11.34) */}
          {mode === 'single' && result && !isLoading ? (
            <View
              onLayout={(e) => {
                resultLayoutY.current = e.nativeEvent.layout.y;
              }}
            >
              <ResultStub
                result={result}
                testID="check-result-section"
                onCheckAgain={
                  result.status === 'RESULT_NOT_AVAILABLE'
                    ? handleSubmit
                    : () => {
                        resetSingle();
                        setTicketNumber('');
                        setJustSaved(false);
                      }
                }
                onSaveTicket={handleSaveTicket}
                isSaved={isResultSaved}
              />
            </View>
          ) : null}

          {/* Batch Result List */}
          {mode === 'batch' && batchResult && !isBatchLoading ? (
            <View
              testID="batch-results-section"
              style={styles.batchResultsSection}
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
          ) : null}
        </ScrollView>

        {/* Sticky Bottom CTA Bar (T11.36) */}
        <StickyFooter testID="sticky-cta-bar">
          <Pressable
            testID="check-ticket-button"
            disabled={ctaState !== 'ready'}
            onPress={handleSubmit}
            accessibilityRole="button"
            accessibilityLabel={
              mode === 'single'
                ? STRINGS.check.accessibilityCheckBtnSingle
                : STRINGS.check.accessibilityCheckBtnBatch
            }
            accessibilityState={{
              disabled: ctaState !== 'ready',
              busy: ctaState === 'loading',
            }}
            {...ctaHandlers}
            style={{
              ...styles.ctaButton,
              backgroundColor:
                ctaState === 'disabled' ? colors.surfaceSubtle : colors.primary,
              borderColor:
                ctaState === 'disabled' ? colors.border : colors.primary,
              opacity:
                ctaState === 'disabled' ? 0.85 : ctaPressed ? 0.88 : 1,
            }}
          >
            {activeLoading ? (
              <ActivityIndicator
                testID="check-cta-spinner"
                size="small"
                color={colors.onPrimary}
                style={styles.spinner}
              />
            ) : null}
            <Text
              variant="bodyStrong"
              color={
                ctaState === 'disabled' ? colors.textMuted : colors.onPrimary
              }
            >
              {activeLoading
                ? STRINGS.check.btnChecking
                : !isFormValid && mode === 'single' && ticketNumber.length < 6
                  ? STRINGS.check.ctaNeedSixDigits
                  : !isFormValid && !selectedStation
                    ? STRINGS.check.selectStationPrompt
                    : mode === 'single'
                      ? STRINGS.check.btnCheck
                      : STRINGS.check.btnCheckBatch(
                          parsedBatch.validTickets.length,
                        )}
            </Text>
          </Pressable>
        </StickyFooter>

        {/* Date + Station Calendar Picker Sheet (T11.33, T12.09) */}
        <CalendarPickerSheet
          visible={isPickerOpen}
          selectedDate={selectedDate}
          onSelectDate={(dateStr) => {
            setUserPickedDate(true);
            setSelectedDate(dateStr);
          }}
          onClose={() => setIsPickerOpen(false)}
          title="Chọn kỳ mở thưởng"
          dayTestIDPrefix="sheet-date"
          testID="check-context-sheet"
          headerSlot={
            <>
              <Text
                variant="caption"
                color={colors.textMuted}
                style={styles.sheetLabel}
              >
                Đài mở thưởng ngày {formatDateVN(selectedDate)}
              </Text>
              <View style={styles.sheetStations}>
                {stations.map((st) => (
                  <Chip
                    key={st.code ?? st.name}
                    label={st.name ?? st.code ?? ''}
                    selected={st.code === selectedStation}
                    onPress={() => {
                      if (st.code) setSelectedStation(st.code);
                      setIsPickerOpen(false);
                    }}
                  />
                ))}
              </View>
            </>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
  modeSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    minHeight: 44,
  },
  pickerBtn: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  inputSection: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  batchSection: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  validationText: {
    marginLeft: 6,
  },
  errorBannerWrap: {
    marginTop: 14,
    marginHorizontal: 16,
  },
  batchResultsSection: {
    marginTop: 14,
    paddingHorizontal: 16,
  },
  ctaButton: {
    width: '100%',
    height: 52,
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  sheetLabel: {
    marginBottom: 8,
  },
  sheetStations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
});
