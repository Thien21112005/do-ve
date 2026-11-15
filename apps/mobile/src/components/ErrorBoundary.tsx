import React, { Component, type ReactNode } from 'react';
import { View, Text, Pressable, Appearance } from 'react-native';
import { router } from 'expo-router';
import { recordCrash } from '@/services/crashReporting';
import { colors } from '@/theme/colors';
import { Icon } from './Icon';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  safeRoute?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
  resetKey: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null,
      resetKey: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    recordCrash(error, {
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = (): void => {
    // 1. Notify custom reset handler
    try {
      this.props.onReset?.();
    } catch {
      // Ignore handler error
    }

    // 2. Navigate to safe route (Home /(tabs)) (T09.55)
    try {
      const target = this.props.safeRoute || '/(tabs)';
      router.replace(target as any);
    } catch {
      // Ignore navigation errors in headless/test environments
    }

    // 3. Reset error state with incremented resetKey to force clean subtree remount
    this.setState((prev) => ({
      hasError: false,
      errorMessage: null,
      resetKey: prev.resetKey + 1,
    }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Safe theme resolution outside ThemeProvider context (T09.55)
      const isDark = Appearance.getColorScheme() === 'dark';
      const themeColors = isDark ? colors.dark : colors.light;

      return (
        <View
          testID="error-boundary-fallback"
          className="flex-1 items-center justify-center p-6"
          style={{ backgroundColor: themeColors.background }}
        >
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: `${themeColors.loss}1A` }}
          >
            <Icon name="alertCircle" size={32} color={themeColors.loss} />
          </View>
          <Text
            className="text-lg font-bold text-center mb-2"
            style={{ color: themeColors.textMain }}
          >
            Đã xảy ra lỗi không mong muốn
          </Text>
          <Text
            className="text-xs text-center mb-6 leading-relaxed px-4"
            style={{ color: themeColors.textMuted }}
          >
            Ứng dụng đã ghi nhận sự cố để xử lý. Dữ liệu vé của bạn vẫn an toàn trên thiết bị.
          </Text>
          <Pressable
            testID="error-boundary-retry-btn"
            accessibilityRole="button"
            accessibilityLabel="Thử lại"
            onPress={this.handleReset}
            className="px-6 py-3 rounded-xl active:opacity-80 shadow-sm"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Text className="text-white text-sm font-semibold">Thử lại</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <React.Fragment key={this.state.resetKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}
