import React, { useMemo } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Icon } from './Icon';
import { useTheme } from '../theme';
import { STRINGS } from '../lib/strings';

export type BatchTokenType = 'valid' | 'duplicate' | 'invalid';

export interface BatchToken {
  text: string;
  type: BatchTokenType;
  index: number;
}

export interface BatchParsedResult {
  validTickets: string[];
  invalidTokens: string[];
  duplicateCount: number;
  count: number;
  isOverLimit: boolean;
  error: string | null;
  notice: string | null;
  tokens: BatchToken[];
}

export function parseBatchTickets(
  rawText: string,
  maxTickets: number = 20,
): BatchParsedResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      validTickets: [],
      invalidTokens: [],
      duplicateCount: 0,
      count: 0,
      isOverLimit: false,
      error: null,
      notice: null,
      tokens: [],
    };
  }

  const rawTokens = trimmed
    .split(/[\r\n,;\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const validTickets: string[] = [];
  const seen = new Set<string>();
  const invalidTokens: string[] = [];
  const tokenList: BatchToken[] = [];
  let duplicateCount = 0;

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];
    if (/^\d{6}$/.test(token)) {
      if (seen.has(token)) {
        duplicateCount++;
        tokenList.push({ text: token, type: 'duplicate', index: i });
      } else {
        seen.add(token);
        validTickets.push(token);
        tokenList.push({ text: token, type: 'valid', index: i });
      }
    } else {
      invalidTokens.push(token);
      tokenList.push({ text: token, type: 'invalid', index: i });
    }
  }

  const count = validTickets.length;
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

  return {
    validTickets,
    invalidTokens,
    duplicateCount,
    count,
    isOverLimit,
    error,
    notice,
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

  const parsed = useMemo(
    () => parseBatchTickets(value, maxTickets),
    [value, maxTickets],
  );

  const hasError = Boolean(parsed.error);

  return (
    <View className="w-full">
      {/* Input Box Container */}
      <View
        className="rounded-2xl border p-3.5"
        style={{
          backgroundColor: colors.surface,
          borderColor: hasError ? colors.error : colors.border,
          borderWidth: hasError ? 1.5 : 1,
        }}
      >
        {/* Header row inside box */}
        <View
          className="flex-row items-center justify-between pb-2 mb-1 border-b"
          style={{ borderColor: colors.border }}
        >
          <View className="flex-row items-center">
            <Icon name="ticket" size={15} color={colors.primary} />
            <Text
              className="text-xs font-bold ml-1.5"
              style={{ color: colors.textMain }}
            >
              {STRINGS.check.batchInputTitle}
            </Text>
          </View>

          <View className="flex-row items-center">
            {/* Paste Button (T10.36) */}
            {onPaste && (
              <Pressable
                testID="batch-paste-btn"
                accessibilityRole="button"
                accessibilityLabel={STRINGS.check.batchPasteBtn}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                onPress={onPaste}
                className="px-2 py-0.5 rounded-md border flex-row items-center mr-2 active:opacity-60"
                style={{
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                }}
              >
                <Icon name="clipboard" size={12} color={colors.primary} />
                <Text
                  className="text-xs font-semibold ml-1"
                  style={{ color: colors.primary }}
                >
                  Dán
                </Text>
              </Pressable>
            )}

            {/* Ticket Counter Badge */}
            <View
              className="px-2 py-0.5 rounded-full mr-2"
              style={{
                backgroundColor: hasError
                  ? `${colors.error}1A`
                  : `${colors.primary}1A`,
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{
                  color: hasError ? colors.error : colors.primary,
                }}
              >
                {STRINGS.check.batchCounter(parsed.count, maxTickets)}
              </Text>
            </View>

            {/* Clear Button */}
            {value.length > 0 && (
              <Pressable
                testID="batch-clear-btn"
                accessibilityRole="button"
                accessibilityLabel={STRINGS.check.batchClearA11y}
                onPress={() => onChangeText('')}
                className="p-1 active:opacity-60"
              >
                <Icon name="x" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Text Area (with Return Key to type next ticket smoothly) */}
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
          className="text-sm font-medium leading-relaxed py-1 min-h-[96px]"
          style={{
            color: colors.textMain,
            fontVariant: ['tabular-nums'],
          }}
        />

        {/* Tokenized Chips list (T10.36) */}
        {parsed.tokens.length > 0 && (
          <View
            testID="batch-token-chips"
            className="flex-row flex-wrap gap-1.5 mt-2 pt-2 border-t"
            style={{ borderColor: colors.surfaceSubtle }}
          >
            {parsed.tokens.map((token, idx) => {
              const isValid = token.type === 'valid';
              const isDup = token.type === 'duplicate';
              const isInvalid = token.type === 'invalid';

              return (
                <View
                  key={`token-${token.text}-${idx}`}
                  testID={`batch-token-chip-${token.text}`}
                  className="px-2 py-0.5 rounded-md border flex-row items-center"
                  style={{
                    backgroundColor: isValid
                      ? colors.surfaceSubtle
                      : isDup
                        ? colors.pendingBg
                        : colors.errorBg,
                    borderColor: isValid
                      ? colors.border
                      : isDup
                        ? colors.pendingBorder
                        : colors.error,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{
                      color: isValid
                        ? colors.textMain
                        : isDup
                          ? colors.pending
                          : colors.error,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {token.text}
                    {isDup ? ` (${STRINGS.check.duplicateTag})` : isInvalid ? ` (${STRINGS.check.invalidTag})` : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Error Message */}
      {hasError && (
        <View
          testID="batch-input-error"
          className="flex-row items-center mt-2 px-1"
        >
          <Icon name="alertCircle" size={14} color={colors.error} />
          <Text
            className="text-xs font-medium ml-1.5 flex-1"
            style={{ color: colors.error }}
          >
            {parsed.error}
          </Text>
        </View>
      )}

      {/* Duplicate Notice */}
      {!hasError && parsed.notice && (
        <View
          testID="batch-input-notice"
          className="flex-row items-center mt-2 px-1"
        >
          <Icon name="info" size={14} color={colors.primary} />
          <Text
            className="text-xs font-medium ml-1.5 flex-1"
            style={{ color: colors.primary }}
          >
            {parsed.notice}
          </Text>
        </View>
      )}
    </View>
  );
};
