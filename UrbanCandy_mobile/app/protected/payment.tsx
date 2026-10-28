import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/Theme';
import { getUserProfile, UserProfile } from '@/services/auth';
import { createOrder } from '@/services/orders';
import {
    createPaymentCheckout,
    getPaymentMethodKind,
    getPaymentCheckoutStatus,
    PaymentCheckoutStatus,
    PaymentType,
} from '@/services/payment';
import { getAllDeliveryTypes } from '@/services/delivery';
import { getApiErrorMessage } from '@/services/error';
import { useAppAlert } from '@/components/common/AppAlert';

import PaymentHeader from '@/components/payment/PaymentHeader';
import OrderSummary from '@/components/payment/OrderSumary';
import CustomerInfo, { CustomerData } from '@/components/payment/CustomerInfo';
import AddressInfo, { AddressData } from '@/components/payment/AddressInfo';
import PaymentMethods from '@/components/payment/PaymentMethod';
import PaymentFooter from '@/components/payment/PaymentFooter';

type DeliveryType = {
    id_type_delivery: number;
    name: string;
};

export default function PaymentScreen() {
    const router = useRouter();
    const { id_delivery } = useLocalSearchParams<{ id_delivery?: string }>();
    const { items, total, clearCart } = useCart();
    const { colors, font, fontSize, space } = useTheme();
    const { showMessage } = useAppAlert();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<PaymentType | null>(
        null,
    );
    const [delivery, setDelivery] = useState<DeliveryType | null>(null);
    const [loading, setLoading] = useState(true);
    const [finishing, setFinishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeCheckout, setActiveCheckout] = useState<{
        attemptId: string;
        checkoutUrl: string;
    } | null>(null);
    const [checkoutStatus, setCheckoutStatus] =
        useState<PaymentCheckoutStatus | null>(null);
    const completionHandled = useRef(false);

    useEffect(() => {
        async function loadData() {
            try {
                const storedUser =
                    await AsyncStorage.getItem('@UrbanCandy:user');
                if (!storedUser) throw new Error('Usuário não encontrado.');

                const user = JSON.parse(storedUser);
                if (!user.id_user)
                    throw new Error('ID do usuário não encontrado.');

                const data = await getUserProfile(user.id_user);
                setProfile(data);

                if (id_delivery) {
                    const response = await getAllDeliveryTypes();
                    const selected = (response?.data ?? []).find(
                        (type: DeliveryType) =>
                            type.id_type_delivery === Number(id_delivery),
                    );
                    setDelivery(selected ?? null);
                }
            } catch (err) {
                const message = getApiErrorMessage(
                    err,
                    'Não foi possível carregar seus dados.',
                );
                setError(message);
                showMessage('Atenção', message, undefined, 'warning');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [id_delivery, showMessage]);

    useEffect(() => {
        if (!activeCheckout) return;

        let requestInProgress = false;
        let active = true;
        let interval: ReturnType<typeof setInterval>;
        const refreshStatus = async () => {
            if (requestInProgress) return;
            requestInProgress = true;
            try {
                const status = await getPaymentCheckoutStatus(
                    activeCheckout.attemptId,
                );
                if (!active) return;
                setCheckoutStatus(status);
                if (status.status !== 'pending') clearInterval(interval);
                if (
                    status.status === 'approved' &&
                    !completionHandled.current
                ) {
                    completionHandled.current = true;
                    clearCart();
                }
            } catch (statusError) {
                console.error(
                    'Não foi possível consultar o pagamento:',
                    statusError,
                );
            } finally {
                requestInProgress = false;
            }
        };

        const initialCheck = setTimeout(() => void refreshStatus(), 0);
        interval = setInterval(() => void refreshStatus(), 5000);
        return () => {
            active = false;
            clearTimeout(initialCheck);
            clearInterval(interval);
        };
    }, [activeCheckout, clearCart]);

    async function openCheckout(checkoutUrl: string) {
        await WebBrowser.openBrowserAsync(checkoutUrl);
    }

    async function handleFinishPayment() {
        if (!id_delivery) {
            showMessage(
                'Atenção',
                'Selecione um tipo de entrega.',
                undefined,
                'warning',
            );
            return;
        }

        if (!selectedPayment) {
            showMessage(
                'Atenção',
                'Selecione uma forma de pagamento.',
                undefined,
                'warning',
            );
            return;
        }

        if (!items.length) {
            showMessage(
                'Carrinho vazio',
                'Adicione produtos antes de finalizar o pedido.',
                undefined,
                'warning',
            );
            return;
        }

        try {
            setFinishing(true);

            const paymentMethod = getPaymentMethodKind(
                selectedPayment.name_payment,
            );
            const cart = {
                items: items.map((item) => ({
                    id_product: item.id_product,
                    quantity: item.quantity,
                })),
                total: Number(total),
            };

            if (paymentMethod === 'cash') {
                await createOrder({
                    id_payment: Number(selectedPayment.id_payment),
                    id_type_delivery: Number(id_delivery),
                    cart,
                });
                clearCart();
                showMessage(
                    'Pedido realizado!',
                    'Seu pedido foi realizado para pagamento na entrega.',
                    () => router.replace('/protected/home'),
                    'success',
                );
                return;
            }

            if (activeCheckout && checkoutStatus?.status === 'pending') {
                await openCheckout(activeCheckout.checkoutUrl);
                return;
            }

            const checkout = await createPaymentCheckout({
                id_payment: 0,
                id_type_delivery: Number(id_delivery),
                payment_method: 'both',
                cart,
            });
            setActiveCheckout({
                attemptId: checkout.attemptId,
                checkoutUrl: checkout.checkoutUrl,
            });
            setCheckoutStatus({
                id: checkout.attemptId,
                status: 'pending',
                id_order: null,
                total: checkout.total,
            });
            completionHandled.current = false;
            await openCheckout(checkout.checkoutUrl);
        } catch (err) {
            showMessage(
                'Não foi possível finalizar',
                getApiErrorMessage(
                    err,
                    'Ocorreu um erro ao processar seu pedido.',
                ),
            );
        } finally {
            setFinishing(false);
        }
    }

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: {
            paddingHorizontal: space.lg,
            paddingTop: space.lg,
            paddingBottom: 140,
        },
        sectionTitle: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.text,
            marginTop: space.lg,
            marginBottom: space.sm,
        },
        delivery: {
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: space.lg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
        },
        deliveryName: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.primary,
        },
        loading: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        error: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.danger,
            textAlign: 'center',
            paddingHorizontal: space.xxl,
        },
        checkoutStatus: {
            backgroundColor: colors.white,
            borderRadius: 12,
            marginTop: space.lg,
            padding: space.lg,
            gap: space.sm,
        },
        checkoutStatusTitle: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.text,
        },
        checkoutStatusMessage: {
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },
        checkoutAction: {
            minHeight: 44,
            borderRadius: 22,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: space.xs,
        },
        checkoutActionText: {
            fontFamily: font.semibold,
            fontSize: fontSize.sm,
            color: colors.white,
        },
    });

    if (loading) {
        return (
            <View style={styles.container}>
                <PaymentHeader onBack={() => router.back()} />
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    if (error || !profile) {
        return (
            <View style={styles.container}>
                <PaymentHeader onBack={() => router.back()} />
                <View style={styles.loading}>
                    <Text style={styles.error}>
                        {error || 'Não foi possível carregar os dados.'}
                    </Text>
                </View>
            </View>
        );
    }

    const profileAny = profile as any;
    const people = profileAny?.people ?? profileAny?.People ?? profileAny;
    const address =
        people?.address ??
        people?.Address ??
        profileAny?.address ??
        profileAny?.Address;

    const customerData: CustomerData = {
        name: people?.name ?? profileAny?.name ?? '',
        cpf: people?.cpf ?? profileAny?.cpf ?? '',
        phone: people?.phone ?? people?.telephone ?? profileAny?.phone ?? '',
    };

    const addressData: AddressData = {
        cep: address?.cep ?? '',
        city: address?.city ?? '',
        neighborhood: address?.neighborhood ?? '',
        street: address?.road ?? '',
        number: String(address?.number ?? ''),
    };

    return (
        <View style={styles.container}>
            <PaymentHeader onBack={() => router.back()} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <OrderSummary />

                <Text style={styles.sectionTitle}>
                    Tipo (entrega ou retirada)
                </Text>
                <View style={styles.delivery}>
                    <Text style={styles.deliveryName}>
                        {delivery?.name || 'Tipo não selecionado'}
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Dados Pessoais</Text>
                <CustomerInfo data={customerData} />

                <Text style={styles.sectionTitle}>Endereço</Text>
                <AddressInfo data={addressData} />

                <Text style={styles.sectionTitle}>
                    Selecione a forma de pagamento
                </Text>

                <PaymentMethods
                    selectedPayment={selectedPayment}
                    onSelect={setSelectedPayment}
                />

                {activeCheckout && (
                    <View style={styles.checkoutStatus}>
                        <Text style={styles.checkoutStatusTitle}>
                            {checkoutStatus?.status === 'approved'
                                ? 'Pagamento confirmado'
                                : checkoutStatus?.status === 'rejected' ||
                                    checkoutStatus?.status === 'cancelled' ||
                                    checkoutStatus?.status === 'failed'
                                  ? 'Pagamento não concluído'
                                  : 'Aguardando confirmação do Mercado Pago'}
                        </Text>
                        <Text style={styles.checkoutStatusMessage}>
                            {checkoutStatus?.status === 'approved'
                                ? `Pedido #${checkoutStatus.id_order} confirmado.`
                                : checkoutStatus?.status === 'rejected' ||
                                    checkoutStatus?.status === 'cancelled' ||
                                    checkoutStatus?.status === 'failed'
                                  ? 'Você pode escolher uma forma de pagamento e tentar novamente.'
                                  : 'Se você fechou o checkout antes de pagar, pode reabri-lo. O pedido só será criado após a confirmação.'}
                        </Text>
                        {checkoutStatus?.status === 'pending' && (
                            <Pressable
                                style={styles.checkoutAction}
                                onPress={() =>
                                    void openCheckout(
                                        activeCheckout.checkoutUrl,
                                    )
                                }
                            >
                                <Text style={styles.checkoutActionText}>
                                    Continuar no Mercado Pago
                                </Text>
                            </Pressable>
                        )}
                        {checkoutStatus?.status === 'approved' && (
                            <Pressable
                                style={styles.checkoutAction}
                                onPress={() =>
                                    router.replace('/protected/orders')
                                }
                            >
                                <Text style={styles.checkoutActionText}>
                                    Ver meus pedidos
                                </Text>
                            </Pressable>
                        )}
                        {checkoutStatus &&
                            ['rejected', 'cancelled', 'failed'].includes(
                                checkoutStatus.status,
                            ) && (
                                <Pressable
                                    style={styles.checkoutAction}
                                    onPress={() => {
                                        setActiveCheckout(null);
                                        setCheckoutStatus(null);
                                        completionHandled.current = false;
                                    }}
                                >
                                    <Text style={styles.checkoutActionText}>
                                        Escolher outra forma
                                    </Text>
                                </Pressable>
                            )}
                    </View>
                )}
            </ScrollView>

            <PaymentFooter
                total={total}
                disabled={
                    finishing ||
                    (activeCheckout !== null &&
                        (checkoutStatus?.status === 'pending' ||
                            checkoutStatus?.status === 'approved'))
                }
                buttonLabel={
                    activeCheckout && checkoutStatus?.status === 'pending'
                        ? 'Continuar pagamento'
                        : selectedPayment &&
                            getPaymentMethodKind(
                                selectedPayment.name_payment,
                            ) !== 'cash'
                          ? 'Pagar com Mercado Pago'
                          : 'Finalizar pedido'
                }
                onPress={handleFinishPayment}
            />
        </View>
    );
}
