import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/context/Theme';

type CartToastProps = {
    visible: boolean;
    productName?: string;
};

export function CartToast({
    visible,
    productName,
}: CartToastProps) {
    const { colors, font, fontSize, space, radius } = useTheme();

    if (!visible) {
        return null;
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: '#ddf1d8',
                    borderColor: colors.success,
                    borderRadius: radius.lg,
                    paddingVertical: space.md,
                    paddingHorizontal: space.md,
                },
            ]}
        >
            <View
                style={[
                    styles.iconContainer,
                    {
                        backgroundColor: colors.success,
                        marginRight: space.md,
                    },
                ]}
            >
                <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.white}
                />
            </View>

            <View style={styles.textContainer}>
                <Text
                    style={[
                        styles.title,
                        {
                            color: colors.success,
                            fontFamily: font.bold,
                            fontSize: fontSize.base,
                        },
                    ]}
                >
                    Produto adicionado!
                </Text>

                {productName && (
                    <Text
                        style={[
                            styles.productName,
                            {
                                color: colors.text,
                                fontFamily: font.regular,
                                fontSize: fontSize.sm,
                                marginTop: space.xs,
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {productName}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 110,
        left: 20,
        right: 20,
        zIndex: 999,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.18,
        shadowRadius: 5,
        elevation: 6,
    },

    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },

    textContainer: {
        flex: 1,
    },

    title: {},

    productName: {},
});