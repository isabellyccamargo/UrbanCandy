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

type ProductCardProps = {
    id_product: number;
    name: string;
    price: number;
    image?: string;
    onPress?: () => void;
    onAdd?: () => void;
};

export function ProductCard({
    id_product,
    name,
    price,
    image,
    onPress,
    onAdd,
}: ProductCardProps) {
    return (
        <View style={styles.card}>
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

            <Text style={styles.name} numberOfLines={1}>
                {name}
            </Text>

            <Pressable
                onPress={onPress}
                style={styles.detailsButton}
            >
                <Text style={styles.details}>
                    Ver detalhes
                </Text>
            </Pressable>

            <View style={styles.footer}>
                <Text style={styles.price}>
                    R$ {Number(price).toFixed(2).replace('.', ',')}
                </Text>

                 <SmallButton
                        title="Adicionar"
                        onPress={() => onAdd?.()}
                    />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '49%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 5,
        marginBottom: 14,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },

    image: {
        width: '100%',
        height: 122,
        borderRadius: 9,
    },

    imagePlaceholder: {
        width: '100%',
        height: 122,
        borderRadius: 9,
        backgroundColor: '#EDEDED',
    },

    name: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#222222',
        marginTop: 6,
        marginLeft: 3,
    },

    detailsButton: {
        alignSelf: 'flex-start',
        marginTop: 4,
        marginLeft: 3,
        paddingVertical: 2,
    },

    details: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        color: '#DD2E8A',
    },

    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 7,
        marginHorizontal: 3,
    },

    price: {
        fontFamily: Fonts.bold,
        fontSize: 14,
        color: '#222222',
    },
});