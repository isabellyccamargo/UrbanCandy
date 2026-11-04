import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/context/Theme';

type CartSummaryProps = {
    subtotal: number;
    bottomInset?: number;
};

export default function CartSummary({
    subtotal,
    bottomInset = 0,
}: CartSummaryProps) {
    const { colors, font, fontSize, space, radius, sizes } = useTheme();
    const router = useRouter();

    function handleCheckout() {
        router.replace('/protected/payment');
    }

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.white,
            padding: space.xl,
            paddingBottom: space.xl + bottomInset,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 8,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: space.lg,
        },
        label: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.textSecondary,
        },
        value: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.text,
        },
        line: {
            height: 1,
            backgroundColor: colors.border,
            marginVertical: space.lg,
        },
        totalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        totalLabel: {
            fontFamily: font.semibold,
            fontSize: fontSize.lg,
            color: colors.text,
        },
        total: {
            fontFamily: font.bold,
            fontSize: fontSize.xl,
            color: colors.primary,
        },
        button: {
            height: sizes.buttonHeight,
            backgroundColor: colors.primary,
            borderRadius: radius.pill,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: space.lg,
        },
        buttonText: {
            fontFamily: font.semibold,
            fontSize: fontSize.lg,
            color: colors.white,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.value}>
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                </Text>
            </View>

            <View style={styles.line} />

            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total do Pedido</Text>
                <Text style={styles.total}>
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                </Text>
            </View>

            <Pressable style={styles.button} onPress={handleCheckout}>
                <Text style={styles.buttonText}>Ir para o checkout</Text>
            </Pressable>
        </View>
    );
}