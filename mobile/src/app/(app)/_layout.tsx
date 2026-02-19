import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="orders/create" />
      <Stack.Screen name="orders/edit" />
      <Stack.Screen name="orders/[id]" />
      <Stack.Screen name="customers/index" />
      <Stack.Screen name="customers/[id]" />
      <Stack.Screen name="products/index" />
      <Stack.Screen name="products/[id]" />
      <Stack.Screen name="tables/index" />
      <Stack.Screen name="expenses/create" />
      <Stack.Screen name="expenses/edit" />
      <Stack.Screen name="expenses/[id]" />
      <Stack.Screen name="reports/[id]" />
      <Stack.Screen name="printer/index" />
    </Stack>
  );
}
