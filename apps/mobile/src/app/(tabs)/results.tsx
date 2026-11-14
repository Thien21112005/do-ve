import React from 'react';
import { Text, View } from 'react-native';

export default function ResultsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900 p-6">
      <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Kết quả
      </Text>
      <Text className="text-base text-slate-500 dark:text-slate-400 text-center">
        Bảng kết quả xổ số kiến thiết 21 đài miền Nam
      </Text>
    </View>
  );
}
