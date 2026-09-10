import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useTheme } from '@/context/Theme';

export type CustomerData = {
    name: string;
    cpf: string;
    phone: string;
};

type CustomerInfoProps = {
    data: CustomerData;
};

export default function CustomerInfo({
    data,
}: CustomerInfoProps) {
    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.white,
            borderRadius: radius.lg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 8,
        },

        row: {
            minHeight: 40,
            justifyContent: 'center',
            paddingHorizontal: space.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },

        lastRow: {
            borderBottomWidth: 0,
        },

        text: {
            fontFamily: font.regular,
            fontSize: fontSize.base,
            color: colors.text,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.text}>
                    Nome: {data.name}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.text}>
                    CPF: {data.cpf}
                </Text>
            </View>

            <View
                style={[
                    styles.row,
                    styles.lastRow,
                ]}
            >
                <Text style={styles.text}>
                    Telefone: {data.phone}
                </Text>
            </View>
        </View>
    );
}