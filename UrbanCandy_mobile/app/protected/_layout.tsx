
import { Redirect, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function ProtectedLayout() {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        checkAuthentication();
    }, []);

    async function checkAuthentication() {
        try {
            const token = await AsyncStorage.getItem(
                '@UrbanCandy:token'
            );

            setLoggedIn(!!token);
        } catch {
            setLoggedIn(false);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return null;
    }

    if (!loggedIn) {
        return <Redirect href="/login" />;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}
