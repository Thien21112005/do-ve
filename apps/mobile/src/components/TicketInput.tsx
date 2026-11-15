import React, { useRef } from 'react';
import { View, TextInput, type NativeSyntheticEvent } from 'react-native';
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

  // Preserve digit positions: if a slot is a space or missing, keep it as empty string
  const digits = Array.from(
    { length: TICKET_LENGTH },
    (_, i) => (value[i] && /\d/.test(value[i]) ? value[i] : ''),
  );
  const cleanDigits = digits.join('');

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
        let result = chars.map((c) => (c ? c : ' ')).join('').replace(/\s+$/, '');
        onChangeText(result);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View
      testID={testID}
      className="flex-row justify-between items-center w-full max-w-[360px] self-center px-1"
      accessibilityRole="none"
      accessibilityLabel={`Số vé: ${cleanDigits || 'chưa nhập'}`}
    >
      {Array.from({ length: TICKET_LENGTH }).map((_, index) => {
        const isFilled = Boolean(digits[index]);
        const isFocused =
          !disabled &&
          (cleanDigits.length === index ||
            (index === 5 && cleanDigits.length === 6));

        let borderColor = colors.border;
        if (hasError) {
          borderColor = colors.error;
        } else if (isFocused) {
          borderColor = colors.primary;
        } else if (isFilled) {
          borderColor = colors.primaryHover;
        }

        return (
          <View
            key={index}
            className="w-12 h-14 rounded-lg items-center justify-center border-2 bg-white dark:bg-slate-800"
            style={{ borderColor }}
          >
            <TextInput
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              testID={`${testID}-digit-${index}`}
              className="w-full h-full text-center text-2xl font-bold text-slate-900 dark:text-white"
              keyboardType="number-pad"
              maxLength={6}
              value={digits[index]}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              editable={!disabled}
              autoFocus={autoFocus && index === 0}
              selectTextOnFocus
              accessibilityLabel={`Chữ số thứ ${index + 1}`}
              accessibilityHint="Nhập chữ số từ 0 đến 9"
              accessibilityState={{ disabled }}
            />
          </View>
        );
      })}
    </View>
  );
}
