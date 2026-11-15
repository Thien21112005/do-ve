import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme';

export interface ScreenProps extends ViewProps {
  safe?: boolean;
  edges?: Edge[];
  children?: React.ReactNode;
}

/**
 * Universal Screen container for DoVe mobile app.
 * Automatically aligns background with theme semantic tokens (T10.09).
 */
export function Screen({
  safe = true,
  edges = ['top', 'left', 'right'],
  style,
  children,
  ...props
}: ScreenProps) {
  const { colors, isDark } = useTheme();

  const containerStyle = [
    styles.container,
    { backgroundColor: colors.background },
    style,
  ];

  const content = (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </>
  );

  if (safe) {
    return (
      <SafeAreaView edges={edges} style={containerStyle} {...props}>
        {content}
      </SafeAreaView>
    );
  }

  return (
    <View style={containerStyle} {...props}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
