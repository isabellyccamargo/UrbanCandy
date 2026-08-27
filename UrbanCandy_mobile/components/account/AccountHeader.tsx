import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { useTheme } from '@/context/Theme';

type Props = {
    title: string;
    isCreating?: boolean;
};

export default function AccountHeader({
    title,
    isCreating = false,
}: Props) {
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
            height: isCreating ? 250 : 125,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: isCreating ? 'flex-start' : 'center',
        },

        pinkTop: {
            position: 'absolute',
            left: 0,
            right: 0,
            height: 110,
            backgroundColor: colors.secondary,
            borderBottomLeftRadius: radius.xxl,
            borderBottomRightRadius: radius.xxl,
        },

        logo: {
            width: 75,
            height: 75,
            marginTop: 85,
        },

        backButton: {
            position: 'absolute',
            left: space.xl,
            top: 50,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },

        title: {
            marginTop: 3,
            fontSize: fontSize.xxl,
            color: colors.text,
            fontFamily: font.regular,
        },

        subtitle: {
            marginTop: 2,
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            fontFamily: font.regular,
            textAlign: 'center',
        },

        normalHeader: {
            width: '100%',
            height: 125,
            backgroundColor: colors.secondary,
            borderBottomLeftRadius: radius.xxl,
            borderBottomRightRadius: radius.xxl,
            justifyContent: 'center',
            paddingLeft: space.xl,
        },

        normalTitle: {
            marginLeft: 50,
            fontSize: fontSize.xxl,
            color: colors.white,
            fontFamily: font.regular,
        },
    });

    if (isCreating) {
        return (
            <View style={styles.header}>
                <View style={styles.pinkTop} />

                <Image
                    source={require('@/assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.title}>
                    {title}
                </Text>

                <Text style={styles.subtitle}>
                    Faça seu cadastro para começar a pedir
                    {'\n'}
                    essas delícias!
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.normalHeader}>
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

            <Text style={styles.normalTitle}>
                {title}
            </Text>
        </View>
    );
}