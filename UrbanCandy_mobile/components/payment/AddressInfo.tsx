import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useTheme } from '@/context/Theme';

export type AddressData = {
    cep: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
};

type AddressInfoProps = {
    data: AddressData;
};

export default function AddressInfo({
    data,
}: AddressInfoProps) {
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
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 8,
        },

        row: {
            flexDirection: 'row',
            minHeight: 40,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },

        lastRow: {
            borderBottomWidth: 0,
        },

        fullCell: {
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: space.md,
        },

        cell: {
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: space.md,
            borderRightWidth: 1,
            borderRightColor: colors.border,
        },

        lastCell: {
            borderRightWidth: 0,
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
                <View style={styles.fullCell}>
                    <Text style={styles.text}>
                        CEP: {data.cep}
                    </Text>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.cell}>
                    <Text style={styles.text}>
                        Cidade: {data.city}
                    </Text>
                </View>

                <View
                    style={[
                        styles.cell,
                        styles.lastCell,
                    ]}
                >
                    <Text style={styles.text}>
                        Bairro: {data.neighborhood}
                    </Text>
                </View>
            </View>

            <View
                style={[
                    styles.row,
                    styles.lastRow,
                ]}
            >
                <View style={styles.cell}>
                    <Text style={styles.text}>
                        Rua: {data.street}
                    </Text>
                </View>

                <View
                    style={[
                        styles.cell,
                        styles.lastCell,
                    ]}
                >
                    <Text style={styles.text}>
                        Nº: {data.number}
                    </Text>
                </View>
            </View>
        </View>
    );
}