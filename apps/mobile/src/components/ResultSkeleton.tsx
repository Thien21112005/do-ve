import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { radii } from '@/theme/tokens';
import { Perforation } from './ui';
import { Skeleton } from './Skeleton';

export interface ResultSkeletonProps {
  testID?: string;
}

export function ResultSkeleton({
  testID = 'result-skeleton',
}: ResultSkeletonProps) {
  const { colors } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.stub,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Skeleton
        testID={`${testID}-header`}
        width="55%"
        height={16}
        borderRadius={5}
      />

      <Perforation />

      <Skeleton
        testID={`${testID}-subtitle`}
        width="75%"
        height={28}
        borderRadius={6}
        style={styles.ticketBar}
      />

      <Skeleton
        testID={`${testID}-total`}
        width="50%"
        height={22}
        borderRadius={6}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stub: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  ticketBar: {
    marginBottom: 12,
  },
});
