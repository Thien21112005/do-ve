import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from '@/components';
import { useTheme } from '@/theme';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.textMain,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          headerTitle: 'DoVe',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="home"
              color={color ? String(color) : undefined}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="check"
        options={{
          title: 'Dò vé',
          headerTitle: 'Dò vé số',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="ticket"
              color={color ? String(color) : undefined}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Kết quả',
          headerTitle: 'Kết quả xổ số',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="trophy"
              color={color ? String(color) : undefined}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Vé của tôi',
          headerTitle: 'Vé đã lưu',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="bookmark"
              color={color ? String(color) : undefined}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Thêm',
          headerTitle: 'Thêm & Cài đặt',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="more"
              color={color ? String(color) : undefined}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
