import React, { useEffect, useState } from 'react';
import {
  View,
  AccessibilityInfo,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
  testID?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  testID = 'skeleton-box',
}: SkeletonProps) {
  const { colors } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0.6;
      return;
    }
    opacity.value = withRepeat(
      withTiming(0.85, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      testID={testID}
      style={[
        animatedStyle,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceSubtle,
        },
        style,
      ]}
    />
  );
}

export interface HomeDrawsSkeletonProps {
  testID?: string;
  count?: number;
}

export function HomeDrawsSkeleton({
  testID = 'home-draws-skeleton',
  count = 3,
}: HomeDrawsSkeletonProps) {
  const { colors } = useTheme();

  return (
    <View testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          testID={`${testID}-card-${index}`}
          className="p-4 rounded-2xl border mb-3 shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {/* Card Header: Station name + Status badge */}
          <View className="flex-row items-center justify-between pb-2.5">
            <View>
              <Skeleton width={130} height={18} borderRadius={6} />
              <View className="mt-1.5">
                <Skeleton width={90} height={12} borderRadius={4} />
              </View>
            </View>
            <Skeleton width={80} height={22} borderRadius={11} />
          </View>

          {/* Special Prize Banner */}
          <View
            className="py-3 px-3.5 rounded-xl flex-row items-center justify-between mt-2"
            style={{ backgroundColor: colors.surfaceSubtle }}
          >
            <Skeleton width={70} height={14} borderRadius={4} />
            <Skeleton width={110} height={26} borderRadius={6} />
          </View>

          {/* Secondary prizes (First & Eighth) + View all cue */}
          <View
            className="flex-row items-center justify-between mt-3 pt-2.5 border-t"
            style={{ borderColor: colors.border }}
          >
            <View className="flex-row items-center">
              <Skeleton width={60} height={12} borderRadius={4} />
              <View className="mx-2" />
              <Skeleton width={50} height={12} borderRadius={4} />
            </View>
            <Skeleton width={80} height={14} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

