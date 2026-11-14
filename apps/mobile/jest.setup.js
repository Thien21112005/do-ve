/* global jest */
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

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
