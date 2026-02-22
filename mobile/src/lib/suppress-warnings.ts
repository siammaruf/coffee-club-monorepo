import { LogBox } from 'react-native';

// Suppress console warnings (Metro terminal output)
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = typeof args[0] === 'string' ? args[0] : '';
  if (message.includes('SafeAreaView has been deprecated')) return;
  originalWarn(...args);
};

// Suppress in-app LogBox warnings
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  '`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method',
  '`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method',
  '[Storage] react-native-mmkv unavailable',
]);
