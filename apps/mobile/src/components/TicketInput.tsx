import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Animated,
  AccessibilityInfo,
  PixelRatio,
  type NativeSyntheticEvent,
} from 'react-native';
import { useTheme } from '@/theme';

export interface TicketInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
  testID?: string;
}

const TICKET_LENGTH = 6;

type KeyPressEvent = NativeSyntheticEvent<{ key: string }>;

export function TicketInput({
  value = '',
  onChangeText,
  onComplete,
  disabled = false,
  autoFocus = true,
  hasError = false,
  testID = 'ticket-input',
}: TicketInputProps) {
  const { colors } = useTheme();
  // Using any ref element to support React 19 / RN 0.88 TextInput instances seamlessly
  const inputRefs = useRef<any[]>([]);
  const hiddenInputRef = useRef<any>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

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

  const handleChange = (text: string, index: number) => {
    const rawClean = text.replace(/\D/g, '');

    // Case 1: User pastes multiple digits (e.g. "123 456" or "012345")
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
        inputRefs.current[TICKET_LENGTH - 1]?.focus();
        onComplete?.(newDigits);
      } else {
        const nextIndex = Math.min(newDigits.length, TICKET_LENGTH - 1);
        inputRefs.current[nextIndex]?.focus();
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
      inputRefs.current[index + 1]?.focus();
    }

    if (/^\d{6}$/.test(result)) {
      onComplete?.(result);
    }
  };

  const handleKeyPress = (e: KeyPressEvent, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current box is empty, move back and clear previous box
        const chars = [...digits];
        chars[index - 1] = '';
        const result = chars.map((c) => (c ? c : ' ')).join('').replace(/\s+$/, '');
        onChangeText(result);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Dynamic type font scaling: cap fontScale to 1.5 to prevent layout breaking
  const fontScale = PixelRatio.getFontScale ? PixelRatio.getFontScale() : 1;
  const boxHeight = Math.max(56, Math.round(56 * Math.min(fontScale, 1.5)));

  return (
    <Animated.View
      testID={testID}
      className="flex-row justify-between items-center w-full max-w-[360px] self-center px-1"
      style={{
        transform: [{ translateX: shakeAnim }],
      }}
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
        maxLength={TICKET_LENGTH}
        editable={!disabled}
        maxFontSizeMultiplier={1.4}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
        }}
      />

      {/* 6 Visual paper-style ticket boxes (height >= 56, tabular numbers) */}
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
        } else if (isFilled) {
          borderColor = colors.border;
          borderWidth = 1.5;
        }

        return (
          <View
            key={index}
            className="w-12 rounded-xl items-center justify-center border shadow-xs"
            style={{
              borderColor,
              borderWidth,
              backgroundColor: isFilled ? colors.surface : colors.surfaceSubtle,
              height: boxHeight,
              minHeight: 56,
            }}
          >
            <TextInput
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              testID={`${testID}-digit-${index}`}
              className="w-full h-full text-center text-2xl font-bold"
              style={{
                color: colors.textMain,
                fontVariant: ['tabular-nums'],
              }}
              keyboardType="number-pad"
              maxLength={6}
              value={digits[index]}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              editable={!disabled}
              autoFocus={autoFocus && index === 0}
              selectTextOnFocus
              maxFontSizeMultiplier={1.4}
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
