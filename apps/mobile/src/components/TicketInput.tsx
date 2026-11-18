import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Animated,
  AccessibilityInfo,
  PixelRatio,
  Platform,
  StyleSheet,
  type NativeSyntheticEvent,
} from 'react-native';
import { useTheme } from '@/theme';
import { radii, typeScale } from '@/theme/tokens';

export interface TicketInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
  fontScaleOverride?: number;
  testID?: string;
}

const TICKET_LENGTH = 6;
const LARGE_FONT_THRESHOLD = 1.3;

type KeyPressEvent = NativeSyntheticEvent<{ key: string }>;

function resolveFontScale(override?: number): number {
  if (typeof override === 'number') return override;
  if (
    Platform.OS === 'web' &&
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as any).__DOVE_FONT_SCALE__ === 'number'
  ) {
    return (globalThis as any).__DOVE_FONT_SCALE__;
  }
  return PixelRatio.getFontScale ? PixelRatio.getFontScale() : 1;
}

export function TicketInput({
  value = '',
  onChangeText,
  onComplete,
  disabled = false,
  autoFocus = true,
  hasError = false,
  fontScaleOverride,
  testID = 'ticket-input',
}: TicketInputProps) {
  const { colors } = useTheme();
  const inputRefs = useRef<any[]>([]);
  const hiddenInputRef = useRef<any>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [singleFocused, setSingleFocused] = useState(false);

  // Shake animation for error state, respects reduceMotion
  const [shakeAnim] = useState(() => new Animated.Value(0));
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
    if (hasError && !reduceMotion) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -6, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [hasError, reduceMotion, shakeAnim]);

  // Preserve digit positions: if a slot is a space or missing, keep it as empty string
  const digits = Array.from(
    { length: TICKET_LENGTH },
    (_, i) => (value[i] && /\d/.test(value[i]) ? value[i] : ''),
  );
  const cleanDigits = digits.join('');

  const handleHiddenChange = (text: string) => {
    const rawClean = text.replace(/\D/g, '').slice(0, TICKET_LENGTH);
    onChangeText(rawClean);
    if (rawClean.length === TICKET_LENGTH) {
      onComplete?.(rawClean);
    }
  };

  const focusInputAt = useCallback((idx: number) => {
    inputRefs.current[idx]?.focus();
  }, []);

  const handleChange = useCallback(
    (text: string, index: number) => {
      const rawClean = text.replace(/\D/g, '');

      // Case 1: User pastes multiple digits (e.g. "12 34 56" or "012345")
      if (rawClean.length > 1) {
        const newDigits = (
          cleanDigits.slice(0, index) +
          rawClean +
          cleanDigits.slice(index + 1)
        )
          .replace(/\D/g, '')
          .slice(0, TICKET_LENGTH);

        onChangeText(newDigits);

        if (newDigits.length === TICKET_LENGTH) {
          focusInputAt(TICKET_LENGTH - 1);
          onComplete?.(newDigits);
        } else {
          const nextIndex = Math.min(newDigits.length, TICKET_LENGTH - 1);
          focusInputAt(nextIndex);
        }
        return;
      }

      // Case 2: Single digit entered or cleared
      const char = rawClean.slice(-1);
      const chars = [...digits];
      chars[index] = char;

      // Convert trailing empty slots to trimmed string, but keep internal spaces to avoid shifting
      let result = chars.map((c) => (c ? c : ' ')).join('');
      result = result.replace(/\s+$/, '');

      onChangeText(result);

      if (char && index < TICKET_LENGTH - 1) {
        focusInputAt(index + 1);
      }

      if (/^\d{6}$/.test(result)) {
        onComplete?.(result);
      }
    },
    [cleanDigits, digits, focusInputAt, onChangeText, onComplete],
  );

  const handleKeyPress = useCallback(
    (e: KeyPressEvent, index: number) => {
      if (e.nativeEvent.key === 'Backspace') {
        if (!digits[index] && index > 0) {
          // Current box is empty, move back and clear previous box
          const chars = [...digits];
          chars[index - 1] = '';
          const result = chars
            .map((c) => (c ? c : ' '))
            .join('')
            .replace(/\s+$/, '');
          onChangeText(result);
          focusInputAt(index - 1);
        }
      }
    },
    [digits, focusInputAt, onChangeText],
  );

  const fontScale = resolveFontScale(fontScaleOverride);
  const useSingleLargeInput = fontScale > LARGE_FONT_THRESHOLD;
  const webNoOutline =
    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

  if (useSingleLargeInput) {
    return (
      <Animated.View
        testID={testID}
        style={[
          styles.container,
          {
            transform: [{ translateX: shakeAnim }],
          },
        ]}
        accessibilityRole="none"
        accessibilityLabel={`Số vé: ${cleanDigits || 'chưa nhập'}`}
      >
        <TextInput
          ref={hiddenInputRef}
          testID={`${testID}-hidden-input`}
          value={value}
          onChangeText={handleHiddenChange}
          keyboardType="number-pad"
          maxLength={16}
          editable={!disabled}
          maxFontSizeMultiplier={1.4}
          style={styles.hiddenInput}
        />
        <View
          testID={`${testID}-single-box`}
          style={{
            ...styles.singleBox,
            borderColor: hasError
              ? colors.error
              : singleFocused && !disabled
                ? colors.primary
                : colors.border,
            borderWidth: hasError || (singleFocused && !disabled) ? 2 : 1.5,
            backgroundColor:
              cleanDigits.length > 0 ? colors.surface : colors.surfaceSunken,
          }}
        >
          <TextInput
            testID={`${testID}-single-input`}
            value={cleanDigits}
            onChangeText={handleHiddenChange}
            onFocus={() => setSingleFocused(true)}
            onBlur={() => setSingleFocused(false)}
            keyboardType="number-pad"
            maxLength={16}
            editable={!disabled}
            autoFocus={autoFocus}
            selectTextOnFocus
            placeholder="000000"
            placeholderTextColor={colors.border}
            maxFontSizeMultiplier={1.35}
            accessibilityLabel="Nhập 6 chữ số trên vé"
            accessibilityState={{ disabled }}
            style={[
              styles.singleInput,
              { color: colors.textMain },
              webNoOutline,
            ]}
          />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,
        {
          transform: [{ translateX: shakeAnim }],
        },
      ]}
      accessibilityRole="none"
      accessibilityLabel={`Số vé: ${cleanDigits || 'chưa nhập'}`}
    >
      {/* Hidden TextInput for native autofill and full paste */}
      <TextInput
        ref={hiddenInputRef}
        testID={`${testID}-hidden-input`}
        value={value}
        onChangeText={handleHiddenChange}
        keyboardType="number-pad"
        maxLength={16}
        editable={!disabled}
        maxFontSizeMultiplier={1.4}
        style={styles.hiddenInput}
      />

      {Array.from({ length: TICKET_LENGTH }).map((_, index) => {
        const isFilled = Boolean(digits[index]);
        const isFocused = !disabled && focusedIndex === index;

        let borderColor = colors.border;
        let borderWidth = 1.5;
        if (hasError) {
          borderColor = colors.error;
          borderWidth = 2;
        } else if (isFocused) {
          borderColor = colors.primary;
          borderWidth = 2;
        }

        return (
          <View
            key={index}
            style={{
              ...styles.box,
              borderColor,
              borderWidth,
              backgroundColor: isFilled ? colors.surface : colors.surfaceSunken,
            }}
          >
            <TextInput
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              testID={`${testID}-digit-${index}`}
              style={[
                styles.digitInput,
                { color: colors.textMain },
                webNoOutline,
              ]}
              keyboardType="number-pad"
              maxLength={12}
              value={digits[index]}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              editable={!disabled}
              autoFocus={autoFocus && index === 0}
              selectTextOnFocus
              maxFontSizeMultiplier={1.3}
              accessibilityLabel={`Chữ số thứ ${index + 1}`}
              accessibilityHint="Nhập chữ số từ 0 đến 9"
              accessibilityState={{ disabled }}
            />
          </View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    columnGap: 8,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  box: {
    flex: 1,
    aspectRatio: 0.8,
    maxWidth: 56,
    minHeight: 56,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontFamily: typeScale.ticketLg.fontFamily,
    fontSize: 26,
    fontVariant: ['tabular-nums'],
    padding: 0,
  },
  singleBox: {
    flex: 1,
    minHeight: 68,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  singleInput: {
    width: '100%',
    minHeight: 60,
    textAlign: 'center',
    fontFamily: typeScale.ticketLg.fontFamily,
    fontSize: typeScale.ticketLg.fontSize,
    fontVariant: ['tabular-nums'],
    letterSpacing: 6,
    padding: 0,
  },
});
