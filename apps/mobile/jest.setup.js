/* global jest */
jest.mock('expo-router', () => {
  const routerMock = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  };
  return {
    __esModule: true,
    useRouter: () => routerMock,
    useLocalSearchParams: () => ({}),
    usePathname: () => '/',
    Link: ({ children }) => children,
    Tabs: Object.assign(({ children }) => children, { Screen: () => null }),
    Stack: Object.assign(({ children }) => children, { Screen: () => null }),
  };
});

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('react-native-reanimated', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      Text,
      createAnimatedComponent: (c) => c,
    },
    View,
    Text,
    useSharedValue: (val) => ({ value: val }),
    useAnimatedStyle: (updater) => updater(),
    useDerivedValue: (updater) => ({ value: updater() }),
    withTiming: (toValue) => toValue,
    withSpring: (toValue) => toValue,
    withRepeat: (anim) => anim,
    withSequence: (...anims) => anims[0],
    withDelay: (_delay, anim) => anim,
    Easing: {
      in: (fn) => fn,
      out: (fn) => fn,
      inOut: (fn) => fn,
      ease: (t) => t,
      linear: (t) => t,
      bezier: () => (t) => t,
    },
    FadeIn: { duration: () => ({ delay: () => {} }) },
    FadeOut: { duration: () => ({ delay: () => {} }) },
    LayoutAnimationConfig: ({ children }) => children,
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
  };
});
