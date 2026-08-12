import React from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { Fonts } from '@/constants/fonts';
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
                        <Text>Sem imagem</Text>
                    </View>
                )}
            </View>

            <View style={styles.info}>

                {/* NOME + LIXEIRA */}
                <View style={styles.nameRow}>
                    <Text
                        style={styles.name}
                        numberOfLines={2}
                    >
                        {product.name}
                    </Text>

                    <Pressable
                        onPress={onRemove}
                        style={styles.removeButton}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={21}
                            color="#DD2E8A"
                        />
                    </Pressable>
                </View>

                <Text style={styles.price}>
                    R$ {Number(product.price)
                        .toFixed(2)
                        .replace('.', ',')}
                </Text>

                <View style={styles.bottomRow}>

                    <View style={styles.quantity}>

                        <Pressable
                            onPress={onDecrease}
                            style={styles.qtyButton}
                        >
                            <Text style={styles.qtyText}>
                                −
                            </Text>
                        </Pressable>

                        <Text style={styles.quantityText}>
                            {quantity}
                        </Text>

                        <Pressable
                            onPress={onIncrease}
                            style={styles.qtyButton}
                        >
                            <Text style={styles.qtyText}>
                                +
                            </Text>
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

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 18,
        marginBottom: 14,
        padding: 12,
        borderRadius: 14,
        minHeight: 125,
    },

    imageContainer: {
        width: 95,
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
    },

    image: {
        width: '100%',
        height: '100%',
    },

    imagePlaceholder: {
        flex: 1,
        backgroundColor: '#EEEEEE',
        justifyContent: 'center',
        alignItems: 'center',
    },

    info: {
        flex: 1,
        marginLeft: 12,
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },

    name: {
        flex: 1,
        fontFamily: Fonts.semibold,
        fontSize: 17,
        color: '#222222',
        paddingRight: 6,
    },

    removeButton: {
        padding: 2,
        marginLeft: 4,
    },

    price: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: '#DD2E8A',
        marginTop: 5,
    },

    bottomRow: {
        marginTop: 12,
    },

    quantity: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DD2E8A',
        borderRadius: 18,
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
        fontFamily: Fonts.bold,
        fontSize: 18,
        color: '#DD2E8A',
    },

    quantityText: {
        fontFamily: Fonts.semibold,
        fontSize: 15,
        color: '#222222',
        minWidth: 25,
        textAlign: 'center',
    },

    subtotal: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        fontFamily: Fonts.bold,
        fontSize: 15,
        color: '#222222',
    },
});