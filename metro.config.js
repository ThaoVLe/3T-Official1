import { getDefaultConfig } from '@expo/metro-config';

const config = getDefaultConfig(import.meta.dirname);
config.resolver.sourceExts = ['tsx', 'ts', 'js', 'json']; // Support .tsx

const customConfig = {
  watchFolders: ['/Users/nhien/Documents/0-Diary/3T-Official1/'],
  resolver: {
    blockList: [
      /node_modules\/.*/,    // Exclude all node_modules subdirectories
      /android\/.*/,         // Exclude all android subdirectories
      /ios\/.*/,             // Exclude all ios subdirectories
      /\/[^/]*\/node_modules\/.*/,  // Exclude node_modules in any subdirectory
      /.*\/\.git\/.*/,       // Exclude .git
      /.*\/build\/.*/,       // Exclude build directories
      /.*\/\.cache\/.*/,     // Exclude cache directories
      /.*\/dist\/.*/,        // Exclude dist directories
      /.*\/coverage\/.*/,    // Exclude coverage reports
      /.*\/__tests__\/.*/,   // Exclude test directories
      /.*\/\.idea\/.*/,      // Exclude IntelliJ IDEA files
      /.*\/\.vscode\/.*/,    // Exclude VSCode settings
      /.*\/node_modules\/.*\/node_modules\/.*/,  // Nested node_modules
    ],
  },
  watcher: {
    additionalExts: ['tsx', 'ts', 'js', 'json'], // Limit to relevant file types
    // Uncomment to disable Watchman if issues persist
    // watchman: false,
  },
  transformer: {
    unstable_allowRequireContext: true, // Debug watched files
  },
};

export default Object.assign(config, customConfig);