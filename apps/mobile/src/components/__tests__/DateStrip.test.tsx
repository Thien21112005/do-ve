import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
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

    it('consistently produces Vietnam dates even during early morning UTC window (T09.17)', () => {
      // 2026-11-14 20:30:00 UTC is 2026-11-15 03:30:00 in Vietnam
      const morningDate = new Date('2026-11-14T20:30:00Z');
      const days = getPastDays(7, morningDate);

      expect(days[0].dateString).toBe('2026-11-15');
      expect(days[0].dayOfWeekShort).toBe('CN'); // Nov 15, 2026 is Sunday
      expect(days[1].dateString).toBe('2026-11-14');
      expect(days[1].dayOfWeekShort).toBe('T7'); // Nov 14, 2026 is Saturday
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

    it('opens date picker modal with up to 60 days when calendar button is pressed (T10.25)', async () => {
      const onSelectDate = jest.fn();
      const { getByTestId, queryByTestId, findByTestId } = await render(
        <DateStrip selectedDate="2026-11-14" onSelectDate={onSelectDate} />,
      );

      // Calendar button should be present
      const calendarBtn = getByTestId('date-strip-calendar-btn');
      expect(calendarBtn).toBeTruthy();

      // Modal should initially be closed
      expect(queryByTestId('date-picker-modal')).toBeNull();

      // Open modal
      fireEvent.press(calendarBtn);
      const modal = await findByTestId('date-picker-modal');
      expect(modal).toBeTruthy();

      // Modal has a close button
      const closeBtn = getByTestId('date-picker-close-btn');
      expect(closeBtn).toBeTruthy();
    });

    it('selects date from modal picker within 60 days (T10.25)', async () => {
      const onSelectDate = jest.fn();
      const past60Days = getPastDays(60);
      const olderDate = past60Days[30].dateString; // 30 days ago

      const { getByTestId, findByTestId, queryByTestId } = await render(
        <DateStrip selectedDate="2026-11-14" onSelectDate={onSelectDate} />,
      );

      // Open calendar modal
      fireEvent.press(getByTestId('date-strip-calendar-btn'));
      await findByTestId('date-picker-modal');

      // Pick the older date
      const olderItem = getByTestId(`date-picker-item-${olderDate}`);
      fireEvent.press(olderItem);

      expect(onSelectDate).toHaveBeenCalledWith(olderDate);
      await waitFor(() => {
        expect(queryByTestId('date-picker-modal')).toBeNull();
      });
    });
  });
});
