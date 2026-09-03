import { Stack } from 'expo-router';

import { ThemeProvider } from '@/context/Theme';
import { AppAlertProvider } from '@/components/common/AppAlert';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <AppAlertProvider>
                    <CartProvider>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="index" />
                            <Stack.Screen name="login" />
                            <Stack.Screen name="welcome" />
                            <Stack.Screen name="cadastro" />
                            <Stack.Screen name="protected" />
                        </Stack>
                    </CartProvider>
                </AppAlertProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}