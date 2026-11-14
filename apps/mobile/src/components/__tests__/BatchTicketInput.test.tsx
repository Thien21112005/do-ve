import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BatchTicketInput, parseBatchTickets } from '../BatchTicketInput';

describe('parseBatchTickets helper', () => {
  it('correctly parses tickets separated by newlines, commas, and spaces', () => {
    const raw = '123456\n654321, 012345   999888';
    const result = parseBatchTickets(raw);

    expect(result.validTickets).toEqual([
      '123456',
      '654321',
      '012345',
      '999888',
    ]);
    expect(result.count).toBe(4);
    expect(result.error).toBeNull();
  });

  it('detects exceeding the 20 tickets limit when pasting 25 tickets', () => {
    // Generate 25 valid tickets
    const tickets = Array.from({ length: 25 }, (_, i) =>
      String(100000 + i),
    ).join('\n');

    const result = parseBatchTickets(tickets, 20);

    expect(result.count).toBe(25);
    expect(result.error).toMatch(/Vượt quá giới hạn tối đa 20 vé/i);
    expect(result.isOverLimit).toBe(true);
  });

  it('detects invalid non-6-digit tokens', () => {
    const raw = '123456 123 9999999 abcdef';
    const result = parseBatchTickets(raw);

    expect(result.validTickets).toEqual(['123456']);
    expect(result.invalidTokens).toEqual(['123', '9999999', 'abcdef']);
    expect(result.error).toMatch(/không hợp lệ/i);
  });
});

describe('BatchTicketInput Component', () => {
  it('renders input area, placeholder, and ticket counter', async () => {
    const onChange = jest.fn();
    const { getByTestId, getByText } = await render(
      <BatchTicketInput value="123456 654321" onChangeText={onChange} />,
    );

    expect(getByTestId('batch-ticket-input')).toBeTruthy();
    expect(getByText(/2\/20 vé/)).toBeTruthy();
  });

  it('shows error banner when 25 numbers are pasted', async () => {
    const raw25 = Array.from({ length: 25 }, (_, i) => String(100000 + i)).join(
      ' ',
    );

    const { getByTestId, getByText } = await render(
      <BatchTicketInput value={raw25} onChangeText={jest.fn()} />,
    );

    expect(getByTestId('batch-input-error')).toBeTruthy();
    expect(getByText(/Vượt quá giới hạn tối đa 20 vé/i)).toBeTruthy();
    expect(getByText(/25\/20 vé/)).toBeTruthy();
  });

  it('calls onChangeText when user types or pastes text', async () => {
    const onChange = jest.fn();
    const { getByTestId } = await render(
      <BatchTicketInput value="" onChangeText={onChange} />,
    );

    const input = getByTestId('batch-ticket-input');
    fireEvent.changeText(input, '123456\n654321');

    expect(onChange).toHaveBeenCalledWith('123456\n654321');
  });

  it('clears text when Clear button is pressed', async () => {
    const onChange = jest.fn();
    const { getByTestId } = await render(
      <BatchTicketInput value="123456" onChangeText={onChange} />,
    );

    const clearBtn = getByTestId('batch-clear-btn');
    fireEvent.press(clearBtn);

    expect(onChange).toHaveBeenCalledWith('');
  });
});
