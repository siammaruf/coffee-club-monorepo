import { TouchableOpacity, Text } from 'react-native';
import { ButtonProps } from '@/types/buttons';

export default function Button({ title, onPress, variant = 'primary', className }: ButtonProps) {
    return (
        <TouchableOpacity
            className={`rounded-[10px] py-[14px] w-full ${
                variant === 'primary' ? 'bg-[#4CAF50]' : 'bg-white border border-gray-300'
            } ${className || ''}`}
            onPress={onPress}
        >
            <Text
                className={`text-center font-bold text-[16px] ${
                    variant === 'primary' ? 'text-white' : 'text-gray-700'
                }`}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}
