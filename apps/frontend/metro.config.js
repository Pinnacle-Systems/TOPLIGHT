const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [path.resolve(__dirname, '../../node_modules')],
  resolver: {
    unstable_enableSymlinks: true,
    unstable_enablePackageExports: true,
    blockList: [
      // Block CMake build dirs (react-native-vision-camera, etc.)
      /node_modules\/.*\/android\/\.cxx\/.*/,
      // Block Gradle build intermediates (firebase, etc.)
      /node_modules\/.*\/android\/build\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
