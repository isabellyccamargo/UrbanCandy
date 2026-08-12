import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Fonts } from '@/constants/fonts';
import { API_BASE_URL } from '@/services/api';

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

            {/* IMAGEM */}
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

            {/* NOME */}
            <Text
                style={styles.name}
                numberOfLines={1}
            >
                {name}
            </Text>

            {/* VER DETALHES */}
            <Pressable
                onPress={() => {
                    console.log(
                        'CLICOU EM VER DETALHES:',
                        id_product
                    );

                    onPress?.();
                }}
                style={styles.detailsButton}
            >
                <Text style={styles.details}>
                    Ver detalhes
                </Text>
            </Pressable>

            {/* PREÇO + ADICIONAR */}
            <View style={styles.footer}>

                <Text style={styles.price}>
                    R${' '}
                    {Number(price)
                        .toFixed(2)
                        .replace('.', ',')}
                </Text>

                <Pressable
                    style={styles.button}
                    onPress={() => {
                        console.log(
                            '🛒 ADICIONAR FUNCIONOU:',
                            name
                        );

                        onAdd?.();
                    }}
                >
                    <Text style={styles.buttonText}>
                        Adicionar
                    </Text>
                </Pressable>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 5,
        marginBottom: 14,

        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.20,
        shadowRadius: 3,
        elevation: 4,

        zIndex: 10,
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
        paddingHorizontal: 2,
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

    button: {
        height: 30,
        width:90,
        paddingHorizontal: 14,
        backgroundColor: '#DD2E8A',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },

    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },

    buttonText: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        color: '#FFFFFF',
    },
});