/* eslint-disable react-hooks/immutability */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useSettings } from '@/store';
import { haptics } from '@/lib';
import { useTheme } from '@/theme';
import { motion } from '@/theme/tokens';
import { Icon } from './Icon';

export interface CelebrationEffectProps {
  active: boolean;
  onComplete?: () => void;
  testID?: string;
}

export function CelebrationEffect({
  active,
  onComplete,
  testID = 'celebration-effect',
}: CelebrationEffectProps) {
  const [settings] = useSettings();
  const { colors } = useTheme();
  const hasTriggeredRef = useRef(false);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (active && settings.celebrationEnabled) {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        if (settings.hapticsEnabled) {
          haptics.success();
        }

        const [x1, y1, x2, y2] = motion.easing.outQuart;
        const easingOutQuart = Easing.bezier(x1, y1, x2, y2);

        opacity.value = withSequence(
          withTiming(1, { duration: motion.duration.normal, easing: easingOutQuart }),
          withDelay(
            1200,
            withTiming(0, { duration: motion.duration.slow, easing: Easing.in(Easing.ease) }),
          ),
        );

        scale.value = withSequence(
          withTiming(1.1, { duration: motion.duration.slow, easing: easingOutQuart }),
          withTiming(1, { duration: motion.duration.normal }),
        );

        const timer = setTimeout(() => {
          onComplete?.();
        }, 1800);
        if (typeof (timer as any)?.unref === 'function') {
          (timer as any).unref();
        }

        return () => clearTimeout(timer);
      }
    } else if (!active) {
      hasTriggeredRef.current = false;
      opacity.value = 0;
    }
  }, [
    active,
    settings.celebrationEnabled,
    settings.hapticsEnabled,
    opacity,
    scale,
    onComplete,
  ]);

  if (!active || !settings.celebrationEnabled) {
    return null;
  }

  return (
    <Animated.View
      testID={testID}
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        animatedStyle,
        {
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99,
        },
      ]}
    >
      <View
        className="px-6 py-4 rounded-2xl flex-row items-center shadow-lg border"
        style={{
          backgroundColor: colors.winBg,
          borderColor: colors.winBorder,
        }}
      >
        <Icon name="trophy" size={28} color={colors.win} />
        <View className="ml-3">
          <Animated.Text
            className="text-base font-bold"
            style={{ color: colors.win }}
          >
            TRÚNG THƯỞNG! 🎉
          </Animated.Text>
          <Animated.Text
            className="text-xs"
            style={{ color: colors.textMuted }}
          >
            Chúc mừng bạn đã may mắn
          </Animated.Text>
        </View>
      </View>
    </Animated.View>
  );
}
