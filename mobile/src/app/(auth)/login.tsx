import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, Alert, BackHandler } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import InputField from '@/components/common/InputField';
import type { LoginFormData } from '@/types/auth';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import NoInternetScreen from '@/components/NoInternetScreen';

export default function LoginScreen() {
    const { login, isLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [isConnected, setIsConnected] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                Alert.alert(
                    'Exit App',
                    'Are you sure you want to exit?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() }
                    ]
                );
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? true);
        });
        return () => unsubscribe();
    }, []);


    const handleSignIn = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const credentials: LoginFormData = {
            username: username.trim(),
            password: password,
            rememberMe: rememberMe,
        };

        try {
            await login(credentials);
        } catch (error: any) {
            if (!error.message.includes('Access denied')) {
                Alert.alert('Login Failed', error.message || 'An error occurred during login');
            }
        }
    };

    if (!isConnected) {
        return <NoInternetScreen />;
    }

    return (
        <View className="flex-1">
            {/* Header Section */}
            <ImageBackground
                source={require('@/assets/images/main-bg.png')}
                className="h-[200px] justify-center items-center relative"
                resizeMode="cover"
            >
                <View className="absolute inset-0 bg-black opacity-50" />
                <View className="items-center justify-center z-10">
                    <View className="w-24 h-24 items-center justify-center mb-2 shadow-lg">
                        <Image
                            source={require('@/assets/images/coffee-club-logo.png')}
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                    </View>
                    <Text className="text-white text-3xl font-bold tracking-wide text-center shadow-lg">
                        Coffee Club Go
                    </Text>
                    <Text className="text-white text-sm opacity-90 mt-1">
                        Drinks & Food
                    </Text>
                </View>
            </ImageBackground>

            {/* Content Section */}
            <View className="flex-1 bg-white px-6 pt-8">
                <Text className="text-3xl font-bold text-gray-800 mb-4">
                    Login Account
                </Text>

                {/* Username Input */}
                <View className="mb-4">
                    <Text className="text-gray-600 text-sm mb-2">Username</Text>
                    <InputField
                        placeholder="Your mobile number or email"
                        keyboardType="default"
                        value={username}
                        onChangeText={setUsername}
                        editable={!isLoading}
                    />
                </View>

                {/* Password Input */}
                <View className="mb-4">
                    <Text className="text-gray-600 text-sm mb-2">Password</Text>
                    <InputField
                        placeholder="------------"
                        secureTextEntry
                        showPasswordToggle
                        value={password}
                        onChangeText={setPassword}
                        editable={!isLoading}
                        style={{ color: '#000' }}
                    />
                </View>

                {/* Remember Me Checkbox */}
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity
                        className={`w-5 h-5 border-2 border-gray-300 rounded mr-2 items-center justify-center ${
                            rememberMe ? 'bg-orange-500 border-orange-500' : 'bg-white'
                        }`}
                        onPress={() => setRememberMe(!rememberMe)}
                        disabled={isLoading}
                    >
                        {rememberMe && (
                            <Text className="text-white text-xs">&#x2713;</Text>
                        )}
                    </TouchableOpacity>
                    <Text className="text-gray-600 text-sm">Remember Me</Text>
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                    className={`rounded-full py-4 items-center mb-6 ${
                        isLoading ? 'bg-gray-400' : 'bg-orange-500'
                    }`}
                    onPress={handleSignIn}
                    disabled={isLoading}
                >
                    <Text className="text-white text-lg font-semibold">
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
