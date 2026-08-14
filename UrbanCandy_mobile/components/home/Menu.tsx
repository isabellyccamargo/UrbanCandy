import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/Theme';

export function Menu() {

    const router = useRouter();

    const { items } = useCart();

    const {
        colors,
        font,
        fontSize,
        space,
        radius,
        sizes,
    } = useTheme();

    const totalItems = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const styles = StyleSheet.create({

        container: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: sizes.bottomMenuHeight,
            backgroundColor: colors.white,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            paddingHorizontal: space.xs,
            shadowColor: colors.text,
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
            marginTop: space.xs,
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.text,
        },

        menuButton: {
            width: 56,
            height: 56,
            borderRadius: radius.pill,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: -20,
        },

        iconContainer: {
            position: 'relative',
            width: sizes.iconContainer,
            height: sizes.iconContainer,
            justifyContent: 'center',
            alignItems: 'center',
        },

        cartBadge: {
            position: 'absolute',
            top: -7,
            right: -9,
            minWidth: 18,
            height: 18,
            borderRadius: radius.pill,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: space.xs,
        },

        cartBadgeText: {
            fontSize: fontSize.xs,
            color: colors.white,
            fontFamily: font.bold,
        },

    });

    return (
        <View style={styles.container}>

            <Pressable
                style={styles.item}
                onPress={() => router.replace('/home')}
            >
                <Ionicons
                    name="home-outline"
                    size={25}
                    color={colors.text}
                />

                <Text style={styles.label}>
                    Início
                </Text>
            </Pressable>

            <Pressable
                style={styles.item}
                onPress={() => {
                    console.log('Pedidos');
                }}
            >
                <Ionicons
                    name="bag-handle-outline"
                    size={25}
                    color={colors.text}
                />

                <Text style={styles.label}>
                    Pedidos
                </Text>
            </Pressable>

            <Pressable
                style={styles.item}
                onPress={() => router.replace('/cardapio')}
            >
                <View style={styles.menuButton}>

                    <Ionicons
                        name="restaurant-outline"
                        size={27}
                        color={colors.white}
                    />

                </View>

                <Text style={styles.label}>
                    Cardápio
                </Text>
            </Pressable>

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
                        color={colors.text}
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

            <Pressable
                style={styles.item}
                onPress={() => {
                    console.log('Perfil');
                }}
            >
                <Ionicons
                    name="person-outline"
                    size={25}
                    color={colors.text}
                />

                <Text style={styles.label}>
                    Perfil
                </Text>
            </Pressable>

        </View>
    );
}