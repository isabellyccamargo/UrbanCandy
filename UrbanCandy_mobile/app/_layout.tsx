import { Stack } from 'expo-router';

import { ThemeProvider } from '@/context/Theme';
import { AppAlertProvider } from '@/components/common/AppAlert';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';

export default function RootLayout() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <AppAlertProvider>
                    <NotificationProvider>
                        <CartProvider>
                            <Stack screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="index" />
                                <Stack.Screen name="login" />
                                <Stack.Screen name="welcome" />
                                <Stack.Screen name="cadastro" />
                                <Stack.Screen name="email-confirmation" />
                                <Stack.Screen name="protected" />
                                <Stack.Screen name="cart" />
                            </Stack>
                        </CartProvider>
                    </NotificationProvider>
                </AppAlertProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}