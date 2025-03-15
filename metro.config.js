import { getDefaultConfig } from '@expo/metro-config';

const config = getDefaultConfig(import.meta.dirname);
config.resolver.sourceExts = ['tsx', 'ts', 'js', 'json']; // Support .tsx

export default config;