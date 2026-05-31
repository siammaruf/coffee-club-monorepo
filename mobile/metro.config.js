const path = require("path");
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

const finalConfig = withNativeWind(config, { 
  input: './global.css',
});

// Fix 1: react-native-css-interop stores cssInterop_outputDirectory as a relative path,
// but Metro passes absolute paths to the transformer. Force it to absolute.
if (finalConfig.transformer?.cssInterop_outputDirectory) {
  finalConfig.transformer.cssInterop_outputDirectory = path.resolve(
    finalConfig.transformer.cssInterop_outputDirectory
  );
}

module.exports = finalConfig;
