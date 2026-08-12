import {
    StyleSheet,
    TextInput,
    View,
    Pressable,
    Text,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useCart } from '@/context/CartContext';

export function HomeHeader() {
    const { items } = useCart();
    const router = useRouter();

    const totalItems = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return (
        <View style={styles.container}>

            <View style={styles.searchContainer}>
                <Ionicons
                    name="search-outline"
                    size={24}
                    color="#000000"
                />

                <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor="#777777"
                    returnKeyType="search"
                />
            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.cartButton,
                    pressed && styles.pressed,
                ]}
                onPress={() => {
                    console.log('🛒 Abrindo carrinho...');

                    router.push('/cart');
                }}
            >
                <Ionicons
                    name="cart-outline"
                    size={25}
                    color="#000000"
                />

                {totalItems > 0 && (
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>
                            {totalItems}
                        </Text>
                    </View>
                )}
            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        gap: 12,
    },

    searchContainer: {
        flex: 1,
        height: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },

    input: {
        flex: 1,
        height: '100%',
        marginLeft: 6,
        fontSize: 16,
        color: '#3B1E36',
    },

    cartButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },

    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
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

    pressed: {
        opacity: 0.6,
        transform: [{ scale: 0.95 }],
    },
});