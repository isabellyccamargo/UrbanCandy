import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useTheme } from '@/context/Theme';
import { useAppAlert } from '@/components/common/AppAlert';
import { confirmEmailVerification } from '@/services/auth';

export default function EmailConfirmationScreen() {
    const router = useRouter();
    const { colors, font, fontSize, space, radius } = useTheme();
    const { showMessage } = useAppAlert();
    const { email = '', queued = '0' } = useLocalSearchParams<{
        email?: string;
        queued?: string;
    }>();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    async function confirm() {
        if (code.length !== 6) {
            showMessage('Código incompleto', 'Digite os 6 números enviados por e-mail.', undefined, 'warning');
            return;
        }
        setLoading(true);
        try {
            await confirmEmailVerification(email, code);
            showMessage('E-mail confirmado', 'Agora você receberá atualizações dos pedidos.', undefined, 'success');
            router.replace('/login' as any);
        } catch (error: any) {
            showMessage(
                'Não foi possível confirmar',
                error?.response?.data?.message ?? error?.message ?? 'Confira o código e tente novamente.',
                undefined,
                'error'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background, padding: space.lg }]}>
            <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: fontSize.xl }}>
                Confirme seu e-mail
            </Text>
            <Text style={{ color: colors.text, fontFamily: font.regular, marginTop: space.md }}>
                {queued === '2'
                    ? `${email} já está confirmado. Você receberá atualizações dos pedidos.`
                    : queued === '1'
                    ? `Enviamos um código de 6 dígitos para ${email}.`
                    : 'Sua conta foi criada, mas não foi possível enfileirar o e-mail. Entre na conta e solicite o código em Meus Dados.'}
            </Text>
            {queued === '1' && (
                <>
                    <TextInput
                        value={code}
                        onChangeText={value => setCode(value.replace(/\D/g, '').slice(0, 6))}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoComplete="one-time-code"
                        placeholder="Código de 6 dígitos"
                        style={[
                            styles.input,
                            {
                                color: colors.text,
                                borderColor: colors.border,
                                borderRadius: radius.md,
                                marginTop: space.lg,
                            },
                        ]}
                    />
                    <Pressable
                        disabled={loading}
                        onPress={() => void confirm()}
                        style={[styles.button, { backgroundColor: colors.primary, borderRadius: radius.md, marginTop: space.md }]}
                    >
                        <Text style={{ color: '#fff', fontFamily: font.bold }}>
                            {loading ? 'Confirmando...' : 'Confirmar e-mail'}
                        </Text>
                    </Pressable>
                </>
            )}
            <Pressable onPress={() => router.replace('/login' as any)} style={{ marginTop: space.lg }}>
                <Text style={{ color: colors.primary, fontFamily: font.medium }}>Ir para entrar</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    input: { borderWidth: 1, padding: 14, fontSize: 18, letterSpacing: 6 },
    button: { alignItems: 'center', padding: 14 },
});
