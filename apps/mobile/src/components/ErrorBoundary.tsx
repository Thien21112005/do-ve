import React, { Component, type ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { recordCrash } from '@/services/crashReporting';
import { Icon } from './Icon';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
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
    this.setState({
      hasError: false,
      errorMessage: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View
          testID="error-boundary-fallback"
          className="flex-1 items-center justify-center p-6 bg-slate-50 dark:bg-slate-900"
        >
          <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 items-center justify-center mb-4">
            <Icon name="alertCircle" size={32} color="#dc2626" />
          </View>
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
            Đã xảy ra lỗi không mong muốn
          </Text>
          <Text className="text-xs text-slate-600 dark:text-slate-400 text-center mb-6 leading-relaxed">
            Ứng dụng đã ghi nhận sự cố để xử lý. Dữ liệu vé của bạn vẫn an toàn trên thiết bị.
          </Text>
          <Pressable
            testID="error-boundary-retry-btn"
            accessibilityRole="button"
            accessibilityLabel="Thử lại"
            onPress={this.handleReset}
            className="px-6 py-3 bg-blue-600 rounded-xl active:opacity-80 shadow-sm"
          >
            <Text className="text-white text-sm font-semibold">Thử lại</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
