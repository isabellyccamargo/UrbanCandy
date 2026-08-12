import React from 'react';

import {
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { useCart } from '@/context/CartContext';

import CartHeader from '@/components/cart/CartHeader';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSumary';

import { Menu } from '@/components/home/Menu';

export default function CartScreen() {

    const {
        items,
        total,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
    } = useCart();

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
                    keyExtractor={(item) =>
                        String(item.id_product)
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={
                        styles.list
                    }
                    renderItem={({ item }) => (
                        <CartItem
                            product={item.product}
                            quantity={item.quantity}
                            onIncrease={() =>
                                increaseQuantity(
                                    item.id_product
                                )
                            }
                            onDecrease={() =>
                                decreaseQuantity(
                                    item.id_product
                                )
                            }
                            onRemove={() =>
                                removeFromCart(
                                    item.id_product
                                )
                            }
                        />
                    )}
                />

            )}

            {items.length > 0 && (
                <CartSummary
                    subtotal={total}
                    onCheckout={() =>
                        console.log(
                            'Finalizar compra'
                        )
                    }
                />
            )}

            <Menu />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },

    topSection: {
        height: 125,
        backgroundColor: '#E7C9DA',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },

    list: {
        paddingTop: 20,
        paddingBottom: 20,
    },

    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    emptyIcon: {
        fontSize: 70,
        marginBottom: 15,
    },

    emptyTitle: {
        fontSize: 21,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },

    emptyText: {
        fontSize: 16,
        color: '#777777',
    },
});