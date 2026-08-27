import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/Theme';

import CartHeader from '@/components/cart/CartHeader';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSumary';
import { Menu } from '@/components/home/Menu';

export default function CartScreen() {
    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    const {
        items,
        total,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
    } = useCart();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },

        topSection: {
            height: 125,
            backgroundColor: colors.secondary,
            borderBottomLeftRadius: radius.xxl,
            borderBottomRightRadius: radius.xxl,
        },

        list: {
            paddingTop: space.xl,
            paddingBottom: space.xl,
        },

        empty: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: space.xxxl,
        },

        emptyIcon: {
            fontSize: 70,
            marginBottom: space.md,
        },

        emptyTitle: {
            fontFamily: font.semibold,
            fontSize: fontSize.xl,
            color: colors.text,
            marginBottom: space.sm,
            textAlign: 'center',
        },

        emptyText: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.textTertiary,
            textAlign: 'center',
        },
    });

    /*
     * Cria um identificador único para o item.
     *
     * Produto:
     * product-5
     *
     * Oferta:
     * offer-2
     */
    function getItemId(item: (typeof items)[number]) {
        if (item.isOffer && item.id_offer) {
            return `offer-${item.id_offer}`;
        }

        return `product-${item.id_product}`;
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.topSection}>
                <CartHeader />
            </View>

            {items.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>
                        🛒
                    </Text>

                    <Text style={styles.emptyTitle}>
                        Seu carrinho está vazio
                    </Text>

                    <Text style={styles.emptyText}>
                        Adicione produtos deliciosos!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={getItemId}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => {
                        const itemId =
                            getItemId(item);

                        return (
                            <CartItem
                                product={item.product}
                                quantity={item.quantity}

                                onIncrease={() =>
                                    increaseQuantity(
                                        itemId
                                    )
                                }

                                onDecrease={() =>
                                    decreaseQuantity(
                                        itemId
                                    )
                                }

                                onRemove={() =>
                                    removeFromCart(
                                        itemId
                                    )
                                }
                            />
                        );
                    }}
                />
            )}

            {items.length > 0 && (
                <CartSummary
                    subtotal={total}
                    onCheckout={() => {}}
                />
            )}

            <Menu />
        </View>
    );
}