import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';

const iconMapping: Record<string, { active: string; inactive: string }> = {
  index: { active: 'home', inactive: 'home-outline' },
  orders: { active: 'receipt', inactive: 'receipt-outline' },
  expenses: { active: 'wallet', inactive: 'wallet-outline' },
  reports: { active: 'bar-chart', inactive: 'bar-chart-outline' },
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = iconMapping[route.name] || iconMapping['index'];
          const iconName = focused ? icons.active : icons.inactive;
          return (
            <Ionicons name={iconName as any} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 3,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' as const },
        headerShown: false,
        tabBarButton: HapticTab,
      })}>
      <Tabs.Screen name="index" options={{ tabBarLabel: 'Home' }} />
      <Tabs.Screen name="orders" options={{ tabBarLabel: 'Orders' }} />
      <Tabs.Screen name="expenses" options={{ tabBarLabel: 'Expenses' }} />
      <Tabs.Screen name="reports" options={{ tabBarLabel: 'Reports' }} />
    </Tabs>
  );
}
