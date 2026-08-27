import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/context/Theme';
import { getAllDeliveryTypes } from '@/services/delivery';
import { useAppAlert } from '@/components/common/AppAlert';

type DeliveryType = {
    id_type_delivery: number;
    name: string;
};

type CartSummaryProps = {
    subtotal: number;
    onCheckout: (id_type_delivery: number) => void;
};

export default function CartSummary({ subtotal, onCheckout }: CartSummaryProps) {
    const { colors, font, fontSize, space, radius, sizes } = useTheme();
    const { showMessage } = useAppAlert();
    const router = useRouter();

    const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>([]);
    const [selectedDelivery, setSelectedDelivery] = useState<DeliveryType | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDeliveryTypes();
    }, []);

    async function loadDeliveryTypes() {
        try {
            const response = await getAllDeliveryTypes();
            setDeliveryTypes(response?.data ?? []);
        } catch {
            showMessage(
                'Erro',
                'Não foi possível carregar os tipos de entrega.',
                undefined,
                'error'
            );
        } finally {
            setLoading(false);
        }
    }

    function selectDelivery(type: DeliveryType) {
        setSelectedDelivery(type);
        setModalVisible(false);
    }

    function handleCheckout() {
        if (!selectedDelivery) {
            showMessage(
                'Atenção',
                'Selecione um tipo de entrega antes de continuar.',
                undefined,
                'warning'
            );
            return;
        }

        onCheckout(selectedDelivery.id_type_delivery);

        router.push({
            pathname: '/protected/payment',
            params: {
                id_delivery: String(selectedDelivery.id_type_delivery),
            },
        });
    }

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.white,
            padding: space.xl,
            paddingBottom: 100,
            borderTopLeftRadius: radius.xxl,
            borderTopRightRadius: radius.xxl,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 8,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: space.lg,
        },
        label: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.textSecondary,
        },
        value: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.text,
        },
        deliveryLabel: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.text,
            marginBottom: space.sm,
        },
        deliverySelector: {
            minHeight: sizes.inputHeight,
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: radius.lg,
            paddingHorizontal: space.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        placeholder: {
            flex: 1,
            fontFamily: font.regular,
            fontSize: fontSize.base,
            color: colors.textTertiary,
        },
        selectedDeliveryText: {
            flex: 1,
            fontFamily: font.semibold,
            fontSize: fontSize.base,
            color: colors.primary,
        },
        arrow: {
            fontSize: fontSize.xxl,
            color: colors.primary,
            marginLeft: space.sm,
        },
        line: {
            height: 1,
            backgroundColor: colors.border,
            marginVertical: space.lg,
        },
        totalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        totalLabel: {
            fontFamily: font.semibold,
            fontSize: fontSize.lg,
            color: colors.text,
        },
        total: {
            fontFamily: font.bold,
            fontSize: fontSize.xl,
            color: colors.primary,
        },
        button: {
            height: sizes.buttonHeight,
            backgroundColor: colors.primary,
            borderRadius: radius.pill,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: space.lg,
        },
        buttonText: {
            fontFamily: font.semibold,
            fontSize: fontSize.lg,
            color: colors.white,
        },
        modalBackground: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'flex-end',
        },
        modal: {
            backgroundColor: colors.white,
            padding: space.xxl,
            paddingBottom: space.huge,
            borderTopLeftRadius: radius.xxl,
            borderTopRightRadius: radius.xxl,
        },
        modalTitle: {
            fontFamily: font.semibold,
            fontSize: fontSize.xl,
            color: colors.text,
            marginBottom: space.lg,
        },
        option: {
            minHeight: sizes.inputHeight,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            justifyContent: 'center',
            paddingHorizontal: space.lg,
            marginBottom: space.sm,
        },
        optionText: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.text,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.value}>
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                </Text>
            </View>

            <Text style={styles.deliveryLabel}>Tipo de entrega</Text>

            <Pressable
                style={styles.deliverySelector}
                onPress={() => setModalVisible(true)}
            >
                <Text style={selectedDelivery ? styles.selectedDeliveryText : styles.placeholder}>
                    {selectedDelivery?.name || 'Escolha como deseja receber'}
                </Text>
                <Text style={styles.arrow}>›</Text>
            </Pressable>

            <View style={styles.line} />

            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total do Pedido</Text>
                <Text style={styles.total}>
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                </Text>
            </View>

            <Pressable style={styles.button} onPress={handleCheckout}>
                <Text style={styles.buttonText}>Finalizar compra</Text>
            </Pressable>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalBackground}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Como deseja receber?</Text>

                        {loading ? (
                            <ActivityIndicator color={colors.primary} size="large" />
                        ) : (
                            deliveryTypes.map(type => (
                                <Pressable
                                    key={type.id_type_delivery}
                                    style={styles.option}
                                    onPress={() => selectDelivery(type)}
                                >
                                    <Text style={styles.optionText}>{type.name}</Text>
                                </Pressable>
                            ))
                        )}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}