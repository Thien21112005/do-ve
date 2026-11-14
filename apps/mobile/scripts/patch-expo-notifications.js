const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-notifications',
  'build',
  'TopicSubscriptionModule.android.js'
);

if (fs.existsSync(targetFile)) {
  const content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes("requireNativeModule('ExpoTopicSubscriptionModule')")) {
    const patched = content
      .replace(
        "requireNativeModule('ExpoTopicSubscriptionModule')",
        "requireOptionalNativeModule('ExpoTopicSubscriptionModule') || { addListener: () => {}, removeListeners: () => {}, subscribeToTopicAsync: () => Promise.resolve(null), unsubscribeFromTopicAsync: () => Promise.resolve(null) }"
      )
      .replace(
        "import { requireNativeModule } from 'expo';",
        "import { requireOptionalNativeModule } from 'expo';"
      );
    fs.writeFileSync(targetFile, patched, 'utf8');
    console.log('Successfully patched TopicSubscriptionModule.android.js for Expo Go');
  } else if (content.includes("requireOptionalNativeModule('ExpoTopicSubscriptionModule')")) {
    console.log('TopicSubscriptionModule.android.js is already patched.');
  } else {
    console.warn(
      'Warning: Target string in TopicSubscriptionModule.android.js not found. expo-notifications version might have changed.'
    );
  }
} else {
  console.log('expo-notifications TopicSubscriptionModule.android.js not found (skipping patch).');
}
