import React, { useMemo } from 'react';
import { View, TextInput, Pressable, Platform, StyleSheet } from 'react-native';
import { Text, usePressed } from './ui';
import { Icon } from './Icon';
import { useTheme } from '../theme';
import { radii } from '../theme/tokens';
import { STRINGS } from '../lib/strings';

export type BatchTokenType = 'valid' | 'duplicate' | 'invalid';

export interface BatchToken {
  text: string;
  type: BatchTokenType;
  index: number;
  line: number;
}

export interface BatchParsedResult {
  validTickets: string[];
  invalidTokens: string[];
  invalidLines: number[];
  duplicateCount: number;
  count: number;
  isOverLimit: boolean;
  error: string | null;
  notice: string | null;
  statusSummary: string | null;
  tokens: BatchToken[];
}

export function parseBatchTickets(
  rawText: string,
  maxTickets: number = 20,
): BatchParsedResult {
  if (!rawText.trim()) {
    return {
      validTickets: [],
      invalidTokens: [],
      invalidLines: [],
      duplicateCount: 0,
      count: 0,
      isOverLimit: false,
      error: null,
      notice: null,
      statusSummary: null,
      tokens: [],
    };
  }

  const lines = rawText.split(/\r?\n/);
  const validTickets: string[] = [];
  const seen = new Set<string>();
  const invalidTokens: string[] = [];
  const invalidLineSet = new Set<number>();
  const tokenList: BatchToken[] = [];
  let duplicateCount = 0;
  let tokenIndex = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineNum = lineIdx + 1;
    const parts = lines[lineIdx]
      .split(/[,;\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    for (const token of parts) {
      if (/^\d{6}$/.test(token)) {
        if (seen.has(token)) {
          duplicateCount++;
          tokenList.push({
            text: token,
            type: 'duplicate',
            index: tokenIndex++,
            line: lineNum,
          });
        } else {
          seen.add(token);
          validTickets.push(token);
          tokenList.push({
            text: token,
            type: 'valid',
            index: tokenIndex++,
            line: lineNum,
          });
        }
      } else {
        invalidTokens.push(token);
        invalidLineSet.add(lineNum);
        tokenList.push({
          text: token,
          type: 'invalid',
          index: tokenIndex++,
          line: lineNum,
        });
      }
    }
  }

  const count = validTickets.length;
  const invalidLines = Array.from(invalidLineSet);
  const isOverLimit = count > maxTickets;

  let error: string | null = null;
  if (isOverLimit) {
    error = STRINGS.check.batchErrorOverLimit(maxTickets, count);
  } else if (invalidTokens.length > 0) {
    const preview = invalidTokens.slice(0, 3).join(', ');
    const more = invalidTokens.length > 3 ? '...' : '';
    error = STRINGS.check.batchErrorInvalidTokens(`${preview}${more}`);
  }

  const notice =
    duplicateCount > 0
      ? STRINGS.check.batchDuplicateNotice(duplicateCount)
      : null;

  let statusSummary: string | null = null;
  if (invalidTokens.length > 0) {
    statusSummary = `${count} vé hợp lệ · ${invalidTokens.length} lỗi ở dòng ${invalidLines.join(', ')}`;
  } else if (duplicateCount > 0) {
    statusSummary = `${count} vé hợp lệ · đã bỏ ${duplicateCount} vé trùng`;
  } else if (count > 0) {
    statusSummary = `${count} vé hợp lệ`;
  }

  return {
    validTickets,
    invalidTokens,
    invalidLines,
    duplicateCount,
    count,
    isOverLimit,
    error,
    notice,
    statusSummary,
    tokens: tokenList,
  };
}

export interface BatchTicketInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onPaste?: () => void;
  maxTickets?: number;
  testID?: string;
}

