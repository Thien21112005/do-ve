import React from 'react';
import { render } from '@testing-library/react-native';
import { Icon, iconMap } from '../Icon';

describe('Icon component', () => {
  it('renders home icon successfully', async () => {
    const { toJSON } = await render(
      <Icon name="home" size={28} color="#2563eb" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders all tab icons without error', async () => {
    const tabIcons = ['home', 'ticket', 'trophy', 'bookmark', 'more'] as const;
    for (const name of tabIcons) {
      const { toJSON } = await render(<Icon name={name} />);
      expect(toJSON()).toBeTruthy();
    }
  });

  it('contains expected icons in iconMap including new tab icons (T10.13)', () => {
    expect(iconMap.home).toBeDefined();
    expect(iconMap.ticket).toBeDefined();
    expect(iconMap.trophy).toBeDefined();
    expect(iconMap.bookmark).toBeDefined();
    expect(iconMap.more).toBeDefined();
    expect(iconMap.search).toBeDefined();
    expect(iconMap.checkCircle).toBeDefined();
    expect(iconMap.clock).toBeDefined();
    expect(iconMap.table).toBeDefined();
    expect(iconMap.listOrdered).toBeDefined();
    expect(iconMap.scanSearch).toBeDefined();
  });
});
