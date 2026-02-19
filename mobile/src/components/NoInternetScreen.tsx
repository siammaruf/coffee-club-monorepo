import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

export default function NoInternetScreen() {
    return (
        <View className="flex-1 justify-center items-center bg-[#F3FAF9] px-6">
            <Image
                source={require('@/assets/images/no-internet.png')}
                className="w-32 h-32 mb-6"
                resizeMode="contain"
            />
            <Text className="text-2xl text-[#EF4444] mb-1 tracking-wide">
                Coffee Club Go
            </Text>
            <Text className="text-lg text-[#EF4444]">
                No Internet Connection
            </Text>
            <Text className="text-base text-gray-500 text-center mb-4">
                Please check your network settings and try again.
            </Text>
            <TouchableOpacity
                className="bg-[#EF4444] py-2 px-7 rounded-2xl mt-2 shadow"
                activeOpacity={0.7}
            >
                <Text className="text-white text-base">
                    Retry
                </Text>
            </TouchableOpacity>
        </View>
    );
}
