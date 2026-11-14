import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/theme';
import { useSchedule } from '@/hooks';

export interface StationChipsProps {
  selectedDate: string;
  selectedStation: string;
  onSelectStation: (code: string) => void;
  autoSelectFirst?: boolean;
  testID?: string;
}

export function StationChips({
  selectedDate,
  selectedStation,
  onSelectStation,
  autoSelectFirst = true,
  testID = 'station-chips',
}: StationChipsProps) {
  const { colors } = useTheme();
  const { stations, isLoading, isError } = useSchedule(selectedDate);

  // Auto-select first station if current selection is invalid for new date
  useEffect(() => {
    if (autoSelectFirst && stations.length > 0) {
      const exists = stations.some((s) => s.code === selectedStation);
      if (!exists) {
        onSelectStation(stations[0].code);
      }
    }
  }, [stations, selectedStation, autoSelectFirst, onSelectStation]);

  if (isLoading) {
    return (
      <View
        testID={`${testID}-loading`}
        className="my-2 py-3 items-center justify-center"
      >
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (isError || stations.length === 0) {
    return (
      <View
        testID={`${testID}-empty`}
        className="my-2 px-4 py-2 items-center justify-center"
      >
        <Text className="text-xs text-slate-400">
          Không có đài mở thưởng trong ngày này
        </Text>
      </View>
    );
  }

  return (
    <View testID={testID} className="my-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
      >
        {stations.map((station) => {
          const isSelected = station.code === selectedStation;

          return (
            <TouchableOpacity
              key={station.code}
              testID={`${testID}-${station.code}`}
              onPress={() => onSelectStation(station.code)}
              accessibilityRole="button"
              accessibilityLabel={`Đài ${station.name}`}
              accessibilityState={{ selected: isSelected }}
              className="items-center justify-center py-2 px-4 rounded-xl border"
              style={{
                backgroundColor: isSelected
                  ? colors.primary
                  : colors.surfaceSubtle,
                borderColor: isSelected ? colors.primary : colors.border,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{
                  color: isSelected ? '#ffffff' : colors.textMain,
                }}
              >
                {station.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
