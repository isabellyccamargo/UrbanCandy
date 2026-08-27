
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '@/context/Theme';
import { useAppAlert } from '@/components/common/AppAlert';
import { Menu } from '@/components/home/Menu';
import OrdersHeader from '@/components/orders/OrderHeader';
import OrderCard from '@/components/orders/OrderCard';

import { getUserProfile } from '@/services/auth';
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
    items?: OrderItem[];
};

export default function OrdersScreen() {
    const {
        colors,
        font,
        fontSize,
        space,
    } = useTheme();

    const { showMessage } = useAppAlert();

    const [orders, setOrders] = useState<Order[]>([]);
    const [expandedOrder, setExpandedOrder] =
        useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            const storedUser =
                await AsyncStorage.getItem('@UrbanCandy:user');

            if (!storedUser) {
                throw new Error('Usuário não encontrado.');
            }

            const user = JSON.parse(storedUser);

            if (!user.id_user) {
                throw new Error(
                    'ID do usuário não encontrado.'
                );
            }

            const profile = await getUserProfile(
                Number(user.id_user)
            );

            const people =
                profile.people ??
                (profile as any).People ??
                profile;

            const id_people =
                people.id_people ??
                (profile as any).id_people;

            if (!id_people) {
                throw new Error(
                    'ID da pessoa não encontrado.'
                );
            }

            const response = await getMyOrders(
                Number(id_people),
                1,
                50
            );

            setOrders(response?.data ?? []);
        } catch (error) {
            console.error(
                'Erro ao carregar pedidos:',
                error
            );

            showMessage(
                'Erro',
                'Não foi possível carregar seus pedidos.',
                undefined,
                'error'
            );
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
                    <Text style={styles.emptyIcon}>
                        📦
                    </Text>

                    <Text style={styles.emptyTitle}>
                        Você ainda não fez pedidos
                    </Text>

                    <Text style={styles.emptyText}>
                        Seus pedidos aparecerão aqui depois
                        que você finalizar uma compra.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item =>
                        String(item.id_orders)
                    }
                    renderItem={({ item }) => (
                        <OrderCard
                            order={item}
                            expanded={
                                expandedOrder ===
                                item.id_orders
                            }
                            onPress={() =>
                                toggleOrder(
                                    item.id_orders
                                )
                            }
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
