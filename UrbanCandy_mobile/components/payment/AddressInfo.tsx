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
    isComplete: boolean;
    isPickup: boolean;
};

export default function AddressInfo({
    data,
    isComplete,
    isPickup,
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

        text: {
            fontFamily: font.regular,
            fontSize: fontSize.base,
            color: colors.text,
            padding: space.md,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                {isPickup
                    ? 'Seu pedido estará disponível para retirada no local.'
                    : isComplete
                      ? `${data.street}, ${data.number}${data.neighborhood ? ` - ${data.neighborhood}` : ''} - ${data.city} - CEP ${data.cep}`
                      : 'Endereço incompleto. Atualize seus dados para receber o pedido.'}
            </Text>
        </View>
    );
}