import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useCart } from '@/context/CartContext';

export function Menu() {

    const router = useRouter();

    const { items } = useCart();

    const totalItems = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return (
        <View style={styles.container}>

            {/* INÍCIO */}
            <Pressable
                style={styles.item}
                onPress={() => router.replace('/home')}
            >
                <Ionicons
                    name="home-outline"
                    size={25}
                    color="#222222"
                />

                <Text style={styles.label}>
                    Início
                </Text>
            </Pressable>


            {/* PEDIDOS */}
            <Pressable
                style={styles.item}
                onPress={() => {
                    console.log('Pedidos');
                }}
            >
                <Ionicons
                    name="bag-handle-outline"
                    size={25}
                    color="#222222"
                />

                <Text style={styles.label}>
                    Pedidos
                </Text>
            </Pressable>


            {/* CARDÁPIO */}
            <Pressable
                style={styles.item}
                onPress={() => router.replace('/cardapio')}
            >
                <View style={styles.menuButton}>

                    <Ionicons
                        name="restaurant-outline"
                        size={27}
                        color="#FFFFFF"
                    />

                </View>

                <Text style={styles.label}>
                    Cardápio
                </Text>
            </Pressable>


            {/* CARRINHO */}
            <Pressable
                style={styles.item}
                onPress={() => {

                    console.log(
                        '🛒 Abrindo carrinho...'
                    );

                    router.push('/cart');
                }}
            >
                <View style={styles.iconContainer}>

                    <Ionicons
                        name="cart-outline"
                        size={25}
                        color="#222222"
                    />

                    {totalItems > 0 && (
                        <View style={styles.cartBadge}>

                            <Text style={styles.cartBadgeText}>
                                {totalItems}
                            </Text>

                        </View>
                    )}

                </View>

                <Text style={styles.label}>
                    Carrinho
                </Text>
            </Pressable>


            {/* PERFIL */}
            <Pressable
                style={styles.item}
                onPress={() => {
                    console.log('Perfil');
                }}
            >
                <Ionicons
                    name="person-outline"
                    size={25}
                    color="#222222"
                />

                <Text style={styles.label}>
                    Perfil
                </Text>
            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        position: 'absolute',

        bottom: 0,
        left: 0,
        right: 0,

        height: 80,

        backgroundColor: '#FFFFFF',

        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',

        paddingHorizontal: 4,

        shadowColor: '#000000',

        shadowOffset: {
            width: 0,
            height: -2,
        },

        shadowOpacity: 0.12,
        shadowRadius: 5,

        elevation: 10,

        zIndex: 100,
    },

    item: {
        flex: 1,

        height: '100%',

        justifyContent: 'center',
        alignItems: 'center',
    },

    label: {
        marginTop: 3,

        fontFamily: 'serif',
        fontSize: 12,

        color: '#333333',
    },

    menuButton: {
        width: 56,
        height: 56,

        borderRadius: 28,

        backgroundColor: '#DD2E8A',

        justifyContent: 'center',
        alignItems: 'center',

        marginTop: -20,
    },

    iconContainer: {
        position: 'relative',

        width: 28,
        height: 28,

        justifyContent: 'center',
        alignItems: 'center',
    },

    cartBadge: {
        position: 'absolute',

        top: -7,
        right: -9,

        minWidth: 18,
        height: 18,

        borderRadius: 9,

        backgroundColor: '#DD2E8A',

        justifyContent: 'center',
        alignItems: 'center',

        paddingHorizontal: 4,
    },

    cartBadgeText: {
        fontSize: 10,

        color: '#FFFFFF',

        fontWeight: 'bold',
    },

});