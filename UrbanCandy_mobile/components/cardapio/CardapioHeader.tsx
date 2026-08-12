import React from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CardapioHeader() {

    const router = useRouter();

    function handleBack() {
        router.replace('/home');
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
                    color="#FFFFFF"
                />
            </Pressable>

            <Text style={styles.title}>
                Cardápio
            </Text>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        height: 120,
        backgroundColor: '#E7C9DA',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    backButton: {
        marginRight: 18,
        marginTop: 50,
    },

    title: {
        fontSize: 24,
        color: '#FFFFFF',
        fontFamily: 'serif',
        marginTop: 50,
    },

});