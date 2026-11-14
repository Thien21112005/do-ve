import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from '@/components';
import { useTheme } from '@/theme';
import { STRINGS } from '@/lib/strings';

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
          title: STRINGS.tabs.home,
          headerTitle: STRINGS.common.appName,
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
          title: STRINGS.tabs.check,
          headerTitle: STRINGS.check.screenTitle,
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
          title: STRINGS.tabs.results,
          headerTitle: STRINGS.results.screenTitle,
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
          title: STRINGS.tabs.tickets,
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
          title: STRINGS.tabs.more,
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

