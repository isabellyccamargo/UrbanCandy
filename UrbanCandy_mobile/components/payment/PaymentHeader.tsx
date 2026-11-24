import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/context/Theme';

type PaymentHeaderProps = {
    onBack: () => void;
};

export default function PaymentHeader({
    onBack,
}: PaymentHeaderProps) {
    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.secondary,
            paddingHorizontal: space.lg,
            paddingVertical: space.md,
            borderBottomLeftRadius: radius.xxl,
            borderBottomRightRadius: radius.xxl,
            
        },

        content: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 48,
        },

        backButton: {
            width: 36,
            height: 36,
            marginTop: 30,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: space.sm,
        },

        title: {
            marginTop: 50,
            marginBottom: 20,
            fontSize: fontSize.xxl,
            color: colors.white,
            fontFamily: font.regular,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Pressable
                    style={styles.backButton}
                    onPress={onBack}
                >
                    <Ionicons
                        name="arrow-back"
                        size={28}
                        color={colors.white}
                    />
                </Pressable>

                <Text style={styles.title}>
                    Pagamento
                </Text>
            </View>
        </View>
    );
}