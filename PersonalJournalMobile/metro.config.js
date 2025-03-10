const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
    extraNodeModules: {
      '@shared': '../shared',
    },
  },
  watchFolders: [
    '../shared',
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);