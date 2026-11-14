import React from 'react';
import { Text, View } from 'react-native';

export default function TicketsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900 p-6">
      <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Vé của tôi
      </Text>
      <Text className="text-base text-slate-500 dark:text-slate-400 text-center">
        Lưu trữ và theo dõi các vé số đã dò
      </Text>
    </View>
  );
}
