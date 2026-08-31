import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/Theme';
import { getUser, type AuthUser } from '@/services/authStorage';

export function Menu() {
    const router = useRouter();
    const { items } = useCart();
    const { colors, font, fontSize, space, radius, sizes } = useTheme();

    const [user, setUser] = useState<AuthUser | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);

    const totalItems = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    useEffect(() => {
        async function loadUser() {
            const storedUser = await getUser();
            setUser(storedUser);
        }

        loadUser();
    }, []);

    const isAdministrative = user?.roles?.some(
        (role) => {
            const normalizedRole = role.toLowerCase();
            return normalizedRole === 'funcionario' ||
                normalizedRole === 'funcionário' ||
                normalizedRole === 'gerente';
        }
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
            shadowOffset: { width: 0, height: -2 },
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
        profileCard: {
            position: 'absolute',
            right: 12,
            bottom: sizes.bottomMenuHeight + 10,
            width: 230,
            backgroundColor: colors.white,
            borderRadius: radius.lg,
            paddingVertical: space.xs,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 12,
            zIndex: 200,
        },
        profileOption: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: space.md,
            paddingVertical: space.md,
        },
        profileOptionText: {
            marginLeft: space.sm,
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.text,
        },
        divider: {
            height: 1,
            backgroundColor: '#EEEEEE',
            marginHorizontal: space.sm,
        },
    });

    return (
        <>
            {profileOpen && (
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => setProfileOpen(false)}
                />
            )}

            {profileOpen && (
                <View style={styles.profileCard}>
                    <Pressable
                        style={styles.profileOption}
                        onPress={() => {
                            setProfileOpen(false);
                            router.push('/cadastro');
                        }}
                    >
                        <Ionicons
                            name="person-outline"
                            size={23}
                            color={colors.text}
                        />
                        <Text style={styles.profileOptionText}>
                            Meus dados
                        </Text>
                    </Pressable>

                    {isAdministrative && (
                        <>
                            <View style={styles.divider} />

                            <Pressable
                                style={styles.profileOption}
                                onPress={() => {
                                    setProfileOpen(false);
                                    console.log(
                                        'Área administrativa'
                                    );
                                }}
                            >
                                <Ionicons
                                    name="settings-outline"
                                    size={23}
                                    color={colors.text}
                                />
                                <Text style={styles.profileOptionText}>
                                    Área administrativa
                                </Text>
                            </Pressable>
                        </>
                    )}
                </View>
            )}

            <View style={styles.container}>
                <Pressable
                    style={styles.item}
                    onPress={() =>
                        router.replace('/protected/home')
                    }
                >
                    <Ionicons
                        name="home-outline"
                        size={25}
                        color={colors.text}
                    />
                    <Text style={styles.label}>Início</Text>
                </Pressable>

                <Pressable
                    style={styles.item}
                    onPress={() =>
                        router.push('/protected/orders')
                    }
                >
                    <Ionicons
                        name="bag-handle-outline"
                        size={25}
                        color={colors.text}
                    />
                    <Text style={styles.label}>Pedidos</Text>
                </Pressable>

                <Pressable
                    style={styles.item}
                    onPress={() =>
                        router.replace('/protected/cardapio')
                    }
                >
                    <View style={styles.menuButton}>
                        <Ionicons
                            name="restaurant-outline"
                            size={27}
                            color={colors.white}
                        />
                    </View>
                    <Text style={styles.label}>Cardápio</Text>
                </Pressable>

                <Pressable
                    style={styles.item}
                    onPress={() =>
                        router.push('/protected/cart')
                    }
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

                    <Text style={styles.label}>Carrinho</Text>
                </Pressable>

                <Pressable
                    style={styles.item}
                    onPress={() =>
                        setProfileOpen((current) => !current)
                    }
                >
                    <Ionicons
                        name="person-outline"
                        size={25}
                        color={colors.text}
                    />
                    <Text style={styles.label}>Perfil</Text>
                </Pressable>
            </View>
        </>
    );
}