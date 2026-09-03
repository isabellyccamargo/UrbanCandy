import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile } from '@/services/auth'; 
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '@/context/Theme';
import { useAppAlert } from '@/components/common/AppAlert';
import { Menu } from '@/components/home/Menu';
import OrdersHeader from '@/components/orders/OrderHeader';
import OrderCard from '@/components/orders/OrderCard';

import { getMyOrders } from '@/services/orders';

export type OrderItem = {
    id_orderItem: number;
    id_product: number;
    quantity: number;
    unit_price?: number | string;
    sub_total: number | string;
    products?: {
        id_product: number;
        name: string;
        price: number | string;
        image?: string;
    };
};

export type Order = {
    id_orders: number;
    total?: number | string;
    order_date?: string;
    paymentType?: {
        name_payment?: string;
    };
    deliveryType?: {
        name?: string;
    };
    status?: {
        id_order_status?: number;
        name?: string;
        label?: string;
    };
    items?: OrderItem[];
};

export default function OrdersScreen() {
    const { colors, font, fontSize, space } = useTheme();
    const { showMessage } = useAppAlert();

    const [orders, setOrders] = useState<Order[]>([]);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);

            const storedUserRaw = await AsyncStorage.getItem('@UrbanCandy:user') || await AsyncStorage.getItem('user');

            if (!storedUserRaw) {
                throw new Error('Usuário não encontrado. Faça login novamente.');
            }

            const storedUser = JSON.parse(storedUserRaw);
            const userId = storedUser.id_user || storedUser.id;

            if (!userId) {
                throw new Error('ID do usuário não foi encontrado.');
            }

            let id_people = storedUser.id_people || storedUser.people?.id_people || storedUser.People?.id_people;

            if (!id_people) {
                console.log(`[ORDERS] Buscando perfil completo para id_user: ${userId}...`);
                const profile = await getUserProfile(Number(userId));

                id_people =
                    profile?.id_people ||
                    profile?.people?.id_people ||
                    profile?.People?.id_people ||
                    profile?.data?.id_people ||
                    profile?.data?.people?.id_people;
            }

            if (!id_people) {
                throw new Error('Não foi possível identificar o cadastro de pessoa associado a este usuário.');
            }

            const response = await getMyOrders(Number(id_people), 1, 50);
            const orderList = response?.data ?? response ?? [];
            setOrders(Array.isArray(orderList) ? orderList : []);

        } catch (error: any) {
            console.error('Erro ao carregar pedidos:', error);

            showMessage({
                title: 'Erro',
                message: error?.message || 'Não foi possível carregar seus pedidos.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    }

    function toggleOrder(id: number) {
        setExpandedOrder(current =>
            current === id ? null : id
        );
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        list: {
            padding: space.lg,
            paddingBottom: 120,
        },
        loading: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        empty: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: space.xxxl,
        },
        emptyIcon: {
            fontSize: 60,
            marginBottom: space.md,
        },
        emptyTitle: {
            fontFamily: font.semibold,
            fontSize: fontSize.xl,
            color: colors.text,
            textAlign: 'center',
        },
        emptyText: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.textTertiary,
            textAlign: 'center',
            marginTop: space.sm,
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <OrdersHeader />

            {loading ? (
                <View style={styles.loading}>
                    <ActivityIndicator
                        size="large"
                        color={colors.primary}
                    />
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.emptyTitle}>
                        Você ainda não fez pedidos
                    </Text>
                    <Text style={styles.emptyText}>
                        Seus pedidos aparecerão aqui depois que você finalizar uma compra.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => String(item.id_orders)}
                    renderItem={({ item }) => (
                        <OrderCard
                            order={item}
                            expanded={expandedOrder === item.id_orders}
                            onPress={() => toggleOrder(item.id_orders)}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                />
            )}

            <Menu />
        </View>
    );
}