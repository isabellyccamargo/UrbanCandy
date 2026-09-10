import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/Theme';
import { useAuth } from '@/context/AuthContext';

export function Menu() {
    const router = useRouter();
    const { items } = useCart();
    const { colors, font, fontSize, space, radius, sizes } = useTheme();
    const { user } = useAuth();

    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    const userRoles: string[] = Array.isArray(user?.roles)
        ? user.roles
        : Array.isArray((user as any)?.People?.roles)
            ? (user as any).People.roles
            : [];

    const normalizedRoles = userRoles.map((r) =>
        String(r).toLowerCase().replace(/^role_/, '').trim()
    );

    const isGerente = normalizedRoles.some((r) => r === 'gerente' || r === 'admin' || r === '3');
    const isFuncionario = normalizedRoles.some((r) => r === 'funcionario' || r === 'atendente' || r === '2');
    const isStaff = isGerente || isFuncionario;

    const handleProfileNav = () => {
        setIsMoreMenuOpen(false);
        router.push({
            pathname: '/cadastro',
            params: { mode: 'edit' }
        });
    };

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
            elevation: 10,
            zIndex: 100,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.12,
            shadowRadius: 5,
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
        popoverOverlay: {
            flex: 1,
            backgroundColor: 'transparent',
        },
        popoverBox: {
            position: 'absolute',
            bottom: sizes.bottomMenuHeight + 8,
            right: 16,
            width: 200,
            backgroundColor: colors.white,
            borderRadius: radius.md,
            paddingVertical: space.xs,
            elevation: 8,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            borderWidth: 1,
            borderColor: colors.border ?? '#E0E0E0',
        },
        popoverOption: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            gap: 10,
        },
        popoverOptionText: {
            fontSize: fontSize.sm,
            color: colors.text,
            fontFamily: font.medium,
        },
        divider: {
            height: 1,
            backgroundColor: colors.border ?? '#F0F0F0',
            marginVertical: 2,
        },
    });

    return (
        <>
            <View style={styles.container}>
                <Pressable style={styles.item} onPress={() => router.push('/protected/home')}>
                    <Ionicons name="home-outline" size={25} color={colors.text} />
                    <Text style={styles.label}>Início</Text>
                </Pressable>

                <Pressable style={styles.item} onPress={() => router.push('/cart')}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="cart-outline" size={25} color={colors.text} />
                        {totalItems > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{totalItems}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.label}>Carrinho</Text>
                </Pressable>

                <Pressable style={styles.item} onPress={() => router.push('/protected/cardapio')}>
                    <View style={styles.menuButton}>
                        <Ionicons name="restaurant-outline" size={27} color={colors.white} />
                    </View>
                    <Text style={styles.label}>Cardápio</Text>
                </Pressable>

                {/* Direcionamento exclusivo por perfil */}
                {isGerente ? (
                    <Pressable
                        style={styles.item}
                        onPress={() => router.push('/protected/dashboard' as any)}
                    >
                        <Ionicons name="bar-chart-outline" size={25} color={colors.text} />
                        <Text style={styles.label}>Dashboard</Text>
                    </Pressable>
                ) : isFuncionario ? (
                    <Pressable
                        style={styles.item}
                        onPress={() => router.push('/protected/employeeOrders' as any)}
                    >
                        <Ionicons name="clipboard-outline" size={25} color={colors.text} />
                        <Text style={styles.label}>Gerenciar</Text>
                    </Pressable>
                ) : (
                    <Pressable style={styles.item} onPress={() => router.push('/protected/orders')}>
                        <Ionicons name="bag-handle-outline" size={25} color={colors.text} />
                        <Text style={styles.label}>Pedidos</Text>
                    </Pressable>
                )}

                {isStaff ? (
                    <Pressable style={styles.item} onPress={() => setIsMoreMenuOpen(true)}>
                        <Ionicons
                            name="ellipsis-horizontal-circle-outline"
                            size={25}
                            color={colors.text}
                        />
                        <Text style={styles.label}>Mais</Text>
                    </Pressable>
                ) : (
                    <Pressable style={styles.item} onPress={handleProfileNav}>
                        <Ionicons name="person-outline" size={25} color={colors.text} />
                        <Text style={styles.label}>Perfil</Text>
                    </Pressable>
                )}
            </View>

            <Modal
                visible={isMoreMenuOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsMoreMenuOpen(false)}
            >
                <Pressable style={styles.popoverOverlay} onPress={() => setIsMoreMenuOpen(false)}>
                    <View style={styles.popoverBox}>
                        <Pressable
                            style={styles.popoverOption}
                            onPress={() => {
                                setIsMoreMenuOpen(false);
                                router.push('/protected/orders');
                            }}
                        >
                            <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                            <Text style={styles.popoverOptionText}>Meus Pedidos</Text>
                        </Pressable>

                        <View style={styles.divider} />

                        <Pressable style={styles.popoverOption} onPress={handleProfileNav}>
                            <Ionicons name="person-outline" size={20} color={colors.primary} />
                            <Text style={styles.popoverOptionText}>Meus Dados</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}