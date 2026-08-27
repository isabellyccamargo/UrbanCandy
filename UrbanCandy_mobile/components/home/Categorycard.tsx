import {
    Image,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';

import { useTheme } from '@/context/Theme';

type CategoryCardProps = {
    name: string;
    image?: any;
    onPress?: () => void;
};

export function CategoryCard({
    name,
    image,
    onPress,
}: CategoryCardProps) {
    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    const styles = StyleSheet.create({
        container: {
            width: 125,
            marginTop: space.xl,
            alignItems: 'center',
        },
        image: {
            width: 72,
            height: 72,
            borderRadius: radius.circle,
            backgroundColor: colors.white,
            marginBottom: space.sm,
        },
        name: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.primary,
            textAlign: 'center',
        },
        options: {
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.primary,
            marginTop: 1,
        },
        pressed: {
            opacity: 0.65,
            transform: [{ scale: 0.96 }],
        },
    });

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}
        >
            <Image
                source={image}
                style={styles.image}
                resizeMode="cover"
            />

            <Text
                style={styles.name}
                numberOfLines={1}
            >
                {name}
            </Text>

            <Text style={styles.options}>
                Ver opções
            </Text>
        </Pressable>
    );
}