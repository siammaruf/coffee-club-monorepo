import { Text, TextInput } from 'react-native';

const FONT_FAMILY = 'NotoSansBengali';

// Set default fontFamily on all Text and TextInput components
// so that the Bengali Taka symbol (৳) renders correctly on all devices
const textDefaults = (Text as any).defaultProps || {};
(Text as any).defaultProps = {
  ...textDefaults,
  style: [{ fontFamily: FONT_FAMILY }, textDefaults.style].filter(Boolean),
};

const inputDefaults = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps = {
  ...inputDefaults,
  style: [{ fontFamily: FONT_FAMILY }, inputDefaults.style].filter(Boolean),
};
