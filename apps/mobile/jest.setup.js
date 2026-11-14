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

const mockFileSystem = {
  cacheDirectory: 'file:///mock/cache/',
  documentDirectory: 'file:///mock/documents/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readAsStringAsync: jest.fn().mockResolvedValue(''),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, isDirectory: false }),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: {
    UTF8: 'utf8',
    Base64: 'base64',
  },
};

jest.mock('expo-file-system', () => mockFileSystem);
jest.mock('expo-file-system/legacy', () => mockFileSystem);

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({
    canceled: true,
    assets: [],
  }),
}));

const mockNotifications = {
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notif-id-123'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: {
    DATE: 'date',
    CALENDAR: 'calendar',
    TIME_INTERVAL: 'timeInterval',
  },
};

jest.mock('expo-notifications', () => mockNotifications);

