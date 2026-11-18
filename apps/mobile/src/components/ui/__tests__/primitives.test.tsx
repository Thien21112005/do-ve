import React from 'react';
import { View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import {
  Button,
  IconButton,
  Chip,
  Card,
  ListRow,
  SectionHeader,
  Banner,
  EmptyState,
  Badge,
  Divider,
  Segmented,
} from '../index';

describe('UI Primitives (T10.09)', () => {
  describe('<Button />', () => {
    it('renders with button accessibility role and triggers onPress', async () => {
      const onPress = jest.fn();
      const { getByRole, getByText } = await render(
        <Button title="Dò vé ngay" onPress={onPress} />,
      );

      const btn = getByRole('button');
      expect(btn).toBeTruthy();
      expect(getByText('Dò vé ngay')).toBeTruthy();

      fireEvent.press(btn);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('disables interaction and shows loading indicator when loading', async () => {
      const onPress = jest.fn();
      const { getByRole, queryByText } = await render(
        <Button title="Dò vé ngay" loading={true} onPress={onPress} />,
      );

      const btn = getByRole('button');
      expect(btn.props.accessibilityState.busy).toBe(true);
      expect(queryByText('Dò vé ngay')).toBeNull();

      fireEvent.press(btn);
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('<IconButton />', () => {
    it('renders with accessibility label and min 44x44 touch target', async () => {
      const onPress = jest.fn();
      const { getByLabelText } = await render(
        <IconButton
          icon={<View testID="icon-view" />}
          accessibilityLabel="Đóng modal"
          onPress={onPress}
        />,
      );

      const btn = getByLabelText('Đóng modal');
      expect(btn).toBeTruthy();
      expect(btn.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            minWidth: 44,
            minHeight: 44,
          }),
        ]),
      );

      fireEvent.press(btn);
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('<Chip />', () => {
    it('renders selected and unselected states with appropriate a11y', async () => {
      const onPress = jest.fn();
      const { getByRole, getByText } = await render(
        <Chip label="TP.HCM" selected={true} count={3} onPress={onPress} />,
      );

      const chip = getByRole('button');
      expect(chip.props.accessibilityState.selected).toBe(true);
      expect(getByText('TP.HCM')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();

      fireEvent.press(chip);
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('<Card />', () => {
    it('renders children with disciplined border and flat surface', async () => {
      const { getByText } = await render(
        <Card>
          <View>
            <Badge label="Giải 8" />
          </View>
        </Card>,
      );
      expect(getByText('Giải 8')).toBeTruthy();
    });

    it('supports pressable card interaction', async () => {
      const onPress = jest.fn();
      const { getByRole } = await render(
        <Card onPress={onPress}>
          <View />
        </Card>,
      );

      const cardBtn = getByRole('button');
      fireEvent.press(cardBtn);
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('<ListRow />', () => {
    it('renders title, subtitle, and triggers onPress', async () => {
      const onPress = jest.fn();
      const { getByRole, getByText } = await render(
        <ListRow
          title="Lịch quay thưởng"
          subtitle="21 đài miền Nam"
          showChevron={true}
          onPress={onPress}
        />,
      );

      expect(getByText('Lịch quay thưởng')).toBeTruthy();
      expect(getByText('21 đài miền Nam')).toBeTruthy();

      const row = getByRole('button');
      fireEvent.press(row);
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('<SectionHeader />', () => {
    it('renders uppercase title and optional action', async () => {
      const onAction = jest.fn();
      const { getByText, getByRole } = await render(
        <SectionHeader
          title="Kết quả mới nhất"
          actionText="Xem tất cả"
          onAction={onAction}
        />,
      );

      expect(getByText('KẾT QUẢ MỚI NHẤT')).toBeTruthy();
      const actionBtn = getByRole('button');
      await fireEvent.press(actionBtn);
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('<Banner />', () => {
    it('renders message with alert role and action button', async () => {
      const onAction = jest.fn();
      const { getByRole, getByText } = await render(
        <Banner
          message="Không có kết nối mạng"
          variant="warning"
          actionText="Thử lại"
          onAction={onAction}
        />,
      );

      expect(getByRole('alert')).toBeTruthy();
      expect(getByText('Không có kết nối mạng')).toBeTruthy();

      const actionBtn = getByRole('button');
      await fireEvent.press(actionBtn);
      expect(onAction).toHaveBeenCalledTimes(1);

      let parent = actionBtn.parent;
      while (parent) {
        expect(parent.props?.accessible).not.toBe(true);
        parent = parent.parent;
      }
    });

    it('uses 1px hairline border instead of thick colored left accent (T11.48)', async () => {
      const { getByTestId } = await render(
        <Banner
          testID="error-banner"
          message="Lỗi tải dữ liệu"
          variant="error"
          actionText="Thử lại"
          actionTestID="error-banner-action"
          onAction={jest.fn()}
        />,
      );

      const banner = getByTestId('error-banner');
      const styles = [banner.props.style].flat();
      expect(styles).toEqual(
        expect.arrayContaining([expect.objectContaining({ borderWidth: 1 })]),
      );
      for (const s of styles) {
        if (s && typeof s === 'object' && 'borderLeftWidth' in s) {
          expect((s as { borderLeftWidth?: number }).borderLeftWidth).toBeLessThanOrEqual(1);
        }
      }
      expect(getByTestId('error-banner-action')).toBeTruthy();
    });
  });

  describe('<EmptyState />', () => {
    it('renders title, description and action CTA', async () => {
      const onAction = jest.fn();
      const { getByText, getByRole } = await render(
        <EmptyState
          title="Chưa có vé nào"
          description="Lưu vé để theo dõi kết quả tự động"
          actionTitle="Dò vé ngay"
          onAction={onAction}
        />,
      );

      expect(getByText('Chưa có vé nào')).toBeTruthy();
      expect(getByText('Lưu vé để theo dõi kết quả tự động')).toBeTruthy();

      const btn = getByRole('button');
      fireEvent.press(btn);
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('<Badge />', () => {
    it('renders semantic labels', async () => {
      const { getByText } = await render(
        <View>
          <Badge label="TRÚNG THƯỞNG" variant="win" />
          <Badge label="CHỜ MỞ THƯỞNG" variant="pending" />
        </View>,
      );

      expect(getByText('TRÚNG THƯỞNG')).toBeTruthy();
      expect(getByText('CHỜ MỞ THƯỞNG')).toBeTruthy();
    });
  });

  describe('<Divider />', () => {
    it('renders horizontal and vertical dividers', async () => {
      const { getAllByTestId } = await render(
        <View>
          <Divider />
          <Divider vertical={true} />
        </View>,
      );
      expect(getAllByTestId('divider')).toHaveLength(2);
    });
  });

  describe('<Segmented />', () => {
    it('renders segments with tablist and tab roles and triggers selection', async () => {
      const onChange = jest.fn();
      const { getByRole, getAllByRole, getByText } = await render(
        <Segmented
          options={[
            { key: 'single', label: 'Một vé' },
            { key: 'batch', label: 'Nhiều vé' },
          ]}
          selectedKey="single"
          onChange={onChange}
        />,
      );

      expect(getByRole('tablist')).toBeTruthy();
      const tabs = getAllByRole('tab');
      expect(tabs).toHaveLength(2);
      expect(tabs[0].props.accessibilityState.selected).toBe(true);
      expect(tabs[1].props.accessibilityState.selected).toBe(false);

      fireEvent.press(getByText('Nhiều vé'));
      expect(onChange).toHaveBeenCalledWith('batch');
    });
  });
});
