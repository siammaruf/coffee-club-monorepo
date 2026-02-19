import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { TitleBarProps } from '@/types/common';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TitleBar({ showUserInfo = true }: TitleBarProps) {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    const handlePrinterSettings = () => {
        router.push('/(app)/printer');
    };

    return (
        <View
            className="absolute top-0 left-0 right-0 bg-[#F3FAF9] px-4 pt-[16px] pb-[8px] flex-row items-center justify-between z-50 border-b border-gray-200"
            style={insets.top ? { paddingTop: insets.top } : undefined}
        >
            <View className="flex-row items-center">
                {showUserInfo && user && (
                    <>
                        <Image
                            source={
                                user.picture
                                    ? { uri: user.picture }
                                    : require('@/assets/images/profile.png')
                            }
                            className="w-[40px] h-[40px] rounded-full"
                        />
                        <View className="ml-3">
                            <Text className="text-gray-500 text-xs">Welcome back</Text>
                            <Text className="text-gray-800 text-sm font-semibold">
                                {`${user.first_name} ${user.last_name}` || 'User'}
                            </Text>
                        </View>
                    </>
                )}
            </View>

            <View className="flex-row items-center">
                <TouchableOpacity
                    onPress={handlePrinterSettings}
                    className="flex-row items-center px-3 py-2 rounded-full bg-blue-100 mr-2"
                >
                    <Ionicons name="print-outline" size={16} color="#2563EB" />
                    <Text className="text-xs font-medium ml-1 text-blue-600">Printer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleLogout}
                    disabled={isLoading}
                    className={`flex-row items-center px-3 py-2 rounded-full ${
                        isLoading ? 'bg-gray-100' : 'bg-red-50'
                    }`}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={16}
                        color={isLoading ? "#9CA3AF" : "#EF4444"}
                    />
                    <Text className={`text-xs font-medium ml-1 ${
                        isLoading ? 'text-gray-400' : 'text-red-500'
                    }`}>
                        {isLoading ? 'Logging out...' : 'Logout'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
