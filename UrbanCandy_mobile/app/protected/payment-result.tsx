import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/Theme';
import {
    getPaymentCheckoutStatus,
    PaymentCheckoutStatus,
} from '@/services/payment';

export default function PaymentResultScreen() {
    const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
    const router = useRouter();
    const { clearCart } = useCart();
    const { colors, font, fontSize, space, radius, sizes } = useTheme();
    const [status, setStatus] = useState<PaymentCheckoutStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const requestInProgress = useRef(false);
    const isTerminal = useRef(false);

    const refreshStatus = useCallback(async () => {
        if (requestInProgress.current || isTerminal.current) return;
        if (!attemptId) {
            setError('Não foi possível identificar este pagamento.');
            setLoading(false);
            return;
        }

        requestInProgress.current = true;
        setRefreshing(true);
        try {
            const result = await getPaymentCheckoutStatus(attemptId);
            setStatus(result);
            setError(null);
            if (result.status === 'approved') {
                isTerminal.current = true;
                clearCart();
            } else if (
                result.status === 'rejected' ||
                result.status === 'cancelled' ||
                result.status === 'failed'
            ) {
                isTerminal.current = true;
            }
        } catch (requestError) {
            console.error(
                'Não foi possível consultar o pagamento:',
                requestError,
            );
            setError(
                'Não foi possível consultar o pagamento agora. Tente novamente.',
            );
        } finally {
            requestInProgress.current = false;
            setLoading(false);
            setRefreshing(false);
        }
    }, [attemptId, clearCart]);

    useEffect(() => {
        const initialCheck = setTimeout(() => void refreshStatus(), 0);
        const interval = setInterval(() => void refreshStatus(), 7000);
        return () => {
            clearTimeout(initialCheck);
            clearInterval(interval);
        };
    }, [refreshStatus]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            padding: space.xl,
        },
        icon: { marginBottom: space.lg },
        title: {
            color: colors.text,
            fontFamily: font.bold,
            fontSize: fontSize.xl,
            textAlign: 'center',
            marginBottom: space.sm,
        },
        message: {
            color: colors.textSecondary,
            fontFamily: font.regular,
            fontSize: fontSize.md,
            textAlign: 'center',
            marginBottom: space.xl,
        },
        button: {
            minHeight: sizes.buttonHeight,
            minWidth: '75%',
            borderRadius: radius.pill,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: space.xl,
        },
        buttonText: {
            color: colors.white,
            fontFamily: font.semibold,
            fontSize: fontSize.md,
        },
        secondaryButton: {
            padding: space.lg,
            marginTop: space.sm,
        },
        secondaryText: {
            color: colors.primary,
            fontFamily: font.semibold,
            fontSize: fontSize.md,
        },
    });

    const isApproved = status?.status === 'approved';
    const isFinalFailure =
        status?.status === 'rejected' ||
        status?.status === 'cancelled' ||
        status?.status === 'failed';

    let title = 'Aguardando confirmação';
    let message =
        'Assim que o Mercado Pago confirmar, seu pedido será criado. Esta tela atualiza automaticamente.';
    let icon: keyof typeof Ionicons.glyphMap = 'time-outline';
    let iconColor = colors.primary;

    if (isApproved) {
        title = 'Pagamento aprovado!';
        message = `Seu pedido #${status?.id_order} foi confirmado e já pode ser acompanhado no app.`;
        icon = 'checkmark-circle-outline';
        iconColor = colors.success;
    } else if (isFinalFailure) {
        title = 'Pagamento não aprovado';
        message =
            'O pedido não foi confirmado. Volte ao checkout para tentar outra forma de pagamento.';
        icon = 'close-circle-outline';
        iconColor = colors.danger;
    } else if (error) {
        message = error;
        icon = 'alert-circle-outline';
        iconColor = colors.danger;
    }

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : (
                <>
                    <Ionicons
                        name={icon}
                        size={64}
                        color={iconColor}
                        style={styles.icon}
                    />
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    {status?.status === 'pending' && (
                        <Pressable
                            style={styles.button}
                            onPress={() => void refreshStatus()}
                            disabled={refreshing}
                        >
                            <Text style={styles.buttonText}>
                                {refreshing
                                    ? 'Consultando...'
                                    : 'Verificar agora'}
                            </Text>
                        </Pressable>
                    )}
                    {isApproved && (
                        <Pressable
                            style={styles.button}
                            onPress={() => router.replace('/protected/orders')}
                        >
                            <Text style={styles.buttonText}>
                                Ver meus pedidos
                            </Text>
                        </Pressable>
                    )}
                    {isFinalFailure && (
                        <Pressable
                            style={styles.button}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.buttonText}>
                                Voltar ao checkout
                            </Text>
                        </Pressable>
                    )}
                    {!isApproved && !isFinalFailure && (
                        <Pressable
                            style={styles.secondaryButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.secondaryText}>
                                Voltar ao pagamento
                            </Text>
                        </Pressable>
                    )}
                </>
            )}
        </View>
    );
}
