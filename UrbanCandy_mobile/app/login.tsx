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

import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/context/Theme';
import { loginUser } from '@/services/auth';
import api from '@/services/api';
import { useAppAlert } from '@/components/common/AppAlert';

export default function LoginScreen() {
    const router = useRouter();
    const { colors, font, fontSize, space, radius, sizes } = useTheme();
    const { showMessage } = useAppAlert();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const styles = StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContent: {
            flexGrow: 1,
        },
        container: {
            flex: 1,
            minHeight: 850,
            backgroundColor: colors.background,
            alignItems: 'center',
        },
        topDecoration: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 225,
            backgroundColor: colors.secondary,
            borderBottomLeftRadius: radius.xxl,
            borderBottomRightRadius: radius.xxl,
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
            marginBottom: space.xxl,
        },
        fieldContainer: {
            width: '100%',
            marginBottom: 25,
        },
        label: {
            fontSize: fontSize.lg,
            color: colors.text,
            marginBottom: 14,
            fontFamily: font.medium,
        },
        input: {
            width: '100%',
            height: sizes.inputHeight,
            backgroundColor: colors.white,
            borderRadius: radius.lg,
            paddingHorizontal: 18,
            fontSize: fontSize.lg,
            color: colors.text,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 6,
            elevation: 5,
        },
        loginButton: {
            width: 290,
            height: 54,
            marginTop: 65,
            backgroundColor: colors.primary,
            borderRadius: radius.lg,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 3 },
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
            fontSize: fontSize.lg,
            color: colors.white,
            fontFamily: font.semibold,
        },
    });

    async function handleLogin() {
        if (!email.trim() || !senha.trim()) {
            showMessage(
                'Atenção',
                'Preencha o email e a senha.',
                undefined,
                'warning'
            );
            return;
        }

        try {
            setLoading(true);

            const data = await loginUser(email.trim(), senha);

            const token =
                data?.token ??
                data?.accessToken ??
                data?.access_token;

            if (token) {
                await AsyncStorage.setItem('@UrbanCandy:token', token);
                api.defaults.headers.Authorization = `Bearer ${token}`;
            }

            const user = data?.user ?? data?.usuario ?? data;

            await AsyncStorage.setItem(
                '@UrbanCandy:user',
                JSON.stringify(user)
            );

            router.replace('/home');
        } catch (error: any) {
            showMessage(
                'Não foi possível entrar',
                error?.message || 'Verifique seu email e senha.',
                undefined,
                'error'
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
                    <View style={styles.topDecoration} />

                    <View style={styles.content}>
                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />

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

                            <TextInput
                                style={styles.input}
                                value={senha}
                                onChangeText={setSenha}
                                placeholder="Digite sua senha"
                                placeholderTextColor={colors.textTertiary}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!loading}
                            />
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
                                <ActivityIndicator
                                    size="small"
                                    color={colors.white}
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