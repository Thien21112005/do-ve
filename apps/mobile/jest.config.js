module.exports = {
  preset: 'jest-expo',
  testTimeout: 15000,
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.afterEnv.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/jest.setup.js',
    '^lucide-react-native$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|nativewind|lucide-react-native|react-native-svg|react-native-reanimated|react-native-worklets))',
  ],
};
