import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';

import { Fonts } from '@/constants/fonts';

type SmallButtonProps = {
    title: string;
    onPress: () => void;
};

export function SmallButton({
    title,
    onPress,
}: SmallButtonProps) {
    return (
        <Pressable
            style={styles.button}
            onPress={onPress}
        >
            <Text style={styles.text}>
                {title}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        minWidth: 100,
        height: 36,
        paddingHorizontal: 16,
        backgroundColor: '#DD2E8A',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    text: {
        fontFamily: Fonts.regular,
        fontSize: 15,
        color: '#FFFFFF',
    },
});