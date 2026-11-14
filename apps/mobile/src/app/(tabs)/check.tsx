import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DateStrip,
  StationChips,
  TicketInput,
  getPastDays,
} from '@/components';
import { useTheme } from '@/theme';

export interface CheckScreenProps {
  onCheck?: (params: {
    ticket: string;
    station: string;
    drawDate: string;
  }) => void;
}

export default function CheckScreen({ onCheck }: CheckScreenProps = {}) {
  const { colors } = useTheme();

  // Initial state: today's date
  const defaultDate = getPastDays(1)[0].dateString;
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedStation, setSelectedStation] = useState<string>('TPHCM');
  const [ticketNumber, setTicketNumber] = useState<string>('');

  const isFormValid =
    ticketNumber.length === 6 &&
    Boolean(selectedStation) &&
    Boolean(selectedDate);

  const handleSubmit = () => {
    if (!isFormValid) return;
    onCheck?.({
      ticket: ticketNumber,
      station: selectedStation,
      drawDate: selectedDate,
    });
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
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          className="flex-1"
        >
          {/* Section: Chọn ngày mở thưởng */}
          <View className="pt-3 px-4 pb-1">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              1. Chọn ngày mở thưởng
            </Text>
          </View>
          <DateStrip
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {/* Section: Chọn đài */}
          <View className="pt-2 px-4 pb-1">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              2. Chọn đài quay
            </Text>
          </View>
          <StationChips
            selectedDate={selectedDate}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
          />

          {/* Section: Nhập số vé */}
          <View className="pt-4 px-4 pb-2 items-center">
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 self-start">
              3. Nhập 6 chữ số trên vé
            </Text>
            <TicketInput
              value={ticketNumber}
              onChangeText={setTicketNumber}
              onComplete={(code) => setTicketNumber(code)}
            />
          </View>

          {/* Action button: Dò vé */}
          <View className="mt-8 px-5 w-full max-w-[360px] self-center">
            <TouchableOpacity
              testID="check-ticket-button"
              disabled={!isFormValid}
              onPress={handleSubmit}
              accessibilityRole="button"
              accessibilityLabel="Dò kết quả vé số"
              accessibilityState={{ disabled: !isFormValid }}
              className="py-3.5 px-6 rounded-xl items-center justify-center shadow-sm"
              style={{
                backgroundColor: isFormValid
                  ? colors.primary
                  : colors.surfaceSubtle,
                opacity: isFormValid ? 1 : 0.6,
              }}
            >
              <Text
                className="text-base font-bold"
                style={{
                  color: isFormValid ? '#ffffff' : colors.textMuted,
                }}
              >
                Dò vé ngay
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
