import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CalendarPickerSheet, buildMonthWeeks } from '../CalendarPickerSheet';

describe('CalendarPickerSheet (T12.08)', () => {
  it('places 01/11/2026 (Sunday) in the 7th column (CN) of week 0 and 16/11/2026 in Monday column 0', () => {
    const weeks = buildMonthWeeks(2026, 11);
    // Week 0: T2..T7 are null, CN (index 6) is 2026-11-01
    expect(weeks[0].slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(weeks[0][6]?.dateString).toBe('2026-11-01');
    // Week 3: Monday (index 0) is 2026-11-16, Tuesday (index 1) is 2026-11-17, Wednesday (index 2) is 2026-11-18
    expect(weeks[3][0]?.dateString).toBe('2026-11-16');
    expect(weeks[3][1]?.dateString).toBe('2026-11-17');
    expect(weeks[3][2]?.dateString).toBe('2026-11-18');
  });

  it('renders 7 Vietnamese weekday headers (T2..CN), month title, and disables future dates', async () => {
    const onSelectDate = jest.fn();
    const onClose = jest.fn();

    const { getByText, getByTestId } = await render(
      <CalendarPickerSheet
        visible={true}
        selectedDate="2026-11-16"
        today="2026-11-18"
        onSelectDate={onSelectDate}
        onClose={onClose}
      />,
    );

    expect(getByText('Tháng 11, 2026')).toBeTruthy();
    expect(getByTestId('calendar-scroll-view')).toBeTruthy();
    for (const wd of ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']) {
      expect(getByText(wd)).toBeTruthy();
    }

    // Next month button is disabled when viewing current month
    expect(
      getByTestId('calendar-next-month-btn').props.accessibilityState?.disabled,
    ).toBe(true);

    // Selected date 2026-11-16 is marked selected
    expect(
      getByTestId('calendar-day-2026-11-16').props.accessibilityState?.selected,
    ).toBe(true);

    // Future date 2026-11-19 is disabled and does not fire onSelectDate
    const futureCell = getByTestId('calendar-day-2026-11-19');
    expect(futureCell.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(futureCell);
    expect(onSelectDate).not.toHaveBeenCalled();

    // Valid past date 2026-11-14 (Saturday) selects and closes
    fireEvent.press(getByTestId('calendar-day-2026-11-14'));
    expect(onSelectDate).toHaveBeenCalledWith('2026-11-14');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates to previous/next month and supports Hôm nay / Hôm qua quick chips', async () => {
    const onSelectDate = jest.fn();
    const onClose = jest.fn();

    const { getByText, getByTestId } = await render(
      <CalendarPickerSheet
        visible={true}
        selectedDate="2026-11-16"
        today="2026-11-18"
        maxPastDays={90}
        onSelectDate={onSelectDate}
        onClose={onClose}
      />,
    );

    // Navigate back to October 2026
    await fireEvent.press(getByTestId('calendar-prev-month-btn'));
    expect(getByText('Tháng 10, 2026')).toBeTruthy();
    expect(
      getByTestId('calendar-next-month-btn').props.accessibilityState?.disabled,
    ).toBe(false);

    // Pick 31/10/2026
    await fireEvent.press(getByTestId('calendar-day-2026-10-31'));
    expect(onSelectDate).toHaveBeenCalledWith('2026-10-31');

    // Quick chip Hôm qua -> 2026-11-17
    await fireEvent.press(getByTestId('calendar-quick-yesterday'));
    expect(onSelectDate).toHaveBeenCalledWith('2026-11-17');

    // Quick chip Hôm nay -> 2026-11-18
    await fireEvent.press(getByTestId('calendar-quick-today'));
    expect(onSelectDate).toHaveBeenCalledWith('2026-11-18');
  });
});
