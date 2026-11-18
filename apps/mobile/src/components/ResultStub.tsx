import React, { useEffect, useState, useRef } from 'react';
import { View, AccessibilityInfo, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { motion, radii } from '@/theme/tokens';
import { Text, Button, TicketNumber, Perforation } from './ui';
import { Icon } from './Icon';
import {
  computePositionAwareSegments,
  getLongestMatchedSuffix,
} from './HighlightedTicket';
import {
  formatCurrency,
  formatDateVN,
  getEstimatedDrawTimeMessage,
} from '@/lib/format';
import { amountInWordsVN } from '@/lib/amountInWords';
import { STRINGS } from '@/lib/strings';
import { haptics } from '@/lib/haptics';
import type { CheckTicketResponse } from '@/types';
import type { UiCheckResult } from '@/api/mappers';

export interface ResultStubProps {
  result: UiCheckResult | CheckTicketResponse;
  onSaveTicket?: (result: any) => void;
  isSaved?: boolean;
  onCheckAgain?: () => void;
  checkAgainLabel?: string;
  showPerforation?: boolean;
  compact?: boolean;
  testID?: string;
}

/**
 * Paper ticket result stub with 3 honest states (T11.34):
 * - Won: `winTint` + `winBorder`, `TicketNumber` suffix/position highlight,
 *   `display` prize + `amountInWordsVN`, tier breakdown, tax note, subtle 200ms scale-in.
 * - Not won: calm `surface` + `border`, polite copy, no red alarm colors.
 * - Pending: `pendingTint` + `pendingBorder`, expected draw time, save-to-recheck CTA.
 */
export function ResultStub({
  result,
  onSaveTicket,
  isSaved = false,
  onCheckAgain,
  checkAgainLabel,
  showPerforation = true,
  compact = false,
  testID = 'result-card',
}: ResultStubProps) {
  const { colors } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const isPending = result.status === 'RESULT_NOT_AVAILABLE';
  const isWon = !isPending && Boolean(result.won);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.98);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) setReduceMotion(enabled);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      isMounted = false;
      sub?.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      scale.value = 1;
      return;
    }
    const [x1, y1, x2, y2] = motion.easing.outQuart;
    const easingOutQuart = Easing.bezier(x1, y1, x2, y2);
    opacity.value = withTiming(1, {
      duration: motion.duration.normal,
      easing: easingOutQuart,
    });
    scale.value = withTiming(1, {
      duration: motion.duration.normal,
      easing: easingOutQuart,
    });
  }, [opacity, scale, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const wins = result.wins ?? [];
  const winCount = wins.length;
  const formattedDate = formatDateVN(result.drawDate ?? '');
  const ticket = result.ticket ?? '';
  const longestMatched = getLongestMatchedSuffix(ticket, wins as any);

  const { segments } = computePositionAwareSegments(ticket, {
    matchedDigits: longestMatched,
    wins: wins as any,
  });
  const matchedPositions = isWon
    ? segments.flatMap((seg) => Array.from(seg.text).map(() => seg.isMatched))
    : undefined;

  const totalPrize =
    typeof (result as any).totalPrize === 'number'
      ? (result as any).totalPrize
      : typeof (result as any).totalAmount === 'number'
        ? (result as any).totalAmount
        : 0;
  const safeAmount = Math.max(0, Math.round(totalPrize));
  const prizeWords = isWon && safeAmount > 0 ? amountInWordsVN(safeAmount) : '';

  const stationName =
    (result as any).stationName ||
    (result as any).station ||
    (result as any).stationCode ||
    '';

  const hasTriggeredHapticsRef = useRef(false);
  useEffect(() => {
    if (isWon && !hasTriggeredHapticsRef.current) {
      hasTriggeredHapticsRef.current = true;
      haptics.success();
    }
  }, [isWon]);

  const cardBg = isPending
    ? colors.pendingTint
    : isWon
      ? colors.winTint
      : colors.surface;
  const cardBorder = isPending
    ? colors.pendingBorder
    : isWon
      ? colors.winBorder
      : colors.border;

  const singleTierName =
    winCount === 1 ? (wins[0] as any)?.tierName || '' : '';
  const wonHeadline =
    winCount === 1 && singleTierName
      ? `Trúng ${singleTierName}`
      : STRINGS.check.resultWonCount(Math.max(1, winCount));

  const formattedPrizeA11y = formatCurrency(safeAmount).replace(/\s*đ$/, ' đồng');
  const a11ySummary = isPending
    ? `${STRINGS.check.resultPendingTitle}. ${STRINGS.check.resultPendingSubtitle}`
    : isWon
      ? `Chúc mừng, vé trúng ${Math.max(1, winCount)} giải, tổng ${formattedPrizeA11y}`
      : `${STRINGS.check.resultLostTitle}. ${STRINGS.check.resultLostSubtitle}`;

  return (
    <View style={compact ? undefined : styles.outerMargin}>
      {showPerforation ? <Perforation /> : null}
      <Animated.View
        testID={`${testID}-container`}
        style={[
          styles.stub,
          animatedStyle,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
          },
        ]}
      >
        {/* Summary grouped for TalkBack/VoiceOver; buttons below stay independently focusable (T11.22) */}
        <View
          testID={testID}
          accessible={true}
          accessibilityRole="summary"
          accessibilityLabel={a11ySummary}
          accessibilityLiveRegion="assertive"
        >
          <View style={styles.contextRow}>
            <Text
              testID="result-card-context-line"
              variant="caption"
              color={colors.textMuted}
            >
              {stationName ? `${stationName} · ` : ''}
              {formattedDate}
            </Text>
          </View>

          <View style={styles.heroTicketWrap}>
            <TicketNumber
              ticket={ticket}
              size={compact ? 'md' : 'lg'}
              matchedSuffixLength={longestMatched.length}
              matchedPositions={matchedPositions}
              testID="result-card-hero-ticket"
            />
          </View>

          <View style={styles.statusBlock}>
            <Text
              testID="result-card-status-title"
              variant="headline"
              color={
                isPending
                  ? colors.pending
                  : isWon
                    ? colors.win
                    : colors.textMain
              }
            >
              {isPending
                ? STRINGS.check.resultPendingTitle
                : isWon
                  ? wonHeadline
                  : STRINGS.check.resultLostBadge}
            </Text>

            <Text variant="caption" color={colors.textMuted} style={styles.subtitle}>
              {isPending
                ? STRINGS.check.resultPendingSubtitle
                : isWon
                  ? STRINGS.check.resultWonTitle
                  : STRINGS.check.resultLostTitle}
            </Text>

            {!isPending && !isWon ? (
              <Text variant="caption" color={colors.textMuted} style={styles.subtitleSmall}>
                {STRINGS.check.resultLostSubtitle}
              </Text>
            ) : null}

            {isWon && safeAmount > 0 ? (
              <View style={styles.amountHero}>
                <Text
                  testID="result-card-total-prize"
                  variant="display"
                  color={colors.win}
                  style={styles.tabular}
                >
                  {formatCurrency(safeAmount)}
                </Text>
                <Text
                  testID="result-stub-amount-words"
                  variant="bodyStrong"
                  color={colors.win}
                  style={styles.amountWords}
                >
                  {prizeWords}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {isPending ? (
          <View style={styles.bodySection} testID="result-card-pending-section">
            <View
              testID="result-card-pending-estimate"
              style={[
                styles.estimateRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.pendingBorder,
                },
              ]}
            >
              <Icon name="clock" size={16} color={colors.pending} />
              <Text variant="caption" color={colors.textMain} style={styles.estimateText}>
                {getEstimatedDrawTimeMessage(result.drawDate)}
              </Text>
            </View>
            <Text variant="caption" color={colors.textMuted} style={styles.pendingNotice}>
              {STRINGS.check.pendingNotice}
            </Text>

            {onSaveTicket ? (
              <Button
                testID="result-card-save-btn"
                variant={isSaved ? 'secondary' : 'primary'}
                enableHaptics={false}
                title={
                  isSaved
                    ? STRINGS.check.savedPendingTicket
                    : STRINGS.check.savePendingTicket
                }
                accessibilityLabel={
                  isSaved
                    ? STRINGS.check.savedPendingTicket
                    : STRINGS.check.savePendingTicket
                }
                icon={
                  <Icon
                    name={isSaved ? 'check' : 'bookmark'}
                    size={16}
                    color={isSaved ? colors.win : colors.onPrimary}
                  />
                }
                onPress={() => {
                  haptics.light();
                  onSaveTicket(result);
                }}
              />
            ) : null}

            {onCheckAgain ? (
              <Button
                testID="result-card-retry-btn"
                variant="secondary"
                enableHaptics={false}
                title={checkAgainLabel || STRINGS.check.checkAgain}
                accessibilityLabel={checkAgainLabel || STRINGS.check.checkAgain}
                style={styles.secondaryAction}
                icon={<Icon name="refresh" size={16} color={colors.textMuted} />}
                onPress={() => {
                  haptics.light();
                  onCheckAgain();
                }}
              />
            ) : null}
          </View>
        ) : (
          <View style={styles.bodySection}>
            {isWon && wins.length > 0 ? (
              <View style={styles.winsList}>
                {wins.map((win, idx) => {
                  const digits =
                    (win as any).matchedDigits || (win as any).matchedNumber || '';
                  const matchLabel =
                    win.tier === 'ENCOURAGEMENT'
                      ? STRINGS.check.encouragementMatch(
                          (win as any).matchedNumber || '',
                        )
                      : digits
                        ? digits.length === 6
                          ? `Trùng khớp 6 số · ${digits}`
                          : `Khớp ${digits.length} số cuối · ${digits}`
                        : '';

                  return (
                    <View
                      key={`${win.tier}-${idx}`}
                      testID={`prize-row-${idx}`}
                      style={[
                        styles.winRow,
                        { borderBottomColor: colors.winBorder },
                      ]}
                    >
                      <View style={styles.winRowLeft}>
                        <Text variant="bodyStrong" color={colors.textMain}>
                          {(win as any).tierName || win.tier}
                        </Text>
                        {matchLabel ? (
                          <Text variant="caption" color={colors.textMuted}>
                            {matchLabel}
                          </Text>
                        ) : null}
                      </View>
                      {wins.length > 1 ? (
                        <Text
                          variant="bodyStrong"
                          color={colors.textMain}
                          style={styles.tabular}
                        >
                          {formatCurrency(win.prizeAmount ?? 0)}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}

                <Text
                  testID="result-card-tax-note"
                  variant="caption"
                  color={colors.textMuted}
                  style={styles.taxNote}
                >
                  {STRINGS.check.taxNote}
                </Text>
              </View>
            ) : null}

            {(onSaveTicket || onCheckAgain) ? (
              <View style={styles.actionRow}>
                {onSaveTicket ? (
                  <Button
                    testID="result-card-save-btn"
                    variant={isSaved ? 'secondary' : 'primary'}
                    enableHaptics={false}
                    style={styles.flexBtn}
                    title={
                      isSaved ? STRINGS.check.savedTicket : STRINGS.check.saveTicket
                    }
                    accessibilityLabel={
                      isSaved ? STRINGS.check.savedTicket : STRINGS.check.saveTicket
                    }
                    icon={
                      <Icon
                        name={isSaved ? 'check' : 'bookmark'}
                        size={16}
                        color={isSaved ? colors.win : colors.onPrimary}
                      />
                    }
                    onPress={() => {
                      haptics.light();
                      onSaveTicket(result);
                    }}
                  />
                ) : null}

                {onCheckAgain ? (
                  <Button
                    testID="result-card-retry-btn"
                    variant="secondary"
                    enableHaptics={false}
                    style={styles.flexBtn}
                    title={checkAgainLabel || 'Dò vé khác'}
                    accessibilityLabel={checkAgainLabel || 'Dò vé khác'}
                    onPress={() => {
                      haptics.light();
                      onCheckAgain();
                    }}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        )}

        <Text variant="caption" color={colors.textMuted} style={styles.disclaimer}>
          {STRINGS.check.disclaimer}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerMargin: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  stub: {
    padding: 18,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  heroTicketWrap: {
    paddingVertical: 6,
    alignItems: 'flex-start',
  },
  statusBlock: {
    marginTop: 4,
    marginBottom: 8,
  },
  subtitle: {
    marginTop: 2,
  },
  subtitleSmall: {
    marginTop: 2,
  },
  amountHero: {
    marginTop: 10,
  },
  amountWords: {
    marginTop: 2,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  bodySection: {
    marginTop: 4,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 10,
  },
  estimateText: {
    marginLeft: 8,
    flex: 1,
  },
  pendingNotice: {
    marginBottom: 12,
  },
  secondaryAction: {
    marginTop: 8,
  },
  winsList: {
    marginBottom: 12,
  },
  winRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  winRowLeft: {
    flex: 1,
    paddingRight: 12,
  },
  taxNote: {
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  flexBtn: {
    flex: 1,
  },
  disclaimer: {
    marginTop: 12,
    textAlign: 'center',
  },
});
