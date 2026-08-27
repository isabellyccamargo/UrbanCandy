import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getAllTypeOfPayment, PaymentType } from '@/services/payment';
import { useTheme } from '@/context/Theme';

type PaymentMethodsProps = {
    selectedPayment: PaymentType | null;
    onSelect: (payment: PaymentType) => void;
};

export default function PaymentMethods({
    selectedPayment,
    onSelect,
}: PaymentMethodsProps) {
    const { colors, font, fontSize, space, radius } = useTheme();
    const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPaymentTypes();
    }, []);

    async function loadPaymentTypes() {
        try {
            setPaymentTypes(await getAllTypeOfPayment());
        } catch (error) {
            console.error('Erro ao carregar formas de pagamento:', error);
        } finally {
            setLoading(false);
        }
    }

    function getPaymentIcon(name: string) {
        const value = name.toLowerCase();

        if (value.includes('pix')) return 'qr-code-outline';
        if (value.includes('cartão') || value.includes('cartao')) return 'card-outline';
        if (value.includes('dinheiro')) return 'cash-outline';

        return 'wallet-outline';
    }

    function getPaymentDescription(name: string) {
        const value = name.toLowerCase();

        return value.includes('cartão') || value.includes('cartao')
            ? 'Parcelamos em até 3x'
            : '';
    }

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.white,
            borderRadius: radius.lg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 8,
        },
        loading: {
            paddingVertical: space.xxl,
            alignItems: 'center',
            justifyContent: 'center',
        },
        option: {
            minHeight: 56,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: space.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        lastOption: { borderBottomWidth: 0 },
        radio: {
            width: 18,
            height: 18,
            borderRadius: radius.circle,
            borderWidth: 2,
            borderColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: space.md,
        },
        radioSelected: { borderColor: colors.primary },
        radioInner: {
            width: 9,
            height: 9,
            borderRadius: radius.circle,
            backgroundColor: colors.primary,
        },
        icon: { marginRight: space.md },
        content: { flex: 1 },
        title: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.text,
        },
        description: {
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            marginTop: space.xs,
        },
    });

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loading}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {paymentTypes.map((payment, index) => {
                const selected = selectedPayment?.id_payment === payment.id_payment;
                const description = getPaymentDescription(payment.name_payment);

                return (
                    <Pressable
                        key={payment.id_payment}
                        style={[
                            styles.option,
                            index === paymentTypes.length - 1 && styles.lastOption,
                        ]}
                        onPress={() => onSelect(payment)}
                    >
                        <View style={[styles.radio, selected && styles.radioSelected]}>
                            {selected && <View style={styles.radioInner} />}
                        </View>

                        <Ionicons
                            name={getPaymentIcon(payment.name_payment)}
                            size={22}
                            color={colors.text}
                            style={styles.icon}
                        />

                        <View style={styles.content}>
                            <Text style={styles.title}>
                                {payment.name_payment}
                            </Text>

                            {description && (
                                <Text style={styles.description}>
                                    {description}
                                </Text>
                            )}
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
}