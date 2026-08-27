import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { SmallButton } from '@/components/ui/smallButton';
import { useTheme } from '@/context/Theme';
import { API_BASE_URL } from '@/services/api';

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
    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    const styles = StyleSheet.create({
        container: {
            width: 193,
            backgroundColor: colors.white,
            borderRadius: radius.md,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 8,
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
            padding: space.md,
        },
        name: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.text,
            marginBottom: space.md,
        },
        footer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        price: {
            fontFamily: font.semibold,
            fontSize: fontSize.base,
            color: colors.text,
        },
        pressed: {
            opacity: 0.75,
            transform: [{ scale: 0.98 }],
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