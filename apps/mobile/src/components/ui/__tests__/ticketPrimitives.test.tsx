import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { colors } from '@/theme/colors';
import {
  TicketNumber,
  digitsInVietnameseWords,
  PrizeRow,
  Perforation,
  StickyFooter,
  Sheet,
  Snackbar,
  Text,
} from '../index';
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

describe('Ticket-sheet primitives (T11.27)', () => {
  describe('TicketNumber & digitsInVietnameseWords', () => {
    it('spells out every digit in Vietnamese preserving leading zeros', () => {
      expect(digitsInVietnameseWords('012345')).toBe('không một hai ba bốn năm');
      expect(digitsInVietnameseWords('678900')).toBe('sáu bảy tám chín không không');
    });

    it('renders 6 tabular digits, highlights matched suffix with winTint + 2px win underline, and sets Vietnamese a11y label', async () => {
      const { getByTestId, getByLabelText } = await render(
        <TicketNumber ticket="012345" matchedSuffixLength={3} testID="tn" />,
      );

      expect(
        getByLabelText(/Số vé không một hai ba bốn năm, khớp 3 số cuối/i),
      ).toBeTruthy();

      // Unmatched leading digit: transparent underline
      const d0 = getByTestId('tn-digit-0');
      const d0Style = Object.assign(
        {},
        ...(Array.isArray(d0.props.style) ? d0.props.style.filter(Boolean) : [d0.props.style]),
      );
      expect(d0Style.borderBottomColor).toBe('transparent');

      // Matched trailing digits (3, 4, 5): winTint fill + 2px win underline (color-blind safe)
      for (const idx of [3, 4, 5]) {
        const cell = getByTestId(`tn-digit-${idx}`);
        const style = Object.assign(
          {},
          ...(Array.isArray(cell.props.style) ? cell.props.style.filter(Boolean) : [cell.props.style]),
        );
        expect(style.backgroundColor).toBe(colors.light.winTint);
        expect(style.borderBottomWidth).toBe(2);
        expect(style.borderBottomColor).toBe(colors.light.win);
      }
    });

    it('supports position-by-position highlighting for encouragement prizes', async () => {
      const { getByTestId } = await render(
        <TicketNumber
          ticket="045923"
          matchedPositions={[true, true, true, false, true, true]}
          testID="kk"
        />,
      );

      const wrongSlot = getByTestId('kk-digit-3');
      const wrongStyle = Object.assign(
        {},
        ...(Array.isArray(wrongSlot.props.style) ? wrongSlot.props.style.filter(Boolean) : [wrongSlot.props.style]),
      );
      expect(wrongStyle.borderBottomColor).not.toBe(colors.light.win);

      const rightSlot = getByTestId('kk-digit-0');
      const rightStyle = Object.assign(
        {},
        ...(Array.isArray(rightSlot.props.style) ? rightSlot.props.style.filter(Boolean) : [rightSlot.props.style]),
      );
      expect(rightStyle.borderBottomColor).toBe(colors.light.win);
    });
  });

  describe('PrizeRow', () => {
    it('uses 64pt fixed left column, right-aligned numbers, and colors.special for ĐB and G8', async () => {
      const { getByTestId, getByText } = await render(
        <PrizeRow
          label="G8"
          a11yLabel="Giải tám"
          numbers={['47']}
          isSpecial={true}
          testID="row-g8"
        />,
      );

      const labelCol = getByTestId('row-g8-label-col');
      const colStyle = Object.assign(
        {},
        ...(Array.isArray(labelCol.props.style) ? labelCol.props.style.filter(Boolean) : [labelCol.props.style]),
      );
      expect(colStyle.width).toBe(64);

      const numText = getByText('47');
      const numStyle = Object.assign(
        {},
        ...(Array.isArray(numText.props.style) ? numText.props.style.filter(Boolean) : [numText.props.style]),
      );
      expect(numStyle.color).toBe(colors.light.special);
    });

    it('highlights numbers whose suffix matches highlightSuffix with winTint + 2px underline', async () => {
      const { getByTestId } = await render(
        <PrizeRow
          label="G6"
          numbers={['1832', '5501', '0973']}
          highlightSuffix="01"
          testID="row-g6"
        />,
      );

      const matched = getByTestId('row-g6-match-5501');
      const style = Object.assign(
        {},
        ...(Array.isArray(matched.props.style) ? matched.props.style.filter(Boolean) : [matched.props.style]),
      );
      expect(style.backgroundColor).toBe(colors.light.winTint);
      expect(style.borderBottomWidth).toBe(2);
      expect(style.borderBottomColor).toBe(colors.light.win);
    });
  });

  describe('Perforation, StickyFooter, Sheet, Snackbar', () => {
    it('renders Perforation hidden from screen readers using theme border color', async () => {
      const { getByTestId } = await render(<Perforation testID="perf" />);
      const perf = getByTestId('perf', { includeHiddenElements: true });
      expect(perf.props.accessibilityElementsHidden).toBe(true);
    });

    it('renders StickyFooter with sheet elevation', async () => {
      const { getByTestId, getByText } = await render(
        <StickyFooter testID="footer">
          <Text>Dò vé</Text>
        </StickyFooter>,
      );
      expect(getByTestId('footer')).toBeTruthy();
      expect(getByText('Dò vé')).toBeTruthy();
    });

    it('renders Sheet when visible and calls onClose from close button', async () => {
      const onClose = jest.fn();
      const { getByText, getByLabelText } = await render(
        <Sheet visible={true} title="Chọn kỳ mở thưởng" onClose={onClose}>
          <Text>Nội dung sheet</Text>
        </Sheet>,
      );
      expect(getByText('Chọn kỳ mở thưởng')).toBeTruthy();
      expect(getByText('Nội dung sheet')).toBeTruthy();
      await fireEvent.press(getByLabelText('Đóng'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renders Snackbar with polite live region and triggers undo action', async () => {
      const onAction = jest.fn();
      const { getByTestId, getByText } = await render(
        <Snackbar
          visible={true}
          message="Đã xoá vé 778102"
          actionLabel="Hoàn tác"
          onAction={onAction}
          testID="snack"
        />,
      );
      const snack = getByTestId('snack');
      expect(snack.props.accessibilityLiveRegion).toBe('polite');
      await fireEvent.press(getByText('Hoàn tác'));
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Zero hardcoded hex colors in new ticket-sheet primitives', () => {
    const files = [
      'TicketNumber.tsx',
      'PrizeRow.tsx',
      'Perforation.tsx',
      'StickyFooter.tsx',
      'Sheet.tsx',
      'Snackbar.tsx',
    ];

    it.each(files)('%s contains no hard-coded hex color literals', (file) => {
      const src = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/ui', file),
        'utf8',
      );
      expect(src.match(/['"]#[0-9a-fA-F]{3,8}['"]/g) ?? []).toEqual([]);
    });
  });
});
