const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const config = getDefaultConfig(__dirname);

// Exclude Android/Gradle build artifacts from Metro's resolver and file watcher
// Fixes ENOENT crash on Windows (FallbackWatcher tries to watch transient build dirs)
const exclusionList = [
  /.*[/\\]\.cxx[/\\].*/,
  /.*[/\\]android[/\\]build[/\\].*/,
  /.*[/\\]android[/\\]app[/\\]build[/\\].*/,
  /.*[/\\]gradle-plugin[/\\]bin[/\\].*/,
  /.*[/\\]\.gradle[/\\].*/,
];

config.resolver.blockList = exclusionList;

module.exports = withNativeWind(config, { input: './global.css' });
