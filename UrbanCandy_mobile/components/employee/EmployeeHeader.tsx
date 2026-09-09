import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/Theme';

type Props = {
    employeeName?: string;
};

export default function EmployeeHeader({ employeeName }: Props) {
    const { colors, font, fontSize, space, radius } = useTheme();

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.secondary,
            paddingTop: 60,
            paddingBottom: space.lg,
            paddingHorizontal: space.lg,
            borderBottomLeftRadius: radius.xxl,
            borderBottomRightRadius: radius.xxl,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.md,
        },
        logoCircle: {
            width: 38,
            height: 38,
            borderRadius: radius.circle,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: space.sm,
        },
        title: {
            fontFamily: font.semibold,
            fontSize: fontSize.xl,
            color: colors.white,
            marginBottom: space.sm,
        },
    });

    const displayName = employeeName || 'Gerente';

    return (
        <View style={styles.container}>
            <View style={styles.logoCircle}>
                <Ionicons name="storefront-outline" size={20} color={colors.white} />
            </View>
            <Text style={styles.title}>Olá, {displayName}</Text>
        </View>
    );
}