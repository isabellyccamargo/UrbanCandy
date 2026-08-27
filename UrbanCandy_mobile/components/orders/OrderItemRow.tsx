import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/Theme';

type OrderItem = {
    id_orderItem: number;
    id_product: number;
    quantity: number;
    sub_total: number | string;
    products?: {
        name: string;
        price: number | string;
    };
};

type Props = {
    item: OrderItem;
};

export default function OrderItemRow({ item }: Props) {
    const { colors, font, fontSize, space } = useTheme();

    const price = Number(item.sub_total ?? 0)
        .toFixed(2)
        .replace('.', ',');

    return (
        <View
            style={[
                styles.container,
                { borderBottomColor: colors.border },
            ]}
        >
            <View style={styles.row}>
                <Text
                    style={[
                        styles.name,
                        {
                            color: colors.text,
                            fontFamily: font.semibold,
                            fontSize: fontSize.md,
                        },
                    ]}
                >
                    {item.products?.name ??
                        `Produto #${item.id_product}`}
                </Text>

                <Text
                    style={[
                        styles.price,
                        {
                            color: colors.text,
                            fontFamily: font.semibold,
                            fontSize: fontSize.md,
                        },
                    ]}
                >
                    R$ {price}
                </Text>
            </View>

            <Text
                style={[
                    styles.quantity,
                    {
                        color: colors.textTertiary,
                        fontFamily: font.regular,
                        fontSize: fontSize.sm,
                    },
                ]}
            >
                Quantidade: {item.quantity}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    name: {
        flex: 1,
        marginRight: 12,
    },
    price: {
        marginLeft: 8,
    },
    quantity: {
        marginTop: 4,
    },
});