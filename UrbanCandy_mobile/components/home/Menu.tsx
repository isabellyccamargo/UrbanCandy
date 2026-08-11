import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export function Menu() {
    const router = useRouter();

    return (
        <View style={styles.container}>

            {/* Início */}
            <Pressable
                style={styles.item}
                onPress={() => router.replace('/home')}
            >
                <Ionicons
                    name="home-outline"
                    size={25}
                    color="#222222"
                />

                <Text style={styles.label}>
                    Início
                </Text>
            </Pressable>

            {/* Pedidos */}
            <Pressable
                style={styles.item}
                onPress={() => {
                    console.log('Pedidos');
                }}
            >
                <Ionicons
                    name="bag-handle-outline"
                    size={25}
                    color="#222222"
                />

                <Text style={styles.label}>
                    Pedidos
                </Text>
            </Pressable>

            {/* Cardápio */}
            <Pressable
                style={styles.item}
                onPress={() => router.replace('/cardapio')}
            >
                <View style={styles.menuButton}>
                    <Ionicons
                        name="restaurant-outline"
                        size={27}
                        color="#FFFFFF"
                    />
                </View>

                <Text style={styles.label}>
                    Cardápio
                </Text>
            </Pressable>

            {/* Perfil */}
            <Pressable
                style={styles.item}
                onPress={() => {
                    console.log('Perfil');
                }}
            >
                <Ionicons
                    name="person"
                    size={25}
                    color="#222222"
                />

                <Text style={styles.label}>
                    Perfil
                </Text>
            </Pressable>

            {/* Sair */}
            <Pressable
                style={styles.item}
                onPress={() => {
                    console.log('Sair');
                }}
            >
                <Ionicons
                    name="log-out-outline"
                    size={28}
                    color="#222222"
                />

                <Text style={styles.label}>
                    Sair
                </Text>
            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        elevation: 10,
        zIndex: 100,
    },

    item: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    label: {
        marginTop: 3,
        fontFamily: 'serif',
        fontSize: 14,
        color: '#333333',
    },

    menuButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#DD2E8A',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -20,
    },
});