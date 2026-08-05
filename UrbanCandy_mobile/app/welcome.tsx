import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function WelcomeScreen() {
    return (
        <ThemedView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.logoContainer}>
                    <ThemedText type="title" style={styles.brandText}>
                        Urban
                    </ThemedText>
                    <ThemedText type="title" style={[styles.brandText, styles.brandHighlight]}>
                        Candy
                    </ThemedText>
                </View>
                <ThemedText type="subtitle" style={styles.subtitle}>
                    Doces que conquistam corações
                </ThemedText>
                <View style={styles.actions}>
                    <Link href="/login" style={styles.buttonWrapper}>
                        <Button title="Login" />
                    </Link>
                    <Link href="/signup" style={styles.buttonWrapper}>
                        <Button title="Cadastrar-se" variant="secondary" />
                    </Link>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3D6E7',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
        elevation: 10,
        gap: 24,
    },
    logoContainer: {
        alignItems: 'center',
        gap: 8,
        paddingTop: 10,
    },
    brandText: {
        color: '#3B1E36',
    },
    brandHighlight: {
        color: '#FF2E86',
    },
    subtitle: {
        color: '#5F2B4F',
        textAlign: 'center',
        lineHeight: 24,
    },
    actions: {
        width: '100%',
        gap: 14,
    },
    buttonWrapper: {
        width: '100%',
    },
});
