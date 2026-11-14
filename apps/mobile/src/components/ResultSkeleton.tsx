import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

export interface ResultSkeletonProps {
  testID?: string;
}

export function ResultSkeleton({
  testID = 'result-skeleton',
}: ResultSkeletonProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      testID={testID}
      className="mt-6 mx-5 p-5 rounded-2xl border"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      {/* Header bar placeholder */}
      <Animated.View
        testID={`${testID}-header`}
        style={[
          animatedStyle,
          {
            backgroundColor: colors.surfaceSubtle,
            width: '60%',
            height: 22,
            borderRadius: 6,
            marginBottom: 10,
          },
        ]}
      />

      {/* Subtitle bar placeholder */}
      <Animated.View
        testID={`${testID}-subtitle`}
        style={[
          animatedStyle,
          {
            backgroundColor: colors.surfaceSubtle,
            width: '85%',
            height: 14,
            borderRadius: 4,
            marginBottom: 18,
          },
        ]}
      />

      {/* Divider */}
      <View
        className="w-full h-[1px] mb-4"
        style={{ backgroundColor: colors.border }}
      />

      {/* Row 1 placeholder */}
      <View className="flex-row justify-between items-center mb-3">
        <Animated.View
          style={[
            animatedStyle,
            {
              backgroundColor: colors.surfaceSubtle,
              width: '40%',
              height: 16,
              borderRadius: 4,
            },
          ]}
        />
        <Animated.View
          style={[
            animatedStyle,
            {
              backgroundColor: colors.surfaceSubtle,
              width: '35%',
              height: 16,
              borderRadius: 4,
            },
          ]}
        />
      </View>

      {/* Row 2 placeholder */}
      <View className="flex-row justify-between items-center mb-5">
        <Animated.View
          style={[
            animatedStyle,
            {
              backgroundColor: colors.surfaceSubtle,
              width: '45%',
              height: 16,
              borderRadius: 4,
            },
          ]}
        />
        <Animated.View
          style={[
            animatedStyle,
            {
              backgroundColor: colors.surfaceSubtle,
              width: '30%',
              height: 16,
              borderRadius: 4,
            },
          ]}
        />
      </View>

      {/* Total amount bar placeholder */}
      <Animated.View
        testID={`${testID}-total`}
        style={[
          animatedStyle,
          {
            backgroundColor: colors.surfaceSubtle,
            width: '50%',
            height: 26,
            borderRadius: 8,
            alignSelf: 'flex-end',
          },
        ]}
      />
    </View>
  );
}
