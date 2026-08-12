import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { useRouter } from 'expo-router';

import { Fonts } from '@/constants/fonts';

export default function CartHeader() {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
            >
                <Ionicons
                    name="arrow-back"
                    size={26}
                    color="#FFFFFF"
                />
            </Pressable>

            <Text style={styles.title}>
                Meu Carrinho
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
    },

    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        fontSize: 24,
        color: '#FFFFFF',
        fontFamily: 'serif',
    },
});