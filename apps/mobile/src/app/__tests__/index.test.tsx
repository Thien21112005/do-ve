import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../index';

describe('HomeScreen', () => {
  it('renders application title correctly', async () => {
    const { getByText } = await render(<HomeScreen />);
    expect(getByText('DoVe')).toBeTruthy();
    expect(getByText('Ứng dụng dò vé số kiến thiết miền Nam')).toBeTruthy();
  });
});
