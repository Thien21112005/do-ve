import React, { useEffect } from 'react';
import {
  View,
  AccessibilityInfo,
  StyleSheet,
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
import { motion, radii } from '@/theme/tokens';

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
  borderRadius = 6,
  style,
  testID = 'skeleton-box',
}: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    let active = true;
    const applyMotion = (reduce: boolean) => {
      if (!active) return;
      if (reduce) {
        opacity.value = 0.6;
        return;
      }
      opacity.value = withRepeat(
        withTiming(0.85, {
          duration: motion.duration.slow,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    };

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => applyMotion(Boolean(enabled)))
      .catch(() => applyMotion(false));
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => applyMotion(Boolean(enabled)),
    );
    return () => {
      active = false;
      sub?.remove();
    };
  }, [opacity]);

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
    <View
      testID={testID}
      style={[
        styles.frame,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          testID={`${testID}-card-${index}`}
          style={[
            styles.homeRow,
            {
              borderBottomColor: colors.border,
              borderBottomWidth: index === count - 1 ? 0 : 1,
            },
          ]}
        >
          <View style={styles.homeRowLeft}>
            <Skeleton width={120} height={16} borderRadius={5} />
            <Skeleton
              width={72}
              height={12}
              borderRadius={4}
              style={styles.homeSub}
            />
          </View>
          <Skeleton width={96} height={22} borderRadius={6} />
        </View>
      ))}
    </View>
  );
}

export interface DrawTableSkeletonProps {
  testID?: string;
  rowCount?: number;
}

export function DrawTableSkeleton({
  testID = 'draw-table-skeleton',
  rowCount = 9,
}: DrawTableSkeletonProps) {
  const { colors } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.frame,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.sheetHeader,
          {
            backgroundColor: colors.surfaceSubtle,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Skeleton width={150} height={16} borderRadius={5} />
        <Skeleton width={64} height={16} borderRadius={5} />
      </View>

      {Array.from({ length: rowCount }).map((_, rIdx) => {
        const isSpecial = rIdx === rowCount - 1;
        return (
          <View
            key={`skel-row-${rIdx}`}
            testID={`${testID}-row-${rIdx}`}
            style={[
              styles.tableRow,
              {
                borderBottomColor: colors.border,
                borderBottomWidth: isSpecial ? 0 : 1,
                backgroundColor: isSpecial ? colors.surfaceSubtle : colors.surface,
              },
            ]}
          >
            <View
              style={[
                styles.tierCol,
                { borderRightColor: colors.border },
              ]}
            >
              <Skeleton width={28} height={14} borderRadius={4} />
            </View>
            <View style={styles.numbersCol}>
              <Skeleton
                width={isSpecial ? 128 : rIdx === 4 ? 196 : 96}
                height={isSpecial ? 24 : 18}
                borderRadius={5}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  homeRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  homeRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  homeSub: {
    marginTop: 5,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tableRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierCol: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRightWidth: 1,
  },
  numbersCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
