import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect, Stack, usePathname } from 'expo-router';
import { getAuthUserRole, useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/Theme';

export default function ProtectedLayout() {
  const { user, loading, error } = useAuth();
  const { colors, font, fontSize, space } = useTheme();
  const pathname = usePathname();
  const role = getAuthUserRole(user);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { padding: space.xl }]}>
        <Text
          style={{
            color: colors.text,
            fontFamily: font.regular,
            fontSize: fontSize.md,
            textAlign: 'center',
          }}
        >
          {error}
        </Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const isManagerRoute = pathname === '/protected/dashboard';
  const isEmployeeRoute = pathname.startsWith('/protected/employeeOrders');

  if (isManagerRoute && role !== 'manager') {
    return (
      <Redirect
        href={role === 'employee' ? '/protected/employeeOrders' : '/protected/home'}
      />
    );
  }

  if (isEmployeeRoute && role !== 'employee') {
    return (
      <Redirect
        href={role === 'manager' ? '/protected/dashboard' : '/protected/home'}
      />
    );
  }

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

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});