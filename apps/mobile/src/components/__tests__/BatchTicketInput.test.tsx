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

  it('dedupes tickets preserving order and reports duplicate count (T09.26)', () => {
    const raw = '123456 654321 123456 999999 654321';
    const result = parseBatchTickets(raw);

    expect(result.validTickets).toEqual(['123456', '654321', '999999']);
    expect(result.count).toBe(3);
    expect(result.duplicateCount).toBe(2);
    expect(result.notice).toMatch(/Đã loại bỏ 2 số trùng/i);
  });

  it('calculates limit strictly based on unique valid tickets (T09.26)', () => {
    // 15 unique valid tickets + 6 duplicates + 4 invalid tokens = 25 tokens total
    const uniqueTickets = Array.from({ length: 15 }, (_, i) =>
      String(100000 + i),
    );
    const duplicates = uniqueTickets.slice(0, 6);
    const invalids = ['abc', '12', '9999999', 'xyz'];
    const raw = [...uniqueTickets, ...duplicates, ...invalids].join(' ');

    const result = parseBatchTickets(raw, 20);

    expect(result.count).toBe(15);
    expect(result.duplicateCount).toBe(6);
    expect(result.isOverLimit).toBe(false);
  });

  it('tracks line numbers of invalid entries and formats line-level status summary (T11.35)', () => {
    const lines = [
      '100001 100002 100003 100004',
      '100005 100006 100007 100008',
      '100009 100010 100011 100012',
      '999', // line 4 invalid
    ].join('\n');

    const result = parseBatchTickets(lines, 20);
    expect(result.count).toBe(12);
    expect(result.invalidLines).toEqual([4]);
    expect(result.statusSummary).toBe('12 vé hợp lệ · 1 lỗi ở dòng 4');
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

  it('renders tokenized chips for valid, invalid, and duplicate tickets (T10.36)', async () => {
    const raw = '123456 999 123456 654321';
    const { getByTestId, getAllByTestId, getByText } = await render(
      <BatchTicketInput value={raw} onChangeText={jest.fn()} />,
    );

    // Tokenized chips container
    expect(getByTestId('batch-token-chips')).toBeTruthy();

    // Valid chip
    expect(getByTestId('batch-token-chip-654321')).toBeTruthy();
    expect(getByText('654321')).toBeTruthy();

    // Invalid chip
    expect(getByTestId('batch-token-chip-999')).toBeTruthy();
    expect(getByText('999 (sai)')).toBeTruthy();

    // Duplicate chip
    const chips123456 = getAllByTestId('batch-token-chip-123456');
    expect(chips123456.length).toBe(2);
    expect(getByText('123456 (trùng)')).toBeTruthy();
  });

  it('renders paste from clipboard button and triggers onPaste callback (T10.36)', async () => {
    const onPaste = jest.fn();
    const { getByTestId } = await render(
      <BatchTicketInput
        value=""
        onChangeText={jest.fn()}
        onPaste={onPaste}
      />,
    );

    const pasteBtn = getByTestId('batch-paste-btn');
    expect(pasteBtn).toBeTruthy();

    fireEvent.press(pasteBtn);
    expect(onPaste).toHaveBeenCalled();
  });
});
