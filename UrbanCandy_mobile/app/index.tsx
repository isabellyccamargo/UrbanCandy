import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function IndexScreen() {
    const router = useRouter();
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 6,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            router.replace('/welcome');
        }, 1800);

        return () => {
            clearTimeout(timer);
        };
    }, [opacity, router, scale]);

    return (
        <ThemedView style={styles.container}>
            <Animated.Image
                source={require('@/assets/images/icon.png')}
                style={[styles.logo, { opacity, transform: [{ scale }] }]}
            />
            <Animated.View style={{ opacity, transform: [{ scale }] }}>
                <ThemedText type="title" style={styles.title}>
                    UrbanCandy
                </ThemedText>
                <ThemedText style={styles.subtitle}>Doces que conquistam corações</ThemedText>
            </Animated.View>
            <StatusBar style="auto" />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#FDE8F0',
    },
    logo: {
        width: 160,
        height: 160,
        marginBottom: 24,
        borderRadius: 100,
    },
    title: {
        marginBottom: 12,
        textAlign: 'center',
        color: '#3B1E36',
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 18,
        lineHeight: 26,
        color: '#5F2B4F',
    },
});
