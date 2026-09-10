import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/Theme';
import { getOrderItems, updateOrderStatus, getOrderStatuses } from '@/services/orders';
import { getAllTypeOfPayment, PaymentType } from '@/services/payment';
import { EmployeeMenu } from '@/components/employee/EmployeeMenu';
import { useAppAlert } from '@/components/common/AppAlert'; 
import { API_BASE_URL } from '@/services/api';

const STATUS_THEMES: Record<string, { bg: string; text: string; border: string }> = {
    preparando: { bg: '#E3F2FD', text: '#1976D2', border: '#BBDEFB' },
    pronto: { bg: '#F3E5F5', text: '#7B1FA2', border: '#E1BEE7' },
    entregue: { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' },
    default: { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
};

export default function EmployeeOrdersDetails() {
    const { colors, font, fontSize, space, radius } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { showMessage } = useAppAlert();

    const [orderData, setOrderData] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const validOrderId = Number(params.id || orderData?.id_orders || orderData?.id || 0);

    useEffect(() => {
        let parsedOrder = null;
        if (params.order) {
            try {
                const rawOrder = typeof params.order === 'string' ? params.order : params.order[0];
                parsedOrder = JSON.parse(decodeURIComponent(rawOrder));
                setOrderData(parsedOrder);
            } catch (e) {
                console.error('Erro ao converter dados do pedido:', e);
            }
        }

        const idToUse = Number(params.id || parsedOrder?.id_orders || parsedOrder?.id || 0);
        if (!idToUse) { setLoading(false); return; }

        Promise.all([
            getOrderItems(idToUse),
            getOrderStatuses(),
            getAllTypeOfPayment(1, 20),
        ])
            .then(([itemsRes, statusRes, paymentsRes]) => {
                setItems(Array.isArray(itemsRes) ? itemsRes : itemsRes?.data || []);
                setStatuses(Array.isArray(statusRes) ? statusRes : []);
                setPaymentTypes(Array.isArray(paymentsRes) ? paymentsRes : (paymentsRes as any)?.data || []);
            })
            .catch((err) => console.error('Erro ao buscar detalhes:', err))
            .finally(() => setLoading(false));
    }, [params.id, params.order]);

    const getImageUrl = (imagePath?: string) => {
        if (!imagePath) return 'https://via.placeholder.com/100';
        if (imagePath.startsWith('http')) return imagePath;
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${API_BASE_URL}${cleanPath.startsWith('/uploads') ? cleanPath : `/uploads${cleanPath}`}`;
    };

    const currentStatusName = orderData?.status?.label || orderData?.status?.name || 'Recebido';
    const currentStatusId = Number(orderData?.status_id || orderData?.status?.id || 0);

    const getStatusStyle = () => {
        const s = currentStatusName.toLowerCase();
        if (s.includes('preparando')) return STATUS_THEMES.preparando;
        if (s.includes('pronto')) return STATUS_THEMES.pronto;
        if (s.includes('entregue') || s.includes('concluido')) return STATUS_THEMES.entregue;
        return STATUS_THEMES.default;
    };

    const getActionButtonInfo = () => {
        const s = currentStatusName.toLowerCase();
        if (s.includes('preparando')) return { text: 'Concluir Preparo', disabled: false };
        if (s.includes('pronto')) return { text: 'Marcar como Entregue', disabled: false };
        if (s.includes('entregue') || s.includes('concluido')) return { text: 'Pedido Finalizado', disabled: true };
        return { text: 'Iniciar Preparação', disabled: false };
    };

    const formatOrderDate = (dateString?: string) => {
        if (!dateString) return 'Data não informada';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return date.toDateString() === new Date().toDateString() 
            ? `Recebido hoje às ${time}` 
            : `Recebido em ${date.toLocaleDateString('pt-BR')} às ${time}`;
    };

    const handleAdvanceStatus = async () => {
        const actionInfo = getActionButtonInfo();
        if (!validOrderId || !orderData || statuses.length === 0 || actionInfo.disabled) return;

        const sortedStatuses = [...statuses].sort((a, b) => Number(a.id || a.id_status) - Number(b.id || b.id_status));
        const currentIndex = sortedStatuses.findIndex((s) => Number(s.id || s.id_status) === currentStatusId);

        const nextStatus = currentIndex !== -1 && currentIndex < sortedStatuses.length - 1
            ? sortedStatuses[currentIndex + 1]
            : sortedStatuses.find((s, idx) => idx > 0 && (s.name || s.label || '').toLowerCase() === currentStatusName.toLowerCase());

        if (!nextStatus) {
            showMessage({ title: 'Aviso', message: 'Não foi possível identificar o próximo status.', type: 'warning' });
            return;
        }

        const nextStatusId = Number(nextStatus.id || nextStatus.id_status);
        const nextStatusName = nextStatus.label || nextStatus.name || 'Atualizado';

        setUpdating(true);
        try {
            await updateOrderStatus(validOrderId, nextStatusId);
            setOrderData((prev: any) => ({
                ...prev,
                status_id: nextStatusId,
                status: { ...prev?.status, id: nextStatusId, name: nextStatusName, label: nextStatusName },
            }));
            showMessage({ title: 'Status Atualizado', message: `O pedido agora está com o status: ${nextStatusName}`, type: 'success' });
        } catch (error) {
            showMessage({ title: 'Erro', message: 'Não foi possível atualizar o status.', type: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    const actionInfo = getActionButtonInfo();
    const statusStyle = getStatusStyle();

    // Mapeamento dinâmico de Pagamento
    const paymentId = Number(orderData?.id_payment || orderData?.payment?.id_payment || orderData?.payment_id || 0);
    const foundPayment = paymentTypes.find((p) => p.id_payment === paymentId);
    const paymentMethodName = foundPayment?.name_payment || orderData?.payment?.name_payment || orderData?.payment_method?.name || 'Não informado';

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: '#F3F3F3' },
        loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        header: { paddingTop: 70, paddingBottom: space.md, paddingHorizontal: space.md, flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.secondary, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl },
        headerTitle: { fontFamily: font.semibold, fontSize: fontSize.xxl, color: colors.white, marginBottom: 15, marginLeft: 5 },
        scrollContent: { paddingHorizontal: space.md, paddingBottom: 110 },
        center: { alignItems: 'center', marginVertical: space.md },
        timeText: { marginBottom: 4, fontFamily: font.regular, fontSize: fontSize.base, color: colors.text },
        statusBadge: { paddingHorizontal: space.md, paddingVertical: 4, borderWidth: 1, borderRadius: radius.pill, backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
        statusBadgeText: { fontFamily: font.bold, fontSize: fontSize.sm, color: statusStyle.text },
        card: { padding: space.md, marginBottom: space.sm, borderRadius: radius.lg, backgroundColor: colors.white, elevation: 2 },
        cardTitle: { fontFamily: font.semibold, fontSize: fontSize.md, color: colors.text },
        row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
        betweenRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
        infoText: { fontFamily: font.medium, fontSize: fontSize.base, color: colors.text },
        itemImage: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: '#EEE' },
        qtyBadge: { backgroundColor: '#EAEAEA', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
        qtyText: { fontFamily: font.bold, fontSize: fontSize.xs },
        divider: { height: 1, backgroundColor: '#E5E5E5', marginVertical: space.md },
        actions: { flexDirection: 'row', gap: space.sm, marginTop: space.xs, marginBottom: space.md },
        btnCancel: { flex: 1, backgroundColor: '#F8D7DA', paddingVertical: space.md, alignItems: 'center', borderRadius: radius.pill },
        btnAction: { flex: 1, paddingVertical: space.md, alignItems: 'center', borderRadius: radius.pill, backgroundColor: actionInfo.disabled ? '#CCC' : statusStyle.text },
        btnTextCancel: { fontFamily: font.semibold, fontSize: fontSize.base, color: colors.primary },
        btnTextAction: { fontFamily: font.semibold, fontSize: fontSize.base, color: colors.white },
        productName: { fontFamily: font.medium, fontSize: fontSize.base, color: colors.text },
        productPrice: { fontFamily: font.regular, fontSize: fontSize.xs, color: colors.textSecondary },
        totalLabel: { fontFamily: font.bold, fontSize: fontSize.lg, color: colors.text },
        totalValue: { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.primary },
        paymentTag: { backgroundColor: '#E8F5E9', paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.sm },
        paymentTagText: { fontFamily: font.semibold, fontSize: fontSize.xs, color: '#2E7D32' },
    });

    if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} marginBottom={15} marginLeft={10} />
                </Pressable>
                <Text style={styles.headerTitle}>Pedido #{validOrderId}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.center}>
                    <Text style={styles.timeText}>{formatOrderDate(orderData?.order_date)}</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>{currentStatusName}</Text>
                    </View>
                </View>

                {/* Cliente */}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Ionicons name="person-outline" size={20} color={colors.text} />
                        <Text style={styles.infoText}>{orderData?.people?.name || orderData?.user?.name || 'Cliente sem nome'}</Text>
                    </View>
                    <View style={[styles.row, { marginTop: space.sm }]}>
                        <Ionicons name="call-outline" size={20} color={colors.text} />
                        <Text style={styles.infoText}>{orderData?.people?.telephone || orderData?.user?.telephone || '(00) 00000-0000'}</Text>
                    </View>
                </View>

                {/* Forma de Pagamento */}
                <View style={styles.card}>
                    <View style={styles.betweenRow}>
                        <View style={styles.row}>
                            <Ionicons name="card-outline" size={20} color={colors.text} />
                            <Text style={styles.infoText}>{paymentMethodName}</Text>
                        </View>
                        <View style={styles.paymentTag}>
                            <Text style={styles.paymentTagText}>{orderData?.payment_status || 'Confirmado'}</Text>
                        </View>
                    </View>
                </View>

                {/* Itens */}
                <View style={styles.card}>
                    <View style={[styles.row, { marginBottom: space.md }]}>
                        <Ionicons name="bag-handle-outline" size={22} color={colors.text} />
                        <Text style={styles.cardTitle}>Itens do Pedido</Text>
                    </View>

                    {items.map((item, idx) => {
                        const product = item.products || item.product || {};
                        const price = Number(item.unit_price || product.price || 0);
                        const subTotal = Number(item.sub_total || price * (item.quantity || 1));

                        return (
                            <View key={item.id || idx} style={styles.betweenRow}>
                                <View style={[styles.row, { flex: 1 }]}>
                                    <Image source={{ uri: getImageUrl(product.image || product.image_url) }} style={styles.itemImage} />
                                    <View style={styles.qtyBadge}><Text style={styles.qtyText}>{item.quantity || 1}x</Text></View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.productName}>{product.name || 'Produto'}</Text>
                                        <Text style={styles.productPrice}>{price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} cada</Text>
                                    </View>
                                </View>
                                <Text style={styles.infoText}>{subTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                            </View>
                        );
                    })}

                    <View style={styles.divider} />

                    <View style={styles.betweenRow}>
                        <Text style={styles.totalLabel}>Total a pagar</Text>
                        <Text style={styles.totalValue}>{Number(orderData?.total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                    </View>
                </View>

                {/* Botões */}
                <View style={styles.actions}>
                    <Pressable style={styles.btnCancel} onPress={() => router.back()}>
                        <Text style={styles.btnTextCancel}>Voltar</Text>
                    </Pressable>

                    <Pressable style={styles.btnAction} disabled={updating || actionInfo.disabled} onPress={handleAdvanceStatus}>
                        {updating ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.btnTextAction}>{actionInfo.text}</Text>}
                    </Pressable>
                </View>
            </ScrollView>

            <EmployeeMenu />
        </View>
    );
}