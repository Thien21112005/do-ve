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
        tabBarLabelStyle: {
          fontFamily: 'BeVietnamPro-Medium',
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.textMain,
        headerTitleStyle: {
          fontFamily: 'BeVietnamPro-SemiBold',
          fontSize: 17,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: STRINGS.tabs.home,
          headerTitle: STRINGS.common.appName,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name="home"
              color={color ? String(color) : undefined}
              size={size}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="check"
        options={{
          title: STRINGS.tabs.check,
          headerTitle: STRINGS.check.screenTitle,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name="ticket"
              color={color ? String(color) : undefined}
              size={size}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: STRINGS.tabs.results,
          headerTitle: STRINGS.results.screenTitle,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name="table"
              color={color ? String(color) : undefined}
              size={size}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: STRINGS.tabs.tickets,
          headerTitle: STRINGS.tabs.tickets,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name="bookmark"
              color={color ? String(color) : undefined}
              size={size}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: STRINGS.tabs.more,
          headerTitle: STRINGS.tabs.more,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name="more"
              color={color ? String(color) : undefined}
              size={size}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}

