import { Text, type TextProps } from 'react-native';
import { cssInterop } from 'nativewind';

function PriceTextBase({ style, ...props }: TextProps) {
  return <Text {...props} style={[style, { fontFamily: 'NotoSansBengali' }]} />;
}

export const PriceText = cssInterop(PriceTextBase, { className: 'style' });
