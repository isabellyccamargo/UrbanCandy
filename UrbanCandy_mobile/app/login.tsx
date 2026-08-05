import { useState } from 'react';
import {
    StyleSheet,
    View,
    Image,
    TextInput,
    Pressable,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Fonts } from '@/constants/fonts';

import { loginUser } from '@/services/auth';

export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        // Validação básica
        if (!email.trim() || !senha.trim()) {
            Alert.alert(
                'Atenção',
                'Preencha o email e a senha.'
            );
            return;
        }

        try {
            setLoading(true);

            const data = await loginUser(
                email.trim(),
                senha
            );

            console.log('Login realizado:', data);

            // Depois que o backend confirmar o login,
            // vamos para a Home.
            router.replace('/home');

        } catch (error: any) {
            console.error('Erro no login:', error);

            Alert.alert(
                'Não foi possível entrar',
                error.message || 'Verifique seu email e senha.'
            );

        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar style="dark" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>

                    {/* Faixa rosa do topo */}
                    <View style={styles.topDecoration} />

                    {/* Conteúdo */}
                    <View style={styles.content}>

                        {/* Logo */}
                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />

                        {/* Campo Email */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>
                                Email
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Digite seu email"
                                placeholderTextColor="#999999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!loading}
                            />
                        </View>

                        {/* Campo Senha */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>
                                Senha
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={senha}
                                onChangeText={setSenha}
                                placeholder="Digite sua senha"
                                placeholderTextColor="#999999"
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!loading}
                            />
                        </View>

                        {/* Botão Entrar */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.loginButton,
                                pressed && !loading && styles.loginButtonPressed,
                                loading && styles.loginButtonLoading,
                            ]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />
                            ) : (
                                <Text style={styles.loginButtonText}>
                                    Entrar
                                </Text>
                            )}
                        </Pressable>

                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },

    scrollContent: {
        flexGrow: 1,
    },

    container: {
        flex: 1,
        minHeight: 850,
        backgroundColor: '#F7F7F7',
        alignItems: 'center',
    },

    topDecoration: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 225,

        backgroundColor: '#E7C9DA',

        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },

    content: {
        width: '100%',
        maxWidth: 520,
        paddingHorizontal: 72,
        paddingTop: 165,
        alignItems: 'center',
    },

    logo: {
        width: 125,
        height: 155,
        marginBottom: 28,
    },

    fieldContainer: {
        width: '100%',
        marginBottom: 25,
    },

    label: {
        fontSize: 20,
        color: '#000000',
        marginBottom: 14,
        fontFamily: Fonts.medium,
    },

    input: {
        width: '100%',
        height: 50,

        backgroundColor: '#FFFFFF',

        borderRadius: 18,

        paddingHorizontal: 18,

        fontSize: 18,
        color: '#3B1E36',

        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.18,
        shadowRadius: 6,

        elevation: 5,
    },

    loginButton: {
        width: 290,
        height: 54,

        marginTop: 65,

        backgroundColor: '#DD2E8A',

        borderRadius: 18,

        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.18,
        shadowRadius: 5,

        elevation: 4,
    },

    loginButtonPressed: {
        opacity: 0.75,
        transform: [{ scale: 0.98 }],
    },

    loginButtonLoading: {
        opacity: 0.7,
    },

    loginButtonText: {
        fontSize: 20,
        color: '#FFFFFF',
        fontFamily: Fonts.semibold,
    },
});