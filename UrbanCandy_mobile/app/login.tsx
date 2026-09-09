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
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/context/Theme';
import { loginUser } from '@/services/auth';
import { useAppAlert } from '@/components/common/AppAlert';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { colors, font, fontSize, space, radius, sizes } = useTheme();
    const { showMessage } = useAppAlert();
    const { setUser } = useAuth();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Estado para alternar o olho
    const [loading, setLoading] = useState(false);

    const styles = StyleSheet.create({
        screen: { flex: 1, backgroundColor: colors.background },
        scrollContent: { flexGrow: 1 },
        container: { flex: 1, minHeight: 850, backgroundColor: colors.background, alignItems: 'center' },
        topDecoration: {
            position: 'absolute', top: 0, left: 0, right: 0, height: 225,
            backgroundColor: colors.secondary, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl,
        },
        backButton: {
            position: 'absolute',
            left: space.xl,
            top: 60,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
        },
        content: { width: '100%', maxWidth: 520, paddingHorizontal: 72, paddingTop: 165, alignItems: 'center' },
        logo: { width: 125, height: 155, marginBottom: space.xxl },
        fieldContainer: { width: '100%', marginBottom: 25 },
        label: { fontSize: fontSize.lg, color: colors.text, marginBottom: 14, fontFamily: font.medium },
        input: {
            width: '100%', height: sizes.inputHeight, backgroundColor: colors.white,
            borderRadius: radius.lg, paddingHorizontal: 18, fontSize: fontSize.lg,
            color: colors.text, elevation: 5,
        },
        passwordContainer: {
            position: 'relative',
            width: '100%',
            justifyContent: 'center',
        },
        passwordInput: {
            paddingRight: 50, // Espaço para não sobrepor o texto ao ícone do olho
        },
        eyeButton: {
            position: 'absolute',
            right: 15,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 5,
        },
        loginButton: {
            width: 290, height: 54, marginTop: 65, backgroundColor: colors.primary,
            borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', elevation: 4,
        },
        loginButtonPressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
        loginButtonLoading: { opacity: 0.7 },
        loginButtonText: { fontSize: fontSize.lg, color: colors.white, fontFamily: font.semibold },
    });

    const handleLogin = async () => {
        if (!email.trim() || !senha.trim()) {
            showMessage({
                title: 'Atenção',
                message: 'Preencha todos os campos para continuar.',
                type: 'warning',
            });
            return;
        }

        setLoading(true);

        try {
            const response = await loginUser(email, senha);

            const token = response?.token || response?.accessToken;
            const userObj = response?.user || response?.usuario || response;

            if (token) {
                await AsyncStorage.setItem('@UrbanCandy:token', token);
                await AsyncStorage.setItem('token', token);
                
                if (userObj) {
                    await AsyncStorage.setItem('@UrbanCandy:user', JSON.stringify(userObj));
                    await AsyncStorage.setItem('user', JSON.stringify(userObj));
                    setUser(userObj);
                }

                router.replace('/protected/home');
            } else {
                showMessage({
                    title: 'Erro de Autenticação',
                    message: response?.message || 'Email ou senha inválidos.',
                    type: 'error',
                });
            }
        } catch (error: any) {
            console.error('Erro ao efetuar login:', error);
            showMessage({
                title: 'Erro de Conexão',
                message: error?.message || error?.response?.data?.message || 'Não foi possível se conectar ao servidor.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.topDecoration} />

                    <Pressable
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={26}
                            color={colors.white}
                        />
                    </Pressable>

                    <View style={styles.content}>
                        <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />

                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Digite seu email"
                                placeholderTextColor={colors.textTertiary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Senha</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    value={senha}
                                    onChangeText={setSenha}
                                    placeholder="Digite sua senha"
                                    placeholderTextColor={colors.textTertiary}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!loading}
                                />
                                <Pressable
                                    onPress={() => setShowPassword((prev) => !prev)}
                                    style={styles.eyeButton}
                                    hitSlop={10}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={24}
                                        color={colors.textTertiary}
                                    />
                                </Pressable>
                            </View>
                        </View>

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
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <Text style={styles.loginButtonText}>Entrar</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}