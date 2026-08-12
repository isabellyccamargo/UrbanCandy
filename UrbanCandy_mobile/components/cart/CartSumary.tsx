import React from 'react';

import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Fonts } from '@/constants/fonts';

type CartSummaryProps = {
    subtotal: number;
    onCheckout: () => void;
};

export default function CartSummary({
    subtotal,
    onCheckout,
}: CartSummaryProps) {

    return (
        <View style={styles.container}>

            <View style={styles.row}>
                <Text style={styles.label}>
                    Subtotal
                </Text>

                <Text style={styles.value}>
                    R$ {subtotal
                        .toFixed(2)
                        .replace('.', ',')}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>
                    Entrega
                </Text>

                <Text style={styles.value}>
                    A calcular
                </Text>
            </View>

            <View style={styles.line} />

            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                    Total do Pedido
                </Text>

                <Text style={styles.total}>
                    R$ {subtotal
                        .toFixed(2)
                        .replace('.', ',')}
                </Text>
            </View>

            <Pressable
                style={styles.button}
                onPress={onCheckout}
            >
                <Text style={styles.buttonText}>
                    Finalizar compra
                </Text>
            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 100,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },

    label: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#666666',
    },

    value: {
        fontFamily: Fonts.semibold,
        fontSize: 16,
        color: '#333333',
    },

    line: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 10,
    },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    totalLabel: {
        fontFamily: Fonts.semibold,
        fontSize: 18,
        color: '#222222',
    },

    total: {
        fontFamily: Fonts.bold,
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

    buttonText: {
        fontFamily: Fonts.semibold,
        fontSize: 18,
        color: '#FFFFFF',
    },
});