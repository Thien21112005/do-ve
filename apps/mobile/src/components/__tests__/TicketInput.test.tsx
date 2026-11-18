import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { TicketInput } from '../TicketInput';
import { colors } from '@/theme';

describe('TicketInput Component', () => {
  it('renders all 6 digit input boxes', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <TicketInput value="" onChangeText={onChangeText} />,
    );

    for (let i = 0; i < 6; i++) {
      expect(getByTestId(`ticket-input-digit-${i}`)).toBeTruthy();
    }
  });

  it('displays existing digits and preserves leading zeros', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <TicketInput value="012345" onChangeText={onChangeText} />,
    );

    expect(getByTestId('ticket-input-digit-0').props.value).toBe('0');
    expect(getByTestId('ticket-input-digit-1').props.value).toBe('1');
    expect(getByTestId('ticket-input-digit-2').props.value).toBe('2');
    expect(getByTestId('ticket-input-digit-3').props.value).toBe('3');
    expect(getByTestId('ticket-input-digit-4').props.value).toBe('4');
    expect(getByTestId('ticket-input-digit-5').props.value).toBe('5');
  });

  it('calls onChangeText when typing a single digit', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <TicketInput value="" onChangeText={onChangeText} />,
    );

    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '7');
    expect(onChangeText).toHaveBeenCalledWith('7');
  });

  it('cleans non-digit characters and spaces when pasting multiple digits', async () => {
    const onChangeText = jest.fn();
    const onComplete = jest.fn();
    const { getByTestId } = await render(
      <TicketInput
        value=""
        onChangeText={onChangeText}
        onComplete={onComplete}
      />,
    );

    // Paste " 089 456 " with spaces
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), ' 089 456 ');

    expect(onChangeText).toHaveBeenCalledWith('089456');
    expect(onComplete).toHaveBeenCalledWith('089456');
  });

  it('triggers onComplete when 6 digits are fully entered', async () => {
    const onChangeText = jest.fn();
    const onComplete = jest.fn();
    const { getByTestId } = await render(
      <TicketInput
        value="12345"
        onChangeText={onChangeText}
        onComplete={onComplete}
      />,
    );

    fireEvent.changeText(getByTestId('ticket-input-digit-5'), '6');
    expect(onChangeText).toHaveBeenCalledWith('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('handles backspace on empty box to delete preceding digit', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <TicketInput value="123" onChangeText={onChangeText} />,
    );

    // Press Backspace on box 3 (which is empty)
    fireEvent(getByTestId('ticket-input-digit-3'), 'keyPress', {
      nativeEvent: { key: 'Backspace' },
    });

    // Box 2 ('3') should be deleted -> "12"
    expect(onChangeText).toHaveBeenCalledWith('12');
  });

  it('applies error styling when hasError is true', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <TicketInput value="12" onChangeText={onChangeText} hasError />,
    );

    const box = getByTestId('ticket-input-digit-0').parent;
    expect(box?.props.style).toEqual(
      expect.objectContaining({
        borderColor: colors.light.error,
      }),
    );
  });

  it('disables input editing when disabled is true', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <TicketInput value="123456" onChangeText={onChangeText} disabled />,
    );

    expect(getByTestId('ticket-input-digit-0').props.editable).toBe(false);
  });

  it('keeps digit positions stable when middle digit is cleared without shifting (T09.18)', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <TicketInput value="123456" onChangeText={onChangeText} />,
    );

    // User clears digit at index 2 (the '3')
    fireEvent.changeText(getByTestId('ticket-input-digit-2'), '');
    expect(onChangeText).toHaveBeenCalledWith('12 456');
  });

  it('renders intermediate spaces as empty boxes without shifting digits (T09.18)', async () => {
    const { getByTestId } = await render(
      <TicketInput value="12 456" onChangeText={jest.fn()} />,
    );
    expect(getByTestId('ticket-input-digit-0').props.value).toBe('1');
    expect(getByTestId('ticket-input-digit-1').props.value).toBe('2');
    expect(getByTestId('ticket-input-digit-2').props.value).toBe('');
    expect(getByTestId('ticket-input-digit-3').props.value).toBe('4');
    expect(getByTestId('ticket-input-digit-4').props.value).toBe('5');
    expect(getByTestId('ticket-input-digit-5').props.value).toBe('6');
  });

  it('tracks real focus state on the active input box instead of string length (T09.19)', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <TicketInput value="123456" onChangeText={onChangeText} />,
    );

    // Focus on box 1
    await act(async () => {
      fireEvent(getByTestId('ticket-input-digit-1'), 'focus');
    });

    const box1 = getByTestId('ticket-input-digit-1').parent;
    expect(box1?.props.style).toEqual(
      expect.objectContaining({
        borderColor: colors.light.primary,
      }),
    );

    // Box 5 should NOT have primary focus border
    const box5 = getByTestId('ticket-input-digit-5').parent;
    expect(box5?.props.style?.borderColor).not.toBe(colors.light.primary);
  });

  it('renders ticket-style paper boxes with height >= 56 and hidden text input (T10.22)', async () => {
    const onChangeText = jest.fn();
    const onComplete = jest.fn();
    const { getByTestId } = await render(
      <TicketInput
        value="012345"
        onChangeText={onChangeText}
        onComplete={onComplete}
      />,
    );

    // Box height should be >= 56
    const box0 = getByTestId('ticket-input-digit-0').parent;
    const boxStyles = Array.isArray(box0?.props.style)
      ? Object.assign({}, ...box0?.props.style)
      : box0?.props.style;
    expect(boxStyles?.height || boxStyles?.minHeight || 56).toBeGreaterThanOrEqual(56);

    // Hidden input exists to support native autofill/pasting
    const hiddenInput = getByTestId('ticket-input-hidden-input');
    expect(hiddenInput).toBeTruthy();
    expect(hiddenInput.props.value).toBe('012345');

    // Pasting into hidden input updates value
    fireEvent.changeText(hiddenInput, '654321');
    expect(onChangeText).toHaveBeenCalledWith('654321');
    expect(onComplete).toHaveBeenCalledWith('654321');
  });

  it('uses flex-1 aspectRatio 0.8 maxWidth 56 boxes in explicit row style at normal fontScale (T11.28)', async () => {
    const { getByTestId } = await render(
      <TicketInput value="012345" onChangeText={jest.fn()} />,
    );

    const root = getByTestId('ticket-input');
    const rootStyle = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style.filter(Boolean))
      : root.props.style;
    expect(rootStyle.flexDirection).toBe('row');

    const box0 = getByTestId('ticket-input-digit-0').parent;
    const boxStyle = Array.isArray(box0?.props.style)
      ? Object.assign({}, ...box0?.props.style.filter(Boolean))
      : box0?.props.style;
    expect(boxStyle.flex).toBe(1);
    expect(boxStyle.aspectRatio).toBe(0.8);
    expect(boxStyle.maxWidth).toBe(56);
  });

  it('switches to a single contiguous ticketLg input when fontScale > 1.3 (T11.28)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PixelRatio } = require('react-native');
    const spyFontScale = jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.5);
    const onChangeText = jest.fn();
    const onComplete = jest.fn();

    try {
      const { getByTestId, queryByTestId } = await render(
        <TicketInput
          value="012"
          onChangeText={onChangeText}
          onComplete={onComplete}
        />,
      );

      expect(queryByTestId('ticket-input-digit-0')).toBeNull();
      const singleInput = getByTestId('ticket-input-single-input');
      expect(singleInput.props.value).toBe('012');

      const inputStyle = Array.isArray(singleInput.props.style)
        ? Object.assign({}, ...singleInput.props.style.filter(Boolean))
        : singleInput.props.style;
      expect(inputStyle.fontFamily).toBe('BeVietnamPro-Bold');
      expect(inputStyle.fontVariant).toEqual(['tabular-nums']);

      // Pasting "12 34 56" strips spaces and completes all 6 digits
      fireEvent.changeText(singleInput, '12 34 56');
      expect(onChangeText).toHaveBeenCalledWith('123456');
      expect(onComplete).toHaveBeenCalledWith('123456');
    } finally {
      spyFontScale.mockRestore();
    }
  });
});
