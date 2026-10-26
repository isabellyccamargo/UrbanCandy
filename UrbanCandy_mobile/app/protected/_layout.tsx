import { Stack } from 'expo-router';

export default function ProtectedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="employeeOrders" />
      <Stack.Screen name="home" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="payment-result" />
      <Stack.Screen name="cardapio" />
    </Stack>
  );
}