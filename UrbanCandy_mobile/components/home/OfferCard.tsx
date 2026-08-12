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

type OfferCardProps = {
    name: string;
    description?: string;
    price: number;
    image?: string;
    onPress?: () => void;
    onAdd?: () => void;
};

export function OfferCard({
    name,
    description,
    price,
    image,
    onPress,
    onAdd,
}: OfferCardProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}
        >
            <View style={styles.content}>

                <View style={styles.info}>

                    <Text style={styles.name} numberOfLines={1}>
                        {name}
                    </Text>

                    {description && (
                        <Text
                            style={styles.description}
                            numberOfLines={3}
                        >
                            {description}
                        </Text>
                    )}

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

            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 340,
        height: 180,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        overflow: 'hidden',
        marginRight: 12,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 3,
    },

    content: {
        flex: 1,
        flexDirection: 'row',
    },

    info: {
        flex: 1,
        paddingLeft: 12,
        paddingTop: 8,
        paddingBottom: 8,
        paddingRight: 4,
        justifyContent: 'space-between',
    },

    name: {
        fontFamily: Fonts.semibold,
        fontSize: 14,
        color: '#DD2E8A',
    },

    description: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        lineHeight: 14,
        color: '#555555',
    },

    price: {
        fontFamily: Fonts.semibold,
        fontSize: 16,
        color: '#DD2E8A',
        marginTop: 2,
    },

    image: {
        width: 170,
        height: '100%',
        borderTopLeftRadius: 40,
        borderBottomLeftRadius: 40,
    },

    imagePlaceholder: {
        width: 110,
        height: '100%',
        backgroundColor: '#EDEDED',
    },

    pressed: {
        opacity: 0.75,
        transform: [{ scale: 0.98 }],
    },
});