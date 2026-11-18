import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon } from '@/components/Icon';
import { Sheet, ListRow } from '@/components/ui';
import { useTheme, radii } from '@/theme';
import { STRINGS } from '@/lib/strings';

export interface TicketsMenuProps {
  visible: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onClearAll: () => void;
}

export function TicketsMenu({
  visible,
  onClose,
  onExport,
  onImport,
  onClearAll,
}: TicketsMenuProps) {
  const { colors } = useTheme();

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={STRINGS.tickets.optionsMenuA11y}
      closeLabel={STRINGS.common.close}
      closeTestID="tickets-menu-close-btn"
      testID="tickets-overflow-menu"
    >
      <View
        style={[
          styles.menuGroup,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <ListRow
          testID="export-tickets-btn"
          title={STRINGS.tickets.exportBtn}
          subtitle="Lưu danh sách vé thành file JSON"
          accessibilityLabel={STRINGS.tickets.exportBtn}
          icon={<Icon name="upload" size={18} color={colors.textMain} />}
          onPress={() => {
            onClose();
            onExport();
          }}
        />
        <ListRow
          testID="import-tickets-btn"
          title={STRINGS.tickets.importBtn}
          subtitle="Nạp vé đã lưu từ file dự phòng"
          accessibilityLabel={STRINGS.tickets.importBtn}
          icon={<Icon name="download" size={18} color={colors.textMain} />}
          onPress={() => {
            onClose();
            onImport();
          }}
        />
        <ListRow
          testID="clear-all-tickets-btn"
          title={STRINGS.tickets.clearAll}
          subtitle="Xóa toàn bộ vé đang lưu trên máy"
          accessibilityLabel={STRINGS.tickets.clearAll}
          destructive={true}
          icon={<Icon name="trash" size={18} color={colors.error} />}
          style={{ borderBottomWidth: 0 }}
          onPress={() => {
            onClose();
            onClearAll();
          }}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  menuGroup: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: 8,
  },
});
