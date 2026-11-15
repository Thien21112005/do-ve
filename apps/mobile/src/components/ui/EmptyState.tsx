import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { useTheme } from '@/theme';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}

      <Text variant="title" align="center" style={{ color: colors.textMain }}>
        {title}
      </Text>

      {description ? (
        <Text
          variant="body"
          align="center"
          style={[styles.description, { color: colors.textMuted }]}
        >
          {description}
        </Text>
      ) : null}

      {actionTitle && onAction ? (
        <Button
          title={actionTitle}
          onPress={onAction}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 16,
    opacity: 0.85,
  },
  description: {
    marginTop: 8,
    maxWidth: 280,
    lineHeight: 22,
  },
  button: {
    marginTop: 20,
    minWidth: 160,
  },
});
