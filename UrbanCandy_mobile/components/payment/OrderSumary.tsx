import React, { useState } from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/Theme';
import { API_BASE_URL } from '@/services/api';

export default function OrderSummary() {
    const { items, total } = useCart();

    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    const [expanded, setExpanded] = useState(false);

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.white,
            borderRadius: radius.lg,
            padding: space.lg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 8,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerInfo: {
            flex: 1,
        },
        title: {
            fontFamily: font.regular,
            fontSize: fontSize.lg,
            color: colors.text,
        },
        quantity: {
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            marginTop: space.xs,
        },
        right: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        total: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.text,
            marginRight: space.sm,
        },
        itemList: {
            marginTop: space.lg,
            gap: space.sm,
        },
        item: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.secondary,
            borderRadius: radius.md,
            padding: space.sm,
        },
        image: {
            width: 48,
            height: 48,
            borderRadius: radius.md,
            marginRight: space.sm,
        },
        imagePlaceholder: {
            width: 48,
            height: 48,
            borderRadius: radius.md,
            backgroundColor: colors.white,
            marginRight: space.sm,
        },
        itemInfo: {
            flex: 1,
        },
        itemName: {
            fontFamily: font.medium,
            fontSize: fontSize.base,
            color: colors.text,
        },
        itemQuantity: {
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            marginTop: space.xs,
        },
        itemPrice: {
            fontFamily: font.medium,
            fontSize: fontSize.base,
            color: colors.text,
        },
    });

    return (
        <View style={styles.container}>
            <Pressable
                style={styles.header}
                onPress={() => setExpanded((previous) => !previous)}
            >
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>
                        Resumo do pedido
                    </Text>

                    <Text style={styles.quantity}>
                        {items.length} itens
                    </Text>
                </View>

                <View style={styles.right}>
                    <Text style={styles.total}>
                        R$ {total.toFixed(2).replace('.', ',')}
                    </Text>

                    <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={22}
                        color={colors.text}
                    />
                </View>
            </Pressable>

            {expanded && (
                <View style={styles.itemList}>
                    {items.map((item) => {
                        const imageUrl = item.product.image
                            ? `${API_BASE_URL}/uploads/${item.product.image}`
                            : null;

                        return (
                            <View
                                key={item.id_product}
                                style={styles.item}
                            >
                                {imageUrl ? (
                                    <Image
                                        source={{ uri: imageUrl }}
                                        style={styles.image}
                                    />
                                ) : (
                                    <View
                                        style={styles.imagePlaceholder}
                                    />
                                )}

                                <View style={styles.itemInfo}>
                                    <Text
                                        style={styles.itemName}
                                        numberOfLines={1}
                                    >
                                        {item.product.name}
                                    </Text>

                                    <Text style={styles.itemQuantity}>
                                        {item.quantity} itens
                                    </Text>
                                </View>

                                <Text style={styles.itemPrice}>
                                    R${' '}
                                    {(
                                        item.product.price *
                                        item.quantity
                                    )
                                        .toFixed(2)
                                        .replace('.', ',')}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}