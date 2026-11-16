import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme';

export interface ScreenProps extends ViewProps {
  safe?: boolean;
  edges?: Edge[];
  children?: React.ReactNode;
  contentMaxWidth?: number;
}

export interface ResponsiveContainerProps extends ViewProps {
  maxWidth?: number;
  children?: React.ReactNode;
}

/**
 * ResponsiveContainer for large screens / foldable / tablet (T10.61).
 * Constrains content width to maxWidth (default 560pt) and centers it.
 */
export function ResponsiveContainer({
  maxWidth = 560,
  style,
  children,
  ...props
}: ResponsiveContainerProps) {
  return (
    <View
      style={[
        { width: '100%', maxWidth, alignSelf: 'center' },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

/**
 * Universal Screen container for DoVe mobile app.
 * Automatically aligns background with theme semantic tokens (T10.09).
 */
export function Screen({
  safe = true,
  edges = ['top', 'left', 'right'],
  contentMaxWidth,
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
      {contentMaxWidth ? (
        <ResponsiveContainer maxWidth={contentMaxWidth} style={{ flex: 1 }}>
          {children}
        </ResponsiveContainer>
      ) : (
        children
      )}
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
