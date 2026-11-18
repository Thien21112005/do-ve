import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Chip, Text, Button } from './ui';
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
      <View testID={`${testID}-loading`} style={styles.centerBox}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View testID={`${testID}-error`} style={styles.errorRow}>
        <Text variant="caption" color={colors.error} style={styles.errorText}>
          Không thể tải danh sách đài
        </Text>
        <Button
          testID={`${testID}-retry-btn`}
          variant="secondary"
          title="Thử lại"
          onPress={() => refetch()}
        />
      </View>
    );
  }

  if (stations.length === 0) {
    return (
      <View testID={`${testID}-empty`} style={styles.centerBox}>
        <Text variant="caption" color={colors.textMuted}>
          Không có đài mở thưởng trong ngày này
        </Text>
      </View>
    );
  }

  return (
    <View testID={testID} style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stations.map((station) => {
          const isSelected = station.code === selectedStation;
          return (
            <Chip
              key={station.code ?? station.name ?? 'station'}
              testID={`${testID}-${station.code ?? 'unknown'}`}
              label={station.name ?? station.code ?? ''}
              selected={isSelected}
              accessibilityLabel={`Đài ${station.name ?? station.code ?? ''}`}
              onPress={() => station.code && onSelectStation(station.code)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  centerBox: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  errorText: {
    flexShrink: 1,
  },
});
