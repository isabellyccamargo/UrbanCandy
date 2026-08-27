import { StyleSheet, View, Image } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { Fonts } from '@/constants/fonts';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>

                {/* LOGO */}
                <Image
                    source={require('@/assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                {/* FRASE */}
                <ThemedText style={styles.subtitle}>
                    Doces que conquistam corações
                </ThemedText>

                {/* BOTÕES */}
                <View style={styles.actions}>

                    <Button
                        title="Login"
                        onPress={() => router.push('/login')}
                    />

                    <Button
                        title="Cadastrar-se"
                        variant="secondary"
                        onPress={() => router.push('/')}
                    />

                </View>

            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    content: {
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
    },

    logo: {
        width: 170,
        height: 170,
        marginBottom: 18,
    },

    subtitle: {
        color: '#5F2B4F',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 30,
        fontFamily: Fonts.regular,
    },

    actions: {
        width: '100%',
        gap: 14,
    },
});