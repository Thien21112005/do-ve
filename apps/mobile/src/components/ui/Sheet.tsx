import React, { useContext, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  AccessibilityInfo,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Text } from './Text';
import { IconButton } from './IconButton';
import { useTheme, layout } from '@/theme';
import { elevations, radii } from '@/theme/tokens';

const ZERO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 };

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  closeLabel?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Bottom modal sheet respecting safe-area insets, tablet max-width, and Reduce Motion (T11.27).
 */
export function Sheet({
  visible,
  onClose,
  title,
  closeLabel = 'Đóng',
  children,
  style,
  testID = 'bottom-sheet',
}: SheetProps) {
  const { colors } = useTheme();
  const insets = useContext(SafeAreaInsetsContext) ?? ZERO_INSETS;
  const [reduceMotion, setReduceMotion] = useState(false);

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

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={reduceMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          accessible={false}
          onPress={onClose}
          style={[styles.backdrop, { backgroundColor: colors.textMain }]}
        />
        <View
          testID={testID}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              paddingBottom: Math.max(insets.bottom, 20),
            },
            elevations.sheet,
            style,
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.border }]} />
          {title ? (
            <View style={styles.header}>
              <Text variant="title" style={styles.headerTitle}>
                {title}
              </Text>
              <IconButton
                accessibilityLabel={closeLabel}
                onPress={onClose}
                icon={<X size={20} color={colors.textMuted} strokeWidth={2} />}
              />
            </View>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.45,
  },
  sheet: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '85%',
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: radii.full,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    flex: 1,
  },
});
