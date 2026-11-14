import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DateStrip, getPastDays } from '../DateStrip';
import { colors } from '@/theme';

describe('DateStrip Component', () => {
  const fixedDate = new Date('2026-11-14T12:00:00Z');

  describe('getPastDays helper', () => {
    it('generates 14 days starting from base date without future dates', () => {
      const days = getPastDays(14, fixedDate);

      expect(days.length).toBe(14);
      expect(days[0].dateString).toBe('2026-11-14');
      expect(days[0].isToday).toBe(true);

      // Verify each subsequent day is 1 day earlier
      expect(days[1].dateString).toBe('2026-11-13');
      expect(days[13].dateString).toBe('2026-11-01');

      // None of the dates should be after baseDate
      days.forEach((item) => {
        expect(item.dateString <= '2026-11-14').toBe(true);
      });
    });
  });

  describe('DateStrip Rendering & Interactions', () => {
    it('renders horizontal scroll chips', async () => {
      const onSelectDate = jest.fn();
      const { getByTestId } = await render(
        <DateStrip selectedDate="2026-11-14" onSelectDate={onSelectDate} />,
      );

      expect(getByTestId('date-strip')).toBeTruthy();
      expect(getByTestId('date-strip-chip-2026-11-14')).toBeTruthy();
    });

    it('triggers onSelectDate when a chip is pressed', async () => {
      const onSelectDate = jest.fn();
      const days = getPastDays(14);
      const targetDate = days[2].dateString;

      const { getByTestId } = await render(
        <DateStrip
          selectedDate={days[0].dateString}
          onSelectDate={onSelectDate}
        />,
      );

      fireEvent.press(getByTestId(`date-strip-chip-${targetDate}`));
      expect(onSelectDate).toHaveBeenCalledWith(targetDate);
    });

    it('applies selected background color to the active chip', async () => {
      const onSelectDate = jest.fn();
      const { getByTestId } = await render(
        <DateStrip selectedDate="2026-11-14" onSelectDate={onSelectDate} />,
      );

      const activeChip = getByTestId('date-strip-chip-2026-11-14');
      expect(activeChip.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: colors.light.primary,
        }),
      );
    });
  });
});
