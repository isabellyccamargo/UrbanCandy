import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useTheme } from '@/context/Theme';
import { getAllDeliveryTypes } from '@/services/delivery';

type DeliveryType = {
    id_type_delivery: number;
    name: string;
};

type CartSummaryProps = {
    subtotal: number;
    onCheckout: (id_type_delivery: number) => void;
};

export default function CartSummary({
    subtotal,
    onCheckout,
}: CartSummaryProps) {
    const { colors, font, fontSize, space, radius, sizes } = useTheme();

    const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>([]);
    const [selectedDelivery, setSelectedDelivery] =
        useState<DeliveryType | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDeliveryTypes();
    }, []);

    async function loadDeliveryTypes() {
        try {
            const response = await getAllDeliveryTypes();
            setDeliveryTypes(response?.data ?? []);
        } catch (error) {
            console.error('Erro ao carregar tipos de entrega:', error);
        } finally {
            setLoading(false);
        }
    }

    function selectDelivery(type: DeliveryType) {
        setSelectedDelivery(type);
        setModalVisible(false);
    }

    function handleCheckout() {
        if (!selectedDelivery) return;

        onCheckout(selectedDelivery.id_type_delivery);
    }

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.label}>
                    Subtotal
                </Text>

                <Text style={styles.value}>
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                </Text>
            </View>

            <Text style={styles.deliveryLabel}>
                Tipo de entrega
            </Text>

            <Pressable
                style={styles.deliverySelector}
                onPress={() => setModalVisible(true)}
            >
                <Text
                    style={
                        selectedDelivery
                            ? styles.selectedDeliveryText
                            : styles.placeholder
                    }
                >
                    {selectedDelivery
                        ? selectedDelivery.name
                        : 'Escolha como deseja receber'}
                </Text>

                <Text style={styles.arrow}>
                    ›
                </Text>
            </Pressable>

            <View style={styles.line} />

            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                    Total do Pedido
                </Text>

                <Text style={styles.total}>
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                </Text>
            </View>

            <Pressable
                style={[
                    styles.button,
                    !selectedDelivery && styles.disabled,
                ]}
                onPress={handleCheckout}
                disabled={!selectedDelivery}
            >
                <Text style={styles.buttonText}>
                    Finalizar compra
                </Text>
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
                        <Text style={styles.modalTitle}>
                            Como deseja receber?
                        </Text>

                        {loading ? (
                            <ActivityIndicator
                                color={colors.primary}
                                size="large"
                            />
                        ) : (
                            deliveryTypes.map((type) => (
                                <Pressable
                                    key={type.id_type_delivery}
                                    style={styles.option}
                                    onPress={() => selectDelivery(type)}
                                >
                                    <Text style={styles.optionText}>
                                        {type.name}
                                    </Text>
                                </Pressable>
                            ))
                        )}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        paddingBottom: 100,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    label: {
        fontFamily: 'Quicksand_400Regular',
        fontSize: 16,
        color: '#666666',
    },

    value: {
        fontFamily: 'Quicksand_600SemiBold',
        fontSize: 16,
        color: '#333333',
    },

    deliveryLabel: {
        fontFamily: 'Quicksand_600SemiBold',
        fontSize: 16,
        color: '#222222',
        marginBottom: 8,
    },

    deliverySelector: {
        height: 48,
        borderWidth: 1,
        borderColor: '#DD2E8A',
        borderRadius: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    placeholder: {
        fontFamily: 'Quicksand_400Regular',
        fontSize: 14,
        color: '#999999',
    },

    selectedDeliveryText: {
        fontFamily: 'Quicksand_600SemiBold',
        fontSize: 15,
        color: '#DD2E8A',
    },

    arrow: {
        fontSize: 26,
        color: '#DD2E8A',
    },

    line: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 14,
    },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    totalLabel: {
        fontFamily: 'Quicksand_600SemiBold',
        fontSize: 18,
        color: '#222222',
    },

    total: {
        fontFamily: 'Quicksand_700Bold',
        fontSize: 21,
        color: '#DD2E8A',
    },

    button: {
        height: 48,
        backgroundColor: '#DD2E8A',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 18,
    },

    disabled: {
        opacity: 0.5,
    },

    buttonText: {
        fontFamily: 'Quicksand_600SemiBold',
        fontSize: 18,
        color: '#FFFFFF',
    },

    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },

    modal: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        paddingBottom: 40,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },

    modalTitle: {
        fontFamily: 'Quicksand_600SemiBold',
        fontSize: 20,
        color: '#222222',
        marginBottom: 18,
    },

    option: {
        height: 52,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        borderRadius: 12,
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginBottom: 10,
    },

    optionText: {
        fontFamily: 'Quicksand_400Regular',
        fontSize: 16,
        color: '#333333',
    },
});