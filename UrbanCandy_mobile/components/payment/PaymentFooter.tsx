import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useTheme } from '@/context/Theme';

type PaymentFooterProps = {
    total: number;
    disabled?: boolean;
    onPress: () => void;
};

export default function PaymentFooter({
    total,
    disabled = false,
    onPress,
}: PaymentFooterProps) {
    const {
        colors,
        font,
        fontSize,
        space,
        radius,
        sizes,
    } = useTheme();

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.white,
            paddingHorizontal: space.lg,
            paddingVertical: space.md,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,

            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 8,
        },

        content: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },

        label: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.text,
        },

        total: {
            fontFamily: font.bold,
            fontSize: fontSize.xl,
            color: colors.primary,
            marginTop: space.xs,
            marginBottom: 20,
        },

        button: {
            height: sizes.buttonHeight,
            paddingHorizontal: space.xl,
            backgroundColor: colors.primary,
            borderRadius: radius.pill,
            marginBottom: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },

        buttonText: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.white,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View>
                    <Text style={styles.label}>
                        Total a pagar
                    </Text>

                    <Text style={styles.total}>
                        R$ {total.toFixed(2).replace('.', ',')}
                    </Text>
                </View>

                <Pressable
                    style={[
                        styles.button,
                    ]}
                    onPress={onPress}
                    disabled={disabled}
                >
                    <Text style={styles.buttonText}>
                        Finalizar pagamento
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}