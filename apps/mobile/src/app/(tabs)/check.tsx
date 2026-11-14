import React from 'react';
import { Text, View } from 'react-native';

export default function CheckScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900 p-6">
      <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Dò vé
      </Text>
      <Text className="text-base text-slate-500 dark:text-slate-400 text-center">
        Nhập số vé hoặc quét để dò kết quả nhanh chóng
      </Text>
    </View>
  );
}
