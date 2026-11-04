import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { useRouter } from 'expo-router';

import { useTheme } from '@/context/Theme';

export default function CartHeader() {
    const router = useRouter();

    const {
        colors,
        font,
        fontSize,
        space,
    } = useTheme();

    const styles = StyleSheet.create({
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 16,
            paddingHorizontal: space.xl,
            paddingBottom: 16,
        },

        backButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },

        title: {
            fontSize: fontSize.xxl,
            color: colors.text,
            fontFamily: font.regular,
        },
    });

    return (
        <View style={styles.header}>
            <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
            >
                <Ionicons
                    name="arrow-back"
                    size={26}
                    color={colors.text}
                />
            </Pressable>

            <Text style={styles.title}>
                Meu Carrinho
            </Text>
        </View>
    );
}