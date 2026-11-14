import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components';
import { useTheme } from '@/theme';

export default function MoreScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const menuItems = [
    {
      testID: 'more-menu-schedule',
      title: 'Lịch quay thưởng',
      subtitle: 'Lịch mở thưởng 21 đài miền Nam theo thứ trong tuần',
      icon: 'calendar' as const,
      onPress: () => router.push('/schedule'),
    },
    {
      testID: 'more-menu-settings',
      title: 'Cài đặt',
      subtitle: 'Giao diện sáng/tối, hiệu ứng chúc mừng',
      icon: 'settings' as const,
      onPress: () => {},
    },
    {
      testID: 'more-menu-about',
      title: 'Giới thiệu & Miễn trừ trách nhiệm',
      subtitle: 'Quy chế tham khảo, bản quyền và thông tin phiên bản',
      icon: 'info' as const,
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView
      testID="more-screen"
      edges={['bottom']}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1 px-4 pt-4"
      >
        <Text
          className="text-2xl font-bold mb-1"
          style={{ color: colors.textMain }}
        >
          Thêm
        </Text>
        <Text className="text-xs mb-5" style={{ color: colors.textMuted }}>
          Lịch quay số, Giới thiệu và Cài đặt ứng dụng
        </Text>

        <View
          className="rounded-2xl border overflow-hidden shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {menuItems.map((item, index) => {
            const isLast = index === menuItems.length - 1;
            return (
              <Pressable
                key={item.testID}
                testID={item.testID}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                onPress={item.onPress}
                className="p-4 flex-row items-center border-b active:opacity-70"
                style={{
                  borderColor: colors.border,
                  borderBottomWidth: isLast ? 0 : 1,
                }}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
                  style={{ backgroundColor: `${colors.primary}1A` }}
                >
                  <Icon name={item.icon} size={20} color={colors.primary} />
                </View>
                <View className="flex-1 mr-2">
                  <Text
                    className="text-base font-bold mb-0.5"
                    style={{ color: colors.textMain }}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>
                    {item.subtitle}
                  </Text>
                </View>
                <Icon name="chevronRight" size={18} color={colors.textMuted} />
              </Pressable>
            );
          })}
        </View>

        {/* Disclaimer Note */}
        <View className="mt-8 px-2 items-center">
          <Text
            className="text-[11px] text-center leading-relaxed"
            style={{ color: colors.textMuted }}
          >
            DoVe là ứng dụng tra cứu kết quả xổ số kiến thiết phi lợi nhuận. Mọi
            thông tin kết quả chỉ mang tính chất tham khảo, vui lòng đối chiếu
            vé giấy tại các đại lý chính thức.
          </Text>
          <Text
            className="text-[11px] mt-2 font-medium"
            style={{ color: colors.textMuted }}
          >
            Phiên bản 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
