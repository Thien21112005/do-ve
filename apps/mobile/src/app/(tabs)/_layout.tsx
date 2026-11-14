import React from 'react';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          headerTitle: 'DoVe',
        }}
      />
      <Tabs.Screen
        name="check"
        options={{
          title: 'Dò vé',
          headerTitle: 'Dò vé số',
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Kết quả',
          headerTitle: 'Kết quả xổ số',
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Vé của tôi',
          headerTitle: 'Vé đã lưu',
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Thêm',
          headerTitle: 'Thêm & Cài đặt',
        }}
      />
    </Tabs>
  );
}
