import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/Theme';

export interface EmployeeOrderCardProps {
    order: any;
    isUpdating: boolean;
    onAdvanceStatus: (order: any) => void;
    onShowDetails: (order: any) => void;
}

const STATUS_THEMES: Record<string, { bg: string; text: string; border: string }> = {
    recebido: { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
    preparando: { bg: '#E3F2FD', text: '#1976D2', border: '#BBDEFB' },
    pronto: { bg: '#F3E5F5', text: '#7B1FA2', border: '#E1BEE7' },
    entregue: { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' },
    default: { bg: '#FFFFFF', text: '#616161', border: '#E0E0E0' },
};

export default function EmployeeOrderCard({
    order,
    isUpdating,
    onAdvanceStatus,
    onShowDetails,
}: EmployeeOrderCardProps) {
    const { colors, font, fontSize, space, radius } = useTheme();

    const clientName = order.people?.name || order.user?.name || 'Cliente';
    const formattedPrice = Number(order.total || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
    const itemCount = order.items?.length || 0;
    const currentStatus = (order.status?.name || order.status?.label || '').toLowerCase();

    function getStatusTheme() {
        if (currentStatus.includes('preparando')) return STATUS_THEMES.preparando;
        if (currentStatus.includes('pronto')) return STATUS_THEMES.pronto;
        if (currentStatus.includes('entregue') || currentStatus.includes('concluido')) return STATUS_THEMES.entregue;
        if (currentStatus.includes('recebido') || currentStatus.includes('fazer')) return STATUS_THEMES.recebido;
        return STATUS_THEMES.default;
    }

    const theme = getStatusTheme();

    function formatOrderDateTime(dateString?: string) {
        if (!dateString) return { time: '--:--', date: '--/--/----' };

        const parsedDate = new Date(dateString);
        if (isNaN(parsedDate.getTime())) return { time: '--:--', date: '--/--/----' };

        const hours = parsedDate.getHours().toString().padStart(2, '0');
        const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
        const day = parsedDate.getDate().toString().padStart(2, '0');
        const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
        const year = parsedDate.getFullYear();

        return {
            time: `${hours}:${minutes}`,
            date: `${day}/${month}/${year}`,
        };
    }

    const { time, date } = formatOrderDateTime(order.order_date);

    function getActionButtonText() {
        if (currentStatus.includes('recebido') || currentStatus.includes('fazer')) return 'Preparar pedido';
        if (currentStatus.includes('preparando')) return 'Concluir preparo';
        if (currentStatus.includes('pronto')) return 'Marcar Entregue';
        return 'Finalizado';
    }

    const styles = StyleSheet.create({
        card: {
            backgroundColor: colors.white,
            borderRadius: radius.lg,
            padding: space.lg,
            marginBottom: space.md,
            elevation: 2,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        leftInfo: {
            flexDirection: 'row',
            gap: space.sm,
            alignItems: 'center',
        },
        idText: {
            fontFamily: font.bold,
            fontSize: fontSize.md,
            color: colors.text,
        },
        clientName: {
            width:140,
            fontFamily: font.medium,
            fontSize: fontSize.base,
            color: colors.textSecondary,
        },
        timeText: {
            marginTop: space.xs,
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.textTertiary,
            textAlign: 'center',
        },
        priceCol: {
            alignItems: 'flex-end',
        },
        priceText: {
            fontFamily: font.bold,
            fontSize: fontSize.md,
            color: colors.primary,
        },
        itemsText: {
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.textTertiary,
        },
        deliveryText: {
            fontFamily: font.medium,
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            marginTop: space.md,
        },
        footerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: space.md,
        },
        detailsLink: {
            fontFamily: font.medium,
            fontSize: fontSize.base,
            color: colors.text,
        },
        actionButton: {
            backgroundColor: theme.text,
            paddingHorizontal: space.lg,
            paddingVertical: space.xs + 2,
            borderRadius: radius.pill,
        },
        actionButtonText: {
            fontFamily: font.semibold,
            fontSize: fontSize.base,
            color: colors.white,
        },
    });

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <View style={styles.leftInfo}>
                    <Ionicons name="bag-handle-outline" size={28} color={colors.text} />
                    <View>
                        <Text style={styles.idText}>#{order.id_orders}</Text>
                        <Text style={styles.clientName}>{clientName}</Text>
                    </View>
                </View>

                <View>
                    <Text style={styles.timeText}>{time}</Text>
                    <Text style={styles.timeText}>{date}</Text>
                </View>

                <View style={styles.priceCol}>
                    <Text style={styles.priceText}>{formattedPrice}</Text>
                    <Text style={styles.itemsText}>{itemCount} itens</Text>
                </View>
            </View>

            <Text style={styles.deliveryText}>
                {order.deliveryType?.name || 'Retirada no local'}
            </Text>

            <View style={styles.footerRow}>
                <Pressable onPress={() => onShowDetails(order)}>
                    <Text style={styles.detailsLink}>Ver detalhes &gt;</Text>
                </Pressable>

                <Pressable
                    style={styles.actionButton}
                    disabled={isUpdating}
                    onPress={() => onShowDetails(order)}
                >
                    {isUpdating ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <Text style={styles.actionButtonText}>{getActionButtonText()}</Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}