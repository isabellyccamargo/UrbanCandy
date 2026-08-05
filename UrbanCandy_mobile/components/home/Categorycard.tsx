import {
    Image,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';

import { Fonts } from '@/constants/fonts';

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

const styles = StyleSheet.create({
    container: {
        width: 92,
        alignItems: 'center',
    },

    image: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },

    name: {
        fontFamily: Fonts.semibold,
        fontSize: 15,
        color: '#DD2E8A',
        textAlign: 'center',
    },

    options: {
        fontSize: 12,
        color: '#DD2E8A',
        marginTop: 1,
    },

    pressed: {
        opacity: 0.65,
        transform: [{ scale: 0.96 }],
    },
});