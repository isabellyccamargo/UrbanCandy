import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '@/context/Theme';
import type { Order } from '@/app/protected/orders';

type Props = {
    order: Order;
    expanded: boolean;
    onPress: () => void;
};

// Temas de cores para os status
const STATUS_THEMES: Record<string, { bg: string; text: string; border: string }> = {
    preparando: { bg: '#E3F2FD', text: '#1976D2', border: '#BBDEFB' },
    pronto: { bg: '#F3E5F5', text: '#7B1FA2', border: '#E1BEE7' },
    entregue: { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' },
    default: { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
};

function getStatusStyle(statusName?: string) {
    const s = String(statusName || '').toLowerCase();
    if (s.includes('preparando')) return STATUS_THEMES.preparando;
    if (s.includes('pronto')) return STATUS_THEMES.pronto;
    if (s.includes('entregue') || s.includes('concluido')) return STATUS_THEMES.entregue;
    return STATUS_THEMES.default;
}

function formatPrice(value: number | string | undefined) {
    return `R$ ${Number(value ?? 0)
        .toFixed(2)
        .replace('.', ',')}`;
}

function formatDate(value?: string) {
    if (!value) return 'Data não informada';

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? 'Data não informada'
        : date.toLocaleDateString('pt-BR');
}

export default function OrderCard({
    order,
    expanded,
    onPress,
}: Props) {
    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    // 1. Proteção de segurança caso o pedido venha nulo/indefinido
    if (!order) {
        return null;
    }

    // 2. Extração segura de propriedades com fallback
    const statusLabel = order?.status?.label ?? order?.status?.name ?? 'Pendente';
    const statusStyle = getStatusStyle(statusLabel);

    const styles = StyleSheet.create({
        card: {
            backgroundColor: colors.white,
            borderRadius: radius.xl,
            padding: space.lg,
            marginBottom: space.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
        },

        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },

        title: {
            fontFamily: font.semibold,
            fontSize: fontSize.lg,
            color: colors.text,
        },

        status: {
            backgroundColor: statusStyle.bg,
            borderColor: statusStyle.border,
            borderWidth: 1,
            borderRadius: radius.pill,
            paddingHorizontal: space.md,
            paddingVertical: space.xs,
        },

        statusText: {
            fontFamily: font.semibold,
            fontSize: fontSize.sm,
            color: statusStyle.text,
        },

        date: {
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.textTertiary,
            marginTop: space.xs,
        },

        divider: {
            height: 1,
            backgroundColor: colors.border,
            marginVertical: space.md,
        },

        label: {
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.textTertiary,
        },

        value: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.text,
            marginTop: 2,
            marginBottom: space.sm,
        },

        totalLabel: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.textSecondary,
        },

        total: {
            fontFamily: font.bold,
            fontSize: fontSize.lg,
            color: colors.primary,
        },

        details: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: space.md,
        },

        detailsText: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.primary,
            marginRight: space.xs,
        },

        item: {
            paddingVertical: space.sm,
        },

        product: {
            flex: 1,
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.text,
            marginRight: space.md,
        },

        productTotal: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.text,
        },

        quantity: {
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.textTertiary,
            marginTop: 3,
        },

        itemDivider: {
            height: 1,
            backgroundColor: colors.border,
            marginTop: space.sm,
        },

        empty: {
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.textTertiary,
            textAlign: 'center',
            paddingVertical: space.md,
        },
    });

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.title}>
                    Pedido #{order.id_orders}
                </Text>

                <View style={styles.status}>
                    <Text style={styles.statusText}>
                        {statusLabel}
                    </Text>
                </View>
            </View>

            <Text style={styles.date}>
                {formatDate(order.order_date)}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.label}>
                Forma de pagamento
            </Text>

            <Text style={styles.value}>
                {order.paymentType?.name_payment ??
                    'Não informado'}
            </Text>

            <Text style={styles.label}>
                Tipo de entrega
            </Text>

            <Text style={styles.value}>
                {order.deliveryType?.name ??
                    'Não informado'}
            </Text>

            <View style={styles.row}>
                <Text style={styles.totalLabel}>
                    Total do pedido
                </Text>

                <Text style={styles.total}>
                    {formatPrice(order.total)}
                </Text>
            </View>

            <Pressable
                style={styles.details}
                onPress={onPress}
            >
                <Text style={styles.detailsText}>
                    {expanded
                        ? 'Ocultar detalhes'
                        : 'Ver detalhes'}
                </Text>

                <Ionicons
                    name={
                        expanded
                            ? 'chevron-up'
                            : 'chevron-down'
                    }
                    size={20}
                    color={colors.primary}
                />
            </Pressable>

            {expanded && (
                <View>
                    {!order.items?.length ? (
                        <Text style={styles.empty}>
                            Nenhum produto encontrado.
                        </Text>
                    ) : (
                        order.items.map(item => (
                            <View
                                key={item.id_orderItem}
                                style={styles.item}
                            >
                                <View style={styles.row}>
                                    <Text style={styles.product}>
                                        {item.products?.name ??
                                            `Produto #${item.id_product}`}
                                    </Text>

                                    <Text
                                        style={
                                            styles.productTotal
                                        }
                                    >
                                        {formatPrice(
                                            item.sub_total
                                        )}
                                    </Text>
                                </View>

                                <Text style={styles.quantity}>
                                    Quantidade: {item.quantity}
                                </Text>

                                <View
                                    style={
                                        styles.itemDivider
                                    }
                                />
                            </View>
                        ))
                    )}
                </View>
            )}
        </View>
    );
}