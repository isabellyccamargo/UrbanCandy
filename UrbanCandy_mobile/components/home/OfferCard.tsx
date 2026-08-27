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
    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    const styles = StyleSheet.create({
        container: {
            width: 340,
            height: 180,
            backgroundColor: colors.white,
            borderRadius: radius.md,
            overflow: 'hidden',
            marginRight: space.md,
            shadowColor: colors.text,
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
            paddingLeft: space.md,
            paddingTop: space.sm,
            paddingBottom: space.sm,
            paddingRight: space.xs,
            justifyContent: 'space-between',
        },
        name: {
            fontFamily: font.semibold,
            fontSize: fontSize.base,
            color: colors.primary,
        },
        description: {
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            lineHeight: 14,
            color: colors.textSecondary,
        },
        price: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.primary,
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
                    <Text
                        style={styles.name}
                        numberOfLines={1}
                    >
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