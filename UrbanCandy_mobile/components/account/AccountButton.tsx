import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';

import { useTheme } from '@/context/Theme';

type Props = {
    title: string;
    onPress: () => void;
    loading?: boolean;
};

export default function AccountButton({
    title,
    onPress,
    loading = false,
}: Props) {
    const {
        colors,
        font,
        fontSize,
        space,
        radius,
        sizes,
    } = useTheme();

    const styles = StyleSheet.create({
        button: {
            height: sizes.buttonHeight,
            backgroundColor: colors.primary,
            borderRadius: radius.pill,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: space.md,
        },

        text: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.white,
        },
    });

    return (
        <Pressable
            style={styles.button}
            onPress={onPress}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator
                    color={colors.white}
                />
            ) : (
                <Text style={styles.text}>
                    {title}
                </Text>
            )}
        </Pressable>
    );
}

