import React, { useEffect, useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  AccessibilityInfo,
  type StyleProp,
  type ViewStyle,
  type LayoutChangeEvent,
} from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { radii } from '@/theme/tokens';
import { haptics } from '@/lib/haptics';

export interface SegmentOption<T extends string = string> {
  key: T;
  label: string;
  testID?: string;
}

export interface SegmentedProps<T extends string = string> {
  options: SegmentOption<T>[];
  selectedKey: T;
  onChange: (key: T) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Segmented<T extends string = string>({
  options,
  selectedKey,
  onChange,
  style,
  testID,
}: SegmentedProps<T>) {
  const { colors } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [slideAnim] = useState(() => new Animated.Value(0));

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

  const selectedIndex = Math.max(
    0,
    options.findIndex((opt) => opt.key === selectedKey),
  );

  const segmentWidth =
    containerWidth > 0 && options.length > 0
      ? (containerWidth - 6) / options.length
      : 0;

  useEffect(() => {
    if (segmentWidth > 0) {
      if (reduceMotion) {
        slideAnim.setValue(selectedIndex * segmentWidth);
      } else {
        Animated.timing(slideAnim, {
          toValue: selectedIndex * segmentWidth,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [selectedIndex, segmentWidth, reduceMotion, slideAnim]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      testID={testID}
      accessible={true}
      accessibilityRole="tablist"
      onLayout={handleLayout}
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceSunken,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {/* Sliding background indicator (200ms animation) */}
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            styles.slidingIndicator,
            {
              width: segmentWidth,
              left: slideAnim,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        />
      )}

      {options.map((opt) => {
        const isSelected = opt.key === selectedKey;
        const optTestID =
          opt.testID || (testID ? `${testID}-${opt.key}-btn` : undefined);

        return (
          <Pressable
            key={opt.key}
            testID={optTestID}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={opt.label}
            onPress={() => {
              if (!isSelected) {
                try {
                  haptics.selection?.();
                } catch {
                  // Fallback
                }
                onChange(opt.key);
              }
            }}
            style={[
              styles.segment,
              {
                // Fallback for initial render before layout or in test environments
                backgroundColor:
                  segmentWidth === 0 && isSelected
                    ? colors.surface
                    : 'transparent',
                borderColor:
                  segmentWidth === 0 && isSelected
                    ? colors.border
                    : 'transparent',
                borderWidth: segmentWidth === 0 && isSelected ? 1 : 0,
              },
            ]}
          >
            <Text
              variant="caption"
              style={[
                styles.label,
                {
                  color: isSelected ? colors.primary : colors.textMuted,
                  fontFamily: isSelected
                    ? 'BeVietnamPro-SemiBold'
                    : 'BeVietnamPro-Regular',
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radii.md,
    borderWidth: 1,
    position: 'relative',
  },
  slidingIndicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    zIndex: 1,
  },
  label: {
    textAlign: 'center',
  },
});
