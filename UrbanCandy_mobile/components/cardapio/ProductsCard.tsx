import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { API_BASE_URL } from '@/services/api';
import { SmallButton } from '@/components/ui/smallButton';
import { useTheme } from '@/context/Theme';

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
    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    const styles = StyleSheet.create({
        card: {
            width: '49%',
            backgroundColor: colors.white,
            borderRadius: radius.md,
            padding: 5,
            marginBottom: space.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 8,
        },

        image: {
            width: '100%',
            height: 122,
            borderRadius: radius.sm,
        },

        imagePlaceholder: {
            width: '100%',
            height: 122,
            borderRadius: radius.sm,
            backgroundColor: colors.border,
        },

        name: {
            fontFamily: font.regular,
            fontSize: fontSize.base,
            color: colors.text,
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
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.primary,
        },

        footer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 7,
            marginHorizontal: 3,
        },

        price: {
            fontFamily: font.bold,
            fontSize: fontSize.base,
            color: colors.text,
        },
    });

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

            <Text
                style={styles.name}
                numberOfLines={1}
            >
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