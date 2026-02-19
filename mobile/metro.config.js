const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Exclude Android CMake build artifacts from Metro's file watcher
// Fixes ENOENT crash on Windows (FallbackWatcher tries to watch transient .cxx dirs)
config.resolver.blockList = [
  /.*[/\\]\.cxx[/\\].*/,
];

module.exports = withNativeWind(config, { input: './global.css' });
