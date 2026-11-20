const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Cap Metro worker pool (default 2) so 16-thread Windows machines running
// Docker WSL2 + Spring Boot never exhaust OS virtual memory commit charge
// ("Zone Allocation failed / Committing semi space failed").
config.maxWorkers = Number(process.env.EXPO_MAX_WORKERS) || 2;

module.exports = withNativeWind(config, { input: './src/global.css' });
