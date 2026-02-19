import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  '`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method',
  '`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method',
  '[Storage] react-native-mmkv unavailable',
]);