export const BatchTicketInput: React.FC<BatchTicketInputProps> = ({
  value,
  onChangeText,
  onPaste,
  maxTickets = 20,
  testID = 'batch-ticket-input',
}) => {
  const { colors } = useTheme();
  const { pressed: pastePressed, pressHandlers: pasteHandlers } = usePressed();
  const { pressed: clearPressed, pressHandlers: clearHandlers } = usePressed();

  const parsed = useMemo(
    () => parseBatchTickets(value, maxTickets),
    [value, maxTickets],
  );

  const hasError = Boolean(parsed.error);
  const webNoOutline =
    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.box,
          {
            backgroundColor: colors.surface,
            borderColor: hasError ? colors.error : colors.border,
            borderWidth: hasError ? 1.5 : 1,
          },
        ]}
      >
        {/* Top bar: title + Paste + Counter + Clear */}
        <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
          <Text variant="caption" color={colors.textMuted}>
            {STRINGS.check.batchInputTitle}
          </Text>

          <View style={styles.headerActions}>
            {onPaste ? (
              <Pressable
                testID="batch-paste-btn"
                accessibilityRole="button"
                accessibilityLabel={STRINGS.check.batchPasteBtn}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                onPress={onPaste}
                {...pasteHandlers}
                style={[
                  styles.pasteBtn,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    opacity: pastePressed ? 0.7 : 1,
                  },
                ]}
              >
                <Icon name="clipboard" size={12} color={colors.primary} />
                <Text
                  variant="caption"
                  color={colors.primary}
                  style={styles.pasteLabel}
                >
                  Dán
                </Text>
              </Pressable>
            ) : null}

            <View
              style={[
                styles.counterPill,
                {
                  backgroundColor: hasError
                    ? colors.errorTint
                    : colors.primaryTint,
                },
              ]}
            >
              <Text
                variant="caption"
                color={hasError ? colors.error : colors.primary}
                style={styles.tabular}
              >
                {STRINGS.check.batchCounter(parsed.count, maxTickets)}
              </Text>
            </View>

            {value.length > 0 ? (
              <Pressable
                testID="batch-clear-btn"
                accessibilityRole="button"
                accessibilityLabel={STRINGS.check.batchClearA11y}
                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                onPress={() => onChangeText('')}
                {...clearHandlers}
                style={[styles.clearBtn, { opacity: clearPressed ? 0.65 : 1 }]}
              >
                <Icon name="x" size={16} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <TextInput
          testID={testID}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
          returnKeyType="default"
          placeholder={STRINGS.check.batchPlaceholder(maxTickets)}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          style={[
            styles.textArea,
            { color: colors.textMain },
            webNoOutline,
          ]}
        />

        {parsed.tokens.length > 0 ? (
          <View
            testID="batch-token-chips"
            style={[styles.chipsRow, { borderTopColor: colors.surfaceSubtle }]}
          >
            {parsed.tokens.map((token, idx) => {
              const isValid = token.type === 'valid';
              const isDup = token.type === 'duplicate';
              const isInvalid = token.type === 'invalid';

              return (
                <View
                  key={`token-${token.text}-${idx}`}
                  testID={`batch-token-chip-${token.text}`}
                  style={[
                    styles.tokenChip,
                    {
                      backgroundColor: isValid
                        ? colors.surfaceSubtle
                        : isDup
                          ? colors.pendingTint
                          : colors.errorTint,
                      borderColor: isValid
                        ? colors.border
                        : isDup
                          ? colors.pendingBorder
                          : colors.error,
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    color={
                      isValid
                        ? colors.textMain
                        : isDup
                          ? colors.pending
                          : colors.error
                    }
                    style={styles.tabular}
                  >
                    {token.text}
                    {isDup
                      ? ` (${STRINGS.check.duplicateTag})`
                      : isInvalid
                        ? ` (${STRINGS.check.invalidTag})`
                        : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>

      {parsed.statusSummary ? (
        <Text
          testID="batch-status-summary"
          variant="caption"
          color={hasError ? colors.error : colors.textMuted}
          style={styles.summaryLine}
        >
          {parsed.statusSummary}
        </Text>
      ) : null}

      {hasError ? (
        <View testID="batch-input-error" style={styles.messageRow}>
          <Icon name="alertCircle" size={14} color={colors.error} />
          <Text
            variant="caption"
            color={colors.error}
            style={styles.messageText}
          >
            {parsed.error}
          </Text>
        </View>
      ) : null}

      {!hasError && parsed.notice ? (
        <View testID="batch-input-notice" style={styles.messageRow}>
          <Icon name="info" size={14} color={colors.textMuted} />
          <Text
            variant="caption"
            color={colors.textMuted}
            style={styles.messageText}
          >
            {parsed.notice}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  box: {
    borderRadius: radii.lg,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pasteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pasteLabel: {
    marginLeft: 4,
  },
  counterPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  clearBtn: {
    padding: 4,
  },
  textArea: {
    minHeight: 100,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'BeVietnamPro-Medium',
    fontVariant: ['tabular-nums'],
    paddingVertical: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tokenChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  summaryLine: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  messageText: {
    marginLeft: 6,
    flex: 1,
  },
});
