import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { AppVersionGate } from '../AppVersionGate';
import type { AppConfigResponse } from '@/types';

describe('AppVersionGate Component (T06.30)', () => {
  const normalConfig: AppConfigResponse = {
    minSupportedVersion: '1.0.0',
    maintenance: false,
    message: '',
  };

  const outdatedConfig: AppConfigResponse = {
    minSupportedVersion: '2.0.0',
    maintenance: false,
    message: 'Phiên bản cũ đã ngừng hoạt động. Vui lòng cập nhật!',
  };

  const maintenanceConfig: AppConfigResponse = {
    minSupportedVersion: '1.0.0',
    maintenance: true,
    message: 'Máy chủ đang bảo trì nâng cấp từ 12h00 đến 14h00.',
  };

  it('renders children when app version is valid and not in maintenance', async () => {
    const { getByText, queryByTestId } = await render(
      <AppVersionGate config={normalConfig} currentVersion="1.0.0">
        <Text>Normal App Content</Text>
      </AppVersionGate>,
    );

    expect(getByText('Normal App Content')).toBeTruthy();
    expect(queryByTestId('maintenance-screen')).toBeNull();
    expect(queryByTestId('update-required-screen')).toBeNull();
  });

  it('displays update required screen when app version is below minimum', async () => {
    const onUpdate = jest.fn();
    const { getByTestId, getByText, queryByText } = await render(
      <AppVersionGate
        config={outdatedConfig}
        currentVersion="1.0.0"
        onUpdate={onUpdate}
      >
        <Text>Normal App Content</Text>
      </AppVersionGate>,
    );

    expect(queryByText('Normal App Content')).toBeNull();
    expect(getByTestId('update-required-screen')).toBeTruthy();
    expect(getByText(/Cần cập nhật ứng dụng/i)).toBeTruthy();
    expect(
      getByText('Phiên bản cũ đã ngừng hoạt động. Vui lòng cập nhật!'),
    ).toBeTruthy();

    const updateBtn = getByTestId('update-app-btn');
    fireEvent.press(updateBtn);
    expect(onUpdate).toHaveBeenCalled();
  });

  it('displays maintenance screen when maintenance is true', async () => {
    const onRetry = jest.fn();
    const { getByTestId, getByText, queryByText } = await render(
      <AppVersionGate
        config={maintenanceConfig}
        currentVersion="1.0.0"
        onRetry={onRetry}
      >
        <Text>Normal App Content</Text>
      </AppVersionGate>,
    );

    expect(queryByText('Normal App Content')).toBeNull();
    expect(getByTestId('maintenance-screen')).toBeTruthy();
    expect(getByText(/Hệ thống đang bảo trì/i)).toBeTruthy();
    expect(
      getByText('Máy chủ đang bảo trì nâng cấp từ 12h00 đến 14h00.'),
    ).toBeTruthy();

    const retryBtn = getByTestId('maintenance-retry-btn');
    fireEvent.press(retryBtn);
    expect(onRetry).toHaveBeenCalled();
  });
});

