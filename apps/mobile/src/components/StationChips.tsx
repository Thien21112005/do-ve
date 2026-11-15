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
  const { stations, isLoading, isError, refetch } = useSchedule(selectedDate);

  // Auto-select first station if current selection is invalid for new date
  useEffect(() => {
    if (autoSelectFirst && stations.length > 0) {
      const exists = stations.some((s) => s.code === selectedStation);
      if (!exists && stations[0]?.code) {
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

  if (isError) {
    return (
      <View
        testID={`${testID}-error`}
        className="my-2 px-4 py-2 flex-row items-center justify-center"
      >
        <Text
          className="text-xs mr-2 font-medium"
          style={{ color: colors.error }}
        >
          Không thể tải danh sách đài
        </Text>
        <TouchableOpacity
          testID={`${testID}-retry-btn`}
          onPress={() => refetch()}
          className="px-2.5 py-1 rounded-lg border"
          style={{ borderColor: colors.error }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: colors.error }}
          >
            Thử lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (stations.length === 0) {
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
              key={station.code ?? station.name ?? 'station'}
              testID={`${testID}-${station.code ?? 'unknown'}`}
              onPress={() => station.code && onSelectStation(station.code)}
              accessibilityRole="button"
              accessibilityLabel={`Đài ${station.name ?? station.code ?? ''}`}
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
