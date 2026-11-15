import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from '../Text';
import { typeScale } from '@/theme/tokens';
import { colors } from '@/theme/colors';

describe('<Text /> component (T10.07)', () => {
  it('renders default body variant with Be Vietnam Pro', async () => {
    const { getByText } = await render(<Text>Hello DoVe</Text>);
    const textElement = getByText('Hello DoVe');

    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: typeScale.body.fontSize,
          lineHeight: typeScale.body.lineHeight,
          fontFamily: typeScale.body.fontFamily,
          color: colors.light.textMain,
        }),
      ]),
    );
  });

  it('renders caption variant with muted color and 12px size', async () => {
    const { getByText } = await render(<Text variant="caption">Chú thích</Text>);
    const textElement = getByText('Chú thích');

    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 12,
          lineHeight: 16,
          fontFamily: 'BeVietnamPro-Regular',
          color: colors.light.textMuted,
        }),
      ]),
    );
  });

  it('renders ticketLg variant with tabular-nums and letterSpacing', async () => {
    const { getByText } = await render(<Text variant="ticketLg">123456</Text>);
    const textElement = getByText('123456');

    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 34,
          lineHeight: 40,
          fontFamily: 'BeVietnamPro-Bold',
          letterSpacing: 4,
          fontVariant: ['tabular-nums'],
        }),
      ]),
    );
  });

  it('renders ticketMd variant with tabular-nums', async () => {
    const { getByText } = await render(<Text variant="ticketMd">654321</Text>);
    const textElement = getByText('654321');

    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 24,
          lineHeight: 30,
          fontFamily: 'BeVietnamPro-Bold',
          letterSpacing: 2,
          fontVariant: ['tabular-nums'],
        }),
      ]),
    );
  });

  it('respects color and alignment overrides', async () => {
    const { getByText } = await render(
      <Text variant="headline" color="#B91C1C" align="center">
        Giải Đặc Biệt
      </Text>,
    );
    const textElement = getByText('Giải Đặc Biệt');

    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 22,
          fontFamily: 'BeVietnamPro-Bold',
          color: '#B91C1C',
          textAlign: 'center',
        }),
      ]),
    );
  });
});
