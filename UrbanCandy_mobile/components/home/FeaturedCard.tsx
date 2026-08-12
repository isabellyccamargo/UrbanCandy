import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Fonts } from '@/constants/fonts';
import { API_BASE_URL } from '@/services/api';
import { SmallButton } from '@/components/ui/smallButton';

type FeaturedCardProps = {
    name: string;
    price: number;
    image?: string;
    onPress?: () => void;
    onAdd?: () => void;
};

export function FeaturedCard({
    name,
    price,
    image,
    onPress,
    onAdd,
}: FeaturedCardProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}
        >
            {image ? (
                <Image
                    source={{
                        uri: `${API_BASE_URL}/uploads/${image}`,
                    }}
                    style={styles.image}
                    resizeMode="cover"
                />
            ) : (
                <View style={styles.imagePlaceholder} />
            )}

            <View style={styles.info}>

                <Text
                    style={styles.name}
                    numberOfLines={1}
                >
                    {name}
                </Text>

                <View style={styles.footer}>

                    <Text style={styles.price}>
                        R$ {Number(price)
                            .toFixed(2)
                            .replace('.', ',')}
                    </Text>

                    <SmallButton
                        title="Adicionar"
                        onPress={() => onAdd?.()}
                    />

                </View>

            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 193,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },

    image: {
        width: '100%',
        height: 180,
    },

    imagePlaceholder: {
        width: '100%',
        height: 140,
        backgroundColor: '#EDEDED',
    },

    info: {
        padding: 10,
    },

    name: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#222222',
        marginBottom: 10,
    },

    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    price: {
        fontFamily: Fonts.semibold,
        fontSize: 15,
        color: '#222222',
    },

    pressed: {
        opacity: 0.75,
        transform: [{ scale: 0.98 }],
    },
});