import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '@/constants/fonts';

type CartToastProps = {
    visible: boolean;
    productName?: string;
};

export function CartToast({
    visible,
    productName,
}: CartToastProps) {
    if (!visible) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons
                    name="checkmark"
                    size={18}
                    color="#FFFFFF"
                />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.title}>
                    Produto adicionado!
                </Text>

                {productName && (
                    <Text
                        style={styles.productName}
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

        backgroundColor: '#ddf1d8',
        borderRadius: 14,

        paddingVertical: 12,
        paddingHorizontal: 14,

        flexDirection: 'row',
        alignItems: 'center',

        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.18,
        shadowRadius: 5,
        elevation: 6,

        borderWidth: 1,
        borderColor: '#3caf62',
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,

        backgroundColor: '#3caf62',

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 10,
    },

    textContainer: {
        flex: 1,
    },

    title: {
        fontFamily: Fonts.bold,
        fontSize: 14,
        color: '#3caf62',
    },

    productName: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        color: '#000000',
        marginTop: 2,
    },
});