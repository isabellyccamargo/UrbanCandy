import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function HomeHeader() {
    return (
        <View style={styles.container}>

            <View style={styles.searchContainer}>
                <Ionicons
                    name="search-outline"
                    size={24}
                    color="#000000"
                />

                <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor="#777777"
                    returnKeyType="search"
                />
            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.cartButton,
                    pressed && styles.pressed,
                ]}
                onPress={() => {
                    console.log('Carrinho');
                }}
            >
                <Ionicons
                    name="cart-outline"
                    size={25}
                    color="#000000"
                />
            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    searchContainer: {
        flex: 1,
        height: 40,
        marginTop:40,

        backgroundColor: '#FFFFFF',

        borderRadius: 22,

        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 12,
    },

    input: {
        flex: 1,
        height: '100%',
        

        marginLeft: 6,

        fontSize: 16,
        color: '#3B1E36',
    },

    cartButton: {
        width: 40,
        height: 40,
        marginTop:40,

        borderRadius: 20,

        backgroundColor: '#FFFFFF',

        justifyContent: 'center',
        alignItems: 'center',
        
    },

    pressed: {
        opacity: 0.6,
        transform: [{ scale: 0.95 }],
    },
});