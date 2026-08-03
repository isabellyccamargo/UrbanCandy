import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function handleLogin() {
        router.replace('/home');
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
                Bem-vindo de volta
            </ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
                Entre na sua conta para continuar
            </ThemedText>

            <View style={styles.form}>
                <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="seu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Input
                    label="Senha"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="********"
                    secureTextEntry
                />
                <Button title="Entrar" onPress={handleLogin} style={styles.button} />
            </View>

            <View style={styles.footer}>
                <ThemedText>Não tem uma conta?</ThemedText>
                <Link href="/signup" style={styles.link}>
                    <ThemedText type="link">Crie agora</ThemedText>
                </Link>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        marginBottom: 8,
    },
    subtitle: {
        marginBottom: 24,
    },
    form: {
        gap: 16,
    },
    button: {
        marginTop: 16,
    },
    footer: {
        marginTop: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    link: {
        justifyContent: 'center',
    },
});
