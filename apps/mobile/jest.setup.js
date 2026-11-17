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
    router: routerMock,
    useRouter: () => routerMock,
    useLocalSearchParams: () => ({}),
    usePathname: () => '/',
    // Behave like a mounted, focused screen: run on mount/when cb changes and
    // run the cleanup on unmount, so intervals do not leak and keep Jest alive.
    useFocusEffect: (cb) => {
      require('react').useEffect(() => {
        if (typeof cb !== 'function') return undefined;
        const cleanup = cb();
        return typeof cleanup === 'function' ? cleanup : undefined;
      }, [cb]);
    },
    Link: ({ children }) => children,
    Tabs: Object.assign(({ children }) => children, { Screen: () => null }),
    Stack: Object.assign(({ children }) => children, { Screen: () => null }),
  };
});

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
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

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(true),
  hideAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: '1.0.0',
      android: {
        versionCode: 1,
      },
      ios: {
        buildNumber: '1',
      },
    },
  },
}));

const mockNotifications = {
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notif-id-123'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  AndroidImportance: {
    HIGH: 4,
    DEFAULT: 3,
    LOW: 2,
    MIN: 1,
    NONE: 0,
    MAX: 5,
  },
  SchedulableTriggerInputTypes: {
    DATE: 'date',
    CALENDAR: 'calendar',
    TIME_INTERVAL: 'timeInterval',
  },
};

jest.mock('expo-notifications', () => mockNotifications);

const mockNativewindColorScheme = {
  set: jest.fn(),
  get: jest.fn().mockReturnValue('light'),
  toggle: jest.fn(),
};

jest.mock('nativewind', () => ({
  vars: (v) => v,
  colorScheme: mockNativewindColorScheme,
  useColorScheme: () => ({
    colorScheme: 'light',
    setColorScheme: jest.fn((val) => mockNativewindColorScheme.set(val)),
    toggleColorScheme: jest.fn(),
  }),
}));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    Swipeable: ({ children, renderRightActions, renderLeftActions, testID }) => {
      return (
        <View testID={testID}>
          {renderLeftActions && renderLeftActions()}
          {children}
          {renderRightActions && renderRightActions()}
        </View>
      );
    },
    GestureHandlerRootView: ({ children }) => children,
    State: {},
    PanGestureHandler: ({ children }) => children,
    TapGestureHandler: ({ children }) => children,
    Directions: {},
  };
});

jest.mock('react-native-gesture-handler/Swipeable', () => {
  const { View } = require('react-native');
  return function MockSwipeable({ children, renderRightActions, renderLeftActions, testID }) {
    return (
      <View testID={testID}>
        {renderLeftActions && renderLeftActions()}
        {children}
        {renderRightActions && renderRightActions()}
      </View>
    );
  };
}, { virtual: true });

jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
  const { View } = require('react-native');
  return function MockSwipeable({ children, renderRightActions, renderLeftActions, testID }) {
    return (
      <View testID={testID}>
        {renderLeftActions && renderLeftActions()}
        {children}
        {renderRightActions && renderRightActions()}
      </View>
    );
  };
}, { virtual: true });

