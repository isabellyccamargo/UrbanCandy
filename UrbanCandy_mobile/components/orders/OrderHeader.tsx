
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { useRouter } from 'expo-router';

import { useTheme } from '@/context/Theme';

export default function OrderHeader() {
    const router = useRouter();

    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    const styles = StyleSheet.create({
        header: {
            height: 125,
            backgroundColor: colors.secondary,
            borderBottomLeftRadius: radius.xxl,
            borderBottomRightRadius: radius.xxl,
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 40,
            paddingHorizontal: space.xl,
        },

        backButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: space.sm,
        },

        title: {
            fontSize: fontSize.xxl,
            color: colors.white,
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
                    color={colors.white}
                />
            </Pressable>

            <Text style={styles.title}>
                Meus Pedidos
            </Text>
        </View>
    );
}
