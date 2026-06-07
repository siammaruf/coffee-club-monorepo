import '../lib/suppress-warnings';
import '../lib/font-setup';
import React from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ReduxProvider from '@/redux/store';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '../lib/nativewind-setup';
import '../../global.css';

SplashScreen.preventAutoHideAsync();

const LOADING_TEXT = 'COFFEE CLUB GO';

const LoadingScreen = () => {
  const anims = useRef(
    LOADING_TEXT.split('').map(() => new Animated.Value(1)),
  ).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [];
    anims.forEach((anim, idx) => {
      const animation = Animated.loop(
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
      );
      animation.start();
      animations.push(animation);
    });

    return () => {
      animations.forEach(anim => anim.stop());
    };
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

  const inAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, inAuthGroup]);

  // Keep loading screen until auth is resolved AND we know which screen to show.
  // This prevents the dashboard from flashing before redirecting to login.
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated && !inAuthGroup) return <LoadingScreen />;

  return <Slot />;
}

export default function RootLayout() {
  // Fonts are preloaded at build time by the expo-font plugin in app.json.
  // Do NOT use useFonts() here — it causes the font to fail in production builds.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <ReduxProvider>
        <AuthProvider>
          <SafeAreaProvider>
            <RootLayoutNav />
          </SafeAreaProvider>
        </AuthProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}
