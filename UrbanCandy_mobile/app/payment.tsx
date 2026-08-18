import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/Theme';
import { getUserProfile, UserProfile } from '@/services/auth';
import { createOrder } from '@/services/orders';
import { PaymentType } from '@/services/payment';
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
    const [selectedPayment, setSelectedPayment] = useState<PaymentType | null>(null);
    const [delivery, setDelivery] = useState<DeliveryType | null>(null);
    const [loading, setLoading] = useState(true);
    const [finishing, setFinishing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const storedUser = await AsyncStorage.getItem('@UrbanCandy:user');
            if (!storedUser) throw new Error('Usuário não encontrado.');

            const user = JSON.parse(storedUser);
            if (!user.id_user) throw new Error('ID do usuário não encontrado.');

            const data = await getUserProfile(user.id_user);
            setProfile(data);

            if (id_delivery) {
                const response = await getAllDeliveryTypes();
                const selected = (response?.data ?? []).find(
                    (type: DeliveryType) => type.id_type_delivery === Number(id_delivery)
                );
                setDelivery(selected ?? null);
            }
        } catch (err) {
            const message = getApiErrorMessage(err, 'Não foi possível carregar seus dados.');
            setError(message);
            showMessage('Atenção', message, undefined, 'warning');
        } finally {
            setLoading(false);
        }
    }

    async function handleFinishPayment() {
        if (!id_delivery) {
            showMessage('Atenção', 'Selecione um tipo de entrega.', undefined, 'warning');
            return;
        }

        if (!selectedPayment) {
            showMessage('Atenção', 'Selecione uma forma de pagamento.', undefined, 'warning');
            return;
        }

        if (!items.length) {
            showMessage('Carrinho vazio', 'Adicione produtos antes de finalizar o pedido.', undefined, 'warning');
            return;
        }

        const people = profile?.people ?? (profile as any)?.People ?? profile;
        const id_people = people?.id_people ?? (profile as any)?.id_people;

        if (!id_people) {
            showMessage('Erro', 'Não foi possível identificar o usuário.');
            return;
        }

        try {
            setFinishing(true);

            const orderData = {
                id_people: Number(id_people),
                id_payment: Number(selectedPayment.id_payment),
                id_type_delivery: Number(id_delivery),
                cart: {
                    items: items.map(item => ({
                        id_product: item.id_product,
                        quantity: item.quantity,
                        sub_total: item.product.price * item.quantity,
                        products: { price: item.product.price },
                    })),
                    total: Number(total),
                },
            };

            await createOrder(orderData);
            clearCart();

            showMessage(
                'Pedido realizado!',
                'Seu pedido foi realizado com sucesso.',
                () => router.replace('/home'),
                'success'
            );
        } catch (err) {
            showMessage(
                'Não foi possível finalizar',
                getApiErrorMessage(err, 'Ocorreu um erro ao processar seu pedido.')
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
            shadowOpacity: 0.20,
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

    const people = profile.people ?? (profile as any).People ?? profile;
    const address =
        people.address ??
        (people as any).Address ??
        profile.address ??
        (profile as any).Address;

    const customerData: CustomerData = {
        name: people.name ?? profile.name ?? '',
        cpf: people.cpf ?? profile.cpf ?? '',
        phone: people.phone ?? people.telephone ?? profile.phone ?? '',
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

                <Text style={styles.sectionTitle}>Tipo (entrega ou retirada)</Text>
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
            </ScrollView>

            <PaymentFooter
                total={total}
                disabled={finishing}
                onPress={handleFinishPayment}
            />
        </View>
    );
}