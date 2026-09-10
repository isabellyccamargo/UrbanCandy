// components/EmployeeMenu.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '@/context/Theme';

export function EmployeeMenu() {
    const { colors, font, fontSize, space, sizes, radius } = useTheme();
    const router = useRouter();
    const pathname = usePathname();

    const isOrders = pathname.includes('employeeOrders');
    const isProfile = pathname.includes('cadastro');
    const isStore = pathname.includes('home');

    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: sizes.bottomMenuHeight,
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: space.md,
            elevation: 8,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
        },
        tabItem: {
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
        },
        tabText: {
            fontFamily: font.medium,
            fontSize: fontSize.xs,
            color: colors.textSecondary,
            marginTop: 2,
        },
        tabTextActive: {
            color: colors.primary,
            fontFamily: font.bold,
        },
        fabWrapper: {
            alignItems: 'center',
            justifyContent: 'center',
            top: -20,
        },
        fabButton: {
            width: 56,
            height: 56,
            borderRadius: radius.circle,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 6,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
        },
        fabText: {
            fontFamily: font.medium,
            fontSize: fontSize.xs,
            color: colors.primary,
            marginTop: space.xs,
        },
    });

    return (
        <View style={styles.container}>
            <Pressable style={styles.tabItem} onPress={() => router.push('/cadastro')}>
                <Ionicons
                    name={isProfile ? 'person' : 'person-outline'}
                    size={24}
                    color={isProfile ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.tabText, isProfile && styles.tabTextActive]}>Perfil</Text>
            </Pressable>

            <Pressable style={styles.fabWrapper} onPress={() => router.push('/protected/employeeOrders')}>
                <View style={styles.fabButton}>
                    <Ionicons name="bag-handle" size={26} color={colors.white} />
                </View>
                <Text style={styles.fabText}>Pedidos</Text>
            </Pressable>

            <Pressable style={styles.tabItem} onPress={() => router.push('/protected/home')}>
                <Ionicons
                    name={isStore ? 'storefront' : 'storefront-outline'}
                    size={24}
                    color={isStore ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.tabText, isStore && styles.tabTextActive]}>Área de compras</Text>
            </Pressable>
        </View>
    );
}