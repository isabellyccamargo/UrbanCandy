import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';

import {
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';

import { CartProvider } from '@/context/CartContext';

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Quicksand_400Regular,
        Quicksand_500Medium,
        Quicksand_600SemiBold,
        Quicksand_700Bold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <CartProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            />
        </CartProvider>
    );
}