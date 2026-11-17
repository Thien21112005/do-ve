import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { ThemeVarsRoot } from '@/components/AppProviders';
import { colors } from '../colors';

describe('ThemeVarsRoot (T11.03)', () => {
  it('applies the light palette variables on the root view by default', async () => {
    const { getByTestId } = await render(
      <ThemeVarsRoot>
        <Text>x</Text>
      </ThemeVarsRoot>,
    );
    const style = StyleSheet.flatten(getByTestId('theme-vars-root').props.style);
    expect(style['--color-background']).toBe(colors.light.background);
    expect(style['--color-text-main']).toBe(colors.light.textMain);
  });
});
