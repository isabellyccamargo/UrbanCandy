import React from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '@/context/Theme';

export default function CardapioHeader() {
    const router = useRouter();

    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    const styles = StyleSheet.create({
        container: {
            height: 120,
            backgroundColor: colors.secondary,
            borderBottomLeftRadius: radius.xxl,
            borderBottomRightRadius: radius.xxl,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: space.xl,
        },

        backButton: {
            marginRight: 18,
            marginTop: 50,
        },

        title: {
            fontSize: fontSize.xxl,
            color: colors.white,
            fontFamily: font.regular,
            marginTop: 50,
        },
    });

    function handleBack() {
        router.replace('/protected/home');
    }

    return (
        <View style={styles.container}>
            <Pressable
                onPress={handleBack}
                style={styles.backButton}
            >
                <Ionicons
                    name="arrow-back"
                    size={26}
                    color={colors.white}
                />
            </Pressable>

            <Text style={styles.title}>
                Cardápio
            </Text>
        </View>
    );
}