import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '@/context/Theme';
import { API_BASE_URL } from '@/services/api';

type Product = {
    id_product: number;
    name: string;
    price: number;
    image?: string;
};

type CartItemProps = {
    product: Product;
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    onRemove: () => void;
};

export default function CartItem({
    product,
    quantity,
    onIncrease,
    onDecrease,
    onRemove,
}: CartItemProps) {
    const { colors, font, fontSize, space, radius } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            backgroundColor: colors.white,
            marginHorizontal: 18,
            marginBottom: space.md,
            padding: space.md,
            borderRadius: radius.lg,
            minHeight: 125,
        },
        imageContainer: {
            width: 95,
            height: 100,
            borderRadius: radius.md,
            overflow: 'hidden',
        },
        image: {
            width: '100%',
            height: '100%',
        },
        imagePlaceholder: {
            flex: 1,
            backgroundColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        placeholderText: {
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.textTertiary,
        },
        info: {
            flex: 1,
            marginLeft: space.md,
        },
        nameRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
        },
        name: {
            flex: 1,
            fontFamily: font.semibold,
            fontSize: fontSize.lg,
            color: colors.text,
            paddingRight: 6,
        },
        removeButton: {
            padding: 2,
            marginLeft: 4,
        },
        price: {
            fontFamily: font.bold,
            fontSize: fontSize.md,
            color: colors.primary,
            marginTop: 5,
        },
        bottomRow: {
            marginTop: space.md,
        },
        quantity: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: radius.xl,
            overflow: 'hidden',
            alignSelf: 'flex-start',
        },
        qtyButton: {
            width: 30,
            height: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
        qtyText: {
            fontFamily: font.bold,
            fontSize: fontSize.lg,
            color: colors.primary,
        },
        quantityText: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.text,
            minWidth: 25,
            textAlign: 'center',
        },
        subtotal: {
            position: 'absolute',
            right: space.md,
            bottom: space.md,
            fontFamily: font.bold,
            fontSize: fontSize.md,
            color: colors.text,
        },
    });

    const imageUrl = product.image
        ? `${API_BASE_URL}/uploads/${product.image}`
        : null;

    const subtotal = Number(product.price) * quantity;

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.placeholderText}>Sem imagem</Text>
                    </View>
                )}
            </View>

            <View style={styles.info}>
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={2}>
                        {product.name}
                    </Text>

                    <Pressable
                        onPress={onRemove}
                        style={styles.removeButton}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={21}
                            color={colors.primary}
                        />
                    </Pressable>
                </View>

                <Text style={styles.price}>
                    R$ {Number(product.price).toFixed(2).replace('.', ',')}
                </Text>

                <View style={styles.bottomRow}>
                    <View style={styles.quantity}>
                        <Pressable
                            onPress={onDecrease}
                            style={styles.qtyButton}
                        >
                            <Text style={styles.qtyText}>−</Text>
                        </Pressable>

                        <Text style={styles.quantityText}>{quantity}</Text>

                        <Pressable
                            onPress={onIncrease}
                            style={styles.qtyButton}
                        >
                            <Text style={styles.qtyText}>+</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            <Text style={styles.subtotal}>
                R$ {subtotal.toFixed(2).replace('.', ',')}
            </Text>
        </View>
    );
}