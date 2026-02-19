import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardTypeOptions } from 'react-native';
import { InputFieldProps as OriginalInputFieldProps } from '@/types/inputs';
import { Ionicons } from '@expo/vector-icons';

type InputFieldProps = Omit<OriginalInputFieldProps, 'keyboardType' | 'autoCapitalize' | 'autoCorrect'> & {
    keyboardType?: KeyboardTypeOptions;
    onBlur?: () => void;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
};

export default function InputField({
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    showPasswordToggle = false,
    value,
    onChangeText,
    onBlur,
    editable = true,
    autoCapitalize = 'none',
    autoCorrect = false,
    style
}: InputFieldProps & { style?: any }) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        onBlur?.();
    };

    return (
        <View className="relative">
            <TextInput
                placeholder={placeholder}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry && !isPasswordVisible}
                value={value}
                onChangeText={onChangeText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                editable={editable}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect}
                className={`w-full bg-gray-50 border border-gray-200 rounded-full py-4 px-6 ${
                    showPasswordToggle && secureTextEntry ? 'pr-12' : 'pr-6'
                } mb-4 text-base ${
                    isFocused ? 'border-orange-500' : 'border-gray-200'
                }`}
                placeholderTextColor="#9CA3AF"
                style={style}
            />

            {showPasswordToggle && secureTextEntry && (
                <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    className="absolute right-4 top-4"
                    disabled={!editable}
                >
                    <Ionicons
                        name={isPasswordVisible ? 'eye-off' : 'eye'}
                        size={20}
                        color="#9CA3AF"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}
