import React from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/Theme';

import CartHeader from '@/components/cart/CartHeader';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSumary';

export default function CartScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        colors,
        font,
        fontSize,
        space,
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
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },

        backdrop: {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
        },

        drawer: {
            width: '90%',
            maxWidth: 420,
            height: '100%',
            backgroundColor: colors.background,
            overflow: 'hidden',
            elevation: 18,
            shadowColor: '#000',
            shadowOffset: { width: -4, height: 0 },
            shadowOpacity: 0.18,
            shadowRadius: 12,
        },

        topSection: {
            backgroundColor: colors.white,
            paddingTop: insets.top,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },

        list: {
            paddingTop: space.lg,
            paddingBottom: space.xl,
            flexGrow: 1,
        },
        itemList: {
            flex: 1,
        },

        empty: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: space.xl,
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

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar carrinho"
                onPress={() => router.back()}
                style={styles.backdrop}
            />

            <View style={styles.drawer}>
                <View style={styles.topSection}>
                    <CartHeader />
                </View>

                {items.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>🛒</Text>
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
                        style={styles.itemList}
                        contentContainerStyle={styles.list}
                        renderItem={({ item }) => {
                            const itemId = getItemId(item);

                            return (
                                <CartItem
                                    product={item.product}
                                    quantity={item.quantity}
                                    isOffer={item.isOffer}
                                    onIncrease={() => increaseQuantity(itemId)}
                                    onDecrease={() => decreaseQuantity(itemId)}
                                    onRemove={() => removeFromCart(itemId)}
                                />
                            );
                        }}
                    />
                )}

                {items.length > 0 && (
                    <CartSummary subtotal={total} bottomInset={insets.bottom} />
                )}
            </View>
        </View>
    );
}