import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/Theme';
import { getAllOrders, getOrderStatuses } from '@/services/orders';
import EmployeeHeader from '@/components/employee/EmployeeHeader';
import EmployeeOrderCard from '@/components/employee/EmployeeOrderCard';
import { EmployeeMenu } from '@/components/employee/EmployeeMenu';

const STATUS_THEMES: Record<string, { bg: string; text: string; border: string }> = {
    recebido: { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
    preparando: { bg: '#E3F2FD', text: '#1976D2', border: '#BBDEFB' },
    pronto: { bg: '#F3E5F5', text: '#7B1FA2', border: '#E1BEE7' },
    entregue: { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' },
    default: { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0' },
};

export default function EmployeeOrders() {
    const { colors, font, fontSize, space, radius } = useTheme();
    const router = useRouter();

    const [orders, setOrders] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [selectedTabId, setSelectedTabId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Identifica o tema correto com base no nome do status
    const getStatusTheme = (statusName: string) => {
        const s = (statusName || '').toLowerCase();
        if (s.includes('preparando')) return STATUS_THEMES.preparando;
        if (s.includes('pronto')) return STATUS_THEMES.pronto;
        if (s.includes('entregue') || s.includes('concluido')) return STATUS_THEMES.entregue;
        if (s.includes('recebido') || s.includes('fazer')) return STATUS_THEMES.recebido;
        return STATUS_THEMES.default;
    };

    // Carrega a lista de pedidos e os status cadastrados no banco
    const fetchData = useCallback(async () => {
        try {
            const [ordersRes, statusRes] = await Promise.all([
                getAllOrders(1, 100),
                getOrderStatuses(),
            ]);

            const loadedOrders = ordersRes?.data || ordersRes || [];
            setOrders(loadedOrders);

            const loadedStatuses = Array.isArray(statusRes) ? statusRes : [];
            setStatuses(loadedStatuses);

            // Seleciona o primeiro status como aba inicial se ainda não houver seleção
            if (loadedStatuses.length > 0 && selectedTabId === null) {
                setSelectedTabId(loadedStatuses[0].id);
            }
        } catch (error) {
            console.error('Erro ao carregar dados do servidor:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedTabId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleNavigateToDetails = (order: any) => {
        router.push({
            pathname: '/protected/employeeOrdersDetails' as any,
            params: {
                id: String(order.id_orders),
                order: JSON.stringify(order),
            },
        });
    };

    // Filtra os pedidos com base na aba (status) selecionada
    const filteredOrders = orders.filter((order) => {
        if (!selectedTabId) return true;
        const statusId = order.status_id || order.status?.id;
        return Number(statusId) === Number(selectedTabId);
    });

    // Calcula a contagem de pedidos para cada card e aba
    const getStatusCount = (statusId: number) => {
        return orders.filter(
            (o) => Number(o.status_id || o.status?.id) === Number(statusId)
        ).length;
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#F8F8F8',
        },
        scrollContent: {
            paddingBottom: 110,
        },
        metricsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: space.lg,
            marginTop: space.lg,
            gap: space.xs,
        },
        metricCard: {
            flex: 1,
            borderRadius: radius.md,
            paddingVertical: space.md,
            alignItems: 'center',
            borderWidth: 1,
            elevation: 1,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
        },
        metricNumber: {
            fontFamily: font.bold,
            fontSize: fontSize.xl,
            marginBottom: 2,
        },
        metricLabel: {
            fontFamily: font.medium,
            fontSize: fontSize.xs,
        },
        sectionTitle: {
            fontFamily: font.bold,
            fontSize: fontSize.lg,
            color: colors.text,
            marginHorizontal: space.lg,
            marginTop: space.xl,
            marginBottom: space.sm,
        },
        tabsContainer: {
            paddingHorizontal: space.sm,
            marginBottom: space.md,
        },
        tabButton: {
            paddingHorizontal: space.md,
            paddingVertical: space.xs + 2,
            borderRadius: radius.pill,
            marginRight: space.xs,
            borderWidth: 1,
        },
        tabText: {
            fontFamily: font.medium,
            fontSize: fontSize.sm,
        },
        ordersList: {
            paddingHorizontal: space.lg,
        },
        emptyText: {
            textAlign: 'center',
            marginTop: space.xl,
            fontFamily: font.regular,
            fontSize: fontSize.base,
            color: colors.textSecondary,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <EmployeeHeader employeeName="Funcionário" />

                <View style={styles.metricsContainer}>
                    {statuses.slice(0, 4).map((st) => {
                        const label = st.label || st.name || '';
                        const theme = getStatusTheme(label);
                        const count = getStatusCount(st.id);

                        return (
                            <View
                                key={st.id}
                                style={[
                                    styles.metricCard,
                                    {
                                        backgroundColor: theme.bg,
                                        borderColor: theme.border,
                                    },
                                ]}
                            >
                                <Text style={[styles.metricNumber, { color: theme.text }]}>
                                    {count}
                                </Text>
                                <Text style={[styles.metricLabel, { color: theme.text }]}>
                                    {label}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <Text style={styles.sectionTitle}>Pedidos</Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContainer}
                >
                    {statuses.map((st) => {
                        const isActive = selectedTabId === st.id;
                        const label = st.label || st.name || '';
                        const theme = getStatusTheme(label);
                        const count = getStatusCount(st.id);

                        return (
                            <Pressable
                                key={st.id}
                                style={[
                                    styles.tabButton,
                                    {
                                        backgroundColor: isActive ? theme.text : theme.bg,
                                        borderColor: theme.border,
                                    },
                                ]}
                                onPress={() => setSelectedTabId(st.id)}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        { color: isActive ? colors.white : theme.text },
                                    ]}
                                >
                                    {label} {count}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Lista de Pedidos */}
                <View style={styles.ordersList}>
                    {filteredOrders.length === 0 ? (
                        <Text style={styles.emptyText}>Nenhum pedido neste status.</Text>
                    ) : (
                        filteredOrders.map((order) => (
                            <EmployeeOrderCard
                                key={order.id_orders}
                                order={order}
                                isUpdating={false}
                                onAdvanceStatus={() => handleNavigateToDetails(order)}
                                onShowDetails={handleNavigateToDetails}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            <EmployeeMenu />
        </View>
    );
}