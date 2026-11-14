import React from 'react';
import { Text, View } from 'react-native';
import { STRINGS } from '@/lib/strings';

export default function TicketsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900 p-6">
      <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {STRINGS.tickets.screenTitle}
      </Text>
      <Text className="text-base text-slate-500 dark:text-slate-400 text-center">
        {STRINGS.tickets.subtitle}
      </Text>
    </View>
  );
}

