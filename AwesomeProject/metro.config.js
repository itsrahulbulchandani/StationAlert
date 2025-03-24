const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const os = require('os');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

// Fallback for `os.availableParallelism()`
defaultConfig.transformer = defaultConfig.transformer || {};
defaultConfig.transformer.workerCount = os.cpus().length || 1;

const config = {};

module.exports = mergeConfig(defaultConfig, config);
