import '../lib/suppress-warnings';
import '../lib/font-setup';
import React from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ReduxProvider from '@/redux/store';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import '../lib/nativewind-setup';
import '../../global.css';

SplashScreen.preventAutoHideAsync();

const LOADING_TEXT = 'COFFEE CLUB GO';

const LoadingScreen = () => {
  const anims = useRef(
    LOADING_TEXT.split('').map(() => new Animated.Value(1)),
  ).current;

  useEffect(() => {
    anims.forEach((anim, idx) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(idx * 60),
          Animated.timing(anim, {
            toValue: 1.4,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.in(Easing.quad),
          }),
        ]),
      ).start();
    });
  }, [anims]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3b32aff',
      }}>
      <View style={{ flexDirection: 'row' }}>
        {LOADING_TEXT.split('').map((char, idx) => (
          <Animated.Text
            key={idx}
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              letterSpacing: 2,
              color: '#fff',
              transform: [{ scale: anims[idx] }],
            }}>
            {char === ' ' ? '\u00A0' : char}
          </Animated.Text>
        ))}
      </View>
      <Text style={{ fontSize: 16, color: '#fff', marginTop: 4 }}>
        Please wait...
      </Text>
    </View>
  );
};

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) return <LoadingScreen />;

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    NotoSansBengali: require('../../assets/fonts/NotoSansBengali-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Timeout fallback: force-hide splash after 5s if font loading hangs
  useEffect(() => {
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ReduxProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <RootLayoutNav />
        </SafeAreaProvider>
      </AuthProvider>
    </ReduxProvider>
  );
}
