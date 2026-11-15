import React from 'react';
import { View, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { radii } from '@/theme/tokens';
import { haptics } from '@/lib/haptics';

export interface SegmentOption<T extends string = string> {
  key: T;
  label: string;
}

export interface SegmentedProps<T extends string = string> {
  options: SegmentOption<T>[];
  selectedKey: T;
  onChange: (key: T) => void;
  style?: StyleProp<ViewStyle>;
}

export function Segmented<T extends string = string>({
  options,
  selectedKey,
  onChange,
  style,
}: SegmentedProps<T>) {
  const { colors } = useTheme();

  return (
    <View
      accessible={true}
      accessibilityRole="tablist"
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceSunken,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {options.map((opt) => {
        const isSelected = opt.key === selectedKey;
        return (
          <Pressable
            key={opt.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => {
              if (!isSelected) {
                haptics.selection();
                onChange(opt.key);
              }
            }}
            style={[
              styles.segment,
              {
                backgroundColor: isSelected ? colors.surface : 'transparent',
                borderColor: isSelected ? colors.border : 'transparent',
                borderWidth: isSelected ? 1 : 0,
              },
            ]}
          >
            <Text
              variant="caption"
              style={[
                styles.label,
                {
                  color: isSelected ? colors.textMain : colors.textMuted,
                  fontFamily: isSelected ? 'BeVietnamPro-SemiBold' : 'BeVietnamPro-Regular',
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
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  label: {
    textAlign: 'center',
  },
});
