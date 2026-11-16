import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { layout } from '../tokens';
import { ResponsiveContainer } from '@/components/ui/Screen';

describe('Layout Constraint Tokens & Responsive Container (T10.61)', () => {
  it('defines layout contentMaxWidth of 560 and tableMaxWidth of 720', () => {
    expect(layout.contentMaxWidth).toBe(560);
    expect(layout.tableMaxWidth).toBe(720);
  });

  it('renders ResponsiveContainer with max width 560 and center alignment', async () => {
    const { getByText, getByTestId } = await render(
      <ResponsiveContainer testID="responsive-box">
        <Text>Content inside container</Text>
      </ResponsiveContainer>,
    );

    expect(getByText('Content inside container')).toBeTruthy();
    const container = getByTestId('responsive-box');
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: '100%',
          maxWidth: 560,
          alignSelf: 'center',
        }),
      ]),
    );
  });

  it('allows custom maxWidth for wide table containers', async () => {
    const { getByTestId } = await render(
      <ResponsiveContainer testID="wide-box" maxWidth={layout.tableMaxWidth}>
        <Text>Wide table</Text>
      </ResponsiveContainer>,
    );

    const container = getByTestId('wide-box');
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          maxWidth: 720,
        }),
      ]),
    );
  });
});
