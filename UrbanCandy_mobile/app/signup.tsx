import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SignupScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function handleCreateAccount() {
        router.replace('/home');
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
                Crie sua conta
            </ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
                Preencha os dados para começar
            </ThemedText>

            <View style={styles.form}>
                <Input label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
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
                <Button title="Cadastrar" onPress={handleCreateAccount} style={styles.button} />
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
});
